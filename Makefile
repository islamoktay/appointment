.PHONY: help db-up db-down db-logs backend-run backend-test web-dev web-check mobile-check security check

.DEFAULT_GOAL := help

help: ## Show available workspace commands
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

db-up: ## Start local PostgreSQL 16 container (requires infra/.env)
	cd infra && docker compose up -d

db-down: ## Stop local PostgreSQL 16 container
	cd infra && docker compose down

db-logs: ## Tail local PostgreSQL logs
	cd infra && docker compose logs -f postgres

backend-run: ## Run Spring Boot API locally (loads infra/.env)
	@test -f infra/.env || (echo "Missing infra/.env — copy infra/.env.example to infra/.env first." && exit 1)
	@set -a && . ./infra/.env && set +a && cd backend && ./mvnw spring-boot:run

backend-test: ## Run Spring Boot tests
	cd backend && ./mvnw test

web-dev: ## Start Next.js dev server
	cd web && npm run dev

web-check: ## Lint, typecheck, and build Next.js web portal
	cd web && npm run lint && npx tsc --noEmit && npm run build

mobile-check: ## Analyze and test Flutter mobile app
	cd mobile && flutter analyze && flutter test

security: ## Run automated security red-line checks
	./.agent/skills/security-auditor/scripts/security_check.sh

check: backend-test web-check mobile-check security ## Run all backend, web, mobile, and security checks
