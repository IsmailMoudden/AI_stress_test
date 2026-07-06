# System Architecture

Scenario Workbench is intended to be a modular enterprise application that assists scenario construction while preserving existing model governance and risk engine ownership.

## Architectural Philosophy

- Separate AI assistance from approved scenario state.
- Separate scenario construction from portfolio valuation.
- Preserve integration boundaries around pricing and risk engines.
- Make audit events append-only and reviewable.
- Keep infrastructure adapters replaceable.
- Prefer clear contracts over hidden coupling.

## Context Diagram

```mermaid
flowchart LR
    User[Risk and Middle Office Users]
    UI[Scenario Workbench UI]
    API[Backend API]
    Builder[Scenario Builder]
    Engine[Scenario Engine]
    Lab[Scenario Lab]
    Reporting[Reporting]
    Audit[Audit Trail]
    RiskEngine[Existing Pricing and Risk Engines]
    MarketData[Market Data and Research Sources]
    AI[Azure OpenAI and AI Orchestration]
    Storage[(PostgreSQL / Redis / Graph / Vector Stores)]

    User --> UI
    UI --> API
    API --> Builder
    API --> Engine
    API --> Lab
    API --> Reporting
    API --> Audit
    Builder --> MarketData
    Builder --> AI
    Engine --> MarketData
    Engine --> Storage
    Lab --> Storage
    Reporting --> Storage
    API --> RiskEngine
    RiskEngine --> API
    Audit --> Storage
```

## Logical Layers

```mermaid
flowchart TB
    Presentation[Presentation Layer]
    Application[Application Services]
    Domain[Domain Model and Policies]
    Adapters[Infrastructure Adapters]
    External[External Enterprise Systems]

    Presentation --> Application
    Application --> Domain
    Application --> Adapters
    Adapters --> External
```

## Data Governance Boundary

```mermaid
sequenceDiagram
    participant Analyst
    participant Workbench
    participant AI
    participant Audit
    participant RiskEngine

    Analyst->>Workbench: Draft scenario objective
    Workbench->>AI: Request suggestions with governed context
    AI-->>Workbench: Return editable suggestions
    Workbench->>Audit: Record AI suggestion metadata
    Analyst->>Workbench: Accept, reject, or edit assumptions
    Workbench->>Audit: Record human decision
    Analyst->>Workbench: Submit approved scenario
    Workbench->>RiskEngine: Send approved inputs only
    RiskEngine-->>Workbench: Return official risk outputs
    Workbench->>Audit: Record execution reference
```

## Key Integration Principles

- Risk engine execution must be explicit and user-controlled.
- AI output cannot directly trigger official valuation.
- Market data provenance should be retained where licensing permits.
- Scenario versions should be immutable once approved.
- Overrides must capture user, timestamp, reason, and changed fields.

