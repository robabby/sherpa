---
designed: 2026-03-14
type: architecture
components-new: 0
components-modified: 0
files-planned: 14
---

# Voice & Tone Maturation — Design

## Overview

Architecture design for extending Sherpa's voice, tone, and content guidelines from 4 files to a complete content governance system. No UI work — Studio already discovers and renders `docs/ux/` files automatically via `getDocsByCategory()` in `studio-core/domain.ts:264`.

**Shape:** No shape.md — designed from approved proposal + research iteration 1.
**Appetite:** 2 sessions (targeting low end of 2-3 estimate).

## Architecture

### Content Governance Layers

The design introduces three layers of content governance, each serving different consumers:

```
Layer 1: Guidelines (docs/ux/)
  ├── For humans writing content and agents generating it
  ├── Discovered by Studio → displayed on /docs and /conventions
  └── Injected into agent prompts via role context-packages

Layer 2: Templates (docs/templates/)
  ├── For content producers (human or AI) creating specific content types
  ├── Discovered by Studio as doc category (requires one type addition)
  └── Referenced from content briefs and agent task files

Layer 3: Convention Rules (.claude/rules/)
  ├── For AI agents during content generation/review
  ├── Auto-loaded by Claude based on glob patterns
  └── Enforced as behavioral constraints during task execution
```

### File Plan

#### Session 1: Guidelines + Personas + Messaging

**New files:**

| File | Purpose | ~Lines |
|------|---------|--------|
| `docs/ux/personas.md` | Three personas in JTBD format | 80-100 |
| `docs/ux/messaging-framework.md` | Three-layer messaging stack | 90-120 |
| `docs/ux/accessibility-and-inclusion.md` | Accessibility + inclusive language | 60-80 |
| `docs/ux/grammar-and-mechanics.md` | Capitalization, numbers, dates, punctuation | 50-70 |

**Modified files:**

| File | Changes |
|------|---------|
| `docs/ux/voice-and-tone.md` | Add readability targets section. Add NNGroup tone dimensions plot. Add emotional-context tone matrix. |
| `docs/ux/content-guidelines.md` | Add readability targets per content type. Cross-reference new files. |
| `docs/ux/product-positioning.md` | Add Dunford five-component annotations (competitive alternatives, unique attributes, value, best-fit customers, market category). Cross-reference messaging-framework.md. |

#### Session 2: Agent Voice + Templates + Convention

**New files:**

| File | Purpose | ~Lines |
|------|---------|--------|
| `docs/ux/agent-voice.md` | How behavioral constraints map to voice constraints for AI-generated text | 70-90 |
| `docs/ux/component-content.md` | Component-level content patterns for Studio UI (errors, empty states, success, warnings) | 60-80 |
| `docs/templates/content-brief.md` | Frontmatter-rich markdown template for content production | 50-60 |
| `docs/templates/blog-post.md` | Blog post template (three variants: how-to, analysis, case-from-the-field) | 60-80 |
| `docs/templates/case-study.md` | Case study template preserving Sherpa's distinctive 4-section format | 40-50 |
| `.claude/rules/content-quality.md` | Editorial QA scorecard as auto-loaded convention | 40-50 |

**Modified files:**

| File | Changes |
|------|---------|
| `docs/agents/roles/marketer.md` | Update context-packages to include new files |
| `docs/agents/roles/technical-writer.md` | Add content-guidelines.md and templates to context-packages |

### Data Models

No new TypeScript types needed. All files are markdown with YAML frontmatter, consumed by existing `ContentFile` interface in `studio-core/types.ts:169`. Studio discovers them via `listMarkdownFiles()`.

One small addition needed: add `"templates"` to `DOC_CATEGORIES` in `studio-core/types.ts:126` so Studio can display the templates directory on the `/docs` page. This is a one-line change:

```typescript
// Before:
export const DOC_CATEGORIES = [
  "research", "plans", "specs", "ux", "architecture", "curation"
] as const

// After:
export const DOC_CATEGORIES = [
  "research", "plans", "specs", "ux", "architecture", "curation", "templates"
] as const
```

### File Structures

#### personas.md

```yaml
---
type: ux-guide
updated: 2026-03-14
version: 0.1
---
```

Three personas, each with:
- **Type** — User Persona vs. Buyer Persona
- **JTBD statement** — "When [situation], I want [capability] so I can [outcome]"
- **Pain points** — 2-3 bullets
- **Evaluation criteria** — What they look for
- **Objections** — Why they might say no
- **Content that resonates** — Formats, channels, depth
- **Path to Sherpa** — How they discover and progress (maps the journey between personas)

Three personas:
1. **The Practitioner** (User Persona) — Developer/AI engineer using the open-source framework independently. Community, not customer.
2. **The Technical Leader** (Buyer Persona) — Engineering manager evaluating agentic workflows. Needs governance without slowing shipping. Champion who tries first, then brings consulting.
3. **The Honest Executive** (Buyer Persona) — C-suite who knows AI adoption is messy. Values candor over credentials. Buys consulting on Technical Leader's recommendation.

#### messaging-framework.md

Three layers:

**Layer 1: Positioning (Dunford)**
- Competitive alternatives (what customers do without Sherpa)
- Unique attributes (behavioral constraints, filesystem governance, "we use what we ship")
- Value for each persona
- Best-fit customers
- Market category: "Behavioral governance for agentic workflows"

**Layer 2: Strategic Narrative (Raskin)**
- The Shift: AI agents becoming autonomous workers, not tools
- The Stakes: Ungoverned agentic workflows → unreliable, unauditable AI
- The Promised Land: Teams shipping AI with behavioral governance built in
- The Magic Gifts: The framework + the consulting practice
- The Evidence: Self-governance (Sherpa governs itself), engagement data

**Layer 3: Per-Persona Messaging (JTBD)**
- One messaging block per persona with: primary message, supporting points, proof points, CTA

#### agent-voice.md

This is Sherpa's unique contribution — no competitor or style guide covers this well.

Structure:
1. **The Principle** — Voice constraints are behavioral constraints. Same philosophy as role engineering.
2. **Voice Inheritance** — Agents inherit Sherpa's four voice attributes (Calm/Not Cold, Knowledgeable/Not Academic, Present/Not Precious, Honest/Not Cynical) as defaults.
3. **Role-Specific Overrides** — How disposition and context-packages customize voice per role. The marketer defaults to "grounded," the technical-writer to "minimalist."
4. **Output Voice Rules** — Concrete rules for agent-generated content: avoid-list applies, readability targets apply, Headline Test applies. Agent output that fails the Review Checklist (content-guidelines.md) is NEEDS WORK.
5. **Disclosure** — When and how to mark AI-generated vs. AI-assisted content. Position ahead of EU AI Act Article 50 (Aug 2026).

#### content-brief.md template

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

# [Title]

## Brief

[2-3 sentence description of what this content should accomplish]

## Target Persona

[Which persona, their JTBD, what they need from this content]

## Key Messages

1. [Primary message]
2. [Supporting message]
3. [Supporting message]

## Required Elements

- [ ] Specific data or evidence
- [ ] Real example or case reference
- [ ] Actionable next step
- [ ] Review Checklist pass (content-guidelines.md)

## Sources / Research

[Links, prior research, data points to incorporate]

## Voice Notes

[Any specific tone adjustments for this piece]
```

#### content-quality.md convention rule

```yaml
---
description: Editorial quality gates for content production
globs:
  - "docs/templates/**"
  - "*.md"
alwaysApply: false
---
```

Content: The Search Roost-inspired Pass/Needs Work scorecard adapted for Sherpa:
- All factual claims have sources
- Passes the Headline Test (voice-and-tone.md)
- Passes the Depth Test (content-guidelines.md)
- Zero words from the avoid-list
- Clear H2/H3 structure
- "What we know" vs. "analysis" clearly separated
- Readability target met for content type
- **3+ failures → don't publish**

Maps to Planner/Worker/Judge: the Judge role evaluates content against this scorecard.

#### component-content.md

Per-component content patterns following Atlassian model:

| Component | Structure | Tone |
|-----------|-----------|------|
| **Error messages** | What happened + why + how to fix. 1-2 sentences. Imperative verbs ("Save", "Retry"). | Calm, direct, solution-first |
| **Empty states** | Heading describes state. Body: reason for emptiness + what to do next. | Inviting, unhurried |
| **Success messages** | Confirm what happened. Close the loop. | Warm, brief |
| **Warning messages** | What might go wrong + what to do to prevent it. | Clear, not alarming |
| **Info messages** | Additional context. Don't overwhelm — one key point. | Helpful, concise |
| **Confirmation dialogs** | What will happen + is it reversible? Action verb on primary button. | Direct, specific |
| **Loading states** | Describe what's happening if >2 seconds. | Calm, informative |
| **Tooltips** | One sentence. No period if sentence fragment. | Brief, clarifying |

### Integration Points

#### Agent Role Context Updates

**marketer.md** — Already references `docs/ux/personas.md` (which doesn't exist yet — this design creates it). Add:
```yaml
context-packages:
  - docs/ux/vision.md
  - docs/ux/voice-and-tone.md
  - docs/ux/personas.md          # now exists
  - docs/ux/messaging-framework.md  # new
  - docs/ux/agent-voice.md          # new
  - docs/architecture/intelligence-native.md
```

**technical-writer.md** — Add content guidelines and agent voice:
```yaml
context-packages:
  - CLAUDE.md
  - docs/ux/voice-and-tone.md
  - docs/ux/content-guidelines.md    # add
  - docs/ux/agent-voice.md           # add
```

**designer.md** — Add component content patterns:
```yaml
context-packages:
  - docs/ux/design-principles.md
  - docs/ux/voice-and-tone.md
  - docs/ux/component-content.md     # add
```

#### Convention Rule Scope

The `.claude/rules/content-quality.md` file uses `alwaysApply: false` with globs targeting template and content files. It loads when agents work on content production, not when writing code. This prevents cognitive overhead during normal development.

### What This Does NOT Design

Per the proposal's boundaries ("extend, don't rewrite"):

- **No changes to existing voice attributes** — "Calm, Not Cold" etc. are validated and stay
- **No word list rewrite** — The avoid-list is validated; expand organically during website build
- **No Foundation Stone alignment** — Proposal item 6 (Pillar III and V gaps) is deferred to Session 3 if needed, as it requires the strategic narrative to be written first
- **No Studio UI changes** — Beyond the one-line DOC_CATEGORIES addition, no component work
- **No content brief tooling** — The template is a markdown file, not a CLI command or Studio feature. Content engine integration is a future initiative.

## Decisions

### D1: Separate files over extending existing files

**Decision:** Create 4 new files in `docs/ux/` rather than appending sections to existing files.

**Rationale:** The existing files are 94-166 lines. Adding accessibility (60-80 lines), grammar (50-70 lines), personas (80-100 lines), and messaging (90-120 lines) to existing files would blow past the 200-line CLAUDE.md standard. Separate files also allow targeted injection into agent roles via context-packages.

**Alternatives rejected:**
- Extending voice-and-tone.md with all sections → would hit ~400 lines
- A single "style-guide.md" mega-file → contradicts claude-md-standards.md

### D2: Templates in docs/templates/ not in code

**Decision:** Content templates are markdown files in `docs/templates/`, not TypeScript objects in `@sherpa/studio-core`.

**Rationale:** Sherpa's governance model is filesystem-based. Templates as markdown: (1) are human-readable and editable, (2) are discoverable by Studio's existing doc system, (3) can be referenced in agent context-packages, (4) match the initiative convention pattern. Code-based templates add complexity without clear benefit at this stage.

**Alternatives rejected:**
- Zod schemas in studio-core → premature; no consumer exists yet
- JSON templates with $schema → more rigid than needed for content

### D3: Agent voice as separate file, not in behavioral-engineering.md

**Decision:** Create `docs/ux/agent-voice.md` rather than extending `.claude/rules/behavioral-engineering.md`.

**Rationale:** The behavioral engineering rule is about how to *define* agent roles. Agent voice is about how agents *communicate* in their output. Different concern, different audience (content producers vs. role authors), different update cadence.

### D4: Convention rule for quality gates, not inline in guidelines

**Decision:** The editorial QA scorecard lives in `.claude/rules/content-quality.md` (auto-loaded by Claude) rather than only in content-guidelines.md.

**Rationale:** Convention rules are behavioral constraints on the AI agent — exactly what Sherpa is about. Putting quality gates in a rule file means they're enforced during content production, not just referenced during manual review. This maps to the Judge role's evaluation criteria.

### D5: Readability targets per content type

**Decision:** Set differentiated readability targets rather than a single grade level.

| Content type | Target | Rationale |
|-------------|--------|-----------|
| Marketing / website | Grade 8 | Accessible to all audiences |
| Blog / thought leadership | Grade 9-10 | Technical but not academic |
| Framework documentation | Grade 10-12 | Technical audience expects density |
| Consulting content | Grade 8-9 | Executives value clarity |
| Error messages / UI text | Grade 6 | Must be instantly understood |

**Rationale:** GOV.UK's single-target approach (Grade 4) works for government but not for B2B tech consulting with multiple audiences. Research confirms even expert readers prefer simpler text, but Sherpa's technical content needs room for precision.

### D6: Three personas, JTBD-centered, no demographics

**Decision:** Three personas using Jobs-to-be-Done format without demographic details (age, education, hobbies).

**Rationale:** Research (V3) is unanimous: B2B personas fail when they include irrelevant demographics. JTBD captures motivation, which determines content strategy. The three archetypes (Practitioner, Technical Leader, Honest Executive) are validated by T2D3 model and map to community/commercial funnel separation.

## Open Questions

1. **Should `docs/templates/` get its own CLAUDE.md?** Probably not at 3 files, but worth considering if it grows.
2. **What happens to the WavePoint ghost references?** The designer and marketer roles reference `docs/ux/vision.md` and `docs/ux/interaction-patterns.md` which don't exist. These are WavePoint leftovers — clean up during role updates or leave as aspirational?
3. **Content brief ↔ task dispatch integration.** The proposal mentions integration with the task dispatch system. The content brief template is designed to be compatible (frontmatter fields map to task metadata), but the actual integration is out of scope for this initiative.

## Session Plan

### Session 1 (4 new files, 3 file edits)
1. Create `docs/ux/personas.md`
2. Create `docs/ux/messaging-framework.md`
3. Create `docs/ux/accessibility-and-inclusion.md`
4. Create `docs/ux/grammar-and-mechanics.md`
5. Extend `docs/ux/voice-and-tone.md` — readability targets, tone dimensions, emotional-context matrix
6. Extend `docs/ux/content-guidelines.md` — readability targets per type, cross-references
7. Annotate `docs/ux/product-positioning.md` — Dunford five-component structure

### Session 2 (4 new files, 3 file edits)
1. Create `docs/ux/agent-voice.md`
2. Create `docs/ux/component-content.md`
3. Create `docs/templates/content-brief.md`
4. Create `docs/templates/blog-post.md` + `case-study.md`
5. Create `.claude/rules/content-quality.md`
6. Update `docs/agents/roles/marketer.md` context-packages
7. Update `docs/agents/roles/technical-writer.md` context-packages
8. Update `docs/agents/roles/designer.md` context-packages
9. Add `"templates"` to DOC_CATEGORIES in `packages/studio-core/src/types.ts`
