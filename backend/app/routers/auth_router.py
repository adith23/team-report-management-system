"""
Authentication router.

Provides public endpoints for user registration and login,
plus session checking and logout.
Session management is stateless on the server, using HttpOnly cookies
to store the client's JWT access token.
"""

import logging
from fastapi import APIRouter, Depends, Response, status

from app.core import get_current_user, set_auth_cookie, clear_auth_cookie
from app.core.dependencies import get_auth_service
from app.models.user import User
from app.schemas import RegisterRequest, LoginRequest, UserRead, MessageResponse
from app.services import AuthService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserRead,
    summary="Register a new user account",
)
async def register(
    data: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    """
    Open registration for team members.
    The first registered user matching the ADMIN_BOOTSTRAP_EMAIL
    environment variable will automatically receive the MANAGER role.
    All subsequent registrations defaults to TEAM_MEMBER.
    """
    return await auth_service.register(data)


@router.post(
    "/login",
    response_model=UserRead,
    summary="Authenticate user and start session",
)
async def login(
    data: LoginRequest,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    """
    Authenticate email & password.
    On success, generates a JWT access token and sets it as an HttpOnly,
    Secure, SameSite=Lax cookie on the client response.
    """
    user, token = await auth_service.login(data)
    set_auth_cookie(response, token)
    return user


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Invalidate session and clear cookie",
)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    """
    Log out the current user.
    Instructs the browser to clear the HttpOnly access token cookie.
    """
    clear_auth_cookie(response)
    logger.info("User logged out successfully: %s", current_user.email)
    return MessageResponse(message="Successfully logged out.")


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current user session information",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Retrieve session details of the currently logged-in user.
    Used by the frontend dashboard on page refresh to verify session state.
    """
    return current_user
