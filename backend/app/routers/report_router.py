"""
Weekly reports router.

Enables CRUD operations on reports.
Role-based constraints are strictly validated:
- Team members can create, update, delete (if draft), submit, and view their own reports.
- Managers can view all submitted reports with dynamic filters.
"""

import logging
import uuid
from datetime import date
from fastapi import APIRouter, Depends, Query, status

from app.core import get_current_user, require_role
from app.core.dependencies import get_report_service
from app.core.enums import ReportStatus, UserRole
from app.models.user import User
from app.schemas import (
    ReportCreate,
    ReportUpdate,
    ReportRead,
    PaginatedResponse,
    MessageResponse,
)
from app.services import ReportService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Weekly Reports"])


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=ReportRead,
    summary="Create a new weekly report",
)
async def create_report(
    data: ReportCreate,
    current_user: User = Depends(get_current_user),
    report_service: ReportService = Depends(get_report_service),
) -> ReportRead:
    """
    Submit a weekly report form draft.
    The report date is snapped to Monday-Sunday week boundaries by the service layer.
    """
    report = await report_service.create_report(data, author=current_user)
    return ReportRead.model_validate(report)


@router.get(
    "/my",
    response_model=PaginatedResponse[ReportRead],
    summary="Retrieve current user's report history",
)
async def get_my_reports(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    report_service: ReportService = Depends(get_report_service),
) -> PaginatedResponse[ReportRead]:
    """
    Get personal report submission history (Drafts, Submitted, Late).
    """
    return await report_service.get_user_reports(
        current_user=current_user, page=page, page_size=page_size
    )


@router.get(
    "/team",
    response_model=PaginatedResponse[ReportRead],
    summary="Retrieve team reports (MANAGER only)",
)
async def get_team_reports(
    week_start: date | None = Query(default=None, description="Start date filter (YYYY-MM-DD)"),
    week_end: date | None = Query(default=None, description="End date filter (YYYY-MM-DD)"),
    user_id: uuid.UUID | None = Query(default=None, description="Filter by user UUID"),
    project_id: uuid.UUID | None = Query(default=None, description="Filter by project UUID"),
    status: ReportStatus | None = Query(default=None, description="Filter by status enum"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(require_role(UserRole.MANAGER)),  # MANAGER role check
    report_service: ReportService = Depends(get_report_service),
) -> PaginatedResponse[ReportRead]:
    """
    Eagerly loads all weekly reports submitted across the team with multi-parameter filtering.
    For manager analytics review.
    """
    return await report_service.get_team_reports(
        week_start=week_start,
        week_end=week_end,
        user_id=user_id,
        project_id=project_id,
        status=status,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{report_id}",
    response_model=ReportRead,
    summary="Fetch detailed report by UUID",
)
async def get_report_detail(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    report_service: ReportService = Depends(get_report_service),
) -> ReportRead:
    """
    Retrieve full report details including complete checklists of tasks and blockers.
    Access constraints:
    - Team members can only view their own reports.
    - Managers can view anyone's reports.
    """
    report = await report_service.get_report_detail(report_id, current_user=current_user)
    return ReportRead.model_validate(report)


@router.put(
    "/{report_id}",
    response_model=ReportRead,
    summary="Update report details (owner only)",
)
async def update_report(
    report_id: uuid.UUID,
    data: ReportUpdate,
    current_user: User = Depends(get_current_user),
    report_service: ReportService = Depends(get_report_service),
) -> ReportRead:
    """
    Modify report content. Can only modify own report.
    If the report is already submitted, editing it will automatically revert the status
    back to DRAFT, requiring resubmission to preserve workflow integrity.
    """
    report = await report_service.update_report(report_id, data, current_user=current_user)
    return ReportRead.model_validate(report)


@router.post(
    "/{report_id}/submit",
    response_model=ReportRead,
    summary="Submit a draft report (owner only)",
)
async def submit_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    report_service: ReportService = Depends(get_report_service),
) -> ReportRead:
    """
    Finalize and submit a weekly report draft.
    If submitted after the reporting week Sunday (23:59:59), the status is marked as LATE.
    On-time submissions are marked as SUBMITTED.
    """
    report = await report_service.submit_report(report_id, current_user=current_user)
    return ReportRead.model_validate(report)


@router.delete(
    "/{report_id}",
    response_model=MessageResponse,
    summary="Delete a report draft (owner only)",
)
async def delete_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    report_service: ReportService = Depends(get_report_service),
) -> MessageResponse:
    """
    Permanently delete a report. Can only delete own report, and only if it's currently a DRAFT.
    """
    await report_service.delete_report(report_id, current_user=current_user)
    return MessageResponse(message="Report deleted successfully.")
