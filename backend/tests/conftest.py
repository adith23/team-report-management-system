"""
Pytest configuration and shared fixtures.

Sets up:
- Self-contained, in-memory async SQLite database for fast unit testing.
- Database schema generation on startup.
- Dependency overrides to swap the production engine with the test engine.
- HTTPX AsyncClient for making test HTTP requests.
- Fixtures for authenticated Managers, Team Members, and test Project tags.
"""

import asyncio
from datetime import date
from collections.abc import AsyncGenerator, Generator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import get_db
from app.core.enums import UserRole
from app.core.security import hash_password, create_access_token
from app.main import app
from app.models.base import Base
from app.models.user import User
from app.models.project import Project

# ── Test Database URL ────────────────────────────────────────────
# In-memory async SQLite database. Avoids Neon/Postgres dependencies for tests.
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

test_session_factory = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# ── Pytest Asyncio Configuration ─────────────────────────────────
@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create a session-scoped event loop for async fixtures."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# ── Database Schema Setup ────────────────────────────────────────
@pytest_asyncio.fixture(scope="session", autouse=True)
async def initialize_db_schema() -> AsyncGenerator[None, None]:
    """
    Generate all tables before running tests.
    """
    async with test_engine.begin() as conn:
        # Create all tables defined in app.models
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        # Drop all tables after the test session concludes
        await conn.run_sync(Base.metadata.drop_all)


# ── Database Session Fixture ─────────────────────────────────────
@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Yields an independent transaction-wrapped session per test.
    Rolls back any changes made during the test.
    """
    async with test_session_factory() as session:
        async with session.begin():
            yield session
        # Transaction is rolled back automatically outside the 'begin' context


# ── Dependency Override ──────────────────────────────────────────
@pytest.fixture(autouse=True)
def override_db_dependency(db_session: AsyncSession) -> None:
    """
    Injects the test session into FastAPI dependencies.
    """
    async def _get_test_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = _get_test_db


# ── Client Fixtures ──────────────────────────────────────────────
@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Unauthenticated HTTPX async client.
    """
    async with AsyncClient(transport=ASGITransport(app), base_url="http://test") as ac:
        yield ac


# ── User Seed Fixtures ───────────────────────────────────────────
@pytest_asyncio.fixture
async def team_member_user(db_session: AsyncSession) -> User:
    """Create a standard TEAM_MEMBER user."""
    user = User(
        email="member@company.com",
        full_name="Team Member John",
        hashed_password=hash_password("password123"),
        role=UserRole.TEAM_MEMBER,
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest_asyncio.fixture
async def manager_user(db_session: AsyncSession) -> User:
    """Create a MANAGER user."""
    user = User(
        email="manager@company.com",
        full_name="Manager Boss",
        hashed_password=hash_password("password123"),
        role=UserRole.MANAGER,
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    return user


# ── Authenticated Clients ────────────────────────────────────────
@pytest_asyncio.fixture
async def member_client(team_member_user: User) -> AsyncGenerator[AsyncClient, None]:
    """
    HTTPX async client authenticated as a TEAM_MEMBER.
    Injects the JWT token inside the request cookies.
    """
    token = create_access_token(team_member_user.id, team_member_user.role)
    cookies = {"access_token": token}
    async with AsyncClient(
        transport=ASGITransport(app), base_url="http://test", cookies=cookies
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def manager_client(manager_user: User) -> AsyncGenerator[AsyncClient, None]:
    """
    HTTPX async client authenticated as a MANAGER.
    Injects the JWT token inside the request cookies.
    """
    token = create_access_token(manager_user.id, manager_user.role)
    cookies = {"access_token": token}
    async with AsyncClient(
        transport=ASGITransport(app), base_url="http://test", cookies=cookies
    ) as ac:
        yield ac


# ── Seed Data Fixtures ───────────────────────────────────────────
@pytest_asyncio.fixture
async def active_project(db_session: AsyncSession, manager_user: User) -> Project:
    """Create a default active project category."""
    project = Project(
        name="Client Alpha",
        description="Core test project",
        color_hex="#6366f1",
        is_active=True,
        created_by=manager_user.id,
    )
    db_session.add(project)
    await db_session.flush()
    return project
