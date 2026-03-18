---
decision: "Inline split pane with ResizeHandle, not Sheet overlay"
date: 2026-03-16
skill: /design
alternatives-rejected:
  - "Sheet (Radix Dialog side panel) — shape suggested this, but codebase exploration found Studio uses inline splits everywhere. Sheet overlays the canvas; split pane keeps it visible."
  - "Bottom panel — compresses canvas vertically, harder to scan (research finding from n8n/Retool analysis)"
  - "Modal/Dialog — obscures canvas entirely, breaks spatial context"
confidence: high
kill-criteria: "If the canvas needs to be full-width at all times (e.g., for very wide workflows), reconsider Sheet."
---

# Detail Pane: Inline Split with ResizeHandle

## Why

Codebase exploration revealed that MissionWorkspace and ProcessWorkspace both use the same pattern: left content area + ResizeHandle + right detail pane. Width persisted to localStorage. This is the established Studio convention.

The shape suggested Sheet, but Sheet overlays the canvas — the user can't see the node's position in context while reading its details. The inline split keeps both visible, matching the n8n Focus Panel pattern (validated in research iteration 1).

## Pattern

```
[Canvas (flex-1)] [ResizeHandle (8px)] [DetailPane (360px, collapsible)]
```

- Detail pane hidden by default, appears on node click
- 360px default width, 200-500px range
- Width persisted to `localStorage('workflow-detail-width')`
- Matches existing ResizeHandle component exactly
