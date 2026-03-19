# Code Review Output: review-dispatch-types

**Task:** Review dispatch.ts types and resolver logic  
**Executed by:** Luna (OpenClaw) — nightly task runner  
**Date:** 2026-03-19  
**Initiative:** dispatch-center  

---

## Files Reviewed

- `packages/studio-core/src/dispatch.ts`
- `packages/studio-core/src/dispatch-meta.ts`

---

## Summary

`dispatch.ts` implements multi-backend task routing for the Sherpa dispatch system. The file is clean, well-structured, and exports the correct types and functions. Several type correctness and logic issues were found.

---

## Issues: Security / Correctness

### 1. `resolveRoute` ignores `_mode` parameter — dead code
**Location:** `dispatch.ts:80`  
**Severity:** Correctness / Misleading API

```typescript
export function resolveRoute(
  config: DispatchConfig,
  taskType: TaskType | string,
  _mode: DispatchMode,   // ← underscore prefix = intentionally unused?
  overrides?: RouteOverrides,
): BackendRoute {
```

The `_mode` parameter is passed to `resolveRoute` but never used in the function body. The original docstring says:

> *Resolution order: 1. Explicit overrides, 2. Task-type route from config, 3. Config fallback*

The mode (`interactive`, `supervised`, `overnight`) is not considered at all in route resolution — only in `isTaskTypeAllowed`. This means you could resolve a route for an `overnight`-blocked task type and get a valid backend back, even though `isTaskTypeAllowed` would reject it. The two functions need to be composed at the call site; the mode guard is not enforced inside `resolveRoute`.

**Risk:** Callers who use `resolveRoute` without also calling `isTaskTypeAllowed` will silently bypass overnight mode guards.

**Recommendation:** Either (a) enforce the mode check inside `resolveRoute` and throw/return null for blocked task types in overnight mode, or (b) remove `_mode` from the signature and document clearly that the caller is responsible for checking `isTaskTypeAllowed` first. The current API is subtly misleading — the parameter implies mode influences routing, but it does not.

---

### 2. `requiresClaude` accepts arbitrary strings — no type safety at call sites
**Location:** `dispatch.ts:55-58`

```typescript
export function requiresClaude(targets: string[]): boolean {
  return targets.some(target =>
    CLAUDE_ONLY_PATTERNS.some(pattern => target.includes(pattern))
  )
}
```

`targets` is `string[]` — correct for file paths. But `RouteOverrides.targets` is also `string[]`:

```typescript
export interface RouteOverrides {
  backend?: Backend
  model?: string
  targets?: string[]
}
```

The pattern matching uses `target.includes(pattern)` — a substring check. This means:
- `'docs/agents/roles/foo.md'` → matches `'docs/agents/roles/'` ✅
- `'my-CLAUDE.md-backup.txt'` → matches `'CLAUDE.md'` ❌ False positive

**Risk:** Files with names containing `CLAUDE.md` as a substring (e.g., backup files, renamed copies) will incorrectly force the Claude backend. Low probability in practice, but the match should use `path.basename` or path segment comparison for `CLAUDE.md` specifically.

**Recommendation:** For the `CLAUDE.md` pattern, check `path.basename(target) === 'CLAUDE.md'` rather than substring match.

---

### 3. `getBackendHealth` uses `require('fs')` inside a TypeScript module
**Location:** `dispatch.ts:140`

```typescript
const envContent = require('fs').readFileSync(envFile, 'utf-8')
```

`require('fs')` inside an ESM-compatible TypeScript module is a CommonJS pattern that should use `import fs from 'fs'`. The rest of the file uses `import` at the top. This is a convention violation and will fail if the package is ever built as pure ESM.

**Evidence:** Top of file uses `import { execSync } from "child_process"` — consistent ESM style. The `require('fs')` is inconsistent.

**Recommendation:** Move `import fs from 'fs'` to the top-level imports and use `fs.readFileSync(...)` inline.

---

## Issues: Convention Violations

### 4. `TaskType` union defined in two files
**Location:** `dispatch.ts:20-29` and `dispatch-meta.ts` (Backend type)

`TaskType` is defined in `dispatch.ts`. `BackendType` is defined in `dispatch-meta.ts`. The split was clearly intentional (browser-safe vs. Node-only), and `dispatch-meta.ts` re-exports browser-safe types. This is architecturally sound.

**But:** The `DEFAULT_DISPATCH` config object (`dispatch.ts:42-55`) is not browser-safe — it's in the same file as `getBackendHealth` which calls `execSync`. If any UI component imports `DEFAULT_DISPATCH`, it imports the entire Node-only module.

**Recommendation:** Move `DEFAULT_DISPATCH` and the pure resolution functions (`resolveRoute`, `isTaskTypeAllowed`, `requiresClaude`, `matchTasksToAgents`) to `dispatch-meta.ts` or a new `dispatch-resolver.ts`. Keep `getBackendHealth` and `execSync` usage in a server-only file. This would make the browser/server split explicit.

---

### 5. `BackendHealth.backendType` field is typed as `BackendType` but populated from `BACKEND_META`
**Location:** `dispatch.ts:102-107`

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

`BackendType` is `'cli' | 'api'` — but `openclaw` is categorized as `'api'` in `BACKEND_META` even though it uses WebSocket, not a direct AI SDK API call. The category is used for routing decisions (API backends get `.mjs` scripts, CLI backends get `.sh` scripts), and the routing comment on line ~174 says "API backends: run --health via wrapper script." This is correct for `openclaw.mjs` too.

**Minor inconsistency:** The categorization of `openclaw` as `type: 'api'` in `dispatch-meta.ts` causes the health check to run via `scripts/backends/${backend}.mjs` which is correct — but the `displayName: 'OpenClaw'` and the `provider: 'openclaw'` hint suggest it's a distinct category from standard AI SDK API backends.

**Not a blocking issue** — the routing works correctly. Worth documenting the distinction.

---

## What Passes

- ✅ **Type coverage:** All exported functions and interfaces have complete TypeScript types — no `any`, no implicit returns
- ✅ **Barrel exports:** `dispatch.ts` exports are comprehensive and the re-exports from `dispatch-meta.ts` are correct (`export { BACKEND_META }`, `export type { Backend, BackendType, BackendMeta }`)
- ✅ **`DEFAULT_DISPATCH` is a clean config object** — `overnight.blocked: ['code-implementation', 'architect']` correctly implements the nightly mode guard
- ✅ **`resolveRoute` priority order** is correct (overrides → task-type route → fallback)
- ✅ **`matchTasksToAgents` logic** correctly handles pending filtering, type matching, and primary vs. eligible agent preference
- ✅ **No `console.log` in committed code** — uses no logging; errors propagate via return values or exceptions
- ✅ **Non-barrel imports:** File does not import from sibling internals (imports from `./dispatch-meta` and `./tasks` — both public modules)
- ✅ **`isTaskTypeAllowed`** correctly handles the `overnight` mode guard with a clear boolean contract

---

## Summary Table

| # | Issue | Severity | File | Line |
|---|-------|----------|------|------|
| 1 | `_mode` param unused — mode guard not enforced in `resolveRoute` | Correctness | dispatch.ts | ~80 |
| 2 | `requiresClaude` substring match causes false positive on `CLAUDE.md` as substring | Correctness | dispatch.ts | 55 |
| 3 | `require('fs')` inside ESM module | Convention | dispatch.ts | 140 |
| 4 | `DEFAULT_DISPATCH` + pure resolvers mixed with Node-only `execSync` code | Architecture | dispatch.ts | 42 |
| 5 | `openclaw` `BackendType: 'api'` is semantically imprecise | Minor | dispatch-meta.ts | — |

---

## Verdict

**NEEDS WORK** on issues 1 and 2 (correctness bugs). Issues 3 and 4 are convention/architecture concerns that should be addressed before the dispatch system scales. Issue 5 is cosmetic.

Priority fixes:
1. `_mode` in `resolveRoute` — document or enforce the overnight guard within the function
2. `requiresClaude` — use `path.basename` for the `CLAUDE.md` pattern check
3. `require('fs')` → `import fs from 'fs'` (trivial)
