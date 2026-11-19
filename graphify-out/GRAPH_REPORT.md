# Graph Report - appointment  (2026-11-19)

## Corpus Check
- 103 files · ~23,584 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: (none) 22, .xml 7, .plist 4)

## Summary
- 671 nodes · 1437 edges · 44 communities (22 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 94 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `da6c8d46`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- SDLC Master Plan: Appointment & Queue Booking System
- AuthIntegrationTest.java
- package.json
- GlobalExceptionHandler.java
- SecurityConfig.java
- app_colors.dart
- UserRepository
- AppointmentController.java
- api_exception.dart
- compilerOptions
- api.ts
- .application
- User
- dio_client.dart
- token_storage.dart
- AppointmentService.java
- AppointmentApplication.java
- Q: Why does SDLC Master Plan: Appointment & Queue Booking System connect Domain Schema, Slot Engine & APIs to SDLC Playbook & Security Gatekeeping, AI Governance & Backend Architecture, Cross-Platform UI & Error Envelope?
- Q: Are the 4 inferred relationships involving Next.js App Router Skill (TypeScript & Tailwind) actually correct?
- Q: Why does AGENTS.md Root AI Governance & Monorepo Router connect AI Governance & Backend Architecture to SDLC Playbook & Security Gatekeeping, Domain Schema, Slot Engine & APIs, Cross-Platform UI & Error Envelope?
- Q: Why does Tech Lead Skill (Milestone Executor & Orchestrator) connect SDLC Playbook & Security Gatekeeping to Domain Schema, Slot Engine & APIs, AI Governance & Backend Architecture?
- Q: What connects Docker Compose & Nginx Orchestration Architecture to the rest of the system?
- widget_test.dart
- web/README.md
- FlutterActivity
- appointment_mobile
- LaunchImage.imageset/README.md
- AGENTS.md
- com.appointment:appointment-backend

## God Nodes (most connected - your core abstractions)
1. `User` - 39 edges
2. `Appointment` - 31 edges
3. `AppointmentStatus` - 21 edges
4. `ProviderSchedule` - 20 edges
5. `UserRepository` - 20 edges
6. `AppointmentService` - 20 edges
7. `ErrorResponse` - 18 edges
8. `Role` - 18 edges
9. `BookingIntegrationTest` - 18 edges
10. `SDLC Master Plan: Appointment & Queue Booking System` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Added` --references--> `GlobalExceptionHandler`  [INFERRED]
  CHANGELOG.md → backend/src/main/java/com/appointment/exception/GlobalExceptionHandler.java
- `Added` --references--> `SecurityConfig`  [INFERRED]
  CHANGELOG.md → backend/src/main/java/com/appointment/security/SecurityConfig.java
- `Step 7 Project Skeletons & Local Environment` --references--> `Tech Lead Skill (Milestone Executor & Orchestrator)`  [EXTRACTED]
  docs/full-stack-project-playbook.md → .agent/skills/tech-lead/SKILL.md
- `Spring Boot Architecture Skill (Java 21+ / Spring Boot 3.x)` --implements--> `PostgreSQL appointments Table & idx_unique_active_slot`  [INFERRED]
  .agent/skills/spring-boot-architecture/SKILL.md → docs/sdlc-master-plan.md
- `Flutter BLoC Clean Architecture Skill (Flutter 3.x)` --implements--> `Shared Design System & Color Tokens`  [INFERRED]
  .agent/skills/flutter-bloc-clean/SKILL.md → docs/sdlc-master-plan.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Contract-First API & 409 Conflict Synchronization Loop** — agent_skills_spring_boot_architecture_skill_spring_boot, agent_skills_nextjs_app_router_skill_nextjs, agent_skills_flutter_bloc_clean_skill_flutter, docs_sdlc_master_plan_error_envelope, docs_sdlc_master_plan_appointments_api [EXTRACTED 1.00]
- **Zero-Ceremony Spec & Execution Governance Triad** — agent_skills_business_analyst_skill_business_analyst, agent_skills_tech_lead_skill_tech_lead, agent_skills_security_auditor_skill_security_auditor, docs_sdlc_master_plan_master_plan [EXTRACTED 1.00]

## Communities (44 total, 22 thin omitted)

### Community 0 - "SDLC Master Plan: Appointment & Queue Booking System"
Cohesion: 0.17
Nodes (22): Business Analyst Skill (Red-Team Spec Auditor), Flutter BLoC Clean Architecture Skill (Flutter 3.x), Next.js App Router Skill (TypeScript & Tailwind), security_check.sh script, Security Auditor Skill (6 Catastrophic Red Lines), Spring Boot Architecture Skill (Java 21+ / Spring Boot 3.x), Tech Lead Skill (Milestone Executor & Orchestrator), AGENTS.md Root AI Governance & Monorepo Router (+14 more)

### Community 1 - "AuthIntegrationTest.java"
Cohesion: 0.07
Nodes (5): AuthIntegrationTest, Account, BookingIntegrationTest, BootstrapContractTest, PostgresSlotConstraintIT

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (39): eslint, eslint-config-next, lucide-react, next, react, react-dom, tailwindcss, @tailwindcss/turbopack (+31 more)

### Community 3 - "GlobalExceptionHandler.java"
Cohesion: 0.12
Nodes (3): ErrorResponse, GlobalExceptionHandler, SecurityErrorHandlers

### Community 4 - "SecurityConfig.java"
Cohesion: 0.09
Nodes (7): TimeConfig, SecurityConfig, Added, Changed, Changelog, Security, [Unreleased]

### Community 5 - "app_colors.dart"
Cohesion: 0.07
Nodes (16): AppointmentApp, _BootstrapHomeScreen, build, AppColors, borderSubtle, cancelledError, cardSurface, completedMuted (+8 more)

### Community 6 - "UserRepository"
Cohesion: 0.06
Nodes (8): AuthenticationFailedException, BusinessRuleException, UserRepository, JwtAuthenticationFilter, JwtProperties, JwtService, AuthService, JwtServiceTest

### Community 7 - "AppointmentController.java"
Cohesion: 0.09
Nodes (13): AppointmentController, AuthController, ProviderController, AppointmentResponse, AuthResponse, LoginRequest, ProviderSummaryDto, RegisterRequest (+5 more)

### Community 8 - "api_exception.dart"
Cohesion: 0.10
Nodes (12): ApiException, error, fieldErrors, fromJson, isConflict, isUnauthorized, message, path (+4 more)

### Community 9 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "api.ts"
Cohesion: 0.12
Nodes (15): ApiErrorEnvelope, AppointmentResponse, AppointmentStatus, AuthResponse, AvailableSlotsResponse, CreateAppointmentRequest, LoginRequest, ProviderScheduleResponse (+7 more)

### Community 11 - ".application"
Cohesion: 0.15
Nodes (5): Flutter, AppDelegate, RunnerTests, UIKit, XCTest

### Community 13 - "User"
Cohesion: 0.09
Nodes (10): Appointment, AppointmentStatus, CANCELLED, COMPLETED, CONFIRMED, IN_PROGRESS, User, ResourceConflictException (+2 more)

### Community 18 - "dio_client.dart"
Cohesion: 0.20
Nodes (3): _dio, DioClient, _mapToApiException

### Community 19 - "token_storage.dart"
Cohesion: 0.20
Nodes (6): _accessTokenKey, clearToken, readToken, saveToken, _storage, TokenStorage

### Community 22 - "AppointmentService.java"
Cohesion: 0.06
Nodes (12): AvailableSlotsResponse, CreateAppointmentRequest, ProviderScheduleResponse, ScheduleDayDto, TimeSlotDto, UpdateScheduleRequest, ProviderSchedule, AppointmentRepository (+4 more)

### Community 24 - "Q: Why does SDLC Master Plan: Appointment & Queue Booking System connect Domain Schema, Slot Engine & APIs to SDLC Playbook & Security Gatekeeping, AI Governance & Backend Architecture, Cross-Platform UI & Error Envelope?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Why does SDLC Master Plan: Appointment & Queue Booking System connect Domain Schema, Slot Engine & APIs to SDLC Playbook & Security Gatekeeping, AI Governance & Backend Architecture, Cross-Platform UI & Error Envelope?, Source Nodes

### Community 25 - "Q: Are the 4 inferred relationships involving Next.js App Router Skill (TypeScript & Tailwind) actually correct?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Are the 4 inferred relationships involving Next.js App Router Skill (TypeScript & Tailwind) actually correct?, Source Nodes

### Community 26 - "Q: Why does AGENTS.md Root AI Governance & Monorepo Router connect AI Governance & Backend Architecture to SDLC Playbook & Security Gatekeeping, Domain Schema, Slot Engine & APIs, Cross-Platform UI & Error Envelope?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Why does AGENTS.md Root AI Governance & Monorepo Router connect AI Governance & Backend Architecture to SDLC Playbook & Security Gatekeeping, Domain Schema, Slot Engine & APIs, Cross-Platform UI & Error Envelope?, Source Nodes

### Community 27 - "Q: Why does Tech Lead Skill (Milestone Executor & Orchestrator) connect SDLC Playbook & Security Gatekeeping to Domain Schema, Slot Engine & APIs, AI Governance & Backend Architecture?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Why does Tech Lead Skill (Milestone Executor & Orchestrator) connect SDLC Playbook & Security Gatekeeping to Domain Schema, Slot Engine & APIs, AI Governance & Backend Architecture?, Source Nodes

### Community 28 - "Q: What connects Docker Compose & Nginx Orchestration Architecture to the rest of the system?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: What connects Docker Compose & Nginx Orchestration Architecture to the rest of the system?, Source Nodes

### Community 30 - "web/README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **52 isolated node(s):** `com.appointment:appointment-backend`, `CONFIRMED`, `IN_PROGRESS`, `CANCELLED`, `COMPLETED` (+47 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 249 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `Tech Lead Skill (Milestone Executor & Orchestrator)` (2× useful, score=1.99999974) _(code changed — re-verify)_
- `AGENTS.md Root AI Governance & Monorepo Router` (2× useful, score=1.999999697) _(code changed — re-verify)_
- `SDLC Master Plan: Appointment & Queue Booking System` (2× useful, score=1.999999656) _(code changed — re-verify)_
- `Shared Design System & Color Tokens` (2× useful, score=1.999999605) _(code changed — re-verify)_
- `Standard Error Envelope (@RestControllerAdvice)` (2× useful, score=1.999999605) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `AuthIntegrationTest.java`, `UserRepository`, `AppointmentController.java`, `User.java`, `AppointmentService.java`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `com.appointment:appointment-backend`, `CONFIRMED`, `IN_PROGRESS` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AuthIntegrationTest.java` be split into smaller, more focused modules?**
  _Cohesion score 0.06768905341089371 - nodes in this community are weakly interconnected._
- **Why does `UserRepository` connect `UserRepository` to `AuthIntegrationTest.java`, `User`, `AppointmentService.java`, `AppointmentController.java`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Why does `Appointment` connect `User` to `AuthIntegrationTest.java`, `AppointmentService.java`, `User.java`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `GlobalExceptionHandler.java` be split into smaller, more focused modules?**
  _Cohesion score 0.11673469387755102 - nodes in this community are weakly interconnected._