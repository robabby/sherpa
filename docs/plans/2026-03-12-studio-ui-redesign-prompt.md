# Studio UI Redesign Prompt

## What This Is

You are redesigning **Sherpa Studio** — a Next.js 16 dashboard that visualizes an agentic collaboration framework. It shows initiatives, research trees, agent roles, task boards, sessions, MCP servers, conventions, and skills. The data comes from filesystem-based governance (markdown files with YAML frontmatter) read at render time.

The user is a single human operator collaborating with AI agents. Studio is their command surface — where they review proposals, approve initiatives, dispatch tasks, and monitor what agents are doing across research branches. Think of it as air-traffic control for a fleet of AI agents working across a shared codebase.

## The Aesthetic Vision

**Three-way blend: Spatial Glass + Luxury Editorial + Mission Ops**

The design language fuses three traditions:

### Layer 1: Spatial Glass (the canvas)
Everything lives on layered translucent surfaces with real depth. Panels are frosted glass with backdrop-blur, stacked at different z-levels. Subtle shadows create parallax between foreground cards and background atmosphere. The page background is not flat black — it has a deep, barely-visible gradient mesh or noise texture that shifts warmly, like looking through dark glass at a distant light source.

Key moves:
- `backdrop-blur-xl` on panels with 60-80% opacity backgrounds
- Layered box-shadows that suggest floating (not the flat `border` look)
- Ambient glow sources behind key panels — not decorative, but creating a sense of light originating from the data itself
- Subtle depth transitions on hover — panels lift slightly with shadow expansion
- Glass panel borders use `border-white/[0.06]` (dark mode) for that barely-there edge catch

### Layer 2: Luxury Editorial (the soul)
Typography and composition borrow from high-end editorial design. A distinctive serif or transitional display typeface for headings. Generous negative space between sections. The grid is not mechanical — it breathes. Column spans are intentionally uneven (5/7, not 6/6). Section labels use refined monospaced caps with ultra-wide tracking, like chapter markers in a design annual.

Key moves:
- **Display font**: Use a distinctive serif for page titles and panel headings. Candidates: `Fraunces` (variable, expressive), `Newsreader` (classical), `Lora` (warm), `Playfair Display` (high contrast), or `Source Serif 4` (clean). Load via Google Fonts. The font should feel authoritative but warm — not cold or corporate.
- **Body font**: Pair with a humanist sans-serif. `DM Sans`, `Plus Jakarta Sans`, `Outfit`, or `General Sans` via Fontshare. NOT Inter, NOT system-ui.
- **Mono font**: `JetBrains Mono`, `IBM Plex Mono`, or `Fira Code` for data readouts and status text. This is where the ops aesthetic lives in the type system.
- Heading sizes have dramatic scale contrast — the page title is very large, panel titles are medium, and data labels are very small. The jump between levels creates visual hierarchy through type alone.
- Whitespace between panels is generous (32-48px gaps). Inside panels, content is dense but well-structured.

### Layer 3: Mission Ops (the function)
Data density and operational clarity. Status uses a color-coded light system: green (active/healthy), amber (needs attention), red/rose (stale/blocked), and cool blue/cyan for informational. Numeric readouts use monospace. Pipeline visualizations show flow, not just counts. The operational pulse at the top of the page should feel like a status bar — always-visible, information-dense, quietly authoritative.

Key moves:
- Status indicators use small filled circles (LED dots), not rounded pill badges
- Numeric values are monospaced and right-aligned in data groups
- Aging indicators (days since update) use progressive color warming: cool gray → amber → rose
- Pipeline charts use thin segmented bars with proportional width, not pie charts
- The "Attention Needed" section should feel urgent but not alarming — amber glow, not red screaming

## Color System

### Background Atmosphere
- Page background: `#08080a` to `#0c0c10` — not pure black, slightly blue-tinted
- A radial gradient mesh (very subtle, 2-3% opacity) centered behind the header area, using warm amber tones
- This creates the sense of a warm light source behind the glass

### Surface Hierarchy (dark mode primary)
| Surface | Background | Blur | Border | Use |
|---------|-----------|------|--------|-----|
| Page | `#08080a` | — | — | Base canvas |
| Panel (primary) | `rgba(255,255,255,0.03)` | `backdrop-blur-xl` | `rgba(255,255,255,0.06)` | Main content panels |
| Panel (elevated) | `rgba(255,255,255,0.05)` | `backdrop-blur-2xl` | `rgba(255,255,255,0.08)` | Hero cards, active items |
| Inset | `rgba(0,0,0,0.2)` | — | `rgba(255,255,255,0.04)` | Nested containers, code blocks |
| Hover | `rgba(255,255,255,0.06)` | — | `rgba(255,255,255,0.10)` | Interactive element hover |

### Semantic Colors
| Role | Color | Use |
|------|-------|-----|
| Active / Healthy | `#34d399` (emerald-400) | Active workstreams, healthy status |
| Needs Attention | `#fbbf24` (amber-400) | Pending review, 3-7 day items |
| Stale / Blocked | `#f87171` (rose-400) | 7+ day stale, blocked items |
| Informational | `#60a5fa` (blue-400) | Counts, metadata, links |
| Session / Agent | `#818cf8` (indigo-400) | Session data, agent activity |
| MCP / Protocol | `#22d3ee` (cyan-400) | MCP server data |
| Accent / Brand | `#d4a574` (warm copper) | Sherpa brand accent, sparingly |

### Glow System
Each panel variant emits a subtle colored glow from its data. The glow is NOT a border — it's a blurred radial behind the panel, as if the data inside is the light source:
- Process panel: warm amber glow
- Sessions panel: indigo glow
- MCP panel: cyan glow
- Activity panel: no glow (neutral)
- Conventions/Skills: very subtle cool glow

Glows should be 3-6% opacity, 80-120px blur radius. They create atmosphere, not distraction.

## Page Structure: Mission Control Dashboard

### Header Zone
```
[STUDIO]                                          <- monospace label, 10px, tracking-[0.3em], muted
Mission Control                                   <- serif display, ~40px, foreground
3 pending review · 3 skills · last activity Mar 11  <- mono, 12px, muted-foreground/50, dot-separated
```

The header has a subtle bottom border that fades from center to edges (gradient border). Below it, a breathing ambient glow (the warm radial mesh).

### Operational Pulse Bar
A single-line status strip below the header. Think Bloomberg terminal ticker or macOS menu bar extras. Fixed, dense, monospaced. Shows: active workstreams count, pending review count, stale count, project count, skill count, last activity date. Segments separated by `·` with generous letter-spacing.

### Panel Grid
The dashboard uses a 12-column grid with intentional asymmetry:

```
Row 1: [Process ····· 5col] [Docs ········· 7col]    <- Primary operational view
Row 2: [Activity Feed ······················ 12col]   <- Full-width timeline
Row 3: [Conventions · 5col] [Skills ······· 7col]    <- Framework configuration
Row 4: [Tasks ······· 5col] [Workforce ···· 7col]    <- Execution layer
Row 5: [Sessions ···· 7col] [MCP ·········· 5col]    <- Infrastructure
Row 6: [Workflow ···· 5col]                           <- Process diagram
```

Panels stagger in on page load (Motion `variants` with 60ms stagger, 300ms duration, subtle y-offset of 8px). The stagger creates a cascade effect — top-left to bottom-right.

### Panel Anatomy
Every panel follows this structure:

```
┌─────────────────────────────────────────┐
│ ▎ PROCESS                    <- label   │  Monospace, 10px, tracking-widest, muted
│ ▎ Initiatives                <- title   │  Serif display, 18-20px
│ ▎                                       │
│ ▎ [content zone]                        │  Flexible, panel-specific
│ ▎                                       │
│ ▎ View all initiatives →     <- footer  │  14px, accent color, arrow animates on hover
└─────────────────────────────────────────┘
```

- The `▎` represents a 2px accent bar on the left edge (top 60%, gradient to transparent)
- Panels have `p-7 sm:p-8` internal padding
- Corner radius: `rounded-xl` (12px)
- The glass surface, blur, and glow are per-variant (see color system)

## Component-Specific Direction

### Process Panel (the hero)
This is the most important panel. It shows:
1. **Hero initiative** — the most recently updated. Left border accent indicates status. Shows title, status LED, momentum badge, summary (1 line), and date in mono.
2. **Attention needed** — items requiring human action. Each row: title (truncated), action label (Review/Integrate) in small caps, age in mono with progressive color.
3. **Pending review** — queued proposals. Simpler rows: title + age.
4. **Pipeline summary** — `3 pending · 0 approved · 0 in progress · 0 integrated` in mono.
5. **Pipeline chart** — thin horizontal segmented bar showing proportional status distribution.

### Docs Panel
Shows document categories as a mini-grid or list. Each category (research, plans, specs, architecture, ux, curation) has a count. If empty, show `0 docs across 0 categories` in a quiet, centered state — not a sad empty state, just calm absence.

### Activity Panel (full width)
A timeline of recent activity entries. Group by date. Each entry has a date label (left), description (right). Use a thin vertical timeline line with dot markers. Entries stagger in. Keep it dense — this is operational log, not a social feed.

### Conventions Panel
Shows rules count, CLAUDE.md count, UX guide count as a metric row. Below, a compact list of rule names. Minimal styling — this panel should feel quiet and infrastructural.

### Skills Panel
Show installed skills with name and description. Project skills vs third-party distinction via a subtle label. Count in the header area.

### Tasks Panel
Kanban-inspired mini view: counts by status (pending, in-progress, completed). If tasks exist, show top 3-5 as compact rows with status LED and title.

### Workforce Panel
Agent roles displayed as compact cards or a list. Show role name, category badge, and model tier. This is the "crew manifest."

### Sessions Panel
The most data-rich panel. Show: total sessions, this week's sessions, total tokens (formatted with K/M suffixes), weekly tokens. Below metrics, a compact list of recent sessions with model, branch, duration, and outcome LED.

### MCP Panel
Shows connected MCP servers with status LEDs (connected/disconnected). Tool count per server. Keep it minimal and operational.

### Workflow Panel
Renders a Mermaid diagram showing the governance workflow. Style the Mermaid output to match the glass/editorial theme (dark background, light text, custom node colors).

## Motion Design

Use Motion (v12) for all animations. The library is already installed.

### Page Load Orchestration
1. Header fades in (opacity 0→1, 300ms)
2. Operational pulse fades in (200ms delay)
3. Panels stagger in (60ms intervals, y: 8→0, opacity: 0→1, 300ms each, `easeOut`)
4. Ambient glow breathes in (600ms, slow ease)

### Interaction Micro-motions
- Panel hover: `translateY(-1px)`, shadow expansion, 200ms ease
- Link arrows: `translateX(3px)` on group hover
- Status LEDs: very subtle pulse animation (2-3% opacity oscillation, 3s cycle) for active items only
- Panel content on first render: no additional animation (the stagger is enough)

### Scroll Behavior
- No parallax (it's a dashboard, not a landing page)
- Panels should not animate on scroll — only on initial page load
- If content overflows a panel, use `overflow-hidden` with a fade-to-transparent mask at the bottom

## Technical Constraints

| Constraint | Value |
|-----------|-------|
| Framework | Next.js 16 (App Router, Server Components) |
| CSS | Tailwind CSS v4 (CSS-based config in globals.css) |
| Components | shadcn/ui (new-york style, Radix UI primitives) |
| Animation | Motion v12 (`motion/react`) |
| Charts | Recharts + D3 modules |
| Icons | Lucide React |
| Fonts | Google Fonts (loaded in layout.tsx or next/font) |
| Mode | Dark mode primary (`.dark` class on `<html>`) |
| Package manager | pnpm monorepo |

### Architecture
- Pages live in `apps/studio/src/app/` (Next.js App Router)
- Domain components live in `packages/studio-ui/src/` (91 components, re-exported via barrel)
- shadcn/ui primitives live in `apps/studio/src/components/ui/`
- Domain types live in `packages/studio-core/src/types.ts`
- CSS theme tokens defined in `apps/studio/src/styles/globals.css`
- The home page (`page.tsx`) is a Server Component that calls filesystem-reading functions and passes data to client components

### Data Model (key types)
```typescript
Initiative { slug, status, type, risk, created, updated, targets, dependencies, title, summary }
Workstream { slug, status, started, worktree, focus, initiative, roles, activityLog }
Session { sessionId, startedAt, model, branch, initiative, tokens, outcome, summary }
AgentRole { slug, displayName, category, modelTier, patterns, structure }
Skill { slug, name, description, isProjectSkill }
Rule { fileName, name, description, globs, alwaysApply }
BranchSeed { slug, status, sourceIteration, priority, title, question, vectors }
```

### Existing Panel Variants
The `HubPanel` component supports 14 variants, each with custom border, glow, and accent colors:
`process`, `portfolio`, `activity`, `docs`, `conventions`, `skills`, `primitives`, `api`, `workforce`, `sessions`, `transit-content`, `tasks`, `mcp`, `workflow`

## What to Avoid

- **System fonts / Inter / Roboto** — the current UI uses `ui-sans-serif, system-ui`. This is the #1 thing that makes it look like a prototype.
- **Flat borders without depth** — the current panels use `border` with no shadow or blur. They look like cards on a table, not glass floating in space.
- **Even column splits** — 6/6 grids are boring. Use 5/7 or 4/8 for visual tension.
- **Oversaturated glows** — the atmospheric effects should be 3-6% opacity. If you can see the glow without squinting, it's too much.
- **Purple gradients on dark backgrounds** — the most cliched AI product aesthetic. Avoid entirely.
- **Excessive border-radius** — `rounded-xl` (12px) max. No pill shapes except for tiny status indicators.
- **Rainbow color coding** — use the semantic color system (emerald/amber/rose/blue). Don't give every panel a different hue at full saturation.
- **Empty state sadness** — when a panel has no data, show a quiet typographic placeholder, not an illustration or emoji.
- **Over-animation** — the page load stagger is the hero moment. Everything else should be subtle 200ms transitions. No bouncing, no spring physics, no gratuitous motion.

## The Feeling

When someone opens Studio, they should feel like they just sat down at a beautifully designed command desk. The glass panels float in space with warm, barely-visible light behind them. The typography is confident and refined — you trust the information because it's presented with authority. The operational data is dense but legible, with color telling you immediately what needs attention. Nothing is decorative for its own sake — every visual element serves orientation, hierarchy, or atmosphere.

It should feel like the intersection of Linear's spatial glass, the typography of Stripe's documentation, and the operational density of a Bloomberg terminal — unified into something that is unmistakably *Sherpa*.
