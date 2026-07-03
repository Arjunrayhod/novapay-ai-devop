.PHONY: up down status logs reset clean help bootstrap validate health-check seed

SHELL := /bin/bash

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all lab services (Docker Compose + Kind)
	@echo "Starting AegisAI Lab..."
	@docker-compose up -d
	@echo "Infrastructure services started."
	@echo "Run 'make kind-up' to create/verify the Kind cluster."
	@echo "Run 'make status' to check service health."

down: ## Stop all lab services (Docker Compose only)
	@echo "Stopping lab services..."
	@docker-compose down
	@echo "All services stopped."

status: ## Show health status of all services
	@./scripts/health-check.sh

logs: ## Show logs from all services (usage: make logs service=prometheus)
	@docker-compose logs -f $(service)

reset: ## Full reset — destroys everything and rebuilds
	@echo "WARNING: This will destroy all lab data!"
	@read -p "Continue? [y/N] " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		make kind-down; \
		make down; \
		docker-compose rm -f; \
		docker volume prune -f --filter label=com.docker.compose.project=aegisai-lab; \
		echo "Reset complete. Run 'make up' to rebuild."; \
	fi

clean: ## Remove all lab data (volumes, images, cluster)
	@echo "Cleaning lab data..."
	@make kind-down 2>/dev/null || true
	@docker-compose down -v 2>/dev/null || true
	@docker network rm aegisai-lab 2>/dev/null || true
	@echo "Clean complete."

bootstrap: ## Full bootstrap (infra + cluster + charts)
	@./scripts/bootstrap.sh

validate: ## Run comprehensive validation
	@./scripts/validate.sh $(if $(strict),--strict,)

health-check: ## Quick health check
	@./scripts/health-check.sh

seed: ## Seed sample data
	@./scripts/seed-data.sh

# =============================================================================
# Kind Cluster Commands
# =============================================================================

kind-up: ## Create or verify Kind cluster
	@echo "Checking Kind cluster..."
	@if kind get clusters --quiet | grep -q '^aegisai-lab$$'; then \
		echo "Cluster 'aegisai-lab' already exists."; \
	else \
		echo "Creating cluster 'aegisai-lab'..."; \
		kind create cluster --config kind-config.yaml; \
		echo "Cluster created."; \
	fi
	@echo "Setting up registry connection..."
	@docker network connect "kind" "aegisai-registry" 2>/dev/null || true
	@echo "Done."

kind-down: ## Destroy Kind cluster
	@echo "Destroying Kind cluster..."
	@kind delete cluster --name aegisai-lab 2>/dev/null || true
	@echo "Cluster destroyed."

kind-load: ## Load Docker image into Kind (usage: make kind-load img=my-image:tag)
	@if [ -z "$(img)" ]; then \
		echo "Usage: make kind-load img=my-image:tag"; \
		exit 1; \
	fi
	@kind load docker-image --name aegisai-lab $(img)
	@echo "Image loaded: $(img)"

# =============================================================================
# Utility Commands
# =============================================================================

psql: ## Connect to PostgreSQL
	@PGPASSWORD=aegisai_dev_password psql -h localhost -U aegisai -d aegisai_platform

redis-cli: ## Connect to Redis
	@redis-cli -h localhost -a aegisai_dev_password

vault-login: ## Login to Vault
	@export VAULT_ADDR=http://localhost:8200 && vault login root-token-12345

grafana-url: ## Open Grafana
	@echo "http://localhost:3000 (admin / admin)"

prometheus-url: ## Open Prometheus
	@echo "http://localhost:9090"
