.PHONY: help setup init lint format typecheck test build clean precommit lab-up lab-down lab-status lab-validate

SHELL := /bin/bash

help: ## Show available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

lint: ## Run ruff linter on all Python files
	ruff check .

format: ## Run ruff formatter on all Python files
	ruff format .

typecheck: ## Run mypy type checker (strict mode)
	mypy --strict --ignore-missing-imports .

test: ## Run pytest with coverage
	pytest --cov=. --cov-fail-under=80 -v

precommit: ## Run all pre-commit hooks
	pre-commit run --all-files

clean: ## Clean Python cache and build artifacts
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache/ .coverage htmlcov/ dist/ build/ *.egg-info/

lab-up: ## Start local development lab (Docker Compose + Kind)
	$(MAKE) -C lab up

lab-down: ## Stop local development lab
	$(MAKE) -C lab down

lab-status: ## Check lab service health
	$(MAKE) -C lab status

lab-validate: ## Run comprehensive lab validation
	$(MAKE) -C lab validate

lab-bootstrap: ## Full lab bootstrap (infra + cluster + charts)
	$(MAKE) -C lab bootstrap

lab-seed: ## Seed lab with sample data
	$(MAKE) -C lab seed

lab-reset: ## Full lab reset (destroys volumes + cluster)
	$(MAKE) -C lab clean

lab-logs: ## Tail lab service logs (usage: make lab-logs service=prometheus)
	$(MAKE) -C lab logs service=$(service)

.PHONY: setup
setup: ## Full dev environment setup (requires sudo for some packages)
	@echo "==> AegisAI Dev Environment Setup"
	@scripts/setup-dev.sh

.PHONY: init
init: ## Initialize Python development environment
	pip install --upgrade pip setuptools wheel
	pip install pre-commit ruff mypy pytest pytest-cov
	pre-commit install --install-hooks
	@echo "Development environment initialized."
