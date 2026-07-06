# Development Workflow

## Local Setup

This bootstrap does not install runtime dependencies. Future setup should standardize:

- Python environment management
- Node package management
- local Docker services
- environment configuration
- database migrations
- seed data for non-sensitive development fixtures

## Change Flow

1. Start from `main`.
2. Create a scoped branch.
3. Make small, reviewable commits.
4. Add or update tests.
5. Update docs and ADRs when needed.
6. Open a pull request.
7. Resolve review comments before merge.

## Configuration

Configuration should be environment-specific and externally supplied. Defaults may support local development but must not hide production requirements.

