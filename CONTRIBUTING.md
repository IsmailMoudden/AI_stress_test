# Contributing

Scenario Workbench should be developed as a regulated internal enterprise platform. Contributions must optimize for clarity, auditability, maintainability, and operational safety.

## Branching Strategy

- `main` represents the latest reviewed integration state.
- Feature branches should use `feature/<short-description>`.
- Defect branches should use `fix/<short-description>`.
- Architecture or documentation branches should use `docs/<short-description>`.

Long-lived branches should be avoided unless coordinated with maintainers.

## Pull Request Expectations

Every pull request should:

- describe the business or engineering reason for the change
- identify affected modules and operational surfaces
- include test evidence or explain why tests are not applicable
- update documentation when behavior, architecture, setup, or governance changes
- include an ADR for significant architectural decisions
- avoid unrelated formatting, refactoring, or dependency churn

## Review Standards

Reviewers should focus on:

- correctness and failure modes
- auditability and reproducibility
- security and data handling
- integration contracts
- operational clarity
- test coverage proportional to risk

## Definition of Done

A change is done when:

- it is reviewed and approved
- tests and checks pass
- documentation is current
- configuration changes are reflected in examples
- operational impact is understood
- audit or compliance considerations are addressed

