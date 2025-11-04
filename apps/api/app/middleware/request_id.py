import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.observability import (
    reset_request_context,
    set_request_context,
)


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        context_token = set_request_context(
            request_id=request_id,
            method=request.method,
            path=str(request.url.path),
            client=request.client.host if request.client else None,
        )

        try:
            response = await call_next(request)
        finally:
            reset_request_context(context_token)

        response.headers["X-Request-ID"] = request_id
        
        return response
