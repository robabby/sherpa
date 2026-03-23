# Iteration 1 — 2026-03-18

## Findings

### Vector 1: AGENTS.md Standard Landscape
**Question:** Is AGENTS.md a real standard or wishful thinking?
**Full report:** [iteration-1/vector-1-agents-md-standard-landscape.md](iteration-1/vector-1-agents-md-standard-landscape.md)

- AGENTS.md is real and well-adopted: 60K+ projects, Linux Foundation stewardship (AAIF), supported by 10+ coding tools
- Claude Code is the only major holdout (3,264-upvote issue, no official response)
- ETH Zurich (Feb 2026): LLM-generated context files *hurt* performance. Human-written help only ~4%. Lesson: non-inferable details only
- Every tool retains its own native format AND reads AGENTS.md as the cross-tool baseline

**Implications:** Symlink approach is the correct tactical move. Content should follow "non-inferable details only" principle.

### Vector 2: Multi-Agent Governance Patterns
**Question:** Has any framework solved portable governance across heterogeneous agents?
**Full report:** [iteration-1/vector-2-multi-agent-governance-patterns.md](iteration-1/vector-2-multi-agent-governance-patterns.md)

- No production framework has solved this. CrewAI, AutoGen, LangGraph, Swarm — all use per-agent config, none has shared governance
- Anthropic's own multi-agent system uses per-task prompt engineering from the orchestrator
- Academic GaaS paper: runtime enforcement layer that intercepts outputs, validates against declarative rules, tracks trust scores
- MCP Resources could serve governance docs but can't enforce compliance

**Implications:** Prompt injection is the universal mechanism. Sherpa's Judge role is an embryonic GaaS layer.

### Vector 3: Context Injection Strategies
**Question:** Full-file injection vs. selective/RAG/tiered?
**Full report:** [iteration-1/vector-3-context-injection-strategies.md](iteration-1/vector-3-context-injection-strategies.md)

- ~5,500 tokens total — well within safe zone for all modern models, negligible with prompt caching
- Position matters more than size: governance at start, task at end (30% quality improvement per Anthropic)
- Multi-turn degradation is real (39% drop) but repeating key constraints recovers 85%
- RAG is overkill for 6 files. Tiered injection is a refinement, not a requirement
- System prompt is correct placement when available

**Implications:** Full injection is fine to start. Graduate to tiered only if empirical testing shows specific rules are unnecessary for certain task types.

### Vector 4: Convention Sync & Drift Detection
**Question:** How to keep generated governance file in sync with source rules?
**Full report:** [iteration-1/vector-4-convention-sync-drift-detection.md](iteration-1/vector-4-convention-sync-drift-detection.md)

- Regenerate-and-diff is the dominant pattern (Kubernetes, Go, GraphQL Codegen)
- Embedded source hash in generated file enables lightweight staleness checks
- Codified Context paper: agents "trust documentation absolutely" — stale context is more dangerous for agents than for humans
- Content hashing > timestamps for cross-machine reliability

**Implications:** Generator script needs a `--check` flag. Embed SHA256 of source files in the generated header. Pre-commit hook to catch staleness.

## Synthesis

Three cross-cutting insights that no single vector produced alone:

**1. The two-surface model is validated and should be explicit.** AGENTS.md is the cross-tool lingua franca (simple markdown, 60K+ projects). `.claude/rules/` with glob scoping is a Claude Code-specific power feature with no cross-tool equivalent. These are two different surfaces serving two different needs. The governance context file (`sherpa-governance.md`) is a *third* surface — assembled content for injection into task prompts, distinct from both AGENTS.md (which is directory-scoped navigational context) and `.claude/rules/` (which is behavior-scoped conditional loading). The plan should acknowledge all three surfaces and their distinct roles.

**2. Start simple, add sophistication based on evidence.** Full injection works at ~5,500 tokens. Tiered injection is academically supported but introduces complexity (task-type → rule mapping) with unclear payoff. The ETH Zurich finding — that more context can hurt — argues for *less* governance content rather than *smarter* governance loading. The right move: ship full injection, measure Luna's convention adherence, only add tiering if specific rules demonstrably don't help for specific task types.

**3. The Judge role is the real enforcement surface, not prompt injection.** Every framework and every paper converges on the same insight: prompt injection is advisory, output validation is enforcement. Sherpa already has the Planner/Worker/Judge pipeline. The GaaS paper's declarative rules + trust scoring maps directly to the Judge. Rather than optimizing *how much* governance to inject (tiering, RAG), the higher-leverage investment is making the Judge validate against governance rules as structured acceptance criteria. This is a future initiative — the current scope is correctly limited to injection.

## Proposals Generated

The existing proposal is validated by research with minor refinements:

1. **AGENTS.md symlink convention** — validated as the community standard workaround. No changes needed.
2. **Governance context file** — validated. Refinements: add `--check` flag, embed source hash, position at prompt start.
3. **Task prompt injection** — validated. Full injection at ~5,500 tokens is safe. System prompt when available, user prompt fallback. Add governance reminder for multi-turn tasks.
4. **Skills translation** — correctly deferred. No framework has solved cross-runtime skill portability.

Plan refinements written to `plan.md` separately.

## Open Questions for Next Iteration

1. **Empirical convention adherence testing** — Which specific governance rules does Luna follow well vs. poorly without injection? This determines the minimum viable governance set and validates the full-injection approach.
2. **Judge-as-governance-enforcer** — Should the Judge validate against governance rules structurally (checking frontmatter, directory conventions, provenance) rather than relying on the Worker to self-comply? This is the GaaS insight applied to Sherpa.
3. **Cross-model governance drift** — Does the same governance markdown produce different behavioral outcomes across Claude, GPT, Gemini, and open models? If so, backend-specific governance variants may be needed.
4. **MCP governance server** — Should `studio-mcp` expose governance rules as MCP Resources? This would let any MCP-connected agent pull governance context without filesystem access.
5. **AAIF convergence timeline** — Will AAIF standardize scoped/conditional rules (like `.claude/rules/` glob patterns)? Monitoring this determines whether Sherpa should invest in its own cross-tool conditional loading or wait for a standard.
