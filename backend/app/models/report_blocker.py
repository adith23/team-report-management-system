"""
ReportBlocker ORM model.

Represents a blocker or challenge reported within a weekly report.
Includes an `is_resolved` flag that enables tracking open blockers
across the entire team for the manager's dashboard metrics.

Using a separate table (instead of JSON blobs) enables:
- SQL aggregation: COUNT open blockers across all reports
- Per-blocker resolution tracking
- Sorting via sort_order to preserve user's ordering

Relationships:
- Many-to-one with WeeklyReport (cascade delete)
"""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, Boolean, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDPrimaryKeyMixin


class ReportBlocker(Base, UUIDPrimaryKeyMixin):
    """
    Individual blocker/challenge entry within a weekly report.

    Each report can have zero or more blockers. The `is_resolved`
    flag is used by the dashboard to count open blockers team-wide.
    """

    __tablename__ = "report_blockers"

    # Foreign Key
    report_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("weekly_reports.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent report this blocker belongs to",
    )

    # Blocker Data
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Description of the blocker or challenge",
    )
    is_resolved: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether this blocker has been resolved",
    )

    # Ordering
    sort_order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Preserves user's ordering within the form",
    )

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        nullable=False,
    )

    # Relationship
    report: Mapped["WeeklyReport"] = relationship(
        "WeeklyReport",
        back_populates="blockers",
    )

    def __repr__(self) -> str:
        return (
            f"<ReportBlocker(id={self.id}, resolved={self.is_resolved}, "
            f"order={self.sort_order})>"
        )
