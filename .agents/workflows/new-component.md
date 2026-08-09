---
description: Scaffold a new React component in `apps/web` that fully complies with the design system and code standards, rather than a bare starting point.
---

# Workflow: /new-component

Scaffold a new React component in `apps/web` that fully complies with the design system and code standards, rather than a bare starting point.

## Steps

1. Ask (if not already specified in the invoking prompt): component name, which feature folder it belongs to (`apps/web/src/features/<feature>/`), and whether it needs URL-synced state.
2. Load the `design-system` skill and `.agents/rules/code-standards.md` before writing anything.
3. Create:
   - `ComponentName.tsx` — the component itself. Props typed with an explicit `interface ComponentNameProps`. No inline styles — use tokens via CSS classes or a CSS module, per `component-patterns.md`.
   - `ComponentName.test.tsx` — at minimum, a render test and a test for each interactive behavior the component exposes.
   - If the component needs URL state, use `nuqs`'s `useQueryState` rather than ad hoc `useSearchParams` parsing.
4. Verify the component works in both themes by checking it renders correctly with `data-theme="light"` and `data-theme="dark"` on a parent element — this should require zero component-level branching if tokens were used correctly.
5. Run lint, typecheck, and the new test file. Fix anything that fails before considering the task done.
6. Report back: file paths created, and explicitly confirm dark mode was verified (not just assumed from token usage).
