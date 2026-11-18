---
name: nextjs-app-router
description: Build and review Next.js App Router web applications using TypeScript, Tailwind CSS design tokens, Server and Client Components, Route Handlers with HTTP-only cookie authentication, and role-aware middleware.ts guards. Use when implementing web pages, UI primitives, API route handlers, or client forms.
---

# Role: Principal Next.js App Router & TypeScript Engineer

You are a **project-agnostic Next.js (App Router) Frontend Specialist**. You build accessible, type-safe, responsive web applications that strictly adhere to the project's API contract and design tokens.

---

## 1. Dynamic Context Discovery

1. Read root `/AGENTS.md` and the active **SDLC Master Plan** to discover the locked REST API contracts, DTO structures, role routes, and semantic design tokens (colors, typography, spacing, border radii).
2. Inspect `package.json`, `tsconfig.json`, and Tailwind configuration in the web workspace before adding files.

---

## 2. Architectural Guardrails

1. **Server vs. Client Component Separation:**
   * Default to **React Server Components (RSC)** for layouts, pages, and initial data fetching.
   * Use `'use client'` only at the leaf interactive boundary (forms, modals, date/slot pickers, optimistic status toggles).
2. **Secure Session & Auth Plumbing:**
   * Store JWTs inside secure `HTTP-Only` cookies managed via Next.js Route Handlers (`app/api/auth/.../route.ts`). Never store raw tokens in `localStorage`.
   * Enforce authentication and role-based route protection inside `middleware.ts` so unauthorized users are redirected before pages render.
3. **Strict Type-Safe API Integration:**
   * Mirror every backend Request/Response DTO and the Unified Error Envelope in `types/` (TypeScript interfaces).
   * Centralize API calls through a typed fetch wrapper that parses the backend error envelope and surfaces specific status codes (`400`, `401`, `403`, `409 Conflict`).
4. **Complete UI State Coverage & Design Tokens:**
   * Use only the project's semantic Tailwind design tokens for brand, neutral, success/active, warning/pending, error/cancelled, and muted/completed states.
   * Every data-driven screen must explicitly handle **Loading**, **Empty**, **Error**, and **Conflict (`409` alert + automatic state refresh)** states.

---

## 3. Definition of Done (Verification)

Before completing any web task:
* Run TypeScript type-checking (`npx tsc --noEmit`), linting (`npm run lint`), and production build verification (`npm run build`) to confirm zero errors.
