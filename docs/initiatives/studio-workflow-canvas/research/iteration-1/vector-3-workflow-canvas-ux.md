# Vector 3: Workflow Canvas UX Patterns

**Question:** How do leading workflow canvas tools handle node inspection, detail panels, layout persistence, and export?
**Agent dispatched:** 2026-03-16

## Findings

### n8n
- Canvas: Vue Flow (React Flow equivalent), infinite dotted grid, pixel coordinates per node.
- **Hover:** `CanvasNodeToolbar` appears above node with action buttons. Status icons on node (green checkmark, error, waiting).
- **Click:** Selects node → experimental **Focus Panel** (right-side inline panel, keeps canvas visible). Feature flag required.
- **Double-click:** Opens **Node Detail View (NDV)** — large modal overlay (~80% viewport width) with parameter inputs, Input/Output tabs, Settings tab.
- **Layout persistence:** Auto-saved to backend DB within 1-5 seconds. Node positions stored as `[x, y]` in workflow JSON.
- **Export:** JSON download (includes positions). Community Mermaid converter exists. No native SVG/PNG.

### Obsidian Canvas
- Node types: text, file, link, group (JSON Canvas 1.0 spec — MIT licensed).
- **Hover:** Connection dots appear at card edges for linking.
- **Click:** Selects card (resize handles). Click on embedded note enters edit mode.
- **No inspector panel** — content is read inline on the card.
- **Layout persistence:** `.canvas` JSON files saved to filesystem. Cross-device via vault sync.
- **Export:** PNG built-in. Community plugins for HTML/PDF/SVG. Advanced Canvas plugin adds flowchart shapes, edge styles, collapsible groups.
- **JSON Canvas is an open standard** — directly applicable as an interchange format.

### Retool Workflows
- Infinite canvas with blocks. Graph view (horizontal DAG) and Tree view (vertical) switchable.
- **Click:** Opens block in **split view below canvas** — canvas and config panel both visible.
- **Inspector:** Three categories: Content, Interaction, Appearance. Progressive disclosure with expandable advanced panels.
- **Execution:** Per-block run history with inputs/outputs via Workflows Debugger.
- **Layout persistence:** Server-side.
- **Export:** JSON via source control integration. No native Mermaid/SVG.

### Windmill
- Left-panel DAG graph, right-panel Action Editor. Persistent split layout.
- **Click step:** Loads config in right-panel editor.
- **Execution:** Per-step status indicators in DAG. Log Viewer with tree view of flow steps.
- **Layout persistence:** Auto-layout from YAML structure — no manual drag position persistence.
- **Export:** YAML or JSON. No canvas image export.

### tldraw
- Infinite canvas, pan/zoom with configurable camera behavior.
- `ShapeUtil` subclass: `getDefaultProps()`, `getGeometry()`, `component()`, `indicator()`.
- **Persistence:** `persistenceKey` → auto-save to IndexedDB. `getSnapshot()`/`loadSnapshot()` for manual. Separates document data from session data.
- **Export:** Built-in SVG and PNG via `editor.toSvg()`.

## Sources

- https://deepwiki.com/n8n-io/n8n/6.2-workflow-canvas-and-node-management
- https://community.n8n.io/t/help-us-test-some-canvas-improvements/201703
- https://jsoncanvas.org/spec/1.0/
- https://github.com/Developer-Mike/obsidian-advanced-canvas
- https://retool.com/blog/simplifying-retools-inspector
- https://docs.retool.com/workflows/concepts/ide
- https://www.windmill.dev/docs/flows/editor_components
- https://tldraw.dev/docs/persistence

## Implications

**Two-tier interaction is standard:** Hover for quick signal + click for depth. Single click → right-side panel; double-click → full detail. Don't require double-click as only path.

**Right-side panel is dominant:** n8n Focus Panel, Windmill Action Editor, Retool split view — all right-aligned. Avoid bottom panels (compress canvas vertically). Fixed width 320-480px.

**Status on-node, not just in panel:** n8n and Windmill show per-step status directly on canvas nodes. Our stages should show status badges (pending/in-progress/integrated) on the node.

**JSON Canvas spec is directly applicable:** MIT licensed, stores `id`, `type`, `x`, `y`, `width`, `height`, `color` per node. Could store layout as `.canvas` file — Obsidian-compatible.

**Mermaid export from structured data, not canvas positions:** Produces stable, version-controllable output that doesn't change on drag.

## Open Questions

1. Focus panel vs. modal for our node detail? Our nodes have governance metadata (light) and full initiative detail (heavy).
2. Free-form positioning vs. enforced DAG auto-layout? "Canvas meets n8n" suggests free-form with auto-layout as reset.
3. Edge semantics visualization — color, style, or label for dependencies/informs/spawned-from?
