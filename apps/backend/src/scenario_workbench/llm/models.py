"""Provider-agnostic LLM request and response contracts."""

from __future__ import annotations

from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

StructuredOutput = TypeVar("StructuredOutput", bound=BaseModel)


class TokenUsage(BaseModel):
    """Token usage returned by an LLM provider."""

    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


class CostEstimate(BaseModel):
    """Estimated cost in the configured billing currency."""

    currency: str = "USD"
    prompt_cost: float = 0.0
    completion_cost: float = 0.0
    total_cost: float = 0.0


class LLMMetadata(BaseModel):
    """Provider-neutral metadata used for audit and observability."""

    provider: str
    model: str
    request_id: str | None = None
    prompt_version: str | None = None
    latency_ms: int | None = None
    usage: TokenUsage = Field(default_factory=TokenUsage)
    cost: CostEstimate = Field(default_factory=CostEstimate)


class LLMResponse(BaseModel, Generic[StructuredOutput]):
    """Structured LLM response returned to application services."""

    content: str
    parsed: StructuredOutput | None = None
    metadata: LLMMetadata


@dataclass(frozen=True)
class LLMRequest:
    """Internal request passed from LLMService to providers."""

    system_prompt: str
    user_prompt: str
    model: str
    timeout_seconds: float
    temperature: float = 0.0
    prompt_version: str | None = None
    response_schema: type[BaseModel] | None = None
    plugins: list[dict[str, Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


class StreamingChunk(BaseModel):
    """Provider-neutral streaming chunk."""

    text: str
    done: bool = False
    metadata: LLMMetadata | None = None


LLMStream = AsyncIterator[StreamingChunk]
