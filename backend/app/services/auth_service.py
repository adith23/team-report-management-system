"""
Authentication service.

Handles:
- User registration (validates email uniqueness, hashes password, applies MANAGER role to bootstrap email).
- User login (verifies credentials, generates JWT access tokens).
"""

import logging
from app.config import settings
from app.core.enums import UserRole
from app.core.exceptions import (
    DuplicateException,
    UnauthorizedException,
    ForbiddenException,
)
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest, LoginRequest

logger = logging.getLogger(__name__)


class AuthService:
    """
    Orchestrates authentication operations.
    """

    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    async def register(self, data: RegisterRequest) -> User:
        """
        Register a new user account.

        Args:
            data: Registration request details (email, password, full_name).

        Returns:
            The created User instance.

        Raises:
            DuplicateException: If a user with the same email already exists.
        """
        # 1. Check if email already exists
        existing_user = await self._user_repo.get_by_email(data.email)
        if existing_user:
            raise DuplicateException("User", "email", data.email)

        # 2. Hash password with Argon2
        hashed_password = hash_password(data.password)

        # 3. Determine user role based on email (bootstrap check)
        role = UserRole.TEAM_MEMBER
        if data.email.lower() == settings.ADMIN_BOOTSTRAP_EMAIL.lower():
            role = UserRole.MANAGER
            logger.info("Granting bootstrap MANAGER role to email: %s", data.email)

        # 4. Create user record
        new_user = User(
            email=data.email.lower(),
            full_name=data.full_name,
            hashed_password=hashed_password,
            role=role,
            is_active=True,
        )

        return await self._user_repo.create(new_user)

    async def login(self, data: LoginRequest) -> tuple[User, str]:
        """
        Authenticate a user and generate a JWT access token.

        Args:
            data: Login credentials (email, password).

        Returns:
            Tuple of (User, JWT token string).

        Raises:
            UnauthorizedException: If email/password are incorrect.
            ForbiddenException: If the account is deactivated.
        """
        # 1. Fetch user by email
        user = await self._user_repo.get_by_email(data.email)
        if not user:
            raise UnauthorizedException("Invalid email or password.")

        # 2. Verify password with Argon2
        if not verify_password(data.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")

        # 3. Verify user is active
        if not user.is_active:
            raise ForbiddenException(
                "Your account is deactivated. Please contact support."
            )

        # 4. Generate JWT access token
        token = create_access_token(user.id, user.role)

        logger.info(
            "User logged in: %s (id=%s, role=%s)", user.email, user.id, user.role.value
        )
        return user, token
