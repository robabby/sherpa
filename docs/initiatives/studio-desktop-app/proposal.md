---
status: pending
initiative: studio-desktop-app
created: 2026-03-16
updated: 2026-03-16
type: new-plan
risk: structural
targets:
  - apps/studio-desktop/                          # (new — Swift/SwiftUI macOS app)
  - packages/studio-core/src/trails/              # (new — trail definitions + registry)
  - packages/studio-core/src/git/                 # (new — hidden git layer)
  - packages/studio-core/src/sync/               # (new — offline-first sync)
  - packages/studio-core/src/permissions/         # (new — application-level permissions)
dependencies:
  - semantic-knowledge-engine
informs:
  - sherpa-framework-extraction
  - ux-product-personas
personas:
  - product-manager
  - designer
spawned-from: null
---

# Studio Desktop App

## Summary

Build a platform-native desktop application (Swift/SwiftUI on macOS) that provides the same Sherpa governance engine as Studio web, optimized for portability and ease-of-use. The app must pass the "thumb drive test": install on any machine, launch, and demonstrate value in under 60 seconds. Convention-first, BYOAI (Bring Your Own AI), progressive trust model. The product is the conventions and methodology; the AI is the engine you plug in.

## State Snapshot

**Studio app** (`apps/studio/`) is a Next.js 16.1.1 web application using React 19.2.3, Tailwind v4, and shadcn/ui. Build output is web-only. The `next.config.ts` uses `withSherpa()` wrapper from `@sherpa/studio`. No desktop framework exists in the repo.

**Framework extraction** (`sherpa-framework-extraction`) is in-progress at iteration 4. The `@sherpa/studio-*` packages have been extracted: `studio-core` (domain logic, governance, task board), `studio-ui` (91 React components), `studio-mcp` (MCP server), `studio-cli` (scaffold + sync). The framework is designed for white-label consumption via `defineConfig()` and vocabulary theming.

**Product personas** (`docs/ux/product-personas.md`) defines three core personas (Engineer, Product Manager, Designer) with second-wave candidates (Marketing, DevOps/SRE, Executive, Legal) that have no persona definitions yet. The desktop app is a forcing function for defining these.

**Semantic knowledge engine** does not exist as an initiative yet. The SQLite + embeddings + summary hierarchy architecture is the local-first data layer. Hard dependency — must be designed before the desktop app's file-access permission layer can ground collaboration in user context.

**Competitive landscape** (`agentic-workspace` research): Claude Cowork launched Jan 2026 as a desktop agent. Dorothy ships as Electron. Desktop agents are now a first-class product category. Key differentiator: competitors are AI-first (the AI is the product). Sherpa is convention-first (the methodology is the product, AI is the engine).

**Blank state gap:** Studio has never been designed for a true 0→1 experience. The app was born from existing content — governance artifacts already existed. The desktop app forces the first design of what Sherpa looks like with nothing in it.

## Design Principles

### The Thumb Drive Test

The core design constraint. Imagine carrying Sherpa on a thumb drive, walking into any business — a 5-person local shop or a Fortune 500 boardroom — and demonstrating value immediately. Every design decision must pass this test. If a feature doesn't serve the thumb drive demo, it waits.

### Convention-First, Not Chat-First

Sherpa is not a chatbot. Open-ended AI conversations are unproductive — conventions are what make Human+AI collaboration work. The first thing a user should feel isn't "I'm talking to an AI" but "I've entered a system that knows how to work with me." The AI carries the load; the conventions shape the output.

### Sherpa Arrives Equipped

A Sherpa in the Himalayas doesn't ask "where do you want to go?" They show up with tools, knowledge of the terrain, and a yak to carry the heavy load. They assess the climber and start moving. The desktop app works the same way: it arrives with the methodology visible, demonstrates it already knows the terrain, and the user directs where they're headed.

### Same System, Different Surface

The desktop app and Studio web are two entry points to the same governance engine. A user who starts on desktop and opens Studio in a browser should think "same place, different door." Platform-native UI is about feel and performance, not different functionality.

### BYOAI (Bring Your Own AI)

Sherpa standardizes around the Anthropic ecosystem but supports local models, on-prem, and OpenAI. The conventions are the product. The AI provider is a configuration choice. For demos, a pre-configured API key ships on the thumb drive — zero setup friction.

## Proposed Changes

### New: Platform-Native macOS App (`apps/studio-desktop/`)

A Swift/SwiftUI application — not a webview wrapper, not Electron, not Tauri. Built from the ground up as a native macOS citizen. Small binary (~20-50MB), instant launch, feels like it belongs on the platform. Communicates with `studio-core` domain logic via a shared protocol (the same governance engine Studio web uses).

- **Native UI** — SwiftUI views that map to Studio's component library but feel like macOS. Platform conventions (menu bar, keyboard shortcuts, window management) respected.
- **Sandboxed storage** — Artifacts live "in Sherpa" by default. Users don't think about files. Under the hood: markdown + git, discoverable when the user is ready.
- **macOS permission model** — File access, network, notifications all go through native permission dialogs. Trust escalates naturally.
- **Thumb-drive portable** — Can run from external media without installation for demos. Full install via `.dmg` for ongoing use.

### New: Trails System (`packages/studio-core/src/trails/`)

Trails are real patterns from Sherpa Consulting's engagement experience — routes the Sherpa has guided before. They are not templates or contrived categories. Trails emerge from practice and accumulate as the consulting practice encounters new terrain.

- **Trail definitions** — Each trail encodes a pattern (e.g., "scaling a team and losing coordination"), the conventions appropriate for that journey, and the governance structure it produces.
- **Trail registry** — Trails registered in `studio-core`, available to both web and desktop surfaces.
- **First-launch experience** — The user sees trails Sherpa has guided before and picks the one that resonates (or describes their own). Sherpa loads the right conventions and starts moving immediately.
- **Living artifact** — The trail library grows as Sherpa Consulting's practice grows. The product reflects real experience, never hypothetical categories.

### New: First-Launch Experience (Convention-First Onboarding)

The blank state is solved by the Sherpa arriving equipped, not by an empty dashboard or an open prompt. First launch:

1. **Sherpa's toolkit is visible** — conventions, governance structure, methodology. The user sees what Sherpa brings before they contribute anything.
2. **Trails presented** — "I've guided teams through these before." Real patterns, not a feature tour.
3. **User picks a direction** — selects a trail or describes their own situation.
4. **Guided collaboration begins** — hybrid model. User directs, Sherpa reflects and sharpens, conventions shape output. Two-panel layout: collaboration space + artifact space where structure takes shape in real time.
5. **Session produces governance artifacts** — initiative, state snapshot, next moves. The workspace now looks and works like Studio.

### New: Hidden Git Layer (`packages/studio-core/src/git/`)

Application-managed git invisible to the end user. The user sees "version history" and "undo," not branches and commits.

- **Auto-commit engine** — Debounced commits on file change, meaningful auto-generated messages.
- **Sync protocol** — Push/pull when connected, queue when offline, conflict resolution with full history preserved.
- **History UI adapter** — Translates git log into user-facing version timeline.

### New: Progressive Trust / Permission Escalation (`packages/studio-core/src/permissions/`)

Permission grants unlock visible step-changes in value. Each level is complete, not crippled.

- **Level 0 — Zero trust:** Everything lives "in Sherpa." No file access, no network beyond AI provider. Fully functional. This is the thumb drive demo.
- **Level 1 — File access:** User grants folder access (native OS permission dialog). Sherpa reads existing documents, grounds collaboration in real context. The step-change: "You saw what Sherpa does from a conversation. Now watch what happens when it sees what you're working with."
- **Level 2 — Team:** Shared workspaces. Roles (Viewer, Contributor, Approver). Sync becomes relevant. Governance enforcement at the application layer.
- **Level 3 — Integrations:** Slack, email, calendar. Each a permission the user grants when ready.

### New: Offline Sync Engine (`packages/studio-core/src/sync/`)

Offline-first data synchronization for Level 2+ (team features). Works with the hidden git layer:

- **Connectivity detection** — Automatic online/offline mode switching.
- **Sync queue** — Queues operations during offline periods, replays on reconnect.
- **Conflict resolution** — Deterministic merge strategy for concurrent edits across devices.

## Rationale

**Why platform-native:** A 20MB native app on a thumb drive versus a 500MB Electron bundle is the difference between "let me show you something" and "give me 10 minutes to install this." Native apps launch instantly, respect platform conventions, and feel like they belong. The thumb drive test demands this.

**Why convention-first:** The open-ended AI conversation is the status quo — and it's unproductive. Sherpa's entire value proposition is that conventions make Human+AI collaboration work. The desktop app must demonstrate this from the first interaction. If it launches into a blank chat prompt, it's just another chatbot in a window.

**Why trails:** The Sherpa metaphor isn't decorative. A real Sherpa arrives with knowledge of the terrain, assesses the climber, and guides them on a trail they've walked before. Trails encode Sherpa Consulting's real engagement experience into the product. The consulting practice and the product are the same thing — trails are how that coherence manifests.

**Why BYOAI:** Sherpa is not an AI company. It's a conventions, governance, and methodology company that leverages AI. Locking users into a single AI provider contradicts the thesis. Anthropic is standardized and recommended; everything else is supported.

**Why not mobile:** Mobile is a consumption surface, not a governance production surface. Screen real estate and input precision matter for the workflows this serves.

## Dependencies

- **`semantic-knowledge-engine`** (hard dependency, does not yet exist) — The local-first data layer (SQLite + embeddings + summary hierarchy) that powers Level 1+ file-access grounding. Without it, Sherpa can't learn from user context. The zero-trust Level 0 experience works without it, but the progressive trust escalation requires it.

- **`sherpa-framework-extraction`** (informs, in-progress) — Package boundaries (`studio-core`, `studio-ui`, etc.) define the shared protocol between web and desktop surfaces. Extraction is at iteration 4; boundaries are stable enough to design against.

- **`ux-product-personas`** (informs) — The desktop app targets second-wave personas (Marketing, Legal, Executive) that don't have definitions yet. Those definitions shape onboarding flows, trail selection, and UI prioritization.

## Review Notes

**Key research vectors for `/rr`:**
- Swift/SwiftUI architecture for governance-heavy apps — data binding, state management, CoreData vs. SQLite, sharing domain logic with a TypeScript web app
- Cross-platform shared protocol — how `studio-core` (TypeScript) communicates with a native Swift app. Options: embedded JS runtime, REST API, shared SQLite, compiled WASM
- Git-for-non-technical-users patterns — how Obsidian Sync, Linear, Notion handle versioning invisibly
- Enterprise desktop distribution — MDM deployment, `.dmg` signing, notarization pipeline
- Trail system design — how to encode engagement patterns as reusable, composable convention bundles

**Open questions:**
- **Cross-platform protocol:** The biggest architectural question. Studio web runs on `studio-core` (TypeScript). The native macOS app is Swift. How do they share the governance engine? Options range from embedding a JS runtime in the native app to exposing `studio-core` as a local API.
- **Windows/Linux:** macOS first via Swift/SwiftUI. What's the path for other platforms? Separate native apps (C#/WinUI, GTK)? Or does the web Studio serve non-Mac users until native apps are justified?
- **Trails as convention bundles:** How are trails defined? Are they code, configuration, markdown? How does a new trail get added when the consulting practice encounters a new pattern?
- **AI integration surface:** Cowork-style (visual, embedded) vs. Claude Code-style (terminal, power-user) vs. both. How does the AI collaboration appear within the native app?

**Scope boundaries:**
- IN: Native macOS app, trails system, first-launch experience, hidden git, progressive trust permissions, offline sync, thumb-drive portability
- OUT: Mobile, Windows/Linux (later phase), hosted SaaS, embedded AI inference (beyond knowledge engine), human-only mode (conventions require AI)

**Trade-offs:**
- Platform-native means building separate apps per platform instead of one cross-platform codebase. This is slower but produces a better product. macOS first; other platforms are future phases.
- The cross-platform shared protocol (Swift ↔ TypeScript `studio-core`) is the highest-risk architectural component. The wrong choice here creates maintenance burden across every feature.
- Trails that feel natural and emergent are hard to engineer. Over-systematizing them risks making them feel like templates. Under-systematizing them risks inconsistency across the product.

**Effort:** 10-14 sessions (after dependencies land)
**Session breakdown:**
- Sessions 1-2: `/rr` research — Swift/SwiftUI architecture, cross-platform protocol options, trail system design
- Session 3: `/shape` — Appetite, scope, rabbit holes, protocol decision
- Session 4: `/design` — Architecture, component mapping (SwiftUI ↔ Studio UI), data flow, prototype
- Sessions 5-6: Native macOS shell + cross-platform protocol (Swift app, `studio-core` bridge)
- Sessions 7-8: Trails system + first-launch experience (trail definitions, convention loading, onboarding flow)
- Sessions 9-10: Hidden git layer + sandboxed storage ("in Sherpa" artifact management)
- Sessions 11-12: Progressive trust permissions + offline sync
- Sessions 13-14: `.dmg` packaging, thumb-drive mode, notarization, polish (if needed)
