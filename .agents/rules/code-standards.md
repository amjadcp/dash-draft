# Rule: Code Standards, Readability & Consistency

This is the highest-priority rule after security. Apply it to every file you touch, not just new ones — if you're already editing a file, leave it more consistent than you found it (but don't scope-creep an unrelated refactor into a feature PR).

## TypeScript

- `strict: true` everywhere. Never add `// @ts-ignore` or `as any` to make an error go away — fix the type, or if the type genuinely can't be known, narrow with a proper type guard and comment explaining why.
- No `any`. Use `unknown` and narrow it, or a real generic.
- Every exported function has an explicit return type. Inference is fine for local/private helpers, not for public API surface — explicit types at boundaries are documentation.
- Use `type` for shapes derived from a Zod schema (`z.infer<typeof XSchema>`); use `interface` for hand-authored contracts meant to be extended or implemented.
- Discriminated unions over boolean flags for state that has more than two meaningfully distinct shapes (e.g. a query result is `{ status: 'idle' } | { status: 'loading' } | { status: 'success', data } | { status: 'error', error }`, not four separate booleans).

## Naming

- Files: `kebab-case.ts` / `kebab-case.tsx`.
- Components: `PascalCase`, filename matches the component name.
- Hooks: `useCamelCase`.
- Zod schemas: `XyzSchema`; inferred type: `Xyz`.
- Booleans read as a question or a state: `isLoading`, `hasError`, `canSubmit` — never `loading`, `error`, `submit` for a boolean.
- No abbreviations that aren't immediately obvious (`req`/`res` in Express handlers are fine — the ecosystem convention; `usr` or `qry` are not).

## Functions & Components

- One responsibility per function. If you need "and" to describe what a function does, split it.
- Prefer pure functions in `lib/` for anything that isn't inherently about rendering or I/O — this is what makes `lib/crypto` and `lib/sql` actually testable in isolation.
- React components: keep them focused on composition and rendering. Extract non-trivial logic (data transforms, validation, calculations) into a hook or a `lib/` function rather than inlining it in JSX or a `useEffect`.
- Max function length as a smell, not a hard rule: if a function scrolls past one screen, ask whether it should be split before adding to it.
- Early returns over nested conditionals. Guard clauses at the top of a function, not a pyramid of `if`s.

## Comments

- Comments explain **why**, not **what** — the code should already say what it does. A comment restating the next line in English is noise; delete it.
- Every non-obvious business rule or security-relevant decision gets a comment (e.g. "we intentionally never decrypt here — the relay must not be able to read payloads").
- No commented-out code left in a commit. Delete it — git history is the archive.

## Error Handling

- Never swallow an error silently (`catch {}`). At minimum, rethrow with context or map it into the shared `ErrorEnvelope` shape.
- Use the shared `ErrorEnvelope` (from `packages/mcp-contracts`) for anything crossing an app boundary. Internal-only errors can be plain `Error` subclasses, but should still have a distinct, greppable class name (`InvalidSessionError`, not a generic `Error("bad session")`).
- Validate all external input (uploaded CSV structure, incoming MCP tool calls, WebSocket messages) at the boundary with the relevant Zod schema before doing anything else with it.

## Consistency Over Cleverness

- If the codebase already has a pattern for something (a hook for fetching, a wrapper for sql.js calls, a button component), use it. Don't introduce a second way to do the same thing because it's marginally nicer — propose a repo-wide migration instead if the existing pattern is actually bad.
- Match the shape of nearby code. A new API route handler should look like the other route handlers in the same file/folder unless there's a documented reason it can't.
- Formatting is not a judgment call — Prettier + ESLint are the source of truth. Run them, don't hand-format.

## React Specifics

- Co-locate a component's styles, tests, and the component itself; don't scatter one component's files across unrelated folders.
- Keep URL state (via `nuqs`) and component-local state (via `useState`) clearly separated — if a value needs to survive a refresh or be shareable, it's URL state; if it's purely transient UI state (an open dropdown, a hover state), it's local state. Don't put transient state in the URL, and don't put shareable state only in memory.
- No inline anonymous functions passed as props to expensive/list-rendered children — extract with `useCallback` where it actually matters for render cost (see `.agents/rules/performance.md`), not reflexively everywhere.

## Express/Relay Specifics

- Every route handler validates its input against a Zod schema before touching business logic.
- Middleware does one thing (auth, validation, error mapping) — don't build a middleware that both authenticates and transforms the request body.
- No business logic in `server.ts` — it wires things together and nothing else.

## Definition of Done for any change

- [ ] Lint passes with zero warnings, not just zero errors
- [ ] Typecheck passes
- [ ] Relevant tests pass, and new logic has new tests
- [ ] No `any`, no `@ts-ignore`, no commented-out code
- [ ] Naming and file placement match existing conventions in the touched area
