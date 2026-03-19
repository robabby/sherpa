# Auth Solution Evaluation — Studio Production Auth

Research conducted 2026-03-18 for initiative `studio-production-auth`.

## Evaluation Criteria

Sherpa Studio is an internal tool deployed on a Hetzner VPS with two client types:
- **Humans** — session-based auth (Rob, future team members)
- **Agents** — API key auth (Luna/OpenClaw, dispatch workers)

Additional constraints: SQLite databases (no Postgres), must work as convention for client deployments (self-hosted, zero SaaS), Next.js 16 App Router.

## Candidates

### Supabase Auth (WavePoint's current choice)

- **Versions:** `@supabase/supabase-js` v2.99.2, `@supabase/ssr` v0.9.0
- **Free tier:** 50K MAU, unlimited API calls
- **Strengths:** Proven in WavePoint, RLS integration, managed dashboard, MFA on free tier
- **Weaknesses for Sherpa:**
  - No built-in API key management for end users — must build custom
  - Requires Postgres (managed or self-hosted) — Studio uses SQLite
  - Each client deployment needs its own Supabase instance or self-hosted stack
  - Self-hosted auth (GoTrue) has operational rough edges
- **New (Nov 2025):** OAuth 2.1 server beta — Supabase can act as identity provider
- **Verdict:** Strong for consumer apps with Postgres. Overkill dependency for an internal tool on SQLite.

### Better Auth (selected)

- **Version:** v1.5.5 (March 2026)
- **License:** MIT, free forever
- **GitHub:** 27,276 stars, YC X25, $5M seed
- **Key event:** Auth.js team joined September 2025
- **Strengths:**
  - TypeScript-native, framework-agnostic
  - First-class API key plugin (scopes, rate limiting, hashing, session-equivalent context)
  - SQLite support via better-sqlite3
  - Fully self-hosted, zero external dependencies
  - Database-backed sessions with cookie transport (also supports stateless)
  - Plugin ecosystem: organizations, SSO, SAML, anonymous auth, passkeys
- **Weaknesses:**
  - Under 2 years old (mitigated by funding, team, velocity)
  - No pre-built UI in core (better-auth-ui community package exists)
  - No admin dashboard in OSS (optional Infrastructure product)
  - 613 open issues (active development, not neglect)
- **Verdict:** Best fit for Sherpa's requirements. Zero-dependency, SQLite-native, first-class agent auth.

### Clerk

- **Pricing:** 10K MAU free, $0.02/MAU after, $25/mo base on Pro
- **Strengths:** Best DX, pre-built React components, machine auth (API keys beta Dec 2025), SOC 2
- **Dealbreakers:**
  - Cloud-only SaaS — cannot self-host
  - High lock-in — no data export, no migration path
  - Per-MAU pricing scales badly for client deployments
- **Verdict:** Excellent product, wrong model. Can't deploy to client infrastructure.

### Auth.js v5

- **State:** Beta, but core team left for Better Auth (Sep 2025)
- **Strengths:** Mature patterns, large adapter ecosystem, JWT + database sessions
- **Dealbreakers:**
  - Maintenance trajectory — security patches only, no new features
  - No API key support
  - Credentials provider DX is poor
  - Official recommendation is to migrate to Better Auth
- **Verdict:** Dead end for new projects.

## Decision Matrix

| Requirement | Weight | Supabase | Better Auth | Clerk | Auth.js |
|-------------|--------|----------|-------------|-------|---------|
| API keys for agents | Critical | Build custom | Native plugin | Beta | None |
| SQLite support | Critical | No | Yes | N/A | Yes |
| Self-hosted | Critical | Rough | Native | No | Yes |
| Zero SaaS dependency | High | No | Yes | No | Yes |
| Next.js 16 | High | Yes | Yes | Yes | Yes |
| Free | High | Tier limits | Forever | Per-MAU | Forever |
| Community trajectory | Medium | Stable | Rising fast | Stable | Declining |
| Pre-built UI | Low | No | Community | Yes | No |
| Managed dashboard | Low | Yes | Optional paid | Yes | No |

## Conclusion

Better Auth selected. ADR 0012 documents the decision.
