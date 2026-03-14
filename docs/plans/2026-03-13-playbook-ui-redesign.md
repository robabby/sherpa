# Playbook UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the 3 playbook UI surfaces to match the approved prototype — vertical rail cards for /playbooks, horizontal stepper for process detail, micro-rails for hub panel.

**Architecture:** UI-only rewrite of 3 existing files. No data layer changes. The prototype at `docs/initiatives/studio-process-playbook-ui/prototype.html` is the source of truth for the visual design.

**Tech Stack:** React, Next.js 16, Tailwind v4, motion/react, lucide-react, shadcn/ui patterns

---

### Task 1: Redesign /playbooks page with vertical rail cards

**Files:**
- Modify: `apps/studio/src/app/playbooks/page.tsx` (full rewrite of components, keep data loading)

**Step 1: Rewrite PlayRow to use rail node visual pattern**

The current `PlayRow` uses a plain dot + text. Replace with the prototype's rail node pattern:
- 22px circle nodes with three visual states:
  - **Completed:** gold background/border with checkmark SVG
  - **Suggested (current):** pulsing ring with inner dot, shows description + copy button
  - **Future:** dim border, tiny inner dot, muted text
- Vertical connector `::before` pseudo-element on each node (CSS class `rail-node`)
- Descriptions only shown on the suggested play, not every play

Since this page is a server component with no interactivity (just links), the play states shown are **static reference** (showing what each play's suggested state looks like), not driven by real initiative state. Keep the existing structure but restyle.

**Step 2: Rewrite PlaybookCard with accent bars and initiative chips**

- Add left accent bar with varying opacity: `border-l-2 border-[var(--color-gold)]/30` for fast-track, `/50` for standard, `/80` for high-stakes
- Header: Fraunces heading + risk badge pill + session range + play count
- Description paragraph below header
- Initiative section: replace `<ul>` list with flex-wrap chip layout. Each chip shows initiative title + a mono step-indicator badge. Show 3 chips + "+N more" overflow.

**Step 3: Rewrite CrossCuttingSection as compact inline bar**

Replace the 3-column grid with a single-line flex row: "AVAILABLE ANYTIME · Memo /memo | Radar /radar | Retro /retro"

**Step 4: Update page header**

Change `SectionHeader` title from "3 Playbooks" to just "Playbooks". Add subtitle paragraph below: "Three tracks for moving from research to implementation. The initiative's risk level determines the default playbook."

**Step 5: Run typecheck and verify**

Run: `pnpm check`
Expected: PASS

Run: `pnpm dev` and check `localhost:3000/playbooks`
Expected: Matches the prototype's Surface 1

**Step 6: Commit**

```bash
git add apps/studio/src/app/playbooks/page.tsx
git commit -m "feat: redesign /playbooks page with vertical rail cards and initiative chips"
```

---

### Task 2: Redesign PlaybookSection with horizontal stepper

**Files:**
- Modify: `packages/studio-ui/src/initiative-playbook-section.tsx` (full rewrite)

**Step 1: Replace pill strip with horizontal stepper**

Remove the `PlayPill` component and chevron connectors. Replace with:

- **Header row:** "PLAYBOOK" label + playbook name badge + "N/N complete" counter (keep existing)
- **Stepper track:** A 2px horizontal line (`bg-[var(--glass-border)]`) with an overlaid gold fill div whose width is `(completedCount / totalCount) * 100%`
- **Stepper nodes:** Positioned along the track using `flex justify-between`:
  - Completed: `w-3 h-3 rounded-full bg-[var(--color-gold)]`
  - Suggested: `w-4 h-4 rounded-full border-2 border-[var(--color-gold)] bg-[var(--glass-bg)]` with inner 1.5px gold dot, pulsing animation
  - Future: `w-3 h-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)]`
- **Labels below nodes:** mono text-[9px], gold for current, muted for others. Use short labels: "rr", "stake", "shape", "design", "plan"

**Step 2: Single suggested action CTA**

Below the stepper, render one CTA card (only when `playbook.nextPlay` exists):
- Border card with gold accent: `border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5`
- Left: "Run /shape" label + actor badge ("Agent" or "You")
- Right: PromptCopyButton with the suggested play's variant and prompt

Remove individual copy buttons from stepper nodes.

**Step 3: Compress cross-cutting plays**

Replace the bulleted list with an inline text row: `anytime · /memo · /radar` — just small mono text links, no descriptions.

**Step 4: Keep prompt builder maps**

Keep `PLAY_PROMPT_BUILDERS` and `PLAY_VARIANT_MAP` — they're still needed for the CTA and cross-cutting copy buttons.

**Step 5: Run typecheck and verify**

Run: `pnpm check`
Expected: PASS

Check an approved initiative in the Process detail pane at `localhost:3000/process`
Expected: Matches prototype Surface 2

**Step 6: Commit**

```bash
git add packages/studio-ui/src/initiative-playbook-section.tsx
git commit -m "feat: redesign PlaybookSection with horizontal stepper and single CTA"
```

---

### Task 3: Redesign hub panel with micro-rails

**Files:**
- Modify: `packages/studio-ui/src/hub-playbooks-panel.tsx` (full rewrite of content)

**Step 1: Replace stat rows with micro-rail visualization**

Each playbook row becomes: name (w-24) + micro-rail dots + initiative count.

The micro-rail is a `flex items-center gap-[3px]` with:
- One 5px dot per play in the sequence (3 for fast-track, 5 for standard, 8 for high-stakes)
- Dots connected by 8px × 1px line segments
- All dots use `bg-[var(--color-gold)]/20` (static — not driven by real state)
- Connecting lines use `bg-[var(--glass-border)]`

The micro-rails communicate track length visually — Fast Track is short, High Stakes is long.

**Step 2: Update panel title**

Change title from "Playbooks" to "Process Playbooks".

**Step 3: Update props**

The `PlaybookSummary` interface already has `playCount` — use it to generate the correct number of dots. No new props needed.

**Step 4: Run typecheck and verify**

Run: `pnpm check`
Expected: PASS

Check `localhost:3000` home page
Expected: Matches prototype Surface 3

**Step 5: Commit**

```bash
git add packages/studio-ui/src/hub-playbooks-panel.tsx
git commit -m "feat: redesign hub playbooks panel with micro-rail visualization"
```

---

### Task 4: Final build verification

**Step 1: Full typecheck**

Run: `pnpm check`
Expected: PASS across all packages

**Step 2: Production build**

Run: `pnpm build`
Expected: Build succeeds, `/playbooks` in route table

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: address build verification findings"
```
