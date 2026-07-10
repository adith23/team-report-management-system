"""
Pydantic schemas / DTOs — validation layer.

Re-exports all schemas for convenient imports:
    from app.schemas import UserRead, ReportCreate, ...
"""

# Common
from app.schemas.common import MessageResponse, PaginatedResponse  # noqa: F401

# Auth
from app.schemas.auth import LoginRequest, RegisterRequest, TokenPayload  # noqa: F401

# User
from app.schemas.user import UserRead, UserRoleUpdate, UserUpdate  # noqa: F401

# Report
from app.schemas.report import (  # noqa: F401
    BlockerItemCreate,
    BlockerItemRead,
    ReportCreate,
    ReportRead,
    ReportUpdate,
    TaskItemCreate,
    TaskItemRead,
)

# Project
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate, ProjectAssignmentRequest  # noqa: F401

# Dashboard
from app.schemas.dashboard import (  # noqa: F401
    DashboardMetrics,
    RecentActivity,
    SubmissionStatusItem,
    TaskTrendPoint,
    WorkloadDistribution,
)

__all__ = [
    # Common
    "PaginatedResponse",
    "MessageResponse",
    # Auth
    "RegisterRequest",
    "LoginRequest",
    "TokenPayload",
    # User
    "UserRead",
    "UserUpdate",
    "UserRoleUpdate",
    # Report
    "ReportCreate",
    "ReportUpdate",
    "ReportRead",
    "TaskItemCreate",
    "TaskItemRead",
    "BlockerItemCreate",
    "BlockerItemRead",
    # Project
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectRead",
    "ProjectAssignmentRequest",
    # Dashboard
    "DashboardMetrics",
    "SubmissionStatusItem",
    "TaskTrendPoint",
    "WorkloadDistribution",
    "RecentActivity",
]
