---
decision: "AI SDK backends are additive alongside CLI backends, not replacements"
date: 2026-03-14
skill: /shape
alternatives-rejected:
  - "Replace CLI backends with AI SDK equivalents — rejected because CLI tools have autonomous capabilities (file editing, context management, session persistence) that raw API calls don't provide"
  - "AI SDK only, deprecate CLI dispatch — rejected because commanding all CLI tools from one app is core customer value"
confidence: high
kill-criteria: "Revisit if CLI tools gain SDK equivalents that match their full capability set (e.g., Claude Agent SDK matures to full parity)"
---

## Context

Research (iteration 1) confirmed that the AI SDK covers all 5 provider backends but cannot replicate the autonomous capabilities of CLI tools. Rob's strategic direction: CLI dispatch is core value that gets passed to customers. AI SDK is additional value layered on top.

## Decision

The dispatch system supports two backend types (`cli` and `api`) as peers. CLI backends continue to shell out to installed tools. API backends use the AI SDK's `generateText()`/`streamText()`. Both appear in the Dispatch Center UI with clear labeling. Neither type is preferred — routing decides based on task-type and available backends.

## Consequences

- Backend type is a first-class concept in the type system and UI
- No existing scripts modified
- Users always see which type they're dispatching to
- Future Claude Agent SDK work is a separate initiative, not an extension of this one
