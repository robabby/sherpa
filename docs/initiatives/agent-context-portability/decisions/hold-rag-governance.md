---
decision: "Hold on RAG-based governance loading — use full prompt injection instead"
date: 2026-03-19
skill: /radar
alternatives-rejected:
  - "Full prompt injection — in Adopt ring; simpler, faster, sufficient at current scale"
confidence: high
kill-criteria: "Reassess when governance corpus exceeds 10K+ documents or when multiple knowledge domains require semantic retrieval"
---

RAG adds embedding pipeline, vector store, and retrieval latency for marginal token savings on a ~5,500 token corpus. Makes sense at 10K+ documents, not 6 files. The ETH Zurich finding that more context can hurt argues for writing better rules, not building smarter retrieval.
