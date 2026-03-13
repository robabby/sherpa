---
status: seed
source-iteration: 2
spawned-from: agentic-workspace
created: 2026-03-12
priority: high
---

# Agent Identity & Security — Capability-Based Governance for Sherpa

## Context

Iteration 2 vectors 7 and 8 converged on a critical finding: the agent security landscape is in crisis mode (36.82% skills flawed, 8.5% MCP OAuth adoption, 79% passing keys via env vars) while standards are crystallizing fast (NIST three-pillar initiative, IETF OAuth for agents, OWASP Agentic Top 10, Microsoft Entra Agent ID).

The key architectural insight: capability-based security (Tenuo warrants with monotonic attenuation) maps naturally to Sherpa's behavioral definitions. Delegation only narrows authority — exactly how behavioral constraints work. Meanwhile, Microsoft's decision to give every agent its own Entra identity (with org-chart placement, conditional access, lifecycle governance) signals that enterprises treat agents as workforce members.

Sherpa has an opportunity to provide the developer-workflow counterpart: agent identity per worktree, behavioral constraints as capability warrants, signed actions via Gitsign, and PreToolUse hooks for enforcement.

## Question

How should Sherpa implement agent identity and capability-based security? What's the concrete architecture for behavioral definitions → capability warrants → enforcement hooks?

## Suggested Vectors

1. **Capability warrants from behavioral YAML** — How do Sherpa behavioral agent definitions translate to Tenuo-style capability warrants? What's the attenuation model for initiative-scoped delegation?
2. **Agent identity per worktree** — Bot accounts, scoped SSH keys, Gitsign keyless commit signing. What's the concrete setup for giving each Sherpa agent a verifiable identity?
3. **PreToolUse enforcement architecture** — Claude Code hooks as the enforcement layer. What can be enforced at what latency? What's the gap between behavioral definition and runtime enforcement?
4. **MCP server security model** — How should Sherpa's MCP server handle authentication, authorization, and audit? OAuth vs. capability warrants? How does this interact with AgentGateway?
5. **Supply chain security for skills/conventions** — Content hashing, signing, verified publishers for Sherpa marketplace. How do you prevent the ToxicSkills problem?

## Links

- NIST AI Agent Standards Initiative: https://www.nist.gov/caisi/ai-agent-standards-initiative
- OWASP Agentic Top 10: https://owasp.org/
- Snyk ToxicSkills: https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/
- Astrix MCP OAuth study: https://astrix.security/
- Tenuo capability warrants: https://tenuo.io/
- Sigstore A2A: https://sigstore.dev/
- Gitsign: https://github.com/sigstore/gitsign
- Microsoft Entra Agent ID: https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/microsoft-entra-agent-identities-for-ai-agents
- CyberArk AI agent security: https://www.cyberark.com/
- Agent Identity Protocol (AIP): https://aip.dev/
- CSA Agentic Trust Framework: https://cloudsecurityalliance.org/blog/2026/02/02/the-agentic-trust-framework-zero-trust-governance-for-ai-agents
