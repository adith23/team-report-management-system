"""
OpenAI concrete LLM strategy implementation.

Utilizes the official openai package to generate responses from OpenAI models.
Falls back to a descriptive mock response if the API key is not configured,
ensuring the application remains fully functional without an active subscription.
"""

import logging
from openai import AsyncOpenAI

from app.config import settings
from app.services.ai.llm_strategy import LLMStrategy

logger = logging.getLogger(__name__)


class OpenAIStrategy(LLMStrategy):
    """
    OpenAI implementation of the LLMStrategy.
    """

    def __init__(self) -> None:
        self._api_key = settings.OPENAI_API_KEY
        if self._api_key:
            # Initialize the AsyncOpenAI client
            self._client = AsyncOpenAI(api_key=self._api_key)
        else:
            self._client = None
            logger.warning(
                "OPENAI_API_KEY is not set. The OpenAI Strategy will run in MOCK mode."
            )

    async def generate(self, system_prompt: str, user_message: str) -> str:
        """
        Generate a text response using OpenAI chat completions API.
        """
        # If no client (no API key configured), return a mock response
        if not self._client:
            return (
                "⚠️ **[MOCK MODE]** OpenAI API key is not configured.\n\n"
                "Here is a mock analysis of the request:\n"
                f"- **Context size:** System prompt has {len(system_prompt)} chars.\n"
                f"- **Your Query:** \"{user_message}\"\n\n"
                "To enable real AI insights, set a valid `OPENAI_API_KEY` in the backend `.env` file."
            )

        try:
            # Use gpt-4o-mini for cost-effective, high-speed structured processing
            response = await self._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.3,  # Keep it deterministic and factual
                max_tokens=1000,
            )
            return response.choices[0].message.content or "No response received."

        except Exception as e:
            logger.error("OpenAI API call failed: %s", str(e))
            return f"❌ **AI Assistant Error:** Could not generate a response from OpenAI. details: {str(e)}"
