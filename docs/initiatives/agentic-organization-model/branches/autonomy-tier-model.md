---
status: seed
source-iteration: 1
spawned-from: agentic-organization-model
created: 2026-03-12
priority: medium
---

# Autonomy Tier Model

## Context

HAIF framework (arxiv 2602.07641) proposes four autonomy tiers with quantifiable promotion/demotion criteria and a delegation registry. Sherpa already has oversight patterns (morning review, Judge role, integration review, hook enforcement) but no formal model for when an agent can act autonomously vs when it needs human approval. The business workforces (content engine, YouTube pipeline) need clear autonomy levels — some agents should auto-publish low-risk content, others should always require human review.

## Question

How should Sherpa model agent autonomy tiers? What are the promotion/demotion criteria? How does this compose with the existing Planner/Worker/Judge model, morning review, and hook enforcement? Where does autonomy level live — in the role definition, the instance configuration, or both?

## Suggested Vectors

1. **HAIF deep-dive** — Read the full paper. Extract the tier definitions, promotion/demotion metrics, delegation registry design. Evaluate applicability to Sherpa's scale (3-20 agents, not enterprise).
2. **Existing oversight pattern mapping** — Map Sherpa's current oversight mechanisms (Judge verdicts, morning review, hook enforcement, integration review) to autonomy tiers. What already serves as tier-1 (full autonomy) vs tier-4 (human-only)?
3. **Content governance autonomy** — Specific to the blog/YouTube workforces: what content decisions can agents make autonomously? Research topic selection, draft writing, SEO optimization, thumbnail generation — which need approval and which don't?
4. **Dynamic tier adjustment** — Can agents earn more autonomy over time? What metrics would drive promotion (consecutive high-quality outputs, zero escalations, cost efficiency)?

## Links

- [HAIF framework](https://arxiv.org/abs/2602.07641)
- [Saviynt six-stage lifecycle](https://saviynt.com/blog/ai-agent-lifecycle-management)
