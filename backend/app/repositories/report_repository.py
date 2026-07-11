"""
Report repository — data access layer for WeeklyReport entities.

Extends BaseRepository with report-specific queries:
- User report history (personal page)
- Team reports with dynamic filters (manager dashboard)
- Dashboard aggregation queries (metrics, trends, workload)
- Duplicate detection (user + week)

This is the most query-intensive repository due to the
dashboard analytics requirements.
"""

import uuid
from datetime import date
from typing import Sequence

from sqlalchemy import select, func, case, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.enums import ReportStatus, TaskType
from app.models.report import WeeklyReport
from app.models.report_blocker import ReportBlocker
from app.models.report_task import ReportTask
from app.models.user import User
from app.models.project import Project
from app.repositories.base import BaseRepository


class ReportRepository(BaseRepository[WeeklyReport]):
    """
    Repository for WeeklyReport entity operations.

    Inherits generic CRUD from BaseRepository[WeeklyReport].
    Adds report-specific queries and dashboard aggregations.
    """

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(WeeklyReport, session)

    # Report Queries
    async def get_by_user_and_week(
        self,
        user_id: uuid.UUID,
        project_id: uuid.UUID,
        week_start: date,
    ) -> WeeklyReport | None:
        """
        Check for duplicate report: one per user per project per week.

        Used during report creation to enforce the unique
        constraint before hitting the database.
        """
        stmt = select(WeeklyReport).where(
            and_(
                WeeklyReport.user_id == user_id,
                WeeklyReport.project_id == project_id,
                WeeklyReport.week_start == week_start,
            )
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_report_with_relations(
        self,
        report_id: uuid.UUID,
    ) -> WeeklyReport | None:
        """
        Fetch a report with all related data eagerly loaded.
        """
        stmt = (
            select(WeeklyReport)
            .options(
                selectinload(WeeklyReport.user),
                selectinload(WeeklyReport.project),
                selectinload(WeeklyReport.tasks),
                selectinload(WeeklyReport.blockers),
            )
            .where(WeeklyReport.id == report_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_reports(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[WeeklyReport], int]:
        """
        Get a user's own reports, paginated, ordered by week descending.
        """
        # Count query
        count_stmt = select(func.count(WeeklyReport.id)).where(
            WeeklyReport.user_id == user_id
        )
        count_result = await self._session.execute(count_stmt)
        total = count_result.scalar_one()

        stmt = (
            select(WeeklyReport)
            .options(
                selectinload(WeeklyReport.user),
                selectinload(WeeklyReport.project),
                selectinload(WeeklyReport.tasks),
                selectinload(WeeklyReport.blockers),
            )
            .where(WeeklyReport.user_id == user_id)
            .order_by(WeeklyReport.week_start.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        reports = result.scalars().all()

        return reports, total

    async def get_team_reports(
        self,
        week_start: date | None = None,
        week_end: date | None = None,
        user_id: uuid.UUID | None = None,
        project_id: uuid.UUID | None = None,
        status: ReportStatus | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[Sequence[WeeklyReport], int]:
        """
        Get all team reports with dynamic filtering.
        """
        # Build dynamic WHERE clause
        conditions = []
        if week_start is not None:
            conditions.append(WeeklyReport.week_start >= week_start)
        if week_end is not None:
            conditions.append(WeeklyReport.week_start <= week_end)
        if user_id is not None:
            conditions.append(WeeklyReport.user_id == user_id)
        if project_id is not None:
            conditions.append(WeeklyReport.project_id == project_id)
        if status is not None:
            conditions.append(WeeklyReport.status == status)

        # Count query
        count_stmt = select(func.count(WeeklyReport.id))
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        count_result = await self._session.execute(count_stmt)
        total = count_result.scalar_one()

        # Data query
        stmt = select(WeeklyReport).options(
            selectinload(WeeklyReport.user),
            selectinload(WeeklyReport.project),
            selectinload(WeeklyReport.tasks),
            selectinload(WeeklyReport.blockers),
        )
        if conditions:
            stmt = stmt.where(and_(*conditions))
        stmt = stmt.order_by(WeeklyReport.week_start.desc()).offset(skip).limit(limit)

        result = await self._session.execute(stmt)
        reports = result.scalars().all()

        return reports, total

    # Dashboard Aggregation Queries
    async def count_reports_for_week(self, week_start: date) -> int:
        stmt = select(func.count(WeeklyReport.id)).where(
            and_(
                WeeklyReport.week_start == week_start,
                WeeklyReport.status != ReportStatus.DRAFT,
            )
        )
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def count_submitted_for_week(self, week_start: date) -> int:
        return await self.count_reports_for_week(week_start)

    async def count_open_blockers(self) -> int:
        # All blockers are considered open since is_resolved was removed.
        stmt = select(func.count(ReportBlocker.id))
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def get_submission_status_for_week(
        self,
        week_start: date,
        active_users: Sequence[User],
    ) -> list[dict]:
        stmt = select(
            WeeklyReport.user_id, WeeklyReport.status, WeeklyReport.submitted_at
        ).where(WeeklyReport.week_start == week_start)
        result = await self._session.execute(stmt)
        reports = result.all()

        user_reports: dict[uuid.UUID, dict] = {}
        for row in reports:
            existing = user_reports.get(row.user_id)
            if existing is None or (
                row.status == ReportStatus.SUBMITTED
                and existing["status"] != ReportStatus.SUBMITTED
            ):
                user_reports[row.user_id] = {
                    "status": row.status,
                    "submitted_at": row.submitted_at,
                }

        status_list = []
        for user in active_users:
            report_data = user_reports.get(user.id)
            if report_data is None or report_data["status"] == ReportStatus.DRAFT:
                status = "pending"
                submitted_at = None
            elif report_data["status"] == ReportStatus.LATE:
                status = "late"
                submitted_at = report_data["submitted_at"]
            else:
                status = "submitted"
                submitted_at = report_data["submitted_at"]

            status_list.append(
                {
                    "user_id": user.id,
                    "user_full_name": user.full_name,
                    "status": status,
                    "submitted_at": submitted_at,
                }
            )

        return status_list

    async def get_tasks_completed_trend(
        self,
        weeks: int = 12,
        user_id: uuid.UUID | None = None,
    ) -> list[dict]:
        conditions = [ReportTask.task_type == TaskType.COMPLETED]
        if user_id is not None:
            conditions.append(WeeklyReport.user_id == user_id)

        stmt = (
            select(
                WeeklyReport.week_start,
                func.count(ReportTask.id).label("tasks_completed_count"),
            )
            .join(ReportTask, ReportTask.report_id == WeeklyReport.id)
            .where(and_(*conditions))
            .group_by(WeeklyReport.week_start)
            .order_by(WeeklyReport.week_start.desc())
            .limit(weeks)
        )
        result = await self._session.execute(stmt)
        rows = result.all()

        return [
            {
                "week_start": row.week_start,
                "tasks_completed_count": row.tasks_completed_count,
            }
            for row in reversed(rows)
        ]

    async def get_workload_distribution(
        self,
        week_start: date,
    ) -> list[dict]:
        stmt = (
            select(
                Project.name.label("project_name"),
                Project.color_hex.label("project_color"),
                func.count(ReportTask.id).label("task_count"),
            )
            .join(WeeklyReport, WeeklyReport.project_id == Project.id)
            .join(ReportTask, ReportTask.report_id == WeeklyReport.id)
            .where(WeeklyReport.week_start == week_start)
            .group_by(Project.name, Project.color_hex)
            .order_by(func.count(ReportTask.id).desc())
        )
        result = await self._session.execute(stmt)
        rows = result.all()

        return [
            {
                "project_name": row.project_name,
                "project_color": row.project_color,
                "task_count": row.task_count,
            }
            for row in rows
        ]

    async def get_recent_activity(
        self,
        limit: int = 10,
    ) -> list[dict]:
        stmt = (
            select(WeeklyReport)
            .options(
                selectinload(WeeklyReport.user),
                selectinload(WeeklyReport.project),
            )
            .order_by(WeeklyReport.updated_at.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        reports = result.scalars().all()

        activities = []
        for report in reports:
            if report.status in (ReportStatus.SUBMITTED, ReportStatus.LATE):
                action = "submitted"
            elif report.created_at == report.updated_at:
                action = "created"
            else:
                action = "updated"

            activities.append(
                {
                    "report_id": report.id,
                    "user_full_name": report.user.full_name,
                    "project_name": (
                        report.project.name if report.project else "Unknown"
                    ),
                    "action": action,
                    "timestamp": report.updated_at,
                }
            )

        return activities
