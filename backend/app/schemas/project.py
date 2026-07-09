"""
Project schemas (DTOs).

Request and response models for project/category CRUD operations.
Projects are created by managers and used by all users when
submitting weekly reports.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    """
    Project creation request.

    Managers use this to add new project/category tags.
    color_hex defaults to a pleasant indigo if not specified.
    """

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        examples=["Client A"],
    )
    description: str | None = Field(
        default=None,
        max_length=1000,
        examples=["Main client project for Q3"],
    )
    color_hex: str = Field(
        default="#6366f1",
        pattern=r"^#[0-9a-fA-F]{6}$",
        examples=["#6366f1"],
        description="Hex color for chart visualization",
    )


class ProjectUpdate(BaseModel):
    """
    Project update request.

    All fields are optional — only provided fields are updated.
    """

    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    color_hex: str | None = Field(
        default=None,
        pattern=r"^#[0-9a-fA-F]{6}$",
    )


class ProjectRead(BaseModel):
    """
    Project response schema.

    Returned by all project-related endpoints.
    Includes created_by UUID for admin reference.
    """

    id: uuid.UUID
    name: str
    description: str | None
    color_hex: str
    is_active: bool
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
