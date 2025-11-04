import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.metrics import metrics_recorder
from app.core.observability import (
    aggregate_token_usage,
    get_llm_usage,
    log_event,
    update_request_context,
)

logger = logging.getLogger(__name__)

class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()

        log_event(
            "http_request_started",
            logger=logger,
            method=request.method,
            path=str(request.url.path),
        )

        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            llm_usage = get_llm_usage()
            step_durations = {
                step: usage.get("duration_ms")
                for step, usage in llm_usage.items()
                if isinstance(usage.get("duration_ms"), (int, float))
            }
            metrics_snapshot = metrics_recorder.record_request("error", step_durations)

            log_event(
                "http_request_failed",
                logger=logger,
                level=logging.ERROR,
                error=str(exc),
                duration_ms=duration_ms,
                step_durations=step_durations or None,
                metrics_snapshot=metrics_snapshot,
            )
            update_request_context(
                status_code=500,
                outcome="error",
                duration_ms=duration_ms,
                step_durations=step_durations or None,
            )
            raise

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        llm_usage = get_llm_usage()
        step_durations = {
            step: usage.get("duration_ms")
            for step, usage in llm_usage.items()
            if isinstance(usage.get("duration_ms"), (int, float))
        }

        token_totals = aggregate_token_usage(llm_usage)
        outcome = "success" if response.status_code < 400 else "error"

        update_request_context(
            status_code=response.status_code,
            outcome=outcome,
            duration_ms=duration_ms,
            step_durations=step_durations or None,
            token_usage=token_totals or None,
        )

        log_event(
            "http_request_completed",
            logger=logger,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )

        metrics_snapshot = metrics_recorder.record_request(outcome, step_durations)

        log_event(
            "request_metrics",
            logger=logger,
            outcome=outcome,
            duration_ms=duration_ms,
            tokens=token_totals or None,
            step_durations=step_durations or None,
            metrics_snapshot=metrics_snapshot,
        )

        return response
