# **SDLC Master Plan: Appointment & Queue Booking System**

## **End-to-End Architecture, Integration, and Execution Blueprint**

---

# **0\. Product & Technical Vision Summary**

## **What We Will Have as a Product (User Experience)**

A dual-sided, cross-platform scheduling and queue management application connecting service providers and clients in real time:

* **For Service Providers (Next.js Web Portal):** A clean browser-based workspace where providers define their recurring weekly working hours and slot durations, view their daily appointment queue at a glance, and manage live appointment states (starting, completing, or cancelling bookings).  
* **For Clients (Next.js Web Portal & Flutter Mobile App):** A fast, responsive booking experience across both browser and native mobile where clients browse available providers, pick a date to view real-time open time slots, reserve an appointment with instant feedback, and manage or cancel their upcoming bookings.  
* **Core Value:** Eliminates manual back-and-forth scheduling and double-bookings through live availability calculation and synchronized state across web and mobile.

## **What Is Behind It (Technical & Architectural Backbone)**

A production-grade, decoupled full-stack foundation built to validate reusable patterns for larger systems:

* **API-First Contract & Unified DTOs:** A Spring Boot 3.x REST API exposing an OpenAPI 3.0 specification that serves as the single source of truth for both Next.js and Flutter clients.  
* **Database-Enforced Concurrency Safety:** PostgreSQL 16 backing the domain with Flyway versioned migrations, optimistic locking, and a partial unique index (`idx_unique_active_slot`) that guarantees zero double-bookings under simultaneous requests (`409 Conflict` handling).  
* **Dynamic Slot Generation Engine:** A stateless backend calculation service that computes available time windows on the fly by combining recurring weekly schedules, the provider's configured IANA timezone cutoff, and active (`CONFIRMED` / `IN_PROGRESS`) bookings.  
* **End-to-End Stateless Security:** Role-based access control (`PROVIDER` vs. `CLIENT`) powered by stateless JWT authentication—stored in HTTP-only cookies with role-aware middleware guards on Next.js supporting both roles, and encrypted via `flutter_secure_storage` with Dio interceptors for client access on Flutter.  
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

* **Identity Management:** Universal user registration and authentication supporting explicit role assignments (`PROVIDER` or `CLIENT`) and IANA timezone (defaulting to `UTC`).  
* **Session Lifecycle (v1 Scope):** Stateless signed JWT access token (`24h` expiration) carrying `userId`, `email`, `fullName`, and `role` claims, with clear `401 Unauthorized` expiration handling on both Web and Mobile. *(Refresh token rotation is deferred to v2.)*

### **2\. Provider Capabilities (Next.js Web Portal)**

* **Schedule Configuration:** Configure weekly recurring availability matrices including active operational days (`1 = Monday` .. `7 = Sunday`), daily start/end boundaries, and uniform slot durations (`15`, `30`, or `60` minutes).  
* **Operational Dashboard:** Real-time visibility into daily and upcoming booking schedules with live queue tracking.  
* **Lifecycle Management:** State transitions enabling providers to start, complete, or cancel appointments (`CONFIRMED` \-\> `IN_PROGRESS` \-\> `COMPLETED`, or `CONFIRMED`/`IN_PROGRESS` \-\> `CANCELLED`).

### **3\. Client Capabilities (Next.js Web Portal & Flutter Mobile Application)**

* **Provider Discovery (Web & Mobile):** Browse, filter, and search active service providers.  
* **Dynamic Slot Picker (Web & Mobile):** Interactively select target dates to view dynamically calculated available time slots.  
* **Booking Engine (Web & Mobile):** Reserve open slots with instant transaction verification and graceful UI handling for concurrent booking conflicts (`409 Conflict` alert \+ automatic slot refresh).  
* **Appointment Hub (Web & Mobile):** Dedicated management space displaying `Upcoming` (`CONFIRMED`, `IN_PROGRESS`) and `Past` (`COMPLETED`, `CANCELLED`) bookings with self-service cancellation mechanisms for active slots.

### **4\. Real-Time Status Engine (v2 Stretch Goal)**

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

# **3\. Phase 2: System Architecture, Design System & Locked Contracts**

## **Workspace Repository Structure**

```
/ root-repository
├── /.agent/skills/     # 100% Project-agnostic AI skills (BA, Tech Lead, Spring, Next.js, Flutter)
├── /AGENTS.md          # Lean root AI governance & monorepo routing pointer
├── /docs               # Synced SDLC Master Plan (project source of truth) & generic Playbook
├── /backend            # Spring Boot 3.x REST API & Flyway Migrations
├── /web                # Next.js App Router Web Portal
├── /mobile             # Flutter Mobile Client Application
└── /infra              # Orchestration (docker-compose, Nginx, ENV templates)
```

## **AI Coding Skills & Code Maintainability Guardrails**

* **Root Context (`AGENTS.md`):** Lean pointer defining documentation governance (`sdlc-master-plan.md` vs. generic `full-stack-project-playbook.md`) and monorepo skill routing without duplicating spec tables.  
* **Role Skills (`business-analyst`, `tech-lead`):** Project-agnostic skills for requirement/edge-case auditing, contract locking, and 1-layer subagent task delegation with Creator-Verifier validation.  
* **Backend Skill (`spring-boot-architecture`):** Enforces thin controllers, `@Service` transaction boundaries, strict Java `record` Request/Response DTOs (never exposing JPA entities), Flyway-only schema changes, and `@RestControllerAdvice` exception mapping.  
* **Web Skill (`nextjs-app-router`):** Enforces Server vs. Client Component separation, Tailwind design token usage, HTTP-only cookie session handling, and role-aware `middleware.ts` conventions.  
* **Mobile Skill (`flutter-bloc-clean`):** Enforces feature-first folder boundaries (`core/` vs. `features/`), BLoC state/event immutability, `Dio` interceptor error mapping, and `flutter_secure_storage` rules.

## **Design System & UI/UX Standards**

### **Color Tokens & Semantic Assignments**

| Semantic Token | Color Code | Context & Application |
| :---- | :---- | :---- |
| **Primary Brand** | `#0F172A` / Slate 900 | Main navigation, primary buttons, structural accents |
| **Surface Neutral** | `#F8FAFC` / Slate 50 | Application background, secondary cards, muted panels |
| **Confirmed / Active** | `#059669` / Emerald 600 | Successful bookings, active slot chips, positive alerts |
| **Pending / Queue** | `#D97706` / Amber 600 | Waitlist indicators, `IN_PROGRESS` states, queue position |
| **Cancelled / Error** | `#E11D48` / Rose 600 | Cancelled badges, destructive action triggers, errors |
| **Completed / Muted** | `#475569` / Slate 600 | Historical appointments, disabled slots, archived logs |

### **Design Specifications**

* **Typography:** Web defaults to Inter/Geist font families; Mobile leverages system native Google Fonts. Hierarchies are strictly segmented across Display, Heading, Body, and Caption scales.  
* **Spacing & Radii:** Structured 4px/8px grid system. Form elements and buttons utilize an 8px radius (`rounded-md`); cards and containers enforce a 12px radius (`rounded-xl`).

### **Key User Workflows & Screen States**

```
Flow A (Provider Journey - Next.js Web):
[Register / Login] -> [Configure Weekly Schedule (/provider/schedule)] -> [View Daily Queue (/provider/dashboard)] -> [Start / Complete / Cancel Booking]

Flow B (Client Journey - Next.js Web & Flutter Mobile):
[Register / Login] -> [Browse Providers (/providers)] -> [Pick Date & Open Slot (/providers/[id])] -> [Confirm Booking (or 409 Auto-Refresh)] -> [Manage My Bookings (/my-bookings)]
```

* **Required UI States on Every Data Screen:**
  * **Loading:** Skeleton cards / slot chips or non-blocking spinner on action buttons.
  * **Empty:** Clear empty-state illustration/message (e.g., *"No available slots on this date"*, *"No appointments scheduled for today"*).
  * **Conflict (`409`):** Non-destructive toast/banner (*"This slot was just booked by someone else"*) + automatic re-fetch of available slots.

## **Architectural Guardrails & Scope Decisions**

* **Timezone Strategy:** Every user/provider record stores an explicit IANA timezone (`timezone VARCHAR(64) NOT NULL DEFAULT 'UTC'`, e.g., `'Europe/Istanbul'`). `SlotCalculationService` evaluates "today" and current-time cutoffs in the **provider's configured IANA timezone**. Local dates (`YYYY-MM-DD`) and slot times (`HH:mm`) represent wall-clock time in the provider's timezone, while audit timestamps (`created_at`) use UTC ISO-8601 (`TIMESTAMP WITH TIME ZONE`).  
* **Schedule Granularity (Intentional v1 Scope):** `provider_schedules` enforces one continuous shift per `day_of_week` (`UNIQUE (provider_id, day_of_week)`) for v1 simplicity; split shifts (lunch breaks) and single-date holiday overrides are deferred to v2.  
* **Queue Management & State Machine:**
  * Each active appointment on a given date is ordered chronologically by `start_time` as the provider's daily queue.
  * Valid transitions:
    * `CONFIRMED` \-\> `IN_PROGRESS` (`PROVIDER` only; allowed on any `CONFIRMED` booking regardless of date for v1 demo/testing flexibility)
    * `IN_PROGRESS` \-\> `COMPLETED` (`PROVIDER` only; allowed on any `IN_PROGRESS` booking regardless of date)
    * `CONFIRMED` or `IN_PROGRESS` \-\> `CANCELLED` (`CLIENT` or `PROVIDER` owning the record; cancelling reopens the slot if still in the future)
    * Terminal states (`COMPLETED`, `CANCELLED`) cannot transition further (`400 Bad Request` / `409 Conflict`).
* **Locked Domain Edge-Case Rules (v1):**
  1. **Shift Remainder Handling:** `SlotCalculationService` generates full uniform slots where `slotEnd <= shiftEndTime` and silently drops any trailing remainder shorter than `slot_duration_minutes`.
  2. **Schedule Edits vs. Existing Bookings:** Updating a provider's weekly schedule (`PUT /api/providers/schedule`) only affects future slot generation; existing `CONFIRMED` / `IN_PROGRESS` appointments remain intact on the provider's queue unless explicitly cancelled.
  3. **Concurrency Guard Scope:** Concurrency uniqueness (`idx_unique_active_slot`) is strictly scoped to provider slots `(provider_id, appointment_date, start_time)`. Same-client overlapping bookings across different providers are permitted in v1.
  4. **Bookable Horizon & Cutoff:** Any non-past slot (`appointmentDate > today`, or `appointmentDate == today` and `startTime > currentTime` in the provider's IANA timezone) is bookable with no upper date-horizon cap in v1.
* **Locked Security Red-Line Invariants (`security-auditor` & `scripts/security_check.sh`):**
  1. **Zero Hardcoded Secrets & Fail-Fast `JWT_SECRET`:** `JWT_SECRET` ($\ge$ 256-bit / 32+ bytes) and DB credentials must load strictly from environment variables with **no default fallback** in `application.yml` (fail-fast at startup if missing; test secret allowed only in `application-test.yml`). Never log tokens, passwords, or `Authorization` headers (`requestHeader: false` in Flutter `Dio` logs).
  2. **Principal Extraction & Anti-IDOR (BOLA) Ownership Enforcement:**
     * Never accept `clientId` on `POST /api/appointments` or `providerId` on `PUT /api/providers/schedule` from the request payload—always extract the acting user's `UUID` from the verified server-side JWT `SecurityContext`.
     * `PATCH /api/appointments/{id}/start` and `/complete` must verify `appointment.providerId == currentUserId` (returning `403 Forbidden` otherwise).
     * `PATCH /api/appointments/{id}/cancel` must verify `appointment.clientId == currentUserId || appointment.providerId == currentUserId` (returning `403 Forbidden` otherwise).
  3. **Input Size DoS Bounds & Actuator Lockdown:**
     * Enforce `@Size(min = 8, max = 72)` on password fields (preventing BCrypt 72-byte CPU DoS bombs) and `@Size(max = 7)` on schedule `days` arrays.
     * Hard-lock Spring Boot Actuator to `management.endpoints.web.exposure.include=health` only (never `*`, `env`, or `heapdump`).
  4. **Hardened Auth, Next.js BFF Cookie-to-Bearer Pattern & Mobile Secure Storage:**
     * Passwords hashed via `BCrypt`; failed logins always return a generic `401 Unauthorized` (`"Invalid email or password"`) to prevent user enumeration.
     * Next.js stores JWTs exclusively in `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` (in prod) cookies via server Route Handlers (never `localStorage`). Next.js Server Components/Route Handlers act as a **BFF** that reads the `HttpOnly` cookie server-side and sends `Authorization: Bearer <jwt>` to Spring Boot, keeping the backend 100% stateless Bearer-only with zero CSRF/cookie surface.
     * Flutter stores JWTs exclusively in `flutter_secure_storage`.
  5. **Sanitized Error Envelope & Network Isolation:**
     * `@RestControllerAdvice` must never leak SQL queries, constraint names, or Java stack traces to clients on `409` or `500` errors.
     * `docker-compose.yml` must bind PostgreSQL `5432` strictly to `127.0.0.1:5432:5432` locally (or internal Docker network in prod), never `0.0.0.0:5432`.

## **Database Schema (PostgreSQL — Flyway `V1__init_schema.sql`)**

```sql
-- 1. Core User Entities
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('PROVIDER', 'CLIENT')),
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Weekly Recurring Availability Definitions (1 = Monday .. 7 = Sunday)
CREATE TABLE provider_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT NOT NULL DEFAULT 30 CHECK (slot_duration_minutes IN (15, 30, 60)),
  CONSTRAINT chk_schedule_time_window CHECK (start_time < end_time),
  CONSTRAINT unq_provider_day UNIQUE (provider_id, day_of_week)
);

-- 3. Appointment Records with Optimistic Concurrency Control
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id),
  client_id UUID NOT NULL REFERENCES users(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED')),
  version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_appointment_time_window CHECK (start_time < end_time)
);

-- 4. Hard Concurrency Guard (Prevents overlapping active slots)
CREATE UNIQUE INDEX idx_unique_active_slot
ON appointments (provider_id, appointment_date, start_time)
WHERE status IN ('CONFIRMED', 'IN_PROGRESS');
```

---

## **Locked API Contract (Endpoints, DTOs & Error Envelope)**

The system enforces an **API-First Strategy**. OpenAPI 3.0 specifications are served at `/v3/api-docs`. All Backend controllers, Next.js Route Handlers/components, and Flutter BLoC repositories must adhere to these exact endpoints and JSON payloads:

### **1\. Standard Error Envelope (`@RestControllerAdvice`)**

Returned for all `400`, `401`, `403`, `404`, `409`, and `500` responses:

```json
{
  "timestamp": "2026-11-18T20:00:00Z",
  "status": 409,
  "error": "CONFLICT",
  "message": "This time slot has just been booked by another client.",
  "path": "/api/appointments",
  "fieldErrors": {}
}
```

### **2\. Authentication Endpoints (`/api/auth`)**

| Method & Path | Auth / Role | Request DTO | Response DTO (`200` / `201`) |
| :---- | :---- | :---- | :---- |
| `POST /api/auth/register` | Public | `{ "email": "string", "password": "string (min 8)", "fullName": "string", "role": "PROVIDER \| CLIENT", "timezone": "string? (default UTC)" }` | `201 Created` \-\> `AuthResponse` |
| `POST /api/auth/login` | Public | `{ "email": "string", "password": "string" }` | `200 OK` \-\> `AuthResponse` |
| `GET /api/auth/me` | Authenticated | — | `200 OK` \-\> `UserDto` |

* **`UserDto`:** `{ "id": "UUID", "email": "string", "fullName": "string", "role": "PROVIDER | CLIENT", "timezone": "string" }`
* **`AuthResponse`:** `{ "accessToken": "string (JWT)", "tokenType": "Bearer", "expiresIn": 86400, "user": UserDto }`

### **3\. Provider & Availability Endpoints (`/api/providers`)**

| Method & Path | Auth / Role | Request / Query | Response DTO (`200`) |
| :---- | :---- | :---- | :---- |
| `GET /api/providers` | Authenticated | Optional `?search=string` | `List<ProviderSummaryDto>` |
| `GET /api/providers/{id}/schedule` | Authenticated | Path `{id}` (Provider UUID) | `ProviderScheduleResponse` |
| `PUT /api/providers/schedule` | `PROVIDER` | `UpdateScheduleRequest` | `ProviderScheduleResponse` |
| `GET /api/providers/{id}/slots` | Authenticated | Path `{id}`, Query `?date=YYYY-MM-DD` (required) | `AvailableSlotsResponse` |

* **`ProviderSummaryDto`:** `{ "id": "UUID", "fullName": "string", "email": "string", "timezone": "string" }`
* **`ScheduleDayDto`:** `{ "dayOfWeek": 1..7, "startTime": "HH:mm", "endTime": "HH:mm", "slotDurationMinutes": 15 | 30 | 60 }`
* **`UpdateScheduleRequest`:** `{ "timezone": "string?", "days": List<ScheduleDayDto> }` *(replaces the provider's weekly schedule atomically)*
* **`ProviderScheduleResponse`:** `{ "providerId": "UUID", "providerName": "string", "timezone": "string", "days": List<ScheduleDayDto> }`
* **`TimeSlotDto`:** `{ "startTime": "HH:mm", "endTime": "HH:mm" }`
* **`AvailableSlotsResponse`:** `{ "providerId": "UUID", "providerName": "string", "date": "YYYY-MM-DD", "timezone": "string", "slots": List<TimeSlotDto> }`

### **4\. Appointment & Queue Endpoints (`/api/appointments`)**

| Method & Path | Auth / Role | Request / Query | Response DTO (`200` / `201`) |
| :---- | :---- | :---- | :---- |
| `POST /api/appointments` | `CLIENT` | `{ "providerId": "UUID", "appointmentDate": "YYYY-MM-DD", "startTime": "HH:mm" }` | `201 Created` \-\> `AppointmentResponse` *(or `409 Conflict`)* |
| `GET /api/appointments/me` | Authenticated | Optional `?date=YYYY-MM-DD` & `?status=CONFIRMED...` | `List<AppointmentResponse>` *(ordered by `appointmentDate ASC, startTime ASC`)* |
| `PATCH /api/appointments/{id}/start` | `PROVIDER` | Path `{id}` *(must own appointment; `CONFIRMED` \-\> `IN_PROGRESS`)* | `200 OK` \-\> `AppointmentResponse` |
| `PATCH /api/appointments/{id}/complete` | `PROVIDER` | Path `{id}` *(must own appointment; `IN_PROGRESS` \-\> `COMPLETED`)* | `200 OK` \-\> `AppointmentResponse` |
| `PATCH /api/appointments/{id}/cancel` | `CLIENT` or `PROVIDER` | Path `{id}` *(must own appointment; `CONFIRMED`/`IN_PROGRESS` \-\> `CANCELLED`)* | `200 OK` \-\> `AppointmentResponse` |

* **`AppointmentResponse`:**
  ```json
  {
    "id": "UUID",
    "providerId": "UUID",
    "providerName": "Dr. Jane Smith",
    "providerTimezone": "Europe/Istanbul",
    "clientId": "UUID",
    "clientName": "Alex Doe",
    "appointmentDate": "2026-11-20",
    "startTime": "09:30",
    "endTime": "10:00",
    "status": "CONFIRMED",
    "createdAt": "2026-11-18T20:00:00Z"
  }
  ```

---

# **4\. Phase 3: Backend Development (Java Spring Boot)**

## **Backend Execution Checklist**

- [x] **Milestone 1: Project Bootstrap & Migration Engine**  
  - [x] Initialize Spring Boot 3.x project dependencies (Web, Security, Validation, JPA, Flyway, PostgreSQL driver, Springdoc OpenAPI).  
  - [x] Provision base container configuration (`/infra/docker-compose.yml` for local PostgreSQL 16).  
  - [x] Draft initial migration script `src/main/resources/db/migration/V1__init_schema.sql`.  
- [x] **Milestone 2: Security, Authentication & Error Handling Layer**  
  - [x] Implement `@RestControllerAdvice` global exception handler returning the locked `Standard Error Envelope`.  
  - [x] Implement `JwtService` for stateless token signing, parsing, and claim validation.  
  - [x] Implement `JwtAuthenticationFilter` and hook into Spring Security filter chain.  
  - [x] Expose `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me`.  
  - [x] Apply method-level permissions (`@EnableMethodSecurity` / `@PreAuthorize`).  
- [x] **Milestone 3: Availability Engine & Slot Calculator**  
  - [x] Build endpoints `GET /api/providers`, `GET /api/providers/{id}/schedule`, `PUT /api/providers/schedule`, and `GET /api/providers/{id}/slots?date=YYYY-MM-DD`.  
  - [x] Implement dynamic slot generation algorithm within `SlotCalculationService`:  
    - [x] Reject or return empty slots for dates in the past relative to the provider's configured IANA `timezone`.  
    - [x] Map requested `date` to ISO numeric `day_of_week` (`1 = Monday` .. `7 = Sunday`).  
    - [x] Generate uniform time windows of `slot_duration_minutes` from `start_time` to `end_time` (where `slotEnd <= end_time`).  
    - [x] Strip past slots if the target date is today in the provider's `timezone`.  
    - [x] Exclude slots matching active **`CONFIRMED` or `IN_PROGRESS`** records in `appointments`.  
- [x] **Milestone 4: Booking Orchestration & Concurrency Guard**  
  - [x] Implement `POST /api/appointments` inside a `@Transactional` context (validating the requested slot exists in the provider's schedule and is not in the past).  
  - [x] Capture relational race conditions (`DataIntegrityViolationException` / `OptimisticLockingFailureException`) triggered by `idx_unique_active_slot` and translate them into `HTTP 409 Conflict` error envelopes.  
  - [x] Implement management routes: `GET /api/appointments/me`, `PATCH /api/appointments/{id}/start`, `PATCH /api/appointments/{id}/complete`, and `PATCH /api/appointments/{id}/cancel`.

---

# **5\. Phase 4: Web Frontend Development (Next.js)**

## **Web Portal Implementation Plan**

Building both Provider and Client views in Next.js serves as a hands-on learning track for Next.js App Router patterns (Server Components, Client Components, dynamic `[id]` routes, Route Handlers, and role-aware `middleware.ts`).

- [x] **Milestone 1: Design System & Core Layouts**  
  - [x] Configure Tailwind design tokens (colors, typography, radii).  
  - [x] Build reusable UI primitives: `Button`, `Input`, `Card`, `Badge`, `Modal`.  
  - [x] Establish base layout shell with navigation bar and stateful header.  
- [x] **Milestone 2: Authentication & Role-Based Route Guards**  
  - [x] Construct `/login` and `/register` client views with form validation.  
  - [x] Implement Route Handlers (`/api/auth/session`) to store JWTs inside secure `HTTP-Only` cookies.  
  - [x] Write Next.js `middleware.ts` to enforce role-aware redirects (`PROVIDER` \-\> `/provider/dashboard`, `/provider/schedule`; `CLIENT` \-\> `/providers`, `/my-bookings`).  
- [x] **Milestone 3: Provider Schedule Configuration Workspace (`/provider/schedule`)**  
  - [x] Build interactive weekly availability grid.  
  - [x] Provide day toggle controls, time pickers (`startTime`, `endTime`), and slot length selectors (`15m`, `30m`, `60m`).  
  - [x] Wire form actions to `PUT /api/providers/schedule`.  
- [x] **Milestone 4: Provider Operational Dashboard (`/provider/dashboard`)**  
  - [x] Implement Server Components to pre-fetch daily schedules and booking queues (`GET /api/appointments/me?date=YYYY-MM-DD`).  
  - [x] Integrate interactive state toggles (`Start`, `Complete`, `Cancel`) with optimistic UI updates and server action revalidation for live queue management.  
- [x] **Milestone 5: Client Booking & Appointment Hub (`/providers` & `/my-bookings`)**  
  - [x] Build Provider Directory page (`/providers`) and interactive Slot Picker view (`/providers/[id]`) with date selector, available slot grid, and `409 Conflict` alert \+ automatic slot refresh.  
  - [x] Build Client Appointment Hub (`/my-bookings`) with `Upcoming` and `Past` tabs and self-service cancellation modal.

---

# **6\. Phase 5: Mobile App Development (Flutter)**

## **Mobile Application Strategy**

- [x] **Milestone 1: Architecture & Network Plumbing**  
  - [x] Scaffold feature-first structure: `core/`, `features/auth/`, `features/providers/`, `features/booking/`, `features/appointments/`.  
  - [x] Define global `ThemeData` aligning with shared brand design tokens.  
  - [x] Configure `Dio` instance equipped with automatic auth interceptors and token storage via `flutter_secure_storage`.  
- [x] **Milestone 2: Mobile Authentication Flow**  
  - [x] Implement UI screens for Login and Registration.  
  - [x] Integrate BLoC state management to handle authentication lifecycle states (`Unauthenticated`, `Authenticating`, `Authenticated`).  
  - [x] Implement silent auto-login check (`GET /api/auth/me`) on app bootstrap.  
- [x] **Milestone 3: Discovery & Dynamic Slot Selection**  
  - [x] Construct Provider Directory list screen (`GET /api/providers`).  
  - [x] Create interactive Slot Picker screen featuring a horizontal date selection bar and responsive grid of available time chips (`GET /api/providers/{id}/slots?date=YYYY-MM-DD`).  
  - [x] Implement robust error handling: Catch `409 Conflict` exceptions, present a user alert, and refresh available slots dynamically.  
- [x] **Milestone 4: My Bookings Management Hub**  
  - [x] Build tabbed operational view (`Upcoming` vs `Past`) consuming `GET /api/appointments/me`.  
  - [x] Add pull-to-refresh functionality and bottom-sheet cancellation confirmation flows (`PATCH /api/appointments/{id}/cancel`).

---

# **7\. Phase 6: Testing & Quality Assurance**

## **Verification Matrix**

| Backend Layer | Mobile & Web | End-to-End Flow |
| :---- | :---- | :---- |
| JUnit 5 Unit Tests, Mockito Slot Tests, Testcontainers DB Concurrency Tests | Manual UX Walkthroughs, Session Expiration Handling (`401`) | Cross-platform validation, Real-time state sync, Concurrency Verification (`409`) |

* **Backend Unit & Integration Tests:**  
  * Write JUnit 5 tests evaluating boundary conditions in slot calculations (fractional duration fits, operational day boundaries, provider timezone past-time stripping, excluding both `CONFIRMED` and `IN_PROGRESS`).  
  * Execute concurrent execution tests using Testcontainers and multi-threaded test runners to verify that `idx_unique_active_slot` triggers `409 Conflict` errors under race conditions without corrupting data.  
* **Frontend & Mobile Verification:**  
  * Execute cross-platform integration cycles: Schedule created on Next.js Provider Portal \-\> Slot selected & booked via Next.js Web (Client) or Flutter Mobile \-\> Booking visible on Next.js Provider Dashboard \-\> Booking started/completed or cancelled from Web or Mobile \-\> Slot dynamically reopens on cancellation across all client interfaces.  
  * Verify invalid/expired JWT handling across client environments (redirection to `/login` on Web; state reset and secure storage clearing on Mobile).

---

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

---

# **9\. Phase 8: Post-Launch Monitoring & Iteration**

## **Observability & Infrastructure Maintenance**

* **Application Observability:** Enforce structured JSON log output across Spring Boot services.  
* **Health Checks:** Expose health check metrics via `/actuator/health` and set up automated uptime pings.  
* **Pattern Extraction & System Evolution:** Document core architecture components (JWT filter structures, error envelopes, dynamic slot engines, and Flutter Dio/BLoC templates) to serve as standard blueprints for enterprise scaling.

---

# **10\. Live Project Execution Tracker**

| Step | Status (`TODO` / `DOING` / `DONE`) | Notes / Pivots / Decisions Made |
| :---- | :---- | :---- |
| **1\. Product Vision & SDLC Master Plan** | `DONE` | Dual-role (`PROVIDER`, `CLIENT`) scheduling & daily queue system |
| **2\. Tech Stack & Architecture** | `DONE` | Spring Boot 3.x (Java 21), PostgreSQL 16, Next.js App Router, Flutter 3.x BLoC |
| **3\. Data Model & DB Schema** | `DONE` | Added `timezone` column to `users`, time-window CHECK constraints, and `idx_unique_active_slot` |
| **4\. Design System & UI/UX Wireframes** | `DONE` | Locked semantic color tokens, radii, and required Loading/Empty/409 Conflict states |
| **5\. API Contract (Endpoints & DTOs)** | `DONE` | Locked all `/api/auth`, `/api/providers`, `/api/appointments` DTOs & error envelope |
| **6\. Review the Plan (Pre-Code Audit)** | `DONE` | Fixed timezone column gap, `CONFIRMED`+`IN_PROGRESS` slot exclusion, missing `/api/providers` endpoints, and v1 stateless JWT scope |
| **7\. Project Skeletons & Local Env** | `DONE` | Scaffolded & verified `/infra` (PG 16 loopback compose), `/backend` (Spring Boot 3.5.16 + Flyway `V1__init_schema.sql`), `/web` (Next.js App Router + Tailwind tokens + locked API types), `/mobile` (Flutter feature-first + `AppTheme` + `Dio`/`TokenStorage`); `./mvnw test`, `tsc`/`lint`/`build`, `flutter analyze`/`test`, and `security_check.sh` all passed |
| **8\. Backend Foundation & Auth** | `DONE` | `@RestControllerAdvice` envelope (+ 401/403 filter-chain handlers), `JwtService` (fail-fast ≥32-byte secret), `JwtAuthenticationFilter` (loads user from DB), `/api/auth/{register,login,me}`, `@EnableMethodSecurity`, BCrypt + timing-safe generic login failure. 13 tests pass (`./mvnw clean test`) + `security_check.sh` passed. Integration tests use H2 (PostgreSQL mode, Flyway off) since Docker is unavailable locally; Testcontainers-on-Postgres coverage of `idx_unique_active_slot` deferred to Step 9 |
| **9\. Backend Core Domain & Logic** | `DONE` | `SlotCalculationService` (provider IANA zone, injected `Clock`, remainder dropped, active-slot exclusion); provider/schedule/slots endpoints (atomic schedule replace; 400 on duplicate day, bad window/duration/tz); booking in `@Transactional` with pre-check + `saveAndFlush` race → sanitized 409; `/api/appointments/{me,start,complete,cancel}` with principal-derived ownership (403) and state machine (409). 25 tests + `security_check.sh` pass. `PostgresSlotConstraintIT` (Testcontainers) written but skipped locally (no Docker) — run it where Docker exists |
| **10\. Web Frontend (Next.js)** | `DONE` | Built UI primitives (`Button`, `Input`/`Select`, `Card`, `Badge`, `Modal`, `AlertBanner`/`EmptyState`/`Skeleton`) & stateful `Navbar` shell; BFF `HttpOnly` cookie session (`/api/auth/session`) + Next.js 16 `src/proxy.ts` role guards (replaces legacy `middleware.ts`) backed by server `requireUser()` checks; `/login`, `/register`, `/provider/schedule` (weekly grid + slot counts → `PUT /api/providers/schedule`), `/provider/dashboard` (RSC daily queue + `useOptimistic` Start/Complete/Cancel actions), `/providers`, `/providers/[id]` (live slot picker + `409 Conflict` banner & auto-refresh), and `/my-bookings` (`Upcoming`/`Past` tabs + cancel modal). `eslint`, `tsc --noEmit`, `next build`, and `security_check.sh` all passed |
| **11\. Mobile App (Flutter)** | `DONE` | `AuthBloc` (`Unauthenticated`/`Authenticating`/`Authenticated`, silent `GET /api/auth/me` bootstrap, Dio 401 → `SessionExpired`), Login/Register (client-only), provider directory + search, slot picker (14-day date bar, time chip grid, confirm dialog, `409` → snackbar + auto-refetch), My Bookings (`Upcoming`/`Past`, pull-to-refresh, bottom-sheet cancel). Provider accounts see a web-portal notice. 7 tests pass (`flutter test`; `flutter analyze` has 0 errors/warnings, only SDK-3.50 `material.dart` deprecation infos) + `security_check.sh` passed. Verified on Flutter 3.50 in a cloud VM; `pubspec.lock` left untouched |
| **12\. Cross-Platform E2E QA** | `TODO` |  |
| **13\. Containerize, CI/CD & Deploy** | `TODO` |  |
