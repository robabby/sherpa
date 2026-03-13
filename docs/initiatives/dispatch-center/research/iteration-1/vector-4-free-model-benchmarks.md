# Vector 4: Free Model Non-Coding Benchmarks

**Question:** How do Nemotron 3 Super, MiniMax M2.5, and MiMo V2 Flash compare on research and content tasks?
**Agent dispatched:** 2026-03-13

## Findings

### Nemotron 3 Super (120B total / 12B active)
- Context: 1M tokens nominal, 262K practical default
- MMLU-Pro: ~79%, GPQA Diamond: 79.23%
- Arena-Hard V2: 73.88% — weak for chat/instruction tasks (GPT-OSS-120B scores 90.26%)
- HLE (scientific breadth): 18.26% vs Qwen3.5's 25.30%
- Speed: ~449 tok/s — throughput is the headline, not benchmark ceiling
- **Weakness:** Built for agents, not writers. Low chat/instruction-following scores.

### MiniMax M2.5 (230B total / 10B active)
- Context: 200K tokens
- MMLU: 85%, MMLU-Pro: 76.5%, GPQA: 62%
- **IFEval: 87.5%** — strongest instruction-following of the three
- Artificial Analysis Intelligence Index: 42 — highest overall
- **Weakness:** GPQA at 62% weak for deep technical content. Less data on pure summarization.

### MiMo V2 Flash (309B total / 15B active)
- Context: 256K tokens (native 32K, extended)
- **MMLU-Pro: 84.9%, GPQA Diamond: 83.7%** — strongest raw reasoning
- AIME 2025: 94.1%
- **Weakness:** Instruction following "all over the place" per community testing. Unreliable tool calling. Knowledge cutoff Dec 2024. Benchmark scores may not reflect real-world behavior.

### Head-to-Head Summary

| Metric | Nemotron 3 Super | MiniMax M2.5 | MiMo V2 Flash |
|--------|-----------------|-------------|---------------|
| Context | 1M (262K practical) | 200K | 256K |
| MMLU-Pro | ~79% | 76.5% | **84.9%** |
| GPQA | 79.2% | 62% | **83.7%** |
| IFEval | weak (not scored) | **87.5%** | weak (anecdotal) |
| Speed | **~449 tok/s** | fast | 131 tok/s |
| Best for | Agentic workflows, long docs | Instruction-following, structured output | Math/science reasoning |

## Sources

- https://developer.nvidia.com/blog/introducing-nemotron-3-super-an-open-hybrid-mamba-transformer-moe-for-agentic-reasoning/
- https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf
- https://llm-stats.com/blog/research/nemotron-3-super-launch
- https://artificialanalysis.ai/models/nvidia-nemotron-3-super-120b-a12b
- https://www.minimax.io/news/minimax-m25
- https://huggingface.co/MiniMaxAI/MiniMax-M2.5/discussions/3
- https://artificialanalysis.ai/models/minimax-m2-5
- https://github.com/XiaomiMiMo/MiMo-V2-Flash
- https://arxiv.org/abs/2601.02780
- https://www.adwaitx.com/xiaomi-mimo-v2-flash-review-benchmarks/
- https://artificialanalysis.ai/models/comparisons/nvidia-nemotron-3-super-120b-a12b-vs-minimax-m2-5
- https://artificialanalysis.ai/models/comparisons/minimax-m2-5-vs-mimo-v2-flash

## Raw Links

- https://artificialanalysis.ai/articles/nvidia-nemotron-3-super-the-new-leader-in-open-efficient-intelligence
- https://unsloth.ai/docs/models/nemotron-3-super
- https://www.datacamp.com/blog/mini-max-m2-5
- https://deepwiki.com/XiaomiMiMo/MiMo-V2-Flash/5-performance-and-benchmarks
- https://medium.com/@leucopsis/xiaomi-mimo-v2-flash-a-technical-review-6a69e77beecc
- https://huggingface.co/XiaomiMiMo/MiMo-V2-Flash
- https://llm-stats.com/models/compare/mimo-v2-flash-vs-minimax-m2.5

## Open Questions

1. No needle-in-a-haystack or long-context retrieval scores published for any of the three
2. No summarization-specific benchmarks (SCROLLS, QASPER) found
3. MiMo V2 Flash IFEval score not formally quantified — gap vs MiniMax M2.5 unknown
4. MiniMax M2.5 embedding capability not documented
5. Availability of all three on OpenCode Zen needs local verification
