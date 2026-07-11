from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(
        ..., description="Role of the message author: 'user' or 'assistant'"
    )
    content: str = Field(..., description="Text content of the message")


class AIChatRequest(BaseModel):
    message: str | None = Field(
        default=None, description="The message string to the assistant"
    )
    query: str | None = Field(
        default=None, description="Query string alias for backwards compatibility"
    )
    history: list[ChatMessage] | None = Field(
        default=None, description="Optional conversation history"
    )

    @property
    def prompt_text(self) -> str:
        """Extract the query text from whichever field is populated."""
        val = self.message or self.query
        if not val:
            raise ValueError(
                "Either 'message' or 'query' must be provided in the request body."
            )
        return val
