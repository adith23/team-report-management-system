"""
Authentication schemas (DTOs).

Request and response models for registration and login endpoints.
Validation rules enforced at the API boundary before reaching services.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.core.enums import UserRole


class RegisterRequest(BaseModel):
    """
    Registration request payload.

    Validation:
    - email: Must be a valid email format (via EmailStr).
    - full_name: 2-255 characters.
    - password: 8-128 characters (hashed server-side with Argon2).
    """

    email: EmailStr
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        examples=["John Doe"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        examples=["securepassword123"],
    )


class LoginRequest(BaseModel):
    """
    Login request payload.

    No strict validation on password length here — the service
    layer handles authentication and returns appropriate errors.
    """

    email: EmailStr
    password: str


class TokenPayload(BaseModel):
    """
    Decoded JWT token payload (internal use).

    Used by the security module to represent decoded token data.
    Not exposed directly to API consumers.
    """

    sub: uuid.UUID
    role: UserRole
    exp: datetime
    iat: datetime
