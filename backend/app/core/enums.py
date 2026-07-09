"""
Application-wide enumeration types.

These enums are the single source of truth for categorical values
used across models, schemas, services, and routers. They mirror
the PostgreSQL ENUM types defined in the database.

Using str-based enums ensures JSON serialization works seamlessly
with both Pydantic and SQLAlchemy.
"""

from enum import Enum


class UserRole(str, Enum):
    """
    User authorization levels.

    TEAM_MEMBER: Default role — can create and manage own weekly reports.
    MANAGER:     Elevated role — can view all team reports, manage projects,
                 manage users, and access the analytics dashboard.
    """

    TEAM_MEMBER = "TEAM_MEMBER"
    MANAGER = "MANAGER"


class ReportStatus(str, Enum):
    """
    Weekly report lifecycle states.

    DRAFT:     Report created but not yet submitted. Editable.
    SUBMITTED: Report finalized and submitted within the deadline.
    LATE:      Report submitted after the reporting week ended.
    """

    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    LATE = "LATE"


class TaskType(str, Enum):
    """
    Categorization of tasks within a weekly report.

    COMPLETED: Tasks finished during the reporting week.
    PLANNED:   Tasks planned for the upcoming week.
    """

    COMPLETED = "COMPLETED"
    PLANNED = "PLANNED"
