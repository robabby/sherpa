---
status: in-progress
initiative: studio-production-auth
created: 2026-03-18
updated: '2026-03-18'
type: new-plan
risk: structural
targets:
  - apps/studio/src/middleware.ts                        # (new file)
  - apps/studio/src/lib/auth/                            # (new directory)
  - apps/studio/src/app/layout.tsx
  - apps/studio/src/app/api/auth/[...all]/route.ts       # (new file)
  - apps/studio/src/app/auth/                            # (new directory)
  - apps/studio/src/components/auth/                     # (new directory)
  - apps/studio/src/env.ts                               # (new file)
  - apps/studio/next.config.ts
  - packages/studio-mcp/src/http-server.ts
  - packages/studio-mcp/src/auth/                        # (new directory)
  - docs/templates/server-provision.md
dependencies:
  - vps-remote-compute
informs:
  - client-deployment-pipeline
  - sherpa-website
personas:
  - engineer
spawned-from: null
---

# Studio Production Auth

## Summary

Add authentication to the production Sherpa Studio instance and MCP server running on the Hetzner VPS using Better Auth — a TypeScript-native, self-hosted auth framework with first-class API key support. Establishes the auth convention for all Sherpa deployments. Includes deploying Studio at `studio.sherpa.solar` with TLS via Caddy, and a VPS security hardening sweep with free monitoring tooling.

## State Snapshot

**Studio app** (`apps/studio/`) — Next.js 16 app with no auth layer. Root layout (`src/app/layout.tsx`, 67 lines) renders sidebar + content with no user concept. No `middleware.ts` exists. No environment validation for auth-related vars. **Deploys to the Hetzner VPS (not Vercel)** — served by systemd on port 3000 behind Tailscale. Studio reads from the filesystem (initiatives, tasks, agents, sessions) and needs co-located access to the MCP server and coordination databases, so it runs on the VPS alongside those services. The `sherpa-website` initiative's mention of "Two Vercel projects" applies only to the marketing site — Studio is VPS-hosted.

**MCP server** (`packages/studio-mcp/src/http-server.ts`, 142 lines) — HTTP server accepting any POST to `/mcp`. Sessions tracked by `mcp-session-id` header (randomUUID), no identity association. Health check at `/health` unauthenticated. Authority system constrains what agents do, not who connects.

**VPS** (`5.78.128.178`, CPX31 8GB) — UFW (SSH/HTTP/HTTPS + Docker bridge), fail2ban (SSH), Tailscale mesh. Studio at port 3000, MCP at port 3100, OpenClaw gateway at 18790. No reverse proxy, no public TLS certificate, no intrusion detection beyond fail2ban.

**WavePoint auth** (`../wavepoint/apps/web/src/lib/supabase/`) — Production Supabase Auth with `@supabase/ssr` v0.8 + `@supabase/supabase-js` v2.95. Evaluated and passed over in favor of Better Auth (see ADR 0012). Key patterns that transfer: middleware-based route protection, dual auth paths (session + API key), `getUser()` with request-scoped caching.

**Domain** — `sherpa.solar` owned, DNS managed in Vercel. No DNS records for `studio.sherpa.solar` yet. `sherpa-website` initiative (approved) defines the subdomain architecture.

## Proposed Changes

### 1. Auth Research & Decision ✅

Evaluated Supabase Auth, Better Auth, Clerk, and Auth.js v5 against Sherpa's requirements (internal tool, agent API keys, SQLite, self-hosted for client deployments). **Better Auth selected.** See `docs/decisions/0012-better-auth-over-supabase.md` and `research/auth-evaluation.md`.

### 2. Auth Infrastructure (Studio App)

Better Auth integration with the Studio Next.js app:

**New: `apps/studio/src/lib/auth/`** — Better Auth server instance (`betterAuth({...})`) configured with SQLite database (co-located with coordination DB), email/password credentials, API key plugin, and `nextCookies()` plugin for server action support. Browser client via `createAuthClient()` from `better-auth/react`. Server-side `auth.api.getSession()` with `React.cache()` for request dedup.

**New: `apps/studio/src/app/api/auth/[...all]/route.ts`** — Better Auth route handler via `toNextJsHandler(auth)`. Handles all auth API routes (sign-in, sign-out, session, callbacks).

**New: `apps/studio/src/middleware.ts`** — Next.js middleware for route protection. Validates session cookie exists on every request. Matcher config excludes `/api/auth/*`, health checks, and public assets. Better Auth supports optimistic cookie checks in middleware (cookie existence, not full DB validation — full validation happens in the route handler).

**New: `apps/studio/src/env.ts`** — Environment variable validation. Auth secret, admin emails, base URL. No external service credentials needed (unlike Supabase).

**Modified: `apps/studio/src/app/layout.tsx`** — Wrap with auth session provider. Server-side session fetch seeds client state to prevent loading flash.

### 3. Auth UI

**New: `apps/studio/src/app/auth/`** — Sign-in page. Email/password only — this is an internal tool, not a consumer app. No sign-up page: admin creates accounts via Better Auth admin API or direct database insert.

**New: `apps/studio/src/components/auth/`** — Sign-in form component, user menu (session info + sign out), auth guard wrapper. Minimal — shadcn/ui form components, no modal system needed (dedicated sign-in page, not a modal overlay).

### 4. MCP Server Auth

**Modified: `packages/studio-mcp/src/http-server.ts`** — Auth middleware layer before session handling. Two auth paths:

- **API key** (`x-api-key` header) — for agents (Luna, dispatch workers). Uses Better Auth's API key plugin for validation. Keys generated via Studio UI or admin API. SHA256 hashed in database, scoped per-agent, rate-limited.
- **Session cookie** — for human users accessing MCP via Studio's server-side calls. Validates Better Auth session from forwarded cookies.

**New: `packages/studio-mcp/src/auth/`** — Auth middleware factory, key validation helpers. Shares the same SQLite database as Studio's auth (coordination DB or dedicated auth DB). Health endpoint remains unauthenticated for monitoring.

### 5. Domain & Reverse Proxy

Deploy Studio at `studio.sherpa.solar`:

- **DNS via Vercel** — `sherpa.solar` domain DNS is managed in Vercel's domain settings. Add an A record for `studio.sherpa.solar` pointing to the VPS public IP (`5.78.128.178`). Vercel handles DNS resolution; the VPS handles all traffic for the subdomain. The marketing site (`sherpa.solar`) stays on Vercel's infrastructure.
- **Caddy** as reverse proxy on VPS — automatic Let's Encrypt TLS, simpler config than Nginx for this use case. Proxies `studio.sherpa.solar:443` → `localhost:3000` and routes MCP traffic to `localhost:3100`. Caddy handles the ACME challenge against the public DNS record.
- Configure Better Auth with `studio.sherpa.solar` as the base URL for auth callbacks and cookie domain.
- Tailscale access remains as internal/fallback path (agents on the tailnet can still use the `.ts.net` URL).

### 6. VPS Security Hardening

Comprehensive security sweep and monitoring setup:

- **Port audit** — verify only necessary ports are exposed (22, 80, 443). Close any stale UFW rules.
- **UFW tightening** — review Docker bridge rules, ensure OpenClaw gateway is only reachable via Tailscale (not public IP).
- **CrowdSec** — free, community-driven intrusion detection. Drop-in replacement/complement to fail2ban with shared threat intelligence and richer detection scenarios.
- **Lynis** — security auditing tool. Run baseline scan, address findings.
- **Unattended upgrades** — verify automatic security patches are configured.
- **Docker security** — non-root container user verification, read-only filesystem where possible, resource limits.
- Update `docs/templates/server-provision.md` with hardening procedures.

## Rationale

**Better Auth over Supabase (ADR 0012).** First-class API key plugin eliminates custom code for agent auth. SQLite support means no new database dependency. Self-hosted with zero external services — critical for client deployments. MIT licensed, Auth.js team backing, 27K+ stars.

**Middleware over layout protection.** Layout-based approach (WavePoint's pattern) has a gap: API routes and assets outside protected layouts can leak. Next.js middleware runs on every request.

**Dual identity model.** Humans get session cookies, agents get API keys. Better Auth's API key plugin produces session-equivalent context, so downstream code doesn't need to distinguish between the two auth paths.

**No self-registration.** Internal tool. Admin creates accounts. Eliminates sign-up flow and public registration attack surface entirely.

**Caddy over Nginx.** Automatic HTTPS with zero config for a single-site reverse proxy.

**CrowdSec over standalone fail2ban.** Community threat intelligence, richer detection, modern architecture. Free.

## Dependencies

- **`vps-remote-compute`** (integrated) — VPS infrastructure this auth protects is already deployed.
- **`sherpa-website`** (approved) — DNS setup for `studio.sherpa.solar` is a prerequisite for `sherpa.solar` domain architecture. This initiative informs the website's domain configuration.

## Review Notes

**Scope decision: one initiative vs. split.** Auth, domain, and security hardening are tightly coupled — auth requires the domain (callback URLs), the domain requires TLS (Caddy), and security hardening is the natural complement to exposing a public endpoint.

**Open questions:**
- Should MCP API keys be scoped (read-only vs. full access) or flat? Start flat, add scopes when `ledger-governance-rbac` lands.
- Better Auth's API key plugin supports rate limiting per-key. Configure limits per agent type?
- Should the Tailscale `.ts.net` URL bypass auth (trusted network) or require it too? Recommend: always require auth — defense in depth.
- Auth database: co-locate in coordination.db or dedicated auth.db? Leaning dedicated for clean separation.

**Trade-offs:**
- Diverges from WavePoint's Supabase pattern. Patterns transfer (middleware, dual auth, cached getUser); implementations differ. WavePoint can migrate to Better Auth later.
- Better Auth is under 2 years old. Mitigated by MIT license (forkable), YC backing, Auth.js team merger, weekly releases.
- Caddy adds another service on the VPS. Lightweight (~30MB), worth it for automatic TLS.

**Effort:** 4-5 sessions
**Session breakdown:**
- Session 1: Auth research + ADR ✅ (complete)
- Session 2: Auth infrastructure — Better Auth setup, middleware, environment validation, layout integration, sign-in page
- Session 3: MCP server auth (API key system, token validation) + auth UI polish
- Session 4: Domain setup (DNS, Caddy, TLS) + VPS security hardening (port audit, CrowdSec, Lynis)
- Session 5 (if needed): Integration testing, edge cases, operational runbook
