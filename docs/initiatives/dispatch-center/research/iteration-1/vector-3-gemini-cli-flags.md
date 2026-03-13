# Vector 3: Gemini CLI Flags

**Question:** What are Google's Gemini CLI exact flags for headless execution, model selection, and auth?
**Agent dispatched:** 2026-03-13

## Findings

**Command name:** `gemini`

**Install:** `npm install -g @google/gemini-cli` or `npx @google/gemini-cli` or `brew install gemini-cli`

**Headless mode:** `-p` / `--prompt` flag triggers non-interactive execution. Also auto-triggered in non-TTY environments.
- Output format: `--output-format` / `-o` — choices: `text` (default), `json` (single JSON object), `stream-json` (JSONL events)
- Exit codes: 0 success, 1 API error, 42 invalid prompt, 53 turn limit exceeded

**Model selection:** `--model` / `-m`. Default: `auto`. Aliases: `auto`, `pro`, `flash`, `flash-lite`. Concrete names accepted (e.g., `gemini-2.5-pro`, `gemini-2.5-flash`). Note: does NOT override sub-agent model selection.

**Auth — multiple paths:**
1. Simplest: `export GEMINI_API_KEY="..."` from https://aistudio.google.com/app/apikey — no GCP required
2. Vertex AI (ADC): `gcloud auth application-default login` + `GOOGLE_CLOUD_PROJECT` + `GOOGLE_CLOUD_LOCATION`
3. Vertex AI (service account): `GOOGLE_APPLICATION_CREDENTIALS` + `GOOGLE_CLOUD_PROJECT`
4. `.gemini/.env` file auto-loaded

**Sandbox:** `-s` / `--sandbox` or `GEMINI_SANDBOX=true|docker|podman|sandbox-exec|runsc|lxc`

**Approval mode:** `--approval-mode` — choices: `default`, `auto_edit`, `yolo`. For scripting: `--approval-mode=yolo`

**Scripting pattern:**
```bash
export GEMINI_API_KEY="..."
gemini -p "your task" -m flash --output-format json --approval-mode=yolo
```

## Sources

- https://github.com/google-gemini/gemini-cli
- https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/headless.md
- https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/cli-reference.md
- https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/get-started/authentication.md
- https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/sandbox.md
- https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/model.md
- https://aistudio.google.com/app/apikey

## Raw Links

- https://github.com/google-gemini/gemini-cli
- https://aistudio.google.com/app/apikey

## Open Questions

1. `--max-turns` or turn limit configuration not documented — how to cap agentic loops
2. `--approval-mode=yolo` scope — does it suppress all prompts including destructive file ops?
3. Sub-agent model not controllable via CLI flag
4. Gemini 3 series (`gemini-3-pro-preview`, `gemini-3-flash-preview`) in preview but not GA
