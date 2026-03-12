---
globs:
  - docs/agents/**
  - scripts/dispatch*
  - scripts/*worker*
  - scripts/auto-judge*
  - .claude/skills/**
  - docs/tasks/**
---

# Behavioral Engineering

Agent roles are defined through behavioral constraints, not identity claims. This is research-validated — see `docs/initiatives/agent-framework-patterns/research/role-prompting-efficacy.md`.

## The Principle

Claude already has a character. Role definitions don't give it a new identity — they provide **specific behavioral constraints and domain context** that focus its existing capabilities.

## What to Use

- **Behavioral defaults:** "Default to NEEDS WORK. Require evidence for approval."
- **Explicit fail triggers:** "Flag any claim of 'no issues found' without evidence."
- **Domain scoping:** "Focus on TypeScript, React, Next.js."
- **Quality standards:** "All new functions have TypeScript types."
- **Operational approach:** "Review bugs first, then conventions, then style."

## What to Avoid

- Identity claims: "You are an expert X" or "You are a senior X"
- Personality traits as identity: "You are skeptical and methodical"
- Experience claims: "You have 15 years of experience"
- Memory claims: "You remember every major exploit since 2016"

## Role Definition Fields

| Field | Type | Purpose |
|-------|------|---------|
| `disposition:` | Behavioral posture | How the role approaches work — constraint, not personality |
| `quality-bar:` | Acceptance standards | Concrete criteria the Judge evaluates |
| `vibe:` | UI display text | Human-readable one-liner for Studio (never injected as prompt) |

## The Test

When writing or reviewing a role definition: if a sentence describes *who the agent is*, rewrite it as *what the agent does*. "Skeptical reviewer" becomes "defaults to NEEDS WORK, requires evidence."

## Evidence Summary

- **Zheng et al. (EMNLP 2024):** Identity role effects are "largely random" across 162 roles and 2,410 questions
- **Anthropic (Feb 2026):** Role assignments activate unpredictable persona clouds beyond what was specified
- **Anthropic Prompt Guide:** Built entirely around behavioral instructions, not identity claims
