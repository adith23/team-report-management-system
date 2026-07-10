"""
Dashboard analytics router.

Exposes team reporting aggregation data for manager review.
All routes in this module are MANAGER only.
"""

import logging
import uuid
from datetime import date
from fastapi import APIRouter, Depends, Query

from app.core import require_role
from app.core.dependencies import get_dashboard_service
from app.core.enums import UserRole
from app.schemas import (
    DashboardMetrics,
    SubmissionStatusItem,
    TaskTrendPoint,
    WorkloadDistribution,
    RecentActivity,
)
from app.services import DashboardService

logger = logging.getLogger(__name__)

# Protect all dashboard analytics routes for Managers only
router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard Analytics"],
    dependencies=[Depends(require_role(UserRole.MANAGER))],
)


@router.get(
    "/metrics",
    response_model=DashboardMetrics,
    summary="Get team overview KPI metrics (MANAGER only)",
)
async def get_metrics(
    week_start: date | None = Query(
        default=None,
        description="Filter week (snapped to Monday). Defaults to current week.",
    ),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> DashboardMetrics:
    """
    Retrieve top-level overview metrics: report counts, compliance rate,
    open blockers, and team size.
    """
    target_date = week_start or date.today()
    return await dashboard_service.get_summary_metrics(target_date)


@router.get(
    "/submission-status",
    response_model=list[SubmissionStatusItem],
    summary="Get submission compliance status per user (MANAGER only)",
)
async def get_submission_status(
    week_start: date | None = Query(
        default=None,
        description="Filter week (snapped to Monday). Defaults to current week.",
    ),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> list[SubmissionStatusItem]:
    """
    Get detailed reporting compliance state (submitted, pending, late) for each active team member.
    """
    target_date = week_start or date.today()
    return await dashboard_service.get_submission_status(target_date)


@router.get(
    "/tasks-trend",
    response_model=list[TaskTrendPoint],
    summary="Get historical completed task count trend (MANAGER only)",
)
async def get_tasks_trend(
    weeks: int = Query(
        default=12,
        ge=1,
        le=52,
        description="Number of recent weeks to return (1-52)",
    ),
    user_id: uuid.UUID | None = Query(
        default=None,
        description="Filter trend by specific team member UUID",
    ),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> list[TaskTrendPoint]:
    """
    Aggregate and retrieve number of completed tasks per week over time.
    Used for graphing line trends (Recharts).
    """
    return await dashboard_service.get_tasks_completed_trend(weeks=weeks, user_id=user_id)


@router.get(
    "/workload-distribution",
    response_model=list[WorkloadDistribution],
    summary="Get workload task counts by project (MANAGER only)",
)
async def get_workload_distribution(
    week_start: date | None = Query(
        default=None,
        description="Filter week (snapped to Monday). Defaults to current week.",
    ),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> list[WorkloadDistribution]:
    """
    Retrieve workload distribution metrics showing total tasks logged per project.
    Used for pie/bar chart representation (Recharts).
    """
    target_date = week_start or date.today()
    return await dashboard_service.get_workload_distribution(target_date)


@router.get(
    "/recent-activity",
    response_model=list[RecentActivity],
    summary="Get recent report changes activity log (MANAGER only)",
)
async def get_recent_activity(
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
        description="Activity items limit",
    ),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> list[RecentActivity]:
    """
    Get chronological activity feed of team reports being created, updated, or submitted.
    """
    return await dashboard_service.get_recent_activity(limit=limit)
