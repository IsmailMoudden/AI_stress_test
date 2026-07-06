# Deployment Philosophy

Scenario Workbench should be deployable across isolated environments with controlled promotion.

## Environment Strategy

- `dev`: engineering integration and non-sensitive fixtures
- `test`: QA, integration, and security validation
- `prod`: controlled production environment

## Deployment Principles

- Infrastructure as code.
- No manual secret handling.
- Repeatable database migrations.
- Observable deployments.
- Explicit rollback plans.
- Separation between application deployment and risk engine integration approvals.

