# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Governance & Documentation:** Established `AGENTS.md`, `docs/sdlc-master-plan.md` (locked DB schema, REST API contract, design tokens, and execution tracker), `docs/full-stack-project-playbook.md`, and reusable AI skills under `.agent/skills/` (`business-analyst`, `tech-lead`, `security-auditor`, `spring-boot-architecture`, `nextjs-app-router`, `flutter-bloc-clean`).
- **Infra (`/infra`):** Added local PostgreSQL 16 `infra/docker-compose.yml` (loopback-bound to `127.0.0.1:5432`) and `infra/.env.example`.
- **Backend (`/backend`):** Scaffolded Spring Boot 3.5.16 (Java 21) with Spring Security, JPA, Flyway, Springdoc OpenAPI (`/v3/api-docs`), Testcontainers, initial migration `V1__init_schema.sql` (`users`, `provider_schedules`, `appointments`, `idx_unique_active_slot`), and bootstrap contract tests.
- **Web (`/web`):** Scaffolded Next.js App Router (TypeScript + Tailwind CSS) with brand design tokens, server environment helper, and locked API/error DTO TypeScript definitions (`src/types/api.ts`).
- **Mobile (`/mobile`):** Scaffolded Flutter 3.x feature-first architecture (`core/`, `features/{auth,providers,booking,appointments}/`), shared `AppTheme` / `AppColors`, `Dio` client with auth interceptor, `flutter_secure_storage` token wrapper, locked `ApiException` parser, and accessibility/contract widget tests.
- **Workspace Tooling:** Added root `Makefile` with unified targets (`db-up`, `db-down`, `backend-run`, `backend-test`, `web-dev`, `web-check`, `mobile-check`, `security`, `check`).

### Changed
- Added `graphify-out/` to `.gitignore` and removed generated knowledge-graph cache files from Git tracking while keeping them locally on disk.

### Security
- Added `.agent/skills/security-auditor/scripts/security_check.sh` to enforce automated checks against leaked `.env`/key files, `JWT_SECRET` default fallbacks, dangerous Actuator exposure, direct JPA `@Entity` request binding, `localStorage`/`NEXT_PUBLIC_` token leaks, mobile `Authorization` header logging, and `0.0.0.0:5432` DB exposure.
