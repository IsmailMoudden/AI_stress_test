"""LLM configuration helpers."""

from __future__ import annotations

import os
from dataclasses import dataclass

from scenario_workbench.llm.providers import MockLLMProvider, OpenRouterProvider
from scenario_workbench.llm.service import LLMService


@dataclass(frozen=True)
class LLMSettings:
    provider: str
    model: str
    timeout_seconds: float
    max_retries: int
    web_search_enabled: bool
    web_max_results: int

    @classmethod
    def from_environment(cls) -> "LLMSettings":
        return cls(
            provider=os.getenv("LLM_PROVIDER", "mock"),
            model=os.getenv("LLM_MODEL", "openrouter/auto"),
            timeout_seconds=float(os.getenv("LLM_TIMEOUT_SECONDS", "45")),
            max_retries=int(os.getenv("LLM_MAX_RETRIES", "2")),
            web_search_enabled=os.getenv("LLM_WEB_SEARCH_ENABLED", "true").lower() == "true",
            web_max_results=int(os.getenv("LLM_WEB_MAX_RESULTS", "5")),
        )


def build_llm_service(settings: LLMSettings | None = None) -> LLMService:
    resolved = settings or LLMSettings.from_environment()
    if resolved.provider == "mock":
        provider = MockLLMProvider()
    elif resolved.provider == "openrouter":
        provider = OpenRouterProvider(
            web_search_enabled=resolved.web_search_enabled,
            web_max_results=resolved.web_max_results,
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {resolved.provider}")
    return LLMService(
        provider=provider,
        default_model=resolved.model,
        timeout_seconds=resolved.timeout_seconds,
        max_retries=resolved.max_retries,
    )
