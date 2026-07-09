"""
User schemas (DTOs).

Request and response models for user-related endpoints.
Separates the internal User model from the API contract — never
expose hashed_password or internal fields to API consumers.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import UserRole


class UserRead(BaseModel):
    """
    User response schema — returned by all user-related endpoints.

    Excludes sensitive fields (hashed_password) from the response.
    Used by: /auth/me, /auth/register, /auth/login, /users/.
    """

    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """
    User profile update request.

    Only allows updating the display name.
    Email and password changes would need separate endpoints
    with re-authentication (not in current scope).
    """

    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )


class UserRoleUpdate(BaseModel):
    """
    User role update request (admin panel).

    Used by managers to promote/demote users.
    The service layer enforces business rules:
    - Only MANAGER can change roles.
    - Cannot change own role.
    """

    role: UserRole
