# Security and Governance

Scenario Workbench is expected to operate in a controlled enterprise environment and may interact with sensitive portfolio, market, scenario, and user workflow data.

## Security Principles

- Least privilege access by default.
- Explicit RBAC for all user actions.
- Strong separation between environments.
- No secrets in source control.
- Full audit trails for scenario edits, approvals, overrides, and exports.
- Vendor and model interactions must be observable and governed.

## Data Classification

Future implementations should classify data before storage or transmission:

- public reference data
- licensed market data
- internal market data
- portfolio and position data
- user-generated scenario assumptions
- AI-generated suggestions
- approved scenario records
- audit logs

## AI Governance

AI-generated content must be:

- clearly identified
- traceable to source prompts, tools, and evidence where permitted
- reviewable before use
- editable by users
- excluded from final scenario state until explicitly accepted

The AI must not compute valuations, generate official PnL, or bypass approved risk engines.

## Secrets

Use `.env.example` for non-sensitive configuration names only. Use managed secret storage such as Azure Key Vault for deployed environments.

