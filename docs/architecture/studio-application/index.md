---
doc-type: architecture
maintained-by: self-documenting-system
authored-by: ai
reviewed-by: null
last-updated: 2026-03-19
last-verified: 2026-03-19
source-initiatives:
  - studio-ux-patterns
  - studio-agent-missions
  - agent-narrative-streaming
  - studio-production-auth
---

> **AI-updated** 2026-03-19 · Awaiting human review
> Sources: studio-ux-patterns, studio-agent-missions, agent-narrative-streaming, studio-production-auth

# Studio Application

Next.js 16 application that visualizes agentic workflows. Four-package architecture: studio-core (domain logic), studio-ui (110+ React components), studio-mcp (MCP server), and studio (umbrella with Next.js integration). Production deployment at `https://studio.sherpa.solar` on Hetzner VPS, auth-gated via Better Auth (ADR 0012). Runs against Sherpa's own governance data with co-located MCP server and coordination databases.

## Package Architecture

| Package | Responsibility | Key Exports |
|---------|---------------|-------------|
| `@sherpa/studio-core` | Domain logic, types, schemas, database | `getInitiatives()`, `getTaskBoard()`, `detectLifecycle()`, `defineConfig()` |
| `@sherpa/studio-ui` | 110+ React components, 2 hooks | `ProcessWorkspace`, `MissionWorkspace`, `StatusBadge`, `EmptyState` |
| `@sherpa/studio-mcp` | MCP server (SQLite WAL backend) | 8 MCP tools, session management, HTTP transport |
| `@sherpa/studio` | Umbrella — re-exports core + UI | `withSherpa()`, `defineConfig()` |

Data flow: routes call studio-core functions → studio-core reads filesystem → components receive resolved data as props → client components stream real-time events via SSE.

## Authentication

Better Auth (ADR 0012) provides dual-identity authentication:

- **Humans** — email/password sign-in, session cookies. Middleware at `src/middleware.ts` redirects unauthenticated requests to `/auth/sign-in`. Layout at `(studio)/layout.tsx` validates sessions server-side.
- **Agents** — API keys (`sk_sherpa_` prefix) for MCP server access. Keys validated via `@better-auth/api-key` plugin in `packages/studio-mcp/src/auth/middleware.ts`.

Route group separation: `(studio)/` contains all authenticated routes with sidebar chrome. `auth/` contains the sign-in page with its own centered layout (no sidebar). Auth database at `.sherpa/auth.db` (SQLite WAL, shared between Studio and MCP server processes).

User menu in sidebar footer shows avatar + email + sign-out. No self-registration — admin creates accounts via `scripts/seed-auth-user.ts`.

## Deployment

**Production:** Hetzner VPS at `https://studio.sherpa.solar`. Caddy reverse proxy handles TLS (Let's Encrypt). Systemd services for Studio (port 3000) and MCP (port 3100). DNS managed in Vercel (A record → VPS IP). Not deployed to Vercel — Studio needs filesystem access and co-location with MCP/coordination databases.

**Local dev:** `pnpm dev` on localhost:3000. Auth env vars in root `.env.local`.

## Route Structure

14 top-level sections in `apps/studio/src/app/(studio)/`:

| Route | Purpose | Layout Pattern |
|-------|---------|---------------|
| `/` | Hub dashboard | Grid panels (operational pulse, tasks, activity, workforce) |
| `/process` | Initiative governance | Two-pane workspace (list + detail with tabs) |
| `/tasks` | Agent missions | Two-pane workspace (mission list + detail with events) |
| `/dispatch` | Task creation/dispatch | Three-panel (backlog, assignments, workforce) |
| `/workflow` | Process diagram | Mermaid visualization |
| `/activity` | Portfolio timeline | Chronological grouped by date |
| `/conventions` | Rules, CLAUDE.md, UX guides | List + detail |
| `/skills` | Skill catalog | List + detail |
| `/playbooks` | Orchestrated workflows | List + detail |
| `/workforce` | Agent roles | List + detail |
| `/sessions` | Token/cost tracking | Metrics tables |
| `/mcp` | MCP server dashboard | Tool list, health |
| `/docs` | Documentation | Tree nav + markdown renderer |
| `/research/[slug]` | Research reports | Server-rendered report data |

## Component Patterns

### Workspace Pattern

The primary layout for data-heavy sections. Two-pane: scrollable list on left, detail with tabs on right, separated by a draggable `ResizeHandle`.

- `ProcessWorkspace` — initiatives list + detail (Overview, Content, Activity, Research tabs)
- `MissionWorkspace` — task list + detail (Summary, Logs, Events tabs)

Both use full-viewport edge-to-edge layout (no container padding).

### Hub Panels

Dashboard sections that provide at-a-glance status:

`HubOperationalPulse`, `HubProcessPanel`, `HubTasksPanel`, `HubActivityPanel`, `HubWorkforcePanel`, `HubSessionsPanel`, `HubMcpPanel`, `HubConventionsPanel`, `HubSkillsPanel`, `HubPlaybooksPanel`, `HubDispatchPanel`

### Cross-Cutting UX Patterns (from studio-ux-patterns)

| Pattern | Component/Hook | Behavior |
|---------|---------------|----------|
| Command palette | `CommandPalette` | Cmd+K global search across all entities |
| Skeleton loading | `loading.tsx` per route | Show-delay pattern — skeleton only appears after threshold |
| Empty states | `EmptyState` compound | Actionable guidance with icon, title, description, command |
| Tab status | `usePageStatus` | Favicon + title updates reflecting build/success/error state |
| URL filters | Search params | Filter state persisted in URL across all list pages |

### Key Components

| Component | Purpose |
|-----------|---------|
| `StatusBadge` | Polymorphic status indicator (LED mode for compact views) |
| `LifecyclePipeline` | Visual stage progression (pending → integrated) |
| `MissionCard` | Task card with agent metrics (tokens, cost, duration) |
| `ActivityTimeline` | Chronological activity grouped by date |
| `ProcessGraph` | Mermaid-based dependency/composition visualization |
| `UnifiedInitiativeCard` | Initiative + workstreams + seeds compound |

## Shell Structure

Two-level layout with route group separation:

**Root layout** (`apps/studio/src/app/layout.tsx`): HTML shell, fonts (Fraunces, DM Sans, JetBrains Mono), `TooltipProvider`. Shared by all routes including auth pages.

**Studio layout** (`apps/studio/src/app/(studio)/layout.tsx`): Server-side session validation via Better Auth. Component hierarchy: `CommandPalette` → `SidebarProvider` → `StudioSidebar` (with `UserMenu` slot) + `SidebarInset` → `StudioShellHeader` → `main`.

**Auth layout** (`apps/studio/src/app/auth/layout.tsx`): Centered card layout with Sherpa logo. No sidebar, no header. Used only for `/auth/sign-in`.

## Hooks

| Hook | Package | Purpose |
|------|---------|---------|
| `usePageStatus` | studio-ui | Convert task/process status to page state |
| `useMissionEvents` | studio-ui | SSE streaming + fallback to static events |
| `usePersistedState` | app | Browser localStorage sync |
| `useMobile` | app | Responsive breakpoint detection |
| `useReducedMotion` | app | Accessibility preference |

## Tech Stack

- **Framework:** Next.js 16.1.1, React 19.2.3
- **Styling:** Tailwind v4, shadcn/ui
- **UI primitives:** Radix UI (accordion, dialog, dropdown, popover, select, tabs, tooltip)
- **Visualization:** Recharts, Mermaid, D3 modules
- **Animation:** Motion (formerly Framer Motion)
- **Auth:** Better Auth v1.5 with `@better-auth/api-key` plugin
- **Database:** better-sqlite3 with Drizzle ORM (coordination, knowledge, events, auth schemas)
- **Reverse proxy:** Caddy (production TLS)
- **Search:** Fuse.js (client-side), SQLite FTS5 (server-side)

## Current State

**Implemented:** 14 route sections, 110+ components, workspace pattern, hub dashboard, command palette, skeleton loading, empty states, tab status, URL filters, mission control, SSE event streaming.

**In progress:** studio-state-machine (governance view models), studio-dashboard-sidenav (layout), design-system (component library formalization), studio-process-playbook-ui (process visualization).

## Related

- [Execution Pipeline](../execution-pipeline/index.md) — Studio visualizes dispatch, missions, and events
- [Governance Engine](../governance-engine/index.md) — Studio renders initiative lifecycle and proposals
- [Config-as-Code](../config-as-code/index.md) — `withSherpa()` wraps Next.js config

## Decisions

- [0005 — Mission control over table board](../../decisions/0005-mission-control-over-table-board.md)
- [0006 — SSE streaming for agent events](../../decisions/0006-sse-streaming-for-agent-events.md)
- [0012 — Better Auth over Supabase Auth](../../decisions/0012-better-auth-over-supabase.md)
