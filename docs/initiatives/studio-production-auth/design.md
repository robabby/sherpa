---
designed: 2026-03-18
type: both
components-new: 5
components-modified: 2
files-planned: 18
---

# Studio Production Auth — Design

Shape: `shape.md` · Appetite: 4 sessions (1 spent) · [ADR 0012](../../decisions/0012-better-auth-over-supabase.md)

## Overview

Add Better Auth to Studio (Next.js) and the MCP server (plain Node.js HTTP). Two processes, one shared `auth.db`, two auth instances. Studio handles user sessions + the admin-facing auth API. MCP server validates API keys and forwarded session cookies. UI is minimal: a sign-in page and a user menu in the sidebar footer.

## Architecture

### Data Model

Better Auth manages its own schema via Kysely migrations. Default tables (all in `.sherpa/auth.db`):

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    user       │  │   session    │  │   account    │  │ verification │  │   apikey     │
├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤
│ id       text│  │ id       text│  │ id       text│  │ id       text│  │ id       text│
│ name     text│  │ userId   text│  │ userId   text│  │ identifier   │  │ name     text│
│ email    text│  │ token    text│  │ providerId   │  │ value    text│  │ start    text│
│ emailVer bool│  │ expiresAt    │  │ providerAcct │  │ expiresAt    │  │ prefix   text│
│ image    text│  │ ipAddress    │  │ password text│  │ createdAt    │  │ key      text│
│ createdAt    │  │ userAgent    │  │ createdAt    │  │ updatedAt    │  │ userId   text│
│ updatedAt    │  │ createdAt    │  │ updatedAt    │  └──────────────┘  │ refillAmt int│
└──────────────┘  │ updatedAt    │  └──────────────┘                    │ lastRefill   │
                  └──────────────┘                                      │ enabled  bool│
                                                                        │ rateLimitMax │
                                                                        │ rateLimitWin │
                                                                        │ remaining int│
                                                                        │ metadata text│
                                                                        │ createdAt    │
                                                                        │ updatedAt    │
                                                                        │ expiresAt    │
                                                                        │ permissions  │
                                                                        └──────────────┘
```

**We use all defaults.** No table renames, no custom fields. (Shape rabbit hole #3.)

### Auth Instance Architecture

Two separate Better Auth instances share one database file:

```
┌─────────────────────────────┐    ┌──────────────────────────────┐
│  Studio (Next.js, port 3000)│    │  MCP Server (Node, port 3100)│
│                             │    │                              │
│  auth = betterAuth({        │    │  auth = betterAuth({         │
│    database: auth.db,       │    │    database: auth.db,        │
│    emailAndPassword: true,  │    │    emailAndPassword: true,   │
│    plugins: [               │    │    plugins: [                │
│      apiKey(),              │    │      apiKey(),               │
│      nextCookies(),         │    │    ]                         │
│    ]                        │    │  })                          │
│  })                         │    │                              │
│                             │    │  // Uses:                    │
│  // Handles:                │    │  // auth.api.verifyApiKey()  │
│  // Sign-in/out routes      │    │  // auth.api.getSession()   │
│  // Session management      │    │  //   via fromNodeHeaders()  │
│  // API key CRUD            │    │                              │
│  // User management API     │    │                              │
└──────────┬──────────────────┘    └──────────────┬───────────────┘
           │                                       │
           └───────────┐     ┌─────────────────────┘
                       ▼     ▼
                 ┌─────────────────┐
                 │  .sherpa/auth.db │
                 │  (WAL mode)     │
                 └─────────────────┘
```

**Why two instances, not a shared module?**
- Studio needs `nextCookies()` plugin (Next.js-specific). MCP server can't use it.
- They're separate processes — can't share an in-memory instance anyway.
- Better Auth + SQLite WAL handles concurrent access (confirmed in stress test A3).

**Why not in studio-core?**
- Better Auth is a heavy dependency. Studio-core is domain logic — keeping it auth-free lets it stay lightweight.
- Each consumer has different plugin needs (nextCookies vs fromNodeHeaders).
- Auth config is short (~15 lines). Duplication is acceptable and avoids coupling.

### Data Flow

**Human sign-in (Studio):**
```
Browser                    Studio (Next.js)              auth.db
  │                            │                            │
  │ POST /api/auth/sign-in     │                            │
  │ {email, password}          │                            │
  │───────────────────────────>│                            │
  │                            │ auth.handler(req, res)     │
  │                            │ → verify credentials       │
  │                            │───────────────────────────>│
  │                            │ ← user + session           │
  │                            │<───────────────────────────│
  │ Set-Cookie: session_token  │                            │
  │<───────────────────────────│                            │
  │                            │                            │
  │ GET /tasks (any route)     │                            │
  │ Cookie: session_token      │                            │
  │───────────────────────────>│                            │
  │                            │ middleware: cookie exists?  │
  │                            │ layout: auth.api.getSession│
  │                            │───────────────────────────>│
  │                            │ ← session + user           │
  │                            │<───────────────────────────│
  │ 200 + page HTML            │                            │
  │<───────────────────────────│                            │
```

**Agent API key (MCP server):**
```
Luna/Agent                 MCP Server (Node)             auth.db
  │                            │                            │
  │ POST /mcp                  │                            │
  │ x-api-key: sk_xxx          │                            │
  │───────────────────────────>│                            │
  │                            │ authMiddleware(req)        │
  │                            │ → auth.api.verifyApiKey()  │
  │                            │───────────────────────────>│
  │                            │ ← {valid: true, key: ...}  │
  │                            │<───────────────────────────│
  │                            │ proceed to MCP handler     │
  │ 200 + MCP response         │                            │
  │<───────────────────────────│                            │
```

**Studio → MCP (server-side, forwarded session):**
```
Browser                    Studio (Next.js)              MCP Server
  │ action: dispatch task      │                            │
  │ Cookie: session_token      │                            │
  │───────────────────────────>│                            │
  │                            │ fetch("http://localhost:3100/mcp", {
  │                            │   headers: {               │
  │                            │     cookie: req.cookies    │
  │                            │   }                        │
  │                            │ })                         │
  │                            │───────────────────────────>│
  │                            │   authMiddleware:          │
  │                            │   no x-api-key → check cookie
  │                            │   auth.api.getSession({   │
  │                            │     headers: fromNodeHeaders(req.headers)
  │                            │   })                      │
  │                            │   → valid session         │
  │                            │   proceed to MCP handler  │
  │                            │<───────────────────────────│
  │ 200                        │                            │
  │<───────────────────────────│                            │
```

### Integration Points

**Existing code modified:**

| File | Change | Why |
|------|--------|-----|
| `apps/studio/src/app/layout.tsx` | Add auth session fetch + provider wrapper | Seed client auth state, prevent loading flash |
| `packages/studio-mcp/src/http-server.ts` | Add auth middleware before session routing | Gate all MCP endpoints (except /health) |
| `packages/studio-ui/src/studio-sidebar.tsx` | Add user menu slot in SidebarFooter | Display signed-in user + sign-out action |
| `packages/studio-core/src/db/connection.ts` | Add `auth` to DB_FILES and resolveDbPaths | New .sherpa/auth.db path resolution |
| `packages/studio-core/src/db/types.ts` | Add `auth: string` to ResolvedDbPaths | Type safety for auth db path |

**Existing code NOT modified:**
- `studio-shell-header.tsx` — User menu goes in sidebar footer, not header. Header stays as breadcrumbs only.
- API routes (`/api/studio/sessions`, `/api/dispatch/*`) — Protected by middleware, no per-route changes needed.
- Server actions (`workforce/actions.ts`, `docs/actions.ts`) — Protected by middleware. No auth checks inside actions (middleware already validated).

### Component Tree

```
RootLayout
├── auth.api.getSession() ← server-side session fetch
├── AuthProvider (client context, seeded from server)
│   ├── TooltipProvider
│   │   ├── CommandPalette
│   │   └── SidebarProvider
│   │       ├── StudioSidebar
│   │       │   ├── SidebarHeader (logo, unchanged)
│   │       │   ├── SidebarContent (nav groups, unchanged)
│   │       │   └── SidebarFooter
│   │       │       ├── UserMenu ← NEW (avatar, email, sign-out dropdown)
│   │       │       └── SidebarTrigger (collapse, unchanged)
│   │       └── SidebarInset
│   │           ├── StudioShellHeader (unchanged)
│   │           └── main > {children}
│   └── ...

/auth/sign-in (outside main layout — no sidebar)
├── SignInPage
│   └── SignInForm ← NEW (email + password + submit)
```

**Auth layout separation:** The sign-in page uses its own layout (no sidebar, no header). Only the sign-in form centered on screen.

## UI Design

### Sign-In Page

Full-page, centered card. Dark theme matching Studio.

- **Logo:** Sherpa wordmark (Fraunces font) + Zap icon, matching sidebar header
- **Card:** shadcn Card component, max-width ~400px
- **Form fields:** Email (Input) + Password (Input type="password")
- **Submit:** Button (default variant), full-width
- **Error state:** Inline error message below form (red text, not a toast)
- **No links:** No "sign up", no "forgot password", no OAuth buttons. Just email + password + sign in.
- **Loading state:** Button shows spinner on submit, inputs disabled

### User Menu (Sidebar Footer)

Located in `SidebarFooter`, above the collapse trigger.

- **Collapsed state:** User avatar (initials circle, 32px)
- **Expanded state:** Avatar + user email + chevron-down icon
- **Dropdown menu** (shadcn DropdownMenu): "Sign out" action only
- **Avatar:** First letter of email, dark background, light text. No image upload (no-go).

### Interaction Patterns

- **Middleware redirect:** Unauthenticated requests → `/auth/sign-in`. After sign-in → redirect to originally requested URL (via `callbackUrl` query param, or default to `/`).
- **Sign-out:** Client-side `authClient.signOut()` → redirect to `/auth/sign-in`. No confirmation dialog.
- **Session expiry:** If session expires mid-use, next server-side render redirects to sign-in. No client-side polling or refresh. Better Auth handles cookie refresh via `updateAge` config (extends session on activity).

## File Plan

### Session 2: Auth Infrastructure + UI

**New files (10):**

```
apps/studio/src/lib/auth.ts                      # Better Auth server instance
apps/studio/src/lib/auth-client.ts                # Browser auth client (createAuthClient)
apps/studio/src/middleware.ts                     # Route protection
apps/studio/src/env.ts                            # Environment validation
apps/studio/src/app/api/auth/[...all]/route.ts    # Better Auth route handler
apps/studio/src/app/auth/sign-in/page.tsx         # Sign-in page
apps/studio/src/app/auth/layout.tsx               # Auth layout (no sidebar)
apps/studio/src/components/auth/sign-in-form.tsx   # Sign-in form component
apps/studio/src/components/auth/user-menu.tsx      # Sidebar footer user menu
scripts/seed-auth-user.ts                         # Admin user creation script
```

**Modified files (4):**

```
apps/studio/src/app/layout.tsx                    # Add auth provider wrapping
packages/studio-ui/src/studio-sidebar.tsx          # Add UserMenu slot in footer
packages/studio-core/src/db/connection.ts          # Add auth to DB_FILES
packages/studio-core/src/db/types.ts               # Add auth to ResolvedDbPaths
```

### Session 3: MCP Server Auth

**New files (2):**

```
packages/studio-mcp/src/auth/middleware.ts         # HTTP auth middleware factory
packages/studio-mcp/src/auth/index.ts              # Barrel exports
```

**Modified files (2):**

```
packages/studio-mcp/src/http-server.ts             # Wire auth middleware
packages/studio-mcp/src/index.ts                   # Re-export auth module
```

### Session 4: Domain + Security (VPS config, not codebase files)

```
Vercel DNS: A record studio.sherpa.solar → <VPS_IP>
VPS /etc/caddy/Caddyfile                           # Reverse proxy config
VPS CrowdSec install + default scenarios
VPS Lynis scan + remediation
VPS UFW audit
docs/templates/server-provision.md                  # Update with hardening steps
```

**Total: 12 new files, 6 modified files = 18 file operations**

## Decisions

### Auth instance per process (not shared module)

Each process (Studio, MCP) creates its own `betterAuth()` instance. Shared config factory was considered but rejected: Next.js needs `nextCookies()`, MCP doesn't. The config is 15 lines — duplication is cheaper than abstraction. Both point at the same `.sherpa/auth.db`.

### Separate auth.db (not coordination.db)

Better Auth manages its own Kysely connection and runs its own migrations. Layering it on `coordination.db` (which uses our pool + manual schema application) creates two connection managers on one file and risks pragma conflicts. Separate file, clean boundary. (Confirmed in stress test A1.)

### User menu in sidebar footer (not header)

The shadcn sidebar component pattern places user info in the footer. The header has breadcrumbs and a sidebar trigger — adding a user menu there would crowd it. The sidebar footer currently only has a collapse toggle, leaving room for user info above it.

### Auth layout separation (sign-in page has no sidebar)

The sign-in page should not render the Studio chrome (sidebar, header, command palette). It gets its own `apps/studio/src/app/auth/layout.tsx` that renders only the centered form. This prevents flash of authenticated UI before redirect.

### No auth provider in studio-core

Better Auth stays as a dependency of `apps/studio` and `packages/studio-mcp` only. `studio-core` stays auth-free — it only gains the `auth.db` path in `resolveDbPaths`. This keeps the core package lightweight and avoids pulling in Better Auth's dependency tree (including Zod 4) into every consumer.

## Open Questions

1. **Better Auth secret management on VPS.** The `BETTER_AUTH_SECRET` env var needs to be set in both the Studio systemd service and the MCP systemd service. Should it be in a shared `.env` file or per-service? Leaning: shared `.env.production` in the project root, loaded by both services.

2. **Session cookie name and domain.** Better Auth defaults to `better-auth.session_token`. With Caddy proxying `studio.sherpa.solar`, the cookie domain should be `studio.sherpa.solar`. The Tailscale URL would be a different domain — cookies won't transfer. Users sign in per-domain.

3. **API key prefix convention.** Better Auth allows custom prefixes for API keys. Suggest `sk_sherpa_` to distinguish from other services. Aligns with WavePoint's `wp_live_` pattern.
