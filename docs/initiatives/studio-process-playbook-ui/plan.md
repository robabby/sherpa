# Studio Process — Playbook-Aware UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface the 9 post-research skills in Studio's Process pages as context-aware, copy-paste-able commands via a playbook-aware UI section.

**Architecture:** Additive layer on top of existing lifecycle. New `playbooks.ts` module defines play sequences per risk level. `process-nodes.ts` scans initiative directories for play artifacts (shape.md, stake.md, etc.) and attaches playbook status to ProcessNode metadata. New `InitiativePlaybookSection` component renders between the lifecycle hero and action cards, showing play sequence with copy buttons.

**Tech Stack:** TypeScript, React, Next.js 16, shadcn/ui, Tailwind v4, motion/react

---

## Session 1: studio-core — Playbook Logic + Artifact Detection

### Task 1: Create playbooks.ts with types and play sequence definitions

**Files:**
- Create: `packages/studio-core/src/playbooks.ts`
- Modify: `packages/studio-core/src/index.ts`

**Step 1: Create the playbooks module**

Create `packages/studio-core/src/playbooks.ts`:

```typescript
// Playbook definitions and play tracking.
// Pure functions — no I/O, no side effects.

export const PLAY_IDS = [
  "rr", "stake", "premortem", "stress-test", "spike",
  "shape", "design", "plan-tasks",
  // cross-cutting (not in linear sequence)
  "memo", "radar", "retro",
] as const;

export type PlayId = (typeof PLAY_IDS)[number];

export const PLAYBOOK_IDS = ["fast-track", "standard", "high-stakes"] as const;
export type PlaybookId = (typeof PLAYBOOK_IDS)[number];

export interface PlayDef {
  id: PlayId;
  label: string;
  skill: string;
  artifact: string; // filename to check (e.g., "shape.md")
}

export interface PlayStatus extends PlayDef {
  completed: boolean;
  suggested: boolean;
}

export interface PlaybookInfo {
  id: PlaybookId;
  label: string;
  plays: PlayStatus[];
  crossCutting: PlayStatus[];
  nextPlay: PlayId | null;
}

// -- Play definitions (artifact filename each play produces) --

const PLAY_DEFS: Record<PlayId, PlayDef> = {
  "rr":           { id: "rr",           label: "Research",     skill: "/rr",           artifact: "research/" },
  "stake":        { id: "stake",        label: "Stake",        skill: "/stake",        artifact: "stake.md" },
  "premortem":    { id: "premortem",    label: "Pre-mortem",   skill: "/premortem",    artifact: "premortem.md" },
  "stress-test":  { id: "stress-test",  label: "Stress Test",  skill: "/stress-test",  artifact: "stress-test.md" },
  "spike":        { id: "spike",        label: "Spike",        skill: "/spike",        artifact: "spike.md" },
  "shape":        { id: "shape",        label: "Shape",        skill: "/shape",        artifact: "shape.md" },
  "design":       { id: "design",       label: "Design",       skill: "/design",       artifact: "design.md" },
  "plan-tasks":   { id: "plan-tasks",   label: "Plan",         skill: "/plan-tasks",   artifact: "plan.md" },
  "memo":         { id: "memo",         label: "Memo",         skill: "/memo",         artifact: "memo.md" },
  "radar":        { id: "radar",        label: "Radar",        skill: "/radar",        artifact: "radar.md" },
  "retro":        { id: "retro",        label: "Retro",        skill: "/retro",        artifact: "" },
};

// -- Playbook sequences (linear plays, ordered) --

const PLAYBOOK_SEQUENCES: Record<PlaybookId, PlayId[]> = {
  "fast-track":   ["rr", "shape", "plan-tasks"],
  "standard":     ["rr", "stake", "shape", "design", "plan-tasks"],
  "high-stakes":  ["rr", "stake", "premortem", "stress-test", "spike", "shape", "design", "plan-tasks"],
};

const CROSS_CUTTING: PlayId[] = ["memo", "radar", "retro"];

const PLAYBOOK_LABELS: Record<PlaybookId, string> = {
  "fast-track":  "Fast Track",
  "standard":    "Standard",
  "high-stakes": "High Stakes",
};

// -- Public API --

export function detectPlaybook(risk: string | null): PlaybookId {
  switch (risk) {
    case "additive":     return "fast-track";
    case "structural":   return "high-stakes";
    case "evolutionary":
    default:             return "standard";
  }
}

export interface ArtifactFlags {
  hasResearch: boolean;
  hasStake: boolean;
  hasPremortem: boolean;
  hasStressTest: boolean;
  hasSpike: boolean;
  hasShape: boolean;
  hasDesign: boolean;
  hasPlan: boolean;
  hasMemo: boolean;
  hasRadar: boolean;
}

const ARTIFACT_FLAG_MAP: Record<PlayId, keyof ArtifactFlags | null> = {
  "rr":          "hasResearch",
  "stake":       "hasStake",
  "premortem":   "hasPremortem",
  "stress-test": "hasStressTest",
  "spike":       "hasSpike",
  "shape":       "hasShape",
  "design":      "hasDesign",
  "plan-tasks":  "hasPlan",
  "memo":        "hasMemo",
  "radar":       "hasRadar",
  "retro":       null,
};

export function getPlaybookStatus(
  playbookId: PlaybookId,
  artifacts: ArtifactFlags,
): PlaybookInfo {
  const sequence = PLAYBOOK_SEQUENCES[playbookId];

  let nextPlay: PlayId | null = null;
  const plays: PlayStatus[] = sequence.map((id) => {
    const def = PLAY_DEFS[id];
    const flagKey = ARTIFACT_FLAG_MAP[id];
    const completed = flagKey ? artifacts[flagKey] : false;
    const suggested = !completed && nextPlay === null;
    if (suggested) nextPlay = id;
    return { ...def, completed, suggested };
  });

  const crossCutting: PlayStatus[] = CROSS_CUTTING.map((id) => {
    const def = PLAY_DEFS[id];
    const flagKey = ARTIFACT_FLAG_MAP[id];
    const completed = flagKey ? artifacts[flagKey] : false;
    return { ...def, completed, suggested: false };
  });

  return {
    id: playbookId,
    label: PLAYBOOK_LABELS[playbookId],
    plays,
    crossCutting,
    nextPlay,
  };
}
```

**Step 2: Export from index.ts**

Add to `packages/studio-core/src/index.ts` after the `// Pure logic` section:

```typescript
export * from "./playbooks"
```

**Step 3: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS — no type errors in the new module

**Step 4: Commit**

```bash
git add packages/studio-core/src/playbooks.ts packages/studio-core/src/index.ts
git commit -m "feat(studio-core): add playbooks module with play sequence definitions"
```

---

### Task 2: Add artifact detection to process-nodes.ts

**Files:**
- Modify: `packages/studio-core/src/process-nodes.ts:224-270` (lifecycle enrichment block)

**Step 1: Import playbook functions**

At the top of `process-nodes.ts`, add to imports:

```typescript
import { detectPlaybook, getPlaybookStatus, type ArtifactFlags } from "./playbooks"
```

**Step 2: Add artifact scanning in the initiative enrichment loop**

Inside `getProcessNodes()`, after the existing lifecycle enrichment block (around line 269), add artifact detection and playbook enrichment. The key change: scan for the 8 play artifact files using `readProjectFile`, build `ArtifactFlags`, compute playbook status.

Find the block starting at line 250 (`// Enrich with lifecycle data`) and expand it. After `node.metadata.lifecycle = getters.getLifecycleInfo(...)` (line 268), add:

```typescript
    // Enrich with playbook data
    const artifactFlags: ArtifactFlags = {
      hasResearch: !!research && research.iterations.length > 0,
      hasStake: readProjectFile(`${basePath}/stake.md`) !== null,
      hasPremortem: readProjectFile(`${basePath}/premortem.md`) !== null,
      hasStressTest: readProjectFile(`${basePath}/stress-test.md`) !== null,
      hasSpike: readProjectFile(`${basePath}/spike.md`) !== null,
      hasShape: readProjectFile(`${basePath}/shape.md`) !== null,
      hasDesign: readProjectFile(`${basePath}/design.md`) !== null,
      hasPlan,
      hasMemo: readProjectFile(`${basePath}/memo.md`) !== null,
      hasRadar: readProjectFile(`${basePath}/radar.md`) !== null,
    }
    const playbookId = detectPlaybook(init.risk)
    node.metadata.playbook = getPlaybookStatus(playbookId, artifactFlags)
    node.metadata.artifacts = artifactFlags
```

**Step 3: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/studio-core/src/process-nodes.ts
git commit -m "feat(studio-core): detect play artifacts and attach playbook status to initiative nodes"
```

---

### Task 3: Add prompt generators for new skills in studio-core prompts.ts

**Files:**
- Modify: `packages/studio-core/src/prompts.ts`

**Step 1: Add new prompt generator functions**

Append after the existing `generateIntegrationPrompt` function (line 149):

```typescript
/**
 * Generate a /shape prompt for an initiative.
 */
export function generateShapePrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/shape ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Shape the ${node.title} initiative.`,
    `Set appetite, identify rabbit holes, mark no-gos, define kill criteria.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a /stake prompt for an initiative.
 */
export function generateStakePrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/stake ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Stake the ${node.title} initiative.`,
    `Frame options as theses, evaluate, recommend a direction, define kill criteria.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a /spike prompt for an initiative.
 */
export function generateSpikePrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/spike ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Spike the riskiest assumption for ${node.title}.`,
    `One question, one session, build the minimum thing that answers it.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a /design prompt for an initiative.
 */
export function generateDesignPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  const lines = [
    `/design ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Design the ${node.title} initiative.`,
    `Read the shape, design the architecture and UI, produce design.md and prototype.html.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
    `- Shape: ${initPath}/shape.md`,
  ];
  return lines.join("\n");
}

/**
 * Generate a /premortem prompt for an initiative.
 */
export function generatePremortemPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/premortem ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Run a pre-mortem on the ${node.title} initiative.`,
    `Imagine failure, work backward, identify failure modes and mitigations.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a /stress-test prompt for an initiative.
 */
export function generateStressTestPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/stress-test ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Stress-test the assumptions behind ${node.title}.`,
    `Extract assumptions, design falsification tests, execute what's executable.`,
    ``,
    `Context:`,
    `- Proposal: ${node.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

/**
 * Generate a /memo prompt for cross-initiative strategic synthesis.
 */
export function generateMemoPrompt(node: ProcessNode): string {
  return [
    `/memo ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Write a strategic memo for the ${node.title} initiative.`,
    `Frame the strategic question, gather evidence across initiatives, recommend.`,
    ``,
    `Proposal: ${node.source}`,
  ].join("\n");
}

/**
 * Generate a /radar prompt for landscape classification.
 */
export function generateRadarPrompt(node: ProcessNode): string {
  const initPath = node.source.replace(/\/proposal\.md$/, "");
  return [
    `/radar ${node.title.toLowerCase().replace(/\s+/g, "-")}`,
    ``,
    `Build a technology radar for ${node.title}.`,
    `Classify the surveyed landscape into Adopt/Trial/Assess/Hold.`,
    ``,
    `Context:`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}
```

**Step 2: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/studio-core/src/prompts.ts
git commit -m "feat(studio-core): add prompt generators for 8 post-research skills"
```

---

## Session 2: studio-ui — Prompt Builders, Copy Buttons, Playbook Section

### Task 4: Add client-side prompt builders for new skills

**Files:**
- Modify: `packages/studio-ui/src/lib/initiative-prompts.ts`

**Step 1: Add new prompt builder functions**

After `buildPlanTasksPrompt` (line 125), add builders for each new skill:

```typescript
export function buildShapePrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `/shape ${ctx.slug}`,
    ``,
    `Shape the ${ctx.title} initiative.`,
    `Set appetite, identify rabbit holes, mark no-gos, define kill criteria.`,
    ``,
    `Context:`,
    `- Proposal: ${ctx.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

export function buildStakePrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `/stake ${ctx.slug}`,
    ``,
    `Stake the ${ctx.title} initiative.`,
    `Frame options as theses, evaluate, recommend a direction, define kill criteria.`,
    ``,
    `Context:`,
    `- Proposal: ${ctx.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

export function buildSpikePrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `/spike ${ctx.slug}`,
    ``,
    `Spike the riskiest assumption for ${ctx.title}.`,
    `One question, one session, build the minimum thing that answers it.`,
    ``,
    `Context:`,
    `- Proposal: ${ctx.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

export function buildDesignPrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `/design ${ctx.slug}`,
    ``,
    `Design the ${ctx.title} initiative.`,
    `Read the shape, design the architecture and UI, produce design.md and prototype.html.`,
    ``,
    `Context:`,
    `- Proposal: ${ctx.source}`,
    `- Research: ${initPath}/research/`,
    `- Shape: ${initPath}/shape.md`,
  ].join("\n");
}

export function buildPremortemPrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `/premortem ${ctx.slug}`,
    ``,
    `Run a pre-mortem on the ${ctx.title} initiative.`,
    `Imagine failure, work backward, identify failure modes and mitigations.`,
    ``,
    `Context:`,
    `- Proposal: ${ctx.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

export function buildStressTestPrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `/stress-test ${ctx.slug}`,
    ``,
    `Stress-test the assumptions behind ${ctx.title}.`,
    `Extract assumptions, design falsification tests, execute what's executable.`,
    ``,
    `Context:`,
    `- Proposal: ${ctx.source}`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}

export function buildMemoPrompt(ctx: InitiativePromptContext): string {
  return [
    `/memo ${ctx.slug}`,
    ``,
    `Write a strategic memo for the ${ctx.title} initiative.`,
    `Frame the strategic question, gather evidence across initiatives, recommend.`,
    ``,
    `Proposal: ${ctx.source}`,
  ].join("\n");
}

export function buildRadarPrompt(ctx: InitiativePromptContext): string {
  const initPath = ctx.source.replace(/\/proposal\.md$/, "");
  return [
    `/radar ${ctx.slug}`,
    ``,
    `Build a technology radar for ${ctx.title}.`,
    `Classify the surveyed landscape into Adopt/Trial/Assess/Hold.`,
    ``,
    `Context:`,
    `- Research: ${initPath}/research/`,
  ].join("\n");
}
```

**Step 2: Update getSuggestedPrompt to be playbook-aware**

Replace the existing `getSuggestedPrompt` function (line 158-178) with a version that accepts optional playbook data:

```typescript
import type { PlaybookInfo } from "@/lib/studio/playbooks";

export function getSuggestedPrompt(
  ctx: InitiativePromptContext,
  stage: LifecycleStage,
  playbook?: PlaybookInfo | null,
): { prompt: string; label: string } | null {
  // Pre-approval stages: use existing logic
  switch (stage) {
    case "needs-research":
      return { prompt: buildRrContinuePrompt(ctx), label: "Launch Research" };
    case "needs-proposal":
      return { prompt: buildRrContinuePrompt(ctx), label: "Continue Research" };
    case "needs-review":
      return { prompt: buildReviewPrompt(ctx), label: "Review Proposal" };
    case "ready-to-integrate":
      return { prompt: buildIntegrationPrompt(ctx), label: "Integrate" };
  }

  // Post-approval: use playbook to determine next play
  if (playbook?.nextPlay && (stage === "needs-plan" || stage === "ready-to-start")) {
    const PLAY_PROMPT_MAP: Record<string, () => { prompt: string; label: string }> = {
      "rr":          () => ({ prompt: buildRrContinuePrompt(ctx), label: "Continue Research" }),
      "stake":       () => ({ prompt: buildStakePrompt(ctx), label: "Run /stake" }),
      "premortem":   () => ({ prompt: buildPremortemPrompt(ctx), label: "Run /premortem" }),
      "stress-test": () => ({ prompt: buildStressTestPrompt(ctx), label: "Run /stress-test" }),
      "spike":       () => ({ prompt: buildSpikePrompt(ctx), label: "Run /spike" }),
      "shape":       () => ({ prompt: buildShapePrompt(ctx), label: "Run /shape" }),
      "design":      () => ({ prompt: buildDesignPrompt(ctx), label: "Run /design" }),
      "plan-tasks":  () => ({ prompt: buildPlanTasksPrompt(ctx), label: "Plan Tasks" }),
    };
    const builder = PLAY_PROMPT_MAP[playbook.nextPlay];
    if (builder) return builder();
  }

  // Fallback for post-approval without playbook
  switch (stage) {
    case "needs-plan":
      return { prompt: buildPlanningPrompt(ctx), label: "Create Plan" };
    case "ready-to-start":
      return { prompt: buildStartPrompt(ctx), label: "Start Implementation" };
    default:
      return null;
  }
}
```

**Step 3: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/studio-ui/src/lib/initiative-prompts.ts
git commit -m "feat(studio-ui): add prompt builders for 8 post-research skills and playbook-aware suggestions"
```

---

### Task 5: Add new PromptCopyButton variants

**Files:**
- Modify: `packages/studio-ui/src/prompt-copy-button.tsx`

**Step 1: Add new icon imports**

Update the import line (line 4) to add the new icons:

```typescript
import { Check, Terminal, FileText, FlaskConical, ListChecks, Users, Workflow, Sunrise, ListTodo, ClipboardCheck, Scissors, Target, Zap, PenTool, AlertTriangle, Shield, Radar } from "lucide-react";
```

**Step 2: Add new variant entries to VARIANT_CONFIG**

Add after the `"integration-review"` entry (inside the VARIANT_CONFIG object, before the `} as const`):

```typescript
  shape: { icon: Scissors, label: "/shape", className: "text-[var(--color-copper)]/70 hover:text-[var(--color-copper)]" },
  stake: { icon: Target, label: "/stake", className: "text-[var(--color-gold)]/70 hover:text-[var(--color-gold)]" },
  spike: { icon: Zap, label: "/spike", className: "text-[var(--color-gold-bright)]/70 hover:text-[var(--color-gold-bright)]" },
  design: { icon: PenTool, label: "/design", className: "text-[var(--color-gold-muted)]/70 hover:text-[var(--color-gold-muted)]" },
  premortem: { icon: AlertTriangle, label: "/premortem", className: "text-[var(--color-bronze)]/70 hover:text-[var(--color-bronze)]" },
  "stress-test": { icon: Shield, label: "/stress-test", className: "text-[var(--color-copper)]/70 hover:text-[var(--color-copper)]" },
  memo: { icon: FileText, label: "/memo", className: "text-[var(--color-eclipse)]/70 hover:text-[var(--color-eclipse)]" },
  radar: { icon: Radar, label: "/radar", className: "text-[var(--color-gold-bright)]/70 hover:text-[var(--color-gold-bright)]" },
```

**Step 3: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/studio-ui/src/prompt-copy-button.tsx
git commit -m "feat(studio-ui): add prompt copy button variants for 8 post-research skills"
```

---

### Task 6: Create InitiativePlaybookSection component

**Files:**
- Create: `packages/studio-ui/src/initiative-playbook-section.tsx`

**Step 1: Create the playbook section component**

This is the primary new UI piece. It renders a glass-card showing the playbook's play sequence as pill badges with status indicators and copy buttons.

Create `packages/studio-ui/src/initiative-playbook-section.tsx`:

```tsx
"use client";

import { Check, ChevronRight } from "lucide-react";
import type { PlaybookInfo, PlayStatus } from "@/lib/studio/playbooks";
import { cn } from "./lib/utils";
import type { InitiativePromptContext } from "./lib/initiative-prompts";
import {
  buildShapePrompt,
  buildStakePrompt,
  buildSpikePrompt,
  buildDesignPrompt,
  buildPremortemPrompt,
  buildStressTestPrompt,
  buildMemoPrompt,
  buildRadarPrompt,
  buildRrContinuePrompt,
  buildPlanTasksPrompt,
} from "./lib/initiative-prompts";
import { PromptCopyButton } from "./prompt-copy-button";

// ---------------------------------------------------------------------------
// Play → prompt mapping
// ---------------------------------------------------------------------------

type PromptVariant = "rr" | "stake" | "shape" | "design" | "spike" | "premortem" | "stress-test" | "plan-tasks" | "memo" | "radar";

function getPlayPrompt(
  play: PlayStatus,
  ctx: InitiativePromptContext,
): { prompt: string; variant: PromptVariant } | null {
  const map: Record<string, () => { prompt: string; variant: PromptVariant }> = {
    "rr":          () => ({ prompt: buildRrContinuePrompt(ctx), variant: "rr" }),
    "stake":       () => ({ prompt: buildStakePrompt(ctx), variant: "stake" }),
    "premortem":   () => ({ prompt: buildPremortemPrompt(ctx), variant: "premortem" }),
    "stress-test": () => ({ prompt: buildStressTestPrompt(ctx), variant: "stress-test" }),
    "spike":       () => ({ prompt: buildSpikePrompt(ctx), variant: "spike" }),
    "shape":       () => ({ prompt: buildShapePrompt(ctx), variant: "shape" }),
    "design":      () => ({ prompt: buildDesignPrompt(ctx), variant: "design" }),
    "plan-tasks":  () => ({ prompt: buildPlanTasksPrompt(ctx), variant: "plan-tasks" }),
    "memo":        () => ({ prompt: buildMemoPrompt(ctx), variant: "memo" }),
    "radar":       () => ({ prompt: buildRadarPrompt(ctx), variant: "radar" }),
  };
  const builder = map[play.id];
  return builder ? builder() : null;
}

// ---------------------------------------------------------------------------
// Play node (individual pill in the sequence)
// ---------------------------------------------------------------------------

function PlayNode({
  play,
  ctx,
  showConnector,
}: {
  play: PlayStatus;
  ctx: InitiativePromptContext;
  showConnector: boolean;
}) {
  const promptData = getPlayPrompt(play, ctx);

  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
          play.completed && "border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
          play.suggested && !play.completed && "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5 text-[var(--color-gold)] animate-[cta-glow_3s_ease-in-out_infinite]",
          !play.completed && !play.suggested && "border-border/20 bg-transparent text-muted-foreground/40",
        )}
      >
        {play.completed && <Check className="h-3 w-3" />}
        <span>{play.label}</span>
        {!play.completed && promptData && (
          <PromptCopyButton
            prompt={promptData.prompt}
            variant={promptData.variant}
            label=""
          />
        )}
      </div>
      {showConnector && (
        <ChevronRight className="h-3 w-3 text-muted-foreground/20 shrink-0" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface InitiativePlaybookSectionProps {
  playbook: PlaybookInfo;
  promptContext: InitiativePromptContext;
}

export function InitiativePlaybookSection({
  playbook,
  promptContext,
}: InitiativePlaybookSectionProps) {
  const completedCount = playbook.plays.filter((p) => p.completed).length;

  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
            Playbook
          </span>
          <span className="rounded-full border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 px-2 py-0.5 text-[10px] font-medium text-[var(--color-gold)]">
            {playbook.label}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/40">
          {completedCount}/{playbook.plays.length} plays
        </span>
      </div>

      {/* Play sequence */}
      <div className="flex flex-wrap items-center gap-1">
        {playbook.plays.map((play, i) => (
          <PlayNode
            key={play.id}
            play={play}
            ctx={promptContext}
            showConnector={i < playbook.plays.length - 1}
          />
        ))}
      </div>

      {/* Cross-cutting plays */}
      {playbook.crossCutting.length > 0 && (
        <div className="flex items-center gap-2 border-t border-border/10 pt-2">
          <span className="text-[10px] text-muted-foreground/30 shrink-0">
            Available anytime
          </span>
          <div className="flex flex-wrap gap-1">
            {playbook.crossCutting.map((play) => {
              const promptData = getPlayPrompt(play, promptContext);
              if (!promptData) return null;
              return (
                <PromptCopyButton
                  key={play.id}
                  prompt={promptData.prompt}
                  variant={promptData.variant as keyof typeof import("./prompt-copy-button").PromptCopyButton extends (props: { variant: infer V }) => unknown ? V : never}
                  label={play.label}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

**NOTE:** The cross-cutting play variant type cast is intentionally loose — the `PromptCopyButton` variant type will accept any key from VARIANT_CONFIG. If this causes type issues, cast `promptData.variant as any` — the runtime values are correct.

**Step 2: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS (may need minor type adjustments based on exact variant type)

**Step 3: Commit**

```bash
git add packages/studio-ui/src/initiative-playbook-section.tsx
git commit -m "feat(studio-ui): add InitiativePlaybookSection component with play sequence visualization"
```

---

### Task 7: Wire PlaybookSection into the overview tab

**Files:**
- Modify: `packages/studio-ui/src/initiative-overview-section.tsx`

**Step 1: Add imports**

Add at top with other imports:

```typescript
import type { PlaybookInfo } from "@/lib/studio/playbooks";
import { InitiativePlaybookSection } from "./initiative-playbook-section";
```

**Step 2: Insert PlaybookSection after lifecycle hero**

In the `OverviewTab` component, after `<InitiativeLifecycleHero ... />` (line 78) and before the `ProposalActions` conditional (line 80), add:

```tsx
          {meta.playbook && (
            <InitiativePlaybookSection
              playbook={meta.playbook as PlaybookInfo}
              promptContext={promptContextFromNode(node)}
            />
          )}
```

**Step 3: Update getSuggestedPrompt calls to pass playbook**

In this same file, the `InitiativeLifecycleHero` receives `promptContext` and `lifecycle` — but the hero's internal `getSuggestedPrompt` call needs playbook data. The hero component must also accept an optional `playbook` prop.

Modify the `<InitiativeLifecycleHero>` JSX to also pass playbook:

```tsx
          <InitiativeLifecycleHero
            lifecycle={lifecycle}
            promptContext={promptContextFromNode(node)}
            playbook={(meta.playbook as PlaybookInfo) ?? null}
          />
```

Then update `packages/studio-ui/src/initiative-lifecycle-hero.tsx`:
- Add `playbook?: PlaybookInfo | null` to `InitiativeLifecycleHeroProps`
- Pass it to `getSuggestedPrompt(promptContext, lifecycle.stage, playbook)`

**Step 4: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/studio-ui/src/initiative-overview-section.tsx packages/studio-ui/src/initiative-lifecycle-hero.tsx
git commit -m "feat(studio-ui): wire PlaybookSection into initiative overview and pass playbook to lifecycle hero"
```

---

## Session 3: Action Bar + Integration + Verify

### Task 8: Add skill copy buttons to the action bar

**Files:**
- Modify: `packages/studio-ui/src/process-action-bar.tsx`

**Step 1: Import new prompt builders**

Add to the imports from `./lib/initiative-prompts`:

```typescript
import {
  // existing
  promptContextFromNode,
  seedContextFromNode,
  getSuggestedPrompt,
  buildRrContinuePrompt,
  buildPlanningPrompt,
  buildSynthesizePrompt,
  buildSubInitiativePrompt,
  buildRrLaunchPrompt,
  // new
  buildShapePrompt,
  buildStakePrompt,
  buildSpikePrompt,
  buildDesignPrompt,
  buildPremortemPrompt,
  buildStressTestPrompt,
  buildMemoPrompt,
  buildRadarPrompt,
} from "./lib/initiative-prompts";
```

Also import PlaybookInfo:

```typescript
import type { PlaybookInfo } from "@/lib/studio/playbooks";
```

**Step 2: Update the suggested prompt call to pass playbook**

In the `ActionBar` component (around line 135-137), update the `getSuggestedPrompt` call:

```typescript
  const playbook = node.kind === "initiative"
    ? (node.metadata.playbook as PlaybookInfo | undefined) ?? null
    : null;
  const suggested = node.kind === "initiative" && lifecycle
    ? getSuggestedPrompt(promptContextFromNode(node), lifecycle.stage, playbook)
    : null;
```

**Step 3: Add new skill copy buttons**

After the existing initiative copy buttons block (after the `buildSubInitiativePrompt` button, around line 225), add the new skill buttons. These show contextually based on initiative status:

```tsx
          {/* Post-research skill copy buttons */}
          {(node.status === "approved" || node.status === "in-progress") && (
            <>
              <PromptCopyButton
                prompt={buildStakePrompt(ctx)}
                variant="stake"
              />
              <PromptCopyButton
                prompt={buildShapePrompt(ctx)}
                variant="shape"
              />
              <PromptCopyButton
                prompt={buildDesignPrompt(ctx)}
                variant="design"
              />
              <PromptCopyButton
                prompt={buildSpikePrompt(ctx)}
                variant="spike"
              />
              <PromptCopyButton
                prompt={buildPremortemPrompt(ctx)}
                variant="premortem"
              />
              <PromptCopyButton
                prompt={buildStressTestPrompt(ctx)}
                variant="stress-test"
              />
            </>
          )}
          {hasResearch && (
            <>
              <PromptCopyButton
                prompt={buildRadarPrompt(ctx)}
                variant="radar"
              />
              <PromptCopyButton
                prompt={buildMemoPrompt(ctx)}
                variant="memo"
              />
            </>
          )}
```

**Step 4: Run typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/studio-ui/src/process-action-bar.tsx
git commit -m "feat(studio-ui): add post-research skill copy buttons to process action bar"
```

---

### Task 9: Build and verify

**Files:** None (verification only)

**Step 1: Full typecheck**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS across all packages

**Step 2: Full build**

Run: `cd /Users/rob/Workbench/sherpa && pnpm build`
Expected: Build succeeds

**Step 3: Manual verification**

Run: `cd /Users/rob/Workbench/sherpa && pnpm dev`

Verify in browser at `localhost:3000/process`:
1. Select a **pending** initiative → should see lifecycle hero, no playbook section yet (or expected playbook preview)
2. Select an **approved/in-progress** initiative → should see:
   - Lifecycle hero with playbook-aware suggested action
   - Playbook Section showing play sequence with correct completions
   - Copy buttons for uncompleted plays
   - Cross-cutting plays (/memo, /radar) as "available anytime"
3. Action bar should show new skill copy buttons for approved initiatives
4. Click each copy button → verify clipboard contains correct prompt text
5. Check that existing functionality (Approve/Decline, Archive, Copy /rr) still works

**Step 4: Fix any issues found during verification**

Address any type errors, rendering issues, or missing imports.

**Step 5: Commit**

```bash
git add -A
git commit -m "fix(studio-ui): address verification findings"
```

---

### Task 10: Update initiative-action-bar.tsx (detail page)

**Files:**
- Modify: `packages/studio-ui/src/initiative-action-bar.tsx`

**Step 1: Read the current file**

Read `packages/studio-ui/src/initiative-action-bar.tsx` to understand its structure (simpler version of the action bar used on `/process/[slug]` detail page).

**Step 2: Add matching skill buttons**

Mirror the same new skill copy buttons from Task 8, adapted to this component's simpler interface. Add post-research skill buttons contextually based on initiative status.

**Step 3: Run typecheck and commit**

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`

```bash
git add packages/studio-ui/src/initiative-action-bar.tsx
git commit -m "feat(studio-ui): add post-research skill buttons to initiative detail action bar"
```
