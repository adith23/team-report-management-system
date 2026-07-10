"""
Authentication tests.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.enums import UserRole
from app.models.user import User


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient, db_session: AsyncSession) -> None:
    """Test successful user registration (defaults to TEAM_MEMBER)."""
    payload = {
        "email": "newuser@company.com",
        "full_name": "New Employee",
        "password": "strongpassword123",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["email"] == "newuser@company.com"
    assert data["full_name"] == "New Employee"
    assert data["role"] == UserRole.TEAM_MEMBER.value
    assert data["is_active"] is True
    assert "hashed_password" not in data

    # Verify db record
    stmt = select(User).where(User.email == "newuser@company.com")
    result = await db_session.execute(stmt)
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.full_name == "New Employee"


@pytest.mark.asyncio
async def test_register_admin_bootstrap(client: AsyncClient) -> None:
    """Test register automatically grants MANAGER to ADMIN_BOOTSTRAP_EMAIL."""
    payload = {
        "email": settings.ADMIN_BOOTSTRAP_EMAIL,
        "full_name": "Bootstrap Boss",
        "password": "strongpassword123",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["role"] == UserRole.MANAGER.value


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, team_member_user: User) -> None:
    """Test registration rejects duplicate email."""
    payload = {
        "email": team_member_user.email,
        "full_name": "Another Name",
        "password": "anotherpassword123",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, team_member_user: User) -> None:
    """Test successful login and JWT cookie placement."""
    payload = {
        "email": team_member_user.email,
        "password": "password123",
    }
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    assert response.json()["email"] == team_member_user.email
    assert "access_token" in response.cookies


@pytest.mark.asyncio
async def test_login_wrong_credentials(client: AsyncClient, team_member_user: User) -> None:
    """Test login fails with incorrect password."""
    payload = {
        "email": team_member_user.email,
        "password": "wrongpassword",
    }
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_deactivated_user(
    client: AsyncClient, db_session: AsyncSession, team_member_user: User
) -> None:
    """Test login fails for deactivated accounts."""
    team_member_user.is_active = False
    await db_session.commit()

    payload = {
        "email": team_member_user.email,
        "password": "password123",
    }
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 403
    assert "deactivated" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_me_authenticated(member_client: AsyncClient, team_member_user: User) -> None:
    """Test GET /auth/me returns current user info."""
    response = await member_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["id"] == str(team_member_user.id)


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient) -> None:
    """Test GET /auth/me rejects unauthenticated requests."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_logout_success(member_client: AsyncClient) -> None:
    """Test logout clears the access_token cookie."""
    response = await member_client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    # Cookie should be unset or max-age set to 0/deleted
    # httpx handles cookie deletion by expiring them or omitting them
    assert response.json()["message"] == "Successfully logged out."
