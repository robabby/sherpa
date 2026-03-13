---
status: seed
source-iteration: 1
spawned-from: doi-model-for-agents
created: 2026-03-12
priority: medium
---

# Agent Foraging Theory: IFT Applied to AI Tool-Call Patterns

## Context

Iteration 1 established that no published research applies Information Foraging Theory to AI agent tool-call patterns, despite striking parallels (grep/glob = between-patch navigation, file reads = entering patches, edits = highest-DOI events). The PFIS model predicts human navigation better than a second programmer using TF-IDF scent + call-graph spreading activation. Developers are systematically suboptimal foragers (>50% suboptimal navigation per Piorkowski et al. 2016). Agents following DOI would skip the dead ends — but agents also face harder constraints (no visual scanning, no spatial memory, hard context limits).

## Question

Can we formally model AI agent tool-call patterns using information foraging theory? What is "optimal foraging" for an agent with a finite context window? Can IFT predict which tool-call sequences lead to task success vs. failure?

## Suggested Vectors

1. **Agent session trace analysis** — Collect tool-call sequences from Claude Code sessions. Map to foraging patterns: between-patch navigation (search), within-patch foraging (read), patch leaving (switching files), diet breadth (which search results to read). Compare to human developer traces from the PFIS literature.
2. **Optimal foraging for context windows** — Apply the Marginal Value Theorem to context window management. When should an agent stop reading a file and move on? When should context be compacted? The MVT predicts: leave when marginal gain drops to the average rate across the environment.
3. **Scent computation for agents** — LLM semantic understanding is richer than TF-IDF for computing scent. But LLM inference is expensive. Can we precompute scent using embeddings (cheap) and use LLM reasoning only for ambiguous cases (expensive)?
4. **SWE-grep as an existence proof** — Cognition's SWE-grep learned optimal foraging via RL (8 parallel searches per turn, max 4 turns). What does its learned policy tell us about optimal agent foraging? Can we extract the implicit scent function?

## Links

- [Pirolli & Card 1999](https://psycnet.apa.org/record/1999-11924-001)
- [Lawrance et al. TSE 2013 - PFIS](https://web.engr.oregonstate.edu/~burnett/Reprints/TSE-IFT-2013-asprinted.pdf)
- [Piorkowski et al. FSE 2016](https://dl.acm.org/doi/10.1145/2950290.2950302)
- [SWE-grep (Cognition)](https://cognition.ai/blog/swe-grep)
- [PFIS3 source code](https://github.com/IFT-SE/pfis3)
