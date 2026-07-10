"""
Project category tagging tests.
"""

import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project


@pytest.mark.asyncio
async def test_create_project_manager_success(
    manager_client: AsyncClient, db_session: AsyncSession
) -> None:
    """Test manager can successfully create a project category."""
    payload = {
        "name": "Project Beta",
        "description": "Beta testing framework",
        "color_hex": "#00ff00",
    }
    response = await manager_client.post("/api/v1/projects/", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["name"] == "Project Beta"
    assert data["color_hex"] == "#00ff00"
    assert data["is_active"] is True

    # Verify db record
    stmt = select(Project).where(Project.name == "Project Beta")
    result = await db_session.execute(stmt)
    project = result.scalar_one_or_none()
    assert project is not None
    assert project.description == "Beta testing framework"


@pytest.mark.asyncio
async def test_create_project_member_forbidden(member_client: AsyncClient) -> None:
    """Test team members cannot create projects (403)."""
    payload = {
        "name": "Project Alpha",
        "color_hex": "#123456",
    }
    response = await member_client.post("/api/v1/projects/", json=payload)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_project_duplicate_name(
    manager_client: AsyncClient, active_project: Project
) -> None:
    """Test project duplicate names are rejected."""
    payload = {
        "name": active_project.name,
        "color_hex": "#ffffff",
    }
    response = await manager_client.post("/api/v1/projects/", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_list_projects_authenticated(
    member_client: AsyncClient, active_project: Project
) -> None:
    """Test any authenticated user can list active projects."""
    response = await member_client.get("/api/v1/projects/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["id"] == str(active_project.id)


@pytest.mark.asyncio
async def test_update_project_success(
    manager_client: AsyncClient, active_project: Project, db_session: AsyncSession
) -> None:
    """Test manager can update project properties."""
    payload = {
        "name": "New Alpha Name",
        "description": "Updated description",
        "color_hex": "#111111",
    }
    response = await manager_client.put(
        f"/api/v1/projects/{active_project.id}", json=payload
    )
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "New Alpha Name"
    assert data["color_hex"] == "#111111"

    await db_session.refresh(active_project)
    assert active_project.name == "New Alpha Name"
    assert active_project.description == "Updated description"


@pytest.mark.asyncio
async def test_soft_delete_project(
    manager_client: AsyncClient, active_project: Project, db_session: AsyncSession
) -> None:
    """Test manager can soft-delete a project."""
    response = await manager_client.delete(f"/api/v1/projects/{active_project.id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Project category soft-deleted successfully."

    # Verify project is inactive in db
    await db_session.refresh(active_project)
    assert active_project.is_active is False
