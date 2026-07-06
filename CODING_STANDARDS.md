# Coding Standards

These standards establish expectations for future production code. They are intentionally strict because this project is expected to support high-value, auditable risk workflows.

## General Principles

- Prefer explicit domain language over generic technical names.
- Keep business logic separate from transport, storage, and vendor integrations.
- Treat external systems as unreliable and model failures explicitly.
- Use structured logging and correlation identifiers for traceability.
- Make generated or AI-assisted output distinguishable from user-approved output.
- Keep public interfaces stable and documented.

## Python

- Use type hints for all public functions and service boundaries.
- Use Pydantic models for validation at system boundaries.
- Use SQLAlchemy for persistence and Alembic for migrations.
- Keep FastAPI routers thin; place orchestration in application services.
- Avoid global mutable state.
- Prefer dependency injection for infrastructure adapters.

## TypeScript

- Use strict TypeScript.
- Keep API contracts generated or centrally defined.
- Treat UI state, server state, and form state as distinct concerns.
- Prefer dense, accessible enterprise components over decorative layouts.
- Design tables, filters, diff views, and audit trails as first-class workflows.

## Testing

- Unit tests should validate deterministic domain behavior.
- Integration tests should validate adapters and persistence.
- Contract tests should protect service and UI boundaries.
- End-to-end tests should cover critical user workflows only.
- AI workflows must include deterministic evaluation fixtures and reviewable traces once implemented.

## Documentation

Every major module should include:

- purpose
- ownership
- boundaries
- key data contracts
- operational considerations
- audit and governance implications

