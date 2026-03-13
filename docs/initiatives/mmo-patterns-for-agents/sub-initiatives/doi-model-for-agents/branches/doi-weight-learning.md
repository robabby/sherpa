---
status: seed
source-iteration: 1
spawned-from: doi-model-for-agents
created: 2026-03-12
priority: medium
---

# DOI Weight Learning: Tuning the Formula from Agent Session Data

## Context

The DOI formula has 6 weights (w1-w6) currently set from theoretical reasoning: w1=0.10 (PageRank), w2=0.25 (graph distance), w3=0.15 (co-change), w4=0.20 (scent), w5=0.20 (interaction), w6=0.10 (decay). Rolfsnes et al. (ASE 2017) proved that ML (random forests) significantly outperforms fixed thresholds for co-change recommendations. The PFIS researchers validated their foraging models against Mylyn interaction traces. The ICSE 2026 Ripple paper showed 380% improvement when LLM change plans inform predictions.

## Question

Can the DOI weights be learned from real agent session traces rather than set manually? What features predict "this file was actually needed for this task"? Can we build a dataset of (task, context, outcome) triples and train a model to optimize context selection?

## Suggested Vectors

1. **Dataset construction** — What does a training example look like? Input: task description + codebase graph + agent event history. Output: which files were actually read/edited during successful task completion. Mining git history + agent logs.
2. **Feature engineering for DOI signals** — Each DOI signal (PageRank, graph dist, co-change, scent, interaction, decay) is a feature. What additional features matter? File size, language, test vs production, number of recent changes, number of authors?
3. **Learning architecture** — Rolfsnes used random forests. Cioni et al. used temporal graph neural networks. Ripple used LLM Chain-of-Thought. What's the right architecture for learning DOI weights? Likely: simple linear regression first (learn weights directly), then graduated complexity.
4. **Decay function learning** — Linear (Mylyn), exponential, logarithmic? The shape may differ by task type (bug fix vs feature). Can we learn task-type-specific decay curves?

## Links

- [Rolfsnes et al. ASE 2017](https://evolveit.bitbucket.io/publications/ase2017/)
- [Cioni et al. 2023 - Temporal GNN](https://www.sciencedirect.com/science/article/abs/pii/S0950584923002239)
- [Yadavally ICSE 2026 - Ripple](https://aashishyadavally.github.io/assets/pdf/pub-icse2026-(2).pdf)
- [CITR EMSE 2024 - Consensus traces](https://link.springer.com/article/10.1007/s10664-024-10528-7)
