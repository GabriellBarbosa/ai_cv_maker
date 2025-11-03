from __future__ import annotations

from contextvars import ContextVar
from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class RequestContext:
    """Container for per-request contextual data shared across the app."""

    request_id: Optional[str] = None
    token_usage: Dict[str, int] | None = None

    def add_token_usage(self, usage: Dict[str, int]) -> None:
        """Accumulate token usage metrics."""
        if self.token_usage is None:
            self.token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

        for key in ("prompt_tokens", "completion_tokens", "total_tokens"):
            value = usage.get(key)
            if value is not None:
                self.token_usage[key] += int(value)


_context_var: ContextVar[RequestContext] = ContextVar("request_context", default=RequestContext())


def get_request_context() -> RequestContext:
    return _context_var.get()


def set_request_context(context: RequestContext) -> None:
    _context_var.set(context)
