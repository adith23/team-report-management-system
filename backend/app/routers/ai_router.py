"""
AI assistant router.

Provides endpoints for managers to interact with the AI assistant:
- Chat bot: ask questions about recent team reports.
- Weekly summary: generate AI-based markdown summaries for a week.

Access is restricted to Managers only.
"""

import logging
from datetime import date
from fastapi import APIRouter, Depends, Query, Body, HTTPException, status
from pydantic import BaseModel, Field

from app.core import require_role
from app.core.dependencies import get_ai_service
from app.core.enums import UserRole
from app.models.user import User
from app.services import AIService

logger = logging.getLogger(__name__)

# Protect all AI routes under MANAGER check
router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"],
    dependencies=[Depends(require_role(UserRole.MANAGER))],
)


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message author: 'user' or 'assistant'")
    content: str = Field(..., description="Text content of the message")


class AIChatRequest(BaseModel):
    message: str | None = Field(default=None, description="The message string to the assistant")
    query: str | None = Field(default=None, description="Query string alias for backwards compatibility")
    history: list[ChatMessage] | None = Field(default=None, description="Optional conversation history")

    @property
    def prompt_text(self) -> str:
        """Extract the query text from whichever field is populated."""
        val = self.message or self.query
        if not val:
            raise ValueError("Either 'message' or 'query' must be provided in the request body.")
        return val


@router.post(
    "/chat",
    summary="Ask questions about recent team reports (MANAGER only)",
)
async def chat(
    payload: AIChatRequest = Body(...),
    current_user: User = Depends(require_role(UserRole.MANAGER)),
    ai_service: AIService = Depends(get_ai_service),
) -> dict[str, str]:
    """
    Interact with the AI assistant.
    The assistant analyzes recent report submissions as context to answer.
    """
    try:
        query_text = payload.prompt_text
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_420_METHOD_FAILURE,
            detail=str(val_err)
        )
    
    response_text = await ai_service.chat(query_text, manager=current_user)
    return {"response": response_text}


@router.get(
    "/weekly-summary",
    summary="Generate an AI-driven executive weekly summary (MANAGER only)",
)
async def get_weekly_summary(
    week_start: date | None = Query(
        default=None,
        description="Target week (snapped to Monday). Defaults to current week.",
    ),
    ai_service: AIService = Depends(get_ai_service),
) -> dict[str, str]:
    """
    Generates an AI weekly summary grouping tasks completed, unresolved blockers,
    and resource details into a professional markdown document.
    """
    target_date = week_start or date.today()
    summary_text = await ai_service.generate_team_summary(target_date)
    return {"summary": summary_text}
