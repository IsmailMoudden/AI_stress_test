# ADR 0001: Record Architecture Decisions

## Status

Accepted

## Context

Scenario Workbench is expected to evolve into a regulated internal platform with multiple engineering, risk, security, and infrastructure stakeholders. Decisions about AI governance, risk engine boundaries, data storage, and deployment architecture must remain explainable over time.

## Decision

The project will use Architecture Decision Records stored in `docs/adr` for significant technical and governance decisions.

## Consequences

Major decisions will have durable context. New contributors can understand why patterns exist before changing them. The repository gains a lightweight governance mechanism without introducing a heavyweight approval process.

## Alternatives Considered

- Informal pull request discussion only: rejected because rationale becomes difficult to retrieve.
- External wiki only: rejected because architecture context should version with the code.

