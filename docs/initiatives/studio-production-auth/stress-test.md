---
stress-tested: 2026-03-18
assumptions-extracted: 10
tested: 5
confirmed: 5
refuted: 0
inconclusive: 0
human-required: 1
---

# Studio Production Auth — Stress Test

## Assumptions Inventory

| # | Assumption | Rating | Load-bearing? | Tested? |
|---|-----------|--------|---------------|---------|
| A1 | Better Auth works with `better-sqlite3` v12.8.0 (our existing driver) | Reasoned | Critical | Yes |
| A2 | Better Auth's API key plugin can validate from raw `http.IncomingMessage` (MCP server) | Asserted | Critical | Yes |
| A3 | Two Node.js processes can safely share one SQLite WAL-mode database | Reasoned | Critical | Yes |
| A4 | Better Auth works with Next.js 16 App Router | Sourced | High | No (sourced) |
| A5 | Vercel DNS allows A records pointing to non-Vercel IPs | Asserted | High | Yes |
| A6 | Caddy can obtain Let's Encrypt certs for a subdomain | Reasoned | High | No (standard) |
| A7 | VPS has enough headroom for Caddy + CrowdSec | Reasoned | Medium | Yes |
| A8 | Better Auth's `nextCookies()` plugin works with Next.js 16 server actions | Reasoned | Medium | No |
| A9 | CrowdSec and fail2ban coexist without conflict | Reasoned | Low | No |
| A10 | No self-registration is acceptable long-term | Human-testable | Low | No |

## Results: Confirmed

### A1: Better Auth + better-sqlite3 — CONFIRMED

**Test:** Examined Better Auth's driver detection, Kysely interface contract, peer dependency range, and schema type mapping against SQLite constraints.

**Evidence:**
- Better Auth duck-types `better-sqlite3` by checking `"aggregate" in db` → creates Kysely `SqliteDialect`
- Peer dependency: `better-sqlite3: ^12.0.0` — our v12.8.0 satisfies
- Kysely interface contract (`close()`, `prepare()`, `all()`, `run()`, `iterate()`) — all present on better-sqlite3
- Schema uses only SQLite-safe types: `text`, `integer`, `date`. No JSON columns, no arrays. API key `permissions` and `metadata` fields stored as serialized text.
- ESM required — Sherpa packages are already `"type": "module"`

**Discovery: Zod version mismatch.** Better Auth requires `zod@^4.3.6`; Sherpa uses `zod@^3.25.76`. **Not a blocker** — pnpm's strict `node_modules` isolation means each gets its own version. **Implementation rule:** never pass Zod schemas across the Better Auth boundary (e.g., don't compose a zod@3 schema with a Better Auth validator).

**Recommendation:** Use separate `auth.db` file (not shared with coordination.db). Better Auth manages its own Kysely connection and migrations. Sharing a DB file would create two systems managing the same connection with potential pragma conflicts.

### A2: API key plugin from raw HTTP — CONFIRMED

**Test:** Examined Better Auth's `verifyApiKey` function signature, source code, and test suite for framework dependencies.

**Evidence:**
- `auth.api.verifyApiKey({ body: { key: "the_key_string" } })` — takes only a body with the key string. No headers, no request object, no session required.
- Source (`verify-api-key.ts`) uses only `ctx.body`, never `ctx.request` or `ctx.session`
- Test suite confirms: most tests call with `body: { key }` only
- `auth.api` methods are plain function calls via `better-call` framework — return JS objects, not Response objects
- Better Auth repo includes `e2e/integration/vanilla-node/` using `http.createServer` + `toNodeHandler(auth)`
- `fromNodeHeaders` utility exists for session validation from `IncomingMessage` headers, but not needed for API key validation

**Implementation pattern for MCP server:**
1. Extract `req.headers["x-api-key"]` (plain string)
2. Call `auth.api.verifyApiKey({ body: { key } })`
3. Check `result.valid` — if false, return 401

**The kill criterion in shape.md (A2 failure → custom token system) is not needed.** The plugin works natively from raw HTTP.

### A3: SQLite WAL shared access — CONFIRMED

**Test:** Examined SQLite WAL documentation, better-sqlite3 multi-process support, and potential failure modes against our specific access pattern.

**Evidence:**
- SQLite WAL docs: "Readers do not block writers and a writer does not block readers. Reading and writing can proceed concurrently."
- better-sqlite3 maintainer (Issue #250): "Yes, multiple processes can access a single SQLite3 database just fine."
- Our pragmas (`journal_mode = WAL`, `synchronous = NORMAL`, `busy_timeout = 5000`) are the standard multi-process recipe
- `better-sqlite3`'s synchronous API is an advantage: each `.run()`/`.get()` acquires and releases locks within a single tick — eliminates WAL checkpoint starvation from leaked async read transactions
- Our access pattern (short, non-overlapping write transactions, mostly reads) is the easy case

**Investigated failure scenarios that do NOT apply:**
- Network filesystem corruption (both processes on same machine)
- POSIX lock cancellation via `close()` (single connection per file via pool Map)
- `fork()` with open connections (neither service forks)
- `SQLITE_BUSY_SNAPSHOT` (no read-then-write-in-same-transaction pattern)

**Watch-item:** WAL checkpoint starvation under sustained load. Low risk with synchronous API. Mitigation if needed: periodic `PRAGMA wal_checkpoint(RESTART)`.

### A5: Vercel DNS external A records — CONFIRMED

**Test:** Searched for Vercel DNS restrictions on pointing subdomains to external IPs.

**Evidence:**
- Vercel KB article ["How do I point a subdomain to a service outside of Vercel?"](https://vercel.com/kb/guide/pointing-subdomains-to-external-services) documents exactly this use case
- REST API schema: A record value is `format: ipv4` — any valid IPv4 accepted, no Vercel IP restriction
- CLI command: `vercel dns add sherpa.solar studio A <VPS_IP>`
- Vercel DNS is pure DNS (no proxy layer like Cloudflare) — traffic goes directly to VPS

**Important caveat: TLS is our responsibility.** Vercel only auto-provisions certificates for domains resolving to Vercel infrastructure. Caddy on the VPS must handle Let's Encrypt for `studio.sherpa.solar`.

**Action item:** Check for CAA records on `sherpa.solar` before Caddy attempts certificate issuance: `dig CAA sherpa.solar +short`. If CAA records exist, ensure `letsencrypt.org` is allowed.

### A7: VPS resource headroom — CONFIRMED

**Test:** Estimated RAM footprint for all existing and new services against 8GB total.

**Evidence:**

| Service | Estimated RAM |
|---------|--------------|
| Linux kernel + OS | ~320 MB |
| Docker daemon | ~300 MB |
| OpenClaw container | ~500 MB |
| Sherpa Studio (Next.js) | ~220 MB |
| Sherpa MCP server | ~80 MB |
| Tailscale | ~30 MB |
| fail2ban | ~50 MB |
| Cron + misc | ~50 MB |
| **Existing total** | **~1,550 MB** |
| Caddy (new) | ~30 MB |
| CrowdSec (new) | ~150 MB |
| **New total** | **~180 MB** |
| **Grand total** | **~1,730 MB / 8,192 MB (21%)** |

**~79% headroom.** Caddy + CrowdSec add negligible load.

**Watch-items:**
- CrowdSec can grow under sustained attack (documented OOM issues). Mitigate with `systemd MemoryMax=512M`.
- CrowdSec can replace fail2ban's SSH jail entirely — consider dropping fail2ban to save ~50 MB and eliminate Python memory leak risk.
- OpenClaw spikes to 800 MB-1 GB under active agent tasks. Still within budget.

## Results: Refuted

None.

## Results: Inconclusive

None. All tested assumptions confirmed.

## Untested (Low Priority)

| # | Assumption | Why not tested |
|---|-----------|----------------|
| A4 | Better Auth + Next.js 16 | Sourced in research — multiple starter templates confirm compatibility |
| A6 | Caddy + Let's Encrypt | Standard operation, well-documented. CAA record check is the only risk (flagged as action item in A5) |
| A8 | `nextCookies()` + Next.js 16 server actions | Medium priority; will surface immediately in Session 2 if broken |
| A9 | CrowdSec + fail2ban coexistence | Low priority; CrowdSec may replace fail2ban entirely |

## Human-Required

### A10: No self-registration is acceptable long-term

**Suggested test:** After auth is deployed, observe for 30 days. If Rob needs to create more than 3 accounts manually, or if a client engagement requires account provisioning as part of setup, revisit. The current no-go (admin creates all accounts) is correct for an internal tool with 1-2 users. It may not hold for `client-deployment-pipeline` deployments.

## Recommended Changes

### Update to proposal/shape (minor)

1. **Add to Session 2 checklist:** Verify Zod 3/4 isolation works in pnpm monorepo during Better Auth install. If type errors surface at the boundary, add explicit `overrides` in root `package.json`.

2. **Add to Session 4 checklist:** Run `dig CAA sherpa.solar +short` before Caddy setup. Add `letsencrypt.org` CAA record if needed.

3. **Consider in Session 4:** Replace fail2ban SSH jail with CrowdSec's `crowdsecurity/sshd` scenario rather than running both. Saves ~50 MB, eliminates duplicate detection.

4. **Add to Session 4:** Set `MemoryMax=512M` on CrowdSec's systemd unit to prevent OOM under attack.

### No changes to kill criteria

All kill criteria in shape.md remain valid, but A2 (API key plugin from raw HTTP) is now confirmed — the fallback to a custom token system is unlikely to be needed. Keep the kill criterion anyway as defense in depth.
