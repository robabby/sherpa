# Multi-Format Behavioral Linting: Can the Same Rules Apply Across Agent Definition Formats?

**Date:** 2026-03-11
**Researcher:** Claude (Opus 4.6)
**Context:** Behavioral lint tool needs to support Sherpa YAML, CrewAI agents.yaml, SoulSpec SOUL.md, agency-agents markdown, Claude Code .claude/rules/, Cursor .mdc, and freeform system prompts.

---

## Executive Summary

**Yes, the same behavioral rules can apply across all major agent definition formats.** The key insight is that every format ultimately contains one or more **prose text fields** where behavioral content lives. The linter architecture is a two-layer system: a **format adapter** that extracts lintable text regions from each format, and a **shared rule engine** that runs the same behavioral checks against those regions regardless of source format.

This is exactly how Vale works (format-specific parsers feed a shared rule engine), how ESLint works (language-specific parsers feed shared rules via AST), and how markdownlint works (format-aware scoping feeds shared rule implementations). The pattern is well-established in linting tooling.

The critical finding: **no existing tool validates behavioral content in agent definitions.** Every framework validates schema (fields exist, correct types) but none inspect the prose content of instructions/backstory/soul fields for identity language, vague claims, or behavioral anti-patterns. This is a genuine green field.

---

## Format-by-Format Analysis

### 1. CrewAI Agent YAML

**File:** `src/<project>/config/agents.yaml`
**Format:** YAML with three required string fields

```yaml
researcher:
  role: >
    {topic} Senior Data Researcher
  goal: >
    Uncover cutting-edge developments in {topic}
  backstory: >
    You're a seasoned researcher with a knack for uncovering the latest
    developments in {topic}. Known for your ability to find the most relevant
    information and present it in a clear and concise manner.
```

**Lintable fields:**
- `role` -- identity claim hotspot ("Senior Data Researcher" is an identity claim)
- `goal` -- usually behavioral, less likely to contain identity language
- `backstory` -- the primary behavioral content field; this is where identity language concentrates ("You're a seasoned researcher with a knack for...")

**Parser requirement:** YAML parser (js-yaml or yaml). Extract all string values from the top-level agent keys. The `backstory` field is the highest-priority lint target.

**Variable handling:** CrewAI uses `{variable}` syntax for runtime interpolation. The linter should skip content inside `{...}` braces when pattern-matching.

**Sources:**
- CrewAI agents docs: https://docs.crewai.com/concepts/agents
- CrewAI tasks docs: https://docs.crewai.com/concepts/tasks
- CrewAI GitHub: https://github.com/crewAIInc/crewAI

---

### 2. SoulSpec (SOUL.md + IDENTITY.md + AGENTS.md)

**Files:** `soul.json` (manifest), `SOUL.md` (personality), `IDENTITY.md` (background), `AGENTS.md` (operations), `STYLE.md` (voice), `HEARTBEAT.md` (autonomous behaviors), `examples/` (reference outputs)
**Format:** Markdown files + JSON manifest
**Spec version:** 0.4 (as of 2026-03-11)

**soul.json schema:**
```json
{
  "specVersion": "0.4",
  "name": "my-agent",
  "displayName": "My Agent",
  "version": "1.0.0",
  "description": "A helpful agent with strong opinions.",
  "license": "MIT",
  "tags": ["general", "opinionated"],
  "compatibility": {
    "frameworks": ["openclaw", "cursor", "windsurf"]
  },
  "files": {
    "soul": "SOUL.md",
    "identity": "IDENTITY.md",
    "agents": "AGENTS.md"
  }
}
```

**Lintable files:**
- `SOUL.md` -- "Values, communication style, opinions, and behavioral guidelines." This is the core personality file and the primary lint target. The spec explicitly frames this as identity-defining ("defines **who your agent is**"), making it the highest risk for identity language.
- `IDENTITY.md` -- "Name, role, backstory, and contextual positioning." By design, this file contains identity claims. A behavioral linter would flag much of its content.
- `AGENTS.md` -- "Task handling, tool usage, memory patterns, and autonomous behaviors." More operational, lower risk for identity language.
- `STYLE.md` -- Communication patterns and voice. May contain identity-adjacent language.

**Parser requirement:** Standard markdown parser. No frontmatter (the manifest is a separate JSON file). The entire markdown body of each file is lintable prose.

**Key observation:** SoulSpec is structurally identity-first. The spec's tagline is "AGENTS.md defines how agents work on your code. SoulSpec defines **who your agent is.**" A behavioral linter running against SoulSpec files would flag a high percentage of content by design. This isn't a bug -- it surfaces the fundamental difference between identity-first and behavioral-first agent definition philosophies.

**Sources:**
- SoulSpec website: https://soulspec.org
- SoulSpec spec (referenced): https://soulspec.org/spec
- awesome-openclaw-agents (100+ SOUL.md templates): https://github.com/mergisi/awesome-openclaw-agents
- OpenClaw discussions: https://github.com/openclaw/openclaw/discussions/20131
- MSR 2026 paper on AGENTS.md evolution: https://arxiv.org/abs/2510.21413

---

### 3. agency-agents Markdown Format

**File:** `<category>/<category>-<role>.md` (e.g., `engineering/engineering-frontend-developer.md`)
**Format:** Markdown with YAML frontmatter

**Frontmatter fields:**
```yaml
---
name: Frontend Developer
description: Expert frontend developer specializing in modern web technologies...
color: cyan
emoji: "icon"
vibe: Builds responsive, accessible web apps with pixel-perfect precision.
services:                    # optional
  - name: Service Name
    url: https://service-url.com
    tier: free
---
```

**Body sections (from CONTRIBUTING.md template):**
1. `## Your Identity & Memory` -- Role, Personality, Memory, Experience (highest identity risk)
2. `## Your Core Mission` -- Primary responsibilities with deliverables
3. `## Critical Rules You Must Follow` -- Domain-specific constraints (most behavioral content)
4. `## Your Technical Deliverables` -- Code samples, templates, frameworks
5. `## Your Workflow Process` -- Step-by-step methodology
6. `## Your Communication Style` -- Tone and approach
7. `## Learning & Memory` -- What the agent remembers (memory claims)
8. `## Your Success Metrics` -- Measurable outcomes
9. `## Advanced Capabilities` -- Specialized techniques

**Parser requirement:** gray-matter for frontmatter extraction, then section-based body parsing. Sections are identified by `## ` headers. The `convert.sh` script already does this with keyword matching on headers (identity/communication/style/rules -> persona; everything else -> operations).

**Identity language concentration:**
- `name` frontmatter -- clean, no identity issues
- `description` frontmatter -- often contains "Expert" claims ("Expert frontend developer specializing in...")
- Body opener -- always starts with identity claim: "You are **Frontend Developer**, an expert frontend developer who specializes in..."
- `Identity & Memory` section -- 100% identity content by design
- `Communication Style` section -- personality-driven
- `Learning & Memory` section -- memory claims ("You remember...")

**Minimal parser for lintable text extraction:**
```javascript
import matter from 'gray-matter';
import { readFileSync } from 'fs';

function parseAgencyAgent(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const { data: frontmatter, content: body } = matter(raw);

  // Extract sections by ## headers
  const sections = {};
  let currentSection = '_preamble';
  for (const line of body.split('\n')) {
    if (line.startsWith('## ')) {
      currentSection = line.replace(/^##\s+/, '').replace(/[^a-zA-Z0-9 ]/g, '').trim();
      sections[currentSection] = '';
    } else {
      sections[currentSection] = (sections[currentSection] || '') + line + '\n';
    }
  }

  return {
    format: 'agency-agents',
    frontmatter,
    body,
    sections,
    lintableRegions: [
      { source: 'frontmatter.description', text: frontmatter.description || '' },
      { source: 'frontmatter.vibe', text: frontmatter.vibe || '' },
      { source: 'body', text: body },
    ]
  };
}
```

**Existing lint tool:** `scripts/lint-agents.sh` (88 lines of bash). Checks: frontmatter `---` exists, frontmatter non-empty, required fields (name, description, color), recommended sections (Identity, Core Mission, Critical Rules), body >= 50 words. No content pattern detection, no identity language checking, no schema validation of field values.

**Sources:**
- agency-agents repo: https://github.com/msitarzewski/agency-agents
- CONTRIBUTING.md (full template): https://github.com/msitarzewski/agency-agents/blob/main/CONTRIBUTING.md
- lint-agents.sh: https://github.com/msitarzewski/agency-agents/blob/main/scripts/lint-agents.sh
- convert.sh (480 lines, 7 format targets): https://github.com/msitarzewski/agency-agents/blob/main/scripts/convert.sh
- Example agent: https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-frontend-developer.md
- Blog: https://yuv.ai/blog/agency-agents
- Medium (10K stars in 7 days): https://medium.com/coding-nexus/someone-built-a-full-ai-agency-on-github-61-agents-10k-stars-in-7-days-ac976f85925d

---

### 4. Claude Code Rules Format

**Files:** `.claude/rules/*.md`, `CLAUDE.md`, `~/.claude/CLAUDE.md`, `~/.claude/rules/*.md`
**Format:** Markdown with optional YAML frontmatter (paths field only)

**Rules file format:**
```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API Development Rules

- All API endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
```

**Frontmatter:** Only one field -- `paths` (array of glob patterns). Rules without `paths` apply unconditionally. Rules with `paths` apply when Claude reads files matching those patterns.

**Lintable content:**
- The entire markdown body after frontmatter. Claude Code rules are *already* behavioral by convention (see WavePoint's `.claude/rules/behavioral-engineering.md`). But there is no enforcement -- anyone could write identity language in rules files.
- `CLAUDE.md` files are freeform markdown with no required structure.

**Parser requirement:** gray-matter for optional frontmatter, then the full body is lintable prose. Simpler than any other format because there's no multi-field structure -- the entire content is one prose block.

**Key observation:** Claude Code's format is the most behavioral-friendly of all formats surveyed. The `paths` scoping mechanism is purely operational (file matching), and the body content is unconstrained prose. WavePoint's own rules demonstrate that this format naturally gravitates toward behavioral framing when guided by convention. The linter would validate and enforce what convention currently suggests.

**Sources:**
- Claude Code memory docs: https://code.claude.com/docs/en/memory
- Claude Code settings docs: https://code.claude.com/docs/en/settings

---

### 5. Cursor Rules (.mdc)

**File:** `.cursor/rules/*.mdc`
**Format:** Markdown with YAML frontmatter

```markdown
---
description: "Service definition standards"
globs: "**/*.ts"
alwaysApply: false
---

- Use internal RPC pattern for services
- Apply snake_case naming conventions
```

**Frontmatter fields:**
- `description` -- Rule purpose; used by Cursor agent to determine relevance
- `globs` -- File path patterns for scoping
- `alwaysApply` -- Boolean, apply to every session

**Lintable content:** The markdown body after frontmatter. Same as Claude Code rules -- single prose block.

**Parser requirement:** gray-matter for frontmatter, body is lintable prose. The `description` field is also lintable (could contain identity language).

**Sources:**
- Cursor rules docs: https://cursor.com/docs/context/rules

---

### 6. Freeform System Prompts (OpenAI, Anthropic API)

**Format:** Plain text string, no file structure

```python
# OpenAI
client.chat.completions.create(
    model="gpt-5.1",
    messages=[{"role": "system", "content": "You are a helpful assistant..."}]
)

# Anthropic
client.messages.create(
    model="claude-opus-4-6",
    system="You are a helpful coding assistant specializing in Python.",
    messages=[...]
)
```

**Lintable content:** The entire string. No structure to parse -- the full text is the lint target.

**Parser requirement:** None. The input is already a string. The linter just needs to accept a raw text string and run pattern matching against it.

**Key challenge:** Without structural markers, the linter cannot distinguish between "this is the agent's identity section" and "this is a behavioral constraint." All rules run against the full text with no section-level severity adjustment. This means a freeform system prompt that says "You are a helpful assistant" would get the same severity as an agency-agents file that says "You are **Frontend Developer**, an expert..." The linter should still flag both, but cannot provide section-specific advice.

**Sources:**
- Anthropic prompt engineering: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/agents/

---

### 7. Other SDK Formats (OpenAI Agents, AutoGen, Mastra)

These are programmatic formats (Python/TypeScript classes), not file-based. The `instructions` field is always a string.

**OpenAI Agents SDK:**
```python
Agent(name="Haiku agent", instructions="Always respond in haiku form", model="gpt-5-nano", tools=[...])
```

**Mastra:**
```typescript
new Agent({ id: "assistant", name: "Assistant", instructions: "You are a helpful assistant.", model: "openai/gpt-5.1" })
```

**Linting approach:** These are code-embedded strings. The linter would need an AST parser (e.g., tree-sitter for Python/TypeScript) to extract the `instructions` argument from `Agent()` constructor calls. This is a stretch goal -- file-based formats first.

**Sources:**
- OpenAI Agents SDK: https://openai.github.io/openai-agents-python/agents/
- Mastra agents: https://mastra.ai/docs/agents/overview

---

## Multi-Format Linter Architecture

### The Adapter Pattern (Proven by ESLint and Vale)

The architecture that enables multi-format linting is well-established:

```
Input File
    |
    v
Format Detector (extension + content sniffing)
    |
    v
Format Adapter (extracts lintable regions)
    |
    v
Rule Engine (shared rules run against text regions)
    |
    v
Reporter (formats results with source locations)
```

**ESLint precedent:** ESLint uses the `files` glob array in flat config to route different file types to different parsers. The parser produces an AST, then shared rules operate on the AST regardless of source format. Key abstraction: the parser is pluggable, the rules are universal.

- Source: https://eslint.org/docs/latest/use/configure/configuration-files

**Vale precedent:** Vale classifies files into markup/code/text types. Within each type, it provides format-agnostic scopes (paragraph, heading, sentence, etc.). Rules target scopes, not formats. "Since each format has access to the same scopes, rules are compatible across all formats within a particular type."

- Source: https://vale.sh/docs/topics/scoping

### Proposed Format Adapter Interface

```typescript
interface LintableRegion {
  source: string;        // e.g., "frontmatter.backstory", "body.Identity & Memory", "full-text"
  text: string;          // the actual prose to lint
  startLine: number;     // line number in original file (for error reporting)
  severity: 'error' | 'warning' | 'info';  // can be escalated per-region
  format: string;        // source format identifier
}

interface FormatAdapter {
  /** Can this adapter handle this file? */
  detect(filePath: string, content: string): boolean;

  /** Extract lintable regions from the file */
  extract(filePath: string, content: string): LintableRegion[];
}
```

### Format Detection Strategy

| Signal | Method |
|--------|--------|
| File extension | `.yaml`/`.yml` -> YAML adapter, `.md` -> markdown adapter, `.mdc` -> Cursor adapter, `.json` -> JSON adapter |
| Directory location | `.claude/rules/` -> Claude Code adapter, `.cursor/rules/` -> Cursor adapter |
| Filename pattern | `agents.yaml` -> CrewAI adapter, `SOUL.md` -> SoulSpec adapter, `IDENTITY.md` -> SoulSpec adapter |
| Content sniffing | YAML frontmatter `---` at line 1 -> frontmatter markdown adapter |
| Explicit flag | `--format sherpa` / `--format crewai` / `--format agency-agents` |

**Priority order:** Explicit flag > filename pattern > directory location > content sniffing > file extension.

### Concrete Adapters

| Format | Adapter | Parser | Primary lint targets |
|--------|---------|--------|---------------------|
| Sherpa YAML | `sherpa-adapter` | gray-matter + Zod | `disposition`, `behavioral-constraints`, `quality-bar`, `fail-triggers`, body text |
| CrewAI | `crewai-adapter` | js-yaml | `role`, `goal`, `backstory` per agent key |
| SoulSpec | `soulspec-adapter` | markdown parser | SOUL.md (full), IDENTITY.md (full), soul.json `description` |
| agency-agents | `agency-adapter` | gray-matter + section parser | `description`, `vibe`, body sections (especially Identity & Memory) |
| Claude Code | `claude-rules-adapter` | gray-matter | body text (full) |
| Cursor | `cursor-adapter` | gray-matter | `description`, body text |
| Freeform text | `text-adapter` | none | full text |

### Shared Rule Categories

These rules apply identically regardless of source format:

**1. Identity language detection (ERROR)**
```javascript
const IDENTITY_PATTERNS = [
  /\byou are\b/i,
  /\byou're\b/i,
  /\bI am\b/i,
  /\b(?:expert|senior|experienced)\b/i,
  /\byears? of experience\b/i,
  /\bpersonality\s*:/i,
  /\byour? personality\b/i,
  /\byou remember\b/i,
  /\byou have (?:deep|extensive|broad)\b/i,
  /\byou know\b/i,
];
```

**2. Identity-adjacent language (WARNING)**
```javascript
const IDENTITY_ADJACENT = [
  /\bguru\b/i, /\bninja\b/i, /\brock[ -]*star\b/i, /\bwizard\b/i,
  /\bhero(?:ic)?\b/i, /\bworld[ -]*class\b/i, /\bpassion(?:ate)?\b/i,
  /\bloves?\b/i, /\bthinks? like\b/i,
];
```

**3. Vague behavioral claims (WARNING)**
```javascript
const VAGUE_PATTERNS = [
  /\bensure quality\b/i, /\bhigh[ -]*quality\b/i, /\bbest practices?\b/i,
  /\bclean code\b/i, /\belegant\b/i, /\brobust\b/i, /\bscalable\b/i,
  /\bmaintainable\b/i, /\befficient(?:ly)?\b/i, /\boptimal(?:ly)?\b/i,
];
```

**4. Memory claims (WARNING)**
```javascript
const MEMORY_CLAIMS = [
  /\byou remember\b/i,
  /\byou've seen\b/i,
  /\byou've worked\b/i,
  /\byou have (deep|extensive|broad|vast) (knowledge|experience|understanding)\b/i,
];
```

These regex patterns are sourced from Joblint's Vale port (anti-pattern detection for job postings), write-good (prose anti-patterns), and behavioral engineering research (Zheng et al., EMNLP 2024; Anthropic prompt guide).

---

## Precedent Analysis: How Existing Multi-Format Linters Work

### Vale (Go, YAML rules)

**How it handles formats:** Vale classifies every file into one of three types: markup (Markdown, AsciiDoc, reStructuredText, HTML, XML, DITA, MDX), code (extracts comments), or text (raw prose). Each type has a dedicated parser that produces format-agnostic scopes (heading, paragraph, sentence, code, etc.). Rules target scopes, not formats.

**Key insight for us:** Vale's `existence` check type compiles a list of tokens into a regex pattern. Its rule format:
```yaml
extends: existence
message: "'%s' is identity language — rewrite as behavioral constraint"
level: error
ignorecase: true
tokens:
  - you are
  - you're an
  - expert
  - senior
  - years of experience
```

This is exactly the rule format we'd use if we published behavioral lint rules as a Vale style package. However, Vale cannot do YAML frontmatter schema validation -- it only lints prose.

**Joblint style package:** 18 YAML rule files detecting problematic patterns in job postings. Categories directly analogous to agent identity detection: Visionary (vague aspirational language), Competitive (unrealistic expectations), DumbTitles (ninja, rockstar, guru), Bro (unprofessional casual), Reassure (patronizing). These rules could be forked and adapted for agent definitions with minimal effort.

**Sources:**
- Vale docs: https://vale.sh/docs/
- Vale scoping: https://vale.sh/docs/topics/scoping
- Vale existence check: https://vale.sh/docs/checks/existence
- Vale styles index: https://github.com/errata-ai/styles
- Joblint Vale port: https://github.com/errata-ai/Joblint
- Original joblint: https://github.com/rowanmanning/joblint

### ESLint (JavaScript, flat config)

**How it handles formats:** ESLint's flat config uses `files` arrays with glob patterns to route different file types to appropriate parsers. Rules operate on the parsed AST, not raw text. The parser is pluggable -- `@typescript-eslint/parser` for TypeScript, `espree` for JavaScript, `vue-eslint-parser` for Vue SFCs.

**Key insight for us:** The cascading config model. Multiple config objects can match a single file, with later objects overriding earlier ones. This means format-specific config (severity adjustments per format) layers on top of shared rules.

```javascript
export default [
  { rules: { 'no-identity-language': 'error' } },           // all formats
  { files: ['**/SOUL.md'], rules: { 'no-identity-language': 'warn' } },  // relaxed for SoulSpec
];
```

**Source:** https://eslint.org/docs/latest/use/configure/configuration-files

### markdownlint (JavaScript, custom rules API)

**How it handles formats:** markdownlint parses Markdown and exposes `params.frontMatterLines` separately from `params.lines`. Custom rules receive the full parsed structure and can target specific content regions. GitHub Docs uses this to build 44+ custom rules.

**Key insight for us:** The `frontMatterLines` separation is exactly what we need. markdownlint already distinguishes frontmatter from body, allowing different validation logic for each.

**Sources:**
- markdownlint custom rules: https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md
- markdownlint-rule-search-replace: https://github.com/OnkarRuikar/markdownlint-rule-search-replace
- GitHub Docs linter: https://github.com/github/docs/tree/main/src/content-linter

### agency-agents convert.sh (Bash, 480 lines)

**How it handles formats:** The convert.sh script is the closest existing precedent for multi-format agent file handling. It reads agency-agents markdown files and converts to 7 target formats: Antigravity, Gemini CLI, OpenCode, Cursor, Aider, Windsurf, OpenClaw.

**Key implementation details:**
- `get_field()` -- awk-based YAML frontmatter field extraction
- `get_body()` -- awk-based body extraction (strip frontmatter)
- `slugify()` -- name-to-kebab-case conversion
- OpenClaw conversion splits body sections into SOUL.md (persona) vs AGENTS.md (operations) by keyword-matching `## ` headers
- Aider and Windsurf are single-file formats -- agents are concatenated into one file
- Cursor outputs `.mdc` with `description`, `globs`, `alwaysApply` frontmatter

**Key insight for us:** The convert.sh already classifies sections as "persona" vs "operations" using header keywords. This same classification could drive severity -- identity language in "operations" sections is a harder warning than in "persona" sections (which are identity by design).

**Source:** https://github.com/msitarzewski/agency-agents/blob/main/scripts/convert.sh

---

## Key Discoveries

- **Every major agent format has exactly one prose field where behavioral content lives.** CrewAI: `backstory`. OpenAI Agents: `instructions`. SoulSpec: `SOUL.md`. Mastra: `instructions`. The universal pattern is `instructions: string` with all the behavioral heavy lifting in that one field. No framework structures or validates this content.

- **The adapter pattern is well-proven.** ESLint (parser plugins), Vale (format scopes), and markdownlint (frontMatterLines) all demonstrate the same architecture: format-specific parsing feeds a shared rule engine. This is not speculative -- it's the standard approach.

- **SoulSpec is structurally opposed to behavioral engineering.** Its core tagline is "defines who your agent is." IDENTITY.md is explicitly for identity content. A behavioral linter would flag a high percentage of SoulSpec content. This is informative, not blocking -- the linter should support SoulSpec but with adjusted default severity or a "report mode" that shows identity density without treating it as errors.

- **agency-agents already classifies persona vs operations.** Their convert.sh splits sections by header keywords for OpenClaw export. This same classification can drive lint severity. The linter should parse sections and apply stricter rules to operational content than persona content.

- **Claude Code rules are the most behavioral-friendly format.** No identity structure, just prose behavioral content with file-path scoping. WavePoint's own rules demonstrate the format's natural behavioral gravitation.

- **Freeform system prompts are lintable with zero parsing.** The entire string is the lint target. No format adapter needed beyond accepting raw text.

- **Joblint's Vale rules are directly reusable.** 18 rule files detecting visionary language, dumb titles (ninja/guru/rockstar), competitive language, and reassurance patterns. These map almost 1:1 to agent identity anti-patterns.

- **No existing tool validates behavioral content in agent definitions.** agency-agents' lint-agents.sh checks structure only (frontmatter exists, sections present, word count). No framework validates the prose content of instructions fields. This is a genuine first.

---

## Implications for the Behavioral Lint Tool

### Architecture Recommendation

```
sherpa-lint [files...] [--format auto|sherpa|crewai|soulspec|agency|claude|cursor|text]

Adapters:
  adapters/
    sherpa.ts         # gray-matter + Zod schema + section parser
    crewai.ts         # js-yaml, extract role/goal/backstory per agent
    soulspec.ts       # detect SOUL.md/IDENTITY.md/AGENTS.md, full body
    agency-agents.ts  # gray-matter + section-by-header parser
    claude-rules.ts   # gray-matter (paths frontmatter), body prose
    cursor.ts         # gray-matter (description/globs/alwaysApply), body prose
    text.ts           # passthrough, full content as single region

Rules:
  rules/
    identity-language.ts    # ERROR: "you are", "expert", "senior", etc.
    identity-adjacent.ts    # WARNING: ninja, guru, rockstar, world-class
    vague-constraints.ts    # WARNING: "ensure quality", "best practices"
    memory-claims.ts        # WARNING: "you remember", "you've seen"
    disposition-format.ts   # Sherpa-only: validates disposition pattern

Engine:
  engine.ts               # runs rules against LintableRegion[], collects results
  reporter.ts             # formats results (text, JSON, GitHub annotations)
```

### Severity Per Format

Different formats have different expectations. A strict behavioral-engineering-only linter would flag 90% of SoulSpec and agency-agents content. The linter should support profiles:

| Profile | Sherpa | CrewAI | SoulSpec | agency-agents | Claude Rules | Cursor | Text |
|---------|--------|--------|----------|---------------|-------------|--------|------|
| `strict` | ERROR | ERROR | ERROR | ERROR | ERROR | ERROR | ERROR |
| `behavioral` (default) | ERROR | WARN | INFO | WARN | WARN | WARN | WARN |
| `report` | INFO | INFO | INFO | INFO | INFO | INFO | INFO |

- **`strict`** -- For teams committed to behavioral engineering. Every identity pattern is an error.
- **`behavioral`** (default) -- Sherpa files get strict validation. Other formats get warnings to surface identity patterns without blocking.
- **`report`** -- Audit mode. Shows identity language density without any errors. Useful for assessing a corpus before migration.

### Implementation Priority

1. **Sherpa adapter** -- validate our own format first
2. **Text adapter** -- zero-effort, enables linting any system prompt
3. **agency-agents adapter** -- largest user base (29.9k stars), immediate cross-community value
4. **CrewAI adapter** -- second-most-common file-based format
5. **Claude Code adapter** -- our own ecosystem
6. **Cursor adapter** -- trivial once Claude adapter exists (same gray-matter + body)
7. **SoulSpec adapter** -- last priority due to structural opposition to behavioral engineering

---

## Open Questions

1. **Should the linter output Vale-compatible YAML rules?** Publishing behavioral lint rules as a Vale style package (`errata-ai/BehavioralAgent`) would give immediate access to Vale's ecosystem (GitHub Action, pre-commit, CI integration) without building custom infrastructure. The trade-off: Vale cannot validate YAML frontmatter schemas.

2. **How should code-embedded instructions be handled?** Python `Agent(instructions="...")` and TypeScript `new Agent({ instructions: "..." })` contain lintable strings, but extracting them requires AST parsing. Tree-sitter could handle this, but it's a significant complexity increase. Defer to v2?

3. **Should the linter suggest behavioral rewrites?** "You are an expert frontend developer" -> "Focuses on TypeScript, React, Next.js. Enforces accessibility and performance budgets." This requires templates or LLM-assisted rewriting. Templates are feasible for common patterns; LLM-assisted is a stretch goal.

4. **How should `{variable}` interpolation be handled across formats?** CrewAI uses `{topic}`, agency-agents has no variables, SoulSpec has none. The linter should skip content inside interpolation delimiters, but the delimiter syntax varies by format.

5. **Should there be a `.sherpalintrc` config file?** Following ESLint's precedent, a config file could specify: default profile, format overrides, custom patterns, ignored files. This adds complexity but enables per-project customization.

6. **What about round-trip fidelity?** If a behavioral linter flags identity language in a CrewAI `backstory`, can it suggest a rewrite that still works within CrewAI's identity-first design? Or does fixing the lint error break the format's expectations?

---

## Sources

### Agent Definition Formats
| URL | Description |
|-----|-------------|
| https://docs.crewai.com/concepts/agents | CrewAI agent YAML format (role, goal, backstory) |
| https://docs.crewai.com/concepts/tasks | CrewAI task YAML format (description, expected_output, agent) |
| https://github.com/crewAIInc/crewAI | CrewAI GitHub repository |
| https://soulspec.org | SoulSpec website -- SOUL.md, IDENTITY.md, AGENTS.md, soul.json |
| https://github.com/mergisi/awesome-openclaw-agents | 100+ SoulSpec SOUL.md templates |
| https://github.com/openclaw/openclaw/discussions/20131 | OpenClaw community discussion on agent templates |
| https://github.com/openclaw/openclaw/discussions/17022 | Free SOUL.md templates thread |
| https://github.com/msitarzewski/agency-agents | agency-agents -- 112+ identity-first agent definitions |
| https://github.com/msitarzewski/agency-agents/blob/main/CONTRIBUTING.md | agency-agents template and contributing guide |
| https://github.com/msitarzewski/agency-agents/blob/main/scripts/convert.sh | convert.sh -- 480-line multi-format conversion (7 targets) |
| https://github.com/msitarzewski/agency-agents/blob/main/scripts/lint-agents.sh | lint-agents.sh -- 88-line structural linter |
| https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-frontend-developer.md | Example identity-first agent file |
| https://code.claude.com/docs/en/memory | Claude Code CLAUDE.md and .claude/rules/ format |
| https://code.claude.com/docs/en/settings | Claude Code settings files |
| https://cursor.com/docs/context/rules | Cursor .mdc rules format |
| https://openai.github.io/openai-agents-python/agents/ | OpenAI Agents SDK agent definition |
| https://github.com/openai/openai-agents-python | OpenAI Agents SDK repository |
| https://mastra.ai/docs/agents/overview | Mastra AI agent definition format |

### Linting Tools and Precedents
| URL | Description |
|-----|-------------|
| https://vale.sh/docs/ | Vale -- prose linting CLI (format-agnostic scoping) |
| https://vale.sh/docs/topics/scoping | Vale scoping -- how format-agnostic rules work |
| https://vale.sh/docs/checks/existence | Vale existence check -- token-to-regex compilation |
| https://github.com/errata-ai/styles | Vale official style packages index |
| https://github.com/errata-ai/Joblint | Joblint Vale port -- 18 rules for identity/role language |
| https://github.com/rowanmanning/joblint | Original joblint -- 419 lines of pattern rules |
| https://eslint.org/docs/latest/use/configure/configuration-files | ESLint flat config -- multi-file-type handling |
| https://github.com/DavidAnson/markdownlint | markdownlint -- markdown structure linter |
| https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md | markdownlint custom rules API (frontMatterLines) |
| https://github.com/OnkarRuikar/markdownlint-rule-search-replace | markdownlint search-replace plugin |
| https://github.com/github/docs/tree/main/src/content-linter | GitHub Docs -- 44+ custom linting rules |
| https://github.com/github/docs/blob/main/src/content-linter/lib/linting-rules/frontmatter-schema.ts | GitHub's AJV frontmatter validation |
| https://github.com/jonschlinkert/gray-matter | gray-matter -- YAML frontmatter parser |
| https://zod.dev/ | Zod -- TypeScript schema validation |
| https://textlint.org/ | textlint -- pluggable natural language linter |
| https://github.com/btford/write-good | write-good -- prose anti-pattern detection |
| https://github.com/amperser/proselint | proselint -- prose linting from writing authorities |
| https://docs.astro.build/en/guides/content-collections/ | Astro Content Collections -- canonical Zod + frontmatter |

### Research and Evidence
| URL | Description |
|-----|-------------|
| https://arxiv.org/abs/2311.10054 | Zheng et al. (EMNLP 2024) -- identity roles "largely random" |
| https://arxiv.org/abs/2510.21413 | MSR 2026 paper -- AGENTS.md evolution in OSS (466 repos) |
| https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts | Anthropic prompt engineering guide -- behavioral framing |
| https://yuv.ai/blog/agency-agents | agency-agents blog coverage |
| https://medium.com/coding-nexus/someone-built-a-full-ai-agency-on-github-61-agents-10k-stars-in-7-days-ac976f85925d | Medium analysis of agency-agents growth |

### Agent Collections and Directories
| URL | Description |
|-----|-------------|
| https://github.com/VoltAgent/awesome-agent-skills | 500+ agent skills for Claude Code, Codex, Gemini CLI, Cursor |
| https://github.com/VoltAgent/awesome-claude-code-subagents | 127+ Claude Code subagents |
| https://github.com/VoltAgent/awesome-openclaw-skills | 5,400+ OpenClaw skills |
| https://github.com/mitsuhiko/agent-prompts | Pipeline prompts for software development |
| https://github.com/baz-scm/awesome-reviewers | Code review system prompts from OSS |
| https://github.com/f/awesome-chatgpt-prompts | 151k stars -- world's largest prompt library |
| https://github.com/dontriskit/awesome-ai-system-prompts | System prompts from ChatGPT, Claude, Manus, etc. |
| https://github.com/EliFuzz/awesome-system-prompts | Production AI coding agent system prompts |
| https://promptbase.com | Paid prompt marketplace (260k+ prompts) |

---

## Raw Links (Every URL Encountered)

```
https://docs.crewai.com/concepts/agents
https://docs.crewai.com/concepts/tasks
https://docs.crewai.com/concepts/crews
https://github.com/crewAIInc/crewAI
https://github.com/crewAIInc/crewAI/blob/main/src/crewai/project/crew_base.py
https://soulspec.org
https://soulspec.org/spec
https://soulspec.org/spec/soul-md
https://soulspec.org/docs
https://soulspec.org/docs/soul-md
https://soulspec.org/docs/identity-md
https://soulspec.org/getting-started
https://github.com/nousresearch/soulspec
https://github.com/SoulSpec/soul-spec
https://github.com/opensouls/soul-spec
https://github.com/soulspec/soulspec
https://github.com/ykhli/soul-spec
https://github.com/mergisi/awesome-openclaw-agents
https://github.com/openclaw/openclaw/discussions/20131
https://github.com/openclaw/openclaw/discussions/17022
https://github.com/msitarzewski/agency-agents
https://github.com/msitarzewski/agency-agents/blob/main/CONTRIBUTING.md
https://github.com/msitarzewski/agency-agents/blob/main/scripts/convert.sh
https://github.com/msitarzewski/agency-agents/blob/main/scripts/lint-agents.sh
https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-frontend-developer.md
https://yuv.ai/blog/agency-agents
https://medium.com/coding-nexus/someone-built-a-full-ai-agency-on-github-61-agents-10k-stars-in-7-days-ac976f85925d
https://code.claude.com/docs/en/memory
https://code.claude.com/docs/en/settings
https://code.claude.com/docs/llms.txt
https://cursor.com/docs/context/rules
https://openai.github.io/openai-agents-python/agents/
https://github.com/openai/openai-agents-python
https://mastra.ai/docs/agents/overview
https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts
https://vale.sh/docs/
https://vale.sh/docs/topics/scoping
https://vale.sh/docs/checks/existence
https://vale.sh/docs/topics/styles/
https://vale.sh/docs/keys/formats
https://github.com/errata-ai/styles
https://github.com/errata-ai/Joblint
https://github.com/errata-ai/Joblint/tree/master/Joblint
https://github.com/errata-ai/Microsoft
https://github.com/errata-ai/Google
https://github.com/errata-ai/write-good
https://github.com/errata-ai/proselint
https://github.com/errata-ai/alex
https://github.com/errata-ai/readability
https://github.com/rowanmanning/joblint
https://eslint.org/docs/latest/use/configure/configuration-files
https://github.com/DavidAnson/markdownlint
https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md
https://github.com/OnkarRuikar/markdownlint-rule-search-replace
https://github.com/github/docs/tree/main/src/content-linter
https://github.com/github/docs/blob/main/src/content-linter/style/github-docs.ts
https://github.com/github/docs/blob/main/src/content-linter/lib/linting-rules/frontmatter-schema.ts
https://github.com/jonschlinkert/gray-matter
https://github.com/JulianCataldo/remark-lint-frontmatter-schema
https://github.com/remarkjs/remark-frontmatter
https://github.com/remarkjs/remark-lint
https://github.com/timlrx/contentlayer2
https://github.com/ajv-validator/ajv
https://zod.dev/
https://zod.dev/api#refine
https://docs.astro.build/en/guides/content-collections/
https://textlint.org/
https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule
https://github.com/amperser/proselint
https://github.com/btford/write-good
https://github.com/btford/passive-voice
https://github.com/btford/weasel-words
https://arxiv.org/abs/2311.10054
https://arxiv.org/abs/2510.21413
https://github.com/VoltAgent/awesome-agent-skills
https://github.com/VoltAgent/awesome-claude-code-subagents
https://github.com/VoltAgent/awesome-openclaw-skills
https://github.com/mitsuhiko/agent-prompts
https://github.com/mitsuhiko/agent-stuff
https://github.com/baz-scm/awesome-reviewers
https://baz.co/resources/from-review-thread-to-team-standard-how-we-built-awesomereviewers
https://baz.co/resources/engineering-intuition-at-scale-the-architecture-of-agentic-code-review
https://github.com/f/awesome-chatgpt-prompts
https://github.com/dontriskit/awesome-ai-system-prompts
https://github.com/EliFuzz/awesome-system-prompts
https://github.com/tallesborges/agentic-system-prompts
https://github.com/mustvlad/ChatGPT-System-Prompts
https://github.com/LouisShark/chatgpt_system_prompt
https://github.com/ai-boost/awesome-prompts
https://github.com/e2b-dev/awesome-ai-agents
https://github.com/kyrolabs/awesome-agents
https://github.com/jim-schwoebel/awesome_ai_agents
https://github.com/slavakurilyak/awesome-ai-agents
https://github.com/Jenqyang/Awesome-AI-Agents
https://github.com/ashishpatel26/500-AI-Agents-Projects
https://github.com/tmgthb/Autonomous-Agents
https://huggingface.co/blog/tegridydev/open-source-ai-agents-directory
https://promptbase.com
https://www.godofprompt.ai/blog/review-popular-ai-prompt-library-platforms
```
