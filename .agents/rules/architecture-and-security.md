# Rule: Architecture Boundaries & Security Invariants

These are hard constraints, not preferences. If a task seems to require violating one of these, stop and flag it rather than finding a workaround.

## Monorepo Boundaries

- `apps/web` and `apps/relay` never import from each other's `src/`. Shared code lives in `packages/` and is consumed as a workspace dependency.
- Any message shape that crosses an app boundary (browser↔relay, relay↔AI platform) is defined exactly once, as a Zod schema in `packages/mcp-contracts`. Never hand-roll a duplicate type on either side.
- A schema change in `packages/mcp-contracts` and its consuming code in both apps land in the **same PR**. Never merge a one-sided contract change.

## The Relay Is a Dumb, Stateless Pipe — This Is Load-Bearing

The relay (`apps/relay`) exists to terminate TLS, authenticate the calling AI platform via OAuth, and forward opaque bytes between an inbound MCP tool call and the browser's WebSocket session. That's the entire job. Concretely:

- The relay **never** decrypts payload ciphertext. It has no key to do so, and no code path should ever attempt to acquire one.
- The relay **never** persists payload data — no database writes, no disk writes, no in-memory caching of tool-call bodies beyond what's needed to route a single in-flight request.
- The relay **never** logs payload contents. Logging is restricted to: connection lifecycle events, error codes/types, timing metrics, and opaque session IDs. If you're about to add a `console.log` or logger call in `apps/relay`, check what you're logging — if it's derived from a tool-call body in any way, don't.
- Session lookup is keyed by an opaque session ID issued at WebSocket connect time — never by anything derived from the data itself.

Any PR touching `apps/relay/src/bridge` requires two reviewers, per `.agents/rules/code-standards.md`'s definition of done, specifically because a mistake here is a confidentiality incident, not a bug.

## Encryption

- Payload encryption (AES-GCM via WebCrypto) happens **in the browser**, in `apps/web/src/lib/crypto`, before anything touches the WebSocket client.
- The encryption key never leaves the browser and is never sent to the relay in any form, including inside a request that also carries ciphertext.
- Do not implement custom cryptographic primitives. Use WebCrypto's native algorithms only.

## Access Control vs. Confidentiality — Don't Conflate Them

- OAuth 2.1 + PKCE on the MCP endpoint answers "is this AI platform allowed to call this tool at all." It is not a substitute for encryption, and encryption is not a substitute for it. Both are required, independently.

## Terminology Discipline

- Do not describe this system as "end-to-end encrypted" in code comments, docs, or UI copy. The AI platform's backend must read plaintext to answer the user, which breaks the strict two-party definition of E2E. The accurate phrase is **"encrypted in transit, zero server-side retention."** If you see the wrong phrase introduced anywhere (marketing copy, README, UI strings), correct it.

## Browser Capability Boundaries

- The File System Access API is Chromium-only. Any code path using it must feature-detect (`'showDirectoryPicker' in window`) and provide a working fallback (download-based export), not a silent failure or a broken button.
- `sql.js` runs in-memory by default. If a task assumes persistence across reloads, it needs `absurd-sql`/IndexedDB explicitly wired in — don't assume persistence that isn't actually implemented.

## Environment & Secrets

- Secrets (OAuth client secret, signing keys) exist only in `apps/relay`'s runtime environment. Never let one end up in `apps/web`'s bundle, a shared package's default export, or a test fixture that gets committed.
- Every app validates its required environment variables at startup via a Zod schema and fails fast with a clear message — don't let a missing var surface as a confusing runtime error three requests later.
