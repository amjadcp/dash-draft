# Rule: Performance & Optimization

Optimization is priority #4, after security, readability, and consistency (see `AGENTS.md`). Don't optimize prematurely or at the cost of clarity — but the items below are known, specific hotspots in this system where performance is part of the actual product requirement (low token usage, responsive UI on large files), not a nice-to-have.

## CSV Parsing & sql.js (the core "large file" path)

- Parse CSVs with `papaparse` in **streaming** mode (`step`/`chunk` callbacks), not by reading the whole file into a string first. Large CSVs are the entire reason this tool exists — don't reintroduce the memory-blowup problem we're trying to solve.
- Run `sql.js` operations off the main thread via a Web Worker for any file above a defined size threshold (start at 5MB, make it configurable). A multi-second UI freeze while converting a CSV is a correctness-adjacent bug for this product, not a minor rough edge.
- Batch `INSERT` statements inside a single transaction rather than one statement per row — this is a 10-100x difference in sql.js and costs nothing in readability if wrapped in a small helper.

## Query Path (the token-savings path)

- Never send full table contents to an LLM. Only schema + the user's question go out; only query results come back. This is the product's core value proposition — treat any code path that would leak full-table data into a prompt as a bug, not a style issue.
- Keep the schema payload sent to the LLM minimal: column names and types, not a full data dictionary, unless the tool call explicitly asks for sample rows.

## Relay

- The relay must not accumulate unbounded memory from long-lived WebSocket sessions. Clean up session state on disconnect; don't let a browser tab closing mid-request leave a dangling reference.
- Keep the relay's per-request work O(1) relative to payload size where possible — it's forwarding bytes, not processing them; if you find yourself parsing/transforming payload contents in the relay, that's very likely a violation of `.agents/rules/architecture-and-security.md`, not just a performance issue.

## React/Frontend

- Avoid unnecessary re-renders on the query/result views specifically — these can involve large result sets. Memoize expensive derived data (`useMemo`) and virtualize long result tables rather than rendering thousands of DOM rows.
- Code-split the `sql.js` WASM bundle and any large dependency (papaparse for very large files, syntax highlighters, etc.) so the initial page load stays fast — lazy-load them at the point of first use (CSV upload / query execution), not in the main bundle.
- Debounce anything reacting to rapid user input (schema search/filter, live query preview) — don't fire a re-render or a network call per keystroke.

## When Not to Optimize

- Don't add caching, memoization, or worker offloading to code paths that aren't actually hot (small config reads, one-time setup, admin/rarely-used UI). If you're not sure something is hot, don't guess — leave it simple and note it as a candidate if profiling later shows otherwise.
