"""
Custom exception classes and FastAPI exception handlers.

Provides a hierarchy of application-specific exceptions that map
to HTTP status codes. A global exception handler converts these
into standardized JSON error responses.

Exception Hierarchy:
    AppException (base)
    ├── UnauthorizedException (401)
    ├── ForbiddenException (403)
    ├── NotFoundException (404)
    ├── DuplicateException (409)
    └── BadRequestException (400)
"""

from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    """
    Base application exception.

    All custom exceptions inherit from this class.
    The global exception handler catches this type and returns
    a JSON response with the appropriate status code.
    """

    def __init__(self, status_code: int, detail: str) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class UnauthorizedException(AppException):
    """Raised when authentication fails (invalid/missing credentials)."""

    def __init__(self, detail: str = "Not authenticated") -> None:
        super().__init__(status_code=401, detail=detail)


class ForbiddenException(AppException):
    """Raised when an authenticated user lacks required permissions."""

    def __init__(self, detail: str = "Insufficient permissions") -> None:
        super().__init__(status_code=403, detail=detail)


class NotFoundException(AppException):
    """Raised when a requested resource does not exist."""

    def __init__(self, entity: str, identifier: str) -> None:
        super().__init__(
            status_code=404,
            detail=f"{entity} with id '{identifier}' not found",
        )


class DuplicateException(AppException):
    """Raised when a unique constraint would be violated."""

    def __init__(self, entity: str, field: str, value: str) -> None:
        super().__init__(
            status_code=409,
            detail=f"{entity} with {field} '{value}' already exists",
        )


class BadRequestException(AppException):
    """Raised when the request data is invalid or violates business rules."""

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=400, detail=detail)


# Global Exception Handler
async def app_exception_handler(
    request: Request,  # noqa: ARG001
    exc: AppException,
) -> JSONResponse:
    """
    Convert AppException instances into standardized JSON responses.

    Registered on the FastAPI app via:
        app.add_exception_handler(AppException, app_exception_handler)

    Response format:
        {"detail": "Human-readable error message"}
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
