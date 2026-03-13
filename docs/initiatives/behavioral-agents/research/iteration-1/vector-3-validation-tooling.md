# Validation Tooling Landscape for Behavioral Agent Definitions

**Date:** 2026-03-11
**Researcher:** Claude (Opus 4.6)
**Context:** Sherpa Behavioral Agent schema needs validation tooling -- a linter that catches identity language, validates required fields, warns about missing behavioral constraints, and ensures agents conform to behavioral engineering principles.

---

## Key Discoveries

### 1. YAML/Frontmatter Schema Validation Tools

- **gray-matter** (v4.0.3) is the de facto standard for parsing YAML frontmatter from markdown in Node.js. Used by Gatsby, Netlify, Assemble. Returns `{ data, content, matter, isEmpty }`. Does NOT validate -- only parses. Any validation must be layered on top.
  - Source: https://github.com/jonschlinkert/gray-matter

- **Astro Content Collections** is the canonical example of Zod + frontmatter validation at scale. Uses `defineCollection({ schema: z.object({...}) })` to validate every markdown file at build time. Supports enums, arrays, nested objects, optional fields, defaults, transforms, and cross-collection references. Build fails on schema violation with helpful error messages.
  - Source: https://docs.astro.build/en/guides/content-collections/

- **remark-lint-frontmatter-schema** (by Julian Cataldo) validates YAML frontmatter against JSON Schema within the unified/remark pipeline. Supports per-file `$schema` keys, global glob-to-schema mappings, and schema composition via `allOf`/`$ref`.
  - Source: https://github.com/JulianCataldo/remark-lint-frontmatter-schema

- **GitHub's frontmatter-schema rule (GHD012)** validates frontmatter using AJV (JSON Schema) inside a custom markdownlint rule. Their `frontmatter-schema.ts` calls `readFrontmatter()` then validates against a JSON Schema via AJV, reporting errors with line numbers. They also have separate rules for frontmatter video transcripts, hero images, children, curly quotes, versions whitespace, landing carousels, and intro links -- each a dedicated rule file.
  - Source: https://github.com/github/docs/blob/main/src/content-linter/lib/linting-rules/frontmatter-schema.ts

- **Contentlayer2** provides `defineDocumentType()` with a schema DSL for typed markdown documents. Auto-generates TypeScript types. Validates at build time.
  - Source: https://github.com/timlrx/contentlayer2

### 2. Zod Schemas for YAML Validation

The **Astro pattern** is the gold standard: parse YAML with gray-matter (or equivalent), pipe `data` object into `z.object().parse()`. Key Zod features for agent validation:

- **`z.string().regex()`** -- enforce kebab-case names, disposition format patterns
- **`z.enum()`** -- constrain `model-tier` to `["high", "medium", "low"]`, `category` to taxonomy values
- **`z.array(z.string()).min(1)`** -- require at least one behavioral constraint
- **`.optional()` and `.default()`** -- progressive enhancement (optional fields with sensible defaults)
- **`.refine()`** -- custom validation: "disposition must not contain identity language"
- **`.superRefine()`** -- multiple issues from one validation: scan body text for identity patterns, report each occurrence separately with line context
- **`z.discriminatedUnion()`** -- different validation based on agent category
- **`.transform()`** -- normalize data during validation (e.g., lowercase category)

```typescript
// Concrete pattern for behavioral agent frontmatter
const AgentFrontmatter = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, "Must be kebab-case"),
  "display-name": z.string().min(1),
  category: z.string(),
  disposition: z.string().min(1).max(120).refine(
    (val) => !IDENTITY_PATTERNS.some(p => p.test(val)),
    { message: "Disposition contains identity language" }
  ),
  "domain-scope": z.array(z.string()).optional(),
  "behavioral-constraints": z.array(z.string()).optional(),
  "quality-bar": z.array(z.string()).optional(),
  "fail-triggers": z.array(z.string()).optional(),
  "model-tier": z.enum(["high", "medium", "low"]).default("medium"),
  // ... etc
});
```

No public repos combine gray-matter + Zod for frontmatter validation (GitHub code search returned zero results), but the pattern is straightforward and well-documented through Astro's implementation.

### 3. Natural Language Linting Tools

#### Vale (Go binary, YAML rules)
The most powerful prose linter. 11 check types, each defined as a YAML file. Key types for agent validation:

- **`existence`** -- detect patterns by regex. Compiles tokens into `\b(?:token1|token2)\b`. Supports `raw` for complex regex, `ignorecase`, `nonword`, `exceptions`.
- **`substitution`** -- flag pattern and suggest replacement
- **`script`** -- run arbitrary Tengo scripts for complex validation

Vale has official style packages: Microsoft, Google, write-good, proselint, **Joblint** (detects identity/role language in job postings -- directly analogous to agent definitions), alex (inclusive language), Readability.

**Critical finding:** Joblint's Vale port already detects "visionary" language, "competitive" language, "dumb titles" (ninja, rockstar, guru), and "bro culture" -- patterns directly analogous to identity claims in agent definitions.

- Source: https://vale.sh/docs/
- Joblint styles: https://github.com/errata-ai/Joblint
- Existence check: https://vale.sh/docs/checks/existence

#### textlint (Node.js, plugin architecture)
Pluggable linting framework. Key rules: `textlint-rule-alex` (gendered/insensitive language), `textlint-rule-write-good` (passive voice, weasel words), `textlint-rule-stop-words` (buzzwords, filler).

- Source: https://textlint.org/
- Rule collection: https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule

#### proselint (Python CLI)
~80 checks across typography, word choice, hedging, jargon, sexist language. Hierarchical categories allow granular control.

- Source: https://github.com/amperser/proselint

#### write-good (Node.js)
9 checks: passive voice, weasel words, adverbs, lexical illusions, cliches, "so" at start, "there is/are", wordiness, e-prime (to-be verbs). Each check is a function returning `{ index, offset }`.

**Passive voice regex:** `\b(am|are|were|being|is|been|was|be)\b\s*([\w]+ed|<irregulars>)\b` -- a concrete regex pattern for detecting one prose anti-pattern.

**Weasel words list:** very, quite, fairly, rather, somewhat, etc. -- detected with `\b(weasels.join('|'))\b`.

- Source: https://github.com/btford/write-good
- Passive voice impl: https://github.com/btford/passive-voice

### 4. agency-agents' lint-agents.sh

The **complete source** of `msitarzewski/agency-agents` linting (88 lines of bash):

**Checks performed:**
1. Frontmatter opening `---` exists (ERROR)
2. Frontmatter is non-empty (ERROR)
3. Required frontmatter fields: `name`, `description`, `color` (ERROR per missing field)
4. Recommended sections in body: "Identity", "Core Mission", "Critical Rules" (WARN)
5. Body has meaningful content: >= 50 words (WARN)

**Key limitations:**
- No schema validation of field values
- No content pattern detection (identity language, vague claims)
- No regex-based anti-pattern matching
- No relationship between fields (e.g., name matches filename)
- Section detection is just `grep -qi` -- doesn't validate section content

**What it gets right:**
- Clear error/warning severity distinction
- Exit code 1 on errors (blocks merge)
- Scans predefined directory structure
- Accepts file list or discovers files

Full source: https://github.com/msitarzewski/agency-agents/blob/main/scripts/lint-agents.sh

**agency-agents format observation:** Their agents use identity-first format extensively. The Frontend Developer agent begins: "You are **Frontend Developer**, an expert frontend developer who specializes in modern web technologies." Sections include "Your Identity & Memory", "Your Communication Style", "Your Success Metrics" -- all personality-driven, exactly the pattern behavioral engineering rejects.

- Source: https://github.com/msitarzewski/agency-agents
- Contributing guide with agent template: https://github.com/msitarzewski/agency-agents/blob/main/CONTRIBUTING.md

### 5. Content Policy Linting at Scale

#### GitHub Docs (canonical example)
GitHub's `src/content-linter/` is the most sophisticated content policy linting system found:

- **44+ custom rules** in `lib/linting-rules/`, each a TypeScript file implementing the markdownlint custom rule interface
- **Four linter categories:** native markdownlint rules, GitHub-specific markdown linters, `markdownlint-rule-search-replace` patterns, custom documentation rules
- **Frontmatter-specific rules:** `frontmatter-schema.ts` (AJV validation), `frontmatter-video-transcripts.ts`, `frontmatter-hero-image.ts`, `frontmatter-children.ts`, `frontmatter-curly-quotes.ts`, `frontmatter-versions-whitespace.ts`, `frontmatter-landing-carousels.ts`, `frontmatter-intro-links.ts`
- **Search-replace patterns:** content policy enforcement via regex (TODOCS placeholders, deprecated domains, deprecated liquid syntax)
- **Severity system:** error (blocks merge) vs warning

Source: https://github.com/github/docs/tree/main/src/content-linter

#### markdownlint custom rules API
Custom rules receive `params` with:
- `params.lines` -- array of all lines
- `params.frontMatterLines` -- **separate array** for frontmatter content
- `params.parsers.micromark.tokens` -- parsed AST tokens
- `params.config` -- rule configuration

This means frontmatter and body content can be validated independently, which is exactly what behavioral agent validation needs.

Source: https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md

#### markdownlint-rule-search-replace
The plugin GitHub uses for content policy patterns. Supports `applyToFrontmatter: true/false`, `searchScope: "all" | "code" | "text"`, regex via `searchPattern`, and literal string via `search`.

Source: https://github.com/OnkarRuikar/markdownlint-rule-search-replace

### 6. CI/CD Integration Patterns

**GitHub Actions (most common):**
- markdownlint has an official GitHub Action
- Vale has a GitHub Action: `errata-ai/vale-action`
- Custom Node.js scripts run as workflow steps

**Pre-commit hooks:**
- write-good has `.pre-commit-hooks.yaml`
- markdownlint-cli2 supports pre-commit
- Vale supports pre-commit

**The established pattern for markdown config validation in CI:**
1. Run markdownlint for structure (frontmatter exists, sections present)
2. Run custom validation script for schema (Zod/AJV against parsed frontmatter)
3. Run Vale or custom regex for content policy (identity language, anti-patterns)
4. All three as separate steps in a GitHub Actions workflow

### 7. Regex Patterns for Identity Language Detection

Based on joblint, write-good, and the behavioral engineering principle, here are concrete regex patterns:

#### Identity Claims (ERROR -- block merge)
```javascript
const IDENTITY_PATTERNS = [
  /\byou are\b/i,                           // "You are an expert"
  /\byou're\b/i,                            // "You're a senior"
  /\bI am\b/i,                              // "I am an expert" (first-person variant)
  /\b(?:expert|senior|experienced)\b/i,     // Experience claims
  /\byears? of experience\b/i,             // "15 years of experience"
  /\bpersonality\s*:/i,                     // "Personality: skeptical"
  /\byour? personality\b/i,                // "Your personality is..."
  /\byou remember\b/i,                      // Memory claims
  /\byou have (?:deep|extensive|broad)\b/i, // "You have deep knowledge"
  /\byou know\b/i,                          // "You know every..."
];
```

#### Identity-Adjacent (WARNING -- flag for review)
```javascript
const IDENTITY_ADJACENT = [
  /\bguru\b/i,                              // Joblint: "dumb titles"
  /\bninja\b/i,
  /\brock[ -]*star\b/i,
  /\bwizard\b/i,
  /\bhero(?:ic)?\b/i,
  /\bbadass\b/i,
  /\bsuper[ -]*star\b/i,
  /\bworld[ -]*class\b/i,
  /\bbest[ -]*in[ -]*class\b/i,
  /\bpassion(?:ate)?\b/i,                   // Aspirational, not behavioral
  /\benthusiast(?:ic)?\b/i,
  /\bloves?\b/i,                            // "Loves clean code"
  /\bthinks? like\b/i,                      // "Thinks like a senior engineer"
];
```

#### Vague Behavioral Claims (WARNING -- should be specific)
```javascript
const VAGUE_PATTERNS = [
  /\bensure quality\b/i,                    // Not testable
  /\bhigh[ -]*quality\b/i,                  // Not measurable
  /\bbest practices?\b/i,                   // Undefined
  /\bclean code\b/i,                        // Subjective
  /\belegant\b/i,                           // Subjective
  /\brobust\b/i,                            // Overused, undefined
  /\bscalable\b/i,                          // Without specific metric
  /\bmaintainable\b/i,                      // Without specific criterion
  /\befficient(?:ly)?\b/i,                  // Without metric
  /\boptimal(?:ly)?\b/i,                    // Without criterion
];
```

### 8. CrewAI's Agent Schema (Comparator)

CrewAI is the most prominent agent framework with YAML agent definitions:
- **Required fields:** `role`, `goal`, `backstory`
- **No behavioral constraints** -- relies on prose `backstory` for behavior
- **No validation** beyond type checking (string types via Pydantic)
- **Identity-first** by design -- `backstory` is literally "provides personality"

This confirms that behavioral agent validation is a green field. No existing framework validates for behavioral engineering principles.

- Source: https://docs.crewai.com/concepts/agents

### 9. Anthropic's Prompt Engineering Guidance

Anthropic's official prompt engineering guide uses behavioral framing exclusively:
- Example role: `"You are a helpful coding assistant specializing in Python"` -- domain scope, not identity claim
- Section titled "Give Claude a role" -- but every example is a behavioral/domain scope, not personality
- The guide is built entirely around behavioral instructions (be clear, be direct, use examples, use XML tags)
- No mention of personality traits, experience claims, or identity assertions in any recommended pattern

- Source: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts

### 10. Zheng et al. (EMNLP 2024) -- Evidence Against Identity Roles

"When 'A Helpful Assistant' Is Not Really Helpful" -- tested 162 roles across 2,410 factual questions:
- Personas in system prompts **do not improve performance** vs. no persona
- Effects of individual personas are **"largely random"**
- Automatically identifying the best persona performs **no better than random selection**

This is the empirical evidence that behavioral constraints outperform identity claims.

- Source: https://arxiv.org/abs/2311.10054

---

## Implications for Sherpa's Validation Tooling

### Recommended Architecture: Three-Layer Linter

**Layer 1: Schema Validation (Zod)**
Parse YAML frontmatter with gray-matter, validate with Zod schema. This handles:
- Required fields (name, display-name, category, disposition)
- Field types and formats (kebab-case, enums, arrays)
- Name-filename consistency
- Disposition length limit (120 chars)

**Layer 2: Content Pattern Detection (Custom regex engine)**
Scan frontmatter values AND body text for anti-patterns. This handles:
- Identity language in disposition (ERROR)
- Identity language in body (WARNING)
- Vague behavioral claims (WARNING)
- Missing recommended fields (WARNING)

**Layer 3: Structural Validation (Custom)**
Validate document structure. This handles:
- Body contains description paragraph
- Body doesn't exceed 200 lines
- Required sections present (for specific agent categories)

### Build vs. Buy Decision

| Approach | Pros | Cons |
|----------|------|------|
| **Custom Bun/Node script** | Full control, single dependency (gray-matter + zod), exact behavioral engineering rules | Must maintain regex patterns manually |
| **Vale** | Mature, proven at scale, YAML rule files, CI integration | Go binary, overkill for ~120 agent files, doesn't do frontmatter schema validation |
| **markdownlint + custom rules** | GitHub's proven approach, frontmatter-aware API | Heavy framework for focused use case |
| **Hybrid: Zod script + Vale** | Best of both -- schema validation AND prose linting | Two tools to maintain |

**Recommendation: Custom Bun script with Zod + gray-matter.** Reasons:
1. The validation rules are highly specific to behavioral engineering -- no off-the-shelf tool covers them
2. The file count (~120 agents) doesn't justify Vale's complexity
3. Zod provides TypeScript types alongside validation (useful for Sherpa Studio consuming agent data)
4. A single `lint-agents.ts` script with `gray-matter` parse + `z.object().safeParse()` + regex scanning covers all three layers
5. The agency-agents `lint-agents.sh` (88 lines of bash) proves this can be simple -- our version just needs smarter checks

### Script Architecture Sketch

```
lint-agents.ts
  ├── parseAgent(filePath) → { frontmatter, body, lines }     # gray-matter
  ├── validateSchema(frontmatter, filename) → ZodResult        # Zod Layer 1
  ├── scanPatterns(frontmatter, body) → PatternResult[]         # Regex Layer 2
  │   ├── identityClaims(text) → Finding[]                      #   ERROR
  │   ├── identityAdjacent(text) → Finding[]                    #   WARNING
  │   └── vagueConstraints(text) → Finding[]                    #   WARNING
  ├── validateStructure(body, frontmatter) → StructureResult[]  # Structure Layer 3
  └── report(results) → stdout + exit code
```

### What the agency-agents Approach Misses (and we should add)

1. **No schema validation** -- they check field existence but not values
2. **No content analysis** -- they grep for section headers but don't analyze content
3. **No cross-field validation** -- name vs filename, category vs taxonomy
4. **No identity language detection** -- the core of behavioral engineering
5. **No progressive severity** -- we need error/warning/info
6. **No fix suggestions** -- Vale and markdownlint both support auto-fix; we should suggest rewrites

---

## Sources

### Primary Tools
| URL | Description |
|-----|-------------|
| https://github.com/jonschlinkert/gray-matter | gray-matter -- YAML frontmatter parser for Node.js |
| https://zod.dev/ | Zod -- TypeScript-first schema validation |
| https://zod.dev/api#refine | Zod .refine() and .superRefine() for custom validation |
| https://vale.sh/docs/ | Vale -- prose linting CLI with YAML rules |
| https://vale.sh/docs/topics/styles/ | Vale styles: directory structure, rule format, all check types |
| https://vale.sh/docs/checks/existence | Vale existence check: tokens, raw, ignorecase, nonword, exceptions |
| https://textlint.org/ | textlint -- pluggable natural language linter |
| https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule | textlint rule collection |
| https://github.com/amperser/proselint | proselint -- prose linting from writing authorities |
| https://github.com/btford/write-good | write-good -- naive prose linter (passive voice, weasel words, etc.) |
| https://github.com/btford/passive-voice | passive-voice npm module -- regex implementation |
| https://github.com/DavidAnson/markdownlint | markdownlint -- markdown structure linter |
| https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md | markdownlint custom rules API |
| https://github.com/OnkarRuikar/markdownlint-rule-search-replace | markdownlint search-replace plugin (used by GitHub) |
| https://github.com/ajv-validator/ajv | AJV -- JSON Schema validator (used by GitHub for frontmatter) |

### Reference Implementations
| URL | Description |
|-----|-------------|
| https://docs.astro.build/en/guides/content-collections/ | Astro Content Collections -- canonical Zod + frontmatter validation |
| https://github.com/github/docs/tree/main/src/content-linter | GitHub Docs content linter -- 44+ custom rules, frontmatter validation |
| https://github.com/github/docs/blob/main/src/content-linter/style/github-docs.ts | GitHub Docs linter config -- all rule configurations and search-replace patterns |
| https://github.com/github/docs/blob/main/src/content-linter/lib/linting-rules/frontmatter-schema.ts | GitHub's frontmatter-schema rule using AJV |
| https://github.com/msitarzewski/agency-agents/blob/main/scripts/lint-agents.sh | agency-agents lint script (source material) |
| https://github.com/msitarzewski/agency-agents/blob/main/CONTRIBUTING.md | agency-agents contributing guide with agent template |
| https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-frontend-developer.md | agency-agents example agent (identity-first format) |
| https://github.com/timlrx/contentlayer2 | Contentlayer2 -- schema-based markdown validation |
| https://github.com/JulianCataldo/remark-lint-frontmatter-schema | remark frontmatter validation against JSON Schema |
| https://github.com/remarkjs/remark-frontmatter | remark-frontmatter -- YAML frontmatter plugin for unified |
| https://github.com/remarkjs/remark-lint | remark-lint -- markdown linting in the unified ecosystem |

### Anti-Pattern Libraries (Pattern Sources)
| URL | Description |
|-----|-------------|
| https://github.com/errata-ai/Joblint | Joblint Vale port -- detects identity/role language in job postings |
| https://github.com/rowanmanning/joblint | Original joblint -- 419 lines of pattern rules for problematic job listing language |
| https://github.com/errata-ai/styles | Official Vale style packages index |

### Agent Frameworks (Comparators)
| URL | Description |
|-----|-------------|
| https://docs.crewai.com/concepts/agents | CrewAI agent definition format (role, goal, backstory) |
| https://github.com/msitarzewski/agency-agents | agency-agents -- 120+ identity-first agent definitions |

### Evidence Base
| URL | Description |
|-----|-------------|
| https://arxiv.org/abs/2311.10054 | Zheng et al. (EMNLP 2024) -- identity roles are "largely random" across 162 roles |
| https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts | Anthropic prompt engineering guide -- behavioral framing throughout |

---

## Raw Links (Every URL Encountered)

```
https://github.com/jonschlinkert/gray-matter
https://zod.dev/
https://zod.dev/api#refine
https://vale.sh/docs/
https://vale.sh/docs/topics/styles/
https://vale.sh/docs/checks/existence
https://textlint.org/
https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule
https://github.com/amperser/proselint
https://github.com/btford/write-good
https://github.com/btford/passive-voice
https://github.com/btford/weasel-words
https://github.com/DavidAnson/markdownlint
https://github.com/DavidAnson/markdownlint/blob/main/doc/CustomRules.md
https://github.com/OnkarRuikar/markdownlint-rule-search-replace
https://github.com/ajv-validator/ajv
https://docs.astro.build/en/guides/content-collections/
https://github.com/github/docs/tree/main/src/content-linter
https://github.com/github/docs/blob/main/src/content-linter/style/github-docs.ts
https://github.com/github/docs/blob/main/src/content-linter/lib/linting-rules/frontmatter-schema.ts
https://github.com/msitarzewski/agency-agents
https://github.com/msitarzewski/agency-agents/blob/main/scripts/lint-agents.sh
https://github.com/msitarzewski/agency-agents/blob/main/CONTRIBUTING.md
https://github.com/msitarzewski/agency-agents/blob/main/engineering/engineering-frontend-developer.md
https://github.com/timlrx/contentlayer2
https://github.com/JulianCataldo/remark-lint-frontmatter-schema
https://github.com/remarkjs/remark-frontmatter
https://github.com/remarkjs/remark-lint
https://github.com/errata-ai/Joblint
https://github.com/errata-ai/Joblint/tree/master/Joblint
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Visionary.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Competitive.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/Reassure.yml
https://raw.githubusercontent.com/errata-ai/Joblint/master/Joblint/TechTerms.yml
https://github.com/errata-ai/styles
https://github.com/errata-ai/Microsoft
https://github.com/errata-ai/Google
https://github.com/errata-ai/write-good
https://github.com/errata-ai/proselint
https://github.com/errata-ai/alex
https://github.com/errata-ai/readability
https://github.com/rowanmanning/joblint
https://docs.crewai.com/concepts/agents
https://arxiv.org/abs/2311.10054
https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/system-prompts
https://github.com/crewAIInc/crewAI
```

---

## Open Questions

1. **Should the linter offer auto-fix suggestions for identity language?** Vale and markdownlint-rule-search-replace both support `replace` actions. For identity language, the rewrite is non-trivial (requires understanding context), but for common patterns ("You are an expert X" -> "Focuses on X, enforces...") we could provide templates.

2. **Should Vale be used in addition to the custom script?** Vale excels at prose quality (passive voice, weasel words, hedging). If agent body descriptions grow beyond simple paragraphs, Vale's `existence` rules could catch vague language that regex alone misses. The overhead is a Go binary in CI.

3. **How should the taxonomy be validated?** The schema spec mentions `taxonomy.yaml` as an optional constraint on `category`. Should the linter read this file when present, or always accept any string?

4. **Should the linter validate `context-packages` and `rules` paths exist?** In the base Sherpa catalog these are empty. In org-specific deployments, validating that referenced files exist would catch drift. This requires filesystem access beyond the agent file.

5. **What about migration-mode linting?** During the agency-agents -> behavioral agents migration, a "migration lint" mode could compare source identity agents against target behavioral agents, flagging identity patterns that survived migration.

6. **Should behavioral-constraint quality be scored?** Beyond detecting anti-patterns, could we score the *quality* of constraints? e.g., "Flag any function without typed exports" is more testable than "Ensure type safety." This edges into AI-assisted linting (using an LLM to evaluate constraint quality).

7. **What about the `vibe` field?** The schema spec says personality is acceptable in `vibe` because it's human-facing, not model-facing. Should the linter enforce that `vibe` is NOT injected into system prompts? This is an architectural concern more than a linting concern.
