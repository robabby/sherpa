---
designed: 2026-06-17
type: both
components-new: 4
components-modified: 11
files-planned: 24
---

# Design: Studio Governance Refocus — Three Build Surfaces

> Scope: this design covers only the three surfaces that need architecture — **git-aware drift**, **Sessions repoint**, and **nav + Roles IA**. The dispatch excision, identity reframe, and portfolio triage are mechanical and governed by `shape.md`; they appear here only where the file plan intersects them. See `proposal.md`, `shape.md`, and `decisions/`.

## Overview

The refocused Studio is a governance engine whose value depends on the **observe** layer being real. This design makes three things true: (1) maintained docs visibly drift when their source code moves (the `stale` state finally fires); (2) Sessions reflects actual Claude Code work; (3) the nav reorganizes into GOVERN / AUTHOR / OBSERVE with role definitions preserved as read-only conventions. All three respect the locked **pane-of-glass** model: the only write is mark-verified, which already exists.

---

## Architecture

### Surface 1 — Git-aware drift

**Today (grounded):** `computeState(provenance)` (`studio-core/doc-tree-types.ts:142`) branches only on `maintainedBy` + `reviewedBy` and **never returns `"stale"`** — the state is dead. `parseProvenance` already extracts `sourceInitiatives`. `velocity.ts:86` shows the safe git pattern (`execSync('git log …', {cwd, timeout:5000, encoding})`, catch→null). `listInitiatives()` already exposes `targets: string[]` per initiative.

**Data model** — new type in `studio-core/types.ts`:

```typescript
export interface DocDrift {
  relatedPaths: string[]      // union of targets across the doc's sourceInitiatives
  commitsSinceVerified: number
  isStale: boolean            // commitsSinceVerified > 0
}
```

**New module** `studio-core/src/doc-drift.ts` (fat-marker signatures):

```typescript
// Build once per request: slug → its proposal's targets[]
export function buildInitiativeTargetIndex(ctx): Map<string, string[]>

// Resolve a doc's drift; null when not applicable (no provenance / no lastVerified / human-owned)
export function computeDocDrift(
  provenance: Provenance,
  targetIndex: Map<string, string[]>,
  ctx,
): DocDrift | null
```

`computeDocDrift` resolves `provenance.sourceInitiatives → targetIndex → relatedPaths`, then runs **one** `git log --format=%h --since="<lastVerified>" -- <relatedPaths…>` (reusing the velocity pattern, `cwd: ctx.root`, timeout, catch→null) and counts lines. Git is invoked **only** for docs that have both `sourceInitiatives` and `lastVerified` (~14 docs) — every other doc skips git entirely.

**`computeState` gains an optional drift argument** (backward compatible):

```typescript
export function computeState(provenance: Provenance, drift?: DocDrift | null): ProvenanceState
// new rule: if the doc is maintained (not human-owned) AND drift?.isStale → "stale"
// otherwise unchanged
```

**Integration:** `readDocNode` / `getDocTree` (`studio-core/doc-tree.ts`) gain an optional `{ targetIndex }` — when present, compute drift per node and pass it to `computeState`. `DocTreeNode` carries an optional `drift?: DocDrift` so the UI can render the commit count. The duplicate `computeProvenanceState` in `docs-workspace.tsx:56` is **deleted** and replaced by the core `computeState` (it currently diverges and is a latent bug — see Decisions).

### Surface 2 — Sessions repoint

**Today (grounded):** `api/studio/sessions/route.ts` calls `getSessions()` (`domain.ts:1030`). The `Session` type (`types.ts:455`) is rich (sessionId, startedAt/endedAt, durationMinutes, model, branch, initiative, role, tokens{input,output,cacheRead,cacheCreation}, filesModified, toolsUsed, commits, outcome, summary). Real logs live at `~/.claude/projects/<encoded-cwd>/*.jsonl` (one file per session).

**The Session type does not change.** A new defensive adapter owns all JSONL + host-path coupling:

`studio-core/src/claude-code-sessions.ts`:

```typescript
// Host path isolated here. root defaults to homedir; project encoded from ctx.root ("/a/b" → "-a-b")
export function readClaudeCodeSessions(opts?: { homeDir?: string; projectRoot?: string }): Session[]
```

**Field mapping** (best-effort; the boundary owns degradation):

| Session field | Source in JSONL | Fallback |
|---|---|---|
| sessionId | `sessionId` | filename stem |
| startedAt / endedAt | first / last record `timestamp` | — |
| durationMinutes | computed | null |
| model | first assistant `message.model` | `"unknown"` |
| branch | `gitBranch` | `""` |
| tokens | sum `message.usage.*` across records | zeros |
| toolsUsed | distinct `tool_use` `.name` | `[]` |
| filesModified | paths from Edit/Write tool inputs *(best-effort)* | `[]` |
| commits | `git commit` Bash calls *(best-effort)* | `[]` |
| initiative / role / summary | **not in logs** | `null` |
| outcome | inferred (recent last-record → `in-progress`, else `completed`) | `completed` |

**Defensive rules:** line-by-line `JSON.parse` in try/catch (skip malformed lines); tolerate missing fields; if the directory is absent, return `[]` (never throw). `getSessions()` in `domain.ts` repoints to this adapter; the API route, the Sessions page, `hub-sessions-panel`, and `initiative-sessions-section` are unchanged because the shape is preserved. `filesModified`/`commits` extraction is explicitly **degradable** — ship with empty arrays if parsing the tool records proves fragile (see Kill Criterion 3 in the shape).

### Surface 3 — Nav + Roles IA

**Today (grounded):** the nav is a hardcoded `NAV_GROUPS: NavGroup[]` in `studio-sidebar.tsx` (4 groups). A **separate** `sectionLabels` map in `studio-shell-header.tsx` drives breadcrumbs (must be updated in lockstep). `command-palette-items.ts` has `STATIC_ROUTES` with a `group` field. `catalog.ts` lists Hub panel variants. Roles are parsed by `getAgentRoles()` (`domain.ts:416`) merging base catalog (`agents/`) + org roles (`docs/agents/roles/`); the `AgentRole` type (`types.ts:59`) mixes convention fields and dispatch fields. The current `workforce/page.tsx` couples to dispatch via `getTaskBoard()`.

**Nav reorg** — three groups, four entries removed, Roles added:

| Group | Items |
|---|---|
| **GOVERN** | Process |
| **AUTHOR** | Conventions, Skills, Playbooks, Roles, Docs, Research |
| **OBSERVE** | Sessions, Activity, MCP |

**Roles view** — a thin read-only listing. New `/roles` route (mirrors the simple `conventions/`/`skills/` route shape) calling `getAgentRoles()` **only** (no `getTaskBoard()` — that severs the dispatch coupling). New `roles-content.tsx` forks `workforce-content.tsx` minus the task/health summary widgets. **Dispatch fields dropped from display:** `modelTier`, `taskType`, `eligibleTaskTypes`, `source`, and any task/health counts. **Convention fields kept:** displayName, category, description, disposition, domainScope, behavioralConstraints, qualityBar, vibe, tags, patterns, structure, contextPackages, rules, skills, escalation.

### Integration Points

- **Drift → existing banner.** `provenance-header.tsx` already renders the `stale` state; it gains an optional commit-count line ("N commits to related code since verified") fed by `DocDrift`. No new component.
- **Drift → Process spine (minimal).** `process/page.tsx` already loads initiatives + `getInitiativeVelocity`. Surface provenance/drift as a **lightweight indicator** in the Process detail pane for the selected node's maintained docs, reusing the existing stale-dot styling (`hub-process-panel.tsx` already has stale dots). No IA redesign (no-go).
- **Sessions adapter → domain.** Single swap inside `getSessions()`; all consumers insulated.
- **Hub landing** (`app/(studio)/page.tsx`) drops the `HubTasks/Dispatch/Workflow/Workforce` panel imports (part of excision).

---

## UI Design

A disposable `prototype.html` accompanies this design, validating the two genuinely-new visual decisions:

1. **The refocused sidebar** — GOVERN / AUTHOR / OBSERVE, to confirm the grouping reads cleanly and AUTHOR (6 items) isn't overloaded.
2. **Provenance as the spine** — how a "Possibly stale · N commits since verified" doc looks both in the Docs banner (exists) and as the new indicator in the Process detail pane.

The Roles view is *not* prototyped — it's a visual subset of the existing Workforce cards (drop widgets), so it needs no validation.

---

## File Plan

### Surface 1 — Drift
- **CREATE** `packages/studio-core/src/doc-drift.ts` — `DocDrift`, `buildInitiativeTargetIndex`, `computeDocDrift`
- **MODIFY** `packages/studio-core/src/types.ts` — add `DocDrift`
- **MODIFY** `packages/studio-core/src/doc-tree-types.ts` — `computeState(provenance, drift?)`; `DocTreeNode.drift?`
- **MODIFY** `packages/studio-core/src/doc-tree.ts` — thread optional `targetIndex` through `readDocNode`/`getDocTree`
- **MODIFY** `packages/studio-core/src/index.ts` — export `doc-drift`
- **MODIFY** `packages/studio-ui/src/docs-workspace.tsx` — delete duplicate `computeProvenanceState`, import core, accept/render drift
- **MODIFY** `packages/studio-ui/src/provenance-header.tsx` — optional commit-count line
- **MODIFY** `apps/studio/src/app/(studio)/docs/page.tsx` — build target index, pass to `getDocTree`
- **MODIFY** `apps/studio/src/app/(studio)/process/page.tsx` + `packages/studio-ui/src/process-detail-pane.tsx` — minimal drift indicator

### Surface 2 — Sessions
- **CREATE** `packages/studio-core/src/claude-code-sessions.ts` — defensive JSONL adapter
- **MODIFY** `packages/studio-core/src/domain.ts` — `getSessions()` repoints to adapter
- **MODIFY** `packages/studio-core/src/index.ts` — export adapter
- *(unchanged: API route, Sessions page, hub-sessions-panel, initiative-sessions-section, Session type)*

### Surface 3 — Nav + Roles
- **CREATE** `apps/studio/src/app/(studio)/roles/page.tsx` + `layout.tsx` (+ optional `[slug]/page.tsx`)
- **CREATE** `packages/studio-ui/src/roles-content.tsx` (fork of workforce-content minus dispatch widgets)
- **MODIFY** `packages/studio-ui/src/studio-sidebar.tsx` — `NAV_GROUPS` → 3 groups
- **MODIFY** `packages/studio-ui/src/studio-shell-header.tsx` — `sectionLabels` (add roles; remove tasks/dispatch/workflow/workforce)
- **MODIFY** `apps/studio/src/app/(studio)/actions/command-palette-items.ts` — `STATIC_ROUTES` regroup + Roles entry
- **MODIFY** `packages/studio-ui/src/catalog.ts` — drop tasks/dispatch/workflow variants & Hub*Panel entries

### Cross-ref — excision (mechanical, per proposal/shape; not designed here)
- **DELETE** `apps/studio/src/app/(studio)/{tasks,dispatch,workflow,workforce}/`
- **DELETE** `packages/studio-ui/src/{hub-tasks-panel,hub-dispatch-panel,hub-workflow-panel,dispatch-content,workforce-content}.tsx` (workforce-content's card logic migrates into roles-content first)
- **MODIFY** `apps/studio/src/app/(studio)/page.tsx` — remove dispatch hub panels
- *(studio-core dispatch/tasks/linear files + scripts + sherpa.config.ts dispatch section — see proposal)*

---

## Decisions

1. **Drift reuses the existing `stale` state — no new ProvenanceState.** The exploration suggested a `"stale-by-drift"` state; rejected — `stale` is already typed, styled, and rendered (just never triggered). Drift simply makes it reachable. (Decision record: `decisions/drift-reuses-stale-state.md`.)
2. **Consolidate to one `computeState`.** Delete the divergent `computeProvenanceState` in `docs-workspace.tsx` (it treats ai-reviewed as human-owned, contradicting core). Single source of truth in studio-core.
3. **Target index built once per request, drift computed on-demand.** Avoids re-reading proposals per doc and bounds git calls to provenance-stamped docs only. Consistent with the `drift-source-mapping` decision (on-demand, not pre-computed).
4. **Sessions field mapping is degradable.** `filesModified`/`commits`/`outcome` are best-effort; shipping them empty is acceptable and explicitly allowed by the shape's Kill Criterion 3. The Session *type* is preserved so no consumer breaks.
5. **Roles is a new `/roles` route, not a renamed Workforce.** Forking `workforce-content` (dropping `getTaskBoard` + widgets) cleanly severs the dispatch coupling rather than carrying dead props.

---

## Open Questions

1. **Process "spine" depth.** This design specifies a *minimal* drift indicator in the Process detail pane (respecting the no-IA-redesign no-go). If, in build, that feels too subtle to qualify as "the spine," we surface a portfolio-level "N docs possibly stale" summary — but nothing deeper without reshaping.
2. **`filesModified`/`commits` from tool records.** Whether to parse Edit/Write/Bash tool_use entries now or defer to empty. Recommend defer; revisit once the basic adapter is proven against several real logs.
3. **Project-dir encoding.** Confirm the `/→-` cwd-encoding scheme matches Claude Code across versions; isolate it in one function so a format change is a one-line fix.
4. **Roles `[slug]` detail page.** Optional — ship the listing first; add detail only if the read-only role view warrants it.
