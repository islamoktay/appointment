# **Full-Stack Project Execution Workflow (Living Blueprint)**

## **Step-by-Step Order of Operations — From Idea to Production**

## **How to Use This Blueprint**

* **Generic Reference vs. Project Plan:** This Playbook is a **generic, project-agnostic meta-workflow** meant to be reused and refined across all future projects. Keep project-specific requirements, schemas, API contracts, and live status tracking strictly inside your project's **`SDLC Master Plan`** (`docs/sdlc-master-plan.md`).
* **Sync to Repo & Lock AI Governance (`/AGENTS.md`) First:** At the start of a new repository, sync both `docs/full-stack-project-playbook.md` and `docs/sdlc-master-plan.md` into `/docs`, and immediately create a lean `/AGENTS.md` at the repo root declaring their separate roles without duplicating spec tables from the Master Plan.
* **Follow the Sequence & Capture Lessons Learned:** Move step-by-step from Step 1 to Step 13. Whenever you discover a critical workflow step or architectural guardrail during a project, add it to this generic Playbook so you never forget it in your next project.

# **The Execution Steps (Optimal Order)**

## **1\. Define Product Vision & Create the SDLC Master Plan**

* **What to do:** Write a living SDLC Master Plan document before touching code.  
* **What it should mention:**  
  * **Product Vision:** What the user sees and does (user roles, core journeys, and problem solved).  
  * **Technical Backbone:** What sits behind the scenes (security, concurrency, data rules).  
  * **MVP Boundaries:** Clear separation between *v1 Must-Haves* and *v2 Future Features* so scope stays controlled.

## **2\. Decide on Tech Stack & High-Level Architecture**

* **What to do:** Lock in your tools, frameworks, and repository structure.  
* **What it should mention:**  
  * **Stack Choices:** Backend framework (e.g., Java Spring Boot), Database (e.g., PostgreSQL), Web frontend (e.g., Next.js), Mobile app (e.g., Flutter), and Hosting/Containers (e.g., Docker).  
  * **Repo Structure:** Monorepo or multi-repo layout (`/backend`, `/web`, `/mobile`, `/infra`, `/docs`, `/.agent/skills/`).  
  * **Communication Style:** REST vs. WebSockets/SSE, and API-first contract rules (OpenAPI / Swagger).

## **3\. Design the Data Model & Database Schema**

* **What to do:** Map out your core entities, relationships, and data integrity rules before building APIs or screens.  
* **What it should mention:**  
  * **Tables & Relations:** Primary keys (UUIDs), foreign keys, status enums, explicit timezone columns (if scheduling/time-sensitive), and timestamps.  
  * **Integrity & Concurrency Guards:** Unique constraints, partial indexes (e.g., preventing double-bookings), and optimistic locking (`@Version`).  
  * **Migrations:** Versioned SQL scripts (e.g., Flyway `V1__init_schema.sql`).

## **4\. Define the Design System & UI/UX Wireframes**

* **What to do:** Establish visual rules and map every screen before writing frontend code.  
* **What it should mention:**  
  * **Design Tokens:** Brand colors, neutral backgrounds, semantic status colors (Success, Warning, Error, Completed), typography scale, and spacing/border-radius rules.  
  * **User Flows & Wireframes:** Screen-by-screen flow for every user role (Auth \-\> Main Action \-\> History/Management), including empty, loading, and error states.  
  * **Core Component List:** Buttons, inputs, cards, badges, modals, and pickers shared across Web and Mobile.

## **5\. Lock the API Contract (Endpoints & DTOs)**

* **What to do:** Explicitly write down all REST endpoints, request/response JSON payloads, and error formats in the Master Plan so Backend, Web, and Mobile can be built cleanly against one locked contract.  
* **What it should mention:**  
  * **Endpoint & DTO Specification:** HTTP methods, paths, required roles, query parameters, and exact request/response DTO fields (including denormalized display fields like names to avoid N+1 client fetches).  
  * **Standard Error Envelope:** Unified JSON error structure for `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, and `409 Conflict`.

## **6\. Review the Plan (Pre-Code Audit)**

* **What to do:** Pause before writing code (or over-building process tooling) to run a **Red-Team Spec Audit** (`business-analyst` skill) on the Master Plan, catch contradictions between sections, and right-size scope.  
* **What it should mention:**  
  * **Zero-Ceremony Red-Team Audit:** Never generate separate BA/Tech Lead handoff memos that compete with the Master Plan. Have the `business-analyst` and `security-auditor` skills skip summaries, surface only unhandled domain edge cases or security holes as concrete decision questions, and patch the answers directly into `docs/sdlc-master-plan.md`.  
  * **Security Red-Line Audit (`security-auditor` & `scripts/security_check.sh`):** Verify the Master Plan locks anti-IDOR ownership rules (always extracting actor IDs from the server JWT principal, never from request bodies), fail-fast `JWT_SECRET` (no `${JWT_SECRET:default}` fallback in main config), Next.js BFF `HttpOnly` cookie-to-Bearer forwarding, BCrypt 72-byte / array size DoS bounds, Actuator `health`-only lockdown, sanitized error envelopes, and `127.0.0.1`/internal DB port isolation. Pair the skill with an executable `scripts/security_check.sh` scanner so checks are deterministic rather than prose-only.  
  * **Schema vs. Logic Alignment:** Verify every rule promised in prose (e.g., IANA timezone handling, status exclusions in queries vs. partial unique indexes, state machine guards) is backed by columns and constraints in the SQL schema.  
  * **Cross-Phase Endpoint Parity:** Verify every endpoint consumed by Web or Mobile phases is explicitly listed in the Backend implementation checklist with locked DTOs.  
  * **Scope & Learning Balance:** Strip accidental scope creep (e.g., complex refresh-token rotation when stateless JWT suffices for v1) while keeping hands-on learning goals intact.

## **7\. Set Up Project Skeletons & Local Environment**

* **What to do:** Initialize Git, sync documentation, establish portable AI guardrails, and scaffold empty runnable projects for every layer.  
* **What it should mention:**  
  * **Git & Docs Sync:** Run `git init`, add a root `.gitignore`, and sync `docs/sdlc-master-plan.md` and `docs/full-stack-project-playbook.md` into `/docs`.  
  * **Lean Root `/AGENTS.md` (Pointer-Based):** Create `/AGENTS.md` defining documentation governance (Playbook = generic blueprint; Master Plan = project Single Source of Truth) and repo routing without duplicating spec tables from the Master Plan.  
  * **100% Project-Agnostic, Zero-Ceremony AI Skills (`/.agent/skills/`):** Package role skills (`business-analyst` for Step 6 spec auditing; `tech-lead` for Steps 7–13 direct milestone execution & verification; `security-auditor` for enforcing the 6 catastrophic security red lines across spec and code) and stack skills (`spring-boot-architecture`, `nextjs-app-router`, `flutter-bloc-clean`) with zero project-specific domain terms so they can be copied into any future repository.  
  * **Database & Project Skeletons:** Local PostgreSQL via `docker-compose.yml`, plus initialized `/backend`, `/web`, and `/mobile` apps with `.env.example` templates, linters, and health check endpoints.

## **8\. Build Backend Foundation (Auth, Security & Base Plumbing)**

* **What to do:** Get authentication, role permissions, and global error handling working first.  
* **What it should mention:**  
  * **Auth Flows:** Register, Login, password hashing (BCrypt), and stateless JWT generation/validation.  
  * **Role Guards:** Route and method-level authorization (`@PreAuthorize`) separating user roles.  
  * **Global Exception Handler:** `@RestControllerAdvice` translating exceptions into the locked JSON error envelope.

## **9\. Build Backend Core Domain & Business Logic**

* **What to do:** Implement the actual features, calculations, and database transactions, and verify them via Swagger/Postman and integration tests.  
* **What it should mention:**  
  * **Services & Repositories:** Core domain rules isolated in `@Service` classes using immutable `record` DTOs.  
  * **Transaction & Conflict Safety:** `@Transactional` boundaries and catching database constraint violations (`409 Conflict`).  
  * **Backend Tests:** Unit tests for business logic and integration tests (Testcontainers) for concurrency/database rules.

## **10\. Build Web Frontend (Next.js)**

* **What to do:** Build the browser application connecting to your verified backend APIs.  
* **What it should mention:**  
  * **Theme & Primitives:** Apply design tokens in Tailwind CSS and build reusable UI components.  
  * **Auth & Middleware:** Login/Register screens, HTTP-only cookie session handling, and role-based route protection (`middleware.ts`).  
  * **Role Workspaces:** Server Components for fast data loading \+ Client Components for interactive forms, tables, and conflict alerts.

## **11\. Build Mobile App (Flutter)**

* **What to do:** Build the native mobile experience reusing the exact same REST APIs and DTOs.  
* **What it should mention:**  
  * **Architecture & Networking:** Feature-first folder structure, BLoC state management, `Dio` HTTP client with auth interceptors, and `flutter_secure_storage`.  
  * **Core Screens:** Auth flow, primary user actions, history/management tabs, and graceful handling of network or `409 Conflict` errors.

## **12\. Run Cross-Platform End-to-End Testing & QA**

* **What to do:** Test the entire system together as real users across Web and Mobile.  
* **What it should mention:**  
  * **End-to-End Flows:** Perform actions on Web and verify immediate updates on Mobile (and vice versa).  
  * **Edge Cases:** Expired tokens, unauthorized role access (`403`), simultaneous conflicting actions (`409`), and slow/offline network behavior.

## **13\. Containerize, Set Up CI/CD & Deploy**

* **What to do:** Package the system for production and extract reusable templates for your next project.  
* **What it should mention:**  
  * **Docker & Reverse Proxy:** Multi-stage Dockerfiles for Backend and Web, orchestrated with PostgreSQL behind Nginx/Caddy with HTTPS/TLS.  
  * **CI/CD & Mobile Builds:** GitHub Actions for automated build/test checks, plus production Android APK / iOS TestFlight builds.  
  * **Post-Launch Iteration:** Monitoring (`/actuator/health`, logs) and updating this living playbook with lessons learned.

---

# **Project Tracker Template (Copy Into Your Project's SDLC Master Plan)**

| Step | Status (`TODO` / `DOING` / `DONE`) | Notes / Pivots / Decisions Made |
| :---- | :---- | :---- |
| **1\. Product Vision & SDLC Master Plan** | `TODO` |  |
| **2\. Tech Stack & Architecture** | `TODO` |  |
| **3\. Data Model & DB Schema** | `TODO` |  |
| **4\. Design System & UI/UX Wireframes** | `TODO` |  |
| **5\. API Contract (Endpoints & DTOs)** | `TODO` |  |
| **6\. Review the Plan (Pre-Code Audit)** | `TODO` |  |
| **7\. Project Skeletons & Local Env** | `TODO` |  |
| **8\. Backend Foundation & Auth** | `TODO` |  |
| **9\. Backend Core Domain & Logic** | `TODO` |  |
| **10\. Web Frontend (Next.js)** | `TODO` |  |
| **11\. Mobile App (Flutter)** | `TODO` |  |
| **12\. Cross-Platform E2E QA** | `TODO` |  |
| **13\. Containerize, CI/CD & Deploy** | `TODO` |  |
