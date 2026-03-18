---
doc-type: decision
decision: 0002
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
source-initiatives:
  - voice-and-tone
status: accepted
---

> **AI-extracted** from behavioral-engineering.md, voice-and-tone · Awaiting human review

## Context

Agent role definitions needed a principled approach. The industry default is identity-based prompting ("You are an expert senior engineer with 15 years of experience"). Research evidence suggested this approach produces unreliable results.

## Decision

Define agent roles through behavioral constraints, not identity claims. "Defaults to NEEDS WORK, requires evidence for approval" instead of "You are a skeptical reviewer." Three structured fields per role: `disposition` (behavioral posture), `quality-bar` (acceptance criteria), `vibe` (UI display text, never injected as prompt).

Evidence base:
- **Zheng et al. (EMNLP 2024):** Identity role effects are "largely random" across 162 roles and 2,410 questions
- **Anthropic (Feb 2026):** Role assignments activate unpredictable persona clouds beyond what was specified
- **Anthropic Prompt Guide:** Built entirely around behavioral instructions, not identity claims

## Consequences

- Role definitions are testable — behavioral constraints produce measurable outputs
- Agent voice guidelines (`docs/ux/agent-voice.md`) derive naturally from behavioral constraints
- The 11 current roles follow this pattern consistently
- New roles must pass "The Test": if a sentence describes who the agent is, rewrite it as what the agent does
