"""
User management service.

Handles:
- Fetching all active users (for managers to manage staff roles).
- Updating user roles (promoting team members to manager, etc.).
- Fetching and updating user profiles.
"""

import logging
import uuid
from typing import Sequence

from app.core.enums import UserRole
from app.core.exceptions import (
    ForbiddenException,
    NotFoundException,
    BadRequestException,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate, UserRoleUpdate

logger = logging.getLogger(__name__)


class UserService:
    """
    Orchestrates user profile and role management business rules.
    """

    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    async def get_all_users(
        self, skip: int = 0, limit: int = 100
    ) -> tuple[Sequence[User], int]:
        """
        Fetch all active users and total count. For the admin user list.
        """
        users = await self._user_repo.get_all_active(skip=skip, limit=limit)
        total = await self._user_repo.count_active()
        return users, total

    async def get_user_profile(self, user_id: uuid.UUID) -> User:
        """
        Retrieve a user's details.

        Raises:
            NotFoundException: If user does not exist or is inactive.
        """
        user = await self._user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise NotFoundException("User", str(user_id))
        return user

    async def update_profile(self, user_id: uuid.UUID, data: UserUpdate) -> User:
        """
        Update user profile information.
        """
        user = await self.get_user_profile(user_id)
        update_data = data.model_dump(exclude_unset=True)
        return await self._user_repo.update(user, update_data)

    async def update_user_role(
        self, target_user_id: uuid.UUID, data: UserRoleUpdate, current_user: User
    ) -> User:
        """
        Update a user's role (MANAGER-only action, cannot demote self).

        Business Rules:
        - Only MANAGER can perform this operation (enforced in router).
        - Cannot change own role.
        - Target user must exist and be active.
        """
        # 1. Enforce that user cannot modify their own role
        if target_user_id == current_user.id:
            raise BadRequestException("You cannot change your own role.")

        # 2. Fetch the target user
        target_user = await self._user_repo.get_by_id(target_user_id)
        if not target_user or not target_user.is_active:
            raise NotFoundException("User", str(target_user_id))

        # 3. Update the role
        update_payload = {"role": data.role}
        updated_user = await self._user_repo.update(target_user, update_payload)

        logger.info(
            "User role updated: %s promoted/demoted to %s by admin %s",
            updated_user.email,
            updated_user.role.value,
            current_user.email,
        )
        return updated_user
