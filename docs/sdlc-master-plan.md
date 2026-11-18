# **SDLC Master Plan: Appointment & Queue Booking System**

## **End-to-End Architecture, Integration, and Execution Blueprint**

---

# **0\. Product & Technical Vision Summary**

## **What We Will Have as a Product (User Experience)**

A dual-sided, cross-platform scheduling and queue management application connecting service providers and clients in real time:

* **For Service Providers (Next.js Web Portal):** A clean browser-based workspace where providers define their recurring weekly working hours and slot durations, view their daily appointment queue at a glance, and manage live appointment states (completing or cancelling bookings).  
* **For Clients (Next.js Web Portal & Flutter Mobile App):** A fast, responsive booking experience across both browser and native mobile where clients browse available providers, pick a date to view real-time open time slots, reserve an appointment with instant feedback, and manage or cancel their upcoming bookings.  
* **Core Value:** Eliminates manual back-and-forth scheduling and double-bookings through live availability calculation and synchronized state across web and mobile.

## **What Is Behind It (Technical & Architectural Backbone)**

A production-grade, decoupled full-stack foundation built to validate reusable patterns for larger systems:

* **API-First Contract & Unified DTOs:** A Spring Boot 3.x REST API exposing an OpenAPI 3.0 specification that serves as the single source of truth for both Next.js and Flutter clients.  
* **Database-Enforced Concurrency Safety:** PostgreSQL 16 backing the domain with Flyway versioned migrations, optimistic locking, and a partial unique index (`idx_unique_active_slot`) that guarantees zero double-bookings under simultaneous requests (`409 Conflict` handling).  
* **Dynamic Slot Generation Engine:** A stateless backend calculation service that computes available time windows on the fly by combining recurring weekly schedules, current time cutoffs, and active confirmed bookings.  
* **End-to-End Stateless Security:** Role-based access control (`PROVIDER` vs. `CLIENT`) powered by JWT authentication—stored in HTTP-only cookies with role-aware middleware guards on Next.js supporting both roles, and encrypted via `flutter_secure_storage` with Dio interceptors for client access on Flutter.  
* **Containerized Deployment Pipeline:** Multi-stage Docker builds orchestrated via Docker Compose behind an Nginx/Caddy reverse proxy, backed by automated GitHub Actions CI/CD checks.

---

# **1\. Project Overview & Objectives**

## **Purpose**

Build an end-to-end full-stack pilot application to validate core architecture patterns, shared API contracts, authentication flows, and deployment pipelines before scaling to a larger production ecosystem. This system orchestrates real-time appointment scheduling, provider availability configuration, dynamic time-slot calculation, and concurrency-safe queue management.

## **Platform Tech Stack**

| Layer | Primary Technology | Core Modules & Libraries |
| :---- | :---- | :---- |
| **Backend API** | Java 21+ / Spring Boot 3.x | Spring Web, Spring Security, Spring Data JPA, Flyway, Lombok, OpenAPI 3.0 |
| **Database** | PostgreSQL 16 | Relational Schema, Partial Unique Indexes, Optimistic Locking (`@Version`) |
| **Web Portal** | Next.js (App Router) | TypeScript, Tailwind CSS, Lucide React, Server Components, Route Handlers (Provider Dashboard & Schedule, Client Directory, Slot Booking, and My Bookings). Serves as a hands-on learning track for App Router patterns (Server/Client Components, dynamic `[id]` routes, Route Handlers, and role-aware `middleware.ts`). |
| **Mobile App** | Flutter 3.x | Dart, BLoC Architecture, Dio HTTP, `flutter_secure_storage` |
| **DevOps & Infra** | Docker & GitHub Actions | Docker Compose, Nginx Reverse Proxy, Multi-stage Builds, CI/CD Workflows |

---

# **2\. Phase 1: Planning & Requirements Analysis**

## **Functional Requirements Matrix**

### **1\. Authentication & Authorization**

* **Identity Management:** Universal user registration and authentication supporting explicit role assignments (`PROVIDER` or `CLIENT`).  
* **Session Lifecycle:** Stateless JWT authentication issuing access tokens and refresh tokens with automated client-side renewal and clear invalidation handling.

### **2\. Provider Capabilities (Next.js Web Portal)**

* **Schedule Configuration:** Configure weekly recurring availability matrices including active operational days, daily start/end boundaries, and uniform slot durations (e.g., 15, 30, or 60 minutes).  
* **Operational Dashboard:** Real-time visibility into daily and upcoming booking schedules with live queue tracking.  
* **Lifecycle Management:** State transitions enabling providers to start, complete, or cancel appointments (`IN_PROGRESS`, `COMPLETED`, or `CANCELLED`).

### **3\. Client Capabilities (Next.js Web Portal & Flutter Mobile Application)**

* **Provider Discovery (Web & Mobile):** Browse, filter, and search active service providers.  
* **Dynamic Slot Picker (Web & Mobile):** Interactively select target dates to view dynamically calculated available time slots.  
* **Booking Engine (Web & Mobile):** Reserve open slots with instant transaction verification and graceful UI handling for concurrent booking conflicts.  
* **Appointment Hub (Web & Mobile):** Dedicated management space displaying `Upcoming` and `Past` bookings with self-service cancellation mechanisms for future slots.

### **4\. Real-Time Status Engine (Stretch Goal)**

* **Live Updates:** Low-latency queue position and status tracking delivered via Server-Sent Events (SSE) or WebSockets.

## **Non-Functional Requirements & System Guarantees**

```
+-----------------------------------------------------------------------------------+
|                            NON-FUNCTIONAL REQUIREMENTS                            |
+--------------------------+--------------------------+-----------------------------+
|    Concurrency Safety    |     API Consistency      |      Security Baseline      |
|  Zero double-bookings    | Envelope standardisation |   BCrypt password hashing   |
|  under high contention   | HTTP status mapping      |   Role-based RBAC guards    |
|  via DB partial indexes  | Structured Error DTOs    |   Secure credential storage |
+--------------------------+--------------------------+-----------------------------+
```

---

# **3\. Phase 2: System Architecture & Design System**

## **Workspace Repository Structure**

```
/ root-repository
├── /.agent/skills/     # Stack-specific AI coding skills & architecture rules
├── /AGENTS.md          # Root AI coding standards, conventions & repo map
├── /backend            # Spring Boot 3.x REST API & Flyway Migrations
├── /web                # Next.js App Router Web Portal
├── /mobile             # Flutter Mobile Client Application
└── /infra              # Orchestration (docker-compose, Nginx, ENV templates)
```

## **AI Coding Skills & Code Maintainability Guardrails**

* **Root Context (**`AGENTS.md` / `CLAUDE.md`): Documents monorepo boundaries, API-first OpenAPI contract rules, unified JSON error envelopes, and timezone handling so any AI assistant stays aligned across layers.  
* **Backend Skill (**`spring-boot-architecture`): Enforces thin controllers, `@Service` transaction boundaries, strict Java `record` Request/Response DTOs (never exposing JPA entities), Flyway-only schema changes, and `@RestControllerAdvice` exception mapping.  
* **Web Skill (**`nextjs-app-router`): Enforces Server vs. Client Component separation, Tailwind design token usage, HTTP-only cookie session handling, and role-aware `middleware.ts` conventions.  
* **Mobile Skill (**`flutter-bloc-clean`): Enforces feature-first folder boundaries (`core/` vs. `features/`), BLoC state/event immutability, `Dio` interceptor error mapping, and `flutter_secure_storage` rules.

## **API Contract Standard**

The system enforces an **API-First Strategy**. OpenAPI 3.0 (Swagger) specifications are served directly from `/v3/api-docs`. All client DTOs, request payloads, and response structures across Next.js and Flutter are generated or validated against this unified contract.

## **Design System & UI/UX Standards**

### **Color Tokens & Semantic Assignments**

| Semantic Token | Color Code | Context & Application |
| :---- | :---- | :---- |
| **Primary Brand** | `#0F172A` / Slate 900 | Main navigation, primary buttons, structural accents |
| **Surface Neutral** | `#F8FAFC` / Slate 50 | Application background, secondary cards, muted panels |
| **Confirmed / Active** | `#059669` / Emerald 600 | Successful bookings, active slot chips, positive alerts |
| **Pending / Queue** | `#D97706` / Amber 600 | Waitlist indicators, processing states, queue position |
| **Cancelled** | `#E11D48` / Rose 600 | Cancelled badges, destructive action triggers, errors |
| **Completed** | `#475569` / Slate 600 | Historical appointments, disabled slots, archived logs |

### **Design Specifications**

* **Typography:** Web defaults to Inter/Geist font families; Mobile leverages system native Google Fonts. Hierarchies are strictly segmented across Display, Heading, Body, and Caption scales.  
* **Spacing & Radii:** Structured 4px/8px grid system. Form elements and buttons utilize an 8px radius (`rounded-md`); cards and containers enforce a 12px radius (`rounded-xl`).

### **Key User Workflows**

```
Flow A (Provider Journey):
[Register / Login] -> [Configure Weekly Schedule] -> [View Dashboard] -> [Manage Appointment State]

Flow B (Client Journey - Web & Mobile):
[Register / Login] -> [Select Provider] -> [Choose Date & Slot] -> [Confirm Booking] -> [View My Bookings]
```

## **Architectural Guardrails & Scope Decisions**

* **Timezone Strategy:** All dates and time windows operate on an explicit timezone standard (provider's configured IANA timezone / UTC ISO-8601 timestamps on the wire) to prevent off-by-one-hour drift across PostgreSQL, Spring Boot, Next.js, and Flutter.  
* **Schedule Granularity (Intentional v1 Scope):** `provider_schedules` enforces one continuous shift per `day_of_week` (`UNIQUE (provider_id, day_of_week)`) for v1 simplicity; split shifts (lunch breaks) and single-date holiday overrides are deferred to v2.  
* **Queue Management Definition:** Unifies fixed-slot booking with a live daily provider queue—each confirmed appointment is ordered chronologically as the provider's active queue, supporting live status progression (`CONFIRMED` \-\> `IN_PROGRESS` \-\> `COMPLETED` or `CANCELLED`) so clients and providers can track who is currently being served and who is next.

## **Database Schema (PostgreSQL)**

```sql
-- Core User Entities
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('PROVIDER', 'CLIENT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

```sql
-- Weekly Recurring Availability Definitions
CREATE TABLE provider_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 30,
  CONSTRAINT unq_provider_day UNIQUE (provider_id, day_of_week)
);
```

```sql
-- Appointment Records with Optimistic Concurrency Control
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id),
  client_id UUID NOT NULL REFERENCES users(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED')),
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

```sql
-- Hard Concurrency Guard (Prevents overlapping active slots)
CREATE UNIQUE INDEX idx_unique_active_slot
ON appointments (provider_id, appointment_date, start_time)
WHERE status IN ('CONFIRMED', 'IN_PROGRESS');
```

# **4\. Phase 3: Backend Development (Java Spring Boot)**

## **Backend Execution Checklist**

- [ ] **Milestone 1: Project Bootstrap & Migration Engine**  
  - [ ] Initialize Spring Boot 3.x project dependencies (Web, Security, JPA, Flyway, PostgreSQL driver).  
  - [ ] Provision base container configuration (`docker-compose.yml` for local DB).  
  - [ ] Draft initial migration script `db/migration/V1__init_schema.sql`.  
- [ ] **Milestone 2: Security & Authentication Layer**  
  - [ ] Implement `JwtService` for stateless token signing, parsing, and claim validation.  
  - [ ] Implement `JwtAuthenticationFilter` and hook into Spring Security filter chain.  
  - [ ] Expose `POST /api/auth/register` and `POST /api/auth/login` controllers.  
  - [ ] Apply method-level permissions (`@EnableMethodSecurity` / `@PreAuthorize`).  
- [ ] **Milestone 3: Availability Engine & Slot Calculator**  
  - [ ] Build endpoints `PUT /api/providers/schedule` and `GET /api/providers/{id}/schedule`.  
  - [ ] Implement dynamic slot generation algorithm within `SlotCalculationService`:  
    - [ ] Map requested date to numeric `day_of_week`.  
    - [ ] Generate uniform time windows from `start_time` to `end_time`.  
    - [ ] Strip past slots if the target date is today.  
    - [ ] Exclude slots matching active `CONFIRMED` records in `appointments`.  
- [ ] **Milestone 4: Booking Orchestration & Concurrency Guard**  
  - [ ] Implement `POST /api/appointments` inside a transactional context (`@Transactional`).  
  - [ ] Capture relational race conditions (`DataIntegrityViolationException`) triggered by `idx_unique_active_slot`.  
  - [ ] Translate exceptions via `@RestControllerAdvice` into standardized `HTTP 409 Conflict` error envelopes.  
  - [ ] Implement management routes: `GET /api/appointments/me`, `PATCH /api/appointments/{id}/start`, `PATCH /api/appointments/{id}/complete`, and `PATCH /api/appointments/{id}/cancel`.

# **5\. Phase 4: Web Frontend Development (Next.js)**

## **Web Portal Implementation Plan**

Building both Provider and Client views in Next.js serves as a hands-on learning track for Next.js App Router patterns (Server Components, Client Components, dynamic `[id]` routes, Route Handlers, and role-aware `middleware.ts`).

- [ ] **Milestone 1: Design System & Core Layouts**  
  - [ ] Configure Tailwind design tokens (colors, typography, radii).  
  - [ ] Build reusable UI primitives: `Button`, `Input`, `Card`, `Badge`, `Modal`.  
  - [ ] Establish base layout shell with navigation bar and stateful header.  
- [ ] **Milestone 2: Authentication & Role-Based Route Guards**  
  - [ ] Construct `/login` and `/register` client views with form validation.  
  - [ ] Implement Route Handlers (`/api/auth/session`) to store tokens inside secure `HTTP-Only` cookies.  
  - [ ] Write Next.js `middleware.ts` to enforce role-aware redirects (`PROVIDER` \-\> `/provider/dashboard`, `/provider/schedule`; `CLIENT` \-\> `/providers`, `/my-bookings`).  
- [ ] **Milestone 3: Provider Schedule Configuration Workspace (**`/provider/schedule`)  
  - [ ] Build interactive weekly availability grid.  
  - [ ] Provide day toggle controls, time pickers (`start_time`, `end_time`), and slot length selectors (`15m`, `30m`, `60m`).  
  - [ ] Wire form actions to backend schedule update APIs.  
- [ ] **Milestone 4: Provider Operational Dashboard (**`/provider/dashboard`)  
  - [ ] Implement Server Components to pre-fetch daily schedules and booking queues.  
  - [ ] Integrate interactive state toggles (`Start`, `Complete`, `Cancel`) with optimistic UI updates and server action revalidation for live queue management.  
- [ ] **Milestone 5: Client Booking & Appointment Hub (**`/providers` & `/my-bookings`)  
  - [ ] Build Provider Directory page (`/providers`) and interactive Slot Picker view (`/providers/[id]`) with date selector, available slot grid, and `409 Conflict` alert \+ automatic slot refresh.  
  - [ ] Build Client Appointment Hub (`/my-bookings`) with `Upcoming` and `Past` tabs and self-service cancellation modal.

# **6\. Phase 5: Mobile App Development (Flutter)**

## **Mobile Application Strategy**

- [ ] **Milestone 1: Architecture & Network Plumbing**  
  - [ ] Scaffold feature-first structure: `core/`, `features/auth/`, `features/providers/`, `features/booking/`, `features/appointments/`.  
  - [ ] Define global `ThemeData` aligning with shared brand design tokens.  
  - [ ] Configure `Dio` instance equipped with automatic auth interceptors and token storage via `flutter_secure_storage`.  
- [ ] **Milestone 2: Mobile Authentication Flow**  
  - [ ] Implement UI screens for Login and Registration.  
  - [ ] Integrate BLoC state management to handle authentication lifecycle states (`Unauthenticated`, `Authenticating`, `Authenticated`).  
  - [ ] Implement silent auto-login check on app bootstrap.  
- [ ] **Milestone 3: Discovery & Dynamic Slot Selection**  
  - [ ] Construct Provider Directory list screen (`GET /api/providers`).  
  - [ ] Create interactive Slot Picker screen featuring a horizontal date selection bar and responsive grid of available time chips (`GET /api/providers/{id}/slots`).  
  - [ ] Implement robust error handling: Catch `409 Conflict` exceptions, present a user alert, and refresh available slots dynamically.  
- [ ] **Milestone 4: My Bookings Management Hub**  
  - [ ] Build tabbed operational view (`Upcoming` vs `Past`) consuming `GET /api/appointments/me`.  
  - [ ] Add pull-to-refresh functionality and bottom-sheet cancellation confirmation flows.

# **7\. Phase 6: Testing & Quality Assurance**

## **Verification Matrix**

| Backend Layer | Mobile & Web | End-to-End Flow |
| :---- | :---- | :---- |
| JUnit 5 Unit Tests Mockito Slot Tests Testcontainers DB | Manual UX Walkthroughs Session Expiration Token Refresh Validation | Cross-platform validation Real-time state sync Concurrency Verification |

* **Backend Unit & Integration Tests:**  
  * Write JUnit 5 tests evaluating boundary conditions in slot calculations (e.g., fractional duration fits, operational day overlaps, past-time stripping).  
  * Execute concurrent execution tests using Testcontainers and multi-threaded test runners to verify that DB partial unique indexes correctly trigger `409 Conflict` errors without corrupting data.  
* **Frontend & Mobile Verification:**  
  * Execute cross-platform integration cycles: Schedule created on Next.js Provider Portal \-\> Slot selected & booked via Next.js Web (Client) or Flutter Mobile \-\> Booking visible on Next.js Provider Dashboard \-\> Booking cancelled from either Web or Mobile \-\> Slot dynamically reopens across all client interfaces.  
  * Verify invalid/expired JWT handling across client environments (redirection to login on Web; state reset and secure storage clearing on Mobile).

# **8\. Phase 7: Deployment & DevOps**

## **Orchestration Architecture**

```
                              +-------------------+
                              |   Nginx / Caddy   |
                              |  (TLS / Port 443) |
                              +---------+---------+
                                        |
                +-----------------------+-----------------------+
                |                                               |
                v                                               v
      +-------------------+                           +-------------------+
      |  Next.js Web App  |                           |  Spring Boot API  |
      |  (Port 3000)      |                           |  (Port 8080)      |
      +-------------------+                           +---------+---------+
                                                                |
                                                                v
                                                      +-------------------+
                                                      |   PostgreSQL DB   |
                                                      |   (Port 5432)     |
                                                      +-------------------+
```

## **Containerization Strategy**

* **Spring Boot:** Multi-stage `Dockerfile` leveraging Eclipse Temurin JRE 21 runtime binaries.  
* **Next.js:** Multi-stage `Dockerfile` generating optimized output via `output: 'standalone'`.  
* **Docker Compose:** Production composition uniting `PostgreSQL`, `Spring Boot API`, `Next.js Web Portal`, and `Nginx` reverse proxy.

## **Continuous Integration & Delivery Pipeline**

* **Automated Checks:** GitHub Actions workflows executing build, lint, and test suites across `/backend`, `/web`, and `/mobile` on all incoming Pull Requests.  
* **Continuous Deployment:** Merges to main trigger automated multi-arch Docker image builds and deployment triggers to cloud compute nodes.  
* **Mobile Artifact Generation:** Release pipeline building production-ready Android APK binaries and iOS TestFlight bundles configured with target environment variables.

# **9\. Phase 8: Post-Launch Monitoring & Iteration**

## **Observability & Infrastructure Maintenance**

* **Application Observability:** Enforce structured JSON log output across Spring Boot services.  
* **Health Checks:** Expose health check metrics via `/actuator/health` and set up automated uptime pings.  
* **Pattern Extraction & System Evolution:** Document core architecture components (JWT filter structures, error envelopes, dynamic slot engines, and Flutter Dio/BLoC templates) to serve as standard blueprints for enterprise scaling.