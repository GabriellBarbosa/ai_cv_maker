import json
import logging
import time
from contextvars import ContextVar, Token
from typing import Any, Dict, Optional

RequestContext = Dict[str, Any]

_request_context: ContextVar[RequestContext] = ContextVar("request_context")


def set_request_context(
    request_id: str,
    method: str,
    path: str,
    client: Optional[str] = None,
) -> Token:
    """
    Initialize request-scoped context for structured logging.
    """
    context: RequestContext = {
        "request_id": request_id,
        "method": method,
        "path": path,
        "client": client,
    }
    return _request_context.set(context)


def reset_request_context(token: Token) -> None:
    """
    Reset context to avoid data leakage across requests.
    """
    if token:
        _request_context.reset(token)


def get_request_context() -> RequestContext:
    """
    Retrieve current request context or an empty dict.
    """
    try:
        return _request_context.get()
    except LookupError:
        return {}


def update_request_context(**kwargs: Any) -> None:
    """
    Merge additional metadata into the active request context.
    """
    try:
        context = _request_context.get()
    except LookupError:
        return

    context.update({key: value for key, value in kwargs.items() if value is not None})


def _serialize_value(value: Any) -> Any:
    if isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {
            key: _serialize_value(val)
            for key, val in value.items()
            if val is not None
        }
    if isinstance(value, list):
        return [_serialize_value(item) for item in value if item is not None]
    if value is None:
        return None
    return str(value)


def _clean_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {
        key: _serialize_value(value)
        for key, value in payload.items()
        if value is not None
    }


def log_event(
    event: str,
    *,
    logger: Optional[logging.Logger] = None,
    level: int = logging.INFO,
    include_context: bool = True,
    **data: Any,
) -> None:
    """
    Emit a structured log entry enriched with request context.
    """
    active_logger = logger or logging.getLogger("app.observability")
    context = get_request_context() if include_context else {}
    base_context = {
        key: context.get(key)
        for key in ("request_id", "method", "path", "client")
        if context.get(key) is not None
    }

    payload: Dict[str, Any] = {"event": event, "timestamp": time.time(), **base_context, **data}
    clean_payload = _clean_payload(payload)
    active_logger.log(level, json.dumps(clean_payload, ensure_ascii=True))


def _extract_usage(usage: Any) -> Dict[str, int]:
    if usage is None:
        return {}

    usage_dict: Dict[str, int] = {}
    candidates = [
        "prompt_tokens",
        "completion_tokens",
        "total_tokens",
        "input_tokens",
        "output_tokens",
    ]

    if isinstance(usage, dict):
        source = usage
    else:
        source = {name: getattr(usage, name) for name in candidates if hasattr(usage, name)}

    for field in candidates:
        value = source.get(field)
        if value is None:
            continue
        try:
            usage_dict[field] = int(value)
        except (TypeError, ValueError):
            continue

    if "total_tokens" not in usage_dict:
        prompt = usage_dict.get("prompt_tokens")
        completion = usage_dict.get("completion_tokens")
        if prompt is not None and completion is not None:
            usage_dict["total_tokens"] = prompt + completion

    if "total_tokens" not in usage_dict:
        input_tokens = usage_dict.get("input_tokens")
        output_tokens = usage_dict.get("output_tokens")
        if input_tokens is not None and output_tokens is not None:
            usage_dict["total_tokens"] = input_tokens + output_tokens

    return usage_dict


def record_llm_usage(
    step: str,
    usage: Any,
    *,
    status: str = "success",
    duration_ms: Optional[float] = None,
    model: Optional[str] = None,
    logger: Optional[logging.Logger] = None,
) -> None:
    """
    Persist token usage into context and emit a structured log event.
    """
    usage_data = _extract_usage(usage)

    if duration_ms is not None:
        usage_data["duration_ms"] = round(duration_ms, 2)

    if model:
        usage_data["model"] = model

    usage_data["status"] = status

    log_event(
        "llm_call_completed",
        logger=logger,
        step=step,
        **usage_data,
    )

    try:
        context = _request_context.get()
    except LookupError:
        return

    llm_usage = context.setdefault("llm_usage", {})
    llm_usage[step] = usage_data


def get_llm_usage() -> Dict[str, Any]:
    """
    Return token usage captured during the request lifecycle.
    """
    context = get_request_context()
    usage = context.get("llm_usage")
    if isinstance(usage, dict):
        return usage
    return {}


def aggregate_token_usage(llm_usage: Dict[str, Any]) -> Dict[str, int]:
    """
    Aggregate token usage across LLM steps for summary reporting.
    """
    totals: Dict[str, int] = {}
    fields = [
        "prompt_tokens",
        "completion_tokens",
        "total_tokens",
        "input_tokens",
        "output_tokens",
    ]

    for usage in llm_usage.values():
        if not isinstance(usage, dict):
            continue
        for field in fields:
            value = usage.get(field)
            if value is None:
                continue
            try:
                totals[field] = totals.get(field, 0) + int(value)
            except (TypeError, ValueError):
                continue

    return totals
