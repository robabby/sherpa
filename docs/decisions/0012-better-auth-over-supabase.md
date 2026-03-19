---
doc-type: decision
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-18
last-verified: 2026-03-18
source-initiatives:
  - studio-production-auth
---

> **AI-generated** 2026-03-18 · Awaiting human review
> Sources: studio-production-auth

# ADR 0012: Better Auth Over Supabase Auth

## Status

Accepted

## Context

Sherpa Studio and the MCP server need authentication for their production deployment on the Hetzner VPS. WavePoint uses Supabase Auth (`@supabase/ssr` v0.8 + `@supabase/supabase-js` v2.95) with email/password, OAuth, and a custom API key layer for its V1 API.

Before porting WavePoint's pattern, we evaluated four candidates against Sherpa's specific requirements: an internal tool with both human users (session-based) and autonomous agents (API key-based), deployed on a VPS with SQLite databases, and destined to become the auth convention for client deployments via `client-deployment-pipeline`.

### Candidates Evaluated

**Supabase Auth** — Proven in WavePoint. Free tier (50K MAU), `@supabase/ssr` for Next.js, RLS integration. But: requires a managed Supabase project (or self-hosted Postgres), no built-in API key management for end users, and each client deployment would need its own Supabase instance.

**Better Auth** — TypeScript-native, MIT-licensed framework. Auth.js (NextAuth) team joined in September 2025, making it the de facto successor to the most popular Next.js auth library. 27K+ GitHub stars, YC X25, $5M seed. First-class API key plugin, SQLite support, fully self-hosted with zero external dependencies.

**Clerk** — Best developer experience with pre-built UI components. But: cloud-only SaaS (no self-hosted option), per-MAU pricing ($0.02/MAU past 10K), high lock-in risk. Cannot be deployed to client infrastructure.

**Auth.js v5** — The original plan. But: the core team left to join Better Auth in September 2025. Auth.js receives security patches only; new projects are directed to Better Auth. No native API key support. Credentials provider DX remains painful.

## Decision

Use **Better Auth** for Sherpa Studio and MCP server authentication. This establishes the auth convention for all Sherpa deployments (framework and client).

## Rationale

| Requirement | Better Auth | Supabase Auth | Why it matters |
|-------------|-------------|---------------|----------------|
| Agent API keys | First-class plugin (scopes, rate limiting, hashing) | Build from scratch | Luna + dispatch workers need programmatic auth |
| SQLite | Native support (better-sqlite3) | Requires Postgres | Studio uses SQLite for coordination DB — no new database |
| Self-hosted | Library, zero external deps | Needs Supabase instance per deployment | Client deployments must be self-contained |
| Cost | Free forever (MIT) | Free tier has limits; self-hosted needs Postgres infra | Client deployments shouldn't carry SaaS bills |
| Session management | Database-backed with cookie transport, optional stateless | Managed by Supabase service | Full control over session lifecycle |
| Next.js 16 | App Router, proxy.ts, server components | App Router via @supabase/ssr | Both work; Better Auth is more direct |
| Community trajectory | Auth.js team joined, 27K stars, YC-backed | Stable but auth is one feature of many | Better Auth is the focused auth project |

### What we lose vs Supabase

- **RLS** — Postgres Row Level Security doesn't apply; Studio uses filesystem + SQLite, not Postgres.
- **Managed dashboard** — Supabase provides a user management UI. We'll build minimal user management into Studio or use Better Auth's optional Infrastructure product if needed.
- **Proven WavePoint pattern** — We diverge from WavePoint's auth stack. WavePoint can migrate later; the patterns (middleware, protected routes, auth hooks) transfer directly.

### What we gain

- **No external service dependency** — auth runs entirely on the VPS alongside Studio and MCP.
- **API keys without custom code** — Better Auth's plugin handles generation, hashing, validation, scoping, and rate limiting.
- **SQLite co-location** — auth tables live in the same database technology as coordination and knowledge stores.
- **Client deployment convention** — every `sherpa init` deployment gets auth that runs on the client's own infrastructure with zero recurring SaaS costs.
- **Stateless option** — for edge/serverless scenarios, Better Auth supports cookie-only sessions with no database. Useful for the desktop app surface.

## Consequences

- WavePoint and Sherpa now use different auth stacks. Auth component code (forms, hooks) won't copy directly — patterns transfer but implementations differ.
- Better Auth is under two years old. Mitigated by: MIT license (forkable), YC backing, Auth.js team merger, active release cadence (multiple per week).
- We need to build auth UI (sign-in form, auth modal). No pre-built components like Clerk. Acceptable for an internal tool with < 10 users.
- The API key plugin becomes the standard way agents authenticate with MCP servers across all Sherpa deployments.

## Evolution

This decision supersedes the implicit assumption in `vps-remote-compute` that WavePoint's Supabase pattern would be ported. Better Auth was not evaluated during that initiative because auth was out of scope.

If Better Auth's trajectory changes (project abandonment, license change), the migration path is to any database-backed session library — the auth tables are standard (user, session, account, verification) and the middleware pattern is framework-standard.
