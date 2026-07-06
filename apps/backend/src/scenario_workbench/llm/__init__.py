"""LLM gateway boundary.

Only this package may communicate with external model providers.
"""

from scenario_workbench.llm.service import LLMService

__all__ = ["LLMService"]

