# Vector 5: Collaborative Editing, Authorship Attribution, and Human-Agent Co-Creation

**Question:** When both humans and agents modify documents, what UX patterns handle visibility, attribution, and conflict? What does the research say about genuine collaboration?

## Academic Research: Collaborative Document Editing with AI Agents

The most directly relevant study is Collaborative Document Editing with Multiple Users and AI Agents (arXiv:2509.11826, Sep 2025). This is a rare empirical study of teams using AI agents in a shared writing environment. ([arXiv](https://arxiv.org/html/2509.11826))

### Key Design Patterns

**Agent Profiles as Shared Objects:**
Teams create customizable AI personas through structured "CV" forms (expertise, skills) and unstructured notes. Pre-set templates: reviewer, idea generator, structure specialist, English teacher. 54 CV sections created with 71 manually-added values. Users strongly prefer structured definition interfaces over freeform notes.

**Comment-Based Integration (Not Direct Editing):**
Agents respond through collaborative comments — a familiar UI convention. Users can append suggestions, replace text, or copy to clipboard. The agent never directly edits the document. This maintains human control over acceptance.

**Task Manifest:**
A persistent task list displays repeatable operations assigned to specific agents, making delegation explicit and visible to all collaborators.

**Manual vs. Autonomous Triggers:**
Tasks support two execution modes:
- Manual: button-click in task list or floating toolbar shortcuts
- Autonomous: triggers on document save, user inactivity, offline periods, short intervals, or multiple collaborative edits

Only 7 of 67 tasks used autonomous triggers. "After inactivity" was the most popular autonomous trigger (3 tasks). Users overwhelmingly preferred manual control.

### Empirical Findings

**Agents as tools, not team members:** Despite the "collaborative" framing, teams incorporated agents as shared resources rather than co-authors. Agents were "used by the team, not part of it."

**Territorial behavior:** 88.06% of tasks assigned to agents were created by that agent's creator. Only 1 of 11 agent updates occurred across team members. Agents were "treated as personal territory."

**Comment discussion patterns:**
1. Human-human (4 instances): Coordinating tasks between team members
2. Human-AI single-turn (57): Direct delegation and acceptance/rejection
3. Human-AI negotiation (17): Multi-turn refinement
4. Human-team-AI (6): Collaborative brainstorming with multiple agents
5. AI-initiated (6): Agent suggestions receiving human replies

**Temporal pattern:** 62.76% of comments were posted in the last quartile of editing sessions — teams sought AI support after drafting initial content, not during initial ideation.

**Acceptance speed:** User-initiated suggestions accepted in 1.92 minutes. Agent-autonomous suggestions accepted in 0.67 minutes but far less frequently. Human-initiated suggestions accepted more often (136 vs 16).

**Usability:** SUS score of 66.92 (slightly below 68 benchmark). Highest ratings for "Enjoyment" and "Collaboration."

### Critical Takeaway
This study empirically validates that humans treat AI agents as tools/resources with territorial ownership — not as equal collaborators. The comment-based integration pattern (suggest, don't edit) is strongly preferred. Direct document modification by agents is not wanted by users.

## Authorship Attribution: Grammarly/Superhuman

Superhuman (formerly Grammarly) launched agent-specific attribution in March 2026. ([Grammarly Blog](https://www.grammarly.com/blog/company/superhuman-authorship-docs/))

**What Authorship tracks:**
- Which parts of a document were human-created, AI-generated, or AI-edited
- Which specific AI agent was used (research support, content generation, or revision feedback)
- Over 5 million Authorship reports generated since October 2024 beta

**Design insight:** Authorship doesn't block AI use — it makes it visible. This enables "nuanced conversations about appropriate AI use" rather than blanket AI policies.

Source: [Grammarly Authorship](https://www.grammarly.com/authorship), [BusinessWire - Word Expansion](https://www.businesswire.com/news/home/20250407350350/en/)

## Conflict Resolution Technologies

### CRDTs for Human-Agent Editing

CRDTs (Conflict-Free Replicated Data Types) are the standard technology for real-time collaborative editing. Yjs is the dominant implementation. ([Tiptap Collaboration](https://tiptap.dev/product/collaboration))

- **Yjs** — used in the academic study above for human+AI collaboration
- **Tiptap Collaboration** — integrates Yjs for real-time updates and conflict-free editing
- **Eg-walker** — newer alternative, "better, faster, smaller" than traditional CRDTs ([arXiv](https://arxiv.org/html/2409.14252v1))

### AI-Enhanced Conflict Resolution

"AI potentially spotting conflicts before they happen by analyzing how teams edit and work together, allowing teams to tackle issues early." This is prospective — no production implementation found. ([Hoverify Blog](https://tryhoverify.com/blog/conflict-resolution-in-real-time-collaborative-editing/))

### Git-Based Conflict Resolution for Agent Work

Agent orchestrators use git worktree isolation to avoid conflicts entirely:
- **Composio Agent Orchestrator** — each agent gets own worktree, branch, PR. Reconciler for automatic conflict resolution. ([GitHub](https://github.com/ComposioHQ/agent-orchestrator))
- **Overstory** — merges agent work back with tiered conflict resolution. ([GitHub](https://github.com/jayminwest/overstory))
- **ccswarm** — Git worktree isolation for parallel development. ([GitHub](https://github.com/nwiizo/ccswarm))

## Figma's Collaborative AI Pattern

Figma's multiplayer canvas provides the best model for human+AI presence awareness: ([OpenAI - Figma Partnership](https://openai.com/index/figma-partnership/))

- Two people can work in the same file, see each other's avatars, and co-create with an AI assistant
- Broadcasting and rendering dozens of cursors smoothly requires throttling and performance optimizations
- AI agents act as "always-on design partners" — offering suggestions, catching inconsistencies, learning team style

This is notable because Figma treats AI as another cursor in the workspace — same presence model as human collaborators, but with distinct visual identity.

## The HCI Research Gap

The Frontiers systematic review "Human-AI collaboration is not very collaborative yet" (2024) analyzed 105 articles and found: ([Frontiers in Computer Science](https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2024.1521066/full))

- Current interactions are dominated by simplistic collaboration paradigms
- Little support for truly interactive functionality
- Seven interaction patterns identified, but most implementations use only the simplest ones
- The Delegation pattern (where agents reassign decisions) is under-explored

A scoping review of 134 CHI/CSCW papers (2025) produced an integrated framework of agency patterns, control mechanisms, and interaction contexts. Key finding: "Reactive agency" (AI responds to user actions) dominates; proactive agency is rare. ([arXiv](https://arxiv.org/html/2507.06000v2))

## Implications for Sherpa Studio

1. **Comment-based agent contributions** — agents suggest changes via proposals/comments, never directly edit shared documents. This matches Sherpa's existing initiative convention (proposals, not direct edits).

2. **Authorship visibility** — every agent contribution should be attributable. Sherpa's behavioral agent system already names agents; the UI should make agent contributions visually distinct.

3. **Territorial ownership is natural** — users will treat "their" agents as personal tools. Don't fight this; design for it. But make agent output visible to all.

4. **Git worktree isolation for execution** — agents work in isolated worktrees (already Sherpa convention), merge back via PRs/proposals. This avoids CRDT complexity entirely for code/document conflicts.

5. **Manual triggers over autonomous** — users strongly prefer triggering agent work explicitly. Autonomous triggers should be opt-in with clear visibility (Kiro hooks model).

6. **The collaboration research says we're doing it right** — Sherpa's model (proposals, not direct edits; human review; agent as delegated worker, not collaborator) matches what HCI research says works.

## Sources

- [arXiv - Collaborative Document Editing with Multiple Users and AI Agents](https://arxiv.org/html/2509.11826)
- [arXiv - Abstract](https://arxiv.org/abs/2509.11826)
- [Grammarly Blog - Superhuman Authorship](https://www.grammarly.com/blog/company/superhuman-authorship-docs/)
- [Grammarly Authorship](https://www.grammarly.com/authorship)
- [BusinessWire - Grammarly Authorship in Word](https://www.businesswire.com/news/home/20250407350350/en/)
- [Tiptap Collaboration](https://tiptap.dev/product/collaboration)
- [arXiv - Eg-walker](https://arxiv.org/html/2409.14252v1)
- [Hoverify - Conflict Resolution](https://tryhoverify.com/blog/conflict-resolution-in-real-time-collaborative-editing/)
- [Velt - CRDT Implementation Guide](https://velt.dev/blog/crdt-implementation-guide-conflict-free-apps)
- [Composio Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
- [Overstory](https://github.com/jayminwest/overstory)
- [ccswarm](https://github.com/nwiizo/ccswarm)
- [OpenAI - Figma Partnership](https://openai.com/index/figma-partnership/)
- [Figma Make](https://www.figma.com/make/)
- [Frontiers - Human-AI Collaboration Taxonomy](https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2024.1521066/full)
- [arXiv - Agency Patterns Scoping Review](https://arxiv.org/html/2507.06000v2)
- [Cognigy - Collaborative Editing](https://www.cognigy.com/product-updates/collaborative-editing)
