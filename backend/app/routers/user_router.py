"""
User management router.

Provides endpoints for managers to view and administer user accounts.
All routes in this module require the MANAGER role.
"""

import logging
import uuid
from typing import Sequence
from fastapi import APIRouter, Depends, Query, status

from app.core import require_role
from app.core.dependencies import get_user_service
from app.core.enums import UserRole
from app.models.user import User
from app.schemas import UserRead, UserRoleUpdate, PaginatedResponse
from app.services import UserService

logger = logging.getLogger(__name__)

# Protect all routes in this router with the MANAGER role
router = APIRouter(
    prefix="/users",
    tags=["User Management"],
    dependencies=[Depends(require_role(UserRole.MANAGER))],
)


@router.get(
    "/",
    response_model=PaginatedResponse[UserRead],
    summary="List active user accounts (MANAGER only)",
)
async def list_users(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Page size limit"),
    user_service: UserService = Depends(get_user_service),
) -> PaginatedResponse[UserRead]:
    """
    Retrieve active user accounts for the admin dashboard.
    Returns a paginated list.
    """
    skip = (page - 1) * page_size
    users, total = await user_service.get_all_users(skip=skip, limit=page_size)
    total_pages = (total + page_size - 1) // page_size

    return PaginatedResponse(
        items=[UserRead.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.patch(
    "/{user_id}/role",
    response_model=UserRead,
    summary="Promote or demote user role (MANAGER only)",
)
async def update_user_role(
    user_id: uuid.UUID,
    data: UserRoleUpdate,
    current_user: User = Depends(require_role(UserRole.MANAGER)),
    user_service: UserService = Depends(get_user_service),
) -> User:
    """
    Promote a team member to MANAGER or demote back to TEAM_MEMBER.
    Managers cannot modify their own role.
    """
    return await user_service.update_user_role(
        target_user_id=user_id, data=data, current_user=current_user
    )
