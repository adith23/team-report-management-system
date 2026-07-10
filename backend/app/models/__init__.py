"""
SQLAlchemy ORM models — database layer.

This module re-exports all models so they can be imported from
a single location. This is critical for:
1. Alembic autogenerate — all models must be imported so their
   table metadata is registered on Base.metadata.
2. Convenience — `from app.models import User, Project, ...`
"""

from app.models.base import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.report import WeeklyReport  # noqa: F401
from app.models.report_task import ReportTask  # noqa: F401
from app.models.report_blocker import ReportBlocker  # noqa: F401
from app.models.user_project import UserProjectAssignment  # noqa: F401

__all__ = [
    "Base",
    "User",
    "Project",
    "WeeklyReport",
    "ReportTask",
    "ReportBlocker",
    "UserProjectAssignment",
]
