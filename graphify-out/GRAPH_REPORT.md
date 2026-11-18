# Graph Report - appointment  (2026-11-19)

## Corpus Check
- Corpus is ~9,456 words - fits in a single context window. You may not need a graph.

## Summary
- 27 nodes · 59 edges · 4 communities (3 shown, 1 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.93)
- Token cost: 11,200 input · 2,450 output

## Community Hubs (Navigation)
- SDLC Playbook & Security Gatekeeping
- Domain Schema, Slot Engine & APIs
- AI Governance & Backend Architecture
- Cross-Platform UI & Error Envelope

## God Nodes (most connected - your core abstractions)
1. `SDLC Master Plan: Appointment & Queue Booking System` - 18 edges
2. `AGENTS.md Root AI Governance & Monorepo Router` - 10 edges
3. `Tech Lead Skill (Milestone Executor & Orchestrator)` - 7 edges
4. `Security Auditor Skill (6 Catastrophic Red Lines)` - 6 edges
5. `Next.js App Router Skill (TypeScript & Tailwind)` - 6 edges
6. `Full-Stack Project Execution Playbook` - 5 edges
7. `PostgreSQL users Table (PROVIDER / CLIENT & IANA Timezone)` - 5 edges
8. `PostgreSQL appointments Table & idx_unique_active_slot` - 5 edges
9. `SlotCalculationService Dynamic Slot Engine` - 5 edges
10. `Standard Error Envelope (@RestControllerAdvice)` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Contract-First Execution Rule` --rationale_for--> `SDLC Master Plan: Appointment & Queue Booking System`  [EXTRACTED]
  AGENTS.md → docs/sdlc-master-plan.md
- `Spring Boot Architecture Skill (Java 21+ / Spring Boot 3.x)` --implements--> `PostgreSQL appointments Table & idx_unique_active_slot`  [INFERRED]
  .agent/skills/spring-boot-architecture/SKILL.md → docs/sdlc-master-plan.md
- `Spring Boot Architecture Skill (Java 21+ / Spring Boot 3.x)` --implements--> `Standard Error Envelope (@RestControllerAdvice)`  [INFERRED]
  .agent/skills/spring-boot-architecture/SKILL.md → docs/sdlc-master-plan.md
- `Business Analyst Skill (Red-Team Spec Auditor)` --references--> `AGENTS.md Root AI Governance & Monorepo Router`  [EXTRACTED]
  .agent/skills/business-analyst/SKILL.md → AGENTS.md
- `Tech Lead Skill (Milestone Executor & Orchestrator)` --references--> `AGENTS.md Root AI Governance & Monorepo Router`  [EXTRACTED]
  .agent/skills/tech-lead/SKILL.md → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Contract-First API & 409 Conflict Synchronization Loop** — agent_skills_spring_boot_architecture_skill_spring_boot, agent_skills_nextjs_app_router_skill_nextjs, agent_skills_flutter_bloc_clean_skill_flutter, docs_sdlc_master_plan_error_envelope, docs_sdlc_master_plan_appointments_api [EXTRACTED 1.00]
- **Zero-Ceremony Spec & Execution Governance Triad** — agent_skills_business_analyst_skill_business_analyst, agent_skills_tech_lead_skill_tech_lead, agent_skills_security_auditor_skill_security_auditor, docs_sdlc_master_plan_master_plan [EXTRACTED 1.00]

## Communities (4 total, 1 thin omitted)

### Community 0 - "SDLC Playbook & Security Gatekeeping"
Cohesion: 0.36
Nodes (7): Business Analyst Skill (Red-Team Spec Auditor), security_check.sh script, Security Auditor Skill (6 Catastrophic Red Lines), Tech Lead Skill (Milestone Executor & Orchestrator), Full-Stack Project Execution Playbook, Step 6 Pre-Code Red-Team & Security Audit, Step 7 Project Skeletons & Local Environment

### Community 1 - "Domain Schema, Slot Engine & APIs"
Cohesion: 0.44
Nodes (9): Appointment & Queue API Contract (/api/appointments), PostgreSQL appointments Table & idx_unique_active_slot, Authentication API Contract (/api/auth/register, /login, /me), Docker Compose & Nginx Orchestration Architecture, SDLC Master Plan: Appointment & Queue Booking System, PostgreSQL provider_schedules Table, Provider & Availability API Contract (/api/providers), SlotCalculationService Dynamic Slot Engine (+1 more)

### Community 3 - "Cross-Platform UI & Error Envelope"
Cohesion: 0.83
Nodes (4): Flutter BLoC Clean Architecture Skill (Flutter 3.x), Next.js App Router Skill (TypeScript & Tailwind), Shared Design System & Color Tokens, Standard Error Envelope (@RestControllerAdvice)

## Knowledge Gaps
- **1 isolated node(s):** `Docker Compose & Nginx Orchestration Architecture`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 3 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SDLC Master Plan: Appointment & Queue Booking System` connect `Domain Schema, Slot Engine & APIs` to `SDLC Playbook & Security Gatekeeping`, `AI Governance & Backend Architecture`, `Cross-Platform UI & Error Envelope`?**
  _High betweenness centrality (0.572) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Next.js App Router Skill (TypeScript & Tailwind)` (e.g. with `Flutter BLoC Clean Architecture Skill (Flutter 3.x)` and `Next.js BFF HttpOnly Cookie-to-Bearer Pattern`) actually correct?**
  _`Next.js App Router Skill (TypeScript & Tailwind)` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Docker Compose & Nginx Orchestration Architecture` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `AGENTS.md Root AI Governance & Monorepo Router` connect `AI Governance & Backend Architecture` to `SDLC Playbook & Security Gatekeeping`, `Domain Schema, Slot Engine & APIs`, `Cross-Platform UI & Error Envelope`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Why does `Tech Lead Skill (Milestone Executor & Orchestrator)` connect `SDLC Playbook & Security Gatekeeping` to `Domain Schema, Slot Engine & APIs`, `AI Governance & Backend Architecture`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._