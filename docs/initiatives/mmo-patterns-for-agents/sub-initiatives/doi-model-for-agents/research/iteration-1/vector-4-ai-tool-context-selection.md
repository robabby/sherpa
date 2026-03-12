# State of the Art: Context Selection in AI Coding Tools

**Research date:** 2026-03-12
**Scope:** How Cursor, Windsurf, Augment, Claude Code, Copilot, Aider, Cline, Amazon Q, OpenAI Codex, and Roo Code select context for AI-assisted coding.

---

## Key Discoveries

### Three Paradigms of Context Selection

Every tool falls into one (or a blend) of three fundamental approaches:

1. **Embedding-based RAG** (Cursor, Windsurf, Augment, Amazon Q) -- Index the codebase into vector embeddings, retrieve semantically similar chunks at query time.
2. **Agentic tool-use** (Claude Code, Cline, OpenAI Codex CLI, Roo Code) -- Give the LLM search/read tools and let it discover context iteratively through tool calls.
3. **Graph-based ranking** (Aider) -- Build a dependency graph of files and identifiers, rank with PageRank, fit top-ranked items into token budget.

No tool uses a Degree of Interest (DOI) model. The closest analog is Aider's PageRank personalization, which boosts files the user has explicitly added to chat (weight x50 for references from chat files, +100 personalization for mentioned files).

### Tool-by-Tool Findings

---

#### 1. Claude Code

**Paradigm:** Agentic tool-use (no pre-built index).

- Claude Code has **no codebase index**. It does not embed or pre-index files. Instead, it gives the model tools (Glob, Grep, Read, Bash) and lets it discover context through iterative tool calls. ([How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works))
- **CLAUDE.md files** are loaded at session start from multiple locations: project root, `.claude/CLAUDE.md`, user home `~/.claude/CLAUDE.md`, managed policy paths, and ancestor directories. Subdirectory CLAUDE.md files load on-demand when Claude reads files in those directories. ([Memory docs](https://code.claude.com/docs/en/memory))
- **`.claude/rules/`** files use YAML `paths:` frontmatter with glob patterns to scope rules to specific file types. Rules without `paths:` load unconditionally. Path-scoped rules trigger when Claude reads matching files, not on every tool call. ([Memory docs](https://code.claude.com/docs/en/memory#organize-rules-with-clauderules))
- **Auto memory** (`MEMORY.md`) stores learnings across sessions. First 200 lines loaded at session start. Topic files loaded on-demand. Stored in `~/.claude/projects/<project>/memory/`. ([Memory docs](https://code.claude.com/docs/en/memory#auto-memory))
- The agentic loop has three phases: **gather context, take action, verify results**. For exploration, the system prompt instructs Claude to use the Task tool with `subagent_type=Explore` rather than running search commands directly. ([System prompt analysis](https://github.com/Piebald-AI/claude-code-system-prompts))
- **Compaction** triggers at ~92% context window usage. CLAUDE.md survives compaction (re-read from disk). Conversation instructions may be lost. ([PromptLayer analysis](https://blog.promptlayer.com/claude-code-behind-the-scenes-of-the-master-agent-loop/))
- **Subagents** get fresh context windows -- they load CLAUDE.md and system prompt but NOT the parent conversation. Only their final response returns to the parent. This is explicit context isolation. ([How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works))
- Anthropic chose **regex search (ripgrep) over embeddings** after benchmarks showed superior performance with lower operational complexity. ([Introl blog](https://introl.com/blog/claude-code-cli-comprehensive-guide-2025))
- **18 built-in tools** organized into five categories: file operations, search, execution, web, and code intelligence. ([How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works))
- The system prompt is **modular** with 110+ strings, including specialized sub-agent prompts for Plan (685 tokens), Explore (517 tokens), Verification (2453 tokens), and Security Review (2607 tokens). ([Piebald-AI system prompts](https://github.com/Piebald-AI/claude-code-system-prompts))

**Implicit DOI:** The tool-call pattern IS the interest model. Files Claude searches for, reads, and edits accumulate in the conversation as tool results. "Interest" is expressed through the model's own decisions about what to search for next, informed by what it found previously. There is no explicit scoring -- the LLM's attention mechanism implicitly weights context.

---

#### 2. Cursor

**Paradigm:** Embedding-based RAG with semantic search.

- **Codebase indexing** begins automatically when a project is opened. Files are split into semantically meaningful chunks using AST-based splitting (tree-sitter parses source into syntax trees, splitting at function/class boundaries). ([Engineer's Codex](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast), [Cursor docs](https://docs.cursor.com/context/codebase-indexing))
- Chunks are **encrypted locally** and sent to Cursor's server with **obfuscated file paths**. The server computes embeddings (OpenAI embedding model or proprietary). Embeddings stored in **Turbopuffer** (serverless vector DB backed by AWS S3). ([Engineer's Codex](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast))
- **Privacy**: File paths split by `/` and `.`, segments encrypted with client-side keys derived from recent commit hashes. Actual code never stored server-side -- only embeddings and obfuscated metadata. ([Cursor security](https://www.cursor.com/en/security))
- **Query pipeline**: User query -> embedding -> Turbopuffer nearest-neighbor search -> returns obfuscated paths + line ranges -> client reads actual code locally -> code sent as LLM context. ([How Cursor indexes](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast))
- **HyDE (Hypothetical Document Embeddings)**: Cursor uses an LLM to generate a hypothetical answer to the query, then embeds THAT for search -- the intuition being the hypothetical answer's embedding is closer to relevant code than the raw query. ([BitPeak deep dive](https://bitpeak.com/how-cursor-works-deep-dive-into-vibe-coding/))
- **Reranking** occurs after initial retrieval to reorder context items by relevancy before sending to the LLM. ([Gonzalo Mordecki](https://medium.com/@gonzalo.mordecki/reranking-vs-embeddings-on-cursor-a2d728ba67dd))
- **Incremental updates** every 10 minutes via Merkle tree hash comparison to detect changed files. ([Engineer's Codex](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast))
- **@-references**: `@codebase` triggers full semantic search; `@file` includes specific file; `@folder` includes directory contents. ([Cursor docs](https://cursor.com/docs/context/codebase-indexing))
- **.cursorrules** (now `.cursor/rules/`) for persistent project instructions, similar to CLAUDE.md. Supports path-based scoping and "Apply intelligently" rules. ([Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html))

**Known failures**: Shallow context selection when users don't specify files explicitly. `@codebase` uses a smaller model to summarize files, leading to incomplete coverage for complex projects. Files >600 lines poorly covered. Can reference wrong project in multi-project workspaces. ([Cursor forum](https://forum.cursor.com/t/tired-of-cursor-not-putting-what-you-want-into-context-solved/75682), [LandOfGeek](https://www.landofgeek.com/posts/cursor-ai-review-context-limitations))

**Implicit DOI:** Semantic similarity score from embedding search is the de facto "interest" score. HyDE augments this by transforming user intent into code-space proximity. No temporal decay, no user-interaction weighting.

---

#### 3. Windsurf (Codeium) / Cascade

**Paradigm:** Embedding-based RAG + real-time action tracking (hybrid).

- **Five-layer context assembly pipeline** ([MarkAICode](https://markaicode.com/windsurf-flow-context-engine/)):
  1. Load rules (global `.windsurfrules`, then project-level)
  2. Load relevant Memories (persistent facts from previous sessions)
  3. Read open files (active file = highest weight; other tabs included)
  4. Run codebase retrieval via **M-Query** (proprietary retrieval method, 768-dimensional embeddings)
  5. Read recent actions (file edits, terminal commands, navigation history from current session)
- **M-Query** is Windsurf's proprietary retrieval method that improves precision over basic cosine similarity, specifically designed to reduce hallucination rates vs naive RAG. ([MarkAICode](https://markaicode.com/windsurf-flow-context-engine/))
- **Static vs dynamic context**: Codebase indexing = static; Cascade's action tracking = dynamic. Cascade tracks edits, commands, conversation history, clipboard, terminal output to infer intent in real-time. ([Windsurf docs](https://docs.windsurf.com/windsurf/cascade/cascade))
- **Memories** persist across sessions, encoding decisions and discoveries. Can be auto-generated or manually created. "Stale Memories are worse than no Memories." ([MarkAICode](https://markaicode.com/windsurf-flow-context-engine/))
- **Tab completions** use a separate, latency-optimized context (cursor position + current file + nearby symbols) optimized for <100ms, while Cascade uses the full five-layer pipeline. ([MarkAICode](https://markaicode.com/windsurf-flow-context-engine/))
- `.codeiumignore` controls which files are indexed (similar to `.gitignore`). ([Windsurf docs](https://docs.windsurf.com/windsurf/cascade/cascade))
- Up to **20 tool calls per prompt** including Search, Analyze, Web Search, MCP servers, and terminal. ([Windsurf docs](https://docs.windsurf.com/windsurf/cascade/cascade))

**Implicit DOI:** The five-layer pipeline is the closest existing analog to a DOI model. Active file gets highest weight (focal interest). Open tabs = nearby interest. M-Query retrieval = semantic interest. Action history = temporal/behavioral interest. Memories = persistent interest. This is a multi-signal interest model, but it's hardcoded rather than computed as a continuous function.

---

#### 4. Augment Code

**Paradigm:** Full codebase semantic indexing with dependency graph analysis.

- **Context Engine** indexes entire codebases in real-time, including commit history, cross-repo dependencies, and architectural patterns. Handles **400,000+ files** with ~6 minute initial index time and 45-second incremental updates. ([Augment context engine](https://www.augmentcode.com/context-engine))
- Uses **custom embedding and retrieval models trained in pairs** for maximum quality (not off-the-shelf embeddings). ([Codacy interview](https://blog.codacy.com/ai-giants-how-augment-code-solved-the-large-codebase-problem))
- Understands **semantic relationships**: call graphs, dependency chains, shared libraries. Can map entire request paths (e.g., React app -> Node API -> payment service -> database -> webhooks). ([Augment context engine](https://www.augmentcode.com/context-engine))
- **Relevance scoring** with confidence percentages (87-94% shown in demos). Token-aware curation: compresses 4,456 sources down to 682 relevant entries. ([Augment context engine](https://www.augmentcode.com/context-engine))
- **Coordinator/specialist agent architecture**: Coordinator agent plans tasks, specialist agents receive both the files they need AND the semantic relationships those files have with the broader codebase. ([Codacy](https://blog.codacy.com/ai-giants-how-augment-code-solved-the-large-codebase-problem))
- Augment topped **SWE-Bench Pro** with their "Auggie" agent, specifically because the Context Engine found relevant code through semantic relationships rather than keyword matching. ([Augment blog](https://www.augmentcode.com/blog/auggie-tops-swe-bench-pro))
- Plans "Context as an API" allowing programmatic integration of custom context sources. ([Codacy](https://blog.codacy.com/ai-giants-how-augment-code-solved-the-large-codebase-problem))

**Implicit DOI:** Augment's approach is the richest "interest model" in the market. Semantic dependency graphs encode structural interest (what code is related). Confidence scoring is explicit interest quantification. Cross-repo awareness extends the interest model beyond a single repository. However, it's still query-driven -- there's no persistent user-attention tracking like Windsurf's action history.

---

#### 5. GitHub Copilot (Workspace + Agent Mode)

**Paradigm:** Multi-strategy retrieval (code search + semantic search + LSP + agent mode).

- **Copilot Workspace** (sunset May 2025, evolved into Copilot Coding Agent): Used a multi-step workflow: task -> specification (current state + desired state) -> plan (files to create/modify/delete) -> implementation. Users could steer at spec and plan stages. Powered by GPT-4o. ([GitHub Next](https://githubnext.com/projects/copilot-workspace/), [User manual](https://github.com/githubnext/copilot-workspace-user-manual))
- File selection used "a combination of LLM techniques and traditional code search." Users could adjust via "View references" button or by mentioning file names in natural language. ([User manual](https://github.com/githubnext/copilot-workspace-user-manual/blob/main/tips-and-tricks.md))
- **VS Code Copilot** context uses parallel strategies ([VS Code docs](https://code.visualstudio.com/docs/copilot/reference/workspace-context)):
  - GitHub's code search (for remote repos)
  - Local semantic search (for non-GitHub repos)
  - Text-based file-name and content search
  - Language intelligence (IntelliSense/LSP) for symbol resolution and cross-file references
- **Local indexing**: Automatic for <750 files, on-demand for 750-2500 files, basic fallback for >2500 files. ([VS Code docs](https://code.visualstudio.com/docs/copilot/reference/workspace-context))
- **Agent/Plan mode**: Performs autonomous multi-round targeted searches for coordinated cross-file changes. ([VS Code docs](https://code.visualstudio.com/docs/copilot/reference/workspace-context))
- `#codebase` reference enables workspace-wide code search. If results exceed context window, "only the most relevant parts are kept." ([VS Code docs](https://code.visualstudio.com/docs/copilot/reference/workspace-context))
- **Copilot Coding Agent** (GA September 2025) inherited the sub-agent architecture and issue-to-PR workflow from Workspace, running as an async background agent. ([GitHub community](https://github.com/orgs/community/discussions/142971))

**Implicit DOI:** Multi-signal retrieval (semantic + keyword + LSP) is a form of multi-dimensional interest scoring. The plan step in Workspace was essentially a human-editable interest declaration -- "these are the files I'm interested in modifying." LSP integration provides structural interest (call hierarchies, type hierarchies).

---

#### 6. Aider

**Paradigm:** Graph-based ranking with tree-sitter + PageRank.

- **Repository map** built using tree-sitter to parse ASTs and extract definitions + references. Creates a **NetworkX MultiDiGraph** where files are nodes and symbol references are edges. ([Aider docs](https://aider.chat/docs/repomap.html), [DeepWiki](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping))
- **PageRank with personalization** ranks files by importance. Personalization vector heavily weights:
  - Files in `chat_fnames`: +100 / len(fnames)
  - Files in `mentioned_fnames`: +100 / len(fnames)
  - Default for unspecified files: 1 / num_nodes
- **Edge weight multipliers** ([DeepWiki](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping)):
  - Base: 1.0
  - Identifier in mentioned_idents: x10
  - Snake/kebab/camel case AND >= 8 chars: x10
  - Identifier starts with `_` (private): x0.1
  - Defined in >5 files: x0.1
  - Reference from chat files: **x50**
  - Reference count: x sqrt(num_refs)
- **Token budget binary search**: `get_ranked_tags_map()` uses binary search to find max tags fitting within `--map-tokens` (default 1k tokens). Targets output within 15% of budget. ([DeepWiki](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping))
- **Chat files vs auto-context**: `/add` files are fully included in context AND heavily boosted in graph ranking (x50 edge weight). Auto-context comes from the repo map's ranked output of non-chat files. Chat files are excluded from repo map output since they're already fully loaded. ([DeepWiki](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping))
- **Three-tier caching**: Persistent disk cache (diskcache), in-memory map cache, in-memory tree cache. Mtime-validated. Falls back to in-memory dict if SQLite fails. ([DeepWiki](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping))
- Evolved from **ctags to tree-sitter** for richer extraction (full signatures, broader language support, no external dependency). ([Aider blog](https://aider.chat/2023/10/22/repomap.html))

**Implicit DOI:** Aider's PageRank personalization IS a degree-of-interest function. User-added files have highest interest (focal point). Files referenced by those files have derived interest (structural proximity). The graph topology distributes interest across the codebase. Token budget creates a natural cutoff. This is the most mathematically rigorous interest model in any current tool, but it's purely structural -- no semantic similarity, no behavioral tracking.

---

#### 7. Cline (formerly Claude Dev)

**Paradigm:** Agentic tool-use with explicit user approval.

- Analyzes **file structure and source code ASTs**, runs regex searches, and reads relevant files. Manages context by selectively including files rather than dumping everything. ([Cline GitHub](https://github.com/cline/cline))
- **Dual mode**: Plan mode (read-only exploration, no modifications) and Act mode (execute with user approval at each step). ([Cline docs](https://docs.cline.bot/home))
- **Context references**: `@file` for direct file inclusion, `@folder` for directory imports, `@url` for documentation fetching, `@problems` for workspace diagnostics. ([Addy Osmani](https://addyo.substack.com/p/why-i-use-cline-for-ai-engineering))
- Supports up to **1 million tokens** context window but blocks files over 300KB. Real-time visual indication of context size with progress bar. ([Qodo comparison](https://www.qodo.ai/blog/roo-code-vs-cline/))
- Auto-triggers `new_task` tool when context grows too long, maintaining performance by preventing degradation. ([Addy Osmani](https://addyo.substack.com/p/why-i-use-cline-for-ai-engineering))
- **MCP support** for connecting external tools and data sources. Recent additions include Skills system for reusable agent instructions. ([Cline GitHub](https://github.com/cline/cline))
- Each step requires **explicit user approval**, giving humans direct control over what gets included in context. ([Cline docs](https://docs.cline.bot/home))

**Implicit DOI:** Cline's approach is "user-as-DOI-function." The human approves each context addition, making the interest model fully manual. The tool proposes, the human disposes. This is high-control but high-friction. The Plan/Act separation is a form of read-interest vs write-interest distinction.

---

#### 8. OpenAI Codex CLI

**Paradigm:** Agentic tool-use with AGENTS.md guidance.

- **192,000 token context window** -- large enough to reason about substantial codebase portions in a single task. ([OpenAI Codex docs](https://developers.openai.com/codex/cli/features/))
- **AGENTS.md** files (analogous to CLAUDE.md) inform Codex about codebase navigation, testing commands, and project practices. ([OpenAI Codex docs](https://developers.openai.com/codex/cli/))
- **`@` fuzzy file search** in composer for interactive file selection during CLI sessions. ([OpenAI Codex docs](https://developers.openai.com/codex/cli/features/))
- **MCP support** via `~/.codex/config.toml` for connecting additional tools. ([OpenAI Codex docs](https://developers.openai.com/codex/cli/))
- **Skills** for complex tasks -- reusable instructions encoding coding standards, architectural patterns, testing requirements. ([OpenAI Codex docs](https://developers.openai.com/codex/cli/features/))
- No pre-built codebase index mentioned in public documentation. Appears to rely on agentic file exploration similar to Claude Code. ([OpenAI Codex docs](https://developers.openai.com/codex/cli/))

**Implicit DOI:** Similar to Claude Code -- the LLM's tool-use decisions are the interest model. AGENTS.md provides persistent "interest priors" (always-relevant context). The large context window reduces the pressure on interest management -- if you can fit more, you need to be less selective.

---

#### 9. Amazon Q Developer

**Paradigm:** Local workspace indexing + @workspace retrieval.

- Creates a **local index** of workspace files (code, configuration, project structure). Filters out binaries and `.gitignore` entries. ([AWS docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/workspace-context.html))
- **5-20 minutes** for initial indexing with elevated CPU usage. Stops at hard size limits or minimum memory thresholds. Incremental updates after initial index. ([AWS dev blog](https://dev.to/aws/amazon-q-developer-tips-no3-enable-amazon-q-developer-workspace-index-1jkb))
- `@workspace` modifier triggers context retrieval from the index. Shows which files were selected in the response (context transparency). ([AWS blog](https://aws.amazon.com/blogs/devops/amazon-q-developers-new-context-features/))
- Explicit `@` references for classes, functions, and global variables. Context size increased to **100k characters** in chat. ([AWS blog](https://aws.amazon.com/blogs/devops/continue-to-take-control-over-your-code-with-amazon-q-developers-new-context-features/))
- **Project rules** for enforcing coding standards. **Prompt libraries** for reusable prompts across projects. ([AWS blog](https://aws.amazon.com/blogs/devops/continue-to-take-control-over-your-code-with-amazon-q-developers-new-context-features/))

**Implicit DOI:** Standard RAG-based retrieval. Distinguishing feature is context transparency -- explicitly showing which files were selected, allowing users to evaluate the interest model's output. This feedback loop is unique among the tools surveyed.

---

#### 10. Roo Code

**Paradigm:** Agentic tool-use with configurable indexing + multi-mode architecture.

- **Configurable codebase indexing** -- unlike other tools that hide embedding providers, Roo Code gives full control over how the codebase gets indexed and searched. ([Qodo comparison](https://www.qodo.ai/blog/roo-code-vs-cline/))
- **Multi-mode architecture**: Architect, Code, Debug, Ask, and Custom modes. Each mode can use different AI models (e.g., o3 for architecture, Claude Sonnet 4 for code). ([Roo Code review](https://vibecoding.app/blog/roo-code-review))
- **Explicit context selection**: Developers specify files/directories via `@file` or `@dir` markers. ([Qodo comparison](https://www.qodo.ai/blog/roo-code-vs-cline/))
- Advanced context management with configurable limits, automatic condensing, and control over what gets included. ([Roo Code review](https://vibecoding.app/blog/roo-code-review))
- Known for reliability on **large, multi-file changes** -- described as "the tool developers reach for when other agents break down." ([Faros AI](https://www.faros.ai/blog/best-ai-coding-agents-2026))

**Implicit DOI:** Mode-based interest scoping. Different modes imply different interest profiles -- Architect mode cares about structure, Debug mode cares about error paths, Code mode cares about implementation details. The configurable indexing means users tune the interest model's resolution.

---

## Known Failures of Current Context Selection

### Too Little Context (Missing Critical Information)
- **Missing conventions**: Tools don't know team coding standards, preferred libraries, or architectural decisions unless explicitly told via rules files. ([Pete Hodgson](https://blog.thepete.net/blog/2025/05/22/why-your-ai-coding-assistant-keeps-doing-it-wrong-and-how-to-fix-it/))
- **Cross-file blindness**: Single-file tools miss how components connect. Even multi-file tools miss indirect dependencies. ([SmartData](https://www.smartdata.net/blog/context-is-king-ai-coding-assistants))
- **@codebase summarization loss**: Cursor's @codebase uses a smaller model to summarize files, losing critical details especially in files >600 lines. ([Cursor forum](https://forum.cursor.com/t/tired-of-cursor-not-putting-what-you-want-into-context-solved/75682))

### Too Much Context (Wasting Tokens / Degrading Quality)
- **Context pressure**: Large context causes the agent to stop following rules stated earlier. Metadata streams during refactors can inflate context by tens of thousands of tokens per minute. ([HN discussion](https://news.ycombinator.com/item?id=42834527))
- **Goldilocks problem**: Spotify found that broad search patterns (e.g., `git grep -l '*.java'`) overwhelmed the context window, while narrow patterns missed essential files. ([Spotify engineering](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2))
- **SWE-ContextBench finding**: "Unfiltered or incorrectly selected experience provides limited or negative benefits." Wrong context is worse than no context. ([arXiv:2602.08316](https://arxiv.org/abs/2602.08316))

### Session Boundary Problems
- **Session reset**: Every new session starts with amnesia. The agent won't learn unless you explicitly feed it rules/memories. ([Codeaholicguy](https://codeaholicguy.com/2026/02/14/tokens-context-windows-and-why-your-ai-agent-feels-stupid-sometimes/))
- **Compaction lossyness**: When Claude Code compacts at 92% usage, conversational instructions can be lost even though CLAUDE.md survives. ([Claude Code docs](https://code.claude.com/docs/en/how-claude-code-works))

### Structural Failures
- **Wrong project context**: Cursor can reference a totally different project in multi-project workspaces. ([Cursor forum](https://forum.cursor.com/t/codebase-context-bug/52938))
- **Hallucinated functions**: Cursor sometimes invents functions that don't exist in the codebase. ([LandOfGeek](https://www.landofgeek.com/posts/cursor-ai-review-context-limitations))
- **Developer trust declining**: Trust in AI accuracy decreased from 43% (2024) to 33% (2025). Experienced developers 19% slower with AI tools in familiar repos. ([IEEE Spectrum](https://spectrum.ieee.org/ai-coding-degrades))

---

## Benchmarks and Quantitative Findings

- **SWE-bench original**: BM25 retrieval baseline scored 1.96%. Oracle retrieval (gold-patched files only) with Claude 2 reached 4.8%. ([SWE-bench paper](https://arxiv.org/pdf/2310.06770))
- **SWE-bench Pro**: 1,865 problems from 41 repos. Context retrieval is a primary differentiator between agents. "Different agents retrieved less useful context more often, and that compounded across 731 attempts." ([Scale Labs leaderboard](https://labs.scale.com/leaderboard/swe_bench_pro_public))
- **SWE-ContextBench**: Correctly selected summarized experience improves accuracy and "substantially reduces runtime and token cost, particularly on harder tasks." ([arXiv:2602.08316](https://arxiv.org/abs/2602.08316))
- **Augment on Elasticsearch repo** (3.6M Java LOC, 2,187 contributors): Code reuse optimization +18.2 vs human baseline, functional correctness +12.8. ([Augment context engine](https://www.augmentcode.com/context-engine))
- **Spotify finding**: Static, larger prompts are "easier to reason about" and more predictable than dynamic context fetching. They deliberately excluded code search tools from their agents. ([Spotify engineering](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2))

---

## Implications for the DOI Model

### What Works (Adopt or Extend)

1. **Aider's PageRank personalization is the closest existing DOI implementation.** Its edge-weight multipliers (x50 for chat files, x10 for mentioned identifiers) and personalization vector are a proven mathematical framework for distributing interest through a code dependency graph. A DOI model should build on this.

2. **Windsurf's five-layer pipeline is the right conceptual architecture.** It combines: always-loaded rules (base interest), persistent memories (accumulated interest), active file focus (focal interest), semantic retrieval (derived interest), and action history (behavioral interest). A DOI model needs all five signals.

3. **Augment's semantic dependency graphs extend interest beyond text similarity.** Call graphs and dependency chains encode structural interest that embedding similarity alone misses. The DOI model should incorporate structural relationships, not just semantic proximity.

4. **Claude Code's agentic approach treats the LLM itself as the interest function.** This is powerful because the model can reason about what it needs. But it's also expensive (many tool calls) and non-deterministic. A DOI model could provide a warm start -- pre-computed interest scores that the agent can refine through tool use.

### What Doesn't Work (Avoid)

1. **Pure embedding RAG is insufficient.** Cursor's known failures (wrong project, hallucinated functions, summarization loss) show that semantic similarity alone is too blunt. Embeddings capture "what looks similar" but miss "what's structurally related" and "what the user cares about."

2. **Static context dumps fail at scale.** Even Spotify, with their controlled migration tasks, found that broad search patterns overwhelm context windows. Any DOI model must have a token budget constraint.

3. **Session amnesia undermines accumulated interest.** Every tool that starts fresh each session loses the interest model built up during previous work. Persistent memories (Windsurf, Claude Code auto-memory) partially address this, but none maintain a persistent interest map that evolves across sessions.

4. **Unfiltered context is actively harmful.** SWE-ContextBench proved that wrong context degrades performance. The DOI model must have a quality threshold -- items below a minimum interest score should be excluded entirely, not included with low weight.

### What's Missing (Build)

1. **No tool computes a continuous interest function over the codebase.** Aider's PageRank is the closest, but it's recomputed from scratch each time and doesn't persist. Augment's confidence scores are query-specific. No tool maintains a standing "interest map" that evolves as the user works.

2. **No tool models interest decay.** Files read 30 minutes ago are treated the same as files read 5 seconds ago. The DOI model from information visualization has temporal decay -- interest fades over time unless reinforced. No coding tool implements this.

3. **No tool combines all five interest signals.** Windsurf comes closest but the signals are hardcoded layers, not a unified function. A true DOI model would compute: `DOI(item) = f(focal_distance, structural_proximity, semantic_similarity, temporal_recency, behavioral_evidence, persistent_memory)`.

4. **No tool distinguishes interest types.** Reading a file for context (understand-interest) vs editing a file (modify-interest) vs debugging through a file (trace-interest) are treated identically. Different interest types should have different decay rates and propagation patterns.

5. **No tool provides interest transparency.** Amazon Q's context transparency (showing which files were selected) is a step, but no tool shows WHY a file was selected or its interest score. Users can't debug the interest model.

---

## Open Questions

1. **Is agentic discovery + DOI warm-start better than pure RAG or pure agentic?** Claude Code's agentic approach and Cursor's RAG approach represent poles. Can a DOI model provide the best of both -- pre-computed interest for fast startup with agentic refinement for precision?

2. **What's the right granularity for DOI items?** Files? Functions? Code blocks? Aider uses file-level graph ranking. Cursor chunks at function/class level. Augment claims to understand call-graph level relationships. The DOI model needs to choose or support multiple granularities.

3. **How should interest propagate through code structure?** Aider uses PageRank (democratic propagation). Should interest flow differently through imports vs call graphs vs type hierarchies vs test coverage?

4. **Can interest be learned from developer behavior patterns?** Windsurf tracks actions. If the tool could learn that "when a developer reads auth.ts, they usually need session.ts next," that's predictive interest -- a significant advance over reactive retrieval.

5. **What's the minimum viable DOI model?** Given the complexity, what subset of signals would deliver the most value? Aider's graph ranking + Windsurf's temporal recency might be the 80/20 starting point.

6. **How does DOI interact with compaction?** When context is compacted, should the DOI model influence what gets preserved? Files with high current interest should survive compaction; low-interest context should be summarized or dropped.

---

## Sources (Annotated)

### Claude Code
- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works) -- Official docs on agentic loop, tools, context access
- [How Claude remembers your project](https://code.claude.com/docs/en/memory) -- CLAUDE.md, rules, auto memory, loading order
- [Claude Code system prompts (Piebald-AI)](https://github.com/Piebald-AI/claude-code-system-prompts) -- Extracted system prompt, 110+ strings, all sub-agent prompts
- [Claude Code behind-the-scenes (PromptLayer)](https://blog.promptlayer.com/claude-code-behind-the-scenes-of-the-master-agent-loop/) -- Master loop architecture, compressor, tool dispatch
- [Claude Code CLI guide (Introl)](https://introl.com/blog/claude-code-cli-comprehensive-guide-2025) -- Comprehensive CLI reference
- [Claude Code rules directory (ClaudeFast)](https://claudefa.st/blog/guide/mechanics/rules-directory) -- .claude/rules/ guide
- [Path-specific rules (Paddo)](https://paddo.dev/blog/claude-rules-path-specific-native/) -- Rules with globs
- [Tracing Claude Code LLM traffic (George Sung)](https://medium.com/@georgesung/tracing-claude-codes-llm-traffic-agentic-loop-sub-agents-tool-use-prompts-7796941806f5) -- Traffic analysis of agentic loop

### Cursor
- [Codebase Indexing (Cursor docs)](https://docs.cursor.com/context/codebase-indexing) -- Official indexing documentation
- [How Cursor indexes codebases fast (Engineer's Codex)](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast) -- Detailed technical breakdown: chunking, Turbopuffer, privacy
- [How Cursor actually indexes (Towards Data Science)](https://towardsdatascience.com/how-cursor-actually-indexes-your-codebase/) -- Technical deep-dive (Jan 2026)
- [How Cursor works (BitPeak)](https://bitpeak.com/how-cursor-works-deep-dive-into-vibe-coding/) -- HyDE, reranking details
- [How Cursor works internally (Aditya Rohilla)](https://adityarohilla.com/2025/05/08/how-cursor-works-internally/) -- Internal architecture
- [Reranking vs Embeddings on Cursor (Gonzalo Mordecki)](https://medium.com/@gonzalo.mordecki/reranking-vs-embeddings-on-cursor-a2d728ba67dd) -- Reranking analysis
- [Understanding your codebase (Cursor docs)](https://cursor.com/docs/cookbook/large-codebases) -- Large codebase guide
- [Context management for Cursor (DataLakehouseHub)](https://datalakehousehub.com/blog/2026-03-context-management-cursor/) -- Context strategies guide
- [Cursor codebase context bug (Forum)](https://forum.cursor.com/t/codebase-context-bug/52938) -- Multi-project context failures
- [Cursor context problems solved (Forum)](https://forum.cursor.com/t/tired-of-cursor-not-putting-what-you-want-into-context-solved/75682) -- User workarounds
- [Context and large codebases (Forum)](https://forum.cursor.com/t/context-and-large-codebases/50750) -- Large codebase challenges
- [Cursor context limitations (LandOfGeek)](https://www.landofgeek.com/posts/cursor-ai-review-context-limitations) -- Hallucination and context window issues
- [Cursor enters edit loop (Forum)](https://forum.cursor.com/t/cursor-enters-edit-loop-corrupts-codebase-after-failing-edits/120235) -- Edit loop corruption bug
- [Cursor blog on semantic search](https://cursor.com/blog/semsearch) -- Semantic search approach
- [Cursor security](https://www.cursor.com/en/security) -- Privacy and obfuscation details
- [Codebase Indexing forum thread](https://forum.cursor.com/t/codebase-indexing/36) -- Founder's explanation
- [How Cursor serves billions (ByteByteGo)](https://blog.bytebytego.com/p/how-cursor-serves-billions-of-ai) -- Infrastructure at scale

### Windsurf / Codeium
- [Cascade docs (Windsurf)](https://docs.windsurf.com/windsurf/cascade/cascade) -- Official Cascade documentation
- [Windsurf Flow context engine (MarkAICode)](https://markaicode.com/windsurf-flow-context-engine/) -- Five-layer pipeline, M-Query, static vs dynamic
- [Windsurf product page (Codeium)](https://codeium.com/windsurf) -- Marketing overview
- [Windsurf Cascade product page](https://windsurf.com/cascade) -- Cascade feature overview
- [Windsurf IDE review (Medium)](https://medium.com/@urano10/windsurf-ide-review-2025-the-ai-native-low-code-coding-environment-formerly-codeium-335093f5619b) -- 2025 review
- [Windsurf overview (eesel)](https://www.eesel.ai/blog/windsurf-overview) -- Feature overview
- [Codeium Windsurf game-changing IDE (Keyhole)](https://keyholesoftware.com/codieum-windsurf-game-changing-ide-experience-part-1/) -- Part 1 review
- [Windsurf changelog](https://windsurf.com/changelog) -- Release history

### Augment Code
- [Context Engine (Augment)](https://www.augmentcode.com/context-engine) -- Official context engine page with relevance scoring details
- [How Augment solved large codebase problem (Codacy)](https://blog.codacy.com/ai-giants-how-augment-code-solved-the-large-codebase-problem) -- Architecture interview
- [AI coding assistants for large codebases (Augment)](https://www.augmentcode.com/tools/ai-coding-assistants-for-large-codebases-a-complete-guide) -- Comparison guide
- [Auggie tops SWE-Bench Pro (Augment)](https://www.augmentcode.com/blog/auggie-tops-swe-bench-pro) -- Benchmark results
- [Augment Code review 2026 (VibecodedThis)](https://www.vibecodedthis.com/reviews/augment-code-review-2026/) -- Independent review
- [IDE Agents (Augment)](https://www.augmentcode.com/product) -- Product details
- [Augment vs Continue (Augment)](https://www.augmentcode.com/tools/augment-code-vs-continue) -- Tool comparison
- [Cursor vs Windsurf (Augment)](https://www.augmentcode.com/tools/cursor-vs-windsurf-codeium-feature-and-price-guide) -- Feature comparison

### GitHub Copilot
- [Copilot Workspace (GitHub Next)](https://githubnext.com/projects/copilot-workspace/) -- Project overview and architecture
- [Copilot Workspace user manual](https://github.com/githubnext/copilot-workspace-user-manual) -- Tips, tricks, file selection
- [How Copilot understands your workspace (VS Code)](https://code.visualstudio.com/docs/copilot/reference/workspace-context) -- Multi-strategy retrieval, indexing thresholds
- [Manage context for AI (VS Code)](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context) -- @-references, context management
- [How GitHub Next took Workspace from concept to code](https://github.com/orgs/community/discussions/142971) -- Evolution to Coding Agent
- [GitHub code search technology](https://github.blog/2023-02-06-the-technology-behind-githubs-new-code-search) -- Underlying search infrastructure
- [Copilot Workspace feedback](https://github.com/orgs/community/discussions/145254) -- User feedback
- [Copilot agent mode announcement](https://github.com/newsroom/press-releases/agent-mode) -- Agent mode launch
- [November 2025 Copilot Roundup](https://github.com/orgs/community/discussions/180828) -- Recent updates
- [Copilot workspace sunset](https://gh.io/copilot-workspace-sunset) -- Sunset notice

### Aider
- [Repository map (Aider docs)](https://aider.chat/docs/repomap.html) -- Official repo map documentation
- [Building a better repository map with tree-sitter (Aider blog)](https://aider.chat/2023/10/22/repomap.html) -- Technical evolution from ctags
- [Repository Mapping (DeepWiki)](https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping) -- Detailed implementation: PageRank, edge weights, binary search, caching
- [Understanding AI coding agents through Aider's architecture](https://simranchawla.com/understanding-ai-coding-agents-through-aiders-architecture/) -- Architecture overview
- [Aider documentation](https://aider.chat/docs/) -- Main docs
- [Aider FAQ](https://aider.chat/docs/faq.html) -- Common questions
- [Aider advanced model settings](https://aider.chat/docs/config/adv-model-settings.html) -- Map-tokens config
- [Aider review (Blott)](https://www.blott.com/blog/post/aider-review-a-developers-month-with-this-terminal-based-code-assistant) -- Developer review
- [Getting started with Aider (OpenReplay)](https://blog.openreplay.com/getting-started-aider-ai-coding-terminal/) -- Tutorial
- [PageRank bug in Aider (GitHub issue)](https://github.com/paul-gauthier/aider/issues/1536) -- ZeroDivisionError in PageRank calculation
- [RepoMapper standalone tool](https://github.com/pdavis68/RepoMapper) -- Standalone re-implementation of Aider's repo map
- [grep-ast parsers](https://github.com/Aider-AI/grep-ast/blob/main/grep_ast/parsers.py) -- Language support
- [Aider query files](https://github.com/Aider-AI/aider/tree/main/aider/queries) -- Tree-sitter query patterns

### Cline
- [Cline GitHub](https://github.com/cline/cline) -- Main repository
- [Cline documentation](https://docs.cline.bot/home) -- Official docs
- [Why I use Cline (Addy Osmani)](https://addyo.substack.com/p/why-i-use-cline-for-ai-engineering) -- Context tools and management
- [Cline tutorial (DataCamp)](https://www.datacamp.com/tutorial/cline-ai) -- Practical examples
- [Cline VS Code extension](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) -- Marketplace page
- [Cline wiki](https://github.com/cline/cline/wiki) -- Community wiki
- [Cline review 2026 (VibeCoding)](https://vibecoding.app/blog/cline-review-2026) -- Autonomous agent review
- [Cline vs Cursor (Augment)](https://www.augmentcode.com/tools/cline-vs-cursor) -- Feature comparison

### OpenAI Codex
- [Codex CLI features](https://developers.openai.com/codex/cli/features/) -- Feature documentation
- [Codex CLI main page](https://developers.openai.com/codex/cli/) -- CLI overview
- [Codex CLI reference](https://developers.openai.com/codex/cli/reference) -- Command line options
- [Codex changelog](https://developers.openai.com/codex/changelog/) -- Release history
- [Codex models](https://developers.openai.com/codex/models) -- Available models
- [Introducing Codex (OpenAI)](https://openai.com/index/introducing-codex/) -- Launch announcement
- [Codex GitHub](https://github.com/openai/codex) -- Open source CLI
- [Codex context management guide (DataLakehouseHub)](https://datalakehousehub.com/blog/2026-03-context-management-openai-codex/) -- Context strategies
- [OpenAI Codex setup guide (SmartScope)](https://smartscope.blog/en/generative-ai/chatgpt/openai-codex-cli-comprehensive-guide/) -- Comprehensive guide

### Amazon Q Developer
- [Workspace context (AWS docs)](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/workspace-context.html) -- @workspace documentation
- [Workspace context awareness announcement (AWS)](https://aws.amazon.com/blogs/devops/aws-announces-workspace-context-awareness-for-amazon-q-developer-chat/) -- Feature launch
- [Enable workspace index (DEV Community)](https://dev.to/aws/amazon-q-developer-tips-no3-enable-amazon-q-developer-workspace-index-1jkb) -- Indexing guide
- [New context features (AWS blog)](https://aws.amazon.com/blogs/devops/amazon-q-developers-new-context-features/) -- @-references, rules, context transparency
- [Continue context features (AWS blog)](https://aws.amazon.com/blogs/devops/continue-to-take-control-over-your-code-with-amazon-q-developers-new-context-features/) -- Extended context control
- [Amazon Q @workspace deep dive (Medium)](https://nazeel-ak.medium.com/amazon-q-developer-deeper-dive-on-workspace-9ce560340c74) -- Technical deep dive
- [Amazon Q agentic coding (AWS)](https://aws.amazon.com/blogs/aws/amazon-q-developer-elevates-the-ide-experience-with-new-agentic-coding-experience/) -- Agent mode
- [Amazon Q FAQs](https://aws.amazon.com/q/developer/faqs/) -- FAQ

### Roo Code
- [Roo Code GitHub](https://github.com/RooCodeInc/Roo-Code) -- Main repository
- [Roo Code website](https://roocode.com/) -- Product page
- [Roo Code vs Cline (Qodo)](https://www.qodo.ai/blog/roo-code-vs-cline/) -- Comparison with context management details
- [Best AI coding agents 2026 (Faros AI)](https://www.faros.ai/blog/best-ai-coding-agents-2026) -- Industry comparison
- [Roo Code review 2026 (VibeCoding)](https://vibecoding.app/blog/roo-code-review) -- Multi-mode architecture review
- [Roo Code tutorial (DataCamp)](https://www.datacamp.com/tutorial/roo-code) -- Practical examples

### Benchmarks & Research
- [SWE-bench paper (ICLR 2024)](https://arxiv.org/pdf/2310.06770) -- Original benchmark with BM25 and oracle retrieval baselines
- [SWE-bench leaderboards](https://www.swebench.com/) -- Current standings
- [SWE-bench Pro (Scale Labs)](https://labs.scale.com/leaderboard/swe_bench_pro_public) -- Pro leaderboard
- [SWE-ContextBench (arXiv)](https://arxiv.org/abs/2602.08316) -- Context learning benchmark for coding
- [SWE-bench Verified (Epoch AI)](https://epoch.ai/benchmarks/swe-bench-verified) -- Verified subset
- [Cognition SWE-bench report](https://cognition.ai/blog/swe-bench-technical-report) -- Devin technical report

### Context Engineering & Failures
- [Context Engineering for Coding Agents (Martin Fowler)](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) -- Comprehensive framework, tool comparison, Claude Code features
- [Context Engineering (Spotify)](https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2) -- Spotify's background agent context strategy
- [Why AI coding assistants fail (Pete Hodgson)](https://blog.thepete.net/blog/2025/05/22/why-your-ai-coding-assistant-keeps-doing-it-wrong-and-how-to-fix-it/) -- Missing context causes, fixes
- [AI context problem (LogRocket)](https://blog.logrocket.com/fixing-ai-context-problem/) -- Context window failures, memory loss
- [Context is King (SmartData)](https://www.smartdata.net/blog/context-is-king-ai-coding-assistants) -- Why context matters
- [AI coding degrades (IEEE Spectrum)](https://spectrum.ieee.org/ai-coding-degrades) -- Silent failures, declining trust
- [Tokens and context windows (Codeaholicguy)](https://codeaholicguy.com/2026/02/14/tokens-context-windows-and-why-your-ai-agent-feels-stupid-sometimes/) -- Session reset problem
- [AI coding assistants fail at complex tasks (DEV Community)](https://dev.to/dataformathub/ai-coding-assistants-in-2025-why-they-still-fail-at-complex-tasks-ke) -- Complex task failures
- [Large context windows not useful (HN)](https://news.ycombinator.com/item?id=42834527) -- Practical limits discussion
- [OpenAI Codex meltdown analysis (Managing AI)](https://www.managing-ai.com/resources/ai-coding-assistant-meltdown) -- Codex failure analysis
- [Context Engineering (Weaviate)](https://weaviate.io/blog/context-engineering) -- LLM memory and retrieval for agents
- [AGENTS.md specification](https://agents.md/) -- Emerging standard for agent rules files

### DOI Model Background
- [DOI Trees (Dave Nation)](https://davenation.com/doitree/doitree-avi-2002.htm) -- Original DOI tree visualization
- [DOI Functions + Progressive Visualization (AU)](https://cs.au.dk/~hjschulz/pdfs/doi4pva.pdf) -- Academic paper on DOI for progressive visualization
- [From RAG to Context (RAGFlow)](https://ragflow.io/blog/rag-review-2025-from-rag-to-context) -- 2025 year-end RAG review
- [Traditional vs Agentic RAG (NVIDIA)](https://developer.nvidia.com/blog/traditional-rag-vs-agentic-rag-why-ai-agents-need-dynamic-knowledge-to-get-smarter/) -- Dynamic knowledge for agents
- [Best context engineering platforms 2025](https://contextengineering.ai/blog/tool-review-best-context-engineering-platforms-2025/) -- Tool review

### Additional Comparisons
- [Agentic AI IDEs comparison (GurkaTech)](https://gurkhatech.com/agentic-ai-ides-comparison-2025/) -- IDE comparison
- [Top AI coding tools (Qodo)](https://www.qodo.ai/blog/best-ai-coding-assistant-tools/) -- 2026 tool comparison
- [Building RAG on codebases (LanceDB)](https://lancedb.com/blog/building-rag-on-codebases-part-2/) -- RAG implementation tutorial
- [Context management VS Code LLM plugins (DataLakehouseHub)](https://datalakehousehub.com/blog/2026-03-context-management-vscode-llm-plugins/) -- VS Code plugin context strategies

---

## Raw Link Collection

Every URL encountered during research, including tangentially relevant ones:

```
https://code.claude.com/docs/en/how-claude-code-works
https://code.claude.com/docs/en/memory
https://code.claude.com/docs/llms.txt
https://github.com/Piebald-AI/claude-code-system-prompts
https://blog.promptlayer.com/claude-code-behind-the-scenes-of-the-master-agent-loop/
https://introl.com/blog/claude-code-cli-comprehensive-guide-2025
https://claudefa.st/blog/guide/mechanics/rules-directory
https://paddo.dev/blog/claude-rules-path-specific-native/
https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide/3-claude-code-fundamentals
https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
https://ast-grep.github.io/advanced/prompting.html
https://naqeebali-shamsi.medium.com/the-complete-guide-to-setting-global-instructions-for-claude-code-cli-cec8407c99a0
https://github.com/Cranot/claude-code-guide
https://medium.com/@yuxiaojian/under-the-hood-of-claude-code-its-not-magic-it-s-engineering-e1336c5669d4
https://medium.com/@georgesung/tracing-claude-codes-llm-traffic-agentic-loop-sub-agents-tool-use-prompts-7796941806f5
https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
https://platform.claude.com/docs/en/agent-sdk/agent-loop
https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
https://aimultiple.com/agentic-coding
https://docs.temporal.io/ai-cookbook/agentic-loop-tool-call-claude-python
https://www.anthropic.com/engineering/claude-code-best-practices
https://www.anthropic.com/engineering/advanced-tool-use
https://docs.cursor.com/context/codebase-indexing
https://cursor.com/docs/context/codebase-indexing
https://cursor.com/docs/cookbook/large-codebases
https://cursor.com/blog/semsearch
https://www.cursor.com/en/security
https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast
https://towardsdatascience.com/how-cursor-actually-indexes-your-codebase/
https://bitpeak.com/how-cursor-works-deep-dive-into-vibe-coding/
https://adityarohilla.com/2025/05/08/how-cursor-works-internally/
https://medium.com/@gonzalo.mordecki/reranking-vs-embeddings-on-cursor-a2d728ba67dd
https://datalakehousehub.com/blog/2026-03-context-management-cursor/
https://forum.cursor.com/t/codebase-context-bug/52938
https://forum.cursor.com/t/tired-of-cursor-not-putting-what-you-want-into-context-solved/75682
https://forum.cursor.com/t/context-and-large-codebases/50750
https://forum.cursor.com/t/codebase-as-context-is-gone/75549
https://forum.cursor.com/t/codebase-indexing/36
https://forum.cursor.com/t/cursor-enters-edit-loop-corrupts-codebase-after-failing-edits/120235
https://forum.cursor.com/t/cursor-not-able-to-access-full-code-base/36021
https://forum.cursor.com/t/chat-with-codebase-results-in-no-context/3308
https://www.landofgeek.com/posts/cursor-ai-review-context-limitations
https://stevekinney.com/courses/ai-development/cursor-context
https://decode.agency/article/cursor-guide/
https://blog.bytebytego.com/p/how-cursor-serves-billions-of-ai
https://www.educative.io/courses/advanced-cursor-ai/mastering-context-codebase-indexing-and--references
https://medium.com/@wangxj03/semantic-code-search-010c22e7d267
https://blog.lancedb.com/rag-codebase-1/
https://blog.lancedb.com/building-rag-on-codebases-part-2/
https://tree-sitter.github.io/tree-sitter/
https://github.blog/2023-02-06-the-technology-behind-githubs-new-code-search
https://docs.windsurf.com/windsurf/cascade/cascade
https://codeium.com/windsurf
https://windsurf.com/cascade
https://windsurf.com/changelog
https://markaicode.com/windsurf-flow-context-engine/
https://markaicode.com/vs/windsurf-vs-vscode-copilot/
https://markaicode.com/windsurf-cascade-agent-autonomous-refactoring/
https://medium.com/@urano10/windsurf-ide-review-2025-the-ai-native-low-code-coding-environment-formerly-codeium-335093f5619b
https://www.eesel.ai/blog/windsurf-overview
https://keyholesoftware.com/codieum-windsurf-game-changing-ide-experience-part-1/
https://skywork.ai/skypage/en/Windsurf-(Formerly-Codeium)-Review-2025:-The-Agentic-IDE-Changing-the-Game/1973911680657846272
https://www.augmentcode.com/context-engine
https://www.augmentcode.com
https://www.augmentcode.com/product
https://www.augmentcode.com/tools/ai-coding-assistants-for-large-codebases-a-complete-guide
https://www.augmentcode.com/tools/augment-code-vs-continue
https://www.augmentcode.com/tools/cursor-vs-windsurf-codeium-feature-and-price-guide
https://www.augmentcode.com/tools/intent-vs-warp
https://www.augmentcode.com/tools/intent-vs-claude-code
https://www.augmentcode.com/tools/cline-vs-cursor
https://www.augmentcode.com/blog/auggie-tops-swe-bench-pro
https://www.augmentcode.com/blog/introducing-augment-code-review
https://www.vibecodedthis.com/reviews/augment-code-review-2026/
https://blog.codacy.com/ai-giants-how-augment-code-solved-the-large-codebase-problem
https://www.codacy.com/ai-giants/augment-code
https://docs.augmentcode.com
https://app.augmentcode.com/
https://githubnext.com/projects/copilot-workspace/
https://github.com/githubnext/copilot-workspace-user-manual
https://github.com/githubnext/copilot-workspace-user-manual/blob/main/overview.md
https://github.com/githubnext/copilot-workspace-user-manual/blob/main/tips-and-tricks.md
https://github.com/orgs/community/discussions/142971
https://github.com/orgs/community/discussions/145254
https://github.com/orgs/community/discussions/180828
https://github.com/orgs/community/discussions/51323
https://github.com/orgs/community/discussions/119697
https://github.com/orgs/community/discussions/155219
https://github.com/orgs/community/discussions/176088
https://github.com/newsroom/press-releases/agent-mode
https://github.blog/changelog/2024-12-30-expanding-access-to-the-github-copilot-workspace-technical-preview/
https://github.blog/changelog/2025-01-06-copilot-workspace-changelog-january-6-2025/
https://gh.io/copilot-workspace-sunset
https://code.visualstudio.com/docs/copilot/reference/workspace-context
https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context
https://resources.github.com/copilot-trust-center/
https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context-references?view=visualstudio
https://medium.com/@svdoever/experiments-with-github-copilot-context-ca4bdcccc10e
https://pascoal.net/2024/12/01/gh-copilot-extension-vscode-references/
https://devblogs.microsoft.com/cppblog/new-contextual-tools-for-github-copilot-in-visual-studio/
https://visualstudiomagazine.com/articles/2025/10/23/hands-on-with-new-visual-studio-copilot-planning-feature-preview.aspx
https://docs.github.com/en/copilot/get-started/features
https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents
https://www.javacodegeeks.com/2026/02/github-copilot-workspace-the-agentic-era.html
https://aitoolsdevpro.com/ai-tools/github-copilot-guide/
https://aider.chat/docs/repomap.html
https://aider.chat/2023/10/22/repomap.html
https://aider.chat/docs/faq.html
https://aider.chat/docs/ctags.html
https://aider.chat/docs/
https://aider.chat/docs/usage.html
https://aider.chat/docs/config/adv-model-settings.html
https://deepwiki.com/Aider-AI/aider/4.1-repository-mapping
https://deepwiki.com/helloandworlder/aider/4.1-repository-mapping
https://simranchawla.com/understanding-ai-coding-agents-through-aiders-architecture/
https://github.com/Aider-AI/aider
https://github.com/Aider-AI/grep-ast/blob/main/grep_ast/parsers.py
https://github.com/Aider-AI/aider/tree/main/aider/queries
https://github.com/paul-gauthier/aider/issues/1536
https://github.com/pdavis68/RepoMapper
https://github.com/grantjenks/py-tree-sitter-languages
https://mcpservers.org/servers/pdavis68/RepoMapper
https://www.blott.com/blog/post/aider-review-a-developers-month-with-this-terminal-based-code-assistant
https://blog.openreplay.com/getting-started-aider-ai-coding-terminal/
https://github.com/cline/cline
https://cline.bot/
https://cline.bot/blog/best-ai-coding-assistant-2025-complete-guide-to-cline-and-cursor
https://docs.cline.bot/home
https://docs.aimlapi.com/integrations/cline
https://github.com/cline/cline/wiki
https://addyo.substack.com/p/why-i-use-cline-for-ai-engineering
https://www.oneclickitsolution.com/centerofexcellence/aiml/cline-ai-assistant-vscode-coding-workflow
https://www.deployhq.com/guides/cline
https://dev.to/mrunal77/supercharge-your-vs-code-with-cline-the-local-ai-coding-assistant-3ol3
https://www.datacamp.com/tutorial/cline-ai
https://aiagentstore.ai/ai-agent/cline
https://www.change8.dev/ai-tools/cline
https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev
https://vibecoding.app/blog/cline-review-2026
https://www.qodo.ai/blog/roo-code-vs-cline/
https://developers.openai.com/codex/cli/features/
https://developers.openai.com/codex/cli/
https://developers.openai.com/codex/cli/reference
https://developers.openai.com/codex/changelog/
https://developers.openai.com/codex/models
https://openai.com/index/introducing-codex/
https://github.com/openai/codex
https://datalakehousehub.com/blog/2026-03-context-management-openai-codex/
https://smartscope.blog/en/generative-ai/chatgpt/openai-codex-cli-comprehensive-guide/
https://developers.openai.com/blog/openai-for-developers-2025/
https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/workspace-context.html
https://aws.amazon.com/blogs/devops/aws-announces-workspace-context-awareness-for-amazon-q-developer-chat/
https://dev.to/aws/amazon-q-developer-tips-no3-enable-amazon-q-developer-workspace-index-1jkb
https://aws.amazon.com/blogs/devops/amazon-q-developers-new-context-features/
https://aws.amazon.com/blogs/devops/continue-to-take-control-over-your-code-with-amazon-q-developers-new-context-features/
https://aws.amazon.com/about-aws/whats-new/2024/07/ide-workspace-context-awareness-q-developer-chat/
https://aws.amazon.com/blogs/devops/streamline-your-eclipse-workflows-with-amazon-q-developer-now-generally-available/
https://nazeel-ak.medium.com/amazon-q-developer-deeper-dive-on-workspace-9ce560340c74
https://www.qodo.ai/blog/amazon-q-alternatives/
https://blog.brianbeach.com/publications/2025-03-11-amazon-q-developers-new-context-features/
https://aws.amazon.com/q/developer/features/
https://aws.amazon.com/q/developer/faqs/
https://aws.amazon.com/blogs/aws/amazon-q-developer-elevates-the-ide-experience-with-new-agentic-coding-experience/
https://www.infoworld.com/article/4100433/ai-assisted-software-development-with-amazon-q-developer.html
https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/q-in-IDE.html
https://www.pwc.com/us/en/technology/alliances/library/amazon-q-developer.html
https://www.superblocks.com/blog/amazon-qdeveloper-pricing
https://github.com/RooCodeInc/Roo-Code
https://roocode.com/
https://roocline.dev/
https://vibecoding.app/blog/roo-code-review
https://www.faros.ai/blog/best-ai-coding-agents-2026
https://aiagentstore.ai/ai-agent/roo-code
https://www.datacamp.com/tutorial/roo-code
https://visualstudiomagazine.com/articles/2025/10/07/top-agentic-ai-tools-for-vs-code-according-to-installs.aspx
https://datalakehousehub.com/blog/2026-03-context-management-vscode-llm-plugins/
https://arxiv.org/pdf/2310.06770
https://arxiv.org/abs/2602.08316
https://arxiv.org/html/2602.08316
https://arxiv.org/pdf/2509.16941
https://www.vals.ai/benchmarks/swebench
https://epoch.ai/benchmarks/swe-bench-verified
https://labs.scale.com/leaderboard/swe_bench_pro_public
https://www.swebench.com/
https://www.swebench.com/lite.html
https://www.swebench.com/original.html
https://pli.princeton.edu/blog/2023/swe-bench-can-language-models-resolve-real-world-github-issues
https://www.emergentmind.com/topics/swe-bench
https://www.emergentmind.com/topics/swe-bench-live
https://www.emergentmind.com/topics/swe-bench-085d928a-d773-4478-a412-44d8b11f070d
https://www.researchgate.net/publication/400603412_SWE_Context_Bench_A_Benchmark_for_Context_Learning_in_Coding
https://cognition.ai/blog/swe-bench-technical-report
https://atoms.dev/insights/swe-bench-a-comprehensive-review-of-its-fundamentals-methodology-impact-and-future-directions/6c3cb9820d3b44e69862f7b064c1fd1e
https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html
https://engineering.atspotify.com/2025/11/context-engineering-background-coding-agents-part-2
https://blog.thepete.net/blog/2025/05/22/why-your-ai-coding-assistant-keeps-doing-it-wrong-and-how-to-fix-it/
https://blog.thepete.net/blog/2025/04/14/chain-of-vibes/
https://blog.logrocket.com/fixing-ai-context-problem/
https://blog.logrocket.com/qwen-3-coder-agentic-cli/
https://www.smartdata.net/blog/context-is-king-ai-coding-assistants
https://spectrum.ieee.org/ai-coding-degrades
https://codeaholicguy.com/2026/02/14/tokens-context-windows-and-why-your-ai-agent-feels-stupid-sometimes/
https://www.managing-ai.com/resources/ai-coding-assistant-meltdown
https://dev.to/dataformathub/ai-coding-assistants-in-2025-why-they-still-fail-at-complex-tasks-ke
https://news.ycombinator.com/item?id=42834527
https://medium.com/@timbiondollo/how-i-solved-the-biggest-problem-with-ai-coding-assistants-and-you-can-too-aa5e5af80952
https://weaviate.io/blog/context-engineering
https://contextengineering.ai/blog/tool-review-best-context-engineering-platforms-2025/
https://agents.md/
https://cursor.com/docs/context/subagents
https://www.thoughtworks.com/insights/podcasts/technology-podcasts/talking-context-engineering
https://martinfowler.com/articles/pushing-ai-autonomy.html#MultipleAgents
https://ragflow.io/blog/rag-review-2025-from-rag-to-context
https://developer.nvidia.com/blog/traditional-rag-vs-agentic-rag-why-ai-agents-need-dynamic-knowledge-to-get-smarter/
https://gurkhatech.com/agentic-ai-ides-comparison-2025/
https://www.qodo.ai/blog/best-ai-coding-assistant-tools/
https://www.qodo.ai/blog/agentic-ai-tools/
https://lancedb.com/blog/building-rag-on-codebases-part-2/
https://www.meilisearch.com/blog/rag-tools
https://www.firecrawl.dev/blog/best-enterprise-rag-platforms-2025
https://www.zenml.io/blog/rag-tools
https://medium.com/@tuguidragos/rag-vs-ai-agents-the-definitive-2025-guide-to-ai-automation-architecture-3d5157dd0097
https://research.aimultiple.com/retrieval-augmented-generation/
https://davenation.com/doitree/doitree-avi-2002.htm
https://cs.au.dk/~hjschulz/pdfs/doi4pva.pdf
https://arxiv.org/html/2510.03194v1
https://arxiv.org/html/2505.19101v1
https://arxiv.org/abs/2601.15153v1
https://arxiv.org/html/2510.13329
https://huggingface.co/papers/2510.13329
https://www.researchgate.net/publication/396517804_Embedding-Based_Context-Aware_Reranker
https://github.com/WooooDyy/LLM-Agent-Paper-List
https://github.com/business-science/ai-data-science-team
https://www.datacamp.com/blog/llm-agents
https://lmstudio.ai/download
https://docs.djangoproject.com/en/5.2/topics/db/optimization/
https://docs.djangoproject.com/en/5.2/ref/models/querysets/
https://www.tomsguide.com/ai/anthropic-is-putting-a-limit-on-a-claude-ai-feature-because-people-are-using-it-24-7
```
