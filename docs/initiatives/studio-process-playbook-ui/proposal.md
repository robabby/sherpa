---
status: approved
initiative: studio-process-playbook-ui
created: 2026-03-13T00:00:00.000Z
updated: '2026-03-13'
type: new-plan
risk: evolutionary
targets:
  - packages/studio-core/src/lifecycle.ts
  - packages/studio-core/src/process-nodes.ts
  - packages/studio-core/src/prompts.ts
  - packages/studio-ui/src/initiative-overview-section.tsx
  - packages/studio-ui/src/initiative-lifecycle-hero.tsx
  - packages/studio-ui/src/process-action-bar.tsx
  - packages/studio-ui/src/lib/initiative-prompts.ts
  - packages/studio-ui/src/prompt-copy-button.tsx
dependencies:
  - post-research-skill-suite
---

# Studio Process — Playbook-Aware UI

## Summary

Surface the 9 post-research skills (/shape, /stake, /spike, /design, /memo, /radar, /premortem, /stress-test, /retro) in the Studio Process detail pages as context-aware, copy-paste-able commands. Add a Playbook Section to the initiative overview that shows the initiative's playbook (Fast Track / Standard / High Stakes), tracks which plays have been completed, and suggests the next play with a ready-to-copy prompt.

## State Snapshot

The Process detail page currently has:

- **Lifecycle Hero** — 5-step segmented progress bar: Research → Proposal → Plan → Active → Integrated
- **Suggested Action** — single CTA based on lifecycle stage (e.g., "Review Proposal", "Create Plan")
- **Action Bar** — copy buttons for /rr, Copy plan, Synthesize, Sub-initiative, plan-tasks
- **Action Cards** — ProposalActions (Approve/Decline) at `needs-review` stage
- **Lifecycle Detection** — checks status, hasResearch, iterationCount, hasPlan, linkedWorkstreamStatus

After approval, the lifecycle jumps from `needs-review` → `needs-plan`, offering only "Create Plan" as the next action. The entire playbook pipeline (/stake → /shape → /design) is invisible. There are no copy buttons for any of the 6 new skills, no detection of their artifacts, and no way for a human to see which plays have been completed for an initiative.

## Proposed Changes

### 1. studio-core: Artifact detection and playbook logic

**`packages/studio-core/src/lifecycle.ts`** — Expand `detectLifecycle` options:

Add new flags to detect post-research artifacts:
```typescript
interface DetectLifecycleOpts {
  // existing
  status: string;
  hasResearch: boolean;
  iterationCount: number;
  hasPlan: boolean;
  linkedWorkstreamStatus: string | null;
  // new
  hasStake: boolean;
  hasShape: boolean;
  hasDesign: boolean;
  hasSpike: boolean;
  hasPremortem: boolean;
  hasStressTest: boolean;
  hasMemo: boolean;
  hasRadar: boolean;
}
```

Enhance the `needs-plan` stage logic: when an initiative is approved but missing plays from its playbook, the `nextAction` text should reference the next uncompleted play rather than "Create implementation plan."

**New file: `packages/studio-core/src/playbooks.ts`** — Playbook definitions and play tracking:

```typescript
type PlayId = 'rr' | 'stake' | 'premortem' | 'stress-test' | 'spike' | 'shape' | 'design' | 'plan-tasks' | 'memo' | 'radar' | 'retro';

interface PlayStatus {
  id: PlayId;
  label: string;
  skill: string;       // e.g., "/shape"
  completed: boolean;
  artifact?: string;    // e.g., "shape.md" — file path if completed
  suggested: boolean;   // true if this is the next recommended play
}

type PlaybookId = 'fast-track' | 'standard' | 'high-stakes';

interface PlaybookInfo {
  id: PlaybookId;
  label: string;
  plays: PlayStatus[];
  crossCutting: PlayStatus[];  // /memo, /radar, /retro — available anytime
  nextPlay: PlayId | null;
}

function detectPlaybook(risk: string): PlaybookId;
function getPlaybookStatus(playbook: PlaybookId, artifacts: Record<string, boolean>): PlaybookInfo;
```

**`packages/studio-core/src/process-nodes.ts`** — Enrich initiative nodes with artifact flags and playbook status:

In `initiativeToNode()`, scan the initiative directory for shape.md, stake.md, spike.md, design.md, premortem.md, stress-test.md, memo.md, radar.md. Pass these flags to `detectLifecycle` and `getPlaybookStatus`. Attach `metadata.playbook` to the ProcessNode.

**`packages/studio-core/src/prompts.ts`** — Add prompt generators for new skills (server-side equivalents for MCP/API use).

### 2. studio-ui: Prompt builders and copy button variants

**`packages/studio-ui/src/lib/initiative-prompts.ts`** — Add 6 new prompt builders:

- `buildShapePrompt(ctx)` — `/shape <slug>` with initiative path context
- `buildStakePrompt(ctx)` — `/stake <slug>` with research and proposal context
- `buildSpikePrompt(ctx)` — `/spike <slug>` with riskiest assumption context
- `buildDesignPrompt(ctx)` — `/design <slug>` with shape and stake context
- `buildPremortemPrompt(ctx)` — `/premortem <slug>` with proposal/stake context
- `buildStressTestPrompt(ctx)` — `/stress-test <slug>` with assumption context
- `buildMemoPrompt(ctx)` — `/memo <slug>` with cross-initiative context
- `buildRadarPrompt(ctx)` — `/radar <slug>` with research landscape context

Update `getSuggestedPrompt()` to be playbook-aware: after approval, suggest the next uncompleted play in the initiative's playbook, not just "Create Plan."

**`packages/studio-ui/src/prompt-copy-button.tsx`** — Add new variants:

- `shape` — Scissors icon, copper tone
- `stake` — Target icon, gold tone
- `spike` — Zap icon, amber tone
- `design` — Pencil icon, gold-muted tone
- `premortem` — AlertTriangle icon, bronze tone
- `stress-test` — Shield icon, copper tone
- `memo` — FileText icon, eclipse tone
- `radar` — Radar icon, gold-bright tone

### 3. studio-ui: Playbook Section component

**New file: `packages/studio-ui/src/initiative-playbook-section.tsx`**

A new component that renders between the Lifecycle Hero and ProposalActions in the overview tab. Shows:

- **Playbook header** — "Fast Track" / "Standard" / "High Stakes" label with initiative's risk
- **Play sequence** — horizontal pipeline of play nodes, each showing:
  - Play name (e.g., "/shape")
  - Status indicator: completed (checkmark), suggested (pulsing gold), available (dim), not-in-playbook (hidden)
  - Copy button for available/suggested plays
  - Link to artifact for completed plays
- **Cross-cutting plays** — /memo, /radar, /retro shown separately as "available anytime" buttons
- **Responsive** — wraps gracefully on narrow panes

This is the primary UI addition. The play nodes act as both status indicators and action launchers.

### 4. Integration into existing components

**`packages/studio-ui/src/initiative-overview-section.tsx`** — Insert PlaybookSection after InitiativeLifecycleHero, before ProposalActions. Only shows for initiatives with `status !== 'pending'` (playbook becomes relevant after approval, but showing the expected playbook pre-approval is useful for context).

**`packages/studio-ui/src/process-action-bar.tsx`** — Add new skill copy buttons. Contextual: show /shape, /stake, /design when initiative is approved but pre-plan. Show /memo, /radar anytime there's research. Show /spike when approved.

**`packages/studio-ui/src/initiative-lifecycle-hero.tsx`** — No change to the 5-step progress bar (it stays as the macro view). The Playbook Section handles the micro view.

### 5. No lifecycle stage expansion needed

The 5-step visual model (Research → Proposal → Plan → Active → Integrated) remains correct as a macro view. The playbook section provides the detail view of what happens between Proposal and Plan. This avoids breaking the clean visual metaphor while adding the depth needed to surface the new skills.

## Rationale

The 9 post-research skills exist as SKILL.md files but are invisible in the Studio UI. A human looking at an approved initiative sees "Create Plan" as the only next step, with no awareness of /shape, /stake, or /design. The playbook model (Fast Track / Standard / High Stakes) maps directly to the `risk` field already in every proposal's frontmatter, making the default playbook selection zero-configuration.

The Playbook Section is additive — it doesn't change existing lifecycle stages, progress bar visual, or action card patterns. It layers playbook intelligence on top of the existing architecture.

## Dependencies

- `post-research-skill-suite` — the 9 SKILL.md files must exist (Session 1 complete, Session 2 pending)

## Review Notes

- The play sequence visualization could be a simple horizontal list of pill badges initially, evolving to connected nodes later
- Cross-cutting plays (/memo, /radar, /retro) don't belong in the linear sequence — they should be visually distinct
- The prompt builders need the initiative's directory path context to produce useful prompts, same pattern as existing buildRrContinuePrompt
- Consider whether the Playbook Section should be visible on pending initiatives (showing "expected playbook based on risk" is useful context for reviewers)
- InitiativePromptContext may need new fields (hasStake, hasShape, etc.) to support conditional prompt content
