---
radar: 2026-03-19
domain: "Approaches to portable agent governance across heterogeneous AI coding agent backends"
items-classified: 16
adopt: 4
trial: 4
assess: 4
hold: 4
---

# Agent Context Portability — Technology Radar

## Domain

Approaches to making agent governance context (behavioral rules, conventions, quality gates) portable across heterogeneous AI coding agent backends. Classified now because Sherpa has completed its first research iteration and needs actionable guidance before implementation begins.

**Reassess by:** 2026-06-19 or when AAIF publishes its first specification update, whichever comes first.

---

## Adopt

Items to use now. Evidence supports them. Low risk.

### AGENTS.md Symlink Convention

**What:** Symlink `AGENTS.md → CLAUDE.md` at every level of the repository, giving non-Claude-Code agents the same navigational context.

**Ring:** Adopt (new)

**Why:** AGENTS.md is adopted by 60K+ open source projects, stewarded by the Agentic AI Foundation (Linux Foundation) with Anthropic, OpenAI, Google, Microsoft, and AWS as platinum members. 10+ coding tools read it natively. Claude Code is the only major holdout (3,264-upvote issue, no official response). The symlink approach is the community-standard workaround — when Claude Code adds native support, symlinks become redundant, not broken.

**Key consideration:** Content is identical to CLAUDE.md, so Claude Code-specific references (slash commands, `.claude/` paths) appear in AGENTS.md. This is harmless noise. If content divergence becomes a real problem, graduate to a generator script — but don't over-optimize before evidence says to.

### Full Prompt Injection (~5,500 tokens)

**What:** Concatenate all governance rule files into a single block and inject at the start of every agent task prompt.

**Ring:** Adopt (new)

**Why:** Sherpa's governance layer is ~5,500 tokens across 6 files — 0.3–4.3% of modern context windows (128K–2M). Chroma research shows degradation starts at 100K+ tokens; at 5,500, there's zero signal loss. With Anthropic's 90% prompt caching discount, the per-task cost is negligible. Claude shows the slowest context decay and lowest hallucination rates among tested models.

**Key consideration:** Position governance at the very start of the prompt, task instructions at the very end. Anthropic's own research shows up to 30% quality improvement from this ordering. For multi-turn tasks, repeat critical constraints before the final instruction — this recovers ~85% of accuracy lost to multi-turn degradation (39% average drop without repetition).

### Regenerate-and-Diff with Embedded Hash

**What:** Detect governance file staleness by regenerating from source rules, diffing against the committed file, and embedding SHA256 hashes in the generated file header.

**Ring:** Adopt (new)

**Why:** Dominant drift detection pattern across mature ecosystems. Kubernetes uses `hack/verify-codegen.sh` (temp worktree → generate → check `git status`). Go uses `go generate && git diff --exit-code`. GraphQL Codegen has a built-in `--check` flag. Content hashing is strictly superior to timestamps — timestamps break on git checkout, cache restores, and cross-machine transfers. The Codified Context paper (2026) warns that agents "trust documentation absolutely" — stale governance context is more dangerous for AI agents than stale docs are for humans.

**Key consideration:** The generator script needs a `--check` flag for CI validation. Embed a composite SHA256 of all source rule files in the generated header so staleness checks can run without invoking the full generator.

### Governance-First Prompt Positioning

**What:** Place governance context at the very beginning of agent prompts, with task-specific instructions at the end.

**Ring:** Adopt (new)

**Why:** Stanford's "Lost in the Middle" research demonstrates a U-shaped retrieval curve — models retrieve best from the beginning and end of context, worst from the middle. Anthropic explicitly recommends longform reference data at the top, queries at the end, citing up to 30% quality improvement. This is not a Sherpa-specific finding — it's a universal property of transformer attention.

**Key consideration:** This is a constraint on how `worker.sh` assembles prompts, not on governance content itself. The governance block goes first, then any task-specific context, then the task instruction last.

---

## Trial

Promising. Run a spike before committing.

### Tiered/Selective Injection

**What:** Instead of injecting all governance rules into every task, inject only rules relevant to the task type — e.g., initiative-convention only for initiative tasks, provenance only for docs tasks.

**Ring:** Trial (new)

**Why:** Academically supported and intuitively reasonable. Claude Code's `.claude/rules/` glob-scoped loading is the canonical implementation. LangChain uses middleware-based dynamic injection. Google ADK has `request_processors` with `include_contents` knobs. A tiered model (Tier 1: always-inject behavioral core ~1,500 tokens; Tier 2: conditional by task type; Tier 3: on-demand/skill-triggered) could reduce noise and improve signal.

**What to spike:** Does omitting specific rules for specific task types measurably improve or degrade output quality? Start by running identical tasks with full vs. tiered injection and measuring convention adherence. If full injection works equally well (the ETH Zurich finding that less context can help argues both ways), the complexity of maintaining a task-type→rule mapping isn't justified.

### Judge-as-Governance-Enforcer (GaaS Pattern)

**What:** Evolve Sherpa's existing Planner/Worker/Judge pipeline so the Judge validates task output against governance rules structurally — checking frontmatter, directory conventions, provenance — rather than relying on Workers to self-comply.

**Ring:** Trial (new)

**Why:** Every framework and every paper converges on this: prompt injection is advisory, output validation is enforcement. The GaaS paper (arXiv 2508.18765) describes a runtime enforcement layer with declarative JSON rules, trust factor scoring, and three enforcement modes (coercive/normative/adaptive). Sherpa's Judge already exists and already evaluates task output. The delta is making its checks governance-aware rather than ad hoc.

**What to spike:** Define 3–5 governance rules as structured acceptance criteria (e.g., "initiative proposals must have valid YAML frontmatter with all required fields"). Run the Judge against 10 completed tasks. Measure how many governance violations it catches vs. misses vs. false-positives.

### MCP Resources for Governance Distribution

**What:** Expose governance rules as MCP Resources via `studio-mcp`, allowing any MCP-connected agent to pull governance context without filesystem access.

**Ring:** Trial (new)

**Why:** MCP Resources can serve governance docs as read-only data to any connected client. This eliminates the filesystem-access requirement that currently limits governance portability. The `studio-mcp` server already exists. However, MCP Resources cannot enforce compliance — they're a distribution mechanism, not an enforcement mechanism.

**What to spike:** Add governance rules as Resources to `studio-mcp`. Test whether Luna (OpenClaw) can pull and apply them via MCP rather than filesystem reads. Measure latency and reliability vs. file-based injection.

### Pre-Commit Hook for Staleness Detection

**What:** A pre-commit hook that runs the governance generator in `--check` mode whenever `.claude/rules/*.md` files are staged, failing the commit if the assembled governance file is stale.

**Ring:** Trial (new)

**Why:** Proven CI integration point. Catches staleness at commit time rather than at task dispatch time. The Kubernetes pattern validates this approach at scale. The question isn't whether it works — it's whether the developer experience is acceptable (hook latency, false positives when rules are intentionally being updated).

**What to spike:** Implement the hook. Measure execution time. Verify it doesn't trigger when only non-rule files are staged. Test the escape hatch for intentional rule changes (stage rules and governance file together).

---

## Assess

Interesting but unproven for Sherpa's needs. Revisit next cycle.

### AAIF Conditional Rule Standardization

**What:** The Agentic AI Foundation may standardize scoped/conditional rules (analogous to `.claude/rules/` glob patterns) as part of the AGENTS.md specification.

**Ring:** Assess (new)

**Why:** AAIF has Anthropic, OpenAI, Google, Microsoft, and AWS as platinum members. If they standardize conditional rule loading, Sherpa's tiered injection becomes unnecessary — a standard mechanism would handle it. But AAIF is new (December 2025) and has published no specification updates yet. The timeline is unknown.

**Reassessment trigger:** AAIF publishes a specification draft that includes scoped or conditional rules.

### Agent Constitution Framework (ACF)

**What:** Academic framework (arXiv 2510.13857) proposing an "Instruction Set Architecture" for agents with five operational cores including a non-bypassable Normative Core, plus Instruction Bindings for cross-model portability.

**Ring:** Assess (new)

**Why:** Architecturally interesting — the Normative Core concept maps to what the Judge could become, and Instruction Bindings address the cross-model portability question directly. But it's an academic paper with no production implementation. The concepts may inform Judge evolution in a future initiative.

**Reassessment trigger:** A production framework implements ACF concepts, or Sherpa's Judge initiative needs a formal enforcement model.

### Cross-Model Governance Format Testing

**What:** Empirically test whether the same governance markdown produces different behavioral outcomes across Claude, GPT, Gemini, and open models.

**Ring:** Assess (new)

**Why:** An open question from iteration 1 with real implications — if models interpret governance text differently, backend-specific variants may be needed, undermining the "single assembled file" approach. But Sherpa currently dispatches primarily to Claude (local) and OpenClaw (Claude-based), so cross-model divergence isn't an active problem yet.

**Reassessment trigger:** Sherpa adds a non-Claude backend (Gemini, GPT, open model) to regular dispatch rotation.

### Multi-Level Value Alignment Mapping

**What:** Academic framework (arXiv 2506.09656) defining macro (universal), meso (industry), and micro (task-specific) alignment levels where higher levels constrain lower ones.

**Ring:** Assess (new)

**Why:** Maps conceptually to Sherpa's structure: `.claude/rules/` as macro, `sherpa.config.ts` as meso, `docs/tasks/` as micro. Validates the architectural instinct. But it's a conceptual validation without an implementation path — Sherpa doesn't need a formal alignment hierarchy to ship governance portability.

**Reassessment trigger:** Sherpa onboards its first customer (WavePoint) and needs to distinguish platform-level vs. customer-level governance rules.

---

## Hold

Evaluated and explicitly not using. Documented reasons.

### RAG-Based Governance Loading

**What:** Use embeddings and vector search to retrieve only the most relevant governance rules for each task, rather than injecting all rules.

**Ring:** Hold (new)

**Why:** Overkill for 6 files totaling ~5,500 tokens. RAG adds an embedding pipeline, a vector store, and retrieval latency for marginal token savings on a corpus that fits comfortably in any modern context window. RAG makes sense at 10K+ documents. At 6 documents, full injection is simpler, faster, and more reliable. The ETH Zurich finding that more context can hurt argues for *less content*, not *smarter retrieval* — the right response is to write better governance rules, not to add infrastructure.

**Use instead:** Full prompt injection (Adopt ring). Graduate to tiered injection (Trial ring) only if specific rules demonstrably hurt specific task types.

### Per-Agent Configuration Pattern (CrewAI/AutoGen/Swarm)

**What:** Define behavioral constraints per-agent through framework-specific configuration (role/goal/backstory in CrewAI, system_message in AutoGen, instructions in Swarm).

**Ring:** Hold (new)

**Why:** No production multi-agent framework has solved portable governance. CrewAI, AutoGen, LangGraph, Swarm, and Google ADK all use per-agent config. Shared memory stores task outputs, not behavioral rules. FSM graphs govern workflow (who speaks when), not behavior (how to act). Anthropic's own multi-agent system uses per-task prompt engineering from the orchestrator. This is what Sherpa is solving, not adopting — the research confirms Sherpa's assembled-governance-file approach is ahead of the field.

**Use instead:** Assembled governance file with prompt injection (Adopt ring). The governance layer is authored once and injected into all backends.

### LLM-Generated Context Files

**What:** Use an LLM to automatically generate or maintain AGENTS.md / CLAUDE.md files from codebase analysis.

**Ring:** Hold (new)

**Why:** ETH Zurich research (February 2026, arXiv 2602.11988): LLM-generated context files *reduce* task success by ~3% and *increase* cost by 20%. Human-written files improve success by only ~4%. The finding is clear — context files should contain only truly non-inferable details that an agent cannot derive from reading the codebase itself. Generating these files from the codebase defeats the purpose.

**Use instead:** Human-written governance rules following the "would removing this cause mistakes?" test (CLAUDE.md authoring standards). The generator script assembles human-written rules; it doesn't generate them.

### Evolving Constitutions (Genetic Programming for Norms)

**What:** Academic approach (arXiv 2602.00755) using genetic programming to evolve behavioral norms for multi-agent systems, achieving 123% improvement over human-designed baselines.

**Ring:** Hold (new)

**Why:** Fascinating research, wrong tool for Sherpa. Sherpa's governance rules must be human-auditable, human-modifiable, and deterministic. Evolved norms are opaque — you can't review what the genetic algorithm produced and decide "yes, this captures our initiative convention." The 123% improvement applies to cooperative game environments, not to declarative governance over coding agents. Additionally, the finding that minimal communication outperformed verbose coordination is already captured in the ETH Zurich guidance (non-inferable details only).

**Use instead:** Human-authored governance rules with Judge-based enforcement (Trial ring). The quality improvement comes from enforcement, not from generating better rules.

---

## Sources

All classifications draw from iteration 1 research (2026-03-18):

- [Vector 1: AGENTS.md Standard Landscape](research/iteration-1/vector-1-agents-md-standard-landscape.md)
- [Vector 2: Multi-Agent Governance Patterns](research/iteration-1/vector-2-multi-agent-governance-patterns.md)
- [Vector 3: Context Injection Strategies](research/iteration-1/vector-3-context-injection-strategies.md)
- [Vector 4: Convention Sync & Drift Detection](research/iteration-1/vector-4-convention-sync-drift-detection.md)
- [Iteration 1 Synthesis](research/iteration-1.md)
