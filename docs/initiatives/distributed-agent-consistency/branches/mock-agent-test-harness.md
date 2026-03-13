---
status: seed
source-iteration: 1
spawned-from: distributed-agent-consistency
created: 2026-03-12
priority: high
---

# Mock Agent Test Harness

## Context

Jido's principle — "agents must be architecturally correct WITHOUT LLMs before they can be correct WITH LLMs" — applies directly to Sherpa's consistency layer. The atomic writes, ETags, version vectors, JSONL events, and coordination locks must all work correctly under concurrent access from deterministic mock agents before real Claude instances are involved.

## Question

How should Sherpa's consistency layer be tested? Can we build a test harness that spawns N mock agents performing concurrent filesystem operations, verifying that conflicts are detected, locks are respected, and events are ordered correctly — without any LLM inference?

## Suggested Vectors

1. Existing test harnesses for distributed filesystem operations — how do databases test concurrency? (jepsen.io, loom)
2. Property-based testing for concurrent file access — can we use fast-check/hypothesis to generate concurrent agent scenarios?
3. Deterministic mock agents — what's the minimal interface an "agent" needs to implement for consistency testing?
4. Race condition reproduction — can we use controlled scheduling (like Loom for Java) to deterministically trigger concurrent writes?

## Links

- [Jepsen — Distributed Systems Testing](https://jepsen.io/)
- [fast-check (TypeScript property-based testing)](https://github.com/dubzzz/fast-check)
- [Loom (Java concurrency testing)](https://github.com/tokio-rs/loom)
- [Jido — Architecture-first principle](https://github.com/agentjido/jido)
