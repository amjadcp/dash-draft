---
name: design-system
description: Applies the DashDraft visual design system — color tokens, typography scale, spacing, and component patterns, with full light/dark theme support — when creating or modifying any UI in apps/web. Use whenever building a React component, page, or styling a layout.
---

# DashDraft Design System

This skill governs how UI gets built. It's derived from the DashDraft brand direction: minimal, monochrome-first, editorial typography, with a single restrained accent color reserved for interactive/brand moments. It supports light and dark themes as first-class, not as an afterthought.

## Before you write any UI code

1. Read `resources/tokens.css` — every color, spacing, radius, and type value used in the app comes from these CSS custom properties. Never hardcode a hex value, a pixel size, or a font-weight number directly in a component.
2. Read `resources/component-patterns.md` — it documents how the core patterns (card, button, icon badge, section/emphasis block, nav) are built from the tokens, including the dark-mode behavior for each.
3. If a component you need isn't documented in `component-patterns.md`, build it from the tokens directly and follow the same conventions (semantic token names, surface-scoped contrast) rather than inventing a new one-off pattern — then propose adding it to `component-patterns.md` for reuse.

## Core principles

- **Semantic tokens over raw values.** Components reference `var(--color-text-primary)`, never `#0D0D10`. This is what makes theme switching (and any future rebrand) a token-file change, not a find-and-replace across the codebase.
- **Surface-scoped contrast.** "Emphasis" sections (e.g. a CTA block) invert relative to the _current_ theme, not to a fixed value — this is implemented by re-scoping the color variables inside a `.surface-emphasis` container rather than hardcoding black/white. See `component-patterns.md` for the exact mechanism.
- **Theme switching mechanism:** `data-theme="light" | "dark"` attribute on `<html>`, driven by a theme hook that respects system preference by default and persists an explicit user override. Tokens are defined once in `:root` (light) and overridden in `[data-theme="dark"]` — components never branch on theme in JS/TSX, they just consume the current token value.
- **Accent color is rare, not decorative.** The base brand is monochrome (black/white/gray, matching the source brand direction). The accent (indigo) is reserved for: links, focus rings, active/selected states, and primary interactive affordances specific to the app (e.g. "run query" button, connection-status indicators). Don't reach for it to "add some color" to a section.
- **Accessibility is not optional.** All text/background pairings must meet WCAG AA contrast in both themes — the token file has been built to satisfy this; if you introduce a new combination, verify contrast before shipping it.

## Typography voice

Bold, confident headings; quiet, restrained body copy. Headings use the primary text color at full weight (700); descriptive/secondary copy is always the secondary text token, never a lighter shade of the primary token improvised on the spot.
