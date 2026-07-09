"""
Async database engine and session configuration.

Provides:
- Async SQLAlchemy engine with connection pooling.
- Async session factory for dependency injection.
- get_db() async generator for FastAPI's Depends().

Connection pooling settings are tuned for a small-to-medium
team application (~20-50 concurrent users).
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

# ── Async Engine ─────────────────────────────────────────────────
# The engine manages the connection pool to PostgreSQL.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL statements in debug mode
    pool_size=20,         # Max persistent connections
    max_overflow=10,      # Extra connections allowed under load
    pool_pre_ping=True,   # Verify connections before use (handles disconnects)
    pool_recycle=3600,    # Recycle connections after 1 hour
)

# ── Async Session Factory ────────────────────────────────────────
# Creates AsyncSession instances bound to the engine.
# expire_on_commit=False prevents lazy-loading issues after commit.
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# ── Dependency ───────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session per request.

    Uses an async context manager to ensure the session is properly
    closed after the request completes. The session is wrapped in a
    transaction that auto-commits on success or rolls back on exception.

    Usage in routers:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
