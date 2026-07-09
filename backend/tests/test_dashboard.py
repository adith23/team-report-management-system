"""
Dashboard metrics and analytics endpoints tests.
"""

import pytest
from httpx import AsyncClient

from app.models.project import Project


@pytest.mark.asyncio
async def test_dashboard_metrics_manager_success(
    manager_client: AsyncClient, active_project: Project
) -> None:
    """Test manager can successfully fetch dashboard summary metrics."""
    response = await manager_client.get("/api/v1/dashboard/metrics")
    assert response.status_code == 200

    data = response.json()
    assert "total_reports_this_week" in data
    assert "submission_compliance_rate" in data
    assert "open_blockers_count" in data
    assert "total_team_members" in data
    assert data["total_team_members"] >= 1  # Manager user is active


@pytest.mark.asyncio
async def test_dashboard_endpoints_team_member_forbidden(
    member_client: AsyncClient,
) -> None:
    """Test team members are forbidden from accessing dashboard metrics (403)."""
    endpoints = [
        "/api/v1/dashboard/metrics",
        "/api/v1/dashboard/submission-status",
        "/api/v1/dashboard/tasks-trend",
        "/api/v1/dashboard/workload-distribution",
        "/api/v1/dashboard/recent-activity",
    ]
    for endpoint in endpoints:
        response = await member_client.get(endpoint)
        assert response.status_code == 403


@pytest.mark.asyncio
async def test_dashboard_submission_status(
    manager_client: AsyncClient, active_project: Project
) -> None:
    """Test manager can fetch submission status details."""
    response = await manager_client.get("/api/v1/dashboard/submission-status")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "status" in data[0]
    assert "user_full_name" in data[0]


@pytest.mark.asyncio
async def test_dashboard_tasks_trend(
    manager_client: AsyncClient, active_project: Project
) -> None:
    """Test manager can fetch completed tasks trend points."""
    response = await manager_client.get("/api/v1/dashboard/tasks-trend")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_dashboard_workload_distribution(
    manager_client: AsyncClient, active_project: Project
) -> None:
    """Test manager can fetch workload distribution aggregates."""
    response = await manager_client.get("/api/v1/dashboard/workload-distribution")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_dashboard_recent_activity(
    manager_client: AsyncClient, active_project: Project
) -> None:
    """Test manager can fetch recent activities feed."""
    response = await manager_client.get("/api/v1/dashboard/recent-activity")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
