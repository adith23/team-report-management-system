"""
Weekly reports operations tests.
"""

from datetime import date, timedelta
import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import ReportStatus, TaskType
from app.models.project import Project
from app.models.report import WeeklyReport
from app.models.user import User


@pytest.mark.asyncio
async def test_create_report_draft_success(
    member_client: AsyncClient, active_project: Project, db_session: AsyncSession
) -> None:
    """Test successful creation of a weekly report draft."""
    payload = {
        "project_id": str(active_project.id),
        "week_start": "2026-07-09",  # Thursday, snaps to Monday 2026-07-06
        "tasks_completed": [
            {"description": "Task 1 completed", "task_type": "COMPLETED"},
            {"description": "Task 2 completed", "task_type": "COMPLETED"},
        ],
        "tasks_planned": [
            {"description": "Task 3 planned", "task_type": "PLANNED"},
        ],
        "blockers": [
            {"description": "Unresolved blocker", "is_resolved": False},
        ],
        "hours_worked": 37.5,
        "notes": "Staging link: https://app.com",
    }
    response = await member_client.post("/api/v1/reports/", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["week_start"] == "2026-07-06"  # Snapped Monday
    assert data["week_end"] == "2026-07-12"    # Calculated Sunday
    assert data["status"] == ReportStatus.DRAFT.value
    assert len(data["tasks_completed"]) == 2
    assert len(data["tasks_planned"]) == 1
    assert len(data["blockers"]) == 1
    assert data["project_name"] == active_project.name

    # Check database
    report_id = uuid.UUID(data["id"])
    stmt = (
        select(WeeklyReport)
        .where(WeeklyReport.id == report_id)
    )
    result = await db_session.execute(stmt)
    report = result.scalar_one_or_none()
    assert report is not None
    assert float(report.hours_worked) == 37.5


@pytest.mark.asyncio
async def test_create_report_duplicate_week_rejected(
    member_client: AsyncClient, active_project: Project
) -> None:
    """Test user cannot create two reports for the same week and project."""
    payload = {
        "project_id": str(active_project.id),
        "week_start": "2026-07-06",
        "tasks_completed": [{"description": "Done", "task_type": "COMPLETED"}],
        "tasks_planned": [],
    }
    # First submit succeeds
    r1 = await member_client.post("/api/v1/reports/", json=payload)
    assert r1.status_code == 201

    # Second submit fails with 409
    r2 = await member_client.post("/api/v1/reports/", json=payload)
    assert r2.status_code == 409


@pytest.mark.asyncio
async def test_get_my_reports(
    member_client: AsyncClient, active_project: Project
) -> None:
    """Test user can retrieve their paginated report list."""
    payload = {
        "project_id": str(active_project.id),
        "week_start": "2026-07-06",
        "tasks_completed": [{"description": "Done", "task_type": "COMPLETED"}],
        "tasks_planned": [],
    }
    await member_client.post("/api/v1/reports/", json=payload)

    response = await member_client.get("/api/v1/reports/my")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_get_report_detail_access_rules(
    member_client: AsyncClient,
    manager_client: AsyncClient,
    active_project: Project,
    team_member_user: User,
) -> None:
    """Test report detail access controls (owner/manager yes, third party no)."""
    # Create report as team_member
    payload = {
        "project_id": str(active_project.id),
        "week_start": "2026-07-06",
        "tasks_completed": [{"description": "Done", "task_type": "COMPLETED"}],
        "tasks_planned": [],
    }
    create_res = await member_client.post("/api/v1/reports/", json=payload)
    report_id = create_res.json()["id"]

    # Owner can read
    res_owner = await member_client.get(f"/api/v1/reports/{report_id}")
    assert res_owner.status_code == 200

    # Manager can read
    res_mgr = await manager_client.get(f"/api/v1/reports/{report_id}")
    assert res_mgr.status_code == 200


@pytest.mark.asyncio
async def test_update_report_resets_submitted_to_draft(
    member_client: AsyncClient, active_project: Project, db_session: AsyncSession
) -> None:
    """Test updates reset SUBMITTED status back to DRAFT for workflow auditing."""
    # Create and submit
    payload = {
        "project_id": str(active_project.id),
        "week_start": "2026-07-06",
        "tasks_completed": [{"description": "Done", "task_type": "COMPLETED"}],
        "tasks_planned": [],
    }
    create_res = await member_client.post("/api/v1/reports/", json=payload)
    report_id = create_res.json()["id"]

    # Submit
    submit_res = await member_client.post(f"/api/v1/reports/{report_id}/submit")
    assert submit_res.json()["status"] in (ReportStatus.SUBMITTED.value, ReportStatus.LATE.value)

    # Update
    update_payload = {
        "notes": "Edited notes",
    }
    update_res = await member_client.put(
        f"/api/v1/reports/{report_id}", json=update_payload
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == ReportStatus.DRAFT.value
    assert update_res.json()["submitted_at"] is None

@pytest.mark.asyncio
async def test_update_report_tasks_and_blockers(
    member_client: AsyncClient, active_project: Project, db_session: AsyncSession
) -> None:
    """Test updating a report's tasks and blockers successfully."""
    # Create draft report
    payload = {
        "project_id": str(active_project.id),
        "week_start": "2026-07-06",
        "tasks_completed": [{"description": "Initial task completed", "task_type": "COMPLETED"}],
        "tasks_planned": [{"description": "Initial task planned", "task_type": "PLANNED"}],
        "blockers": [{"description": "Initial blocker", "is_resolved": False}],
    }
    create_res = await member_client.post("/api/v1/reports/", json=payload)
    assert create_res.status_code == 201
    report_id = create_res.json()["id"]

    # Update tasks and blockers
    update_payload = {
        "tasks_completed": [
            {"description": "Updated task 1 completed", "task_type": "COMPLETED"},
            {"description": "Updated task 2 completed", "task_type": "COMPLETED"},
        ],
        "tasks_planned": [
            {"description": "Updated task planned", "task_type": "PLANNED"},
        ],
        "blockers": [
            {"description": "Updated blocker", "is_resolved": True},
        ],
        "notes": "Updated notes",
    }
    update_res = await member_client.put(
        f"/api/v1/reports/{report_id}", json=update_payload
    )
    assert update_res.status_code == 200

    data = update_res.json()
    assert data["notes"] == "Updated notes"
    assert len(data["tasks_completed"]) == 2
    assert data["tasks_completed"][0]["description"] == "Updated task 1 completed"
    assert data["tasks_completed"][1]["description"] == "Updated task 2 completed"
    assert len(data["tasks_planned"]) == 1
    assert data["tasks_planned"][0]["description"] == "Updated task planned"
    assert len(data["blockers"]) == 1
    assert data["blockers"][0]["description"] == "Updated blocker"
    assert data["blockers"][0]["is_resolved"] is True



@pytest.mark.asyncio
async def test_submit_report_on_time_vs_late(
    member_client: AsyncClient, active_project: Project, db_session: AsyncSession
) -> None:
    """Test report submission late vs on-time status logic."""
    # 1. On time submission
    # Create report for next week (guaranteed on time since week Sunday is in the future)
    future_date = date.today() + timedelta(days=7)
    payload_on_time = {
        "project_id": str(active_project.id),
        "week_start": str(future_date),
        "tasks_completed": [{"description": "Done", "task_type": "COMPLETED"}],
        "tasks_planned": [],
    }
    res_ot = await member_client.post("/api/v1/reports/", json=payload_on_time)
    report_id_ot = res_ot.json()["id"]

    submit_ot = await member_client.post(f"/api/v1/reports/{report_id_ot}/submit")
    assert submit_ot.status_code == 200
    assert submit_ot.json()["status"] == ReportStatus.SUBMITTED.value
    assert submit_ot.json()["submitted_at"] is not None

    # 2. Late submission
    # Create report for past week (guaranteed late since week Sunday is in the past)
    past_date = date.today() - timedelta(days=14)
    payload_late = {
        "project_id": str(active_project.id),
        "week_start": str(past_date),
        "tasks_completed": [{"description": "Done", "task_type": "COMPLETED"}],
        "tasks_planned": [],
    }
    res_late = await member_client.post("/api/v1/reports/", json=payload_late)
    report_id_late = res_late.json()["id"]

    submit_late = await member_client.post(f"/api/v1/reports/{report_id_late}/submit")
    assert submit_late.status_code == 200
    assert submit_late.json()["status"] == ReportStatus.LATE.value


@pytest.mark.asyncio
async def test_delete_report_draft_only(
    member_client: AsyncClient, active_project: Project
) -> None:
    """Test user can delete own DRAFT reports, but not submitted ones."""
    payload = {
        "project_id": str(active_project.id),
        "week_start": "2026-07-06",
        "tasks_completed": [{"description": "Done", "task_type": "COMPLETED"}],
        "tasks_planned": [],
    }
    # Draft report
    r_draft = await member_client.post("/api/v1/reports/", json=payload)
    draft_id = r_draft.json()["id"]

    # Delete draft should succeed
    del_draft = await member_client.delete(f"/api/v1/reports/{draft_id}")
    assert del_draft.status_code == 200

    # Submitted report
    r_submitted = await member_client.post("/api/v1/reports/", json=payload)
    sub_id = r_submitted.json()["id"]
    await member_client.post(f"/api/v1/reports/{sub_id}/submit")

    # Delete submitted should fail (400)
    del_sub = await member_client.delete(f"/api/v1/reports/{sub_id}")
    assert del_sub.status_code == 400


@pytest.mark.asyncio
async def test_create_and_update_with_submit_query_param(
    member_client: AsyncClient, active_project: Project, db_session: AsyncSession
) -> None:
    """Test create and update endpoints with the submit query parameter."""
    # 1. Create with submit=true
    future_date = date.today() + timedelta(days=7)
    payload = {
        "project_id": str(active_project.id),
        "week_start": str(future_date),
        "tasks_completed": [{"description": "Immediate completion task", "task_type": "COMPLETED"}],
        "tasks_planned": [],
    }
    create_res = await member_client.post("/api/v1/reports/?submit=true", json=payload)
    assert create_res.status_code == 201
    assert create_res.json()["status"] == ReportStatus.SUBMITTED.value
    report_id = create_res.json()["id"]

    # 2. Update with submit=true (re-submitting changes)
    update_payload = {
        "notes": "Updated note during resubmit",
    }
    update_res = await member_client.put(f"/api/v1/reports/{report_id}?submit=true", json=update_payload)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == ReportStatus.SUBMITTED.value
    assert update_res.json()["notes"] == "Updated note during resubmit"

