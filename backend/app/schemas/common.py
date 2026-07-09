"""
Common schemas shared across the application.

Provides:
- PaginatedResponse: Generic paginated list response.
- MessageResponse: Simple message response for actions.

These are used as response models across multiple routers
to ensure consistent API response formats.
"""

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response wrapper.

    Used for all list endpoints that support pagination.
    The frontend uses total_pages and page to render pagination controls.

    Example response:
        {
            "items": [...],
            "total": 42,
            "page": 1,
            "page_size": 20,
            "total_pages": 3
        }
    """

    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseModel):
    """
    Simple message response for actions that don't return data.

    Used for operations like logout, delete, etc.

    Example response:
        {"message": "Successfully logged out"}
    """

    message: str
