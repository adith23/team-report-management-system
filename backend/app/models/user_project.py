"""
User-Project Assignment Association Table/Model.

Enables managers to assign multiple team members to multiple projects (many-to-many).
"""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDPrimaryKeyMixin


class UserProjectAssignment(Base, UUIDPrimaryKeyMixin):
    """
    Association model mapping users to projects.
    """

    __tablename__ = "user_project_assignments"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "project_id",
            name="uq_user_project_assignment",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="The user assigned to the project",
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="The project the user is assigned to",
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp when assignment was made",
    )
