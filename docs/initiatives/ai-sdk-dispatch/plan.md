# AI SDK for Agent Dispatch — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Vercel AI SDK API backends (Groq, Google AI, LM Studio API) alongside existing CLI backends, with full UI transparency showing backend type, provider, and model.

**Architecture:** Per-provider `.mjs` wrapper scripts import shared dispatch logic from `_ai-sdk-dispatch.mjs`. `BACKEND_META` static lookup provides type/display info. Worker.sh gains `.mjs`-first file resolution. WorkforcePanel groups backends by CLI/API with type badges.

**Tech Stack:** Vercel AI SDK v6 (`ai`, `@ai-sdk/groq`, `@ai-sdk/google`, `@ai-sdk/openai-compatible`), TypeScript, bash, React/Tailwind (dispatch-content.tsx)

**Initiative:** `docs/initiatives/ai-sdk-dispatch/` — proposal, research, shape, premortem, design all complete.

**Pre-session ritual:** Before starting each session, check changelogs for `ai`, `@ai-sdk/groq`, `@ai-sdk/google`, `@anthropic-ai/claude-agent-sdk`. If any shows a breaking major release, pause and reassess.

---

## Session 1: Foundation + First Dispatch

**Gate:** A research task dispatched end-to-end through Groq API — prompt in → `generateText()` → log file written → task status updated to completed.

**Kill criteria:**
- If Zod version conflict blocks `pnpm install`, stop. Check `pnpm why zod` and resolve with `pnpm.overrides` before proceeding.
- If no end-to-end dispatch by session end, stop and reassess.

### Task 1: Install AI SDK dependencies

**Files:**
- Modify: `package.json` (root)

**Step 1: Check Zod compatibility**

Run:
```bash
pnpm why zod
```

Expected: See which Zod version the monorepo uses. If `zod@3.x` and AI SDK needs `4.x`, you'll need overrides. AI SDK v6 accepts `zod ^3.25.76 | ^4.1.8` so `3.x` should be fine.

**Step 2: Install packages**

Run:
```bash
pnpm add -w ai @ai-sdk/groq @ai-sdk/google @ai-sdk/openai-compatible
```

**Step 3: Verify install succeeded**

Run:
```bash
pnpm ls ai @ai-sdk/groq @ai-sdk/google @ai-sdk/openai-compatible
```

Expected: All four packages listed with versions.

**Step 4: Typecheck**

Run:
```bash
pnpm check
```

Expected: PASS — no new type errors from adding deps.

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add Vercel AI SDK dependencies (ai, groq, google, openai-compatible)"
```

---

### Task 2: Extend Backend type system + BACKEND_META

**Files:**
- Modify: `packages/studio-core/src/dispatch.ts:9-50` (types and routing table)

**Step 1: Extend the Backend union type (line 9)**

Change:
```typescript
export type Backend = 'claude' | 'opencode' | 'codex' | 'gemini' | 'lm-studio'
```

To:
```typescript
export type Backend =
  // CLI backends
  | 'claude' | 'opencode' | 'codex' | 'gemini' | 'lm-studio'
  // API backends
  | 'groq' | 'google-ai' | 'lm-studio-api'
```

**Step 2: Add BackendType and BackendMeta types**

After the `TaskType` definition (after line 19), add:

```typescript
export type BackendType = 'cli' | 'api'

export interface BackendMeta {
  type: BackendType
  displayName: string
  /** AI SDK provider key. Only for API backends. */
  provider?: string
  /** Env var required for this backend. Null = no key needed (local). */
  envKey?: string | null
}

export const BACKEND_META: Record<Backend, BackendMeta> = {
  // CLI
  'claude':         { type: 'cli', displayName: 'Claude' },
  'opencode':       { type: 'cli', displayName: 'OpenCode' },
  'codex':          { type: 'cli', displayName: 'Codex' },
  'gemini':         { type: 'cli', displayName: 'Gemini' },
  'lm-studio':      { type: 'cli', displayName: 'LM Studio' },
  // API
  'groq':           { type: 'api', displayName: 'Groq',            provider: 'groq',     envKey: 'GROQ_API_KEY' },
  'google-ai':      { type: 'api', displayName: 'Google AI',       provider: 'google',   envKey: 'GOOGLE_GENERATIVE_AI_API_KEY' },
  'lm-studio-api':  { type: 'api', displayName: 'LM Studio (API)', provider: 'lmstudio', envKey: null },
}
```

**Step 3: Update BackendHealth interface (line 119-124)**

Change:
```typescript
export interface BackendHealth {
  backend: Backend
  available: boolean
  models?: string[]
  error?: string
}
```

To:
```typescript
export interface BackendHealth {
  backend: Backend
  available: boolean
  models?: string[]
  error?: string
  backendType: BackendType
  displayName: string
}
```

**Step 4: Update DEFAULT_DISPATCH routing table (lines 35-50)**

Change `research`, `content-generation`, and `audit` routes:

```typescript
export const DEFAULT_DISPATCH: DispatchConfig = {
  routes: {
    'code-implementation': { backend: 'claude', model: 'claude-opus-4-6' },
    'code-review': { backend: 'codex' },
    'architect': { backend: 'claude', model: 'claude-opus-4-6' },
    'research': { backend: 'groq', model: 'llama-3.3-70b-versatile' },
    'content-generation': { backend: 'google-ai', model: 'gemini-2.5-flash' },
    'audit': { backend: 'groq', model: 'llama-3.3-70b-versatile' },
    'embeddings': { backend: 'opencode', model: 'minimax-m2.5-free' },
  },
  fallback: { backend: 'opencode', model: 'minimax-m2.5-free' },
  offlineFallback: { backend: 'lm-studio' },
  overnight: {
    blocked: ['code-implementation', 'architect'],
  },
}
```

**Step 5: Update getBackendHealth() (lines 137-156)**

Replace the function to handle both CLI and API backends:

```typescript
export function getBackendHealth(projectRoot?: string): BackendHealth[] {
  const root = projectRoot ?? process.cwd()
  const allBackends = Object.keys(BACKEND_META) as Backend[]

  return allBackends.map(backend => {
    const meta = BACKEND_META[backend]

    // API backends: check if env var is set (skip health ping for now — Session 2)
    if (meta.type === 'api') {
      const available = meta.envKey ? !!process.env[meta.envKey] : true
      return {
        backend,
        available,
        error: available ? undefined : `${meta.envKey} not set`,
        backendType: meta.type,
        displayName: meta.displayName,
      }
    }

    // CLI backends: existing health check via --health flag
    const ext = backend === 'lm-studio' ? 'mjs' : 'sh'
    const script = path.join(root, `scripts/backends/${backend}.${ext}`)
    const cmd = ext === 'mjs'
      ? `node "${script}" --health`
      : `"${script}" --health`

    try {
      const output = execSync(cmd, { timeout: 5000, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      const data = JSON.parse(output.trim())
      return {
        backend,
        available: data.available ?? false,
        models: data.models,
        error: data.error,
        backendType: meta.type,
        displayName: meta.displayName,
      }
    } catch {
      return {
        backend,
        available: false,
        error: 'health check failed',
        backendType: meta.type,
        displayName: meta.displayName,
      }
    }
  })
}
```

**Step 6: Typecheck**

Run:
```bash
pnpm check
```

Expected: PASS. If type errors appear in other files consuming `BackendHealth`, fix them — they now need `backendType` and `displayName`. The dispatch-content.tsx doesn't destructure these so it should be fine (they're new optional-looking fields but actually required now, which is backward-compatible for read sites).

**Step 7: Commit**

```bash
git add packages/studio-core/src/dispatch.ts
git commit -m "feat(dispatch): add API backend types, BACKEND_META, and route research/content to Groq/Google AI"
```

---

### Task 3: Fix worker.sh backend resolution

**Files:**
- Modify: `scripts/worker.sh:132-156`

**Step 1: Add SHERPA_BACKEND export (after line 141)**

Add this line after `export SHERPA_SYSTEM_PROMPT=...`:

```bash
export SHERPA_BACKEND="$BACKEND"
```

**Step 2: Replace backend resolution logic (lines 152-156)**

Change:
```bash
# ── Resolve backend module ────────────────────────────────────────────
if [[ "$BACKEND" == "lm-studio" ]]; then
  BACKEND_SCRIPT="$SCRIPT_DIR/backends/lm-studio.mjs"
else
  BACKEND_SCRIPT="$SCRIPT_DIR/backends/${BACKEND}.sh"
fi
```

To:
```bash
# ── Resolve backend module ────────────────────────────────────────────
# Check .mjs first (API backends + lm-studio), then .sh (CLI backends)
if [[ -f "$SCRIPT_DIR/backends/${BACKEND}.mjs" ]]; then
  BACKEND_SCRIPT="$SCRIPT_DIR/backends/${BACKEND}.mjs"
elif [[ -f "$SCRIPT_DIR/backends/${BACKEND}.sh" ]]; then
  BACKEND_SCRIPT="$SCRIPT_DIR/backends/${BACKEND}.sh"
else
  BACKEND_SCRIPT=""
fi
```

**Step 3: Verify existing backends still resolve**

Run:
```bash
# Should find claude.sh
bash -c 'BACKEND=claude; SCRIPT_DIR=scripts; if [[ -f "$SCRIPT_DIR/backends/${BACKEND}.mjs" ]]; then echo ".mjs"; elif [[ -f "$SCRIPT_DIR/backends/${BACKEND}.sh" ]]; then echo ".sh: $SCRIPT_DIR/backends/${BACKEND}.sh"; fi'
```

Expected: `.sh: scripts/backends/claude.sh`

```bash
# Should find lm-studio.mjs
bash -c 'BACKEND=lm-studio; SCRIPT_DIR=scripts; if [[ -f "$SCRIPT_DIR/backends/${BACKEND}.mjs" ]]; then echo ".mjs: $SCRIPT_DIR/backends/${BACKEND}.mjs"; elif [[ -f "$SCRIPT_DIR/backends/${BACKEND}.sh" ]]; then echo ".sh"; fi'
```

Expected: `.mjs: scripts/backends/lm-studio.mjs`

**Step 4: Commit**

```bash
git add scripts/worker.sh
git commit -m "fix(worker): resolve .mjs backends first, export SHERPA_BACKEND env var"
```

---

### Task 4: Update resolve-route.mjs parallel routing table

**Files:**
- Modify: `scripts/resolve-route.mjs:12-22`

**Step 1: Add API backend entries to DEFAULT_ROUTES**

Change:
```javascript
const DEFAULT_ROUTES = {
  'code-implementation': { backend: 'claude', model: 'claude-opus-4-6' },
  'code-review':         { backend: 'codex', model: null },
  'architect':           { backend: 'claude', model: 'claude-opus-4-6' },
  'research':            { backend: 'opencode', model: 'minimax-m2.5-free' },
  'content-generation':  { backend: 'gemini', model: null },
  'audit':               { backend: 'opencode', model: 'minimax-m2.5-free' },
  'embeddings':          { backend: 'opencode', model: 'minimax-m2.5-free' },
}
```

To:
```javascript
const DEFAULT_ROUTES = {
  'code-implementation': { backend: 'claude', model: 'claude-opus-4-6' },
  'code-review':         { backend: 'codex', model: null },
  'architect':           { backend: 'claude', model: 'claude-opus-4-6' },
  'research':            { backend: 'groq', model: 'llama-3.3-70b-versatile' },
  'content-generation':  { backend: 'google-ai', model: 'gemini-2.5-flash' },
  'audit':               { backend: 'groq', model: 'llama-3.3-70b-versatile' },
  'embeddings':          { backend: 'opencode', model: 'minimax-m2.5-free' },
}
```

**Step 2: Verify route resolution**

Run:
```bash
node scripts/resolve-route.mjs research
```

Expected: `{"backend":"groq","model":"llama-3.3-70b-versatile"}`

```bash
node scripts/resolve-route.mjs content-generation
```

Expected: `{"backend":"google-ai","model":"gemini-2.5-flash"}`

```bash
node scripts/resolve-route.mjs code-implementation
```

Expected: `{"backend":"claude","model":"claude-opus-4-6"}` (unchanged)

**Step 3: Commit**

```bash
git add scripts/resolve-route.mjs
git commit -m "feat(dispatch): route research/audit to Groq, content to Google AI in resolve-route"
```

---

### Task 5: Create shared AI SDK dispatch module

**Files:**
- Create: `scripts/backends/_ai-sdk-dispatch.mjs`

This is the core module. Follow the patterns from `scripts/backends/lm-studio.mjs` (same env var contract, same exit codes, same log file writing).

**Step 1: Write the module**

```javascript
#!/usr/bin/env node

/**
 * scripts/backends/_ai-sdk-dispatch.mjs — Shared AI SDK dispatch logic.
 *
 * Called by per-provider wrappers (groq.mjs, google-ai.mjs, etc.)
 * Reads SHERPA_* env vars set by worker.sh.
 *
 * Exit codes: 0 = success, 1 = failure, 2 = provider unavailable
 */

import fs from "fs";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "http://localhost:1234";

const PROVIDERS = {
  groq: () => createGroq({ apiKey: process.env.GROQ_API_KEY }),
  google: () => createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY }),
  lmstudio: () => createOpenAICompatible({ name: "lmstudio", baseURL: `${LM_STUDIO_URL}/v1` }),
};

const DEFAULT_MODELS = {
  groq: "llama-3.3-70b-versatile",
  google: "gemini-2.5-flash",
  lmstudio: "default",
};

/**
 * Health check for an API backend.
 * Output: JSON { available, error }
 */
async function healthCheck(providerKey) {
  try {
    const factory = PROVIDERS[providerKey];
    if (!factory) {
      console.log(JSON.stringify({ available: false, error: `Unknown provider: ${providerKey}` }));
      process.exit(2);
    }
    // Simple check: can we create the provider without error?
    factory();
    console.log(JSON.stringify({ available: true, error: null }));
    process.exit(0);
  } catch (err) {
    console.log(JSON.stringify({ available: false, error: err.message }));
    process.exit(2);
  }
}

/**
 * Run a task through the AI SDK.
 */
export async function runApiBackend(providerKey) {
  // Health check mode
  if (process.argv.includes("--health")) {
    await healthCheck(providerKey);
    return;
  }

  const prompt = process.env.SHERPA_TASK_PROMPT;
  const modelId = process.env.SHERPA_MODEL || DEFAULT_MODELS[providerKey] || "default";
  const logFile = process.env.SHERPA_LOG_FILE;

  if (!prompt) {
    console.error("SHERPA_TASK_PROMPT is required");
    process.exit(1);
  }
  if (!logFile) {
    console.error("SHERPA_LOG_FILE is required");
    process.exit(1);
  }

  const factory = PROVIDERS[providerKey];
  if (!factory) {
    console.error(`Unknown provider: ${providerKey}`);
    process.exit(2);
  }

  const startTime = Date.now();

  try {
    const provider = factory();
    const model = provider(modelId);

    const result = await generateText({
      model,
      prompt,
      maxTokens: 24576,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // Write output in same format as lm-studio.mjs
    const output =
      `# Worker Output\n\n` +
      `**Provider:** ${providerKey}\n` +
      `**Model:** ${modelId}\n` +
      `**Duration:** ${elapsed}s\n` +
      `**Tokens:** input=${result.usage?.promptTokens ?? "?"}, output=${result.usage?.completionTokens ?? "?"}\n` +
      `**Finish reason:** ${result.finishReason ?? "unknown"}\n\n` +
      `---\n\n${result.text}\n`;

    fs.mkdirSync(logFile.replace(/\/[^/]+$/, ""), { recursive: true });
    fs.writeFileSync(logFile, output);

    console.log(`[ai-sdk:${providerKey}] completed in ${elapsed}s -> ${logFile}`);
    process.exit(0);
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[ai-sdk:${providerKey}] failed after ${elapsed}s: ${error.message}`);

    // Write error to log file so the task board can show what went wrong
    if (logFile) {
      const errorOutput =
        `# Worker Output — FAILED\n\n` +
        `**Provider:** ${providerKey}\n` +
        `**Model:** ${modelId}\n` +
        `**Duration:** ${elapsed}s\n` +
        `**Error:** ${error.message}\n`;
      try {
        fs.mkdirSync(logFile.replace(/\/[^/]+$/, ""), { recursive: true });
        fs.writeFileSync(logFile, errorOutput);
      } catch { /* ignore write errors */ }
    }

    process.exit(1);
  }
}
```

**Step 2: Verify module is syntactically valid**

Run:
```bash
node -e "import('./scripts/backends/_ai-sdk-dispatch.mjs').then(m => console.log('OK: exports', Object.keys(m)))"
```

Expected: `OK: exports [ 'runApiBackend' ]`

**Step 3: Commit**

```bash
git add scripts/backends/_ai-sdk-dispatch.mjs
git commit -m "feat(dispatch): add shared AI SDK dispatch module with Groq, Google, LM Studio providers"
```

---

### Task 6: Create per-provider wrapper scripts

**Files:**
- Create: `scripts/backends/groq.mjs`
- Create: `scripts/backends/google-ai.mjs`
- Create: `scripts/backends/lm-studio-api.mjs`

**Step 1: Write groq.mjs**

```javascript
#!/usr/bin/env node
import { runApiBackend } from "./_ai-sdk-dispatch.mjs";
await runApiBackend("groq");
```

**Step 2: Write google-ai.mjs**

```javascript
#!/usr/bin/env node
import { runApiBackend } from "./_ai-sdk-dispatch.mjs";
await runApiBackend("google");
```

**Step 3: Write lm-studio-api.mjs**

```javascript
#!/usr/bin/env node
import { runApiBackend } from "./_ai-sdk-dispatch.mjs";
await runApiBackend("lmstudio");
```

**Step 4: Verify worker.sh can find them**

Run:
```bash
bash -c 'BACKEND=groq; SCRIPT_DIR=scripts; if [[ -f "$SCRIPT_DIR/backends/${BACKEND}.mjs" ]]; then echo "FOUND: $SCRIPT_DIR/backends/${BACKEND}.mjs"; else echo "NOT FOUND"; fi'
```

Expected: `FOUND: scripts/backends/groq.mjs`

**Step 5: Test health check through wrapper**

Run:
```bash
node scripts/backends/groq.mjs --health
```

Expected: `{"available":true,"error":null}` (if `GROQ_API_KEY` is set) or `{"available":false,"error":"..."}` (if not set).

**Step 6: Commit**

```bash
git add scripts/backends/groq.mjs scripts/backends/google-ai.mjs scripts/backends/lm-studio-api.mjs
git commit -m "feat(dispatch): add Groq, Google AI, and LM Studio API backend wrappers"
```

---

### Task 7: End-to-end dispatch test (SESSION 1 GATE)

This is the critical validation. Create a test task and dispatch it through the Groq backend.

**Step 1: Create a test task**

Run:
```bash
./scripts/task-board.sh add ai-sdk-test-dispatch "Test AI SDK dispatch: summarize the Sherpa framework in 3 sentences" --task-type research --mode supervised
```

**Step 2: Verify the task was created**

Run:
```bash
node scripts/task-scanner.mjs --id ai-sdk-test-dispatch
```

Expected: JSON showing the task with `status: pending`.

**Step 3: Set GROQ_API_KEY if not already set**

Run:
```bash
echo $GROQ_API_KEY
```

If empty, get a free API key from https://console.groq.com/ and export it:
```bash
export GROQ_API_KEY="gsk_..."
```

**Step 4: Dispatch the task**

Run:
```bash
./scripts/worker.sh ai-sdk-test-dispatch
```

Expected output:
```
[worker] Dispatching task=ai-sdk-test-dispatch backend=groq model=llama-3.3-70b-versatile mode=supervised
[ai-sdk:groq] completed in Xs -> /path/to/docs/tasks/logs/ai-sdk-test-dispatch.log
[worker] Task ai-sdk-test-dispatch completed successfully.
```

**Step 5: Verify output**

Run:
```bash
cat docs/tasks/logs/ai-sdk-test-dispatch.log
```

Expected: Markdown output with `**Provider:** groq`, `**Model:** llama-3.3-70b-versatile`, and a response.

**Step 6: Verify task status updated**

Run:
```bash
node scripts/task-scanner.mjs --id ai-sdk-test-dispatch | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const a=JSON.parse(d);console.log('status:', a[0].status)})"
```

Expected: `status: completed`

**Step 7: Clean up test task**

Run:
```bash
rm docs/tasks/ai-sdk-test-dispatch.md docs/tasks/logs/ai-sdk-test-dispatch*
```

**Step 8: Commit session 1 completion**

```bash
git add -A
git commit -m "feat(dispatch): AI SDK dispatch working end-to-end — Session 1 gate passed"
```

---

## Session 2: Health Checks + Data Contracts

**Gate:** API backends show health status in the Dispatch Center UI (green/red dots with model info).

**Pre-session:** Run changelog check per premortem M7.

### Task 8: Implement API backend health checks with provider ping

**Files:**
- Modify: `packages/studio-core/src/dispatch.ts:137+` (the `getBackendHealth` function)

The Session 1 implementation does a basic env-var-exists check for API backends. Now upgrade to actually ping the provider (with a 2s timeout) to verify the API key works and list available models.

**Step 1: Update getBackendHealth to ping API providers**

Replace the API backend branch in `getBackendHealth()`:

```typescript
    // API backends: check env var + ping provider
    if (meta.type === 'api') {
      // No env var needed = local backend, just check if reachable
      if (meta.envKey && !process.env[meta.envKey]) {
        return {
          backend,
          available: false,
          error: `${meta.envKey} not set`,
          backendType: meta.type,
          displayName: meta.displayName,
        }
      }

      // Try health check via the wrapper script's --health flag
      const script = path.join(root, `scripts/backends/${backend}.mjs`)
      try {
        const output = execSync(`node "${script}" --health`, {
          timeout: 3000,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env },
        })
        const data = JSON.parse(output.trim())
        return {
          backend,
          available: data.available ?? false,
          models: data.models,
          error: data.error,
          backendType: meta.type,
          displayName: meta.displayName,
        }
      } catch {
        return {
          backend,
          available: false,
          error: 'health check timed out',
          backendType: meta.type,
          displayName: meta.displayName,
        }
      }
    }
```

**Step 2: Typecheck**

Run:
```bash
pnpm check
```

Expected: PASS

**Step 3: Verify health check output**

Run (from Node REPL or a quick script):
```bash
node -e "
  const { getBackendHealth } = require('./packages/studio-core/dist/dispatch.js');
  // This won't work directly (ESM). Instead:
"
```

Actually, verify by loading the dispatch page in the browser at `http://localhost:3000/dispatch` (run `pnpm dev` first). The Workforce panel should now show API backends with green/red dots.

**Step 4: Commit**

```bash
git add packages/studio-core/src/dispatch.ts
git commit -m "feat(dispatch): API backend health checks with provider ping and 3s timeout"
```

---

### Task 9: Verify MCP dashboard surfaces API backends (optional)

**Files:**
- Check: `packages/studio-core/src/mcp-dashboard.ts`

**Step 1: Read the file and check if it calls getBackendHealth**

If `mcp-dashboard.ts` calls `getBackendHealth()`, the new API backends will appear automatically. If it hardcodes backend names, update them.

**Step 2: If changes needed, update and commit**

```bash
git add packages/studio-core/src/mcp-dashboard.ts
git commit -m "feat(mcp-dashboard): surface API backend health status"
```

---

## Session 3: UI Transparency

**Gate:** WorkforcePanel shows CLI/API grouped backends with type badges. Pipeline step shows backend type.

**Pre-session:** Run changelog check per premortem M7.

### Task 10: Add CLI/API badges and grouping to WorkforcePanel

**Files:**
- Modify: `packages/studio-ui/src/dispatch-content.tsx` (WorkforcePanel function, ~lines 575-745)

**Step 1: Import BACKEND_META at the top of the file**

Add to existing imports:
```typescript
import type { BackendHealth, BackendType } from "@sherpa/studio-core";
import { BACKEND_META } from "@sherpa/studio-core";
```

Note: `BackendHealth` is already imported. Just add `BackendType` and `BACKEND_META`.

**Step 2: Add BackendTypeBadge inline component**

Above the WorkforcePanel function, add:

```typescript
function BackendTypeBadge({ type }: { type: BackendType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1 py-px text-[7px] font-semibold uppercase tracking-widest",
        type === "cli"
          ? "border-muted-foreground/20 bg-muted-foreground/8 text-muted-foreground/60"
          : "border-[var(--color-session)]/25 bg-[var(--color-session)]/10 text-[var(--color-session)]"
      )}
    >
      {type}
    </span>
  );
}
```

**Step 3: Group backends by type in WorkforcePanel**

Inside the Backends section of WorkforcePanel, replace the flat `health.map(...)` with grouped rendering:

```typescript
{/* CLI backends */}
<p className="text-[9px] uppercase tracking-widest text-muted-foreground/30 pt-1 pb-0.5">
  CLI Agents
</p>
{health
  .filter((b) => {
    const meta = BACKEND_META[b.backend as keyof typeof BACKEND_META];
    return meta?.type === "cli";
  })
  .map((b) => (
    // ... existing button with BackendTypeBadge added
  ))}

{/* API backends */}
<p className="text-[9px] uppercase tracking-widest text-muted-foreground/30 pt-3 pb-0.5">
  API Backends
</p>
{health
  .filter((b) => {
    const meta = BACKEND_META[b.backend as keyof typeof BACKEND_META];
    return meta?.type === "api";
  })
  .map((b) => (
    // ... same button pattern with BackendTypeBadge
  ))}
```

**Step 4: Add BackendTypeBadge inside each backend button**

In the button's label area, add the badge between the health dot and the name:

```tsx
<div className="flex items-center gap-2">
  <span className={cn("inline-block h-1.5 w-1.5 rounded-full", /* health dot styles */)}>
  </span>
  <BackendTypeBadge type={b.backendType} />
  <span className={cn("text-xs", /* name styles */)}>
    {b.displayName}
  </span>
</div>
```

Use `b.displayName` instead of the manual name formatting (`b.backend.charAt(0).toUpperCase() + ...`).

**Step 5: Typecheck and visual verify**

Run:
```bash
pnpm check
```

Then open `http://localhost:3000/dispatch` and verify:
- CLI backends grouped under "CLI Agents" sub-header
- API backends grouped under "API Backends" sub-header
- Each backend shows a CLI or API badge
- Display names come from BACKEND_META
- Selection and health dots still work

**Step 6: Commit**

```bash
git add packages/studio-ui/src/dispatch-content.tsx
git commit -m "feat(dispatch-ui): group backends by CLI/API with type badges in WorkforcePanel"
```

---

### Task 11: Add backend type to pipeline step in QueueControls

**Files:**
- Modify: `packages/studio-ui/src/dispatch-content.tsx` (QueueControls function)

**Step 1: Update the backend pipeline step label**

In the QueueControls steps array, the backend step currently shows `selectedBackend ?? "backend"`. Update to show the type badge inline:

Find the steps array and update the backend step:

```typescript
const backendMeta = selectedBackend
  ? BACKEND_META[selectedBackend as keyof typeof BACKEND_META]
  : null;

const steps = [
  { label: `${selectedCount} task${selectedCount !== 1 ? "s" : ""}`, done: selectedCount > 0 },
  { label: selectedAgent ?? "agent", done: !!selectedAgent },
  {
    label: selectedBackend ?? "backend",
    done: !!selectedBackend,
    backendType: backendMeta?.type,
  },
];
```

Then in the rendering, when `step.backendType` is set, show the badge inline before the label text.

**Step 2: Typecheck and visual verify**

Run:
```bash
pnpm check
```

Open dispatch page, select a task + agent + API backend. The pipeline should show: `3 tasks → Research Lead → API groq`

**Step 3: Commit**

```bash
git add packages/studio-ui/src/dispatch-content.tsx
git commit -m "feat(dispatch-ui): show CLI/API badge in pipeline step indicator"
```

---

### Task 12: Optional — Add CLI/API micro-badge to task board

**Files:**
- Modify: `packages/studio-ui/src/tasks-content.tsx`

**Only if time permits.** The task board already shows backend as a monospace string. Adding a tiny CLI/API badge inline would be consistent with the dispatch center.

**Step 1: Import BACKEND_META**

```typescript
import { BACKEND_META } from "@sherpa/studio-core";
```

**Step 2: In the backend column cell, add badge before the text**

Find where `task.backend` is rendered and prefix with:

```tsx
{BACKEND_META[task.backend as keyof typeof BACKEND_META] && (
  <BackendTypeBadge type={BACKEND_META[task.backend as keyof typeof BACKEND_META]!.type} />
)}
```

**Step 3: Typecheck, verify, commit**

```bash
pnpm check
git add packages/studio-ui/src/tasks-content.tsx
git commit -m "feat(tasks-ui): add CLI/API badge to task board backend column"
```

---

## Post-Implementation

### Update initiative activity log

```bash
# Update docs/initiatives/ai-sdk-dispatch/activity.md with completion
# Update proposal status to in-progress or integrated
```

### Verify the full dispatch flow

1. Create a research task
2. Open Dispatch Center — see it in backlog
3. Select task → assign Research Lead agent → select Groq (API) backend
4. Pipeline shows: `1 task → Research Lead → API groq`
5. Click Dispatch
6. Task appears in Assignments with API badge + groq + model
7. Task completes, appears in Completed Today
8. Open Task Detail — verify output with provider/model metadata
