# Testing Strategy

Testing must protect correctness, auditability, and integration contracts.

## Test Layers

- Unit tests for deterministic domain policies.
- Integration tests for databases, queues, caches, and adapters.
- Contract tests for service boundaries.
- End-to-end tests for critical user journeys.
- Security tests for authorization and data access boundaries.
- Evaluation tests for future AI workflows.

## AI Evaluation Philosophy

AI-assisted behavior should be tested through controlled fixtures, trace review, deterministic scoring where possible, and human review workflows. Official risk outputs must come from existing risk systems, not AI evaluation.

