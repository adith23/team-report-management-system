"""
Dashboard schemas (DTOs).

Response models for the manager's analytics dashboard.
These schemas shape the data for frontend chart components
(Recharts) and metric cards.
"""

import uuid
from datetime import date, datetime

from pydantic import BaseModel


class DashboardMetrics(BaseModel):
    """
    Summary metrics for the dashboard header cards.

    Displayed as 4 prominent metric cards at the top of
    the manager's dashboard.
    """

    total_reports_this_week: int
    submission_compliance_rate: float  # 0.0 to 100.0
    open_blockers_count: int
    total_team_members: int


class SubmissionStatusItem(BaseModel):
    """
    Per-member submission status for a given week.

    Renders as a table showing each team member's
    report submission state.
    """

    user_id: uuid.UUID
    user_full_name: str
    status: str  # "submitted" | "pending" | "late"
    submitted_at: datetime | None


class TaskTrendPoint(BaseModel):
    """
    Single data point for the tasks-completed-over-time chart.

    The frontend plots these as a line chart (Recharts LineChart)
    with week_start on the X-axis and count on the Y-axis.
    """

    week_start: date
    tasks_completed_count: int


class WorkloadDistribution(BaseModel):
    """
    Task distribution per project for pie/bar charts.

    The frontend renders this as a pie chart (Recharts PieChart)
    with each slice colored by project_color.
    """

    project_name: str
    project_color: str
    task_count: int


class RecentActivity(BaseModel):
    """
    Activity feed item for the dashboard.

    Shows recent report submissions, updates, and creations
    in a timeline format.
    """

    report_id: uuid.UUID
    user_full_name: str
    project_name: str
    action: str  # "submitted" | "updated" | "created"
    timestamp: datetime
