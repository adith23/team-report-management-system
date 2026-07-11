"""
Gemini concrete LLM client implementation.
"""

import logging
import google.generativeai as genai

from app.config import settings
from app.services.ai_services.base_client import BaseLLMClient

logger = logging.getLogger(__name__)


class GeminiClient(BaseLLMClient):
    """
    Google Gemini implementation of the BaseLLMClient.
    """

    def __init__(self) -> None:
        self._api_key = settings.GEMINI_API_KEY
        if self._api_key:
            genai.configure(api_key=self._api_key)
            self._model = genai.GenerativeModel("gemini-3.1-flash-lite")
        else:
            self._model = None
            logger.warning(
                "GEMINI_API_KEY is not set. The Gemini Client will run in MOCK mode."
            )

    async def generate(self, system_prompt: str, user_message: str) -> str:
        """
        Generate a text response using Google Gemini API.
        """
        if not self._model:
            return (
                "⚠️ **[MOCK MODE]** Gemini API key is not configured.\n\n"
                "Here is a mock analysis of the request:\n"
                f"- **Context size:** System prompt has {len(system_prompt)} chars.\n"
                f'- **Your Query:** "{user_message}"\n\n'
                "To enable real AI insights, set a valid `GEMINI_API_KEY` in the backend `.env` file."
            )

        try:
            prompt = f"System Instructions:\n{system_prompt}\n\nUser Message:\n{user_message}"

            response = await self._model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=1000,
                ),
            )
            return response.text or "No response received."

        except Exception as e:
            logger.error("Gemini API call failed: %s", str(e))
            return f"❌ **AI Assistant Error:** Could not generate a response from Gemini. details: {str(e)}"
