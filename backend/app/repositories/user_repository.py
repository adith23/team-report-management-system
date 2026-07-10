"""
User repository — data access layer for User entities.

Extends BaseRepository with user-specific queries:
- Email lookup (login, registration duplicate check)
- Active user listing (admin panel)
- Active user count (dashboard metrics)
"""

import uuid
from typing import Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    Repository for User entity operations.

    Inherits generic CRUD from BaseRepository[User].
    Adds user-specific queries below.
    """

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> User | None:
        """
        Find a user by their email address.

        Used during login and registration (duplicate check).
        The email column has a unique index for O(log n) lookups.

        Args:
            email: The email address to search for.

        Returns:
            The User if found, None otherwise.
        """
        stmt = select(User).where(User.email == email)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_active(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[User]:
        """
        Fetch all active (non-deleted) users with pagination.

        Used by the admin panel's user management table.

        Args:
            skip: Offset for pagination.
            limit: Maximum records to return.

        Returns:
            Sequence of active User instances.
        """
        stmt = (
            select(User)
            .where(User.is_active.is_(True))
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def count_active(self) -> int:
        """
        Count all active users.

        Used by the dashboard to calculate submission compliance rate:
        compliance = (submitted_reports / active_users) × 100

        Returns:
            Count of active users.
        """
        stmt = select(func.count(User.id)).where(User.is_active.is_(True))
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def get_by_ids(self, ids: list[uuid.UUID]) -> Sequence[User]:
        """
        Fetch multiple users by their UUIDs.

        Args:
            ids: List of user UUIDs.

        Returns:
            Sequence of User instances.
        """
        if not ids:
            return []
        stmt = select(User).where(User.id.in_(ids))
        result = await self._session.execute(stmt)
        return result.scalars().all()
