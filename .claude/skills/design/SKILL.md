---
name: design
description: Use when a shaped initiative needs architecture decisions, component boundaries, data flow design, or a UI prototype before implementation begins. Produces design.md and optional prototype.html.
---

# Design

Architecture and UI design before implementation. Reads the shape, reads the codebase, produces a design document and optional living prototype. The last step before `/plan-tasks`.

## When to Use

- A shaped initiative needs technical design before tasks are dispatched
- Architecture decisions (data models, APIs, component boundaries) aren't obvious from the shape
- UI work is involved and layout/component choices should be validated before building
- A complex initiative needs a design review checkpoint

## The Protocol

### Step 1: Read the Context

Read the initiative's full artifact chain:

- `docs/initiatives/<slug>/proposal.md` — what and why
- `docs/initiatives/<slug>/shape.md` — appetite, boundaries, rabbit holes, no-gos
- `docs/initiatives/<slug>/stake.md` — chosen direction (if exists)
- `docs/initiatives/<slug>/spike.md` — feasibility results (if exists)
- `docs/initiatives/<slug>/research/` — technical findings

Then read the codebase:

- Existing patterns in the areas the initiative touches
- Component structure, data models, API conventions
- Integration points with existing code

### Step 2: Classify the Design

| Type | When | Output |
|------|------|--------|
| **Architecture only** | No UI changes, or UI is trivial | `design.md` |
| **UI only** | Architecture is obvious, UI needs validation | `design.md` + `prototype.html` |
| **Both** | Non-trivial architecture + UI | `design.md` + `prototype.html` |

### Step 3: Architecture Design (if needed)

Design the technical architecture. Cover:

**Data models** — new types, schema changes, relationships. Show TypeScript interfaces or Zod schemas matching existing patterns.

**Component tree** — new components, where they live, what they receive as props. Show the hierarchy, not implementation.

**API / data flow** — how data moves through the system. Server components vs client, data fetching strategy, state management.

**Integration points** — where new code connects to existing code. Which existing modules are touched and how.

**File plan** — exact files to create and modify, organized by package/app. This becomes the input for `/plan-tasks`.

Keep architecture decisions connected to the shape's boundaries:
- Rabbit holes from the shape → design around them
- No-gos from the shape → don't design for them
- Kill criteria from the shape → design for measurability

### Step 4: UI Prototype (if needed)

Build a standalone HTML page that answers: "Does this layout and component choice feel right?"

**The prototype is:**
- A single HTML file: `docs/initiatives/<slug>/prototype.html`
- Uses the app's Tailwind config (CDN link + theme variables)
- Uses shadcn/ui component patterns (visual fidelity, not actual imports)
- Interactive enough to feel real (hover states, click handlers, tab switching)
- Static data — no API calls, no real state management

**The prototype is NOT:**
- A production component
- A full app with routing
- A bundled build
- A specification (the design.md is the specification)

**What to prototype:**
- Layout and spacing decisions
- Component selection (which shadcn components, how composed)
- Information hierarchy (what's prominent, what's secondary)
- Interaction patterns (expandable sections, tabs, modals)
- Responsive behavior (if relevant)

### Step 5: Review Checkpoint

Present both artifacts to the human:

**Design review:**
- Key architecture decisions and their rationale
- Component boundaries — where one component ends and another begins
- Data flow — the happy path from user action to rendered result
- Risks — what could go wrong with this design

**Prototype review (if applicable):**
- Open the HTML file in a browser
- Walk through each section
- Highlight design choices that need validation
- Note where the prototype diverges from what would be built (prototype simplifications)

Wait for feedback. The design may need iteration before proceeding to `/plan-tasks`.

## Output

### design.md

Write `docs/initiatives/<slug>/design.md`:

```yaml
---
designed: YYYY-MM-DD
type: architecture | ui | both
components-new: N
components-modified: N
files-planned: N
---
```

Sections:

1. **Overview** — what's being designed, link to shape
2. **Architecture** (if applicable)
   - Data Models
   - Component Tree
   - Data Flow
   - Integration Points
3. **UI Design** (if applicable)
   - Layout
   - Component Selection
   - Interaction Patterns
4. **File Plan** — exact files to create/modify, grouped by package
5. **Decisions** — architecture decisions made during design, with rationale
6. **Open Questions** — things that can't be resolved until implementation

### prototype.html

When UI work is involved, write `docs/initiatives/<slug>/prototype.html`.

Template structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Initiative] — Prototype</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          // Match app's theme variables
        }
      }
    }
  </script>
  <style>
    /* shadcn/ui-like component styles */
  </style>
</head>
<body>
  <!-- Prototype content -->
</body>
</html>
```

## Decision Records

Architecture decisions made during design go to `docs/initiatives/<slug>/decisions/`:

```yaml
---
decision: "Architecture decision description"
date: YYYY-MM-DD
skill: /design
alternatives-rejected:
  - "Alternative — why rejected"
confidence: high | medium | low
kill-criteria: "When to revisit"
---
```

## Rules

- **Read the shape first.** Design within the shape's boundaries. If the shape says no-go, don't design for it.
- **Match existing patterns.** New components follow existing conventions. Don't invent new patterns without justification.
- **File plan is concrete.** Every file in the plan has a clear purpose. No "utils.ts" placeholders.
- **Prototype is disposable.** It validates layout and interaction, then gets replaced by real components. Don't over-invest.
- **Decisions are explicit.** Every "I chose X over Y" gets a rationale. Future you needs to know why.
- **Design for the appetite.** If the shape says 3 sessions, the design must be buildable in 3 sessions. Flag if it can't be.

## Invocation

**As a skill:** `/design` or `/design <initiative-slug>`

**Standalone prompt:**

```
Design the <initiative-name> initiative.
Read the shape, design the architecture and UI, produce design.md and prototype.html.
```
