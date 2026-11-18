# AGENTS.md — Root AI Governance & Monorepo Router

## 1. Documentation Roles & Single Source of Truth (CRITICAL)

Always respect the strict separation between the two core documents in `/docs` (and their corresponding Google Drive sources):

1. **[docs/sdlc-master-plan.md](file:///Users/ahmetoktay/appointment/docs/sdlc-master-plan.md)** *(Google Drive ID: `1uVgD1lKTSkNEfPU-TJJTfZ7tP2YV7PmdkuMQ37rzTR0`)*
   * **Role:** **Project-Specific Single Source of Truth** for the **Appointment & Queue Booking System**.
   * **Usage:** All functional requirements, database schemas, locked API/DTO contracts, design tokens, and implementation milestones live exclusively in `docs/sdlc-master-plan.md`. Never duplicate its tables here; read `docs/sdlc-master-plan.md` directly.

2. **[docs/full-stack-project-playbook.md](file:///Users/ahmetoktay/appointment/docs/full-stack-project-playbook.md)** *(Google Drive ID: `1Qk56y5ud-rFa7ShdFo9RQmoWKtD7S_ug-DqxvRcK0WI`)*
   * **Role:** **Generic, Project-Agnostic Reference Blueprint**.
   * **Usage:** A reusable meta-workflow template for future full-stack projects. **Never** put project-specific logic or live project status in this file. Only update it when capturing a reusable workflow step, guardrail, or lesson learned for future projects.

---

## 2. Monorepo Map

```text
/
├── /.agent/skills/                  # 100% Project-Agnostic, Reusable AI Skills
│   ├── /business-analyst/           # Requirements auditing, invariants, state machines & BDD specs
│   ├── /tech-lead/                  # Contract gatekeeping, task decomposition & subagent orchestration
│   ├── /spring-boot-architecture/   # Java 21+ / Spring Boot 3.x / Flyway / DTO & testing rules
│   ├── /nextjs-app-router/          # Next.js App Router / TypeScript / Tailwind / Cookie auth rules
│   └── /flutter-bloc-clean/         # Flutter 3.x / Feature-first BLoC / Dio / Secure storage rules
├── /AGENTS.md                       # Root AI governance & monorepo routing pointer (this file)
├── /docs/
│   ├── sdlc-master-plan.md          # Active Project Master Plan, Locked Contracts & Live Tracker
│   └── full-stack-project-playbook.md # Generic reusable blueprint for future projects
├── /backend/                        # Spring Boot 3.x REST API & Flyway Migrations
├── /web/                            # Next.js App Router Web Portal
├── /mobile/                         # Flutter 3.x Mobile Client Application
└── /infra/                          # Docker Compose, PostgreSQL 16, Nginx & ENV templates
```

---

## 3. Agent Operating Rules

* **Keep Skills Portable:** All `SKILL.md` files under `/.agent/skills/` must remain 100% project-agnostic so they can be copied into any future repository unchanged.
* **Contract-First Execution:** Before modifying `/backend`, `/web`, or `/mobile`, verify the locked database schema, API endpoints, DTO payloads, error envelope, and design tokens in **[docs/sdlc-master-plan.md](file:///Users/ahmetoktay/appointment/docs/sdlc-master-plan.md)**.
* **Load the Matching Stack Skill:** When working inside `/backend`, `/web`, or `/mobile`, load and follow the corresponding skill in `/.agent/skills/`.
