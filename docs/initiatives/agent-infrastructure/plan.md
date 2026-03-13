# Agent Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build runtime infrastructure for a heterogeneous AI agent fleet — model routing dispatch, local model evaluation, and inter-agent coordination primitives.

**Architecture:** A thin shell script reads agent role YAML (`model-tier` field) and sets Claude Code env vars to route to the right model. A Node.js eval script validates local models against WavePoint-specific tasks. Coordination uses filesystem conventions (heartbeats, task board) that Studio already knows how to read. No frameworks, no protocols — just env vars, scripts, and files.

**Tech Stack:** Shell (zsh), Node.js (ESM, zero deps), Claude Code hooks/env vars, Ollama, Studio lib (TypeScript)

**Prerequisites already complete:**
- Session manifests: hook script, types, schemas, `getSessions()`, API route, Sessions page, Hub panel
- Agent roles: 12 role definitions, `AgentRole` type + schema, `getAgentRoles()`, prompt generation
- Studio state machine: velocity signals, lifecycle detection, Mission Control panels

---

## Task 1: Model Routing Dispatch Script

**Files:**
- Create: `scripts/dispatch.sh`
- Modify: `docs/agents/roles/README.md` (add dispatch usage section)

The dispatch script reads a role slug, looks up `model-tier` from the role's YAML frontmatter, and launches Claude Code with the appropriate model configuration.

**Step 1: Write the dispatch script**

```bash
#!/usr/bin/env zsh
# scripts/dispatch.sh — Route a Claude Code session to the right model based on agent role.
#
# Usage:
#   ./scripts/dispatch.sh <role-slug> [claude-code-args...]
#
# Examples:
#   ./scripts/dispatch.sh architect                    # Opus (high tier)
#   ./scripts/dispatch.sh engineer --resume abc123     # Sonnet (medium tier)
#   ./scripts/dispatch.sh technical-writer             # Haiku (low tier)

set -euo pipefail

ROLE_SLUG="${1:?Usage: dispatch.sh <role-slug> [claude-code-args...]}"
shift

ROLE_FILE="docs/agents/roles/${ROLE_SLUG}.md"

if [[ ! -f "$ROLE_FILE" ]]; then
  echo "Error: Role file not found: $ROLE_FILE" >&2
  exit 1
fi

# Extract model-tier from YAML frontmatter
MODEL_TIER=$(sed -n '/^---$/,/^---$/{ /^model-tier:/{ s/^model-tier:[[:space:]]*//; p; } }' "$ROLE_FILE")

case "$MODEL_TIER" in
  high)
    # Opus for planning, Sonnet for subagents
    export ANTHROPIC_MODEL="claude-opus-4-6"
    export CLAUDE_CODE_SUBAGENT_MODEL="claude-sonnet-4-6"
    echo "[dispatch] $ROLE_SLUG → Opus (high tier)"
    ;;
  medium)
    export ANTHROPIC_MODEL="claude-sonnet-4-6"
    export CLAUDE_CODE_SUBAGENT_MODEL="claude-sonnet-4-6"
    echo "[dispatch] $ROLE_SLUG → Sonnet (medium tier)"
    ;;
  low)
    export ANTHROPIC_MODEL="claude-haiku-4-5-20251001"
    export CLAUDE_CODE_SUBAGENT_MODEL="claude-haiku-4-5-20251001"
    echo "[dispatch] $ROLE_SLUG → Haiku (low tier)"
    ;;
  *)
    echo "Warning: Unknown model-tier '$MODEL_TIER' for role '$ROLE_SLUG', defaulting to Sonnet" >&2
    export ANTHROPIC_MODEL="claude-sonnet-4-6"
    export CLAUDE_CODE_SUBAGENT_MODEL="claude-sonnet-4-6"
    ;;
esac

# Set role for session manifest hook to pick up
export WAVEPOINT_ROLE="$ROLE_SLUG"

exec claude "$@"
```

**Step 2: Make it executable and test**

Run:
```bash
chmod +x scripts/dispatch.sh
./scripts/dispatch.sh architect --help
```
Expected: Prints `[dispatch] architect → Opus (high tier)` then shows Claude Code help.

**Step 3: Update session manifest hook to read WAVEPOINT_ROLE**

In `scripts/session-manifest.mjs`, in the `handleSessionStart` function, after the line `role: null,`, change to:

```javascript
role: process.env.WAVEPOINT_ROLE ?? null,
```

This connects the dispatch script to the session manifest — sessions launched via `dispatch.sh` will have their role recorded.

**Step 4: Verify role appears in manifest**

Run:
```bash
WAVEPOINT_ROLE=architect node -e "
  process.stdin.resume();
  process.stdin.on('data', () => {});
  setTimeout(() => process.exit(), 100);
" | WAVEPOINT_ROLE=architect node scripts/session-manifest.mjs
```
Then check the latest file in `docs/sessions/` — the `role` field should be `"architect"`.

**Step 5: Commit**

```bash
git add scripts/dispatch.sh scripts/session-manifest.mjs
git commit -m "feat(agent-infra): model routing dispatch script with role-aware session manifests"
```

---

## Task 2: Local Model Eval Script

**Files:**
- Create: `scripts/agent-eval.mjs`
- Create: `docs/agent-evals/.gitkeep`

A CLI script that evaluates local LLM models against four WavePoint-specific task types. Proves whether a local model can do useful work before building any dispatch infrastructure for it.

**Step 1: Create the eval output directory**

```bash
mkdir -p docs/agent-evals
touch docs/agent-evals/.gitkeep
```

**Step 2: Write the eval script**

```javascript
#!/usr/bin/env node

/**
 * scripts/agent-eval.mjs — Evaluate local LLM models against WavePoint tasks.
 *
 * Usage:
 *   node scripts/agent-eval.mjs --model "qwen-3.5-9b"
 *   node scripts/agent-eval.mjs --model "qwen-3.5-9b" --task summarize
 *   node scripts/agent-eval.mjs --model "qwen-3.5-9b" --url http://localhost:5678
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const MODEL = getArg("model");
if (!MODEL) {
  console.error("Usage: agent-eval.mjs --model <model-slug> [--task <task>] [--url <endpoint>]");
  process.exit(1);
}

const TASK_FILTER = getArg("task"); // null = run all
const BASE_URL = getArg("url") ?? "http://localhost:1234";
const API_URL = `${BASE_URL}/v1/chat/completions`;

// ---------------------------------------------------------------------------
// LLM client
// ---------------------------------------------------------------------------

async function chat(systemPrompt, userPrompt) {
  const start = Date.now();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const totalMs = Date.now() - start;

  return { content, totalMs };
}

// ---------------------------------------------------------------------------
// Input helpers
// ---------------------------------------------------------------------------

function readFile(relPath) {
  const abs = path.resolve(process.cwd(), relPath);
  return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
}

function findRandomFile(globDir, pattern) {
  const abs = path.resolve(process.cwd(), globDir);
  if (!fs.existsSync(abs)) return null;

  const matches = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (pattern.test(entry.name)) matches.push(full);
    }
  }
  walk(abs);

  if (matches.length === 0) return null;
  const pick = matches[Math.floor(Math.random() * matches.length)];
  return {
    path: path.relative(process.cwd(), pick),
    content: fs.readFileSync(pick, "utf-8"),
  };
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// ---------------------------------------------------------------------------
// Task definitions
// ---------------------------------------------------------------------------

const TASKS = {
  summarize: {
    name: "Summarize",
    async run() {
      const file = findRandomFile("docs/initiatives", /\.md$/);
      if (!file) throw new Error("No initiative files found");

      const roleContext = readFile("docs/agents/roles/research-lead.md") ?? "";

      const system = `${roleContext}\n\nYou are summarizing a research document. Write a single paragraph of 50-300 words. Be precise and factual. Do not invent information not present in the source.`;
      const user = `Summarize this document:\n\n${file.content}`;

      const { content, totalMs } = await chat(system, user);
      const wordCount = content.split(/\s+/).filter(Boolean).length;

      // Check for hallucinated file paths
      const pathPattern = /(?:docs|apps|packages|src|scripts)\/[\w./-]+/g;
      const mentionedPaths = [...(content.match(pathPattern) ?? [])];
      const hallucinated = mentionedPaths.filter(
        (p) => !fs.existsSync(path.resolve(process.cwd(), p))
      );

      return {
        input: { source: file.path, tokenEstimate: estimateTokens(file.content) },
        output: { raw: content, tokenEstimate: estimateTokens(content) },
        qualityGate: {
          pass: wordCount >= 50 && wordCount <= 300 && hallucinated.length === 0,
          checks: {
            wordCountInRange: { pass: wordCount >= 50 && wordCount <= 300, value: wordCount },
            noHallucinatedPaths: { pass: hallucinated.length === 0, value: hallucinated },
          },
        },
        timing: { totalMs },
      };
    },
  },

  frontmatter: {
    name: "Frontmatter",
    async run() {
      const testCases = [
        { name: "vedic-research", description: "Research Vedic astrology traditions for computation layer" },
        { name: "mcp-composable-surface", description: "Design MCP server exposing computation primitives" },
        { name: "watchos-companion", description: "Build watchOS app for transit notifications" },
      ];
      const pick = testCases[Math.floor(Math.random() * testCases.length)];

      const system = `You are generating YAML frontmatter for an initiative proposal. Output ONLY a YAML block (with --- delimiters) matching this exact schema:

---
status: pending
initiative: <slug>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
type: <one of: roadmap-update, guideline-evolution, new-skill, research-synthesis, process-change, new-plan>
risk: <one of: additive, evolutionary, structural>
targets: []
dependencies: []
spawned-from: null
---

Use today's date. Infer appropriate type and risk from the description.`;

      const user = `Generate frontmatter for initiative "${pick.name}": ${pick.description}`;

      const { content, totalMs } = await chat(system, user);

      // Try to parse the YAML
      const yamlMatch = content.match(/---\n([\s\S]*?)\n---/);
      let parsePass = false;
      let parseError = null;

      if (yamlMatch) {
        try {
          // Basic field presence check (we can't import Zod in this zero-dep script)
          const fields = ["status", "initiative", "created", "updated", "type", "risk"];
          const yaml = yamlMatch[1];
          parsePass = fields.every((f) => yaml.includes(`${f}:`));
          if (!parsePass) parseError = "Missing required fields";
        } catch (e) {
          parseError = e.message;
        }
      } else {
        parseError = "No YAML block found in output";
      }

      return {
        input: { source: `test-case: ${pick.name}`, tokenEstimate: estimateTokens(system + user) },
        output: { raw: content, tokenEstimate: estimateTokens(content) },
        qualityGate: {
          pass: parsePass,
          checks: {
            yamlBlockPresent: { pass: !!yamlMatch, value: !!yamlMatch },
            requiredFieldsPresent: { pass: parsePass, value: parseError ?? "ok" },
          },
        },
        timing: { totalMs },
      };
    },
  },

  "activity-entry": {
    name: "Activity Entry",
    async run() {
      let gitLog = "";
      let gitDiff = "";
      try {
        const { execSync } = await import("child_process");
        gitLog = execSync("git log --oneline -10", { encoding: "utf-8" });
        gitDiff = execSync("git diff --stat HEAD~3 2>/dev/null || echo 'no diff'", { encoding: "utf-8" });
      } catch {
        gitLog = "no git history available";
        gitDiff = "no diff available";
      }

      const system = `You are writing a single workstream activity log entry. Output exactly ONE line in this format:
- YYYY-MM-DD: Brief description of what happened

The line must:
- Start with "- " followed by a date in YYYY-MM-DD format
- Be under 200 characters total
- Summarize the most significant change`;

      const user = `Recent git log:\n${gitLog}\n\nRecent diff stats:\n${gitDiff}`;

      const { content, totalMs } = await chat(system, user);

      const trimmed = content.trim().split("\n")[0] ?? "";
      const datePattern = /^- \d{4}-\d{2}-\d{2}:/;

      return {
        input: { source: "git log + diff", tokenEstimate: estimateTokens(system + user) },
        output: { raw: trimmed, tokenEstimate: estimateTokens(trimmed) },
        qualityGate: {
          pass: datePattern.test(trimmed) && trimmed.length <= 200,
          checks: {
            matchesDatePattern: { pass: datePattern.test(trimmed), value: trimmed.slice(0, 15) },
            underCharLimit: { pass: trimmed.length <= 200, value: trimmed.length },
            singleLine: { pass: !content.trim().includes("\n"), value: content.trim().split("\n").length },
          },
        },
        timing: { totalMs },
      };
    },
  },

  "voice-lint": {
    name: "Voice Lint",
    async run() {
      const file = findRandomFile("docs/initiatives", /proposal\.md$/);
      if (!file) throw new Error("No proposal files found");

      // Grab a random paragraph
      const paragraphs = file.content
        .split("\n\n")
        .filter((p) => p.trim().length > 50 && !p.startsWith("#") && !p.startsWith("---"));
      const para = paragraphs[Math.floor(Math.random() * paragraphs.length)] ?? "No suitable paragraph found.";

      const voiceGuide = readFile("docs/ux/voice-and-tone.md") ?? "";

      const system = `${voiceGuide}\n\nYou are a voice and tone reviewer. Evaluate the given text against the WavePoint voice guidelines. Return ONLY valid JSON matching this exact schema:
{"pass": boolean, "suggestions": ["string"]}

- "pass" is true if the text follows the voice guidelines well enough
- "suggestions" is an array of 0-3 specific improvement suggestions
- If pass is true, suggestions can be empty`;

      const user = `Review this text:\n\n${para}`;

      const { content, totalMs } = await chat(system, user);

      let jsonPass = false;
      let parsed = null;
      try {
        // Extract JSON from potential markdown code fences
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
          jsonPass =
            typeof parsed.pass === "boolean" &&
            Array.isArray(parsed.suggestions);
        }
      } catch {
        // parse failed
      }

      return {
        input: { source: file.path, tokenEstimate: estimateTokens(system + user) },
        output: { raw: content, tokenEstimate: estimateTokens(content) },
        qualityGate: {
          pass: jsonPass,
          checks: {
            validJson: { pass: jsonPass, value: parsed ? "ok" : "invalid JSON" },
            hasRequiredFields: {
              pass: parsed ? typeof parsed.pass === "boolean" && Array.isArray(parsed.suggestions) : false,
              value: parsed ? Object.keys(parsed) : [],
            },
          },
        },
        timing: { totalMs },
      };
    },
  },
};

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function runTask(taskKey) {
  const task = TASKS[taskKey];
  if (!task) throw new Error(`Unknown task: ${taskKey}`);

  console.log(`\n  Running: ${task.name}...`);
  try {
    const result = await task.run();
    const status = result.qualityGate.pass ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
    console.log(`  Result: ${status} (${result.timing.totalMs}ms)`);

    for (const [check, data] of Object.entries(result.qualityGate.checks)) {
      const icon = data.pass ? "  " : "  ";
      console.log(`    ${icon} ${check}: ${JSON.stringify(data.value)}`);
    }

    return { task: taskKey, model: MODEL, timestamp: new Date().toISOString(), ...result };
  } catch (err) {
    console.log(`  \x1b[31mERROR\x1b[0m: ${err.message}`);
    return {
      task: taskKey,
      model: MODEL,
      timestamp: new Date().toISOString(),
      error: err.message,
      qualityGate: { pass: false, checks: {} },
      timing: { totalMs: 0 },
    };
  }
}

async function main() {
  const dateStr = new Date().toISOString().slice(0, 10);
  const outDir = path.resolve(process.cwd(), `docs/agent-evals/${dateStr}-${MODEL}`);
  fs.mkdirSync(outDir, { recursive: true });

  const taskKeys = TASK_FILTER ? [TASK_FILTER] : Object.keys(TASKS);

  console.log(`\n Agent Eval: ${MODEL}`);
  console.log(`  Endpoint: ${API_URL}`);
  console.log(`  Tasks: ${taskKeys.join(", ")}`);

  const results = {};
  for (const key of taskKeys) {
    const result = await runTask(key);
    results[key] = result;

    // Write per-task result
    fs.writeFileSync(
      path.join(outDir, `${key}.json`),
      JSON.stringify(result, null, 2) + "\n"
    );
  }

  // Write summary
  const summary = {
    model: MODEL,
    timestamp: new Date().toISOString(),
    endpoint: API_URL,
    tasks: Object.fromEntries(
      Object.entries(results).map(([k, v]) => [
        k,
        { pass: v.qualityGate?.pass ?? false, totalMs: v.timing?.totalMs ?? 0 },
      ])
    ),
    passRate:
      Object.values(results).filter((r) => r.qualityGate?.pass).length /
      Object.keys(results).length,
    totalMs: Object.values(results).reduce((s, r) => s + (r.timing?.totalMs ?? 0), 0),
  };

  fs.writeFileSync(
    path.join(outDir, "summary.json"),
    JSON.stringify(summary, null, 2) + "\n"
  );

  // Final report
  const passCount = Object.values(results).filter((r) => r.qualityGate?.pass).length;
  const totalCount = Object.keys(results).length;
  const color = passCount === totalCount ? "\x1b[32m" : passCount > 0 ? "\x1b[33m" : "\x1b[31m";

  console.log(`\n  ${color}${passCount}/${totalCount} passed\x1b[0m (${summary.totalMs}ms total)`);
  console.log(`  Results: ${outDir}/\n`);
}

main().catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
```

**Step 3: Test without a local model running (expect connection error)**

Run:
```bash
chmod +x scripts/agent-eval.mjs
node scripts/agent-eval.mjs --model test-model --task frontmatter
```
Expected: `ERROR: fetch failed` or similar connection refused (LM Studio not running). Confirms the script runs, parses args, and attempts the API call.

**Step 4: Commit**

```bash
git add scripts/agent-eval.mjs docs/agent-evals/.gitkeep
git commit -m "feat(agent-infra): local model eval script with four WavePoint-specific task types"
```

---

## Task 3: Run First Eval (Manual — Requires LM Studio)

This task is manual and depends on having LM Studio or Ollama running with a local model loaded.

**Step 1: Start a local model**

Option A — LM Studio: Load Qwen2.5-Coder-7B (Q8_0), start server on port 1234.
Option B — Ollama: `ollama run qwen2.5-coder:7b`

**Step 2: Run the eval**

```bash
node scripts/agent-eval.mjs --model "qwen2.5-coder-7b-q8"
```

**Step 3: Review results**

```bash
cat docs/agent-evals/*/summary.json
```

Check pass rate per task. Expected: activity-entry and frontmatter likely pass, summarize and voice-lint may struggle.

**Step 4: Commit eval results**

```bash
git add docs/agent-evals/
git commit -m "feat(agent-infra): first local model eval results — qwen2.5-coder-7b"
```

---

## Task 4: Dispatch Script — Local Model Support

**Files:**
- Modify: `scripts/dispatch.sh`

Extend the dispatch script to support routing `low` tier tasks to a local model via Ollama when available.

**Step 1: Add local model fallback to dispatch script**

Add this block inside the `low)` case, before the existing Haiku assignment:

```bash
  low)
    # Try local model first if Ollama is running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
      export ANTHROPIC_BASE_URL="http://localhost:11434"
      export ANTHROPIC_AUTH_TOKEN="ollama"
      export ANTHROPIC_MODEL="qwen2.5-coder:7b"
      echo "[dispatch] $ROLE_SLUG → Local/Ollama (low tier)"
    else
      export ANTHROPIC_MODEL="claude-haiku-4-5-20251001"
      export CLAUDE_CODE_SUBAGENT_MODEL="claude-haiku-4-5-20251001"
      echo "[dispatch] $ROLE_SLUG → Haiku (low tier, Ollama unavailable)"
    fi
    ;;
```

**Step 2: Add a --local flag for forcing local model on any tier**

Add after the `ROLE_SLUG` extraction:

```bash
USE_LOCAL=false
for arg in "$@"; do
  if [[ "$arg" == "--local" ]]; then
    USE_LOCAL=true
    # Remove --local from args passed to claude
    set -- "${@/--local/}"
    break
  fi
done
```

Then add before the `case` statement:

```bash
if [[ "$USE_LOCAL" == "true" ]]; then
  if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    export ANTHROPIC_BASE_URL="http://localhost:11434"
    export ANTHROPIC_AUTH_TOKEN="ollama"
    export ANTHROPIC_MODEL="qwen2.5-coder:7b"
    echo "[dispatch] $ROLE_SLUG → Local/Ollama (forced)"
    export WAVEPOINT_ROLE="$ROLE_SLUG"
    exec claude "$@"
  else
    echo "Error: --local flag set but Ollama is not running" >&2
    exit 1
  fi
fi
```

**Step 3: Test the local path (Ollama not running)**

Run:
```bash
./scripts/dispatch.sh technical-writer --local
```
Expected: `Error: --local flag set but Ollama is not running`

**Step 4: Commit**

```bash
git add scripts/dispatch.sh
git commit -m "feat(agent-infra): dispatch script routes low-tier to Ollama when available"
```

---

## Task 5: Coordination Primitives — Task Board

**Files:**
- Create: `docs/tasks/.gitkeep`
- Create: `scripts/task-board.sh`

A lightweight filesystem-based task board. Agents write task files to a known directory; Studio (and other agents) can read them. This is the "three incremental additions" identified in research: heartbeats are already handled by session manifests (in-progress outcome), and completion signals are handled by the manifest's `outcome` field. The task board is the remaining gap.

**Step 1: Create the task board directory**

```bash
mkdir -p docs/tasks
touch docs/tasks/.gitkeep
```

**Step 2: Write the task board CLI**

```bash
#!/usr/bin/env zsh
# scripts/task-board.sh — Lightweight filesystem task board for agent coordination.
#
# Usage:
#   task-board.sh add <slug> <description> [--role <role>] [--initiative <init>]
#   task-board.sh list [--status <open|claimed|done>]
#   task-board.sh claim <slug> [--session <session-id>]
#   task-board.sh done <slug>

set -euo pipefail

TASKS_DIR="docs/tasks"
mkdir -p "$TASKS_DIR"

CMD="${1:?Usage: task-board.sh <add|list|claim|done> ...}"
shift

case "$CMD" in
  add)
    SLUG="${1:?Usage: task-board.sh add <slug> <description>}"
    DESC="${2:?Usage: task-board.sh add <slug> <description>}"
    shift 2

    ROLE=""
    INITIATIVE=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --role) ROLE="$2"; shift 2 ;;
        --initiative) INITIATIVE="$2"; shift 2 ;;
        *) shift ;;
      esac
    done

    cat > "$TASKS_DIR/$SLUG.md" <<EOF
---
status: open
created: $(date -u +%Y-%m-%dT%H:%M:%SZ)
role: ${ROLE:-null}
initiative: ${INITIATIVE:-null}
claimed-by: null
---

# $DESC
EOF
    echo "Created task: $SLUG"
    ;;

  list)
    STATUS_FILTER="${2:-}"
    for f in "$TASKS_DIR"/*.md; do
      [[ -f "$f" ]] || continue
      SLUG=$(basename "$f" .md)
      STATUS=$(sed -n 's/^status:[[:space:]]*//p' "$f")
      if [[ -n "$STATUS_FILTER" && "$STATUS" != "$STATUS_FILTER" ]]; then
        continue
      fi
      TITLE=$(grep '^# ' "$f" | head -1 | sed 's/^# //')
      printf "  %-20s %-8s %s\n" "$SLUG" "[$STATUS]" "$TITLE"
    done
    ;;

  claim)
    SLUG="${1:?Usage: task-board.sh claim <slug>}"
    FILE="$TASKS_DIR/$SLUG.md"
    [[ -f "$FILE" ]] || { echo "Error: Task not found: $SLUG" >&2; exit 1; }
    sed -i '' 's/^status:.*/status: claimed/' "$FILE"
    sed -i '' "s/^claimed-by:.*/claimed-by: ${WAVEPOINT_ROLE:-unknown}/" "$FILE"
    echo "Claimed: $SLUG"
    ;;

  done)
    SLUG="${1:?Usage: task-board.sh done <slug>}"
    FILE="$TASKS_DIR/$SLUG.md"
    [[ -f "$FILE" ]] || { echo "Error: Task not found: $SLUG" >&2; exit 1; }
    sed -i '' 's/^status:.*/status: done/' "$FILE"
    echo "Done: $SLUG"
    ;;

  *)
    echo "Unknown command: $CMD" >&2
    echo "Usage: task-board.sh <add|list|claim|done>" >&2
    exit 1
    ;;
esac
```

**Step 3: Test the task board**

Run:
```bash
chmod +x scripts/task-board.sh
./scripts/task-board.sh add test-task "Test the task board" --role engineer --initiative agent-infrastructure
./scripts/task-board.sh list
./scripts/task-board.sh claim test-task
./scripts/task-board.sh list
./scripts/task-board.sh done test-task
./scripts/task-board.sh list
```

Expected output shows task transitioning through open → claimed → done.

**Step 4: Clean up test task**

```bash
rm docs/tasks/test-task.md
```

**Step 5: Commit**

```bash
git add scripts/task-board.sh docs/tasks/.gitkeep
git commit -m "feat(agent-infra): filesystem task board for inter-agent coordination"
```

---

## Task 6: Studio — Session Initiative Enrichment

**Files:**
- Modify: `packages/studio-core/src/components/studio/process-detail-pane.tsx`
- Modify: `packages/studio-core/src/lib/studio/index.ts`

Show per-initiative session history on the Process detail pane. When viewing an initiative, show how many sessions it has and the most recent ones.

**Step 1: Add getSessionsForInitiative helper**

In `packages/studio-core/src/lib/studio/index.ts`, add after the `getSessions` function:

```typescript
/**
 * Get sessions filtered by initiative slug.
 */
export function getSessionsForInitiative(slug: string): Session[] {
  return getSessions().filter((s) => s.initiative === slug);
}
```

Export it from the barrel (it's already in the same file, so it auto-exports).

**Step 2: Add session summary to process detail pane**

In the process detail pane component, add a "Sessions" section that shows:
- Session count for this initiative
- Last 3 sessions with date, model, duration, outcome
- Total tokens spent on this initiative

Read `process-detail-pane.tsx` first to understand its current structure, then add a sessions section using the same visual patterns as existing sections. Use the `/api/studio/sessions` endpoint filtered client-side, or add an `initiative` query param to the API route.

**Step 3: Test in dev**

Run:
```bash
pnpm dev
```
Navigate to `/app/studio/process/<initiative-slug>` and verify the sessions section appears (will show empty state if no sessions exist for that initiative).

**Step 4: Commit**

```bash
git add packages/studio-core/src/lib/studio/index.ts packages/studio-core/src/components/studio/process-detail-pane.tsx
git commit -m "feat(studio): show per-initiative session history in process detail"
```

---

## Task 7: Documentation and Workstream Update

**Files:**
- Modify: `docs/workstreams/agentic-workforce.md` (add activity entry)
- Modify: `docs/initiatives/agent-infrastructure/proposal.md` (update status)
- Modify: `docs/initiatives/agent-infrastructure/research/README.md` (close resolved questions)

**Step 1: Update initiative status**

Change `status: pending` to `status: in-progress` in `docs/initiatives/agent-infrastructure/proposal.md`.

**Step 2: Add workstream activity entry**

Append to the activity log in `docs/workstreams/agentic-workforce.md`:

```markdown
- YYYY-MM-DD: Agent Infrastructure plan implemented — dispatch script (model routing via env vars), local model eval script (4 task types), task board (filesystem coordination), session-initiative enrichment in Studio
```

**Step 3: Update research README**

In `docs/initiatives/agent-infrastructure/research/README.md`, update open questions 1-2 status:
- Question 2 (session manifest schema) → resolved, implemented
- Question 5 (effort level as routing lever) → deferred, can be tested empirically

**Step 4: Commit**

```bash
git add docs/
git commit -m "docs(agent-infra): update initiative status, workstream log, close resolved research questions"
```

---

## Summary

| Task | What | Sessions |
|------|------|----------|
| 1 | Dispatch script + role-aware manifests | ~20 min |
| 2 | Agent eval script (4 task types) | ~30 min |
| 3 | Run first eval (manual, needs LM Studio/Ollama) | ~15 min |
| 4 | Dispatch local model support | ~15 min |
| 5 | Task board coordination primitive | ~20 min |
| 6 | Studio session-initiative enrichment | ~30 min |
| 7 | Documentation updates | ~10 min |

**Total: 1 session** (Tasks 1-5 are scripts with no dependencies on the web app build. Task 6 is a small Studio addition. Task 7 is bookkeeping.)

**Not built now (future sessions):**
- Ollama tool calling validation with Claude Code (empirical, needs real testing)
- Studio rendering of task board entries
- Studio rendering of eval results as model comparison grid
- MCP integration (depends on `mcp-composable-surface` initiative)
- Automated dispatch without human approval (HITL removal requires quality gate confidence)
