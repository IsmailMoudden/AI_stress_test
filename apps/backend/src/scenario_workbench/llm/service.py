"""Provider-agnostic LLM service.

The rest of the application must use this service instead of calling model
providers directly.
"""

from __future__ import annotations

import asyncio
import logging
import time
from collections import deque
from collections.abc import AsyncIterator
from typing import TypeVar

from pydantic import BaseModel, ValidationError

from scenario_workbench.llm.models import LLMRequest, LLMResponse, StreamingChunk
from scenario_workbench.llm.providers import LLMProvider

StructuredOutput = TypeVar("StructuredOutput", bound=BaseModel)

logger = logging.getLogger(__name__)


class InMemoryRateLimiter:
    """Small process-local limiter for bootstrap and tests.

    Production deployments should replace this with a distributed limiter.
    """

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._events: deque[float] = deque()

    async def acquire(self) -> None:
        now = time.monotonic()
        while self._events and now - self._events[0] > self.window_seconds:
            self._events.popleft()
        if len(self._events) >= self.max_requests:
            sleep_for = self.window_seconds - (now - self._events[0])
            await asyncio.sleep(max(0.0, sleep_for))
        self._events.append(time.monotonic())


class LLMService:
    """Application-facing LLM abstraction.

    Responsibilities:
    - provider abstraction and model selection
    - retries, timeouts, rate limiting
    - structured Pydantic output validation
    - logging, usage, and cost metadata propagation
    - streaming support
    """

    def __init__(
        self,
        provider: LLMProvider,
        default_model: str,
        timeout_seconds: float = 30.0,
        max_retries: int = 2,
        rate_limiter: InMemoryRateLimiter | None = None,
    ) -> None:
        self.provider = provider
        self.default_model = default_model
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries
        self.rate_limiter = rate_limiter or InMemoryRateLimiter(max_requests=60, window_seconds=60)

    async def complete(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        response_schema: type[StructuredOutput] | None = None,
        model: str | None = None,
        prompt_version: str | None = None,
        temperature: float = 0.0,
        plugins: list[dict[str, object]] | None = None,
    ) -> LLMResponse[StructuredOutput]:
        request = LLMRequest(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model or self.default_model,
            timeout_seconds=self.timeout_seconds,
            temperature=temperature,
            prompt_version=prompt_version,
            response_schema=response_schema,
            plugins=plugins or [],
        )
        for attempt in range(self.max_retries + 1):
            try:
                await self.rate_limiter.acquire()
                response = await asyncio.wait_for(self.provider.complete(request), timeout=self.timeout_seconds)
                logger.info(
                    "llm.complete",
                    extra={
                        "provider": response.metadata.provider,
                        "model": response.metadata.model,
                        "request_id": response.metadata.request_id,
                        "prompt_version": response.metadata.prompt_version,
                        "total_tokens": response.metadata.usage.total_tokens,
                        "total_cost": response.metadata.cost.total_cost,
                    },
                )
                return response  # type: ignore[return-value]
            except (TimeoutError, ValidationError, RuntimeError) as exc:
                logger.warning("llm.complete.retry", extra={"attempt": attempt, "error": str(exc)})
                if attempt >= self.max_retries:
                    raise
                await asyncio.sleep(0.25 * (attempt + 1))
        raise RuntimeError("LLM request failed unexpectedly")

    async def stream(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        prompt_version: str | None = None,
        temperature: float = 0.0,
        plugins: list[dict[str, object]] | None = None,
    ) -> AsyncIterator[StreamingChunk]:
        request = LLMRequest(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model or self.default_model,
            timeout_seconds=self.timeout_seconds,
            temperature=temperature,
            prompt_version=prompt_version,
            plugins=plugins or [],
        )
        await self.rate_limiter.acquire()
        async for chunk in self.provider.stream(request):
            yield chunk
