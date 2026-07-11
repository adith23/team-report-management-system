"""
Abstract LLM client interface.
"""

from abc import ABC, abstractmethod


class BaseLLMClient(ABC):
    """
    Abstract client defining the common interface for all LLM providers.
    """

    @abstractmethod
    async def generate(self, system_prompt: str, user_message: str) -> str:
        """
        Generate a text response from the language model.

        Args:
            system_prompt: Guidelines, context, and constraints for the model.
            user_message: The actual query or content prompt.

        Returns:
            The model's textual response.
        """
        pass
