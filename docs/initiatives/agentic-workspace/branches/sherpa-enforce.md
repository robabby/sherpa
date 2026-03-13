---
status: seed
source-iteration: 3
spawned-from: agentic-workspace
created: 2026-03-12
priority: high
---

# sherpa-enforce — Runtime Enforcement via Claude Code Hooks

## Context

Iteration 3 research confirmed that convention-based governance (CLAUDE.md, AGENTS.md, SOUL.md) is necessary but not sufficient. The LGA paper (arXiv 2603.07191) proves soft conventions are bypassed by prompt injection — achieving 93-98% interception only with independent judge model verification. EU AI Act (Aug 2026) demands "human oversight with intervention capability." Sherpa defines policy (behavioral definitions, initiative lifecycle, conventions) but has no enforcement mechanism — policy without enforcement is advisory.

Claude Code's hooks system provides `PreToolUse` interception points that execute before tool calls. A `sherpa enforce` hook could read behavioral definitions and block non-compliant tool calls, closing the soft/hard governance gap without building a full runtime.

## Question

Can Claude Code `PreToolUse` hooks validate agent actions against Sherpa behavioral definitions with acceptable latency, reliability, and false-positive rates — and if so, what's the concrete enforcement architecture?

## Suggested Vectors

1. **Claude Code hooks deep dive** — What can `PreToolUse` hooks access? What's the execution model? Latency constraints? Can they read `.claude/rules/` files? Can they call an LLM (judge model)?
2. **Agent OS (imran-siddique) integration** — Can Sherpa behavioral definitions compile to Agent OS YAML policies? Sub-millisecond enforcement at runtime?
3. **OPA/Rego for agent governance** — Can Rego-style policy language express behavioral constraints? What's the agent governance policy DSL landscape?
4. **False-positive mitigation** — How do you tune enforcement to avoid blocking legitimate actions? Confidence thresholds? Allowlists? Graduated enforcement (warn → require-approval → block)?

## Links

- [LGA paper](https://arxiv.org/html/2603.07191) — Four-layer defense-in-depth governance architecture
- [Agent OS](https://github.com/imran-siddique/agent-os) — Kernel-level governance with sub-ms enforcement
- [Agentic Trust Framework](https://cloudsecurityalliance.org/blog/2026/02/02/the-agentic-trust-framework-zero-trust-governance-for-ai-agents) — Zero Trust for agents
- [OWASP Agentic Top 10](https://owasp.org/www-project-top-10-for-agentic-applications/) — Agent security taxonomy
- iteration-3/vector-4-where-governance-sits.md
- iteration-3/vector-7-governance-regulatory-requirements.md
