# Vector 1: Structured Markdown Section Parsing

**Question:** How to reliably parse RESEARCH_STATE.md and PRIORITIES.md into typed TypeScript data structures?
**Agent dispatched:** 2026-03-21

## Findings

The project already has the right primitives in `packages/studio-core/src/markdown.ts`:
- `extractSection(markdown, name)` — extracts content between `## Name` and the next heading
- `parseMarkdownTable(section)` — parses pipe-separated tables into string arrays
- `extractNumberedItems(section)` — extracts numbered list items
- `parseFrontmatter(source)` — gray-matter wrapper with error handling

Every section in the target files maps to an existing function:

| Section | Existing function | Gap |
|---|---|---|
| `## Last Updated` with ISO timestamp | `extractSection` + `Date.parse()` | none |
| `## Coverage Map` table | `extractSection` + `parseMarkdownTable` | none |
| `## Dangling Threads` numbered list | `extractSection` + `extractNumberedItems` | severity parsing |
| `## Research Queue` ordered list with `~~item~~` and checkmarks | `extractSection` + `extractNumberedItems` | strikethrough/emoji detection |
| `## The Narrative` prose | `extractSection` | none |
| `## Current Priorities` ordered list | `extractSection` + `extractNumberedItems` | none |

The gaps are small:
- Strikethrough (`~~item~~`) detection: regex `/~~(.+?)~~/` strips or flags the text
- Checkmark markers: `.includes('✅')` or `/✅/.test(item)`
- Severity markers: regex match for CRITICAL/HIGH/MEDIUM/LOW

**Approach recommendation: Extend the existing regex layer.** No new dependencies needed. The files are agent-written (Luna maintains them), so format is more controlled than human-written markdown — regex is reliable.

**Alternative (not recommended): remark + mdast AST-based parsing.** More structurally correct but adds ~5 ESM-only packages (`unified`, `remark-parse`, `remark-gfm`, `mdast-util-heading-range`, `unist-util-visit`). ESM-only modules require `transpilePackages` in Next.js config. Not worth the complexity for well-structured agent-maintained files.

## Sources

- [remark (GitHub)](https://github.com/remarkjs/remark)
- [remark-gfm (GitHub)](https://github.com/remarkjs/remark-gfm)
- [mdast-util-heading-range (GitHub)](https://github.com/syntax-tree/mdast-util-heading-range)
- [gray-matter (GitHub)](https://github.com/jonschlinkert/gray-matter)

## Implications

The data layer work is simpler than expected. All parsing functions exist — we need to compose them into `parseResearchState()` and `parseResearchPriorities()` functions, adding type definitions for the return values. No new dependencies. Implementation is a single session or less.

## Open Questions

1. How stable is the RESEARCH_STATE.md section format? If Luna changes section names, the regex matchers break silently.
2. Should we add Zod schema validation on the parsed output structures for runtime type safety?
