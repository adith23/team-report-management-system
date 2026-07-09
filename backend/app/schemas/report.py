"""
Report schemas (DTOs).

Request and response models for weekly report CRUD operations.
Includes nested schemas for tasks and blockers that form the
structured report form.

The report structure is fixed and identical for every user —
same fields, same order — ensuring team-wide consistency.
"""

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.core.enums import ReportStatus, TaskType


# ── Nested Item Schemas ──────────────────────────────────────────
class TaskItemCreate(BaseModel):
    """
    Task item for report creation/update.

    Represents a single completed or planned task.
    The frontend sends an array of these for each category.
    """

    description: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        examples=["Implemented user authentication module"],
    )
    task_type: TaskType


class BlockerItemCreate(BaseModel):
    """
    Blocker item for report creation/update.

    Represents a challenge or impediment encountered during the week.
    """

    description: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        examples=["Waiting for API docs from Team B"],
    )
    is_resolved: bool = False


class TaskItemRead(BaseModel):
    """Task item as returned in report responses."""

    id: uuid.UUID
    description: str
    task_type: TaskType
    sort_order: int

    model_config = {"from_attributes": True}


class BlockerItemRead(BaseModel):
    """Blocker item as returned in report responses."""

    id: uuid.UUID
    description: str
    is_resolved: bool
    sort_order: int

    model_config = {"from_attributes": True}


# ── Report Schemas ───────────────────────────────────────────────
class ReportCreate(BaseModel):
    """
    Weekly report creation request.

    The frontend submits this structured form with:
    - Week selection (normalized to Monday by backend)
    - Project/category selection
    - Lists of completed tasks, planned tasks, and blockers
    - Optional hours worked and notes

    Validation:
    - At least one completed or planned task required.
    - hours_worked must be 0-168 (hours in a week) if provided.
    - notes max 5000 characters.
    """

    project_id: uuid.UUID
    week_start: date = Field(
        ...,
        description="Start of reporting week (backend normalizes to Monday)",
    )
    tasks_completed: list[TaskItemCreate] = Field(
        default_factory=list,
        description="Tasks completed during this week",
    )
    tasks_planned: list[TaskItemCreate] = Field(
        default_factory=list,
        description="Tasks planned for next week",
    )
    blockers: list[BlockerItemCreate] = Field(
        default_factory=list,
        description="Blockers/challenges encountered",
    )
    hours_worked: Decimal | None = Field(
        default=None,
        ge=0,
        le=168,
        description="Hours worked (optional, 0-168)",
    )
    notes: str | None = Field(
        default=None,
        max_length=5000,
        description="Optional notes or links",
    )


class ReportUpdate(BaseModel):
    """
    Weekly report update request.

    All fields are optional — only provided fields are updated.
    Tasks and blockers are replaced as a batch (delete old + insert new).
    """

    project_id: uuid.UUID | None = None
    week_start: date | None = None
    tasks_completed: list[TaskItemCreate] | None = None
    tasks_planned: list[TaskItemCreate] | None = None
    blockers: list[BlockerItemCreate] | None = None
    hours_worked: Decimal | None = Field(default=None, ge=0, le=168)
    notes: str | None = Field(default=None, max_length=5000)


class ReportRead(BaseModel):
    """
    Full report response with all nested data.

    Includes denormalized fields (user_full_name, project_name)
    to avoid N+1 queries on the frontend.
    """

    id: uuid.UUID
    user_id: uuid.UUID
    user_full_name: str
    project_id: uuid.UUID
    project_name: str
    week_start: date
    week_end: date
    status: ReportStatus
    tasks_completed: list[TaskItemRead]
    tasks_planned: list[TaskItemRead]
    blockers: list[BlockerItemRead]
    hours_worked: Decimal | None
    notes: str | None
    submitted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
