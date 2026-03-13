# Vector 1: OpenCode CLI Flags

**Question:** What are OpenCode CLI's exact flags for headless execution, model selection, and auth?
**Agent dispatched:** 2026-03-13

## Findings

- **Command name:** `opencode` (installed via `npm i -g opencode-ai@latest`, `brew install anomalyco/tap/opencode`, or `curl -fsSL https://opencode.ai/install | bash`)
- **Headless/print mode:** `opencode run "your message"` — non-interactive subcommand. No `--print` flag. If stdout is not a TTY, text parts are written directly to stdout. For machine-readable output, add `--format json` for newline-delimited JSON events.
- **Model selection:** `--model <provider/model>` (alias `-m`). Format is `provider/model`, e.g. `opencode/nemotron-super-3-49b` or `opencode/minimax-m2.5`. Discover exact model IDs with `opencode models opencode`.
- **Auth — two paths:**
  1. Interactive (one-time): `opencode auth login`
  2. Config file: `opencode.json` in project root with provider/apiKey
  3. Environment: `OPENCODE_CONFIG_CONTENT` (raw JSON) or `OPENCODE_CONFIG` (path to config file)
- **Free Zen models need no auth:** Provider falls back to `apiKey: "public"` automatically for models with `cost.input === 0` — Nemotron 3 Super Free, MiMo V2 Flash Free, MiniMax M2.5 Free, Big Pickle work without auth.
- **Project context flags:** `--dir <path>`, `--attach <url>` (connect to running `opencode serve`), `OPENCODE_DISABLE_PROJECT_CONFIG=true`
- **Additional scriptable flags on `opencode run`:** `--agent <name>` (build, plan), `--session/-s <id>`, `--continue/-c`, `--format json`, `--file/-f <path>`, `--variant <effort>` (high, max, minimal), stdin read automatically if not TTY
- **Server mode:** `opencode serve` starts persistent server; `opencode run --attach http://localhost:<port>` avoids cold boot

## Sources

- https://github.com/anomalyco/opencode — main repo
- https://opencode.ai/docs — docs home
- https://opencode.ai/docs/cli — CLI reference
- https://opencode.ai/docs/providers — provider/auth config
- https://opencode.ai/docs/zen — Zen model platform

## Raw Links

- https://opencode.ai/install
- https://opencode.ai/zen
- https://opencode.ai/auth
- https://github.com/anomalyco/opencode/blob/main/packages/opencode/src/cli/cmd/run.ts
- https://github.com/anomalyco/opencode/blob/main/packages/opencode/src/flag/flag.ts
- https://github.com/anomalyco/opencode/blob/main/packages/opencode/src/provider/provider.ts

## Open Questions

1. Exact free model IDs — need to run `opencode models opencode` locally
2. Session isolation for parallel dispatch — each `run` appears to create independent session
3. Rate limits on free "public" key — no documentation found
4. `opencode serve` persistence behavior for CI dispatch
