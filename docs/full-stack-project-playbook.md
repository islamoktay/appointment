# **Full-Stack Project Execution Workflow (Living Blueprint)**

## **Step-by-Step Order of Operations — From Idea to Production**

## **How to Use This Blueprint**

* **Generic Reference vs. Project Plan:** This Playbook is a **generic, project-agnostic meta-workflow** meant to be reused and refined across all future projects. Keep project-specific requirements, schemas, and milestones strictly inside your project's **`SDLC Master Plan`**.
* **Sync to Repo & Lock AI Governance (`/AGENTS.md`) First:** At the start of a new repository, sync both `docs/full-stack-project-playbook.md` and `docs/sdlc-master-plan.md` into `/docs`, and immediately create `/AGENTS.md` at the repo root declaring their separate roles so AI coding agents permanently remember the distinction across sessions.
* **Follow the Sequence & Capture Lessons Learned:** Move step-by-step from Step 1 to Step 13. Whenever you discover a critical workflow step or guardrail during a project, add it to this generic Playbook so you never forget it in your next project.

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
  * **Repo Structure:** Monorepo or multi-repo layout (`/backend`, `/web`, `/mobile`, `/infra`).  
  * **Communication Style:** REST vs. WebSockets/SSE, and API-first contract rules (OpenAPI / Swagger).

## **3\. Design the Data Model & Database Schema**

* **What to do:** Map out your core entities, relationships, and data integrity rules before building APIs or screens.  
* **What it should mention:**  
  * **Tables & Relations:** Primary keys (UUIDs), foreign keys, status enums, and timestamps.  
  * **Integrity & Concurrency Guards:** Unique constraints, partial indexes (e.g., preventing double-bookings), and optimistic locking (`@Version`).  
  * **Migrations:** Versioned SQL scripts (e.g., Flyway `V1__init_schema.sql`).

## **4\. Define the Design System & UI/UX Wireframes**

* **What to do:** Establish visual rules and map every screen before writing frontend code.  
* **What it should mention:**  
  * **Design Tokens:** Brand colors, neutral backgrounds, semantic status colors (Success, Warning, Error, Completed), typography scale, and spacing/border-radius rules.  
  * **User Flows & Wireframes:** Screen-by-screen flow for every user role (Auth \-\> Main Action \-\> History/Management), including empty, loading, and error states.  
  * **Core Component List:** Buttons, inputs, cards, badges, modals, and pickers shared across Web and Mobile.

## **5\. Lock the API Contract (Endpoints & DTOs)**

* **What to do:** Define all REST endpoints, request/response payloads, and error formats so Backend, Web, and Mobile can be built cleanly against one contract.  
* **What it should mention:**  
  * **Endpoint List:** HTTP methods, paths, required roles, and query parameters.  
  * **Standard Error Envelope:** Unified JSON error structure for `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, and `409 Conflict`.

## **6\. Review the Plan**

* **What to do:** Pause before writing code to critically audit the plan, catch technical blind spots, and right-size scope for your goals.  
* **What it should mention:**  
  * **Technical Blind Spots:** Check timezone handling (UTC vs. local IANA zones), date/schedule edge cases, concurrency race conditions, and data lifecycle gaps.  
  * **Scope & Learning Balance:** Separate intentional v1 shortcuts from v2 features, while keeping parts that serve your hands-on learning goals.  
  * **Contract Alignment:** Verify that every screen in your wireframes maps cleanly to defined API endpoints, DTOs, and database tables.

## **7\. Set Up Project Skeletons & Local Environment**

* **What to do:** Initialize empty runnable projects for every layer, sync documentation, and establish AI guardrails before generating feature code.  
* **What it should mention:**  
  * **Docs Sync & Root AI Governance (`/AGENTS.md`):** Sync `docs/sdlc-master-plan.md` and `docs/full-stack-project-playbook.md` into the repository and create `/AGENTS.md` first—explicitly defining **Documentation Roles & Governance** (Playbook = generic reusable reference; SDLC Master Plan = project-specific execution source of truth) alongside monorepo boundaries, error standards, and design tokens.  
  * **Stack-Specific AI Coding Skills:** Add stack-specific rules (e.g., `.agent/skills/`, `CLAUDE.md`, or `.cursor/rules/`) defining architecture boundaries, naming conventions, and best practices for Backend (Spring Boot), Web (Next.js App Router), and Mobile (Flutter BLoC).  
  * **Database:** Local PostgreSQL running via `docker-compose.yml`.  
  * **Backend, Web & Mobile:** Initialized repos with environment variable templates (`.env.example`), linters, and health check endpoints.

## **8\. Build Backend Foundation (Auth, Security & Base Plumbing)**

* **What to do:** Get authentication, role permissions, and global error handling working first.  
* **What it should mention:**  
  * **Auth Flows:** Register, Login, password hashing (BCrypt), and stateless JWT generation/validation.  
  * **Role Guards:** Route and method-level authorization (`@PreAuthorize`) separating user roles.  
  * **Global Exception Handler:** `@RestControllerAdvice` translating exceptions into clean HTTP responses.

## **9\. Build Backend Core Domain & Business Logic**

* **What to do:** Implement the actual features, calculations, and database transactions, and verify them via Swagger/Postman.  
* **What it should mention:**  
  * **Services & Repositories:** Core domain rules isolated in `@Service` classes.  
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

# **Living Project Tracker & Notes (Update As You Go)**

| Step | Status (`TODO` / `DOING` / `DONE`) | Notes / Pivots / Decisions Made |
| :---- | :---- | :---- |
| **1\. Product Vision & SDLC Master Plan** | `DONE` |  |
| **2\. Tech Stack & Architecture** | `DONE` |  |
| **3\. Data Model & DB Schema** | `DONE` |  |
| **4\. Design System & UI/UX Wireframes** | `DONE` |  |
| **5\. API Contract (Endpoints & DTOs)** | `DONE` |  |
| **6\. Review the Plan** | `DOING` |  |
| **7\. Project Skeletons & Local Env** | `TODO` | Sync `/docs`, lock `/AGENTS.md` doc governance (generic Playbook vs. project Master Plan), and add `.agent/skills/` |
| **8\. Backend Foundation & Auth** | `TODO` |  |
| **9\. Backend Core Domain & Logic** | `TODO` |  |
| **10\. Web Frontend (Next.js)** | `TODO` |  |
| **11\. Mobile App (Flutter)** | `TODO` |  |
| **12\. Cross-Platform E2E QA** | `TODO` |  |
| **13\. Containerize, CI/CD & Deploy** | `TODO` |  |

