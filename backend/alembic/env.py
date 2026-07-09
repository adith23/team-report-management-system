"""
Alembic environment configuration for async SQLAlchemy.

This file configures Alembic to:
1. Load the database URL from app.config.settings (single source of truth).
2. Import all ORM models so autogenerate can detect schema changes.
3. Run migrations using an async engine (asyncpg driver).

Usage:
    alembic revision --autogenerate -m "description"
    alembic upgrade head
    alembic downgrade -1
"""

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.config import settings

# Import the declarative Base so Alembic sees all registered models.
from app.models.base import Base  # noqa: F401

# Import all models so their table metadata is registered on Base.
# This uses the re-export from app/models/__init__.py.
from app.models import User, Project, WeeklyReport, ReportTask, ReportBlocker  # noqa: F401


# ── Alembic Config ───────────────────────────────────────────────
# The Alembic Config object provides access to alembic.ini values.
config = context.config

# Set the SQLAlchemy URL from our application settings.
# This overrides any value in alembic.ini, ensuring the .env file
# is the single source of truth for database configuration.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the alembic.ini file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# The target metadata for autogenerate support.
# Alembic compares this metadata against the database schema
# to generate migration scripts automatically.
target_metadata = Base.metadata


# ── Offline Migrations ───────────────────────────────────────────
def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    Generates SQL scripts without connecting to the database.
    Useful for reviewing migration SQL before applying it.

    Usage: alembic upgrade head --sql
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# ── Online Migrations (Async) ────────────────────────────────────
def do_run_migrations(connection: Connection) -> None:
    """Run migrations within a database connection context."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Create an async engine and run migrations.

    Uses NullPool to avoid connection leaks during migrations
    (migrations are short-lived, don't need connection pooling).
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode (async).

    Creates an async engine, connects to the database,
    and applies migrations within a transaction.
    """
    asyncio.run(run_async_migrations())


# ── Entry Point ──────────────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
