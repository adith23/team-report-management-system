"""
User management endpoints tests.
"""

import pytest
import uuid
from httpx import AsyncClient

from app.core.enums import UserRole
from app.models.user import User


@pytest.mark.asyncio
async def test_list_users_manager_success(
    manager_client: AsyncClient, team_member_user: User, manager_user: User
) -> None:
    """Test manager can successfully list users."""
    response = await manager_client.get("/api/v1/users/")
    assert response.status_code == 200

    data = response.json()
    assert data["total"] >= 2
    assert len(data["items"]) >= 2
    assert "role" in data["items"][0]
    assert "is_active" in data["items"][0]


@pytest.mark.asyncio
async def test_list_users_member_forbidden(member_client: AsyncClient) -> None:
    """Test team members are forbidden from listing users (403)."""
    response = await member_client.get("/api/v1/users/")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_user_role_manager_success(
    manager_client: AsyncClient, team_member_user: User
) -> None:
    """Test manager can promote a team member to manager."""
    payload = {"role": UserRole.MANAGER.value}
    response = await manager_client.patch(
        f"/api/v1/users/{team_member_user.id}/role", json=payload
    )
    assert response.status_code == 200
    assert response.json()["role"] == UserRole.MANAGER.value


@pytest.mark.asyncio
async def test_update_user_role_self_promotion_forbidden(
    manager_client: AsyncClient, manager_user: User
) -> None:
    """Test managers cannot alter their own role (400)."""
    payload = {"role": UserRole.TEAM_MEMBER.value}
    response = await manager_client.patch(
        f"/api/v1/users/{manager_user.id}/role", json=payload
    )
    assert response.status_code == 400
    assert "change your own role" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_user_role_member_forbidden(
    member_client: AsyncClient, team_member_user: User
) -> None:
    """Test team members cannot change user roles (403)."""
    payload = {"role": UserRole.MANAGER.value}
    response = await member_client.patch(
        f"/api/v1/users/{team_member_user.id}/role", json=payload
    )
    assert response.status_code == 403
