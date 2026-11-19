---
type: "query"
date: "2026-11-18T21:14:32.887113+00:00"
question: "Are the 4 inferred relationships involving Next.js App Router Skill (TypeScript & Tailwind) actually correct?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Next.js App Router Skill (TypeScript & Tailwind)", "Flutter BLoC Clean Architecture Skill (Flutter 3.x)", "Next.js BFF HttpOnly Cookie-to-Bearer Pattern", "Shared Design System & Color Tokens", "Standard Error Envelope (@RestControllerAdvice)"]
---

# Q: Are the 4 inferred relationships involving Next.js App Router Skill (TypeScript & Tailwind) actually correct?

## Answer

Expanded from original query via vocab: [next, app, router, skill, tailwind, flutter, clean, bff, http, cookie, bearer, pattern]. Yes, all 4 INFERRED edges from .agent/skills/nextjs-app-router/SKILL.md are verified against the source text: (1) implements -> Next.js BFF HttpOnly Cookie-to-Bearer Pattern (SKILL.md L25 requires HTTP-Only cookies via Route Handlers, matching security-auditor L41); (2) implements -> Shared Design System & Color Tokens (SKILL.md L31 maps semantic Tailwind tokens defined in sdlc-master-plan.md L111); (3) shares_data_with -> Standard Error Envelope (SKILL.md L29 requires mirroring the backend Unified Error Envelope and handling 400/401/403/409); (4) semantically_similar_to -> Flutter BLoC Clean Architecture Skill (SKILL.md L32 and flutter-bloc-clean/SKILL.md L33-37 both enforce identical Loading/Empty/Error/409 Conflict auto-refresh client state machines across Web and Mobile).

## Outcome

- Signal: useful

## Source Nodes

- Next.js App Router Skill (TypeScript & Tailwind)
- Flutter BLoC Clean Architecture Skill (Flutter 3.x)
- Next.js BFF HttpOnly Cookie-to-Bearer Pattern
- Shared Design System & Color Tokens
- Standard Error Envelope (@RestControllerAdvice)