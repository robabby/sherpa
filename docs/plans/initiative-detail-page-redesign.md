# Initiative Detail Page Redesign Prompt

## Context

You are redesigning the **initiative detail pane** in Sherpa Studio — an agentic workflow platform that combines the best of Linear (project tracking), Notion (structured docs + databases), Obsidian (graph knowledge, file-based data), and Google Docs (collaborative content). The app is built with **Next.js 16, Tailwind v4, shadcn/ui, and motion/react**.

The current implementation lives primarily in `packages/studio-ui/src/process-detail-pane.tsx` (1481 lines) with supporting components in `initiative-file-tree.tsx`, `prompt-copy-button.tsx`, `status-badge.tsx`, `proposal-actions.tsx`, and `lifecycle-pipeline.tsx`. The page renders inside a three-zone layout: left kind-rail → middle item list → right detail pane.

## What This Page Shows

An **initiative** is the core unit of work in Sherpa. It has:
- **Lifecycle stages**: Research → Proposal → Plan → Active → Integrated (9 stages collapsed into 5 visual steps)
- **Metadata**: status, type, risk level, target files/dirs, dependencies, created/updated dates
- **File tree**: The initiative's directory structure (proposal.md, plan.md, research/, branches/, sub-initiatives/, deliverables/)
- **Actions**: Lifecycle-driven suggested actions, prompt-copy buttons (/rr, Copy plan, Synthesize, Sub-initiative), status changes, archive/restore
- **Tabs**: Overview, Graph, Content (+ Activity for workstream nodes)
- **Sessions**: Agent work sessions with model, duration, token usage, outcome
- **Charts**: Deliverable chart specs rendered inline

## Current Problems (What Needs Fixing)

### Information Architecture
1. **Flat, undifferentiated layout** — Metadata, lifecycle, file tree, sessions, and charts all dump into one scrolling column with no visual hierarchy or grouping
2. **Lifecycle pipeline is an afterthought** — Small dots connected by lines, easily missed. This should be the HERO element — it's the single most important piece of context for understanding an initiative's state
3. **Action bar is a row of indistinguishable buttons** — No visual hierarchy between the suggested lifecycle action (most important) and utility buttons (Copy /rr, Sub-initiative). The suggested action should SCREAM for attention
4. **File tree is visually disconnected** — Appears as a flat list after metadata, with no context about what the files represent or why they matter. Research iterations, vectors, and branches should feel like a knowledge graph, not a file explorer
5. **Metadata section is boring key-value pairs** — TYPE: new-plan, RISK: structural — these should be rich visual indicators, not text labels
6. **No sense of progress or momentum** — The page doesn't communicate "this initiative is 60% through its lifecycle and was last worked on 2 days ago"

### Visual Design
7. **Everything is the same visual weight** — No breathing room, no focal points, no information hierarchy
8. **Tab content areas are empty/sparse** — The Content tab just shows a link. The Graph tab is a separate component but feels disconnected
9. **Session data is buried at the bottom** — Agent sessions are fascinating context (which models worked on this? how much compute was spent?) but they're hidden below the fold
10. **No personality or delight** — The page is purely functional with no moments of visual interest

### Interaction Design
11. **No inline editing** — Status changes require a dropdown, but metadata like type/risk could be inline-editable
12. **Prompt actions don't explain themselves** — The copy buttons give no preview of what they'll do
13. **No keyboard navigation within the pane** — The workspace has j/k for list navigation, but inside the detail pane there's nothing

## Design Direction

### Aesthetic: "Mission Control meets Research Lab"

Think **SpaceX mission control** crossed with **a researcher's annotated notebook**. Dense but clear. Technical but warm. Every pixel serves a purpose, but the overall effect is one of sophisticated calm — you're looking at a complex system and understanding it instantly.

**NOT** a generic dashboard. NOT a simple card layout. NOT a Notion clone. This should feel like a tool built for people orchestrating AI agents across branching research streams.

### Key Design Principles

1. **The lifecycle IS the page** — The lifecycle stage should be the dominant visual element, not a tiny progress bar. Think Linear's status pipeline but with the visual weight of a mission control timeline.

2. **Density without clutter** — Take inspiration from Linear's 12px base font, tight spacing, and information-dense rows. Every element earns its pixels. But use generous whitespace between SECTIONS to create clear visual grouping.

3. **The file tree is a knowledge map** — Research iterations should feel like expedition journals. Vectors should feel like branching paths of inquiry. The tree should communicate the SHAPE of the research, not just the files.

4. **Actions should feel like launching a mission** — The suggested lifecycle action should be a prominent, glowing call-to-action. Secondary actions should be discoverable but recessive. Prompt-copy buttons should preview their payload on hover.

5. **Metadata as visual DNA** — Type, risk, targets, and dependencies should be rendered as rich visual indicators (colored pills, icon badges, mini-graphs) not text labels.

6. **Session history tells the story** — Model badges (Opus/gold, Sonnet/copper, Haiku/bronze), token usage sparklines, and duration indicators should create a visual narrative of the work done.

## Specific Design Specs

### Layout Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER ZONE                                                         │
│ ┌─────────────────────────────────────────────────┐ ┌──────────────┐│
│ │ Icon + Title (large, dominant)                   │ │ Status badge ││
│ │ Created · Updated · Source path                  │ │ + dropdown   ││
│ └─────────────────────────────────────────────────┘ └──────────────┘│
├──────────────────────────────────────────────────────────────────────┤
│ LIFECYCLE HERO ZONE                                                  │
│ ┌────────────────────────────────────────────────────────────────────┐
│ │  ◉──────●──────●──────○──────○                                    │
│ │  RESEARCH  PROPOSAL  PLAN   ACTIVE  INTEGRATED                    │
│ │                                                                    │
│ │  ┌─ Next: Create implementation plan ──── [Agent] ─────────────┐  │
│ │  │  ▶ Suggested: Create Plan                    [Copy /rr]     │  │
│ │  └─────────────────────────────────────────────────────────────┘  │
│ └────────────────────────────────────────────────────────────────────┘
├──────────────────────────────────────────────────────────────────────┤
│ ┌─ TABS ─────────────────────────────────────────────────────────┐  │
│ │ [Overview]  [Research]  [Graph]  [Activity]  [Content]         │  │
│ └────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│ TAB CONTENT (scrollable)                                             │
│                                                                      │
│ === OVERVIEW TAB ===                                                  │
│ ┌─────────────────────────────────┐ ┌──────────────────────────────┐│
│ │ METADATA GRID                    │ │ QUICK STATS                  ││
│ │ Type: [new-plan pill]            │ │ 4 research iterations        ││
│ │ Risk: [structural indicator]     │ │ 12 vectors explored          ││
│ │ Targets: [clickable chips]       │ │ 3 agent sessions             ││
│ │ Dependencies: [linked pills]     │ │ 847K tokens consumed         ││
│ └─────────────────────────────────┘ └──────────────────────────────┘│
│                                                                      │
│ ┌─ FILE TREE / KNOWLEDGE MAP ──────────────────────────────────────┐│
│ │                                                                    │
│ │  📄 proposal.md                                      [approved]   │
│ │  📋 plan.md                                          [Plan ▶]    │
│ │                                                                    │
│ │  📚 research/                                        4 iterations │
│ │  ├─ 🔬 iteration-1/                                  5 vectors   │
│ │  │  ├─ 📊 iteration-1.md (synthesis)                             │
│ │  │  ├─ 🔀 vector-1-competing-agent-formats.md                    │
│ │  │  ├─ 🔀 vector-2-taxonomy-design.md                            │
│ │  │  ├─ 🔀 vector-3-validation-tooling.md                         │
│ │  │  └─ 🔀 vector-4-competitive-landscape.md                      │
│ │  ├─ 🔬 iteration-2/                                  1 vector    │
│ │  ├─ 🔬 iteration-3/                                  1 vector    │
│ │  └─ 🔬 iteration-4/                                  1 vector    │
│ │                                                                    │
│ │  🌱 branches/                                        2 seeds     │
│ │  └─ 🌱 behavioral-lint-tool.md                       [launched]  │
│ └────────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌─ SESSIONS ───────────────────────────────────────────────────────┐│
│ │  Mar 10  [Opus]  2h 15m  completed  ████████████░░  412K        ││
│ │  Mar 11  [Sonnet] 45m   completed   █████░░░░░░░░░  127K        ││
│ │  Mar 12  [Opus]  in progress...                                   ││
│ └────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### Component-Level Specs

#### 1. Lifecycle Hero

Replace the current dot-and-line progress bar with a full-width lifecycle visualization:

- **Size**: Full pane width, ~80px tall
- **Steps**: 5 stages rendered as connected segments (not dots)
- **Current stage**: Highlighted with glow effect using `--color-gold`, pulsing subtle animation
- **Completed stages**: Solid fill with `--color-gold`
- **Future stages**: Ghosted with `--color-copper/20`
- **Labels**: Below each segment, 10px uppercase tracking-wider
- **Next action callout**: Integrated below the pipeline as a card with the suggested action + actor badge (You/Agent)
- **Inspiration**: Think GitHub Actions workflow visualization or Linear's project progress bars, but with more visual weight

#### 2. Metadata Grid

Replace vertical key-value pairs with a 2-column grid of rich indicators:

- **Type**: Colored pill with icon (e.g., `new-plan` gets a sparkle icon + blue pill, `research-synthesis` gets a beaker + purple)
- **Risk**: Traffic light indicator (green=additive, amber=evolutionary, red=structural) with icon
- **Targets**: Clickable mono chips that highlight on hover, showing the target path
- **Dependencies**: Linked pills that navigate to the dependency initiative on click
- **Quick Stats** (right column): Computed from file tree data — iteration count, vector count, session count, total tokens. Rendered as compact stat cards with icons

#### 3. File Tree Redesign → "Knowledge Map"

The file tree should communicate research depth and breadth:

- **Iteration rows**: Each iteration gets a mini-summary line (e.g., "5 vectors — completed Mar 10") with a progress indicator
- **Vector entries**: Show with `GitBranch` icon and a brief title extracted from the file, not just the filename
- **Branch/seed entries**: Show with `Sprout` icon and their status badge, with a glow effect for `launched` seeds
- **Ghost nodes**: Show as dashed-outline placeholders with a "Create" action button
- **Indentation guides**: Use the copper border-left pattern but with subtle animation on expand/collapse
- **Hover state**: Show the inline prompt-copy action + a preview tooltip of the file's first paragraph
- **Directory summaries**: Show child count + type breakdown (e.g., "6 files — 4 vectors, 1 synthesis, 1 index")

#### 4. Action Bar Redesign → "Mission Control"

Split the action bar into three tiers:

**Tier 1 — Primary CTA** (the suggested lifecycle action):
- Full-width button below the lifecycle hero
- Prominent glow effect with `--color-gold`
- Shows the action name + what it will do
- Example: "▶ Create Implementation Plan — Translates proposal into session-by-session plan"

**Tier 2 — Contextual actions** (status change, archive/restore, view details):
- Compact button group in the header, right-aligned
- Uses shadcn `Button` with `variant="outline"` and `size="sm"`

**Tier 3 — Prompt actions** (Copy /rr, Copy plan, Synthesize, Sub-initiative):
- Hover-reveal actions on relevant file tree nodes (already partially implemented)
- Also available as a collapsible "Prompts" section with preview tooltips
- Each shows the full prompt text in a `Popover` on hover

#### 5. Sessions Section Redesign

Transform sessions from a boring list to a visual timeline:

- **Each session row**: Date | Model badge (Opus=gold, Sonnet=copper, Haiku=bronze) | Duration | Outcome | Token bar
- **Token bar**: Horizontal bar chart showing input vs output tokens, proportional width
- **In-progress indicator**: Pulsing glow for active sessions
- **Summary header**: "3 sessions · 847K tokens · 3h 15m total" in a single compact line
- **Expandable detail**: Click a session to see full breakdown (tools used, files modified)

#### 6. Tab System Enhancement

Current tabs: Overview, Graph, Content. Redesign:

- **Overview**: Everything described above (lifecycle + metadata + file tree + sessions)
- **Research** (NEW): Dedicated tab showing research iterations with full synthesis content, vector summaries, and a mini-graph of research relationships
- **Graph**: Keep the force-directed graph but style it to match the mission control aesthetic (node colors matching the kind-rail colors, edge styles matching lifecycle stage)
- **Activity**: Timeline of activity log entries (already exists for workstreams, extend to initiatives)
- **Content**: Rendered markdown preview of the proposal/plan with inline annotations

### Color Usage

The existing warm palette is distinctive — preserve it:

| Token | Usage |
|-------|-------|
| `--color-gold` (#d4a574) | Primary accent, lifecycle completion, Opus badge, suggested actions |
| `--color-copper` (#c49a6c) | Secondary accent, Sonnet badge, vectors, connectors |
| `--color-bronze` (#8b7355) | Tertiary, Haiku badge, completed/archived states |
| `--color-obsidian` (#08080a) | Background (dark mode) |
| `--color-eclipse` (#7c3aed) | Special accent for transit/eclipse domain nodes |
| `--color-session` (#818cf8) | Session-specific indicators |

### Typography

Existing font stack is strong:
- **Display**: Fraunces (serif) — use for the initiative title
- **Body**: DM Sans — use for all UI text
- **Mono**: JetBrains Mono — use for file paths, stats, technical values

### Animation

Use `motion/react` (already imported) for:
- Lifecycle stage transitions (spring curve when lifecycle changes)
- File tree expand/collapse (already implemented with `AnimatePresence`)
- Session row entrance (staggered reveal)
- Stat counter animations (count up on mount)
- Subtle hover lifts on clickable elements

### shadcn/ui Components to Use

Already available in the project:
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` — tab system
- `Button` — actions
- `Badge` — status indicators (or custom `StatusBadge`)
- `DropdownMenu` — status change
- `AlertDialog` — confirmations
- `Tooltip`, `Popover` — hover previews
- `Separator` — section dividers
- `ScrollArea` — scrollable content
- `Collapsible` — expandable sections
- `Progress` — lifecycle bar segments
- `Card` — metadata grouping

Consider adding:
- `HoverCard` — rich hover previews for file tree nodes
- `Accordion` — research iteration expand/collapse
- `Resizable` — split the overview into metadata + file tree panels

## Implementation Notes

### File Structure

The current 1481-line `process-detail-pane.tsx` should be broken into focused components:

```
packages/studio-ui/src/
  process-detail-pane.tsx          → Orchestrator (header + tabs + routing)
  initiative-overview.tsx          → Overview tab content
  initiative-lifecycle-hero.tsx    → The lifecycle visualization + CTA
  initiative-metadata-grid.tsx     → Rich metadata display
  initiative-file-tree.tsx         → Already exists, needs enhancement
  initiative-sessions.tsx          → Session timeline component
  initiative-action-bar.tsx        → Already exists, needs redesign
```

### Data Requirements

The current `ProcessNode.metadata` bag already contains:
- `lifecycle` (stage, label, nextAction, actor, stageIndex)
- `fileTree` (FileTreeNode tree)
- `research` (iterations, vectors, totalFiles)
- `chartSpecs` (deliverable chart data)
- Type, risk, targets, dependencies from frontmatter

May need to add:
- Computed stats (total vectors, total iterations, total tokens across sessions)
- Research depth metrics (max iteration number, vector breadth)
- Last activity timestamp for staleness display

### What NOT to Change

- The three-zone workspace layout (kind rail + item list + detail pane)
- The URL state sync pattern (query params for selection, tab, filters)
- The keyboard navigation (j/k for list, arrow keys)
- The server action pattern for status changes
- The `ProcessNode` data model (enhance metadata, don't restructure)
- The prompt-copy mechanism (clipboard + toast feedback)

## Reference Implementations

Study these for specific patterns:

1. **Linear issue detail view** — Information hierarchy, metadata sidebar, keyboard nav, 12px base font, warm gray tones, status pipeline
2. **Notion page header** — Icon + title + properties stack, breadcrumb navigation, inline editing
3. **Obsidian file explorer** — Tree indentation, collapse indicators, icon differentiation, backlinks panel
4. **GitHub Actions workflow view** — Step-by-step pipeline with status indicators, expandable logs, timing data
5. **Figma layers panel** — Dense but scannable tree with multiple visual indicators per row
6. **VS Code explorer** — File tree with git status indicators, modified badges, inline actions on hover
7. **Raycast command bar** — Action previews, keyboard-first interaction, contextual suggestions

## Success Criteria

The redesigned page should:

1. **Communicate lifecycle state instantly** — A user should understand the initiative's stage and next action within 1 second of seeing the page
2. **Make the research shape visible** — The depth and breadth of research (iterations, vectors, branches) should be visually apparent without expanding anything
3. **Surface the right action** — The most important next action should be the most visually prominent element after the title
4. **Feel dense but not cluttered** — Information-rich while maintaining clear visual grouping
5. **Reward exploration** — Hover states, expand actions, and tooltips should reveal progressively more detail
6. **Look like nothing else** — Not a generic dashboard, not a Notion clone, not a Jira board. A tool built for orchestrating AI research across branching workstreams
