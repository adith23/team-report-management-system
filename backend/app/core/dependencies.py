"""
FastAPI dependency injection module.

Provides injectable dependencies for:
- Database sessions (get_db)
- Current authenticated user (get_current_user)
- Role-based access control (require_role)

These dependencies form the authentication/authorization chain:
    Request → Cookie → JWT Decode → User Lookup → Role Check

Usage in routers:
    @router.get("/protected")
    async def protected(user: User = Depends(get_current_user)):
        ...

    @router.get("/admin-only")
    async def admin_only(user: User = Depends(require_role(UserRole.MANAGER))):
        ...
"""

import logging
from collections.abc import Callable

import jwt
from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.enums import UserRole
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_access_token
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User

logger = logging.getLogger(__name__)

# ── Cookie name constant (must match security.py) ────────────────
_COOKIE_KEY = "access_token"


# ── Current User Dependency ──────────────────────────────────────
async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> "User":
    """
    Extract and validate the JWT from the HttpOnly cookie,
    then fetch the corresponding user from the database.

    This is the primary authentication dependency. It:
    1. Reads the `access_token` cookie from the request.
    2. Decodes and validates the JWT (signature + expiration).
    3. Fetches the user from the database by ID.
    4. Verifies the user exists and is active.

    Args:
        request: The incoming FastAPI request (provides cookies).
        db: Database session (injected via Depends).

    Returns:
        The authenticated User ORM instance.

    Raises:
        UnauthorizedException: If cookie is missing, JWT is invalid,
                                or user is not found/inactive.
    """
    # Step 1: Extract token from cookie
    token = request.cookies.get(_COOKIE_KEY)
    if not token:
        raise UnauthorizedException("Authentication required. Please log in.")

    # Step 2: Decode and validate JWT
    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("Session expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise UnauthorizedException("Invalid authentication token.")

    # Step 3: Fetch user from database
    from app.models.user import User

    stmt = select(User).where(User.id == payload.sub)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise UnauthorizedException("User account not found.")

    # Step 4: Check active status
    if not user.is_active:
        raise UnauthorizedException("User account has been deactivated.")

    return user


# ── Role-Based Access Control Dependency ─────────────────────────
def require_role(*allowed_roles: UserRole) -> Callable:
    """
    Factory that creates a dependency enforcing role-based access.

    Returns a dependency function that:
    1. Authenticates the user (via get_current_user).
    2. Checks if the user's role is in the allowed roles.
    3. Raises ForbiddenException if the role check fails.

    This implements the backend half of dual-layer RBAC:
    - Frontend: UI adaptation (hide/show nav items) — UX only.
    - Backend: This dependency — strict enforcement on every request.

    Args:
        *allowed_roles: One or more UserRole values that are permitted.

    Returns:
        A FastAPI dependency function.

    Usage:
        @router.get("/dashboard")
        async def dashboard(
            user: User = Depends(require_role(UserRole.MANAGER))
        ):
            ...
    """

    async def role_checker(
        current_user: "User" = Depends(get_current_user),
    ) -> "User":
        """Verify the authenticated user has one of the allowed roles."""
        if current_user.role not in allowed_roles:
            logger.warning(
                "Access denied: user %s (role=%s) attempted to access "
                "resource requiring roles %s",
                current_user.id,
                current_user.role.value,
                [r.value for r in allowed_roles],
            )
            raise ForbiddenException(
                "You do not have permission to access this resource."
            )
        return current_user

    return role_checker


# ── Service Dependencies ─────────────────────────────────────────
async def get_auth_service(db: AsyncSession = Depends(get_db)) -> "AuthService":
    from app.repositories import UserRepository
    from app.services import AuthService

    return AuthService(UserRepository(db))


async def get_user_service(db: AsyncSession = Depends(get_db)) -> "UserService":
    from app.repositories import UserRepository
    from app.services import UserService

    return UserService(UserRepository(db))


async def get_project_service(db: AsyncSession = Depends(get_db)) -> "ProjectService":
    from app.repositories import ProjectRepository
    from app.services import ProjectService

    return ProjectService(ProjectRepository(db))


_embedding_service = None
_vector_service = None

def get_vector_service() -> "VectorService":
    global _embedding_service, _vector_service
    if _vector_service is None:
        from app.services.ai.embedding_service import EmbeddingService
        from app.services.ai.vector_service import VectorService
        if _embedding_service is None:
            _embedding_service = EmbeddingService()
        _vector_service = VectorService(_embedding_service)
    return _vector_service


async def get_report_service(db: AsyncSession = Depends(get_db)) -> "ReportService":
    from app.repositories import ReportRepository, ProjectRepository
    from app.services import ReportService

    return ReportService(
        report_repo=ReportRepository(db),
        project_repo=ProjectRepository(db),
        vector_service=get_vector_service(),
    )


async def get_dashboard_service(
    db: AsyncSession = Depends(get_db),
) -> "DashboardService":
    from app.repositories import ReportRepository, UserRepository
    from app.services import DashboardService

    return DashboardService(ReportRepository(db), UserRepository(db))


async def get_ai_service(db: AsyncSession = Depends(get_db)) -> "AIService":
    from app.repositories import ReportRepository
    from app.services import AIService
    from app.services.ai.gemini_strategy import GeminiStrategy

    return AIService(
        llm=GeminiStrategy(),
        report_repo=ReportRepository(db),
        vector_service=get_vector_service(),
    )
