# ADR 0002: Use OpenRouter Behind LLMService

## Status

Accepted

## Context

Scenario Workbench needs model flexibility across OpenAI, Anthropic, Google, DeepSeek, Qwen, Mistral, and future providers. Product modules must not depend on a specific model or provider API because model choice will change by scenario task, evaluation result, cost profile, latency, data policy, and enterprise approval.

## Decision

The application will use OpenRouter as the unified LLM gateway, accessed only through `LLMService`.

No application module outside `apps/backend/src/scenario_workbench/llm` may call OpenRouter or any external model provider directly.

Model selection will be configuration-driven through environment variables such as `LLM_PROVIDER`, `LLM_MODEL`, and `OPENROUTER_API_KEY`.

## Consequences

Application services remain provider-agnostic. Model switching does not require business logic changes. Prompt versioning, structured output validation, retries, rate limiting, usage logging, and cost tracking can be governed centrally.

The LLM layer becomes a critical boundary and must be reviewed carefully for security, observability, and data governance.

## Alternatives Considered

- Direct calls from feature modules to model SDKs: rejected because it would scatter provider coupling and governance logic.
- One SDK per model provider in application code: rejected because it complicates evaluation and model switching.
- Mock-only architecture: rejected because the production path must be explicit even while the demo remains deterministic and offline.

