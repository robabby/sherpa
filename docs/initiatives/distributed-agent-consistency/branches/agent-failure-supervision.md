---
status: seed
source-iteration: 1
spawned-from: distributed-agent-consistency
created: 2026-03-12
priority: medium
---

# Agent Failure & Supervision Policies

## Context

Erlang/OTP supervision trees map cleanly to AI agent failure scenarios: context window overflow, hallucination, wrong-branch commits, stale state. Akka's agentic platform (2025) and Jido (Elixir) both implement formal supervision for AI agents. Sherpa currently handles failure informally — the human notices and restarts.

## Question

What should a formalized agent supervision system look like for Sherpa? Should restart policies (one-for-one, one-for-all, rest-for-one) be configurable in `sherpa.config.ts`? What failure signals can be detected automatically vs requiring human judgment?

## Suggested Vectors

1. Erlang/OTP supervision patterns applied to LLM agent lifecycles — crash detection, restart strategies, escalation
2. Akka Agentic Platform and Jido supervision implementations — what do production systems actually configure?
3. Agent failure taxonomy — context overflow, hallucination, drift, stale state, wrong-branch commit. Which are detectable?
4. Automatic vs human-in-the-loop failure detection — what can `sherpa watch` detect without LLM inference?

## Links

- [Akka Agentic Platform](https://akka.io/blog/agentic-ai-frameworks)
- [Jido Framework](https://jido.run/docs/getting-started)
- [The Zen of Erlang](https://ferd.ca/the-zen-of-erlang.html)
- [Cemri et al. — Multi-Agent Failure Modes](https://arxiv.org/html/2503.13657v1)
