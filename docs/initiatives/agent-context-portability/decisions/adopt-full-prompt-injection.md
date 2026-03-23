---
decision: "Adopt full prompt injection of governance context (~5,500 tokens)"
date: 2026-03-19
skill: /radar
alternatives-rejected:
  - "RAG-based governance loading — in Hold ring; overkill for 6 files"
  - "Tiered/selective injection — in Trial ring; adds complexity without proven payoff at current scale"
confidence: high
kill-criteria: "Reassess when governance context exceeds 15K tokens or when empirical testing shows specific rules degrade specific task types"
---

Inject all governance rules as a single block at the start of every agent task prompt. At ~5,500 tokens (0.3–4.3% of modern context windows), token cost is negligible. Prompt caching reduces cost further (90% Anthropic, 50% OpenAI). Governance-first positioning improves quality up to 30% per Anthropic research.
