"""
Security module — JWT token management and Argon2 password hashing.

Provides:
- Password hashing and verification using Argon2id (memory-hard KDF).
- JWT access token creation and decoding (HMAC-SHA256).
- HttpOnly cookie utilities for setting and clearing auth cookies.

Security decisions:
- Argon2id is the winner of the Password Hashing Competition (2015)
  and is recommended by OWASP for password storage.
- JWT tokens are stored in HttpOnly cookies (not localStorage) to
  prevent XSS attacks from accessing the token.
- Cookie flags: HttpOnly, Secure (HTTPS only), SameSite=Lax (CSRF).
"""

import uuid
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import (
    HashingError,
    VerificationError,
    VerifyMismatchError,
    InvalidHashError,
)
from fastapi import Response
from pydantic import BaseModel

from app.config import settings
from app.core.enums import UserRole

# ── Argon2 Password Hasher ───────────────────────────────────────
# Using default parameters which provide a good balance of security
# and performance for a web application:
# - time_cost=3 (number of iterations)
# - memory_cost=65536 (64 MB)
# - parallelism=4 (threads)
_password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using Argon2id.

    Args:
        password: The plain-text password to hash.

    Returns:
        The Argon2id hash string (includes salt, params, and hash).

    Raises:
        HashingError: If hashing fails (should not happen in practice).
    """
    return _password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against an Argon2id hash.

    Args:
        plain_password: The password to verify.
        hashed_password: The stored Argon2id hash.

    Returns:
        True if the password matches, False otherwise.
    """
    try:
        return _password_hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


# ── JWT Token Payload ────────────────────────────────────────────
class TokenPayload(BaseModel):
    """
    Decoded JWT token payload.

    Fields:
        sub: User ID (UUID as string) — the "subject" claim.
        role: User's authorization role.
        exp: Token expiration timestamp.
        iat: Token issued-at timestamp.
    """

    sub: uuid.UUID
    role: UserRole
    exp: datetime
    iat: datetime


def create_access_token(user_id: uuid.UUID, role: UserRole) -> str:
    """
    Create a JWT access token for an authenticated user.

    The token contains:
    - sub: User ID (for identification)
    - role: User role (for frontend UI adaptation — NOT for backend auth)
    - exp: Expiration time
    - iat: Issued-at time

    Args:
        user_id: The authenticated user's UUID.
        role: The user's current role.

    Returns:
        Encoded JWT string.
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "role": role.value,
        "exp": expire,
        "iat": now,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> TokenPayload:
    """
    Decode and validate a JWT access token.

    Validates:
    - Signature (using JWT_SECRET_KEY)
    - Expiration (exp claim)
    - Required claims (sub, role, exp, iat)

    Args:
        token: The encoded JWT string.

    Returns:
        Validated TokenPayload with user_id and role.

    Raises:
        jwt.ExpiredSignatureError: If token has expired.
        jwt.InvalidTokenError: If token is malformed or tampered.
    """
    decoded = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )

    return TokenPayload(
        sub=uuid.UUID(decoded["sub"]),
        role=UserRole(decoded["role"]),
        exp=datetime.fromtimestamp(decoded["exp"], tz=timezone.utc),
        iat=datetime.fromtimestamp(decoded["iat"], tz=timezone.utc),
    )


# ── Cookie Utilities ─────────────────────────────────────────────
_COOKIE_KEY = "access_token"
_COOKIE_MAX_AGE = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60  # seconds


def set_auth_cookie(response: Response, token: str) -> None:
    """
    Set the JWT access token as an HttpOnly cookie on the response.

    Cookie security flags:
    - httponly=True:  Prevents JavaScript access (XSS protection).
    - secure=True:   Only sent over HTTPS (disabled in dev for localhost).
    - samesite="lax": Prevents CSRF on cross-origin POST requests
                      while allowing normal navigation.
    - max_age:       Matches JWT expiration (24 hours by default).

    Args:
        response: The FastAPI Response object to set the cookie on.
        token: The encoded JWT string.
    """
    response.set_cookie(
        key=_COOKIE_KEY,
        value=token,
        max_age=_COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.is_production,  # True in production (HTTPS), False in dev
        samesite="lax",
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    """
    Clear the auth cookie from the response (logout).

    Sets the cookie value to empty with max_age=0 to instruct
    the browser to delete it immediately.

    Args:
        response: The FastAPI Response object to clear the cookie from.
    """
    response.delete_cookie(
        key=_COOKIE_KEY,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/",
    )
