"""
Project / Category ORM model.

Represents a project or work category that reports can be tagged with.
Examples: "Client A", "Internal Tooling", "R&D", "Marketing".

Managers create and manage projects. All users see them in the
report form dropdown. Soft-deleted projects are hidden from the
dropdown but preserved for historical report integrity.

Relationships:
- Many-to-one with User (creator)
- One-to-many with WeeklyReport (a project has many reports)
"""

from sqlalchemy import String, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

# UUID type import for foreign key typing
import uuid


class Project(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Project / category model.

    Used to categorize weekly reports by work area.
    Includes a color_hex field for frontend chart color-coding.
    """

    __tablename__ = "projects"

    # ── Project Info ─────────────────────────────────────────────
    name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique project/category name",
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Optional project description",
    )
    color_hex: Mapped[str] = mapped_column(
        String(7),
        default="#6366f1",
        nullable=False,
        comment="Hex color for chart visualization (e.g. #6366f1)",
    )

    # ── Status ───────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Soft-delete flag — inactive projects hidden from dropdown",
    )

    # ── Foreign Keys ─────────────────────────────────────────────
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        comment="Manager who created this project",
    )

    # ── Relationships ────────────────────────────────────────────
    creator: Mapped["User"] = relationship(
        "User",
        back_populates="created_projects",
        lazy="selectin",
    )
    reports: Mapped[list["WeeklyReport"]] = relationship(
        "WeeklyReport",
        back_populates="project",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name={self.name})>"
