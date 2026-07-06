# LLM Service Architecture

Scenario Workbench uses OpenRouter as the unified LLM gateway, but application code must never depend on OpenRouter or a specific model.

## Boundary Rule

Only `apps/backend/src/scenario_workbench/llm` may communicate with external model providers.

All other application modules must call `LLMService`.

## Responsibilities

`LLMService` owns:

- prompt dispatch
- structured JSON output validation through Pydantic models
- retries
- timeout handling
- rate limiting
- provider abstraction
- model selection through configuration
- response validation
- logging
- token usage tracking
- cost metadata tracking
- streaming support

## Configuration

Model switching is configuration-only:

```text
LLM_PROVIDER=openrouter
LLM_MODEL=openrouter/auto
LLM_WEB_SEARCH_ENABLED=true
LLM_WEB_MAX_RESULTS=5
OPENROUTER_API_KEY=...
```

For the local demo, the default model is `openrouter/auto` with `LLM_WEB_SEARCH_ENABLED=true`. `OpenRouterProvider` attaches the OpenRouter `web` plugin so the chosen model can use web context. You can still set a specific model slug such as `openai/gpt-5.2:online` in `.env` if it is available on your OpenRouter account.

Example model identifiers may include:

- `openai/gpt-5`
- `anthropic/claude-sonnet-4`
- `google/gemini-2.5-pro`
- `deepseek/deepseek-r1`
- `qwen/qwen3`
- `mistralai/mistral-large`

Exact model IDs should be validated against OpenRouter at deployment time.

## Prompt Versioning

Prompts live under `apps/backend/src/scenario_workbench/prompts`.

Each prompt task should use explicit versions. Evaluation pipelines can run the same scenario generation fixture across multiple prompt versions and multiple model configurations.

## Offline Demo

The current frontend demo uses deterministic mock orchestration. It does not call OpenRouter, does not require network access, and does not use secrets.

When run through `make demo`, the browser can request optional web enrichment from the local backend endpoint `/api/research-scenario`. That endpoint calls `LLMService`, which calls `OpenRouterProvider`. The API key remains server-side.
