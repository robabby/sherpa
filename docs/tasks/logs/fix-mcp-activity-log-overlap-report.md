# Task Report: fix-mcp-activity-log-overlap

## What was done

Fixed a visual bug on the `/mcp` page where the Activity Log's `ScrollArea` content visually bled past the card's boundaries, overlapping the Tool Inventory cards below.

## Root cause

The `motion.div` wrapping the `EventLog` component (`mcp-content.tsx:335`) was missing `overflow-hidden`. Without it, the `ScrollArea` content (which uses absolute/fixed positioning internally) escaped the card's `rounded-xl` boundary and rendered on top of elements below.

## Files changed

- `packages/studio-ui/src/mcp-content.tsx` — Added `overflow-hidden` to the `EventLog` card's wrapper `motion.div` (line 335).

## Change

```diff
- className="rounded-xl border border-[var(--color-mcp)]/20 bg-card/30 backdrop-blur-sm"
+ className="overflow-hidden rounded-xl border border-[var(--color-mcp)]/20 bg-card/30 backdrop-blur-sm"
```

## Verification

- `pnpm check` — passed with no type errors across all workspace packages.
- The `max-h-[400px]` scroll constraint on the Activity Log is preserved.
- No changes to Server Configuration or LM Studio cards.

## Commit

`d694e7e` — fix(studio): add overflow-hidden to EventLog card to prevent ScrollArea bleed
