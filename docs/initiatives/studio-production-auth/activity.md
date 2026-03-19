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
- Session 1 complete. Next: Session 2 — Implementation begins (Tasks 1-10)
