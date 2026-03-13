# Behavioral Agents Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create the base behavioral agent catalog (~20 agents) with Zod validation, flat directory structure, and updated Studio integration — the first research-backed, behaviorally-decomposed agent definition library.

**Architecture:** Flat `agents/` directory at project root with YAML+markdown agent files. Zod schema in `packages/studio-core` validates frontmatter. Existing 11 WavePoint roles in `docs/agents/roles/` are migrated to the new format with WavePoint-specific fields stripped. ~9 net-new agents complete the 20-role catalog from iteration 3. Studio reads from both `agents/` (base catalog) and `docs/agents/roles/` (org-specific overrides).

**Tech Stack:** TypeScript, Zod, gray-matter, Bun (scripts), pnpm monorepo

---

## What's Already Done (Do Not Repeat)

- Schema specification: `docs/initiatives/behavioral-agents/schema-spec.md` (v1.0, finalized)
- 5 example agents: `docs/initiatives/behavioral-agents/deliverables/examples/` (security-auditor, backend-developer, technical-writer, data-analyst, code-formatter)
- 4 research iterations covering format landscape, catalog composition, scaling evidence, distribution strategy
- Behavioral engineering rule: `.claude/rules/behavioral-engineering.md`
- Sub-initiative spawned: `behavioral-lint-tool` (out of scope for this plan)
- Cross-tool export branch seeded (out of scope for this plan)

## What This Plan Delivers

1. `agents/` directory with ~20 behavioral agent definitions in the finalized schema format
2. Updated `agentRoleFrontmatterSchema` in `packages/studio-core/src/schemas.ts` supporting both old (`role:`) and new (`name:`) formats
3. Updated `AGENT_ROLE_CATEGORIES` in `packages/studio-core/src/types.ts` with the 10-category taxonomy
4. `agents/taxonomy.yaml` documenting the category structure
5. Validation script at `scripts/validate-agent.ts` (Bun + gray-matter + Zod)
6. Migration of 11 existing WavePoint roles → base catalog format

---

## Task 1: Behavioral Agent Zod Schema

**Files:**
- Modify: `packages/studio-core/src/types.ts:2-9` (expand categories)
- Modify: `packages/studio-core/src/schemas.ts:145-157` (add behavioral fields)
- Test: `packages/studio-core/src/__tests__/behavioral-agent-schema.test.ts`

### Step 1: Write the failing test

Create the test file. The schema should validate a full behavioral agent and reject identity language in disposition.

```typescript
import { describe, expect, it } from "vitest";
import { behavioralAgentFrontmatterSchema } from "../schemas";

describe("behavioralAgentFrontmatterSchema", () => {
  it("validates a minimal agent (name, display-name, category, disposition)", () => {
    const result = behavioralAgentFrontmatterSchema.safeParse({
      name: "code-formatter",
      "display-name": "Code Formatter",
      category: "engineering",
      disposition: "mechanical — apply formatting rules exactly, no discretion",
    });
    expect(result.success).toBe(true);
  });

  it("validates a full agent with all behavioral fields", () => {
    const result = behavioralAgentFrontmatterSchema.safeParse({
      name: "security-auditor",
      "display-name": "Security Auditor",
      category: "security",
      disposition: "paranoid — assume every input is hostile",
      "domain-scope": ["OWASP Top 10", "Authentication"],
      "behavioral-constraints": ["Flag any user input that reaches a DB query without parameterization"],
      "quality-bar": ["Every finding includes severity and remediation steps"],
      "fail-triggers": ["Claiming no security issues without citing checks performed"],
      "model-tier": "high",
      "tool-permissions": ["read", "review", "research"],
      escalation: ["architectural security -> architect"],
      vibe: "Thinks like an attacker.",
      tags: ["security", "audit"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects agent missing required name field", () => {
    const result = behavioralAgentFrontmatterSchema.safeParse({
      "display-name": "Test",
      category: "engineering",
      disposition: "precise — enforce types",
    });
    expect(result.success).toBe(false);
  });

  it("accepts legacy role: field with name alias", () => {
    const result = behavioralAgentFrontmatterSchema.safeParse({
      role: "code-reviewer",
      "display-name": "Code Reviewer",
      category: "engineering",
      disposition: "adversarial — assumes bugs exist",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("code-reviewer");
    }
  });

  it("accepts all 10 taxonomy categories", () => {
    const categories = [
      "engineering", "product", "design", "research", "quality",
      "operations", "marketing", "security", "data", "governance",
    ];
    for (const category of categories) {
      const result = behavioralAgentFrontmatterSchema.safeParse({
        name: `test-${category}`,
        "display-name": "Test",
        category,
        disposition: "test — test",
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts legacy categories (strategy, domain) and maps them", () => {
    const strategyResult = behavioralAgentFrontmatterSchema.safeParse({
      name: "pm",
      "display-name": "PM",
      category: "strategy",
      disposition: "pragmatic — smallest scope",
    });
    expect(strategyResult.success).toBe(true);
  });
});
```

### Step 2: Run test to verify it fails

Run: `cd /Users/rob/Workbench/sherpa && pnpm -F @sherpa/studio-core test -- --run behavioral-agent-schema`
Expected: FAIL — `behavioralAgentFrontmatterSchema` is not exported from `../schemas`

### Step 3: Update types with new 10-category taxonomy

In `packages/studio-core/src/types.ts`, expand `AGENT_ROLE_CATEGORIES`:

```typescript
export const AGENT_ROLE_CATEGORIES = [
  "engineering",
  "product",
  "design",
  "research",
  "quality",
  "operations",
  "marketing",
  "security",
  "data",
  "governance",
  // Legacy (accepted with warning by linter, mapped by Studio)
  "strategy",
  "domain",
] as const;
```

### Step 4: Add behavioral agent schema to schemas.ts

In `packages/studio-core/src/schemas.ts`, add `behavioralAgentFrontmatterSchema` alongside the existing `agentRoleFrontmatterSchema` (keep the old one for backward compat):

```typescript
export const behavioralAgentFrontmatterSchema = z
  .object({
    // Required
    name: z.string().optional(),
    role: z.string().optional(), // legacy alias for name
    "display-name": z.string(),
    category: z.enum(AGENT_ROLE_CATEGORIES),
    disposition: z.string(),

    // Behavioral (all optional)
    "domain-scope": z.array(z.string()).optional().default([]),
    "behavioral-constraints": z.array(z.string()).optional().default([]),
    "quality-bar": z.array(z.string()).optional().default([]),
    "fail-triggers": z.array(z.string()).optional().default([]),
    "output-style": z.string().optional(),

    // Operational (all optional)
    "model-tier": z.enum(AGENT_MODEL_TIERS).optional().default("medium"),
    "tool-permissions": z.array(z.string()).optional().default([]),
    escalation: z.array(z.string()).optional().default([]),
    "context-packages": z.array(z.string()).optional().default([]),
    rules: z.array(z.string()).optional().default([]),
    skills: z.array(z.string()).optional().default([]),
    patterns: z.array(z.enum(AGENT_PATTERNS)).optional().default([]),
    structure: z.enum(AGENT_STRUCTURES).nullable().optional().default(null),

    // Display (all optional)
    vibe: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    emoji: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    // Resolve legacy role: → name:
    name: data.name ?? data.role ?? "",
  }))
  .refine((data) => data.name.length > 0, {
    message: "Either 'name' or 'role' must be provided",
    path: ["name"],
  });
```

Export it from `packages/studio-core/src/index.ts` if not already barrel-exported.

### Step 5: Run tests to verify they pass

Run: `cd /Users/rob/Workbench/sherpa && pnpm -F @sherpa/studio-core test -- --run behavioral-agent-schema`
Expected: All 6 tests PASS

### Step 6: Typecheck

Run: `cd /Users/rob/Workbench/sherpa && pnpm check`
Expected: PASS (no type errors introduced)

### Step 7: Commit

```bash
git add packages/studio-core/src/types.ts packages/studio-core/src/schemas.ts packages/studio-core/src/__tests__/behavioral-agent-schema.test.ts
git commit -m "feat: add behavioral agent Zod schema with 10-category taxonomy"
```

---

## Task 2: Validation CLI Script

**Files:**
- Create: `scripts/validate-agent.ts`
- Reference: `docs/initiatives/behavioral-agents/schema-spec.md:189-216` (validation rules)

### Step 1: Write the validation script

Create `scripts/validate-agent.ts` — a Bun script that parses agent markdown files with gray-matter and validates against the Zod schema, plus content-level checks.

```typescript
#!/usr/bin/env bun
import matter from "gray-matter";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";
import { behavioralAgentFrontmatterSchema } from "../packages/studio-core/src/schemas";

interface Diagnostic {
  level: "error" | "warning" | "info";
  file: string;
  message: string;
  rule: string;
}

const IDENTITY_ERROR_PATTERNS = [
  /\byou are\b/i,
  /\byou're\b/i,
  /\bi am\b/i,
  /\bi'm\b/i,
  /\bpersonality:/i,
  /\byears of experience\b/i,
];

const IDENTITY_WARNING_PATTERNS = [
  /\bexpert\b/i,
  /\bsenior\b/i,
  /\bjunior\b/i,
  /\bexperienced\b/i,
  /\bpassionate\b/i,
  /\btalented\b/i,
];

function validateFile(filePath: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const content = readFileSync(filePath, "utf-8");
  const fileName = basename(filePath, ".md");

  // Parse frontmatter
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(content);
  } catch {
    diagnostics.push({ level: "error", file: filePath, message: "Failed to parse YAML frontmatter", rule: "parse" });
    return diagnostics;
  }

  // Validate against Zod schema
  const result = behavioralAgentFrontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      diagnostics.push({
        level: "error",
        file: filePath,
        message: `${issue.path.join(".")}: ${issue.message}`,
        rule: "schema",
      });
    }
    return diagnostics; // Skip content checks if schema fails
  }

  const data = result.data;

  // Name matches filename
  if (data.name !== fileName) {
    diagnostics.push({
      level: "error",
      file: filePath,
      message: `name "${data.name}" does not match filename "${fileName}"`,
      rule: "name-match",
    });
  }

  // Identity language in disposition (error)
  for (const pattern of IDENTITY_ERROR_PATTERNS) {
    if (pattern.test(data.disposition)) {
      diagnostics.push({
        level: "error",
        file: filePath,
        message: `Identity language in disposition: ${pattern}`,
        rule: "identity-disposition",
      });
    }
  }

  // Identity language in disposition (warning)
  for (const pattern of IDENTITY_WARNING_PATTERNS) {
    if (pattern.test(data.disposition)) {
      diagnostics.push({
        level: "warning",
        file: filePath,
        message: `Possible identity language in disposition: ${pattern}`,
        rule: "identity-adjacent-disposition",
      });
    }
  }

  // Disposition length
  if (data.disposition.length > 120) {
    diagnostics.push({
      level: "warning",
      file: filePath,
      message: `Disposition is ${data.disposition.length} chars (recommended: ≤120)`,
      rule: "disposition-length",
    });
  }

  // Missing behavioral fields
  if (data["behavioral-constraints"].length === 0 && !parsed.content.includes("## Behavioral Constraints")) {
    diagnostics.push({
      level: "warning",
      file: filePath,
      message: "No behavioral-constraints defined (frontmatter or body section)",
      rule: "missing-constraints",
    });
  }

  if (data["quality-bar"].length === 0) {
    diagnostics.push({
      level: "warning",
      file: filePath,
      message: "No quality-bar defined",
      rule: "missing-quality-bar",
    });
  }

  // Quality-gate agents need fail-triggers
  const isQualityGate =
    data.category === "quality" ||
    data.name.includes("judge") ||
    data.name.includes("reviewer") ||
    data.name.includes("auditor");

  if (data["fail-triggers"].length === 0 && !parsed.content.includes("## Fail Triggers") && isQualityGate) {
    diagnostics.push({
      level: "warning",
      file: filePath,
      message: "Quality-gate agent has no fail-triggers defined",
      rule: "missing-fail-triggers",
    });
  }

  // Identity language in body
  const body = parsed.content;
  for (const pattern of IDENTITY_ERROR_PATTERNS) {
    if (pattern.test(body)) {
      diagnostics.push({
        level: "warning",
        file: filePath,
        message: `Identity language in body: ${pattern}`,
        rule: "identity-body",
      });
    }
  }

  // Missing tags
  if (data.tags.length === 0) {
    diagnostics.push({
      level: "info",
      file: filePath,
      message: "No tags defined",
      rule: "missing-tags",
    });
  }

  // No body description
  if (body.trim().length === 0) {
    diagnostics.push({
      level: "error",
      file: filePath,
      message: "Body must contain at least a description paragraph",
      rule: "missing-body",
    });
  }

  // Legacy role: field
  if (parsed.data.role && !parsed.data.name) {
    diagnostics.push({
      level: "warning",
      file: filePath,
      message: 'Uses legacy "role:" field — migrate to "name:"',
      rule: "legacy-role",
    });
  }

  return diagnostics;
}

// --- CLI ---
const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const strict = args.includes("--strict");
const verbose = args.includes("--verbose");
const paths = args.filter((a) => !a.startsWith("--"));

if (paths.length === 0) {
  console.error("Usage: bun scripts/validate-agent.ts <path> [--json] [--strict] [--verbose]");
  process.exit(1);
}

const allDiagnostics: Diagnostic[] = [];

for (const p of paths) {
  const stat = statSync(p);
  if (stat.isDirectory()) {
    const files = readdirSync(p).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      allDiagnostics.push(...validateFile(join(p, file)));
    }
  } else {
    allDiagnostics.push(...validateFile(p));
  }
}

// Output
if (jsonOutput) {
  console.log(JSON.stringify(allDiagnostics, null, 2));
} else {
  const errors = allDiagnostics.filter((d) => d.level === "error");
  const warnings = allDiagnostics.filter((d) => d.level === "warning");
  const infos = allDiagnostics.filter((d) => d.level === "info");

  for (const d of [...errors, ...warnings, ...(verbose ? infos : [])]) {
    const icon = d.level === "error" ? "✗" : d.level === "warning" ? "⚠" : "ℹ";
    console.log(`${icon} ${d.file}: [${d.rule}] ${d.message}`);
  }

  console.log(`\n${errors.length} errors, ${warnings.length} warnings, ${infos.length} info`);
}

const exitCode = strict
  ? allDiagnostics.some((d) => d.level === "error" || d.level === "warning") ? 1 : 0
  : allDiagnostics.some((d) => d.level === "error") ? 1 : 0;

process.exit(exitCode);
```

### Step 2: Test the script against the existing example agents

Run: `bun scripts/validate-agent.ts docs/initiatives/behavioral-agents/deliverables/examples/`
Expected: 0 errors (warnings for missing tags are OK)

### Step 3: Test against existing WavePoint roles (expect legacy warnings)

Run: `bun scripts/validate-agent.ts docs/agents/roles/`
Expected: Warnings about `role:` → `name:` migration. No errors (if schema accepts legacy fields).

### Step 4: Commit

```bash
git add scripts/validate-agent.ts
git commit -m "feat: add behavioral agent validation script (bun + gray-matter + zod)"
```

---

## Task 3: Create agents/ Directory and Taxonomy

**Files:**
- Create: `agents/taxonomy.yaml`
- Create: `agents/README.md` (brief — just points to schema-spec.md)

### Step 1: Create taxonomy.yaml

```yaml
# Behavioral Agent Catalog — Category Taxonomy
# See: docs/initiatives/behavioral-agents/schema-spec.md

categories:
  engineering:
    display: Engineering
    description: System design, implementation, code quality, review
  product:
    display: Product
    description: Strategy, prioritization, requirements, backlog
    legacy-aliases: [strategy]
  design:
    display: Design
    description: UI/UX, visual design, interaction patterns, research
  research:
    display: Research
    description: Investigation, synthesis, evidence gathering
  quality:
    display: Quality
    description: Testing, validation, evidence collection, judging
  operations:
    display: Operations
    description: Documentation, support, process, project management
  marketing:
    display: Marketing
    description: Content, copy, campaigns, positioning, analytics
  security:
    display: Security
    description: Audit, threat modeling, compliance, access control
  data:
    display: Data
    description: Analytics, pipelines, visualization, reporting
  governance:
    display: Governance
    description: Domain-specific agents, orchestration, meta-agents
    legacy-aliases: [domain]
```

### Step 2: Create agents/README.md

```markdown
# Behavioral Agent Catalog

Base catalog of ~20 behavioral agent definitions. Each agent is a single markdown file with YAML frontmatter following the [Behavioral Agent Schema Specification](../docs/initiatives/behavioral-agents/schema-spec.md).

**Validate:** `bun scripts/validate-agent.ts agents/`

**Categories:** See `taxonomy.yaml` in this directory.

**Extending:** Organizations add domain-specific agents and populate `context-packages`, `rules`, and `skills` fields with their own project files. See `docs/agents/roles/` for an example of organization-specific agent definitions.
```

### Step 3: Commit

```bash
git add agents/taxonomy.yaml agents/README.md
git commit -m "feat: create agents/ directory with taxonomy"
```

---

## Task 4: Migrate Existing WavePoint Roles to Base Catalog

Migrate the 11 roles from `docs/agents/roles/` to `agents/`. Strip WavePoint-specific fields (`context-packages`, `rules` pointing to WavePoint files). Replace `role:` with `name:`. Add missing behavioral fields where appropriate.

**Files:**
- Create: `agents/architect.md`
- Create: `agents/engineer.md`
- Create: `agents/judge.md`
- Create: `agents/product-manager.md`
- Create: `agents/product-owner.md`
- Create: `agents/technical-writer.md`
- Create: `agents/ux-researcher.md`
- Create: `agents/code-reviewer.md`
- Create: `agents/designer.md`
- Create: `agents/marketer.md`
- Create: `agents/research-lead.md`

### Step 1: Read all 11 existing roles

Read every file in `docs/agents/roles/`. For each, note:
- `role:` value (becomes `name:`)
- WavePoint-specific `context-packages` and `rules` values (strip these)
- Whether `disposition`, `behavioral-constraints`, `quality-bar`, `fail-triggers`, `domain-scope` are present
- Whether the body uses identity language

### Step 2: Migrate each role

For each of the 11 roles, create `agents/<slug>.md` with these transformations:

1. **`role:` → `name:`** — rename the field
2. **`category:` mapping** — `strategy` → `product`, `domain` → `governance`, others unchanged
3. **Strip org-specific fields** — empty `context-packages: []`, `rules: []`, `skills: []`
4. **Add missing `disposition`** — if not present, derive from the agent's behavioral description
5. **Add `tags:`** — derive from category and domain-scope
6. **Add `domain-scope:`** — if not present, derive from the behavioral constraints
7. **Preserve** all behavioral content (constraints, quality-bar, fail-triggers, escalation)
8. **Body** — keep behavioral constraints and scope sections, strip any WavePoint-specific references

### Step 3: Validate all migrated agents

Run: `bun scripts/validate-agent.ts agents/`
Expected: 0 errors. Warnings are acceptable (some agents may lack quality-bar or tags).

### Step 4: Verify no regressions in existing role parsing

Run: `bun scripts/validate-agent.ts docs/agents/roles/`
Expected: Still works (legacy `role:` field accepted with warning).

### Step 5: Commit

```bash
git add agents/*.md
git commit -m "feat: migrate 11 WavePoint roles to base behavioral agent catalog"
```

---

## Task 5: Write New Agents — Planning & Architecture Group

Write 4 new agents that don't have WavePoint equivalents. These fill the Planning & Architecture category from the iteration 3 recommended catalog.

**Files:**
- Create: `agents/technical-architect.md` (if different from migrated `architect.md`, otherwise skip)
- Create: `agents/product-strategist.md` (if different from migrated `product-manager.md`, otherwise skip)
- Create: `agents/research-analyst.md` (if different from migrated `research-lead.md`, otherwise skip)
- Create: `agents/risk-assessor.md`

### Step 1: Check overlap with migrated agents

Before writing, compare the iteration 3 recommended roles against the 11 migrated agents. If a migrated agent already covers the role (e.g., `architect.md` ≈ Technical Architect), skip the new definition. Only write agents that fill genuine gaps.

**Expected net-new from this group:** `risk-assessor.md` is definitely new. Others may be covered by migrations.

### Step 2: Write each agent following the schema

Each agent file must:
- Follow the format in `schema-spec.md` (see Examples section)
- Have `disposition` as the behavioral posture (`<posture> — <elaboration>`)
- Include `behavioral-constraints` (3-7 testable rules)
- Include `quality-bar` (2-4 measurable criteria)
- Include `fail-triggers` for quality-gate roles
- Stay under 100 lines total (compact > comprehensive, per SkillsBench)
- Pass the behavioral engineering test: every sentence describes what the agent does, not who it is

### Step 3: Validate

Run: `bun scripts/validate-agent.ts agents/risk-assessor.md`
Expected: 0 errors

### Step 4: Commit

```bash
git add agents/risk-assessor.md  # (and any other new agents)
git commit -m "feat: add planning & architecture agents to base catalog"
```

---

## Task 6: Write New Agents — Implementation Group

Write new implementation agents that aren't covered by existing migrations.

**Files (assess overlap first):**
- `agents/backend-developer.md` — likely exists as example in deliverables; promote to catalog
- `agents/frontend-developer.md` — exists as schema-spec example; create from it
- `agents/full-stack-implementer.md` — likely net-new
- `agents/data-engineer.md` — likely net-new (data-analyst example exists but different role)
- `agents/infrastructure-engineer.md` — likely net-new
- `agents/mobile-developer.md` — net-new

### Step 1: Check deliverables/examples for promotable agents

Read `docs/initiatives/behavioral-agents/deliverables/examples/`. If `backend-developer.md` or others match the catalog target, copy and adapt rather than writing from scratch.

### Step 2: Write each agent (same rules as Task 5)

### Step 3: Validate all new agents

Run: `bun scripts/validate-agent.ts agents/`
Expected: 0 errors across the full catalog

### Step 4: Commit

```bash
git add agents/frontend-developer.md agents/full-stack-implementer.md agents/data-engineer.md agents/infrastructure-engineer.md agents/mobile-developer.md
git commit -m "feat: add implementation agents to base catalog"
```

---

## Task 7: Write New Agents — Quality, Operations, Coordination Groups

Complete the catalog with remaining roles.

**Quality & Review (check overlap with migrated judge, code-reviewer):**
- `agents/security-auditor.md` — promote from deliverables/examples
- `agents/performance-analyst.md` — net-new
- `agents/test-engineer.md` — net-new
- `agents/accessibility-auditor.md` — net-new

**Operations & Governance:**
- `agents/release-engineer.md` — net-new
- `agents/compliance-reviewer.md` — net-new

**Coordination:**
- `agents/project-coordinator.md` — net-new
- `agents/integration-reviewer.md` — net-new

### Step 1: Promote security-auditor from deliverables

Copy `docs/initiatives/behavioral-agents/deliverables/examples/security-auditor.md` to `agents/security-auditor.md`. Verify it passes validation.

### Step 2: Write remaining agents (same rules as Task 5)

### Step 3: Validate full catalog

Run: `bun scripts/validate-agent.ts agents/`
Expected: 0 errors, full catalog of ~20 agents

### Step 4: Commit

```bash
git add agents/*.md
git commit -m "feat: complete base behavioral agent catalog (~20 agents)"
```

---

## Task 8: Studio Integration — Update Catalog Reader

The Studio app reads agent roles from `docs/agents/roles/`. Update the catalog reader to also read from `agents/` (base catalog) while preserving `docs/agents/roles/` as org-specific overrides.

**Files:**
- Modify: `packages/studio-core/src/catalog.ts` (add base catalog path)
- Modify: `packages/studio-core/src/types.ts` (ensure AgentRole interface matches new fields)

### Step 1: Read current catalog.ts

Understand how agents are currently loaded. Identify the file path and parsing logic.

### Step 2: Add base catalog loading

Add a second catalog source (`agents/`) alongside `docs/agents/roles/`. Base catalog agents should appear in Studio alongside org-specific ones, with a visual distinction (e.g., a "base" tag or different grouping).

### Step 3: Update AgentRole interface

Add missing fields to the `AgentRole` interface in `types.ts`:
- `domainScope: string[]`
- `behavioralConstraints: string[]`
- `qualityBar: string[]`
- `failTriggers: string[]`
- `outputStyle?: string`

### Step 4: Typecheck

Run: `pnpm check`
Expected: PASS

### Step 5: Build

Run: `pnpm build`
Expected: PASS

### Step 6: Commit

```bash
git add packages/studio-core/src/catalog.ts packages/studio-core/src/types.ts
git commit -m "feat: Studio reads base agent catalog from agents/ directory"
```

---

## Task 9: Update Activity Log and Initiative Status

**Files:**
- Modify: `docs/initiatives/behavioral-agents/activity.md`

### Step 1: Update activity log

Append the implementation session(s) to the activity log with key milestones:
- Schema finalized and tested (Zod + vitest)
- Validation script built
- 11 WavePoint roles migrated to base catalog
- ~9 net-new agents written
- Studio integration updated
- Full catalog validates with 0 errors

### Step 2: Commit

```bash
git add docs/initiatives/behavioral-agents/activity.md
git commit -m "docs: update behavioral-agents activity log"
```

---

## Session Breakdown

**Effort:** 3-4 sessions

| Session | Tasks | Deliverables |
|---------|-------|-------------|
| 1 | Tasks 1-3 | Zod schema, validation script, agents/ directory with taxonomy |
| 2 | Tasks 4-5 | 11 migrated agents + ~1-2 net-new planning agents |
| 3 | Tasks 6-7 | ~8-9 net-new implementation/quality/ops/coordination agents |
| 4 (if needed) | Tasks 8-9 | Studio integration, activity log, cleanup |

Sessions 2 and 3 are parallelizable — agent writing is independent work. If using subagent-driven development, dispatch Tasks 5, 6, and 7 as parallel subagents after Task 4 completes.

---

## Out of Scope (Tracked Elsewhere)

- **behavioral-lint-tool** — Sub-initiative with its own proposal (`sub-initiatives/behavioral-lint-tool/proposal.md`). Ships as `npx behavioral-lint`. Depends on this plan's Zod schema.
- **Cross-tool export** — Branch seed at `branches/cross-tool-export.md`. Convert behavioral YAML → CrewAI, SoulSpec, Claude Code rules, Cursor formats.
- **Distribution & launch** — Research complete (iteration 4). Spec site, Reddit strategy, npm publishing. Depends on both the catalog and the lint tool.
- **Companion skills library** — Iteration 3 recommends 2-3 skills per agent. Skills are runtime supplements, not part of the base catalog.
