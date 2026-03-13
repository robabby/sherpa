---
status: seed
source-iteration: 1
spawned-from: behavioral-agents
created: 2026-03-11
priority: medium
---

# Cross-Tool Export System

## Context

agency-agents' growth (29.9k stars) was fueled by `convert.sh` supporting 8 tool formats. Sherpa's behavioral decomposition has a structural advantage: decomposed fields can be reassembled into any format, while the reverse (decomposing a freeform string) is an NLP problem.

## Question

What export targets should Sherpa support, and what's the transformation logic from behavioral YAML fields to each target format?

## Suggested Vectors

1. **Target format inventory** — What are the current agent definition formats for Claude Code (.claude/rules), Cursor (.mdc), CrewAI (agents.yaml), SoulSpec (SOUL.md + AGENTS.md), Windsurf, Gemini CLI? What fields map where?
2. **agency-agents convert.sh deep dive** — Detailed analysis of their 480-line conversion script. What's smart, what's fragile, what can we learn?
3. **Loss analysis** — When converting behavioral fields to a freeform `instructions` string, what information is lost? Can round-trip fidelity be maintained?

## Links

- agency-agents convert.sh: https://github.com/msitarzewski/agency-agents/blob/main/scripts/convert.sh
- CrewAI agent format: https://docs.crewai.com/concepts/agents
- SoulSpec: https://soulspec.org
