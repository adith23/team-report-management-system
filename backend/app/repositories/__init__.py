"""
Repository layer — data access abstraction (Repository Pattern).

Re-exports all repositories for convenient imports:
    from app.repositories import UserRepository, ReportRepository, ...
"""

from app.repositories.base import BaseRepository  # noqa: F401
from app.repositories.user_repository import UserRepository  # noqa: F401
from app.repositories.project_repository import ProjectRepository  # noqa: F401
from app.repositories.report_repository import ReportRepository  # noqa: F401

__all__ = [
    "BaseRepository",
    "UserRepository",
    "ProjectRepository",
    "ReportRepository",
]
