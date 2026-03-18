---
doc-type: decision
decision: 0009
authored-by: ai
reviewed-by: null
last-updated: 2026-03-16
source-initiatives:
  - semantic-knowledge-engine
status: accepted
---

> **AI-extracted** from semantic-knowledge-engine · Awaiting human review

## Context

The Semantic Knowledge Engine needed an embedding and summarization backend to power semantic search, relationship inference, and summary hierarchy. Three options existed: algorithmic (TF-IDF + extractive), LLM API (Anthropic/OpenAI/Voyage), and local inference (Ollama). Each has different cost, latency, quality, and dependency profiles.

The project principle of BYOAI (Bring Your Own AI) and the VPS budget strategy (Sherpa runs free/near-free) both pointed toward not requiring any AI service as a hard dependency. At the same time, the stress test confirmed that TF-IDF produces meaningful signal on Sherpa's governance corpus — sqlite-agentic-state ranks #1 for semantic-knowledge-engine, and known relationships consistently appear in top-5 results.

## Decision

Every intelligence feature in Sherpa ships with a pluggable backend interface and a zero-dependency algorithmic default. LLM-powered backends are upgrade paths, not requirements.

Specifics:
- **Interface:** `KnowledgeBackend` with `embed()`, `summarize()`, `cosineSimilarity()`, `buildCorpusIndex()`, `embedWithCorpus()`
- **Default:** `AlgorithmicBackend` — TF-IDF vectors with corpus-aware IDF weighting, extractive summaries from markdown structure (title + status + first sentence per H2)
- **Configuration:** `KnowledgeConfig` in `sherpa.config.ts` with `backend: 'algorithmic' | 'ollama' | 'api' | 'dispatch'`
- **Transparency:** Every MCP tool response includes `backend` and `capabilities` fields so agents know the quality of intelligence available — no silent degradation

This is the BYOAI principle applied to intelligence features: the conventions and query tools are the product; the AI powering similarity and summarization is the engine you plug in.

## Consequences

- Sherpa works fully offline with zero AI service dependencies — algorithmic backend requires no API keys, no network, no GPU
- Quality ceiling exists: TF-IDF similarity ranges 0.05-0.20 on governance corpora, extractive summaries are less polished than LLM-generated ones
- Upgrade path is clear: swap `backend: 'ollama'` in config, get neural embeddings and abstractive summaries without changing any tool interfaces
- Pattern is reusable: any future feature needing AI intelligence (design critique, content scoring, agent evaluation) should follow the same interface + algorithmic default pattern
- Desktop app benefits: the thumb drive test passes because no external service is required
