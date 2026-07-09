"""
Project repository — data access layer for Project entities.

Extends BaseRepository with project-specific queries:
- Name lookup (duplicate check on create)
- Active project listing (report form dropdown)
"""

from typing import Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

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

    async def count_active(self) -> int:
        """
        Count all active projects.

        Returns:
            Count of active projects.
        """
        stmt = select(func.count(Project.id)).where(
            Project.is_active.is_(True)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one()
