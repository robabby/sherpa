---
started: 2026-03-18
worktree: null
---

# Studio Production Auth — Activity Log

## 2026-03-18 — Session 1: Research, Shape, Stress Test, Design, Plan

- Evaluated four auth solutions: Supabase Auth, Better Auth, Clerk, Auth.js v5
- **Decision: Better Auth** — TypeScript-native, SQLite support, first-class API keys for agents, self-hosted, MIT licensed
- ADR written: `docs/decisions/0012-better-auth-over-supabase.md`
- Research documented: `research/auth-evaluation.md`
- **Shaped**: 4 session appetite (1 spent, 3 remaining). 7 rabbit holes identified, 8 no-gos.
- **Stress tested**: 5/5 critical assumptions confirmed, 0 refuted. Key findings: Zod 3/4 gap (pnpm isolates), API key plugin works from raw HTTP, separate auth.db recommended.
- **Designed**: Architecture (two auth instances sharing auth.db via WAL), UI (sign-in page + sidebar user menu), file plan (18 files across 3 sessions). Prototype at `prototype.html`.
- **Implementation plan written**: `plan.md` — 20 tasks across 3 sessions. Route group restructure for auth/studio layout separation. MCP auth middleware with dual API key + session cookie paths. Caddy + CrowdSec + Lynis for VPS hardening.

## 2026-03-19 — Sessions 2-4: Implementation

- Session 2 (Tasks 1-10): Better Auth installed, auth.db path added, server/client instances, API route handler, middleware, route group restructure (50+ routes into `(studio)/`), sign-in page + form, user menu in sidebar footer, seed script, env validation. End-to-end verified locally.
- Session 3 (Tasks 11-14): MCP auth middleware (API key + session cookie dual path), wired into HTTP server, API key generation script. End-to-end verified — unauthenticated rejected, health open, API keys work.
- Session 4 (Tasks 15-20): DNS A record for studio.sherpa.solar via Vercel, Caddy reverse proxy with auto-TLS, fixed Caddyfile MCP routing (method-based), CrowdSec installed with 512MB memory cap + console enrollment, Lynis audit (66/100 hardening index, critical items fixed), UFW audit clean.
- **Production bugs fixed**: `__Secure-` cookie prefix on HTTPS, `useSearchParams` Suspense boundary, project root resolution for auth.db, Better Auth plugin import paths (`@better-auth/api-key` separate package, `nextCookies` in `better-auth/next-js`, `defaultPrefix` not `apiKeyPrefix`).
- **15 commits** across implementation sessions.

## 2026-03-19 — Integrated

- `https://studio.sherpa.solar` live with TLS, auth-gated, CrowdSec monitoring
- Initiative marked integrated, `/integrate` run

## Seeds

- **User management UI** — Currently admin creates accounts via CLI scripts. When team grows past 2-3 people, a Studio admin page for user/key management would reduce friction. Scoped out in shape.md (no-go for this initiative). → candidate for future initiative.
- **MCP API key scoping** — Better Auth's API key plugin supports granular permissions (`Record<ResourceName, Permission[]>`). Currently all keys are flat/full-access. Scoped out to `ledger-governance-rbac`. → initiative: ledger-governance-rbac
- **OAuth providers** — Google/GitHub sign-in. Not needed for internal tool with < 10 users. Revisit if user base grows. Scoped out in shape.md.
- **Session analytics** — Who logged in when, audit trail. Nice-to-have, not a shipping gate. → candidate for `studio-collaboration-platform`.
- **WavePoint auth migration** — WavePoint stays on Supabase. Better Auth is now the Sherpa convention. Migration is a separate decision if/when WavePoint needs it.
- **Email for sherpa.solar** — Currently using personal emails for auth accounts. When sherpa.solar gets email (via Resend or similar), migrate auth accounts to domain emails.
