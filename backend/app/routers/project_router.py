"""
Project category tagging router.

Allows managers to define projects and color-code them.
Any logged-in user can list active projects to associate their reports.
Update/delete operations are restricted to managers.
"""

import logging
import uuid
from fastapi import APIRouter, Depends, status

from app.core import get_current_user, require_role
from app.core.dependencies import get_project_service
from app.core.enums import UserRole
from app.models.user import User
from app.schemas import ProjectCreate, ProjectRead, ProjectUpdate, ProjectAssignmentRequest, MessageResponse
from app.services import ProjectService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["Project Management"])


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=ProjectRead,
    summary="Create a new project category (MANAGER only)",
)
async def create_project(
    data: ProjectCreate,
    current_user: User = Depends(require_role(UserRole.MANAGER)),  # MANAGER check
    project_service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    """
    Register a new project tag with a color code.
    Name must be unique.
    """
    project = await project_service.create_project(data, creator=current_user)
    return ProjectRead.model_validate(project)


@router.get(
    "/",
    response_model=list[ProjectRead],
    summary="List all active projects",
)
async def list_projects(
    current_user: User = Depends(get_current_user),  # Any auth user can see dropdown options
    project_service: ProjectService = Depends(get_project_service),
) -> list[ProjectRead]:
    """
    Get all active project categories for reporting select inputs.
    """
    projects = await project_service.get_all_active_projects(
        user_id=current_user.id,
        is_manager=current_user.role == UserRole.MANAGER,
    )
    return [ProjectRead.model_validate(p) for p in projects]


@router.put(
    "/{project_id}",
    response_model=ProjectRead,
    summary="Update project category details (MANAGER only)",
)
async def update_project(
    project_id: uuid.UUID,
    data: ProjectUpdate,
    current_user: User = Depends(require_role(UserRole.MANAGER)),
    project_service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    """
    Modify project parameters (name, description, color).
    """
    project = await project_service.update_project(project_id, data)
    return ProjectRead.model_validate(project)


@router.delete(
    "/{project_id}",
    response_model=MessageResponse,
    summary="Soft-delete a project (MANAGER only)",
)
async def delete_project(
    project_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.MANAGER)),
    project_service: ProjectService = Depends(get_project_service),
) -> MessageResponse:
    """
    Soft-delete a project category.
    This hides it from report creation dropdowns while preserving
    database reference links for already-submitted reports.
    """
    await project_service.delete_project(project_id)
    return MessageResponse(message="Project category soft-deleted successfully.")


@router.post(
    "/{project_id}/assign",
    response_model=ProjectRead,
    summary="Assign team members to a project (MANAGER only)",
)
async def assign_project_members(
    project_id: uuid.UUID,
    data: ProjectAssignmentRequest,
    current_user: User = Depends(require_role(UserRole.MANAGER)),
    project_service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    """
    Assign multiple team members to a project category.
    This replaces any existing assignments for the project.
    """
    project = await project_service.assign_users_to_project(project_id, data.user_ids)
    return ProjectRead.model_validate(project)
