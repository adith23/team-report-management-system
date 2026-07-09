"""
Project/Category service.

Handles project/category tag lifecycle management (CRUD).
Ensures project names are unique and soft-deletes projects to
maintain referential integrity for historical reports.
"""

import logging
import uuid
from typing import Sequence

from app.core.exceptions import DuplicateException, NotFoundException
from app.models.project import Project
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate

logger = logging.getLogger(__name__)


class ProjectService:
    """
    Orchestrates project lifecycle business rules.
    """

    def __init__(self, project_repo: ProjectRepository) -> None:
        self._project_repo = project_repo

    async def get_all_active_projects(self, skip: int = 0, limit: int = 100) -> Sequence[Project]:
        """
        Retrieve list of all active projects.
        """
        return await self._project_repo.get_all_active(skip=skip, limit=limit)

    async def get_project_by_id(self, project_id: uuid.UUID) -> Project:
        """
        Fetch a project by ID.

        Raises:
            NotFoundException: If project is not found or soft-deleted.
        """
        project = await self._project_repo.get_by_id(project_id)
        if not project or not project.is_active:
            raise NotFoundException("Project", str(project_id))
        return project

    async def create_project(self, data: ProjectCreate, creator: User) -> Project:
        """
        Create a new project category.

        Args:
            data: Project details.
            creator: The MANAGER who created the project.

        Raises:
            DuplicateException: If a project with the same name already exists.
        """
        # 1. Enforce unique project name
        existing = await self._project_repo.get_by_name(data.name)
        if existing:
            # If the duplicate is inactive, we can reactivate it, or raise error.
            # Raising duplicate error is standard. If duplicate is inactive, we still raise
            # or could reactivate. Let's raise DuplicateException for safety.
            raise DuplicateException("Project", "name", data.name)

        # 2. Instantiate and create Project model
        new_project = Project(
            name=data.name,
            description=data.description,
            color_hex=data.color_hex,
            is_active=True,
            created_by=creator.id,
        )

        created = await self._project_repo.create(new_project)
        logger.info("Project created: %s by manager %s", created.name, creator.email)
        return created

    async def update_project(self, project_id: uuid.UUID, data: ProjectUpdate) -> Project:
        """
        Update project details.

        Raises:
            NotFoundException: If the project doesn't exist.
            DuplicateException: If name is updated to an existing project name.
        """
        project = await self.get_project_by_id(project_id)

        update_data = data.model_dump(exclude_unset=True)

        # Validate unique name if name is being changed
        if "name" in update_data and update_data["name"] != project.name:
            existing = await self._project_repo.get_by_name(update_data["name"])
            if existing:
                raise DuplicateException("Project", "name", update_data["name"])

        return await self._project_repo.update(project, update_data)

    async def delete_project(self, project_id: uuid.UUID) -> None:
        """
        Soft-delete a project (set is_active=False).

        This preserves historical data link in reports while hiding it from future dropdown selection.
        """
        project = await self.get_project_by_id(project_id)
        # Soft delete
        await self._project_repo.update(project, {"is_active": False})
        logger.info("Soft-deleted project: %s (id=%s)", project.name, project.id)
