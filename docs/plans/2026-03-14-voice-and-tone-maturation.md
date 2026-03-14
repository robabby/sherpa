# Voice & Tone Maturation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Sherpa's voice, tone, and content guidelines from 4 files to a complete content governance system — personas, messaging framework, structural sections, agent voice, content templates, and editorial quality gates.

**Architecture:** All deliverables are markdown files in `docs/ux/`, `docs/templates/`, and `.claude/rules/`. Studio already discovers and renders `docs/ux/` via `getDocsByCategory()` in `studio-core/domain.ts:264`. One code change: add `"templates"` to `DOC_CATEGORIES` in `packages/studio-core/src/types.ts:126`. Agent roles get updated context-packages to inject new guidelines into prompts.

**Tech Stack:** Markdown with YAML frontmatter. One TypeScript constant edit. No React/UI work.

**Source documents:**
- Design: `docs/initiatives/voice-and-tone/design.md`
- Proposal: `docs/initiatives/voice-and-tone/proposal.md`
- Research: `docs/initiatives/voice-and-tone/research/iteration-1.md`
- Existing files: `docs/ux/voice-and-tone.md`, `docs/ux/content-guidelines.md`, `docs/ux/product-positioning.md`, `docs/ux/design-principles.md`

---

## Session 1: Guidelines + Personas + Messaging

### Task 1: Create personas file

**Files:**
- Create: `docs/ux/personas.md`

**Context:** Three personas validated by research (T2D3 model, GitLab handbook pattern). Use JTBD format, not demographics. The marketer role at `docs/agents/roles/marketer.md` already references `docs/ux/personas.md` in its context-packages but the file doesn't exist yet.

Personas:
1. **The Practitioner** — User Persona. Developer/AI engineer using the open-source framework. Community, not customer. JTBD: "When I'm building with AI agents, help me define behavioral constraints and quality gates, so my agents are predictable and my work is auditable."
2. **The Technical Leader** — Buyer Persona. Engineering manager evaluating agentic workflows. JTBD: "When I'm evaluating agentic workflows, help me govern AI agents without slowing down shipping, so I can maintain engineering velocity while adding AI capabilities."
3. **The Honest Executive** — Buyer Persona. C-suite who wants candor over credentials. JTBD: "When I'm accountable for AI adoption, help me understand what's real and what's hype, so I can make investment decisions I can defend."

**Step 1: Write `docs/ux/personas.md`**

Each persona needs these fields (per design.md):
- Type (User Persona vs. Buyer Persona)
- JTBD statement ("When [situation], I want [capability] so I can [outcome]")
- Pain points (2-3 bullets)
- Evaluation criteria (what they look for in a solution)
- Objections (why they might say no)
- Content that resonates (formats, channels, depth)
- Path to Sherpa (how they discover and progress — maps journey between personas)

Include a section at the end mapping the journey between personas: Practitioner discovers framework → becomes internal champion → introduces Technical Leader → Technical Leader brings in consulting → Honest Executive approves.

Target: 80-100 lines. Mark as `version: 0.1` in frontmatter — these validate against real content in Session 3.

Cross-reference at the bottom: `*See also: [Product Positioning](./product-positioning.md) for competitive framing, [Messaging Framework](./messaging-framework.md) for per-persona messaging.*`

**Step 2: Verify file renders in Studio**

```bash
pnpm build
```

Expected: Build succeeds. The file should appear under the "UX" category on the `/docs` page (auto-discovered by `listMarkdownFiles("docs/ux")`).

**Step 3: Commit**

```bash
git add docs/ux/personas.md
git commit -m "feat(ux): add JTBD-centered personas — practitioner, technical leader, honest executive"
```

---

### Task 2: Create messaging framework

**Files:**
- Create: `docs/ux/messaging-framework.md`

**Context:** Research (Vector 4) concluded: don't formalize pure StoryBrand. Use three-layer stack: Dunford positioning + Raskin strategic narrative + JTBD per-persona messaging. StoryBrand SB7 is valid as homepage wireframe only.

**Step 1: Write `docs/ux/messaging-framework.md`**

Three sections matching the three layers:

**Layer 1: Positioning (Dunford's five components)**
- **Competitive alternatives:** What customers do without Sherpa — (a) no governance at all, (b) DIY governance with internal conventions, (c) traditional consultancy with proprietary methodology, (d) platform-based governance tools (LatticeFlow, etc.)
- **Unique attributes:** Behavioral constraints (not identity prompts), filesystem-based governance (travels with code), "we use what we ship" (same framework for consulting and open-source), anti-hype positioning backed by research
- **Value:** For each persona — map unique attributes to persona-specific value statements
- **Best-fit customers:** People who value competence over performance (from product-positioning.md)
- **Market category:** "Behavioral governance for agentic workflows"

**Layer 2: Strategic Narrative (Raskin's five elements)**
- **The Shift:** AI agents are becoming autonomous workers, not just tools. The transition from AI-as-copilot to AI-as-workforce is underway.
- **The Stakes:** Organizations that don't govern agentic workflows will ship unreliable, unauditable AI. The 95% pilot failure rate is a governance problem, not a technology problem.
- **The Promised Land:** Teams shipping AI workflows with behavioral governance built in — predictable agents, auditable decisions, governance that travels with the code.
- **The Magic Gifts:** (a) The framework — behavioral constraints, initiative lifecycle, quality gates, filesystem-based governance. (b) The consulting practice — guides who built and use the framework daily.
- **The Evidence:** Sherpa governs itself — the framework's own initiative system, task dispatch, and quality gates are the proof. Plus engagement data as it accumulates.

**Layer 3: Per-Persona Messaging (JTBD-informed)**
For each persona: primary message, three supporting points, proof points, CTA. Reference the persona JTBD statements from personas.md.

Include a note: "StoryBrand SB7 (Character → Problem → Guide → Plan → Success) is a valid wireframe for the homepage hero section. It is NOT the company messaging framework — it flattens Sherpa's dual-product, multi-audience differentiation."

Target: 90-120 lines. Cross-reference product-positioning.md and personas.md.

**Step 2: Commit**

```bash
git add docs/ux/messaging-framework.md
git commit -m "feat(ux): add three-layer messaging framework — Dunford positioning, Raskin narrative, JTBD messaging"
```

---

### Task 3: Create accessibility and inclusion guidelines

**Files:**
- Create: `docs/ux/accessibility-and-inclusion.md`

**Context:** Research (Vector 1) identified this as high priority — every mature style guide (Mailchimp, Intuit, GOV.UK) has dedicated accessibility and inclusive language sections. Sherpa has none. This covers both writing accessible content (for the website and Studio) and using inclusive language.

**Step 1: Write `docs/ux/accessibility-and-inclusion.md`**

Two main sections:

**Writing Accessible Content** (modeled on Mailchimp's accessibility chapter):
- Use plain language (connects to readability targets in voice-and-tone.md)
- Structure content with headings (H2 → H3 → H4, never skip levels)
- Write descriptive link text (not "click here" — describe the destination)
- Add alt text for images (describe function, not appearance)
- Use tables for data, not layout
- Don't rely on color alone to convey meaning
- Write descriptive button labels (not "Submit" — "Save initiative" or "Send message")

**Inclusive Language:**
- Use gender-neutral language ("they" as singular, avoid "guys" for mixed groups)
- Avoid ability-based metaphors ("blind spot" → "gap," "crippled" → "broken," "lame" → "weak")
- Write about disability without euphemism ("disabled person" or "person with a disability" — follow the person's preference, not a formula)
- Avoid culturally specific idioms (relevant if content is translated)
- Don't use "simple" or "easy" to describe tasks (what's simple for one person may not be for another)

Keep it practical — do/don't examples for each rule, matching Sherpa's existing guideline style.

Target: 60-80 lines. Cross-reference voice-and-tone.md.

**Step 2: Commit**

```bash
git add docs/ux/accessibility-and-inclusion.md
git commit -m "feat(ux): add accessibility and inclusive language guidelines"
```

---

### Task 4: Create grammar and mechanics guide

**Files:**
- Create: `docs/ux/grammar-and-mechanics.md`

**Context:** Every mature style guide has explicit grammar/mechanics rules. Sherpa's existing docs are implicitly consistent but nothing is codified. This prevents drift as more content producers (human and AI) contribute.

**Step 1: Write `docs/ux/grammar-and-mechanics.md`**

Sections:

**Capitalization:**
- Sentence case for headings ("Define behavioral constraints" not "Define Behavioral Constraints")
- Title case only for proper nouns and product names (Sherpa, Studio, WavePoint)
- Don't capitalize "open source" (it's not a proper noun — per Google open-source style guide)
- Framework concepts are lowercase ("initiative," "behavioral constraint," "quality gate") unless starting a sentence

**Numbers:**
- Spell out one through nine; use numerals for 10+
- Always use numerals for: percentages (5%), data points, measurements, versions (Node 20)
- Use commas in numbers over 999 (1,000 not 1000)

**Dates:**
- ISO 8601 in code and frontmatter (2026-03-14)
- Human-readable in prose ("March 14, 2026" or "March 2026")

**Punctuation:**
- Serial (Oxford) comma: "strategy, governance, and execution"
- Em dash with no spaces for parenthetical ("governance — not just strategy — matters")
- One space after periods
- No periods in headings
- Periods in bullet points only if they're complete sentences

**Lists:**
- Use numbered lists for sequential steps
- Use bullet lists for unordered items
- Capitalize first word of each item
- Parallel structure (all items start with same part of speech)

**Technical formatting:**
- Code references in backticks: `defineConfig()`, `sherpa.config.ts`
- File paths in backticks: `docs/agents/roles/`
- CLI commands in code blocks with the shell prompt omitted

Target: 50-70 lines.

**Step 2: Commit**

```bash
git add docs/ux/grammar-and-mechanics.md
git commit -m "feat(ux): add grammar and mechanics guide — capitalization, numbers, dates, punctuation"
```

---

### Task 5: Extend voice-and-tone.md

**Files:**
- Modify: `docs/ux/voice-and-tone.md` (currently 158 lines)

**Context:** Add three sections identified as gaps by research: readability targets, NNGroup tone dimensions, and emotional-context tone matrix. Keep total under 200 lines by being concise.

**Step 1: Add readability targets section**

Insert before the "Complementary Tool" section (before line 150). Add a section:

```markdown
---

## Readability Targets

| Content type | Grade level | Why |
|-------------|-------------|-----|
| Marketing / website | Grade 8 | Accessible to all audiences |
| Blog / thought leadership | Grade 9-10 | Technical but not academic |
| Framework documentation | Grade 10-12 | Technical audience expects precision |
| Consulting content | Grade 8-9 | Executives value clarity |
| Error messages / UI text | Grade 6 | Must be instantly understood |

Even expert readers prefer simpler text — it's faster to parse. When in doubt, target lower.
```

**Step 2: Add tone dimensions**

Insert after the "Tone (Shifts by Context)" table (after line 53). Add a compact plotting of NNGroup's four dimensions:

```markdown
### Where We Sit (NNGroup Dimensions)

| Dimension | Our position |
|-----------|-------------|
| Funny ↔ Serious | Serious — dry wit occasionally, never jokes |
| Formal ↔ Casual | Middle-casual — conversational but not slangy |
| Respectful ↔ Irreverent | Respectful — we take the reader's problems seriously |
| Enthusiastic ↔ Matter-of-fact | Matter-of-fact — let evidence carry the energy |
```

**Step 3: Add emotional-context tone matrix**

Extend the existing tone table with a user emotional state column. Replace the current tone table (lines 45-53) with an expanded version:

```markdown
| Context | User feeling | Our tone | Example |
|---------|-------------|----------|---------|
| Marketing / website | Curious, evaluating | Warm, confident | "Ship AI workflows you can actually trust." |
| Framework docs | Focused, building | Clear, practical | "Define behavioral constraints in the agent role file." |
| Consulting content | Uncertain, cautious | Thoughtful, grounded | "The gap isn't talent. It's that governance comes last." |
| Blog / thought leadership | Browsing, skeptical | Conversational, specific | "We ran this framework on 12 engagements before open-sourcing it." |
| Empty states | Exploring, maybe lost | Inviting, unhurried | "Nothing here yet. Start with a proposal." |
| Errors | Frustrated, anxious | Honest, calm, solution-first | "Something went wrong loading the initiative. Try refreshing." |
| Success messages | Accomplished | Warm, brief | "Saved." or "You're in." |
| First-time setup | Overwhelmed, hopeful | Encouraging, concise | "Three files. That's all you need to start." |
| Billing / pricing | Cautious, comparing | Transparent, direct | "Workshops start at X. Custom engagements by conversation." |
```

**Step 4: Update cross-references**

Update the "Complementary Tool" section's final line to reference new files:

```markdown
Apply both: tone first (does this sound like us?), then clarity (is this as tight as it can be?).

*See also: [Content Guidelines](./content-guidelines.md) for what we write, [Accessibility & Inclusion](./accessibility-and-inclusion.md) for accessible and inclusive writing, [Grammar & Mechanics](./grammar-and-mechanics.md) for formatting rules.*
```

**Step 5: Verify line count stays under 200**

The additions (~25 lines) minus the table replacement (~net +5 lines) should keep the file around 180 lines.

**Step 6: Commit**

```bash
git add docs/ux/voice-and-tone.md
git commit -m "feat(ux): add readability targets, tone dimensions, and emotional-context matrix to voice guide"
```

---

### Task 6: Extend content-guidelines.md

**Files:**
- Modify: `docs/ux/content-guidelines.md` (currently 166 lines)

**Step 1: Add readability targets per content type**

Insert after the "Review Checklist" section (after line 161). Add:

```markdown
## Readability

See [Voice & Tone — Readability Targets](./voice-and-tone.md#readability-targets) for grade levels by content type. For quick reference:

- Marketing copy: short sentences, concrete words, Grade 8
- Blog posts: can go deeper but lead each section with the conclusion first (answer-first pattern)
- Framework docs: precision over simplicity, but avoid jargon-as-decoration
- UI text: one idea per message, Grade 6
```

**Step 2: Update cross-references**

Replace the final line (line 165):

```markdown
*See also: [Voice & Tone](./voice-and-tone.md) for how we speak, [Design Principles](./design-principles.md) for how we build, [Personas](./personas.md) for who we write for, [Messaging Framework](./messaging-framework.md) for what we say.*
```

**Step 3: Add a new checklist item**

In the Review Checklist (line 153-161), add:

```markdown
- [ ] Does it meet the readability target for its content type?
- [ ] Is it accessible? (See [Accessibility & Inclusion](./accessibility-and-inclusion.md))
```

**Step 4: Verify line count stays under 200**

Additions are ~15 lines, bringing total to ~181.

**Step 5: Commit**

```bash
git add docs/ux/content-guidelines.md
git commit -m "feat(ux): add readability section and cross-references to content guidelines"
```

---

### Task 7: Annotate product-positioning.md with Dunford structure

**Files:**
- Modify: `docs/ux/product-positioning.md` (currently 94 lines)

**Context:** The file already intuits Dunford's five components without naming them. Add inline annotations that make the mapping explicit, so the messaging framework can reference them. Don't restructure — annotate.

**Step 1: Add Dunford annotations**

Add a brief note after the "Sherpa" heading (after line 6):

```markdown
*This document follows April Dunford's five-component positioning structure. See [Messaging Framework](./messaging-framework.md) for how positioning flows into narrative and per-persona messaging.*
```

Add section labels as inline comments in the existing structure:
- After "## What Sherpa Is Not" heading, add: `<!-- Dunford: Competitive Alternatives -->`
- After "## What Makes Sherpa Different" heading, add: `<!-- Dunford: Unique Attributes + Value -->`
- After "## Who It's For" heading, add: `<!-- Dunford: Best-Fit Customers -->`
- The market category is implicit in the one-sentence definition — add a label: `<!-- Dunford: Market Category = "Behavioral governance for agentic workflows" -->`

**Step 2: Update cross-reference footer**

Replace line 93:

```markdown
*See also: [Design Principles](./design-principles.md) for how we build, [Voice & Tone](./voice-and-tone.md) for how we speak, [Content Guidelines](./content-guidelines.md) for what we write, [Messaging Framework](./messaging-framework.md) for narrative structure, [Personas](./personas.md) for audience archetypes.*
```

**Step 3: Commit**

```bash
git add docs/ux/product-positioning.md
git commit -m "feat(ux): annotate product positioning with Dunford five-component structure"
```

---

### Task 8: Session 1 review checkpoint

**Step 1: Verify all new files exist and build succeeds**

```bash
ls docs/ux/
pnpm build
```

Expected: 8 files in `docs/ux/` (4 original + 4 new: personas.md, messaging-framework.md, accessibility-and-inclusion.md, grammar-and-mechanics.md). Build succeeds.

**Step 2: Spot-check line counts**

```bash
wc -l docs/ux/*.md
```

Expected: No file exceeds 200 lines.

**Step 3: Review cross-references**

Verify every new file cross-references related files. Verify every modified file's cross-references include the new files.

**Step 4: Update activity log**

Add to `docs/initiatives/voice-and-tone/activity.md`:

```markdown
## 2026-03-14 — Session 1: Guidelines + Personas + Messaging

- Created docs/ux/personas.md (3 JTBD-centered personas)
- Created docs/ux/messaging-framework.md (Dunford + Raskin + JTBD)
- Created docs/ux/accessibility-and-inclusion.md
- Created docs/ux/grammar-and-mechanics.md
- Extended voice-and-tone.md (readability targets, tone dimensions, emotional-context matrix)
- Extended content-guidelines.md (readability section, updated checklist)
- Annotated product-positioning.md (Dunford five-component labels)
```

**Step 5: Commit**

```bash
git add docs/initiatives/voice-and-tone/activity.md
git commit -m "docs: update voice-and-tone activity log — Session 1 complete"
```

---

## Session 2: Agent Voice + Templates + Convention

### Task 9: Create agent voice guidelines

**Files:**
- Create: `docs/ux/agent-voice.md`

**Context:** This is Sherpa's unique contribution — no competitor or style guide covers AI agent voice well. The behavioral engineering rule (`.claude/rules/behavioral-engineering.md`) defines how to write agent roles. Agent voice defines how agents should communicate in their output. Different concern.

Read before writing:
- `.claude/rules/behavioral-engineering.md` — how roles are defined
- `docs/agents/roles/marketer.md` — example of disposition + quality-bar pattern
- `docs/agents/roles/technical-writer.md` — example of minimalist disposition

**Step 1: Write `docs/ux/agent-voice.md`**

Sections:

**The Principle:** Voice constraints are behavioral constraints. Just as role definitions use `disposition:` and `quality-bar:` to shape behavior, voice guidelines use word lists, tone dimensions, and readability targets to shape communication. No identity claims ("You are an expert writer") — only behavioral defaults ("Default to Grade 8 readability. Use active voice.").

**Voice Inheritance:** All agents inherit Sherpa's four voice attributes as defaults:
- Calm, Not Cold
- Knowledgeable, Not Academic
- Present, Not Precious
- Honest, Not Cynical

These apply to agent-generated text (blog drafts, documentation, UI copy, case study outlines) unless overridden by role-specific disposition.

**Role-Specific Voice:** How `disposition:` in role frontmatter adjusts voice:
- `disposition: restrained` (designer) → fewer words, every element justified
- `disposition: minimalist` (technical-writer) → passes the Mistake Test, under 200 lines
- `disposition: grounded` (marketer) → no superlatives, evidence-first

**Output Quality Gates:** Agent-generated content must pass:
- Zero words from the avoid-list (voice-and-tone.md)
- Readability target for content type (voice-and-tone.md)
- Headline Test (voice-and-tone.md)
- Review Checklist (content-guidelines.md)
- Content that fails = NEEDS WORK in Judge evaluation

**AI Content Disclosure:**
- Content fully generated by AI: label as "AI-generated" in metadata/frontmatter
- Content drafted by AI and edited by human: label as "AI-assisted"
- Content where AI performed research but human wrote: no label needed
- Position: Transparency about AI involvement is consistent with "Honest, Not Cynical" and "Show the Work" principles
- Note: EU AI Act Article 50 enforcement begins Aug 2026 — Sherpa should lead, not comply retroactively

Target: 70-90 lines.

**Step 2: Commit**

```bash
git add docs/ux/agent-voice.md
git commit -m "feat(ux): add agent voice guidelines — behavioral constraints for AI-generated content"
```

---

### Task 10: Create component content patterns

**Files:**
- Create: `docs/ux/component-content.md`

**Context:** Follows Atlassian's model. Per-component content patterns for Studio UI — structure, tone, and do/don't examples for each message type.

**Step 1: Write `docs/ux/component-content.md`**

Cover these component types (per design.md):

| Component | Structure | Tone |
|-----------|-----------|------|
| Error messages | What happened + why + how to fix. 1-2 sentences. Imperative verbs. | Calm, direct, solution-first |
| Empty states | Heading: describes state or what user can do. Body: reason + next step. | Inviting, unhurried |
| Success messages | Confirm what happened. Close the loop. 1 sentence max. | Warm, brief |
| Warning messages | What might go wrong + what to do to prevent it. | Clear, not alarming |
| Info messages | One key point of additional context. | Helpful, concise |
| Confirmation dialogs | What will happen + is it reversible? Action verb on primary button. | Direct, specific |
| Loading states | Describe what's happening if > 2 seconds. | Calm, informative |
| Tooltips | One sentence. No period if fragment. | Brief, clarifying |

For each: 2-3 do/don't examples matching Sherpa's existing table format:

```markdown
| Do | Don't |
|----|-------|
| "Initiative not found. Check the slug." | "Oops! We couldn't find that initiative anywhere!" |
| "Something went wrong. Your changes weren't saved." | "An unexpected error has occurred. We apologize for the inconvenience." |
```

Target: 60-80 lines.

**Step 2: Commit**

```bash
git add docs/ux/component-content.md
git commit -m "feat(ux): add component-level content patterns for Studio UI"
```

---

### Task 11: Create content templates directory and files

**Files:**
- Create: `docs/templates/content-brief.md`
- Create: `docs/templates/blog-post.md`
- Create: `docs/templates/case-study.md`

**Context:** Templates are markdown files, not code. They double as human planning documents and structured prompts for AI content agents. The content brief is the highest-leverage missing abstraction (research V5).

**Step 1: Create directory**

```bash
mkdir -p docs/templates
```

**Step 2: Write `docs/templates/content-brief.md`**

Use the frontmatter schema from design.md:

```yaml
---
brief-type: blog-post | case-study | service-page | framework-doc
target-persona: practitioner | technical-leader | honest-executive
tone-variant: warm-confident | clear-practical | thoughtful-grounded | conversational-specific
word-count: [min]-[max]
readability-target: grade-[N]
required-sections: []
seo-primary: ""
status: draft | in-review | approved | published
---
```

Then the template body with sections: Brief, Target Persona, Key Messages, Required Elements (checklist), Sources/Research, Voice Notes. Add usage instructions at the top explaining: "Copy this file. Fill in the frontmatter. Write the brief. This file serves as both a planning document and a structured prompt for AI content agents."

**Step 3: Write `docs/templates/blog-post.md`**

Three variant structures in one file (per design.md):

**How-To:** Prerequisites → Steps (gerunds: "Step 1 — Installing") → Conclusion
**Analysis:** The situation (with data) → What we found → What it means → What to do
**Case-from-the-Field:** What happened → What we did → What worked → What was hard

Each variant: frontmatter schema, section headings, one-line guidance per section. Include the "answer-first" pattern: "Lead each major section with the conclusion in the first 30-50 words, then provide context and evidence."

Reference content-guidelines.md for the Content Hub Topics (AI Literacy, Agentic Workflows, Governance Patterns) and the Depth Test.

**Step 4: Write `docs/templates/case-study.md`**

Preserve Sherpa's distinctive four-section format from content-guidelines.md:

1. **The Situation** — What the organization was dealing with (1-2 sentences)
2. **What We Did** — Specific actions, tools used, timeline
3. **What Happened** — Measurable results where possible
4. **What Was Hard** — Honest about friction, trade-offs, surprises

Add frontmatter schema: client-type, engagement-type, tools-used, timeline, anonymous (boolean). Add the optional Isoline "Blind Spots" fifth section: what gap did the engagement close? What new opportunities emerged?

Note in the template: "The 'What Was Hard' section is a differentiator. Every competitor publishes sanitized success stories. Sherpa includes friction because honesty is a design principle."

**Step 5: Commit**

```bash
git add docs/templates/
git commit -m "feat(ux): add content templates — content brief, blog post, case study"
```

---

### Task 12: Create content quality convention rule

**Files:**
- Create: `.claude/rules/content-quality.md`

**Context:** The editorial QA scorecard from research (Search Roost model) adapted for Sherpa. Lives in `.claude/rules/` so it auto-loads for AI agents during content work. Maps to the Judge role's evaluation criteria.

**Step 1: Write `.claude/rules/content-quality.md`**

```yaml
---
description: Editorial quality gates for content production
globs:
  - "docs/templates/**"
alwaysApply: false
---
```

Body — the Pass/Needs Work scorecard:

**Content Quality Gates**

Before publishing or marking content as complete, evaluate against these criteria. Each is Pass or Needs Work.

1. **Sourced claims** — All factual claims have a source or are marked as Sherpa's own experience
2. **Headline Test** — No headline could appear in a generic AI consulting pitch deck (see `docs/ux/voice-and-tone.md`)
3. **Depth Test** — A senior engineering leader would find this useful, not just familiar (see `docs/ux/content-guidelines.md`)
4. **Avoid-list clean** — Zero words from the Words We Avoid list
5. **Structure** — Clear H2/H3 hierarchy, answer-first pattern in each section
6. **Evidence separated** — "What we know" vs. "our analysis" are clearly distinguishable
7. **Readability** — Meets target for content type (see `docs/ux/voice-and-tone.md#readability-targets`)
8. **Persona-aligned** — Content speaks to a specific persona's JTBD, not to everyone generically

**Scoring:** 3+ items marked Needs Work → content is not ready to publish. Fix and re-evaluate.

This maps to the Planner/Worker/Judge pipeline: the Judge evaluates content against this scorecard.

**Step 2: Commit**

```bash
git add .claude/rules/content-quality.md
git commit -m "feat(rules): add content quality gates — editorial QA scorecard for AI agents"
```

---

### Task 13: Update agent role context-packages

**Files:**
- Modify: `docs/agents/roles/marketer.md:18-22` (context-packages)
- Modify: `docs/agents/roles/technical-writer.md:18-22` (context-packages)
- Modify: `docs/agents/roles/designer.md:18-23` (context-packages)

**Step 1: Update marketer.md context-packages**

The marketer already references `docs/ux/personas.md` (which now exists). Add `docs/ux/messaging-framework.md` and `docs/ux/agent-voice.md`:

```yaml
context-packages:
  - docs/ux/vision.md
  - docs/ux/voice-and-tone.md
  - docs/ux/personas.md
  - docs/ux/messaging-framework.md
  - docs/ux/agent-voice.md
  - docs/architecture/intelligence-native.md
```

**Step 2: Update technical-writer.md context-packages**

Add `docs/ux/content-guidelines.md` and `docs/ux/agent-voice.md`:

```yaml
context-packages:
  - CLAUDE.md
  - docs/ux/voice-and-tone.md
  - docs/ux/content-guidelines.md
  - docs/ux/agent-voice.md
```

Note: Keep the existing CLAUDE.md references (`apps/web/CLAUDE.md`, `apps/web/src/lib/CLAUDE.md`) — these are WavePoint paths that may still resolve or may be cleaned up in a separate pass.

**Step 3: Update designer.md context-packages**

Add `docs/ux/component-content.md`:

```yaml
context-packages:
  - docs/ux/vision.md
  - docs/ux/design-principles.md
  - docs/ux/voice-and-tone.md
  - docs/ux/component-content.md
  - docs/ux/interaction-patterns.md
  - apps/web/src/components/CLAUDE.md
```

**Step 4: Commit**

```bash
git add docs/agents/roles/marketer.md docs/agents/roles/technical-writer.md docs/agents/roles/designer.md
git commit -m "feat(roles): update marketer, technical-writer, designer context-packages with new UX docs"
```

---

### Task 14: Add "templates" to DOC_CATEGORIES

**Files:**
- Modify: `packages/studio-core/src/types.ts:126-133`

**Context:** Studio discovers docs by category via `DOC_CATEGORIES`. Adding `"templates"` makes `docs/templates/` appear on the `/docs` page automatically.

**Step 1: Add "templates" to the array**

In `packages/studio-core/src/types.ts`, change:

```typescript
export const DOC_CATEGORIES = [
  "research",
  "plans",
  "specs",
  "ux",
  "architecture",
  "curation",
] as const;
```

To:

```typescript
export const DOC_CATEGORIES = [
  "research",
  "plans",
  "specs",
  "ux",
  "architecture",
  "curation",
  "templates",
] as const;
```

**Step 2: Verify build**

```bash
pnpm check && pnpm build
```

Expected: Typecheck and build both pass. The `DocCategory` type now includes `"templates"`.

**Step 3: Commit**

```bash
git add packages/studio-core/src/types.ts
git commit -m "feat(studio-core): add 'templates' to DOC_CATEGORIES for Studio doc discovery"
```

---

### Task 15: Session 2 review checkpoint

**Step 1: Full inventory**

```bash
echo "=== docs/ux/ ===" && ls docs/ux/
echo "=== docs/templates/ ===" && ls docs/templates/
echo "=== .claude/rules/ ===" && ls .claude/rules/
```

Expected:
- `docs/ux/`: 10 files (4 original + 6 new)
- `docs/templates/`: 3 files
- `.claude/rules/`: 6 files (5 original + 1 new)

**Step 2: Line count check**

```bash
wc -l docs/ux/*.md docs/templates/*.md .claude/rules/content-quality.md
```

Expected: No file exceeds 200 lines.

**Step 3: Build verification**

```bash
pnpm check && pnpm build
```

Expected: Both pass.

**Step 4: Update activity log and proposal status**

Add to `docs/initiatives/voice-and-tone/activity.md`:

```markdown
## 2026-03-14 — Session 2: Agent Voice + Templates + Convention

- Created docs/ux/agent-voice.md (behavioral constraints → voice constraints)
- Created docs/ux/component-content.md (Studio UI content patterns)
- Created docs/templates/content-brief.md, blog-post.md, case-study.md
- Created .claude/rules/content-quality.md (editorial QA scorecard)
- Updated marketer, technical-writer, designer role context-packages
- Added "templates" to DOC_CATEGORIES in studio-core
- Initiative implementation complete — Session 3 (validation) runs when website content is ready
```

Update proposal frontmatter: `status: in-progress` → keep as-is until Session 3 validation.

**Step 5: Commit**

```bash
git add docs/initiatives/voice-and-tone/activity.md
git commit -m "docs: update voice-and-tone activity log — Session 2 complete"
```
