# AGENTS.md — Root AI Governance & Monorepo Router

## 1. Documentation Roles & Single Source of Truth (CRITICAL)

Always respect the strict separation between the two core documents in `/docs` (and their corresponding Google Drive sources):

1. **[docs/sdlc-master-plan.md](file:///Users/ahmetoktay/appointment/docs/sdlc-master-plan.md)** *(Google Drive ID: `1uVgD1lKTSkNEfPU-TJJTfZ7tP2YV7PmdkuMQ37rzTR0`)*
   * **Role:** **Project-Specific Single Source of Truth** for the **Appointment & Queue Booking System**.
   * **Usage:** All functional requirements, database schemas, locked API/DTO contracts, design tokens, and implementation milestones live exclusively in `docs/sdlc-master-plan.md`. Never duplicate its tables here; read only the needed line range directly:
     * Design System & UI/UX: `L111–L143` · Guardrails & Security Red-Lines: `L144–L176`
     * DB Schema (`V1__init_schema.sql`): `L177–L222` · Locked API Contract & Error Envelope: `L225–L297`
     * Checklists — Backend: `L300–L326` · Web: `L329–L353` · Mobile: `L356–L375` · QA & DevOps: `L378–L441`
     * Live Execution Tracker: `L444–L460`

2. **[docs/full-stack-project-playbook.md](file:///Users/ahmetoktay/appointment/docs/full-stack-project-playbook.md)** *(Google Drive ID: `1Qk56y5ud-rFa7ShdFo9RQmoWKtD7S_ug-DqxvRcK0WI`)*
   * **Role:** **Generic, Project-Agnostic Reference Blueprint**.
   * **Usage:** A reusable meta-workflow template for future full-stack projects. **Never** put project-specific logic or live project status in this file. Only update it when capturing a reusable workflow step, guardrail, or lesson learned for future projects.

---

## 2. Monorepo Map

```text
/
├── /.agent/skills/                  # 100% Project-Agnostic, Reusable AI Skills
│   ├── /business-analyst/           # Red-team spec auditing, domain invariants & edge cases
│   ├── /tech-lead/                  # Direct milestone execution, subagent delegation & verification
│   ├── /security-auditor/           # Catastrophic security red-lines (secrets, IDOR, auth, infra)
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
* **Scoped Reads & Context Hygiene:** Pass `StartLine`/`EndLine` when reading `docs/sdlc-master-plan.md` (using the section map above) instead of loading the entire file. For cross-file or architecture lookups, query `graphify-out/` (`graphify query "<question>" --budget 1500`) instead of scanning entire directory trees.
* **Milestone Auto-Kickoff & Clean Handoff:**
  * When the user requests execution with a short prompt (e.g., `"start next step"`, `"execute step N"`, `"continue"`), read only `L444–L460` of `docs/sdlc-master-plan.md` to identify the next `TODO` step, load `tech-lead` + the matching stack skill, read only the needed section ranges above, and execute it. *(For pure questions like `"what is next step?"`, answer briefly without modifying files.)*
  * After completing any milestone, run `graphify update .` (AST-only refresh, 0 LLM tokens; use `/graphify . --update` only after major doc rewrites), update `docs/sdlc-master-plan.md` & `CHANGELOG.md`, and **stop** — remind the user to start a fresh default-agent chat for the next milestone instead of auto-chaining in a long context.
* **Specialist Agents Only When Necessary:** Use the default agent for general project work (status, planning, backend, web, infra). Do **not** invoke or adopt specialist plugin agents (e.g. `flutter_a11y_agent`) unless the task explicitly requires them (e.g. an accessibility review of existing Flutter UI in `/mobile`).
