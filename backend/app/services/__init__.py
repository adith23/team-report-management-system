"""
Service layer — business logic.

Re-exports all service classes and strategies for clean, centralized imports:
    from app.services import AuthService, ReportService, AIService
"""

from app.services.auth_service import AuthService  # noqa: F401
from app.services.user_service import UserService  # noqa: F401
from app.services.project_service import ProjectService  # noqa: F401
from app.services.report_service import ReportService  # noqa: F401
from app.services.dashboard_service import DashboardService  # noqa: F401
from app.services.ai.ai_service import AIService  # noqa: F401
from app.services.ai.llm_strategy import LLMStrategy  # noqa: F401
from app.services.ai.openai_strategy import OpenAIStrategy  # noqa: F401

__all__ = [
    "AuthService",
    "UserService",
    "ProjectService",
    "ReportService",
    "DashboardService",
    "AIService",
    "LLMStrategy",
    "OpenAIStrategy",
]
