# DashDraft Component Patterns

Derived from the reference brand direction. Every value below is a token from `tokens.css` — treat this file as the mapping between "what the reference design shows" and "which token to use," not as a second source of truth for raw values.

## Surfaces

DashDraft has two surface contexts. Every component's colors resolve from whichever surface it's rendered inside.

**Default surface** (the normal page):
```css
.surface-default {
  background: var(--color-bg);
  color: var(--color-text-primary);
}
```

**Emphasis surface** (CTA blocks, banners — inverts relative to the current theme):
```css
.surface-emphasis {
  background: var(--color-emphasis-bg);
  color: var(--color-emphasis-text);
  border-radius: var(--radius-lg);
  padding: var(--space-20) var(--space-8);
}
```
Inside `.surface-emphasis`, re-point the shared text/border variables to the emphasis values so children (buttons, secondary text) automatically pick up the right contrast without any component-level theme branching:
```css
.surface-emphasis {
  --color-text-primary: var(--color-emphasis-text);
  --color-text-secondary: var(--color-emphasis-text-secondary);
  --color-border-strong: var(--color-emphasis-text);
}
```

## Cards (feature/service cards)

Reference: the three-column "Story & Content / Book Making / Technology" cards.

```css
.card {
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-8);
}
.card-title {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}
.card-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}
.card-list-item {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}
```
Dark mode: `--color-bg-subtle` becomes a lighter-than-page elevated tone automatically via the token override — no component change needed.

## Icon Badge

Reference: the circular outline icon above each card title.

```css
.icon-badge {
  width: var(--badge-size);
  height: var(--badge-size);
  border-radius: var(--radius-full);
  border: var(--badge-border-width) solid var(--color-border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
}
```
No fill, ever — this is a linework mark, not a filled icon container. Icon glyphs inside should be stroke-based (not filled) at ~24px, inheriting `currentColor`.

## Buttons

Two variants, both surface-aware — never hardcode which one is "the dark one."

```css
.btn {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-sm);
  transition: opacity 120ms ease;
}

.btn-solid {
  background: var(--color-text-primary);
  color: var(--color-bg);
  border: none;
}
.btn-solid:hover { opacity: 0.85; }

.btn-outline {
  background: transparent;
  color: var(--color-text-primary);
  border: 1.5px solid var(--color-border-strong);
}
.btn-outline:hover { background: var(--color-bg-subtle); }
```
Because `.btn-solid`/`.btn-outline` reference `--color-text-primary` and `--color-bg` rather than hardcoded black/white, dropping either button inside `.surface-emphasis` automatically produces the correct inverted contrast (this is exactly how the reference screenshot's CTA buttons work: solid = surface-bg-colored fill, outline = surface-fg-colored stroke).

**Accent button** (for app-specific primary actions, e.g. "Run Query" — distinct from the brand-neutral `.btn-solid`, used when you specifically want to draw the eye with the accent color, not for general-purpose CTAs):
```css
.btn-accent {
  background: var(--color-accent);
  color: var(--color-accent-text-on-accent);
  border: none;
}
.btn-accent:hover { background: var(--color-accent-hover); }
```

## Navigation Bar

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-8);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}
.nav-link {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-primary);
}
```

## Wordmark / Logo

The reference uses a bold, tight-tracked, two-line wordmark split by a slash. For DashDraft, treat the logo as a design task separate from this token system (a mark hasn't been finalized) — but the wordmark typography convention to follow once it is: `font-weight: var(--weight-bold)`, uppercase, `letter-spacing: -0.02em`, set in `--color-text-primary`.

## Section Rhythm

- Section-to-section vertical spacing: `var(--space-20)`.
- Card grid gap: `var(--space-8)`.
- Standard content max-width: `1200px`, centered.
