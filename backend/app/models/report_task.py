"""
ReportTask ORM model.

Represents an individual task entry within a weekly report.
Tasks are categorized as either COMPLETED (done this week) or
PLANNED (intended for next week) via the `task_type` enum.

Using a separate table (instead of JSON blobs) enables:
- SQL aggregation for dashboard charts (COUNT tasks per week)
- Proper validation at the database level
- Sorting via sort_order to preserve user's ordering

Relationships:
- Many-to-one with WeeklyReport (cascade delete)
"""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import TaskType
from app.models.base import Base, UUIDPrimaryKeyMixin


class ReportTask(Base, UUIDPrimaryKeyMixin):
    """
    Individual task entry within a weekly report.

    Each report can have multiple completed tasks and multiple
    planned tasks, distinguished by the `task_type` field.
    """

    __tablename__ = "report_tasks"

    # ── Foreign Key ──────────────────────────────────────────────
    report_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("weekly_reports.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent report this task belongs to",
    )

    # ── Task Data ────────────────────────────────────────────────
    task_type: Mapped[TaskType] = mapped_column(
        nullable=False,
        comment="COMPLETED (done this week) or PLANNED (next week)",
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Task description text",
    )

    # ── Ordering ─────────────────────────────────────────────────
    sort_order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Preserves user's ordering within the form",
    )

    # ── Timestamp ────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        nullable=False,
    )

    # ── Relationship ─────────────────────────────────────────────
    report: Mapped["WeeklyReport"] = relationship(
        "WeeklyReport",
        back_populates="tasks",
    )

    def __repr__(self) -> str:
        return (
            f"<ReportTask(id={self.id}, type={self.task_type}, "
            f"order={self.sort_order})>"
        )
