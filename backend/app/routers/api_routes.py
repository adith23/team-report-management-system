from fastapi import APIRouter

from app.routers.auth_router import router as auth_router
from app.routers.user_router import router as user_router
from app.routers.report_router import router as report_router
from app.routers.project_router import router as project_router
from app.routers.dashboard_router import router as dashboard_router
from app.routers.ai_router import router as ai_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(user_router)
api_router.include_router(report_router)
api_router.include_router(project_router)
api_router.include_router(dashboard_router)
api_router.include_router(ai_router)
