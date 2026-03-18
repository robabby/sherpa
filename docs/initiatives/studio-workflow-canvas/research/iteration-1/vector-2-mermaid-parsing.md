# Vector 2: Mermaid-to-Graph Parsing

**Question:** How can we parse Mermaid flowchart syntax into a structured graph data model?
**Agent dispatched:** 2026-03-16

## Findings

**Mermaid internal parser (unstable):** `mermaid.mermaidAPI.getDiagramFromText(definition)` → `diagram.parser.yy.getVertices()`, `getEdges()`, `getSubGraphs()`. Marked deprecated but functional. Stable public AST API requested since 2021, remains open (issue #2523). Calling `parse()` separately from `render()` causes ID mismatch — globally unique IDs per parse call.

**`@mermaid-js/parser` v0.6.3:** Official new package, Langium-based. Signature: `parse<T>(diagramType, text): T`. Requires TypeScript >= 5.8.0. Flowchart coverage uncertain — Langium migration started with pie charts. Needs direct testing.

**Excalidraw's approach (most battle-tested):** `@excalidraw/mermaid-to-excalidraw` uses `getDiagramFromText()` + `diagram.parser.yy`. Handles subgraphs fully. Vertex types: STADIUM, ROUND, CIRCLE, DIAMOND, HEX, CYLINDER, etc. The [flowchart.ts source](https://github.com/excalidraw/mermaid-to-excalidraw/blob/master/src/parser/flowchart.ts) is the canonical reference.

**`@rendermaid/core`:** JSR package. `parseMermaid(input)` → AST with nodes map + edges array. Also provides `renderMermaid()` for graph → Mermaid string. Subgraph support unclear.

**`@lifeomic/mermaid-simple-flowchart-parser`:** Narrow scope, subset only. Subgraph support undocumented.

**Custom parser complexity:** 30+ node shapes, 10+ edge types, subgraphs with direction override, comments, styling directives, `classDef`/`class`, interactions. Common subset (basic shapes, arrows, labels, subgraphs) feasible in 1-2 sessions. 95%+ fidelity: 3-4 sessions.

**Export (graph → Mermaid):** No widely-adopted serializer. Template string generation is 50-100 lines. `JSON-Canvas-To-Mermaid` converts JSON Canvas format to Mermaid.

## Sources

- https://github.com/mermaid-js/mermaid/issues/1810
- https://github.com/mermaid-js/mermaid/issues/2523
- https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/codebase/parser
- https://www.npmjs.com/package/@mermaid-js/parser
- https://jsr.io/@rendermaid/core
- https://www.npmjs.com/package/@lifeomic/mermaid-simple-flowchart-parser
- https://github.com/alexwiench/JSON-Canvas-To-Mermaid
- https://mermaid.js.org/syntax/flowchart.html

## Implications

**Recommended path:** Test `@mermaid-js/parser` first (cleanest public API). If flowchart coverage gaps, fall back to Excalidraw's `getDiagramFromText` + `diagram.parser.yy` approach. Custom parser only if hard bundle size constraints.

**For export:** Write our own — 50-100 lines of template generation from the structured model.

**Key insight:** Our 80-line diagram uses only the common subset (basic shapes, subgraphs, edge labels). Any of these approaches should handle it.

## Open Questions

1. Does `@mermaid-js/parser` v0.6.3 cover the `flowchart` diagram type? Needs testing.
2. Stability horizon for `getDiagramFromText` + `diagram.parser.yy`? Pin mermaid version.
3. Bundle size of `@mermaid-js/parser` vs full `mermaid` package (~2MB)?
