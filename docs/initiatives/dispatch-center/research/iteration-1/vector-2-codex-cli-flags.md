# Vector 2: Codex CLI Flags

**Question:** What are OpenAI's Codex CLI exact flags for headless execution, model selection, and auth?
**Agent dispatched:** 2026-03-13

## Findings

**Two CLIs exist:**
- **Legacy TypeScript CLI** (`@openai/codex` on npm) — scriptable, documented headless flags
- **Rust CLI** (current, `rust-v0.114.0`) — default binary via Homebrew/GitHub Releases, different flag surface

**Command name:** `codex`

**Install:**
- `npm install -g @openai/codex` — TypeScript CLI
- `brew install --cask codex` — Rust CLI
- GitHub Releases binary download — Rust CLI

**Headless mode:**
- TypeScript CLI: `-q` / `--quiet` or `CODEX_QUIET_MODE=1`
- Rust CLI: `codex exec` subcommand (alias `codex e`), `--json` for JSONL events, `-o <path>` to write final message to file, `--ephemeral` for no session persistence

**Model selection:** `-m <model>` / `--model <model>` (e.g., `--model gpt-4.1`, `--model gpt-5-codex`)
- TypeScript CLI also supports: `--provider <name>` (openai, openrouter, azure, gemini, ollama, etc.)

**Auth — two paths:**
1. API Key: `export OPENAI_API_KEY="sk-..."` (also `.env` file)
2. ChatGPT subscription: `codex login` (browser OAuth) or `codex login --device-auth` (headless, beta)

**No budget/cost control flags.** Cost caps must be set via OpenAI platform dashboard.

**Scripting patterns:**
```bash
# TypeScript CLI
codex -m gpt-4.1 -a full-auto --quiet "your task"
# Rust CLI
codex exec --model gpt-4.1 --json "your task"
```

## Sources

- https://github.com/openai/codex/blob/main/README.md
- https://github.com/openai/codex/blob/main/codex-cli/README.md
- https://developers.openai.com/codex/cli/reference
- https://developers.openai.com/codex/auth
- https://github.com/openai/codex/releases/latest

## Raw Links

- https://github.com/openai/codex
- https://www.npmjs.com/package/@openai/codex
- https://developers.openai.com/codex

## Open Questions

1. `codex exec` flag completeness — Rust CLI evolving fast, run `codex exec --help`
2. `codex login --device-auth` stability in headless CI
3. No canonical list of valid model identifiers for Rust CLI
4. ChatGPT OAuth token refresh for non-interactive use
5. `--json` output event schema not publicly documented
