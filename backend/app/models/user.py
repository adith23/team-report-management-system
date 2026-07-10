"""
User ORM model.

Represents a registered user of the system. Each user has a role
(TEAM_MEMBER or MANAGER) that determines their access level.

Relationships:
- One-to-many with WeeklyReport (a user submits many reports)
- One-to-many with Project (a manager creates projects)
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import UserRole
from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    User account model.

    Stores authentication credentials and role-based authorization level.
    The `hashed_password` field stores an Argon2 hash — never plain text.
    """

    __tablename__ = "users"

    # ── Profile ──────────────────────────────────────────────────
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique email address used for login",
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="User's display name",
    )

    # ── Authentication ───────────────────────────────────────────
    hashed_password: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
        comment="Argon2-hashed password",
    )

    # ── Authorization ────────────────────────────────────────────
    role: Mapped[UserRole] = mapped_column(
        default=UserRole.TEAM_MEMBER,
        nullable=False,
        index=True,
        comment="User role: TEAM_MEMBER or MANAGER",
    )

    # ── Status ───────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Soft-delete flag — inactive users cannot login",
    )

    # ── Relationships ────────────────────────────────────────────
    reports: Mapped[list["WeeklyReport"]] = relationship(
        "WeeklyReport",
        back_populates="user",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    created_projects: Mapped[list["Project"]] = relationship(
        "Project",
        back_populates="creator",
        lazy="selectin",
    )
    assigned_projects: Mapped[list["Project"]] = relationship(
        "Project",
        secondary="user_project_assignments",
        back_populates="assigned_users",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
