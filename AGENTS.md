# AGENTS.md — Root AI Coding Standards & Monorepo Guide

## 1. Documentation Roles & Governance (CRITICAL)

Always respect the strict separation between the two core documents in `/docs` (and their corresponding Google Drive sources):

1. **`docs/sdlc-master-plan.md`** *(Google Drive ID: `1uVgD1lKTSkNEfPU-TJJTfZ7tP2YV7PmdkuMQ37rzTR0`)*
   * **Role:** **Project-Specific Execution Plan** for the **Appointment & Queue Booking System**.
   * **Usage:** This is the active source of truth for building this project. All requirements, database schemas, API contracts, UI flows, and implementation milestones live here. Execute features and track project milestones against this document.

2. **`docs/full-stack-project-playbook.md`** *(Google Drive ID: `1Qk56y5ud-rFa7ShdFo9RQmoWKtD7S_ug-DqxvRcK0WI`)*
   * **Role:** **Generic, Project-Agnostic Reference Blueprint**.
   * **Usage:** This is a living meta-workflow template designed to be reused across future full-stack projects. **Do not** put project-specific logic here. Only update it when the user wants to capture a critical workflow step, best practice, or lesson learned so it is never forgotten in future projects.

---

## 2. Monorepo Structure

```text
/
├── /.agent/skills/                  # Role & Stack-specific AI skills & architecture rules
│   ├── /business-analyst/           # Requirements, domain invariants, edge cases & acceptance criteria
│   ├── /tech-lead/                  # Architecture gatekeeper, contract locking & task delegation
│   ├── /spring-boot-architecture/   # Backend rules (Java 21+, Spring Boot 3.x, Flyway, DTO records)
│   ├── /nextjs-app-router/          # Web rules (Next.js App Router, Tailwind, HTTP-only cookies)
│   └── /flutter-bloc-clean/         # Mobile rules (Flutter 3.x, BLoC, Dio, flutter_secure_storage)
├── /AGENTS.md                       # Root AI coding standards, governance & repo map
├── /docs/                           # Synced project & reference documentation
│   ├── sdlc-master-plan.md          # Project-specific master plan (Active Execution Source)
│   └── full-stack-project-playbook.md # Generic reusable blueprint for future projects
├── /backend/                        # Spring Boot 3.x REST API & Flyway Migrations
├── /web/                            # Next.js App Router Web Portal (Provider & Client flows)
├── /mobile/                         # Flutter Mobile Client Application (Client flows)
└── /infra/                          # Orchestration (docker-compose.yml, Nginx, ENV templates)
```

---

## 3. Architectural Guardrails & Cross-Stack Standards

* **API-First Contract:** The Spring Boot backend exposes an OpenAPI 3.0 specification (`/v3/api-docs`) as the single source of truth. Next.js (`/web`) and Flutter (`/mobile`) DTOs must strictly match this contract.
* **Concurrency & Double-Booking Guard:** Overlapping active appointments (`CONFIRMED`, `IN_PROGRESS`) are prevented at the database level via the partial unique index `idx_unique_active_slot (provider_id, appointment_date, start_time)` and optimistic locking (`version`). Backend conflicts must return `HTTP 409 Conflict`, and both Web and Mobile clients must catch `409` responses, alert the user, and automatically refresh available slots.
* **Unified Error Envelope:** All backend error responses (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`) must return a consistent JSON structure via `@RestControllerAdvice`.
* **Stateless Authentication & RBAC:**
  * Two roles: `PROVIDER` and `CLIENT`.
  * **Web (`/web`):** Stores JWTs in secure `HTTP-Only` cookies via Next.js Route Handlers and enforces role-aware navigation in `middleware.ts`.
  * **Mobile (`/mobile`):** Stores JWTs in `flutter_secure_storage` and attaches them via `Dio` interceptors.
* **Timezone & Schedule Rules:**
  * All dates and time windows follow explicit timezone handling (UTC ISO-8601 timestamps on the wire / explicit `YYYY-MM-DD` and `HH:mm` local time boundaries) to prevent off-by-one-hour drift across PostgreSQL, Spring Boot, Next.js, and Flutter.
  * v1 enforces one continuous shift per `day_of_week` (`UNIQUE (provider_id, day_of_week)`).

---

## 4. Shared Design Tokens

| Semantic Token | Hex / Tailwind | Usage |
| :--- | :--- | :--- |
| **Primary Brand** | `#0F172A` (`slate-900`) | Main navigation, primary buttons, structural accents |
| **Surface Neutral** | `#F8FAFC` (`slate-50`) | App background, secondary cards, muted panels |
| **Confirmed / Active** | `#059669` (`emerald-600`) | Successful bookings, active slot chips, positive alerts |
| **Pending / Queue** | `#D97706` (`amber-600`) | Waitlist indicators, `IN_PROGRESS` / queue states |
| **Cancelled / Error** | `#E11D48` (`rose-600`) | Cancelled badges, destructive actions, errors |
| **Completed / Muted** | `#475569` (`slate-600`) | Historical appointments, disabled slots, archived logs |
