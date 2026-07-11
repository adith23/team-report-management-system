"""
Dashboard analytics service.

Computes KPI metrics and aggregates chart data (trend lines,
workload distributions, submission compliance) for manager review.
"""

import logging
from datetime import date, timedelta
import uuid

from app.repositories.report_repository import ReportRepository
from app.repositories.user_repository import UserRepository
from app.schemas.dashboard import (
    DashboardMetrics,
    SubmissionStatusItem,
    TaskTrendPoint,
    WorkloadDistribution,
    RecentActivity,
)

logger = logging.getLogger(__name__)


class DashboardService:
    """
    Orchestrates manager dashboard analytics computation.
    """

    def __init__(
        self,
        report_repo: ReportRepository,
        user_repo: UserRepository,
    ) -> None:
        self._report_repo = report_repo
        self._user_repo = user_repo

    async def get_summary_metrics(self, week_start: date) -> DashboardMetrics:
        """
        Compute top-level team metrics for a specific week.

        Metrics:
        - total_reports_this_week: count of reports with status != DRAFT
        - submission_compliance_rate: (submitted_or_late / active_users) * 100
        - open_blockers_count: count of blockers with is_resolved=False team-wide
        - total_team_members: count of active users
        """
        # Ensure week_start is snapped to Monday
        monday = week_start - timedelta(days=week_start.weekday())

        # 1. Total reports submitted/late this week
        reports_count = await self._report_repo.count_submitted_for_week(monday)

        # 2. Total active users (team members + managers who submit reports)
        active_users_count = await self._user_repo.count_active()

        # 3. Compute compliance rate
        compliance_rate = 0.0
        if active_users_count > 0:
            compliance_rate = round((reports_count / active_users_count) * 100.0, 1)

        # 4. Count unresolved blockers team-wide
        open_blockers = await self._report_repo.count_open_blockers()

        return DashboardMetrics(
            total_reports_this_week=reports_count,
            submission_compliance_rate=compliance_rate,
            open_blockers_count=open_blockers,
            total_team_members=active_users_count,
        )

    async def get_submission_status(
        self, week_start: date
    ) -> list[SubmissionStatusItem]:
        """
        Retrieve report submission status (submitted, late, pending) for every active user.
        """
        monday = week_start - timedelta(days=week_start.weekday())
        active_users = await self._user_repo.get_all_active(
            limit=1000
        )  # Safe upper limit for team size

        status_items = await self._report_repo.get_submission_status_for_week(
            week_start=monday, active_users=active_users
        )

        return [SubmissionStatusItem(**item) for item in status_items]

    async def get_tasks_completed_trend(
        self, weeks: int = 12, user_id: uuid.UUID | None = None
    ) -> list[TaskTrendPoint]:
        """
        Retrieve completed tasks trend data points.
        """
        trend_rows = await self._report_repo.get_tasks_completed_trend(
            weeks=weeks, user_id=user_id
        )
        return [TaskTrendPoint(**row) for row in trend_rows]

    async def get_workload_distribution(
        self, week_start: date
    ) -> list[WorkloadDistribution]:
        """
        Retrieve task workload distribution by project for a given week.
        """
        monday = week_start - timedelta(days=week_start.weekday())
        workload_rows = await self._report_repo.get_workload_distribution(
            week_start=monday
        )
        return [WorkloadDistribution(**row) for row in workload_rows]

    async def get_recent_activity(self, limit: int = 10) -> list[RecentActivity]:
        """
        Fetch recent report status updates and creations.
        """
        activity_rows = await self._report_repo.get_recent_activity(limit=limit)
        return [RecentActivity(**row) for row in activity_rows]
