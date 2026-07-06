"""Structured output schemas for scenario-oriented LLM tasks."""

from __future__ import annotations

from pydantic import BaseModel, Field


class MarketShockDraft(BaseModel):
    risk_factor: str
    shock_percent: float
    confidence: float = Field(ge=0.0, le=1.0)


class ScenarioGenerationDraft(BaseModel):
    scenario_title: str
    clarification_questions: list[str]
    assumptions: list[str]
    market_shocks: list[MarketShockDraft]

