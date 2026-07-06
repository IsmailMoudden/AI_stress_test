.PHONY: help lint format test security docs demo

help:
	@echo "Scenario Workbench developer commands"
	@echo "  make lint      Run static analysis placeholders"
	@echo "  make format    Run formatting placeholders"
	@echo "  make test      Run test placeholders"
	@echo "  make security  Run security check placeholders"
	@echo "  make docs      Validate documentation placeholders"
	@echo "  make demo      Run the local mock demo server"

lint:
	@echo "No executable lint target yet. Add Ruff, mypy, ESLint, and TypeScript checks when code is introduced."

format:
	@echo "No executable format target yet. Add Ruff format, Prettier, and import sorting when code is introduced."

test:
	@echo "No executable tests yet. Add backend, frontend, integration, and e2e suites as implementation begins."

security:
	@echo "No executable security target yet. Add dependency, container, IaC, and secret scanning checks."

docs:
	@echo "Documentation placeholders are stored under docs/."

demo:
	python3 scripts/local_demo_server.py
