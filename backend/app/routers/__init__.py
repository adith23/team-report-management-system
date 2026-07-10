"""
API route handlers — presentation layer.

Re-exports all routers to simplify mounting them in main.py:
    from app.routers import auth_router, report_router, ...
"""

from app.routers.auth_router import router as auth_router  # noqa: F401
from app.routers.user_router import router as user_router  # noqa: F401
from app.routers.report_router import router as report_router  # noqa: F401
from app.routers.project_router import router as project_router  # noqa: F401
from app.routers.dashboard_router import router as dashboard_router  # noqa: F401
from app.routers.ai_router import router as ai_router  # noqa: F401

__all__ = [
    "auth_router",
    "user_router",
    "report_router",
    "project_router",
    "dashboard_router",
    "ai_router",
]
