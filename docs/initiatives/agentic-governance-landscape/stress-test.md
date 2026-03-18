---
stress-tested: 2026-03-18
assumptions-extracted: 8
tested: 5
confirmed: 0
refuted: 3
inconclusive: 2
human-required: 1
---

# Stress Test: Agentic Governance Landscape

## Assumptions Inventory

| # | Assumption | Rating | Load-Bearing | Test Result |
|---|-----------|--------|-------------|-------------|
| A1 | The behavioral layer is empty because nobody's built it yet | Asserted | **Yes** | **Partially Refuted** |
| A2 | Developers will adopt governance bottom-up like linters | Asserted | **Yes** | **Refuted** |
| A3 | Convention-based governance can achieve reliable behavioral compliance | Reasoned | **Yes** | **Refuted** (as standalone) |
| A4 | The three-layer stack is the right market segmentation | Reasoned | Medium | Inconclusive |
| A5 | Cross-agent governance is a real unmet need | Reasoned | Medium | Confirmed (weak) |
| A6 | First-mover advantage is durable here | Asserted | **Yes** | **Refuted** |
| A7 | The behavioral layer won't be absorbed by platforms | Asserted | **Yes** | Inconclusive |
| A8 | 90% dev AI adoption + 32% governance = addressable gap | Sourced | Low | Not tested (sourced) |

**3 of 5 load-bearing assumptions refuted. 2 inconclusive. 0 cleanly confirmed.**

---

## Results: Refuted

### A1: "The behavioral layer is empty" — PARTIALLY REFUTED

**Test:** Search for products that do behavioral governance under different names, and for failed attempts that suggest the market rejected it.

**Evidence:**
- **The layer is NOT empty.** AGENTS.md has 60,000+ repos and is now under the Linux Foundation's Agentic AI Foundation with OpenAI, Anthropic, AWS, Google, Microsoft as platinum members. Agent OS (Builder Methods) explicitly does convention-as-code. Galileo Agent Control (Apache 2.0, Mar 2026) is an open-source governance control plane.
- **However, nobody has built the integrated system.** These are all point solutions: AGENTS.md is a static file format with no enforcement or lifecycle. Agent OS is a policy layer with no behavioral definitions. Galileo is runtime, not convention-based. Nobody combines behavioral definitions + initiative lifecycle + convention sync + dispatch coordination + quality gates.
- **LLM agents violate behavioral constraints 30-50% of the time** under KPI pressure (arxiv 2512.20798, 12 frontier models). 9 of 12 models fell in the 30-50% violation range. "Deliberative misalignment" documented — agents recognized actions as unethical but performed them anyway.
- **Rules files can make agents worse.** ETH Zurich (Feb 2026): LLM-generated rules caused -3% success rate with +20% cost increase. Over 50% of rules in typical files were redundant or misclassified.

**Refined claim:** "Nobody has built an *integrated* behavioral governance system. The format layer (convention files) is being commoditized. The integration layer (making conventions executable, enforceable, and lifecycle-managed) is genuinely empty — but conventions alone don't work."

### A2: "Developers will adopt governance bottom-up" — REFUTED

**Test:** Search for structural evidence that governance adoption is always top-down, and for failed developer-first governance tools.

**Evidence:**
- **The linter analogy is structurally flawed.** Linters provide immediate individual value on every keystroke; governance provides organizational value over time. These are structurally different adoption dynamics per Rogers' diffusion of innovations — linters are "optional innovation decisions" (individual adopts), governance is a "collective innovation decision" (requires consensus).
- **Snyk is the definitive case study.** Snyk reached 300,000+ developers bottom-up, but the paid self-serve plan failed. Developers used it, valued it, and did not pay for it. Revenue required pivoting to enterprise sales targeting security leaders. **Developers adopt; executives purchase.**
- **Shift-left security largely failed.** The biggest attempt to make developers own governance produced alert fatigue, tool sprawl, and shadow workarounds. AI coding assistants increased PRs by 20% but change failure rates increased 30%.
- **PLG structurally fails in security/compliance categories.** No major security/governance startup exit was achieved through PLG-primary strategies. The buyer-user split is structural.
- **The 90%/32% gap persists despite awareness.** If bottom-up governance adoption worked, this gap would be closing. It's not.

**Counter-evidence that partially survives:** Developer-first governance works ONLY when governance is a *byproduct* of something developers want, not the primary pitch. OPA, Husky/commitlint, Dependabot achieved organic adoption because governance was embedded in code tooling that provided immediate value. Google Cloud's "golden paths with guardrails" model — embed governance in self-service tooling so developers adopt the path because it's faster, and governance comes along for free.

**Refined claim:** "Governance is a side-effect, never the pitch. Developers adopt tools that happen to produce governance artifacts. The Snyk playbook: developer adoption bottom-up + enterprise sales top-down. Never one alone."

### A3: "Convention-based governance achieves reliable compliance" — REFUTED (as standalone)

**Test:** Search for empirical data on LLM instruction-following reliability, convention bypass rates, and whether auditors accept advisory governance.

**Evidence (devastating):**
- **IFEval++:** Performance drops up to 61.8% when instructions are rephrased. Even GPT-5 drops 18.3%.
- **Banned lexeme compliance:** 6% adherence (94% violation rate) across 18 models.
- **AgentIF benchmark:** Best-performing model follows fewer than 30% of instructions perfectly in multi-constraint agentic scenarios.
- **CLAUDE.md rules are demonstrably ignored in practice.** GitHub issues #29236, #27032, #28158, #30545, #31946, #34043: agent read rules, acknowledged them, then violated them. Systematic pattern, not isolated incidents.
- **Linear compliance decay:** "Doubling instructions halves compliance rates." (Dev.to, 200-line rules article)
- **Context degradation:** At 32k tokens, 11 of 12 models dropped below 50% of short-context performance (Chroma "Context Rot" research).
- **All prompt-based defenses bypassed.** 12 published defenses tested, all bypassed. Attack success rates >90% for most. Training-based defenses achieved 100% bypass rate. (arxiv 2510.09023)
- **Auditors reject advisory governance.** EU AI Act moves to enforceable operational requirements. Kiteworks guide: "When an auditor asks how your organization governs AI, they are looking for evidence, not a policy document."
- **Sherpa has zero hooks configured.** `.claude/settings.json` has only shadcn permissions. All governance relies on markdown files.

**The quote that should be Sherpa's wake-up call:**
> "Rules in prompts are requests. Hooks in code are laws."

**What makes conventions sufficient (all must hold simultaneously):**
1. Non-adversarial context ✓ (internal tooling)
2. Short context windows (<32k) ✗ (agentic sessions exceed this)
3. Few instructions (<20) ~ (borderline)
4. Human in the loop for every action ✓ (collaborative) / ✗ (dispatched)
5. Low-consequence operations ✗ (file edits, git, code generation)
6. Single agent, single session ✗ (multi-backend dispatch)

**Refined claim:** "Conventions are the policy layer — the intent specification. Policy without enforcement is aspiration, not governance. Sherpa needs conventions AND hooks AND permission scoping AND audit trails. Conventions are the most readable, maintainable, human-friendly part — but they are intent, not enforcement."

### A6: "First-mover advantage is durable" — REFUTED

**Test:** Search for first-movers in developer tools who lost, empty markets that stayed empty, and fast-follower dynamics in AI.

**Evidence:**
- **Developer tool history is first-movers losing.** JSLint→JSHint→ESLint. CoffeeScript→TypeScript. Grunt→Gulp→Webpack→Vite. GitHub Copilot→Cursor. Notably, ESLint (the analogy Sherpa uses) was the *third* entrant. Being first in linting did not help JSLint.
- **AI tooling replication cycle is 6-12 months.** 7+ Copilot alternatives emerged within 2 years of launch.
- **Convention-based governance is conceptually simple and replicable.** Filesystem conventions + prompt engineering. Any well-funded competitor could implement equivalent conventions in weeks.
- **Anthropic is already building primitive behavioral governance.** CLAUDE.md + .claude/rules/ + hooks + managed policies + Compliance API. A closed GitHub issue (#26714) requested `.claude/governance.yaml` — closed as completed. Anthropic is expanding Claude Code governance.
- **GitHub has `.github/agents/*.md`** with push-rule enforcement. Cross-agent convention governance from the world's largest developer platform.
- **Distribution beats innovation in developer tools.** Microsoft can bundle governance into Agent 365 at $0 marginal cost to 500M+ Entra ID users.

**The defensible kernel:** Cross-agent portability is a genuine structural advantage that platform vendors are disincentivized to provide. Microsoft won't build governance that works for Claude Code. Anthropic won't build governance that works in Cursor. The cross-vendor governance layer has a moat — but it's created by vendor fragmentation, not by first-mover timing.

**Refined claim:** "The advantage is architectural (cross-agent portability), not temporal (being first). First-mover provides a 12-24 month window to get architecture right. The window closes when platforms expand or a well-funded competitor appears."

---

## Results: Inconclusive

### A4: "Three-layer stack is the right segmentation" — INCONCLUSIVE

Not directly tested. The three-layer framing emerged from iteration 1 research and maps to observable vendor behavior. Multiple analysts use similar framings (Gartner's four-layer AI TRiSM, AIMultiple's seven-layer stack, Nvidia's five-vendor framework). The risk: Sherpa may be defining a "layer" that is actually a feature within existing layers.

### A7: "Won't be absorbed by platforms" — INCONCLUSIVE

**Evidence for absorption:**
- Microsoft Agent 365 blueprints define *what agents should do* with capability constraints, governance policies, and behavioral templates. Getting close to behavioral governance.
- AGENTS.md standardization under Linux Foundation commoditizes the convention file format.
- Anthropic expanding Claude Code governance features (hooks, managed policies, compliance API).

**Evidence against absorption:**
- Platform vendors build policy enforcement (block/allow at runtime), not convention authoring (defining what good looks like for a specific team).
- ESLint survived because opinionated + extensible + cross-platform. Sherpa shares these properties.
- No platform vendor addresses multi-agent behavioral coordination (initiative lifecycle, dispatch, convention sync). Repository-level context is structurally inaccessible from a cloud control plane.
- HashiCorp survived independently for 12+ years through multi-cloud positioning before IBM acquisition at $6.4B.

**Assessment:** Likely independent at the behavioral/convention layer. Real absorption risk at format layer (AGENTS.md standardization) and enforcement layer (platform policy engines). Sherpa's independence requires staying in the gap between format (commoditized below) and runtime enforcement (absorbed above).

---

## Results: Confirmed (Weak)

### A5: Cross-agent governance is a real unmet need

Confirmed by the coding agent governance research — every vendor's governance is siloed. No platform vendor has incentive to build cross-vendor governance. But the evidence is structural (vendor fragmentation exists) not demand-side (nobody has asked for cross-agent governance by name). Weak confirmation.

---

## Human-Required

### H1: "Is there actual willingness-to-pay for behavioral governance?"

No amount of research can answer whether engineering teams will pay for convention-based governance. This requires customer discovery: conversations with engineering leaders, demo reactions, pilot deployments. Suggested test: Install Sherpa conventions in 3-5 teams. Measure whether they keep using them after the novelty wears off. Track what they'd pay.

---

## Recommended Changes

### 1. STOP saying "the layer is empty"

**Say instead:** "The integration layer — connecting behavioral conventions to enforcement and lifecycle management — is unoccupied. The convention file format is being commoditized. The runtime enforcement layer is well-funded. Sherpa's value is in making conventions executable."

### 2. STOP pitching governance to developers

**Do instead:** Build tools developers want (structured collaboration, reduced rework, better agent outcomes). Governance is the byproduct, not the value proposition. Follow the Snyk playbook: developer adoption bottom-up, enterprise sales top-down.

### 3. ADD enforcement to conventions immediately

**"Rules in prompts are requests. Hooks in code are laws."** Sherpa currently has zero hooks configured. This is the most critical gap. Conventions without enforcement are aspirational, not governance. The minimum viable complement:
- PreToolUse hooks for critical rules (shared artifact protection, authority checks)
- Permission scoping in settings.json
- Authority leases for dispatched autonomous agents
- Audit logging that captures what agents did, not just what they were told

### 4. REFRAME first-mover as architectural advantage

**Stop:** "We're first to this space."
**Start:** "We're the only cross-agent governance layer. Microsoft governs Microsoft agents. Anthropic governs Claude. Sherpa governs the workflow regardless of which agent is executing."

### 5. WATCH three convergence signals

- **Microsoft Agent 365 GA (May 2026):** Does the blueprint system expand into development-time behavioral conventions?
- **AGENTS.md evolution under AAIF:** Does the standard expand to include lifecycle, quality gates, or behavioral constraints? If so, Sherpa should contribute to the standard, not compete with it.
- **Anthropic Claude Code governance expansion:** How fast is the .claude/ ecosystem growing? Is Anthropic building what Sherpa builds?

### 6. VALIDATE demand before investing more sessions

The biggest open risk is H1 — nobody has asked for this by name. The market data (82% cite governance as #1 blocker, 90% using AI with 32% governance) shows pain exists. But "pain exists" ≠ "they'll buy convention-based governance." This needs customer discovery, not more research.
