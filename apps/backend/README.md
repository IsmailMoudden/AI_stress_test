# Backend

Placeholder for the future FastAPI backend.

The backend is expected to own:

- authenticated API surfaces
- scenario workflow orchestration
- persistence coordination
- audit logging
- integration adapters for market data, research, AI services, and risk engines
- authorization enforcement
- provider-agnostic LLM access through `LLMService`

No business logic is implemented in this bootstrap.

The LLM boundary is documented in [../../docs/ai/llm-service.md](../../docs/ai/llm-service.md).
