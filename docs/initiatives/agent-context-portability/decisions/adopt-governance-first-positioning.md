---
decision: "Adopt governance-first prompt positioning for all agent task prompts"
date: 2026-03-19
skill: /radar
alternatives-rejected:
  - "Governance at end of prompt — contradicts Lost in the Middle research; governance is reference, not instruction"
  - "Governance interleaved with task context — splits attention, worst of both worlds"
confidence: high
kill-criteria: "Reassess if a model architecture emerges that doesn't exhibit the U-shaped retrieval curve"
---

Place governance block at the very start of the prompt, task instructions at the very end. Stanford's Lost in the Middle research and Anthropic's explicit recommendation both support this ordering (up to 30% quality improvement). For multi-turn tasks, repeat critical constraints before the final instruction to recover ~85% of multi-turn degradation.
