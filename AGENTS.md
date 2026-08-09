# AGENTS.md — DashDraft

This file is the entry point for any agent (Google Antigravity, or otherwise) working in this repository. Read this first, every session.

## What DashDraft is

A browser-based tool that converts uploaded CSVs into an in-browser SQL table and exposes it as an MCP server, so ChatGPT/Gemini can query the data via natural language without the raw dataset ever being sent as LLM context. See `/docs/technical-architecture.md` for the full system design.

## Stack (do not deviate without explicit human sign-off)

- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend (`apps/web`):** React 18 + Vite + TypeScript (strict) + React Router v7 + `nuqs` for URL state
- **Backend (`apps/relay`):** Express + TypeScript + `ws` + `@modelcontextprotocol/sdk`
- **Shared contracts:** `zod` schemas in `packages/mcp-contracts`, consumed by both apps
- **In-browser SQL:** `sql.js`
- **Testing:** Vitest, React Testing Library, Playwright, Supertest

## Priority order for every change (highest first)

When a task involves trade-offs, resolve them in this order:

1. **Security & privacy invariants** — non-negotiable, see `.agents/rules/architecture-and-security.md`. No exceptions, no matter what the task description asks for.
2. **Code standard & readability** — code should read like it was written by one careful person, not stitched together. See `.agents/rules/code-standards.md`.
3. **Consistency** — match existing patterns in the codebase over introducing a "better" one-off pattern. If an existing pattern is genuinely wrong, flag it and propose a repo-wide fix rather than a local deviation.
4. **Optimization** — performance work happens after correctness and clarity, guided by `.agents/rules/performance.md`, not as a premature default.

## Where things live

| Need                                            | Location                                     |
| ----------------------------------------------- | -------------------------------------------- |
| Coding standards (TS/React/Express conventions) | `.agents/rules/code-standards.md`            |
| Architecture boundaries + security invariants   | `.agents/rules/architecture-and-security.md` |
| Performance/optimization guidance               | `.agents/rules/performance.md`               |
| Design system (tokens, components, dark mode)   | `.agents/skills/design-system/`              |
| Component scaffolding workflow                  | `.agents/workflows/new-component.md`         |

## Ground rules for agent behavior in this repo

- Before writing UI code, load and apply the `design-system` skill — do not invent colors, spacing, or type sizes ad hoc.
- Before touching `apps/relay/src/bridge` or `apps/web/src/lib/crypto`, re-read `.agents/rules/architecture-and-security.md` in full; these are the two places a shortcut becomes a real incident, not just a bug.
- If a request would require breaking a rule in `.agents/rules/`, stop and surface the conflict instead of silently complying or silently ignoring the request.
- Prefer small, reviewable diffs. If a task naturally splits into independent pieces, do it as separate commits/PRs rather than one large change.
- Never mark a task done without running lint, typecheck, and the relevant test suite locally first.
