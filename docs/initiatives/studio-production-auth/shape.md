---
appetite: 4 sessions
shaped: 2026-03-18
---

# Studio Production Auth — Shape

## Appetite

**4 sessions max** (1 spent on research, 3 remaining).

This is an internal tool with < 10 users and a well-documented auth library. The value is high (production security, public URL, agent auth), but the complexity is bounded: one Next.js app, one HTTP server, one VPS, one domain. Better Auth's docs are thorough and our WavePoint reference provides proven patterns for every layer (middleware, dual auth, cached session fetching).

If this takes more than 4 sessions, we're over-engineering for the user count.

## Evidence & Success

**Customer evidence:** Builder judgment. Rob is the sole user today; Luna is the sole agent. The VPS runs production services (Studio, MCP, OpenClaw) with zero authentication — any HTTP client can access all tools and data. The Tailscale mesh provides network-level isolation, but exposing Studio at a public URL (`studio.sherpa.solar`) requires app-level auth. Additionally, this establishes the auth convention that `client-deployment-pipeline` will replicate for every client deployment.

**Success metrics:**
1. Unauthenticated requests to `studio.sherpa.solar` redirect to sign-in page (zero exposed routes beyond `/api/auth/*`)
2. Luna can authenticate to the MCP server via API key and execute tasks
3. VPS passes a Lynis security scan with no critical findings

**Personas served:** `engineer` — Rob configuring and operating the system; future client engineers inheriting the pattern.

## Shaped Solution

Three layers, built bottom-up:

### Layer 1: Auth Infrastructure (Session 2)

Better Auth server instance in `apps/studio/src/lib/auth/` configured with:
- SQLite at `.sherpa/auth.db` (follows existing `resolveDbPaths` pattern, new file in the pool)
- Email/password credentials (the only auth method)
- API key plugin (enabled, default config)
- `nextCookies()` plugin for server actions

Catch-all route handler at `/api/auth/[...all]`. Middleware at `src/middleware.ts` doing optimistic cookie check — if no session cookie, redirect to `/auth/sign-in`. Sign-in page with a single shadcn/ui form (email + password + submit). Layout wraps with session provider.

Admin creates the first user account via a seed script or Better Auth's admin API call — not through the UI.

**Done when:** Rob can sign in at the Tailscale URL, see Studio, sign out, and get redirected to sign-in.

### Layer 2: MCP Auth (Session 3)

Auth middleware in `packages/studio-mcp/src/http-server.ts` that runs before session routing:
- Check `x-api-key` header → validate against Better Auth's API key table
- Else check session cookie → validate against Better Auth's session table
- Else → 401
- Exception: `/health` endpoint is unauthenticated

The MCP server opens the same `.sherpa/auth.db` that Studio writes to. One database, two readers.

Generate Luna's API key via the admin API or a setup script. Store the key in Luna's environment on the VPS (alongside `OPENCLAW_GATEWAY_TOKEN`).

**Done when:** MCP rejects unauthenticated requests and Luna can authenticate via API key.

### Layer 3: Public URL + Hardening (Session 4)

- Add DNS A record for `studio.sherpa.solar` → `5.78.128.178` in Vercel's domain settings
- Install Caddy on VPS, configure reverse proxy: `studio.sherpa.solar` → `localhost:3000`, with a `/mcp` route to `localhost:3100`
- Update Better Auth base URL to `https://studio.sherpa.solar`
- Install CrowdSec with default scenarios
- Run Lynis baseline scan, address critical findings
- UFW audit: close stale rules, verify OpenClaw gateway is Tailscale-only

**Done when:** `https://studio.sherpa.solar` shows the sign-in page with a valid TLS certificate, and Lynis shows no critical findings.

## Rabbit Holes

1. **Better Auth plugin sprawl.** The plugin ecosystem is rich — organizations, SSO, SAML, passkeys, anonymous auth, two-factor. None of these are needed for an internal tool with < 10 users. **Avoidance:** Only enable `emailAndPassword`, `apiKey`, and `nextCookies` plugins. Everything else is a no-go for this initiative.

2. **User management UI.** Tempting to build an admin panel for creating users, managing API keys, viewing sessions. **Avoidance:** Use Better Auth's admin API or a CLI seed script. Studio gets a user menu (session info + sign out) and nothing more. Full user management is a separate initiative if ever needed.

3. **Auth database schema customization.** Better Auth allows renaming tables and columns. **Avoidance:** Use all defaults. Custom schema creates maintenance burden on every Better Auth upgrade.

4. **MCP API key scoping.** The API key plugin supports granular permissions (`Record<ResourceName, Permission[]>`). Designing a permission model for MCP tools is real work. **Avoidance:** All API keys are flat — full access. Scoping deferred to `ledger-governance-rbac`.

5. **Caddy advanced features.** Rate limiting, WAF rules, caching headers, compression. **Avoidance:** Minimal Caddyfile — reverse proxy + automatic HTTPS. Add complexity only if a specific problem emerges.

6. **CrowdSec scenario tuning.** CrowdSec has dozens of detection scenarios and can integrate with Caddy via a bouncer plugin. **Avoidance:** Install with default scenarios, verify it's collecting data, move on. Tuning is operational, not a shipping gate.

7. **Tailscale auth bypass.** Debating whether `.ts.net` URLs should skip auth. **Avoidance:** Decision is already made — always require auth, even on Tailscale. Defense in depth. Don't build conditional auth paths.

## No-Gos

- **No OAuth providers** — no Google, GitHub, or Apple sign-in. Email/password only. Revisit if the user base exceeds the team.
- **No self-registration or sign-up flow** — admin creates all accounts. No public-facing registration endpoint.
- **No MFA** — internal tool, < 10 users, already behind Tailscale for network access. Not worth the UX cost now.
- **No user management UI in Studio** — admin API and seed scripts only.
- **No API key scoping or RBAC** — flat keys with full access. Scoping is `ledger-governance-rbac`'s job.
- **No auth for sherpa.solar** — the marketing site has no auth. Only `studio.sherpa.solar` is protected.
- **No WavePoint migration** — WavePoint stays on Supabase. This initiative establishes a new convention; migration is a separate decision.
- **No session analytics or audit logging** — who logged in when. Nice to have, not a shipping gate.

## Kill Criteria

1. **If Better Auth + SQLite doesn't produce a working sign-in flow within Session 2**, stop and evaluate. Possible causes: SQLite adapter bugs, Next.js 16 incompatibility, missing documentation. Fallback: evaluate `better-auth-ui` community package or raw session cookies with `better-sqlite3` directly.

2. **If Better Auth's API key plugin doesn't validate keys from the MCP server's HTTP context** (i.e., the plugin assumes a Next.js request object and can't work from raw `http.IncomingMessage`), build a simpler custom token system: generate random tokens, SHA256 hash, store in auth.db, validate with a direct SQL query. The plugin is a convenience, not a hard dependency.

3. **If Caddy can't obtain a Let's Encrypt certificate** (DNS propagation delay, ACME challenge blocked by UFW, Hetzner IP reputation issues), defer the public URL and ship auth on the Tailscale URL only. Domain setup becomes Session 5 work or a follow-on.

4. **If the Lynis scan reveals a critical VPS vulnerability that requires infrastructure changes beyond UFW/CrowdSec** (e.g., kernel-level issues, Docker daemon misconfiguration requiring re-provisioning), document the finding and file it as a seed for `client-deployment-pipeline`. Don't let security hardening block auth shipping.
