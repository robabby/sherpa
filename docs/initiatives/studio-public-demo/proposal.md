---
status: pending
initiative: studio-public-demo
created: 2026-06-13
updated: 2026-06-13
type: new-plan
risk: structural
targets:
  - apps/studio/src/middleware.ts
  - apps/studio/src/lib/auth/
  - packages/studio-core/src/linear-tasks.ts
  - docs/templates/server-provision.md
dependencies:
  - studio-production-auth
  - open-source-readiness
informs:
  - website-studio-product
spawned-from: website-studio-product
---

# Proposal: Public read-only Studio demo (demo.sherpa.solar)

> **Proposal only — no implementation in this pass.** Spawned from the hiring-manager
> audit (R11, long-term). Gated by `studio-production-auth` (done) and
> `open-source-readiness` (in progress).

## Summary

Stand up a public, auth-free, **read-only** instance of Sherpa Studio at
`demo.sherpa.solar`, seeded with Sherpa's own governance data. A visitor can click through
the process workspace, task board, and research dashboard without an account — and can
change nothing. This converts the audit's #1 structural weakness (the most impressive thing
Sherpa has built is invisible behind a login) into its #1 differentiator: a live governance
system governing its own development, that anyone can open in a browser.

## State Snapshot

- Studio is currently auth-gated end to end. `studio-production-auth` (integrated, 2026-03-19)
  shipped Better Auth — sessions for humans, API keys for agents — behind Caddy + TLS +
  CrowdSec at `studio.sherpa.solar`. There is no unauthenticated path into any Studio route.
- The website audit's Phase 1–2 work bridged Studio onto the marketing site with **static
  screenshots** (R1, the "See it running" section) and Phase 5 adds a **recorded walkthrough**
  (R6). Both are recordings. Neither lets a visitor touch the real thing.
- The task board reads live from Linear via `getLinearTaskBoard` (rewritten in Phase 3 to a
  single cached GraphQL request). Research and process data read from the filesystem / the
  `.sherpa` SQLite layer. Some of this data is safe to show publicly; some is not (see Review
  Notes).
- Studio already supports multi-project federation (`multi-project-studio`, integrated): the
  registry includes `sherpa`, `wavepoint`, and `robabby`. A public demo must expose **only**
  the `sherpa` project — wavepoint is client data.

## Proposed Approach (high level)

This is the shape, not the plan — the plan comes after the gates clear.

1. **A first-class read-only mode**, not a bypass. Introduce a `STUDIO_PUBLIC_READONLY` server
   mode that:
   - Serves read routes (process, tasks, research, conventions, workforce) without an auth session.
   - Hard-disables every mutation at the source: initiative approve / status transitions,
     dispatch actions, and all MCP write tools return 403 regardless of input. Defense in depth —
     the UI hides the controls *and* the server refuses the writes.
   - Scopes the project registry to `sherpa` only; other projects are not resolvable.
2. **A sanitized data path.** The demo must never read secrets or client data. Either (a) point
   it at a curated, committed snapshot of the `sherpa` project's governance artifacts, or
   (b) serve live filesystem data with an explicit allowlist of safe directories. The Linear-backed
   task board uses a **pre-rendered snapshot** rather than a live API token (no public app should
   hold the Linear key, and the board would otherwise burn the hourly quota under public traffic).
3. **Separate deployment.** `demo.sherpa.solar` as its own service/subdomain, distinct from the
   auth-gated `studio.sherpa.solar`. Same VPS, separate process and config, behind Caddy with
   rate limiting and CrowdSec (an auth-free public app needs abuse protection the gated one doesn't).

## Rationale

- **The thumb-drive test, for the web.** The desktop-app vision is "install and demo in 60
  seconds." The web equivalent is "open a URL and see the system running." Nobody evaluating
  Sherpa — a hiring manager, a peer, a prospective adopter — should have to take "128 nodes in a
  process workspace" on faith when they could click it.
- **It's a differentiator no competitor can copy cheaply.** Plenty of teams claim governance.
  Almost none can show their governance system governing its own development, live and
  inspectable. The demo *is* the proof.
- **It compounds the rest of the audit work.** R1 (screenshots) and R6 (video) are the
  appetizer; a clickable demo is the meal. The "See it running" section can link straight to it.

## Dependencies

- **`studio-production-auth` (hard gate — satisfied).** Provides the deployment topology
  (Caddy, TLS, CrowdSec on the VPS) and the auth layer this work selectively *disables*. The
  read-only mode is a modification of that middleware, so it has to exist first. It does.
- **`open-source-readiness` (hard gate — in progress).** Publishing Sherpa's own governance
  data — initiative names, task titles, research, decision records — to an auth-free URL is a
  disclosure decision. It should not ship before the project is comfortable being publicly
  legible, which is exactly what `open-source-readiness` is deciding. This gate is the reason
  R11 is long-term, not immediate.
- **`website-studio-product` (informs).** The demo, once live, becomes the primary CTA target
  for the "See it running" section — this proposal feeds that decision but doesn't block it.

## Effort

**Effort:** 3–4 sessions (once gates clear)
**Session breakdown:**
- Session 1: Read-only mode in middleware + mutation lockdown at the source; project scoping to `sherpa`.
- Session 2: Sanitized data path — snapshot strategy for Linear board, allowlist for filesystem reads, audit for secret/client-data leakage.
- Session 3: Deployment — `demo.sherpa.solar` service, Caddy config, rate limiting, CrowdSec.
- Session 4 (if needed): Hardening pass — try to mutate/read past the allowlist from outside; fix what gets through.

## Review Notes

- **Read-only must be enforced server-side, not just hidden in the UI.** The whole pitch is
  "governance you can trust"; a demo that can be poked into mutating state would be the worst
  possible counter-advertisement. Every write path returns 403 at the server, independent of UI.
- **Data sanitization is the real risk, not the auth bypass.** Safe to show: `sherpa` initiative
  trails, task titles, research reports, conventions, agent role definitions. Must never appear:
  `.env*`, `apps/studio/.env.local`, any API key or token, and the entire `wavepoint` project
  (client data). A committed snapshot is safer than live reads precisely because it's reviewable.
- **The Linear dependency forces a snapshot.** A public, auth-free board cannot hold the Linear
  API key, and live traffic would exhaust the 2,500/hr quota anyway. Pre-rendering the board to a
  static snapshot (refreshed on a schedule) is the right call — and conveniently removes the
  exact fragility Phase 3 had to cache around.
- **Abuse surface.** An auth-free public app invites scraping and probing. Rate limiting +
  CrowdSec are not optional here the way they're a backstop for the gated instance.
- **Open question for Rob:** snapshot vs. live filesystem reads. Snapshot is safer and cheaper
  but goes stale between refreshes; live reads are current but need a tight allowlist. Lean
  snapshot unless "always current" turns out to matter for the demo's credibility.
