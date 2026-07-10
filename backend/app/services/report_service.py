"""
Weekly report management service.

Handles business logic for the weekly reports:
- Snap report week dates to Monday-Sunday boundaries.
- Ensure composite unique constraint (one report per user/project/week).
- Validate active projects.
- Manage report status transition (DRAFT -> SUBMITTED/LATE).
- Batch replacement of tasks and blockers when updating reports.
- Enforce strict owner-only access for team members and view-all access for managers.
"""

import logging
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Sequence

from app.core.enums import ReportStatus, TaskType, UserRole
from app.core.exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    DuplicateException,
)
from app.models.report import WeeklyReport
from app.models.report_blocker import ReportBlocker
from app.models.report_task import ReportTask
from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.repositories.report_repository import ReportRepository
from app.schemas.common import PaginatedResponse
from app.schemas.report import ReportCreate, ReportUpdate, ReportRead

logger = logging.getLogger(__name__)


class ReportService:
    """
    Orchestrates weekly report lifecycle operations and business rules.
    """

    def __init__(
        self,
        report_repo: ReportRepository,
        project_repo: ProjectRepository,
        vector_service,
    ) -> None:
        self._report_repo = report_repo
        self._project_repo = project_repo
        self._vector_service = vector_service

    def _normalize_week(self, week_start: date) -> tuple[date, date]:
        """
        Given any date, find the Monday and Sunday of that week.
        """
        # weekday() returns 0 for Monday ... 6 for Sunday
        monday = week_start - timedelta(days=week_start.weekday())
        sunday = monday + timedelta(days=6)
        return monday, sunday

    async def create_report(self, data: ReportCreate, author: User) -> WeeklyReport:
        """
        Create a new weekly report.

        Steps:
        1. Verify project exists and is active.
        2. Normalize week_start to Monday, calculate week_end (Sunday).
        3. Check if a report already exists for this (user_id, project_id, week_start).
        4. Create WeeklyReport in DRAFT status.
        5. Insert associated tasks and blockers, preserving their sort_order.
        """
        # 1. Verify project
        project = await self._project_repo.get_by_id(data.project_id)
        if not project or not project.is_active:
            raise NotFoundException("Project", str(data.project_id))

        # Verify assignment constraint if project has assignments
        if project.assigned_users and author.role != UserRole.MANAGER:
            if author.id not in [u.id for u in project.assigned_users]:
                raise ForbiddenException(
                    f"You are not assigned to project '{project.name}'."
                )

        # 2. Normalize week dates
        monday, sunday = self._normalize_week(data.week_start)

        # 3. Check for duplicates
        existing = await self._report_repo.get_by_user_and_week(
            user_id=author.id,
            project_id=data.project_id,
            week_start=monday,
        )
        if existing:
            raise DuplicateException(
                "WeeklyReport",
                "user/project/week",
                f"{author.full_name} / {project.name} / week of {monday}",
            )

        # 4. Initialize WeeklyReport
        new_report = WeeklyReport(
            user_id=author.id,
            project_id=data.project_id,
            week_start=monday,
            week_end=sunday,
            status=ReportStatus.DRAFT,
            hours_worked=data.hours_worked,
            notes=data.notes,
        )

        # 5. Populate Tasks (Completed & Planned)
        sort_idx = 0
        # Completed tasks
        for item in data.tasks_completed:
            task = ReportTask(
                task_type=TaskType.COMPLETED,
                description=item.description,
                sort_order=sort_idx,
            )
            new_report.tasks.append(task)
            sort_idx += 1

        # Planned tasks
        for item in data.tasks_planned:
            task = ReportTask(
                task_type=TaskType.PLANNED,
                description=item.description,
                sort_order=sort_idx,
            )
            new_report.tasks.append(task)
            sort_idx += 1

        # Populate Blockers
        blocker_idx = 0
        for item in data.blockers:
            blocker = ReportBlocker(
                description=item.description,
                is_resolved=item.is_resolved,
                sort_order=blocker_idx,
            )
            new_report.blockers.append(blocker)
            blocker_idx += 1

        # Save to database (BaseRepository handles flushing/refreshing)
        created_report = await self._report_repo.create(new_report)
        logger.info(
            "Report created: user=%s, project=%s, week=%s",
            author.email,
            project.name,
            monday,
        )

        # Return eager-loaded report structure
        return await self._report_repo.get_report_with_relations(created_report.id)

    async def update_report(
        self, report_id: uuid.UUID, data: ReportUpdate, current_user: User
    ) -> WeeklyReport:
        """
        Update an existing weekly report.

        Rules:
        1. Report must exist.
        2. Must be the author of the report to edit it.
        3. If already submitted, updating the report resets the status to DRAFT,
           requiring resubmission (user-friendly audit trail behavior).
        4. If tasks or blockers are provided, delete the old ones and insert the new ones
           to maintain complete synchronization.
        """
        # 1. Fetch report with relations
        report = await self._report_repo.get_report_with_relations(report_id)
        if not report:
            raise NotFoundException("WeeklyReport", str(report_id))

        # 2. Check ownership
        if report.user_id != current_user.id:
            raise ForbiddenException(
                "You do not have permission to modify this report."
            )

        # Prepare update dict
        update_data = {}

        # 3. Handle project update
        if data.project_id is not None and data.project_id != report.project_id:
            project = await self._project_repo.get_by_id(data.project_id)
            if not project or not project.is_active:
                raise NotFoundException("Project", str(data.project_id))
            # Verify assignment constraint if project has assignments
            if project.assigned_users and current_user.role != UserRole.MANAGER:
                if current_user.id not in [u.id for u in project.assigned_users]:
                    raise ForbiddenException(
                        f"You are not assigned to project '{project.name}'."
                    )
            update_data["project_id"] = data.project_id

        # 4. Handle week update
        if data.week_start is not None and data.week_start != report.week_start:
            monday, sunday = self._normalize_week(data.week_start)
            # Check duplicate unique constraint
            p_id = data.project_id or report.project_id
            existing = await self._report_repo.get_by_user_and_week(
                user_id=current_user.id,
                project_id=p_id,
                week_start=monday,
            )
            if existing and existing.id != report.id:
                raise DuplicateException(
                    "WeeklyReport",
                    "user/project/week",
                    f"week of {monday}",
                )
            update_data["week_start"] = monday
            update_data["week_end"] = sunday

        # 5. Handle simple fields
        if data.hours_worked is not None:
            update_data["hours_worked"] = data.hours_worked
        if data.notes is not None:
            update_data["notes"] = data.notes

        # 6. Reset status to DRAFT on edit (audit trail requirement)
        if report.status != ReportStatus.DRAFT:
            update_data["status"] = ReportStatus.DRAFT
            update_data["submitted_at"] = None
            logger.info("Report %s edited; resetting status to DRAFT", report_id)

        # 7. Batch replace tasks if provided
        if data.tasks_completed is not None or data.tasks_planned is not None:
            # Clear old tasks
            report.tasks.clear()
            sort_idx = 0

            # completed tasks (new or preserved)
            completed_source = (
                data.tasks_completed if data.tasks_completed is not None else []
            )
            for item in completed_source:
                task = ReportTask(
                    task_type=TaskType.COMPLETED,
                    description=item.description,
                    sort_order=sort_idx,
                )
                report.tasks.append(task)
                sort_idx += 1

            # planned tasks
            planned_source = (
                data.tasks_planned if data.tasks_planned is not None else []
            )
            for item in planned_source:
                task = ReportTask(
                    task_type=TaskType.PLANNED,
                    description=item.description,
                    sort_order=sort_idx,
                )
                report.tasks.append(task)
                sort_idx += 1

        # 8. Batch replace blockers if provided
        if data.blockers is not None:
            report.blockers.clear()
            blocker_idx = 0
            for item in data.blockers:
                blocker = ReportBlocker(
                    description=item.description,
                    is_resolved=item.is_resolved,
                    sort_order=blocker_idx,
                )
                report.blockers.append(blocker)
                blocker_idx += 1

        # Apply basic updates (which will flush and refresh columns)
        await self._report_repo.update(report, update_data)

        # Commit/Flush changes through the session (handled by transaction generator)
        return await self._report_repo.get_report_with_relations(report_id)

    async def submit_report(
        self, report_id: uuid.UUID, current_user: User
    ) -> WeeklyReport:
        """
        Submit a draft weekly report.

        Steps:
        1. Fetch report.
        2. Ensure ownership.
        3. Enforce that it is currently a DRAFT.
        4. Determine if it is late: If current local time (or server time) is strictly past
           the reporting week's Sunday 23:59:59 (i.e. Monday 00:00:00 local date), mark as LATE.
        5. Set submitted_at timestamp.
        """
        report = await self._report_repo.get_report_with_relations(report_id)
        if not report:
            raise NotFoundException("WeeklyReport", str(report_id))

        if report.user_id != current_user.id:
            raise ForbiddenException(
                "You do not have permission to submit this report."
            )

        if report.status != ReportStatus.DRAFT:
            raise BadRequestException("Report is already submitted.")

        # Determine late submission:
        # Compare current date to the week's Sunday. If today > week_end (Sunday), it is late.
        today = date.today()
        if today > report.week_end:
            status = ReportStatus.LATE
            logger.info(
                "Report %s submitted LATE (today %s > end %s)",
                report_id,
                today,
                report.week_end,
            )
        else:
            status = ReportStatus.SUBMITTED
            logger.info("Report %s submitted on time", report_id)

        update_payload = {
            "status": status,
            "submitted_at": datetime.now(timezone.utc).replace(tzinfo=None),
        }

        await self._report_repo.update(report, update_payload)

        # 6. semantic search indexing of submitted report
        updated_report = await self._report_repo.get_report_with_relations(report_id)
        if updated_report:
            import asyncio

            try:
                # Resolve task types cleanly (checking string or enum matches)
                tasks_completed = []
                tasks_planned = []
                for t in updated_report.tasks:
                    t_type = getattr(t.task_type, "value", str(t.task_type)).upper()
                    if t_type == "COMPLETED":
                        tasks_completed.append(t.description)
                    elif t_type == "PLANNED":
                        tasks_planned.append(t.description)

                report_dict = {
                    "user_id": str(updated_report.user_id),
                    "user_name": (
                        updated_report.user.full_name
                        if updated_report.user
                        else "Unknown Member"
                    ),
                    "project_name": (
                        updated_report.project.name
                        if updated_report.project
                        else "Uncategorized"
                    ),
                    "week_start": str(updated_report.week_start),
                    "week_end": str(updated_report.week_end),
                    "hours_worked": updated_report.hours_worked,
                    "notes": updated_report.notes,
                    "tasks_completed": tasks_completed,
                    "tasks_planned": tasks_planned,
                    "blockers": [
                        {"description": b.description, "is_resolved": b.is_resolved}
                        for b in updated_report.blockers
                    ],
                }

                # Execute fire-and-forget indexing task in event loop
                asyncio.create_task(
                    self._vector_service.upsert_report(
                        str(updated_report.id), report_dict
                    )
                )
            except Exception as index_err:
                logger.error(
                    "Failed to enqueue vector index task for report %s: %s",
                    report_id,
                    str(index_err),
                )

        return updated_report

    async def get_report_detail(
        self, report_id: uuid.UUID, current_user: User
    ) -> WeeklyReport:
        """
        Get full report details.

        Enforces role-based permissions:
        - TEAM_MEMBER can only view their own reports.
        - MANAGER can view any user's reports.
        """
        report = await self._report_repo.get_report_with_relations(report_id)
        if not report:
            raise NotFoundException("WeeklyReport", str(report_id))

        # Check authorization
        if current_user.role != UserRole.MANAGER and report.user_id != current_user.id:
            raise ForbiddenException("You do not have permission to view this report.")

        return report

    async def get_user_reports(
        self, current_user: User, page: int = 1, page_size: int = 20
    ) -> PaginatedResponse[ReportRead]:
        """
        Retrieve paginated reports for the current user.
        """
        skip = (page - 1) * page_size
        reports, total = await self._report_repo.get_user_reports(
            user_id=current_user.id, skip=skip, limit=page_size
        )

        total_pages = (total + page_size - 1) // page_size

        return PaginatedResponse(
            items=[ReportRead.model_validate(r) for r in reports],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def get_team_reports(
        self,
        week_start: date | None = None,
        week_end: date | None = None,
        user_id: uuid.UUID | None = None,
        project_id: uuid.UUID | None = None,
        status: ReportStatus | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> PaginatedResponse[ReportRead]:
        """
        Manager only: Retrieve paginated reports with dynamic query filters.
        """
        skip = (page - 1) * page_size
        reports, total = await self._report_repo.get_team_reports(
            week_start=week_start,
            week_end=week_end,
            user_id=user_id,
            project_id=project_id,
            status=status,
            skip=skip,
            limit=page_size,
        )

        total_pages = (total + page_size - 1) // page_size

        return PaginatedResponse(
            items=[ReportRead.model_validate(r) for r in reports],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def delete_report(self, report_id: uuid.UUID, current_user: User) -> None:
        """
        Delete a report. Can only delete own report, and only if it's currently a DRAFT.
        """
        report = await self._report_repo.get_by_id(report_id)
        if not report:
            raise NotFoundException("WeeklyReport", str(report_id))

        if report.user_id != current_user.id:
            raise ForbiddenException(
                "You do not have permission to delete this report."
            )

        if report.status != ReportStatus.DRAFT:
            raise BadRequestException("You can only delete reports in DRAFT status.")

        await self._report_repo.delete(report)
        logger.info("Report deleted: %s", report_id)
