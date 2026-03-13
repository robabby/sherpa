# Iteration 1 — 2026-03-13

## Research Vectors

### Vector 1: OpenCode CLI Flags
**Question:** Headless execution, model selection, and auth for OpenCode CLI
**Full report:** [iteration-1/vector-1-opencode-cli-flags.md](iteration-1/vector-1-opencode-cli-flags.md)

**Key discoveries:**
- Headless: `opencode run "prompt"` — no `--print` flag, uses `run` subcommand
- Model: `--model opencode/nemotron-super-3-49b` (provider/model format)
- Free models need no auth — falls back to `apiKey: "public"` automatically
- `--format json` for machine-readable JSONL output
- `opencode serve` + `--attach` for persistent server mode (avoids cold boot)

### Vector 2: Codex CLI Flags
**Question:** Headless execution, model selection, and auth for OpenAI Codex CLI
**Full report:** [iteration-1/vector-2-codex-cli-flags.md](iteration-1/vector-2-codex-cli-flags.md)

**Key discoveries:**
- Two CLIs exist: legacy TypeScript (`--quiet`) and current Rust (`codex exec`)
- Rust CLI headless: `codex exec --model gpt-4.1 --json "prompt"`
- Auth via `OPENAI_API_KEY` env var or ChatGPT subscription (`codex login`)
- No budget/cost control flags — must set limits on OpenAI dashboard
- TypeScript CLI supports `--provider` flag for OpenRouter, Ollama, etc.

### Vector 3: Gemini CLI Flags
**Question:** Headless execution, model selection, and auth for Google Gemini CLI
**Full report:** [iteration-1/vector-3-gemini-cli-flags.md](iteration-1/vector-3-gemini-cli-flags.md)

**Key discoveries:**
- Headless: `gemini -p "prompt"` — `-p` flag triggers non-interactive
- Model: `-m flash` or `-m gemini-2.5-pro` (aliases + concrete names)
- Auth: `GEMINI_API_KEY` env var — simplest path, no GCP required
- `--approval-mode=yolo` auto-approves all actions (equivalent to Claude's `acceptEdits`)
- `--output-format json` for structured output
- Sandbox support built in: `-s` flag

### Vector 4: Free Model Non-Coding Benchmarks
**Question:** How do Nemotron, MiniMax M2.5, MiMo V2 Flash compare on research/content tasks?
**Full report:** [iteration-1/vector-4-free-model-benchmarks.md](iteration-1/vector-4-free-model-benchmarks.md)

**Key discoveries:**
- **MiniMax M2.5** wins instruction-following (IFEval 87.5%) — best for structured output tasks
- **MiMo V2 Flash** wins raw reasoning (MMLU-Pro 84.9%, GPQA 83.7%) — but instruction-following is unreliable
- **Nemotron 3 Super** wins speed (~449 tok/s) and context (1M) — built for agents, not writers
- None have published summarization-specific benchmarks

## Synthesis

**All four CLIs are scriptable.** Every backend we planned has a viable headless path:

| CLI | Headless Command | Model Flag | Auth Env Var |
|-----|-----------------|-----------|-------------|
| `claude` | `claude --print` | `--model X` | `ANTHROPIC_API_KEY` |
| `opencode` | `opencode run` | `--model provider/model` | None (free) or `opencode.json` |
| `codex` | `codex exec` | `--model X` | `OPENAI_API_KEY` |
| `gemini` | `gemini -p` | `-m X` | `GEMINI_API_KEY` |

**The backend contract from the plan holds.** All four CLIs accept a prompt string, support model selection, and can produce output to stdout. The environment variable pattern (`SHERPA_*`) maps cleanly. Each has JSON output modes for structured parsing.

**Free model routing should be task-type aware.** The benchmarks reveal clear specializations:
- **Research/audits** → MiniMax M2.5 (instruction-following means it actually produces the format you ask for)
- **Long-document analysis** → Nemotron 3 Super (1M context, fast throughput)
- **Math/science reasoning** → MiMo V2 Flash (but caveat: instruction-following is weak, so prompt carefully)
- **General overnight workhorse** → MiniMax M2.5 as default, Nemotron for long-context tasks

This suggests the config route for `research` should default to MiniMax M2.5, not Nemotron. Nemotron's strength is throughput and context length, not instruction quality.

**Codex has no budget controls.** Unlike Claude's `--max-budget-usd`, Codex has no spend limit flag. Budget management happens at the OpenAI dashboard level. Our `worker.sh` can't enforce per-task budgets for Codex — this is a supervision gap we should document.

**Gemini is the most scripting-friendly.** Clean flag design, built-in sandbox, structured exit codes, `--approval-mode=yolo`. If Gemini's model quality holds up, it's the easiest backend to integrate.

## All Sources

### OpenCode
- https://github.com/anomalyco/opencode
- https://opencode.ai/docs/cli
- https://opencode.ai/docs/providers
- https://opencode.ai/docs/zen

### Codex
- https://github.com/openai/codex
- https://developers.openai.com/codex/cli/reference
- https://developers.openai.com/codex/auth

### Gemini
- https://github.com/google-gemini/gemini-cli
- https://aistudio.google.com/app/apikey

### Model Benchmarks
- https://artificialanalysis.ai/models/nvidia-nemotron-3-super-120b-a12b
- https://artificialanalysis.ai/models/minimax-m2-5
- https://artificialanalysis.ai/models/comparisons/minimax-m2-5-vs-mimo-v2-flash
- https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf

## Proposals Generated

- Updated default model recommendation in dispatch config: MiniMax M2.5 as research default (was Nemotron)
- No new proposals — findings validate and refine the existing proposal

## Open Questions for Next Iteration

1. **Exact OpenCode model IDs** — run `opencode models opencode` locally to get current slugs before writing backend module
2. **OpenCode rate limits on free tier** — no docs found; needs empirical testing with batch dispatch
3. **Codex Rust CLI vs TypeScript CLI** — which should we target? Rust is current but TypeScript has `--provider` flexibility
4. **Gemini model quality for content tasks** — benchmarks look good on paper; needs real task comparison against MiniMax M2.5
5. **Embedding model availability** — none of the free models document embedding support; may need a separate model/backend for embedding tasks
