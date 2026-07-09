"""
WeeklyReport ORM model.

Represents a single weekly report submitted by a team member for a
specific project/category. Each report covers a Monday–Sunday week
and contains tasks, blockers, optional hours, and notes.

Lifecycle: DRAFT → SUBMITTED (or LATE if past deadline).

Constraints:
- One report per user per project per week (composite unique).
- week_end must be after week_start.

Relationships:
- Many-to-one with User (author)
- Many-to-one with Project (category)
- One-to-many with ReportTask (completed + planned tasks)
- One-to-many with ReportBlocker (challenges)
"""

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    ForeignKey,
    Numeric,
    Text,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import ReportStatus
from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class WeeklyReport(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Weekly report model.

    Fixed-structure report that every team member fills out weekly.
    All users have the same fields in the same order — ensuring
    consistency and comparability across the team.
    """

    __tablename__ = "weekly_reports"

    # ── Table-level Constraints ──────────────────────────────────
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "project_id",
            "week_start",
            name="uq_user_project_week",
        ),
        CheckConstraint(
            "week_end > week_start",
            name="ck_week_range",
        ),
        CheckConstraint(
            "hours_worked IS NULL OR hours_worked >= 0",
            name="ck_hours_non_negative",
        ),
    )

    # ── Foreign Keys ─────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
        comment="Author of this report",
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
        index=True,
        comment="Project/category this report is for",
    )

    # ── Week Range ───────────────────────────────────────────────
    week_start: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
        comment="Monday of the reporting week",
    )
    week_end: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        comment="Sunday of the reporting week",
    )

    # ── Report Status ────────────────────────────────────────────
    status: Mapped[ReportStatus] = mapped_column(
        default=ReportStatus.DRAFT,
        nullable=False,
        index=True,
        comment="Report lifecycle state: DRAFT, SUBMITTED, or LATE",
    )

    # ── Optional Fields ──────────────────────────────────────────
    hours_worked: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=5, scale=2),
        nullable=True,
        comment="Hours worked during this week (optional, 0-168)",
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Optional notes or links",
    )

    # ── Submission Tracking ──────────────────────────────────────
    submitted_at: Mapped[datetime | None] = mapped_column(
        nullable=True,
        comment="Timestamp when report was submitted (null if draft)",
    )

    # ── Relationships ────────────────────────────────────────────
    user: Mapped["User"] = relationship(
        "User",
        back_populates="reports",
        lazy="selectin",
    )
    project: Mapped["Project"] = relationship(
        "Project",
        back_populates="reports",
        lazy="selectin",
    )
    tasks: Mapped[list["ReportTask"]] = relationship(
        "ReportTask",
        back_populates="report",
        lazy="selectin",
        cascade="all, delete-orphan",
        order_by="ReportTask.sort_order",
    )
    blockers: Mapped[list["ReportBlocker"]] = relationship(
        "ReportBlocker",
        back_populates="report",
        lazy="selectin",
        cascade="all, delete-orphan",
        order_by="ReportBlocker.sort_order",
    )

    def __repr__(self) -> str:
        return (
            f"<WeeklyReport(id={self.id}, user_id={self.user_id}, "
            f"week={self.week_start}, status={self.status})>"
        )
