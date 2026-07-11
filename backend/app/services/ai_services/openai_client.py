"""
OpenAI concrete LLM client implementation.
"""

import logging
from openai import AsyncOpenAI

from app.config import settings
from app.services.ai_services.base_client import BaseLLMClient

logger = logging.getLogger(__name__)


class OpenAIClient(BaseLLMClient):
    """
    OpenAI implementation of the BaseLLMClient.
    """

    def __init__(self) -> None:
        self._api_key = settings.OPENAI_API_KEY
        if self._api_key:
            self._client = AsyncOpenAI(api_key=self._api_key)
        else:
            self._client = None
            logger.warning(
                "OPENAI_API_KEY is not set. The OpenAI Client will run in MOCK mode."
            )

    async def generate(self, system_prompt: str, user_message: str) -> str:
        """
        Generate a text response using OpenAI chat completions API.
        """
        if not self._client:
            return (
                "⚠️ **[MOCK MODE]** OpenAI API key is not configured.\n\n"
                "Here is a mock analysis of the request:\n"
                f"- **Context size:** System prompt has {len(system_prompt)} chars.\n"
                f'- **Your Query:** "{user_message}"\n\n'
                "To enable real AI insights, set a valid `OPENAI_API_KEY` in the backend `.env` file."
            )

        try:
            response = await self._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.3,
                max_tokens=1000,
            )
            return response.choices[0].message.content or "No response received."

        except Exception as e:
            logger.error("OpenAI API call failed: %s", str(e))
            return f"❌ **AI Assistant Error:** Could not generate a response from OpenAI. details: {str(e)}"
