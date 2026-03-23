# Vector 3: Context Injection Strategies

**Question:** Is full-file injection the right approach for governance context, or are there better patterns (selective injection, RAG, tiered)?
**Agent dispatched:** 2026-03-18

## Findings

**Token cost of Sherpa's governance context: ~5,500 tokens across 6 files.** This is 0.3-4.3% of modern context windows (128K-2M). Trivially small. With prompt caching (Anthropic 90% discount, OpenAI 50%), cost per task is negligible.

**Full injection is acceptable but refinable:**

- Chroma research: degradation starts at 100K+ tokens. At ~5,500, well within safe zone. ([research.trychroma.com/context-rot](https://research.trychroma.com/context-rot))
- Claude shows slowest decay and lowest hallucination rates among tested models
- Multi-turn penalty: 39% average performance drop across models — repeating key constraints restores ~85% of lost accuracy

**Position matters more than size:**

- "Lost in the Middle" phenomenon: U-shaped performance — best retrieval from beginning and end, worst from middle. ([Stanford research](https://the-decoder.com/large-language-models-and-the-lost-middle-phenomenon/))
- Anthropic explicitly recommends: longform data at top, queries at end — up to 30% quality improvement. ([Anthropic prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices))
- **Governance at the very start, task instruction at the very end.**

**Selective/conditional injection patterns exist:**

- Claude Code's `.claude/rules/` with glob-scoped paths is the canonical example — rules load only when relevant files are touched
- LangChain: middleware injects compliance constraints dynamically based on jurisdiction/context
- Google ADK: `request_processors` pipeline injects context before model invocation with `include_contents` knobs
- Event-driven rules: trigger/condition/action patterns (Rick Hightower's context engineering)

**RAG is overkill for 6 governance files.** RAG adds embedding pipeline, vector store, and retrieval latency for marginal token savings on a ~5,500 token corpus. Makes sense at 10K+ documents, not 6 files.

**System prompt vs. user prompt:** System prompt is correct for governance. All providers treat system messages with higher priority. For backends without system message support, prepend to user message. Claude Code actually delivers CLAUDE.md content as a user message — works in practice.

**Tiered injection is the recommended pattern:**
- Tier 1 (always): behavioral-engineering, effort-estimation, quality essentials (~1,500 tokens)
- Tier 2 (conditional on task type): initiative-convention for initiative tasks, provenance for docs tasks, directoturtle when creating files
- Tier 3 (on-demand/skills): deep reference content loaded when invoked

## Sources

- [Chroma context rot research](https://research.trychroma.com/context-rot)
- [Anthropic prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Stanford Lost in the Middle](https://the-decoder.com/large-language-models-and-the-lost-middle-phenomenon/)
- [Claude Code memory docs](https://code.claude.com/docs/en/memory)
- [LangChain context engineering](https://docs.langchain.com/oss/python/langchain/context-engineering)
- [Google ADK context-aware agents](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/)
- [Redis context engineering](https://redis.io/blog/context-engineering-best-practices-for-an-emerging-discipline/)
- [GPT-5 prompting guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide)
- [Anthropic prompt caching](https://medium.com/ai-software-engineer/anthropic-just-fixed-the-biggest-hidden-cost-in-ai-agents-using-automatic-prompt-caching-9d47c95903c5)
- [Context rot — multi-turn](https://www.emergentmind.com/topics/context-degradation-in-large-language-models)

## Implications

- Full injection at ~5,500 tokens is safe — no need to over-optimize
- Position governance at prompt start, task instruction at prompt end
- Tiered injection is a refinement, not a requirement — start with full injection, graduate to tiered if token budget becomes tight
- Prompt caching makes the static governance prefix nearly free
- For long-running tasks, repeat critical constraints before final instruction (85% recovery)
- RAG is wrong tool for this scale

## Open Questions

1. Which specific rules cause the most drift when omitted? (needs empirical testing)
2. Do different backends respond differently to same governance markdown? (XML vs markdown vs plain text)
3. Concatenation order within governance block — most critical rules first?
4. Minimal "governance reminder" for multi-turn tasks?
