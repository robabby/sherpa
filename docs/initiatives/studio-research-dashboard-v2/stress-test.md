---
stress-tested: 2026-03-21
assumptions-extracted: 13
tested: 8
confirmed: 7
refuted: 0
inconclusive: 1
human-required: 1
---

## Assumptions Inventory

| # | Assumption | Rating | Priority | Tested? |
|---|-----------|--------|----------|---------|
| A1 | `useDeferredValue` is available in the project's React version | Reasoned | **High** | Yes — **Confirmed** |
| A2 | CSS variable references like `bg-[var(--glass-bg)]` work in Tailwind v4 | Reasoned | **High** | Yes — **Confirmed** |
| A3 | Coverage map `lastRun` values are valid date strings parseable by `new Date()` | Asserted | **High** | Yes — **Inconclusive** (human-required) |
| A4 | shadcn `Input` component accepts `className` for glass restyling | Reasoned | Medium | Yes — **Confirmed** |
| A5 | URL params `?q=` and `?categories=` don't conflict with existing research page params | Reasoned | Medium | Yes — **Confirmed** |
| A6 | Inline markdown regex won't break on edge cases in real research summaries | Reasoned | Medium | Yes — **Confirmed** |
| A7 | `now.toISOString()` is serializable as RSC-to-client prop | Reasoned | Medium | Yes — **Confirmed** |
| A8 | Tailwind arbitrary animation values (`animate-[pulse-glow_2s_...]`) work with custom keyframes | Reasoned | Medium | Yes — **Confirmed** |
| A9 | All referenced shadcn components (Card, Badge, Tabs, Collapsible, Input) are installed | Sourced | Low | Not tested — verified from shadcn project context |
| A10 | `font-display` Tailwind class maps to Fraunces font | Sourced | Low | Not tested — verified from globals.css line 11 |
| A11 | Glass tokens (--glass-bg, --glass-border, etc.) are defined in `.dark {}` scope | Sourced | Low | Not tested — verified from globals.css lines 245-251 |
| A12 | Reduced motion `@media` rule blankets all animations | Sourced | Low | Not tested — verified from globals.css lines 402-416 |
| A13 | `render-inline-markdown.tsx` in `apps/studio/src/lib/` follows project conventions | Reasoned | Low | Yes — **Confirmed** (3 existing files in that directory) |

## Tests Designed

### T1: React useDeferredValue availability (A1)

**Design:** Read `apps/studio/package.json` for exact React version. Grep for existing `useDeferredValue` usage. React 18+ has single-arg form, React 19+ adds two-arg form.

### T2: Tailwind v4 CSS variable arbitrary values (A2)

**Design:** Grep for `bg-[var(--`, `border-[var(--`, `text-[var(--` patterns across all `.tsx` files. If 3+ production components use this pattern without issues, the assumption is confirmed.

### T3: Coverage map lastRun date format (A3)

**Design:** Read `parseResearchState()` in `research-files.ts` to understand how `lastRun` is extracted. Check if any date parsing or formatting is applied. If it's a raw string, check the actual RESEARCH_STATE.md on the VPS for real format.

### T4: Input className forwarding (A4)

**Design:** Read `apps/studio/src/components/ui/input.tsx`. Check if `className` is accepted and merged via `cn()`.

### T5: URL param conflicts (A5)

**Design:** Read `research-dashboard.tsx` to enumerate all `searchParams.get()` calls. Check if `q` or `categories` are used.

### T6: Summary content patterns (A6)

**Design:** Check the `summary` field extraction in `parseResearchFile()`. Determine if summaries contain complex nested markdown. Check if the regex renderer fails gracefully on unmatched patterns.

### T7: ISO string RSC serialization (A7)

**Design:** Search for examples of string props passed from server components to client components. Check if any timestamp/date patterns use string types.

### T8: Arbitrary animation values (A8)

**Design:** Grep for `animate-[` patterns in `.tsx` files. Check if custom keyframes from globals.css are referenced via arbitrary Tailwind syntax.

## Results: Confirmed

### A1: `useDeferredValue` is available — CONFIRMED

**Test:** Read `apps/studio/package.json` → React 19.2.3. Grepped for `useDeferredValue` — no existing usage.

**Evidence:** React 19.2.3 supports both forms:
- Single-arg: `useDeferredValue(value)` (React 18+)
- Two-arg: `useDeferredValue(value, initialValue)` (React 19+)

**Implications:** None — both forms available. No prior art in the codebase, but this is a standard React API. The design uses single-arg form which is the simpler case.

### A2: Tailwind v4 CSS variable references work — CONFIRMED

**Test:** Grepped for `bg-[var(--`, `border-[var(--`, `text-[var(--` across all `.tsx` files.

**Evidence:** 20+ working examples across 6+ production components:
- `activity-links.ts`: `border-[var(--color-gold)]/50`, `text-[var(--color-gold)]`, `bg-[var(--color-gold)]/10`
- `mission-timeline.tsx`: `border-[var(--color-copper)]`, `bg-[var(--color-copper)]/20`
- `workflow-legend.tsx`: `border-[var(--glass-border)]`
- `initiative-lifecycle-bar.tsx`: multiple variable references with opacity modifiers

Opacity modifiers (`/50`, `/10`), hover states (`hover:bg-[var(...)]`), and pseudo-element variants all work.

**Implications:** None — this is a proven, heavily-used pattern in the codebase.

### A4: shadcn Input accepts className — CONFIRMED

**Test:** Read `apps/studio/src/components/ui/input.tsx`.

**Evidence:** Line 5: `function Input({ className, type, ...props }: React.ComponentProps<"input">)`. Line 14: className merged via `cn(defaultStyles, className)`. Glass styling can be applied as className override.

**Implications:** None — standard shadcn pattern.

### A5: No URL param conflicts — CONFIRMED

**Test:** Read `research-dashboard.tsx` line 43: `searchParams.get("view")`. Only param used is `view`.

**Evidence:** The research page uses exactly one URL parameter (`?view=stream|timeline|table`). Adding `?q=` and `?categories=` creates no conflict. The `setView` callback at line 50 uses `new URLSearchParams(searchParams.toString())` which preserves all existing params — new params will coexist safely.

**Implications:** None.

### A6: Inline markdown regex is safe for summaries — CONFIRMED

**Test:** Traced `summary` field extraction in `parseResearchFile()` — line 34: `data.summary.trim()`. Checked real-world usage patterns.

**Evidence:** Summaries come from YAML frontmatter `summary:` fields, written by Luna (AI agent). They are short (1-2 lines), plain text with occasional simple markdown. No HTML, no nested formatting. The regex renderer is designed to fail gracefully — unmatched patterns pass through as plain text. No `dangerouslySetInnerHTML` — output is React elements (`<strong>`, `<em>`, `<code>`, `<a>`), inherently XSS-safe.

**Implications:** None — the regex approach is appropriate for this content.

### A7: ISO strings serialize safely as RSC props — CONFIRMED

**Test:** Searched for date/timestamp prop patterns across server-to-client boundaries.

**Evidence:** All timestamp fields in the project (e.g., `TaskBoardEntry.created`, `TaskBoardEntry.dispatchedAt`, `TaskBoardEntry.completedAt`) are typed as `string`, not `Date`. No custom serialization. `now.toISOString()` produces a plain string which is natively serializable by React Server Components.

**Implications:** None — strings are the safest serializable type.

### A8: Arbitrary animation values work with custom keyframes — CONFIRMED

**Test:** Grepped for `animate-[` patterns in `.tsx` files.

**Evidence:** Active production usage:
- `initiative-lifecycle-bar.tsx:114`: `animate-[pulse-glow_2s_ease-in-out_infinite]`
- `initiative-lifecycle-hero.tsx:63`: `animate-[segment-pulse_2s_ease-in-out_infinite]`
- `initiative-lifecycle-hero.tsx:112`: `animate-[cta-glow_3s_ease-in-out_infinite]`

All reference keyframes defined in globals.css. The pattern `animate-[keyframe_duration_easing_iteration]` compiles to standard CSS `animation:` shorthand.

**Implications:** None — proven pattern. The design uses `pulse-glow`, `led-pulse`, and `panel-glow-in` which are all defined in globals.css.

### A13: File location follows convention — CONFIRMED

**Test:** Listed `apps/studio/src/lib/` directory contents.

**Evidence:** Three existing files: `utils.ts`, `auth-client.ts`, `auth.ts`. A new `render-inline-markdown.tsx` fits the pattern of app-specific utilities in this directory.

**Implications:** None.

## Results: Inconclusive

### A3: Coverage map lastRun date format — INCONCLUSIVE

**Test:** Read `parseResearchState()` in `research-files.ts` lines 111-113. The `lastRun` field is a raw string extracted from the markdown table — no date parsing or formatting applied.

**Evidence:** The `CoverageEntry.lastRun` is typed as `string` and holds whatever text appears in the coverage map table of RESEARCH_STATE.md. The design assumes this is an ISO date string (`2026-03-21`) parseable by `new Date()`, but the code applies no validation.

The `formatDate()` function (line 17) exists in the file but is only used for `ResearchFile.date`, not for `CoverageEntry.lastRun`. There is no local copy of RESEARCH_STATE.md to inspect — the file lives on the VPS at `/root/sherpa/.sherpa/research/RESEARCH_STATE.md`.

**Implications:** If `lastRun` values are not ISO dates (e.g., "March 21" or "yesterday"), `new Date(lastRun)` would return `Invalid Date`, causing `getStaleness()` to produce `NaN` for `daysSince`. The staleness indicator would show incorrect colors.

**Mitigation:** Add a guard in `getStaleness()`: if `new Date(lastRun)` is invalid, return `"fresh"` (safe default — don't alarm on unparseable dates). This is a one-line safety net regardless of the actual format.

## Human-Required

### A3: Verify RESEARCH_STATE.md coverage map date format

**Suggested test:**
```bash
ssh sherpa-hetzner "grep -A 20 '## Coverage Map' /root/sherpa/.sherpa/research/RESEARCH_STATE.md"
```

**Why human:** The file lives on the VPS, not in the local repo. Need to confirm the exact date format used in the coverage map table rows (expected: ISO `YYYY-MM-DD`, but could be any text format Luna writes).

**What to look for:** Each row's second column. If it's `2026-03-21` format, A3 is confirmed. If it's `March 21, 2026` or a relative term, the `getStaleness()` function needs a date parsing adapter.

## Recommended Changes

### 1. Add guard for unparseable lastRun dates (RECOMMENDED)

In the `getStaleness()` utility (design.md D4), add a validity check:

```typescript
function getStaleness(lastRun: string, nowISO: string): "fresh" | "aging" | "stale" {
  const lastMs = new Date(lastRun).getTime()
  if (Number.isNaN(lastMs)) return "fresh" // safe default for unparseable dates
  const nowMs = new Date(nowISO).getTime()
  const daysSince = (nowMs - lastMs) / (1000 * 60 * 60 * 24)
  if (daysSince <= 2) return "fresh"
  if (daysSince <= 7) return "aging"
  return "stale"
}
```

This is a one-line safety net. Cost: zero. Benefit: prevents `NaN` propagation if the date format is unexpected.

### 2. Verify VPS file format before Session 2 (RECOMMENDED)

Run the SSH command from A3's human-required test before implementing staleness indicators. If the format differs from ISO, adjust the parser.

### 3. No other changes needed

All other assumptions confirmed. The design is sound for implementation.
