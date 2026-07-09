"""
Request/Response logging middleware.

Logs each incoming HTTP request with:
- HTTP method and path
- Response status code
- Processing time in milliseconds

Useful for debugging and monitoring API performance.
"""

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("app.middleware.request_logging")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs HTTP request/response details.

    Captures request timing and logs at INFO level for successful
    requests and WARNING level for error responses (4xx/5xx).
    """

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        """Process request, measure timing, log result."""
        start_time = time.perf_counter()

        # Process the request through the handler chain
        response: Response = await call_next(request)

        # Calculate processing time
        process_time_ms = (time.perf_counter() - start_time) * 1000

        # Build log message
        log_message = (
            f"{request.method} {request.url.path} "
            f"→ {response.status_code} "
            f"({process_time_ms:.1f}ms)"
        )

        # Log at appropriate level based on status code
        if response.status_code >= 500:
            logger.error(log_message)
        elif response.status_code >= 400:
            logger.warning(log_message)
        else:
            logger.info(log_message)

        # Add processing time header for client debugging
        response.headers["X-Process-Time-Ms"] = f"{process_time_ms:.1f}"

        return response
