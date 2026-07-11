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
from app.services.ai_services.ai_service import AIService  # noqa: F401
from app.services.ai_services.base_client import BaseLLMClient  # noqa: F401
from app.services.ai_services.openai_client import OpenAIClient  # noqa: F401
from app.services.ai_services.gemini_client import GeminiClient  # noqa: F401

__all__ = [
    "AuthService",
    "UserService",
    "ProjectService",
    "ReportService",
    "DashboardService",
    "AIService",
    "BaseLLMClient",
    "OpenAIClient",
    "GeminiClient",
]
