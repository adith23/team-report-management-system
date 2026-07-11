"""
Project repository — data access layer for Project entities.

Extends BaseRepository with project-specific queries:
- Name lookup (duplicate check on create)
- Active project listing (report form dropdown)
"""

import uuid
from typing import Sequence

from sqlalchemy import select, func, and_, or_, exists, not_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.project import Project
from app.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    """
    Repository for Project entity operations.

    Inherits generic CRUD from BaseRepository[Project].
    Adds project-specific queries below.
    """

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Project, session)

    async def get_by_id(self, id: uuid.UUID) -> Project | None:
        """
        Fetch a single project by its UUID primary key, eager loading assigned users.
        """
        stmt = (
            select(Project)
            .options(selectinload(Project.assigned_users))
            .where(Project.id == id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Project | None:
        """
        Find a project by its name.

        Used during project creation to check for duplicates.
        The name column has a unique constraint.

        Args:
            name: The project name to search for.

        Returns:
            The Project if found, None otherwise.
        """
        stmt = select(Project).where(Project.name == name)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_active(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Project]:
        """
        Fetch all active (non-deleted) projects.

        Used by:
        - Report form: project dropdown for all users.
        - Project management page: admin CRUD list.

        Args:
            skip: Offset for pagination.
            limit: Maximum records to return.

        Returns:
            Sequence of active Project instances, ordered by name.
        """
        stmt = (
            select(Project)
            .where(Project.is_active.is_(True))
            .order_by(Project.name.asc())
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def get_active_for_user(
        self,
        user_id: uuid.UUID,
        is_manager: bool,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Project]:
        """
        Fetch active projects visible to a specific user.
        Managers see all active projects.
        Team members see projects they are assigned to, or projects with no assignments.
        """
        if is_manager:
            return await self.get_all_active(skip=skip, limit=limit)

        from app.models.user_project import UserProjectAssignment

        # Subquery to check if the project has any assignments
        has_assignments = exists().where(UserProjectAssignment.project_id == Project.id)
        # Subquery to check if this user is assigned to this project
        is_assigned = exists().where(
            and_(
                UserProjectAssignment.project_id == Project.id,
                UserProjectAssignment.user_id == user_id,
            )
        )

        stmt = (
            select(Project)
            .where(
                and_(
                    Project.is_active.is_(True),
                    or_(
                        not_(has_assignments),
                        is_assigned,
                    ),
                )
            )
            .order_by(Project.name.asc())
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def count_active(self) -> int:
        """
        Count all active projects.

        Returns:
            Count of active projects.
        """
        stmt = select(func.count(Project.id)).where(Project.is_active.is_(True))
        result = await self._session.execute(stmt)
        return result.scalar_one()
