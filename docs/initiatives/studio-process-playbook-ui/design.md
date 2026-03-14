---
designed: 2026-03-13
type: ui
components-new: 0
components-modified: 3
files-planned: 4
---

# Overview

UI redesign of the three playbook surfaces built during the spike. The data layer (playbooks.ts, artifact detection, prompt builders) is unchanged. See [shape.md](shape.md) for boundaries.

Prototype: [prototype.html](prototype.html) — open in browser to review all three surfaces.

# UI Design

## Surface 1: /playbooks page

**Before:** Three equal columns of flat play lists with repeated descriptions. No visual hierarchy, no initiative context, no way to act.

**After: Vertical rail cards.** Each playbook is a card with a vertical timeline rail. Plays are nodes on the rail with three visual states:

- **Completed:** Gold-filled circle with checkmark, gold connecting line
- **Suggested (next):** Pulsing ring with inner dot, description + copy button visible
- **Future:** Dim circle, minimal label, copy button on hover

Cards have an accent bar on the left edge — thin for Fast Track, medium for Standard, thick for High Stakes — communicating visual weight at a glance.

**Initiatives section** moves from a plain list to **chips with step indicators** — each chip shows the initiative name and its current play as a tiny badge (e.g., "Design System `shape`"). Shows 3 chips + "+N more" overflow.

**Cross-cutting plays** compress into a single-line bar below the cards: "Available anytime: Memo | Radar | Retro" — no descriptions, just actionable links.

## Surface 2: PlaybookSection in Process detail

**Before:** Horizontal pill strip with chevron connectors. Cluttered with copy buttons on every pill.

**After: Horizontal stepper with fill track.** A 2px horizontal line with positioned nodes. Completed nodes are solid gold dots. The current node is a pulsing ring. Future nodes are dim. A gold fill sweeps across the track proportional to completion.

Below the stepper: a single **suggested action CTA** (the most important element) — a bordered card with the next skill name, actor badge, and copy button. Only one CTA, not copy buttons on every node.

Cross-cutting plays compress to a subtle "anytime: /memo /radar" text row below.

## Surface 3: Hub panel

**Before:** Three rows of label + stats (play count, initiative count).

**After: Micro-rails.** Each playbook rendered as a miniature connected-dot sequence — like sparklines for playbook progress. Completed dots are gold, the current pulses, future dots are dim. The different rail lengths (3, 5, 8 dots) communicate track complexity visually. Initiative count as a small number on the right.

# File Plan

All modifications to existing spike files — no new files.

| File | Change |
|------|--------|
| `apps/studio/src/app/playbooks/page.tsx` | Rewrite PlaybookCard to rail-node layout, add initiative chips, compress cross-cutting |
| `packages/studio-ui/src/initiative-playbook-section.tsx` | Replace pill strip with horizontal stepper + fill track + single CTA |
| `packages/studio-ui/src/hub-playbooks-panel.tsx` | Replace stat rows with micro-rail visualization |
| `apps/studio/src/app/page.tsx` | Pass additional data to hub panel if needed (current play per initiative) |

# Decisions

**Vertical rails over horizontal pills for /playbooks page.** The page has vertical scroll space — use it. Vertical rails let each playbook card show its natural length (3 vs 8 nodes) without compression, and the timeline metaphor communicates sequence better than disconnected pills.

**Single CTA over per-node copy buttons in Process detail.** The playbook section's job is to show where you are and what's next. One prominent "next action" is more useful than 5 tiny copy buttons. The /playbooks page and action bar still have per-play access for when you need a specific skill.

**Initiative chips over plain lists.** Showing current play as a badge on each initiative chip makes the /playbooks page useful for portfolio-level status — "where is each initiative in its track?" — without navigating to individual Process detail pages.

# Open Questions

- Should the initiative chips on the /playbooks page show all active initiatives or cap at a reasonable number (e.g., 5)? The prototype shows 3 + overflow. Real data will determine if this is right.
- The hub panel micro-rails use hardcoded dot states (completed/current/future) from static data in the spike. Should the hub panel receive the actual aggregate state (how many initiatives are at each stage per playbook)? Probably not for v1 — keep it as a visual indicator of track length, not initiative status.
