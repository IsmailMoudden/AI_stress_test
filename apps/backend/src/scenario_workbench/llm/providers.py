"""LLM provider interfaces and implementations.

Application code must depend on LLMService, not these providers directly.
"""

from __future__ import annotations

import asyncio
import json
import os
import time
import urllib.error
import urllib.request
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from typing import Any
from uuid import uuid4

from pydantic import BaseModel

from scenario_workbench.llm.models import (
    CostEstimate,
    LLMMetadata,
    LLMRequest,
    LLMResponse,
    StreamingChunk,
    TokenUsage,
)


class LLMProvider(ABC):
    """Provider contract used by LLMService."""

    name: str

    @abstractmethod
    async def complete(self, request: LLMRequest) -> LLMResponse[BaseModel]:
        """Return a complete provider response."""

    @abstractmethod
    async def stream(self, request: LLMRequest) -> AsyncIterator[StreamingChunk]:
        """Yield provider response chunks."""


class MockLLMProvider(LLMProvider):
    """Deterministic provider for tests and offline demos."""

    name = "mock"

    async def complete(self, request: LLMRequest) -> LLMResponse[BaseModel]:
        started = time.perf_counter()
        payload: dict[str, Any] = {
            "scenario_title": "Severe Energy Supply Escalation",
            "clarification_questions": [
                "Should the disruption include physical exports, maritime logistics, or both?",
                "Should sanctions and insurance restrictions be included?",
                "What time horizon should be used for scenario approval?",
            ],
            "assumptions": [
                "Middle East crude supply reliability deteriorates.",
                "Freight risk premia rise due to rerouting and war risk insurance.",
                "USD strengthens modestly under flight-to-quality conditions.",
            ],
            "market_shocks": [
                {"risk_factor": "Brent", "shock_percent": 18.0, "confidence": 0.84},
                {"risk_factor": "Freight", "shock_percent": 28.0, "confidence": 0.86},
                {"risk_factor": "TTF", "shock_percent": 7.0, "confidence": 0.62},
            ],
        }
        content = json.dumps(payload, sort_keys=True)
        parsed = request.response_schema.model_validate_json(content) if request.response_schema else None
        return LLMResponse(
            content=content,
            parsed=parsed,
            metadata=LLMMetadata(
                provider=self.name,
                model=request.model,
                request_id=f"mock-{uuid4()}",
                prompt_version=request.prompt_version,
                latency_ms=int((time.perf_counter() - started) * 1000),
                usage=TokenUsage(prompt_tokens=120, completion_tokens=180, total_tokens=300),
                cost=CostEstimate(total_cost=0.0),
            ),
        )

    async def stream(self, request: LLMRequest) -> AsyncIterator[StreamingChunk]:
        response = await self.complete(request)
        for word in response.content.split():
            yield StreamingChunk(text=f"{word} ")
        yield StreamingChunk(text="", done=True, metadata=response.metadata)


class OpenRouterProvider(LLMProvider):
    """OpenRouter adapter.

    This is the only class intended to communicate with OpenRouter. It uses the
    Python standard library so the repository can keep a lightweight bootstrap.
    """

    name = "openrouter"

    def __init__(
        self,
        api_key_env: str = "OPENROUTER_API_KEY",
        base_url: str = "https://openrouter.ai/api/v1/chat/completions",
        web_search_enabled: bool = False,
        web_max_results: int = 5,
    ) -> None:
        self.api_key_env = api_key_env
        self.base_url = base_url
        self.web_search_enabled = web_search_enabled
        self.web_max_results = web_max_results

    async def complete(self, request: LLMRequest) -> LLMResponse[BaseModel]:
        api_key = os.getenv(self.api_key_env)
        if not api_key:
            raise RuntimeError(f"{self.api_key_env} is not configured")

        started = time.perf_counter()
        body: dict[str, Any] = {
            "model": request.model,
            "temperature": request.temperature,
            "messages": [
                {"role": "system", "content": request.system_prompt},
                {"role": "user", "content": request.user_prompt},
            ],
        }
        plugins = list(request.plugins)
        if self.web_search_enabled and ":online" not in request.model:
            plugins.append({"id": "web", "max_results": self.web_max_results})
        if plugins:
            body["plugins"] = plugins
        if request.response_schema:
            body["response_format"] = {
                "type": "json_schema",
                "json_schema": {
                    "name": request.response_schema.__name__,
                    "schema": request.response_schema.model_json_schema(),
                },
            }

        raw = await asyncio.to_thread(self._post_json, body, api_key, request.timeout_seconds)
        content = raw["choices"][0]["message"]["content"]
        parsed = request.response_schema.model_validate_json(content) if request.response_schema else None
        usage = raw.get("usage", {})
        prompt_tokens = int(usage.get("prompt_tokens", 0))
        completion_tokens = int(usage.get("completion_tokens", 0))
        return LLMResponse(
            content=content,
            parsed=parsed,
            metadata=LLMMetadata(
                provider=self.name,
                model=request.model,
                request_id=raw.get("id"),
                prompt_version=request.prompt_version,
                latency_ms=int((time.perf_counter() - started) * 1000),
                usage=TokenUsage(
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=int(usage.get("total_tokens", prompt_tokens + completion_tokens)),
                ),
                cost=CostEstimate(),
            ),
        )

    async def stream(self, request: LLMRequest) -> AsyncIterator[StreamingChunk]:
        response = await self.complete(request)
        yield StreamingChunk(text=response.content, done=True, metadata=response.metadata)

    def _post_json(self, body: dict[str, Any], api_key: str, timeout_seconds: float) -> dict[str, Any]:
        request = urllib.request.Request(
            self.base_url,
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://scenario-workbench.internal",
                "X-Title": "Scenario Workbench",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            details = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"OpenRouter request failed: {exc.code} {details}") from exc
