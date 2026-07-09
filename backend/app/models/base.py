"""
SQLAlchemy declarative base and common model mixins.

Provides:
- Base: The declarative base class for all ORM models.
- UUIDPrimaryKeyMixin: Adds a UUID primary key column.
- TimestampMixin: Adds created_at and updated_at columns.

All models in the application inherit from Base and use these
mixins to ensure consistent column definitions across tables.
"""

import uuid
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
)


class Base(DeclarativeBase):
    """
    Declarative base for all SQLAlchemy ORM models.

    All model classes must inherit from this base.
    Alembic uses Base.metadata for autogenerate migrations.
    """

    pass


class UUIDPrimaryKeyMixin:
    """
    Mixin that adds a UUID primary key column.

    Uses Python-generated UUIDs (uuid4) as defaults.
    UUIDs prevent enumeration attacks and are safe for
    distributed systems — no sequential ID exposure in APIs.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )


class TimestampMixin:
    """
    Mixin that adds created_at and updated_at timestamp columns.

    - created_at: Set once at row creation via server-side default.
    - updated_at: Automatically updated on every row modification
      via both server_default (initial) and onupdate (subsequent).
    """

    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
