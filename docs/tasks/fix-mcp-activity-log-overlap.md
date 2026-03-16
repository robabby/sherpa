---
id: fix-mcp-activity-log-overlap
status: completed
role: engineer
priority: medium
initiative: null
backend: claude
model: claude-sonnet-4-6
task-type: code-implementation
mode: supervised
budget-usd: 1.00
worktree: null
branch: null
created: 2026-03-16T03:30:00
dispatched-at: 2026-03-16T04:35:00
completed-at: 2026-03-16T04:35:39
session-id: null
judge-verdict: pending
max-retries: 3
attempt: 1
---

# Fix MCP Activity Log overlapping Tool Inventory cards

## Objective

Fix a visual bug on the `/mcp` page where the Activity Log entries render on top of the Tool Inventory cards below. The two sections overlap instead of stacking sequentially.

## Context

The MCP page (`packages/studio-ui/src/mcp-content.tsx`) renders three sections in a `space-y-8` container:
1. Server Configuration + LM Studio cards (top row)
2. Activity Log (EventLog component with a `ScrollArea` capped at `max-h-[400px]`)
3. Tool Inventory (grid of tool cards)

The EventLog's `ScrollArea` content visually bleeds past its card boundaries, overlapping the Tool Inventory section below.

## File to modify

`packages/studio-ui/src/mcp-content.tsx`

## Acceptance Criteria

- [ ] The Activity Log card properly contains its scrollable content within its boundaries
- [ ] The Tool Inventory section renders fully below the Activity Log with no overlap
- [ ] The `max-h-[400px]` scroll constraint on the Activity Log still works (user can scroll within the log)
- [ ] No layout changes to the Server Configuration or LM Studio cards
- [ ] Run `pnpm check` — no type errors

## Suggested Fix

Add `overflow-hidden` to the `motion.div` wrapping the EventLog card (around line 335) to clip the scrollable content to the card boundaries. Alternatively, ensure the `ScrollArea` is properly constrained within its parent card.
