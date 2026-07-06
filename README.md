# Scenario Workbench

Scenario Workbench is the repository foundation for an internal market risk and middle office platform that helps teams design, evidence, govern, and execute stress testing scenarios through existing pricing and risk infrastructure.

The system is envisioned as a Scenario Engineering Assistant. It helps analysts ask better questions, structure assumptions, find historical analogues, and explain proposed market shocks. It does not price portfolios, replace approved valuation models, invent risk numbers, or make risk decisions on behalf of users.

This repository intentionally contains foundation, documentation, placeholders, and development standards only. It does not implement application business logic.

The current iteration also includes a dependency-free mock end-to-end demonstration under [apps/frontend/index.html](apps/frontend/index.html). It uses deterministic mock data and a mocked AI orchestration layer only.

## Business Context

Stress testing workflows in commodity trading, investment banking, and energy trading organizations are often fragmented across spreadsheets, analyst notes, market research, and manually operated risk engines. Scenario Workbench is intended to improve this process by making scenario construction:

- explainable and auditable
- reproducible across teams and periods
- governed through review and approval workflows
- integrated with existing pricing and risk engines
- transparent about AI-generated suggestions and human overrides

Target users include Heads of Market Risk, Middle Office leaders, Commodity Risk Analysts, Energy Trading Risk Managers, Portfolio Risk Managers, and Quantitative Risk teams.

## Product Principles

- The human owns the final scenario.
- Every AI suggestion is editable, rejectable, and traceable.
- Every assumption is visible.
- Every generated market shock must include supporting rationale.
- Auditability and reproducibility take priority over convenience.
- Existing pricing and risk engines remain the source of valuation truth.

## Repository Status

This is a bootstrap repository. It provides:

- enterprise monorepo structure
- backend, frontend, infrastructure, scripts, and tests placeholders
- architecture documentation and Mermaid diagrams
- ADR structure
- contribution, coding, testing, and deployment guidance
- issue and pull request templates
- minimal tooling configuration for future Python and TypeScript work

It deliberately does not provide:

- application APIs
- AI workflows
- portfolio valuation
- stress engine logic
- user interface implementation
- database schema
- cloud infrastructure resources

## Repository Organization

```text
.
├── apps/
│   ├── backend/              # Future FastAPI service boundary
│   └── frontend/             # Future React and TypeScript application
├── packages/
│   └── shared/               # Future shared contracts and generated clients
├── modules/                  # Documentation-only future product module folders
├── docs/
│   ├── adr/                  # Architecture Decision Records
│   ├── architecture/         # System architecture and diagrams
│   ├── modules/              # Future functional module specifications
│   ├── operations/           # Runtime, deployment, and support docs
│   └── security/             # Security, RBAC, and data governance docs
├── infra/
│   ├── docker/               # Docker placeholders
│   └── terraform/            # Azure infrastructure placeholders
├── scripts/                  # Developer and automation scripts
├── tests/                    # Cross-system test suites
└── .github/                  # CI, issue templates, PR template
```

## Intended Architecture

Scenario Workbench is expected to evolve into a modular platform with explicit separation between user workflow, scenario engineering, AI assistance, market data retrieval, risk engine integration, reporting, and governance.

The initial architecture stance is documented in [System Architecture](docs/architecture/system-architecture.md).

LLM access is centralized behind `LLMService`; no application code should call OpenRouter or any model provider directly. See [LLM Service Architecture](docs/ai/llm-service.md).

## Demo Application

Run the local demo server:

```bash
make demo
```

Then open `http://127.0.0.1:4173`.

You can also open [apps/frontend/index.html](apps/frontend/index.html) directly in a browser for the offline-only mock demo, but OpenRouter web enrichment requires the local server.

The demo includes:

- agnostic global trading portfolio and organization structure
- 8 desks, 25 traders, and 840 deterministic mock trades
- realistic commodity instruments and mapped risk factors
- portfolio dashboard, exposure tables, desk breakdowns, and heatmaps
- OpenRouter-backed scenario generation with clarification questions when run through the local server
- editable assumptions and shock overrides
- deterministic sensitivity-based stress impact
- scenario comparison
- mock JSON report export
- optional OpenRouter web enrichment for historical analogues through `LLMService`

Only the portfolio/trade data and simplified stress engine are mocked. When the local server is running with `OPENROUTER_API_KEY`, scenario assumptions and shocks are generated from the user's scenario text.

For a plain-English explanation of every demo metric, term, PnL calculation, industry grouping, and stress attribution formula, see [Demo Metrics And Terminology Glossary](docs/demo-metrics-glossary.md).

## Future Functional Modules

- [Scenario Builder](docs/modules/scenario-builder.md): clarification, scenario formalization, historical analogues, knowledge retrieval, and assumption capture.
- [Scenario Engine](docs/modules/scenario-engine.md): transformation of approved assumptions into explainable market shocks and mapped risk factors.
- [Stress Engine Integration](docs/modules/stress-engine.md): controlled integration with existing pricing and risk engines.
- [Scenario Lab](docs/modules/scenario-lab.md): scenario comparison, versioning, approvals, overrides, and library management.
- [Reporting](docs/modules/reporting.md): executive, committee, and machine-readable exports.

Documentation-only module folders are also reserved under [modules](modules/README.md).

## Technology Direction

The repository prepares for:

- Python, FastAPI, Pydantic, SQLAlchemy, Alembic
- React, TypeScript, enterprise data grids
- PostgreSQL, Redis, Neo4j, vector databases
- Azure, Azure OpenAI, Azure Key Vault, Azure Monitor
- Docker and Terraform
- LangGraph for governed AI orchestration where appropriate
- CI/CD, automated testing, security scanning, and environment separation

The configured LLM gateway is OpenRouter. Model selection must be configuration-driven through `LLM_PROVIDER` and `LLM_MODEL`.

## Development Workflow

1. Create a feature branch from `main`.
2. Keep changes scoped to a single product or platform concern.
3. Add or update tests with any executable behavior.
4. Update documentation when architecture, workflow, configuration, or governance behavior changes.
5. Open a pull request using the repository template.
6. Obtain review from appropriate code owners before merge.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidance.

## Local Commands

The current commands are placeholders for future work:

```bash
make help
make lint
make test
make format
```

These commands are intentionally conservative until application code is introduced.

## Environment Configuration

Copy `.env.example` to `.env.local` for local development once services are introduced. Secrets must never be committed. Production secrets should be stored in managed secret stores such as Azure Key Vault.

## Governance

Architecture decisions are recorded under [docs/adr](docs/adr). Significant changes to architecture, data governance, security posture, AI orchestration, or risk engine integration should include an ADR.

## Design Direction

The future UI should feel like institutional risk software: dense, readable, fast, precise, and restrained. It should prioritize high data-to-ink ratio, strong table ergonomics, clear audit trails, and predictable workflows over consumer assistant patterns or decorative motion.

See [UI Philosophy](docs/architecture/ui-philosophy.md).
