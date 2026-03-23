---
stress-tested: 2026-03-21
assumptions-extracted: 13
tested: 7
confirmed: 5
refuted: 1
inconclusive: 1
human-required: 2
---

## Assumptions Inventory

| # | Assumption | Rating | Priority | Tested? |
|---|-----------|--------|----------|---------|
| A1 | `scanResearchFiles()` doesn't include RESEARCH_STATE.md and PRIORITIES.md | Asserted | **High** | Yes — **REFUTED** |
| A2 | `connection()` is available in Next.js 16 | Reasoned | Medium | Yes — Confirmed |
| A3 | `en-CA` locale produces YYYY-MM-DD format | Reasoned | Medium | Yes — Confirmed |
| A4 | `extractNumberedItems()` handles single-line severity/strikethrough patterns | Reasoned | Medium | Yes — Confirmed |
| A5 | `extractNumberedItems()` handles multi-line list items | Reasoned | Medium | Yes — Inconclusive |
| A6 | All required shadcn components are installed (Tabs, Card, Badge, Collapsible) | Sourced | Low | Yes — Confirmed |
| A7 | Adding optional fields to `ResearchFile` is backwards-compatible | Sourced | Low | Yes — Confirmed |
| A8 | `gray-matter` handles YAML block scalars (`>`) | Sourced | Low | Not tested — low priority |
| A9 | `Intl.DateTimeFormat` with `America/Los_Angeles` handles DST on Node.js 22 | Sourced | Low | Not tested — MDN + Node.js docs confirm |
| A10 | `router.replace()` with `{ scroll: false }` is shallow in Next.js 16 | Reasoned | Medium | Not tested — standard Next.js behavior |
| A11 | RESEARCH_STATE.md and PRIORITIES.md exist at `.sherpa/research/` root | Asserted | Medium | Human-required |
| A12 | RESEARCH_STATE.md section headings match exact names used in parsing | Asserted | Medium | Human-required |
| A13 | No new dependencies are needed | Sourced | Low | Not tested — verified by code reading |

## Tests Designed

### T1: scanResearchFiles includes operational files (A1)

**Design:** Read the `scanResearchFiles()` function and trace how root-level `.md` files are handled. Determine if `RESEARCH_STATE.md` and `PRIORITIES.md` would be returned as `ResearchFile` entries.

### T2: connection() availability (A2)

**Design:** Read `apps/studio/package.json` for exact Next.js version. Check `node_modules/next/server.js` for `connection` export.

### T3: en-CA locale format (A3)

**Design:** Run `node -e "console.log(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date()))"` and check output format.

### T4: extractNumberedItems patterns (A4, A5)

**Design:** Trace the regex `/^\d+\.\s+(.+)$/gm` against three real-world patterns: severity markers, strikethrough+emoji, and multi-line items with sub-bullets.

## Results: Confirmed

### A2: `connection()` is available in Next.js 16 — CONFIRMED

**Test:** Read `apps/studio/package.json` → Next.js `16.1.1`. Checked `node_modules/next/server.js` line 15 and 30 — `connection` is explicitly exported.

**Evidence:** `node_modules/next/dist/server/request/connection.js` exists with a proper async function implementation. Returns `Promise.resolve(undefined)` during a real request, stalls during prerender.

**Implications:** None — the plan's use of `await connection()` is correct.

### A3: `en-CA` locale produces YYYY-MM-DD — CONFIRMED

**Test:** `node -e "console.log(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date()))"`

**Evidence:** Output: `2026-03-21` — exact YYYY-MM-DD format.

**Implications:** None — the plan's `todayDate` computation is correct.

### A4: `extractNumberedItems()` handles single-line patterns — CONFIRMED

**Test:** Traced regex against severity markers (`CRITICAL: text`), strikethrough (`~~text~~ ✅`), and plain items.

**Evidence:** All three patterns captured correctly as full single-line strings. The `~~` tildes and `✅` emoji are plain characters to the regex — no truncation.

**Implications:** None — post-processing (severity extraction, strikethrough detection) works on the captured strings.

### A6: Required shadcn components installed — CONFIRMED

**Evidence:** shadcn project context lists installed components: `accordion`, `badge`, `card`, `collapsible`, `tabs` — all four needed components are present.

### A7: Optional fields are backwards-compatible — CONFIRMED

**Evidence:** Adding `summary?: string` and `trigger?: string` to an existing TypeScript interface is a non-breaking change. Existing consumers don't reference these fields, so they compile without modification.

## Results: Refuted

### A1: `scanResearchFiles()` doesn't include operational files — REFUTED

**Test:** Read `packages/studio-core/src/research-files.ts:44-50`. The function reads ALL `.md` files in the root of `.sherpa/research/` without any filename filtering.

**Evidence:**
```typescript
// Lines 44-50: No filename filter — ALL .md files included
if (!entry.isDirectory()) {
  if (entry.name.endsWith(".md")) {
    const file = parseResearchFile(...)
    if (file) files.push(file)
  }
  continue
}
```

`RESEARCH_STATE.md` would produce a `ResearchFile` with:
- `title`: filename fallback → `"RESEARCH_STATE"`
- `date`: filename fallback → `"RESEARCH_STATE"` (not a valid date!)
- `category`: `""` (empty)
- `slug`: `"RESEARCH_STATE"`

**Implications:** **This is a load-bearing bug.** Without fixing this:
- Both operational files appear as malformed research entries in all three views
- Sort order breaks (string `"RESEARCH_STATE"` vs ISO dates)
- The stream view gets a spurious "General" category with broken entries
- `parseResearchState()` and `parseResearchPriorities()` would work fine (they read files directly), but the dashboard would show duplicate/malformed entries

**Required fix:** Add a blocklist to `scanResearchFiles()` to skip known operational files at the root level. Filter: skip root-level files where `entry.name` matches `RESEARCH_STATE.md`, `PRIORITIES.md`, or any ALL_CAPS `.md` file pattern.

## Results: Inconclusive

### A5: `extractNumberedItems()` handles multi-line items — INCONCLUSIVE

**Test:** Traced regex against multi-line numbered items with sub-bullets:
```
1. Deep dive on Stripe engineering culture
   - Remote-first culture
   - Documentation practices
2. Analyze consulting market
```

**Evidence:** The regex `/^\d+\.\s+(.+)$/gm` captures only the first line of each numbered item. Sub-bullet continuation lines are silently dropped. Item 1 returns only `"Deep dive on Stripe engineering culture"` — the sub-bullets are lost.

Note: the sister function `extractOpenQuestions()` at line 165 handles multi-line items with a different regex: `/^\d+\.\s+(.+(?:\n(?!\d+\.)(?!^## ).+)*)/gm`.

**Implications:** If RESEARCH_STATE.md items are always single-line (likely — Luna writes them), this is a non-issue. If items occasionally have sub-bullets, the dashboard loses detail but doesn't break. **Low risk** — monitor but don't fix preemptively.

## Human-Required

### A11: Operational files exist at expected paths

**Suggested test:** SSH to VPS and verify:
```bash
ssh sherpa-hetzner "ls -la /root/sherpa/.sherpa/research/RESEARCH_STATE.md /root/sherpa/.sherpa/research/PRIORITIES.md"
```

**Why human:** Files live on VPS, not locally. Need to confirm exact filenames and paths.

### A12: Section headings match expected names

**Suggested test:** SSH to VPS and check section headings:
```bash
ssh sherpa-hetzner "grep '^## ' /root/sherpa/.sherpa/research/RESEARCH_STATE.md"
ssh sherpa-hetzner "grep '^## ' /root/sherpa/.sherpa/research/PRIORITIES.md"
```

Expected headings in RESEARCH_STATE.md: `## Last Updated`, `## Coverage Map`, `## Dangling Threads`, `## Research Queue`, `## Notes for Future Me`.

Expected headings in PRIORITIES.md: `## The Narrative`, `## Current Priorities`, `## What Research Should Focus On`.

**Why human:** If headings don't match exactly, `extractSection()` returns null silently — the panels would render empty with no error.

## Recommended Changes

### 1. Fix scanResearchFiles to exclude operational files (REQUIRED)

Add to Task 1 in the plan — before any dashboard work, `scanResearchFiles()` must filter out root-level operational files. Recommended approach: skip files matching `/^[A-Z_]+\.md$/` (ALL_CAPS filenames are operational, not research).

Update `packages/studio-core/src/research-files.ts:44-50`:
```typescript
if (!entry.isDirectory()) {
  // Skip operational files (ALL_CAPS names like RESEARCH_STATE.md, PRIORITIES.md)
  if (entry.name.endsWith(".md") && !/^[A-Z_]+\.md$/.test(entry.name)) {
    const file = parseResearchFile(...)
    if (file) files.push(file)
  }
  continue
}
```

Add test for this behavior.

### 2. Verify VPS file paths before implementation (RECOMMENDED)

Run the two SSH commands from A11/A12 before starting Session 1 to confirm file existence and heading names. If headings differ, update the `extractSection()` calls accordingly.

### 3. No action needed for multi-line items (MONITOR)

The single-line regex is adequate for agent-maintained files. If Luna starts writing multi-line queue items, revisit — but don't add complexity now.
