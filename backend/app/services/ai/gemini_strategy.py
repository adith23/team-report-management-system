"""
Gemini concrete LLM strategy implementation.

Utilizes the google-genai or google-generativeai package to generate responses from Google Gemini models.
"""

import logging
import google.generativeai as genai

from app.config import settings
from app.services.ai.llm_strategy import LLMStrategy

logger = logging.getLogger(__name__)


class GeminiStrategy(LLMStrategy):
    """
    Google Gemini implementation of the LLMStrategy.
    """

    def __init__(self) -> None:
        self._api_key = settings.GEMINI_API_KEY
        if self._api_key:
            genai.configure(api_key=self._api_key)
            # Use gemini-1.5-flash for fast, high-context structured processing
            self._model = genai.GenerativeModel("gemini-3.1-flash-lite")
        else:
            self._model = None
            logger.warning(
                "GEMINI_API_KEY is not set. The Gemini Strategy will run in MOCK mode."
            )

    async def generate(self, system_prompt: str, user_message: str) -> str:
        """
        Generate a text response using Google Gemini API.
        """
        # If no client (no API key configured), return a mock response
        if not self._model:
            return (
                "⚠️ **[MOCK MODE]** Gemini API key is not configured.\n\n"
                "Here is a mock analysis of the request:\n"
                f"- **Context size:** System prompt has {len(system_prompt)} chars.\n"
                f'- **Your Query:** "{user_message}"\n\n'
                "To enable real AI insights, set a valid `GEMINI_API_KEY` in the backend `.env` file."
            )

        try:
            # Combine system prompt and user message since Gemini 1.5 system instructions
            # can be passed differently, but combining is universally safe for simple text generation.
            prompt = f"System Instructions:\n{system_prompt}\n\nUser Message:\n{user_message}"

            response = await self._model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.3,  # Keep deterministic
                    max_output_tokens=1000,
                ),
            )
            return response.text or "No response received."

        except Exception as e:
            logger.error("Gemini API call failed: %s", str(e))
            return f"❌ **AI Assistant Error:** Could not generate a response from Gemini. details: {str(e)}"
