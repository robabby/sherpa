---
status: pending
initiative: zero-to-one-experience
created: 2026-03-16
updated: '2026-03-16'
type: new-plan
risk: evolutionary
targets:
  - apps/studio/src/app/page.tsx
  - packages/studio-ui/src/empty-state.tsx
  - packages/studio-ui/src/process-workspace.tsx
  - packages/studio-ui/src/onboarding-flow.tsx        # (new — guided first-run)
  - packages/studio-ui/src/sherpa-arrives.tsx           # (new — "Sherpa arrives equipped" experience)
  - apps/studio/src/app/welcome/                       # (new — first-run route)
dependencies:
  - trails
informs:
  - studio-desktop-app
  - ux-product-personas
personas:
  - product-manager
  - designer
  - engineer
spawned-from: studio-desktop-app
---

# Zero-to-One Experience

## Summary

Design and build the first-run experience for Sherpa — what a new user sees when there is no content, no initiatives, no conventions, no history. The answer is not a blank dashboard or an onboarding wizard. It is "Sherpa arrives equipped": the methodology is visible, the trails are presented, and the user picks a direction. The first collaborative session produces real governance artifacts, and after that session the workspace looks and works like Studio. This applies to both Studio web and the desktop app.

## State Snapshot

**Empty state component** (`packages/studio-ui/src/empty-state.tsx`, 132 lines) is a well-built compound component (`EmptyState`, `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateCommand`, `EmptyStateAction`). Used across multiple pages.

**Process workspace** (`packages/studio-ui/src/process-workspace.tsx:361-374`) has a full-screen empty state: "Start an initiative" with a `/propose` command hint. This is functional but assumes the user knows what an initiative is and how `/propose` works.

**Conventions page** (`apps/studio/src/app/conventions/page.tsx:25-35`) shows "Add a convention" with a filesystem path hint (`.claude/rules/my-rule.md`). Assumes filesystem literacy.

**Skills page** (`apps/studio/src/app/skills/page.tsx:27-37`) shows "Create a skill" with a filesystem path hint. Same assumption.

**Home page** (`apps/studio/src/app/page.tsx`, 362 lines) displays an operational dashboard: "Action Required" (shows "Nothing needs attention" when empty), "Active Work" (shows "No initiatives in progress" / "No tasks running"), and "System Status." No first-run guidance, no onboarding prompt.

**Product personas** (`docs/ux/product-personas.md:13-149`) define three primary personas (Engineer, PM, Designer) with distinct entry points: Engineers are filesystem-native, PMs are Studio-primary. The current blank state makes no distinction — both see the same empty dashboard.

**No onboarding flow exists.** No `/onboarding` route, no first-run detection, no guided tour, no "getting started" experience. Every page independently handles its own empty state with no orchestration across pages.

**The blank state has never been designed** because Sherpa was born from existing content. The governance artifacts already existed when Studio was built. This is the first initiative to confront what Sherpa looks like with nothing in it.

## Proposed Changes

### New: First-Run Detection and Routing

Detect when a workspace has zero content (no initiatives, no conventions beyond defaults, no activity). Route to the welcome experience instead of the operational dashboard. This detection lives in `studio-core` domain logic — a `isFirstRun()` function that checks for the presence of governance artifacts.

### New: Welcome Route (`apps/studio/src/app/welcome/`)

The first-run experience. Not a wizard, not a feature tour. The "Sherpa arrives equipped" moment:

1. **Sherpa's toolkit is visible** — the user sees what Sherpa brings: conventions, governance structure, collaboration methodology. Not as a feature list, but as a tangible toolkit laid out.
2. **Trails are presented** — "I've guided teams through these before." Real patterns from Sherpa Consulting's practice. The user picks one that resonates or describes their own situation.
3. **Guided collaboration begins** — hybrid model in a two-panel layout: collaboration space + artifact space where structure takes shape in real time. The user directs, Sherpa reflects and sharpens, conventions shape the output.
4. **Session produces governance artifacts** — the workspace now has real content. Redirect to the operational dashboard, which is no longer empty.

### New: "Sherpa Arrives" Component (`packages/studio-ui/src/sherpa-arrives.tsx`)

The visual representation of Sherpa arriving equipped. Shows the methodology, the trail options, and the collaboration invitation. Reusable across web and desktop surfaces.

### New: Onboarding Flow Component (`packages/studio-ui/src/onboarding-flow.tsx`)

The guided first collaboration session. Two-panel layout: conversation on the left, artifact taking shape on the right. Conventions visibly shaping the output. This component orchestrates the interaction between the user, the AI provider, and the trail's convention set.

### Modified: Home Page (`apps/studio/src/app/page.tsx`)

Add first-run detection. When `isFirstRun()` returns true, redirect to `/welcome` instead of rendering the operational dashboard. When the user has content, the home page works exactly as it does today.

### Modified: Empty States Across Pages

Update existing empty states to be persona-aware and context-aware. Instead of filesystem path hints (which assume an Engineer), provide guidance appropriate to how the user arrived. An Engineer who set up via CLI sees different empty state messaging than a PM who came through the welcome flow.

## Rationale

**Why "Sherpa arrives equipped" instead of an onboarding wizard:** An onboarding wizard teaches the user about the tool. "Sherpa arrives equipped" teaches the user about their own situation. The distinction matters: wizards are about the product, arrival is about the user. The user's first experience should be having their thinking sharpened, not learning menu navigation.

**Why this is cross-surface:** A new user on Studio web has the same blank state as a new user on the desktop app. The welcome experience should be designed once in `studio-ui` and consumed by both surfaces. The desktop app initiative depends on this — its first-launch experience IS this experience rendered natively.

**Why trails are a hard dependency:** The welcome experience presents trails as the entry point. Without trails defined and loadable, the "Sherpa arrives equipped" moment has nothing to arrive with. The trails initiative must land first.

**Why persona-awareness matters:** An Engineer setting up Sherpa via CLI will encounter the blank state differently than a PM opening Studio for the first time. The welcome flow should recognize this — not by asking "what's your role?" but by detecting how they arrived (CLI setup vs. direct Studio access) and adjusting accordingly.

## Dependencies

- **`trails`** (hard dependency) — The welcome experience presents trails as the entry point. Trails must be defined and loadable before the first-run experience can be built.

## Review Notes

**Key research vectors for `/rr`:**
- First-run experiences in governance/collaboration tools — how Linear, Notion, Obsidian, Basecamp handle the blank state
- Two-panel collaborative UI patterns — conversation + live artifact rendering
- Persona detection without explicit role selection — inferring user type from entry path and behavior

**Open questions:**
- Does the welcome flow require an AI provider to be configured? If yes, the first thing a web user sees is an API key prompt — which contradicts the "Sherpa arrives equipped" feeling. The desktop app solves this with a pre-configured key. Studio web may need a different approach.
- How much of the welcome experience is AI-driven vs. static? The trail picker can be static. The guided collaboration session requires AI. Where's the boundary?
- Should the welcome flow produce a real initiative with full governance artifacts, or a lighter "first project" that introduces concepts gradually?

**Scope boundaries:**
- IN: First-run detection, welcome route, "Sherpa arrives" component, onboarding flow component, persona-aware empty states, home page redirect
- OUT: Desktop-native implementation (that's `studio-desktop-app`), trail definitions (that's `trails`), AI provider setup UI (that's desktop app or a separate concern)

**Effort:** 3-5 sessions
**Session breakdown:**
- Session 1: First-run detection logic, welcome route scaffold, "Sherpa arrives" component design
- Session 2: Trail picker integration (consuming trails from `studio-core`), two-panel layout
- Session 3: Guided collaboration flow — conversation + live artifact rendering
- Session 4: Persona-aware empty state updates across existing pages
- Session 5: Integration testing, edge cases (returning user with deleted content, partial setup states) (if needed)
