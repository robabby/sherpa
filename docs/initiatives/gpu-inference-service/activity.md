---
started: 2026-03-19
worktree: null
---

## Activity Log

- **2026-03-19:** Initiative approved. Research completed on GPU VPS providers and uncensored LLM landscape. Proposal written with GEX44 as Phase 1 target. Investigating system prompt engineering as alternative/complement to abliterated models.
- **2026-03-19:** Deep-dive on model selection — Hermes 4 14B identified as best candidate (natively steerable, RefusalBench SOTA, no abliteration needed). System prompt approach validated over abliterated models.
- **2026-03-19:** Cost analysis completed. Cheapest viable always-on option is Vast.ai RTX 3090 at ~$70/mo. Hetzner GEX44 at ~$200/mo for reliability. Both too expensive for personal AI use case at current stage. **Initiative archived — cost-prohibitive.**

## Seeds

- **Hermes 4 as Luna's model** — If GPU hosting becomes affordable or a free tier emerges, Hermes 4 14B (Q4_K_M) is the model to use. Natively steerable, no abliteration needed, system prompt defines behavior. Research at `research/model-selection.md`.
- **System prompt over abliteration** — Abliterated models degrade tool-calling (critical for OpenClaw). Use natively steerable models (Hermes, Mistral) with behavioral system prompts instead. Validated finding.
- **Ollama Modelfile pattern** — Bake behavioral defaults into `SYSTEM` directive to bypass OpenClaw's `role: "developer"` bug with `reasoning: true`. Ready-to-use Modelfile in research doc.
- **Homelab option** — Used RTX 3090 ($700-800) + cheap host, ~$30-65/mo electricity. Breaks even with cloud in ~14 months. Revisit if personal AI becomes a daily driver.
