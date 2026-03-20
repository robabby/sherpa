# Vector 1: `.sherpa/` and `.claude/` Coexistence

**Question:** How should two dotfolder conventions coexist when they have overlapping concerns?
**Agent dispatched:** 2026-03-20

## Findings

### Dual Dotfolder Precedents
- **`.vscode/` + `.idea/`** is the strongest precedent. Both committed, independently maintained, bridged by a neutral file (`.editorconfig`) for overlapping concerns
- **`.github/` + `.gitlab/`** coexistence is rare — teams pick one platform. When both exist, they're parallel with no sharing
- **Key insight:** The `.editorconfig` model — a tool-neutral bridge file that both tools read — is the strongest pattern for overlapping concerns

### Symlink Patterns
- **Claude Code explicitly supports symlinks** in `.claude/rules/`. "Symlinks are resolved and loaded normally, circular symlinks detected gracefully"
- **Cursor has broken symlink support** as of early 2026 — regression, infinite CPU on circular symlinks
- **Windows:** `git` doesn't create symlinks by default (`core.symlinks=false`). Requires Developer Mode
- **Monorepo pattern:** Use `post-checkout` hooks to recreate symlinks on every machine

### Import/Reference Patterns
- **Claude Code `@import`:** CLAUDE.md supports `@path/to/file` imports. Both relative and absolute paths. Max 5 hops. First use triggers approval dialog
- **Critical:** Imported files don't get `paths:` glob scoping — they load unconditionally
- **No mechanism to auto-discover rules from outside `.claude/rules/`** — only native path, no plugin/config to add directories

### Agent-Context-Portability Landscape (March 2026)

**AGENTS.md standard** — originated by OpenAI, now governed by Linux Foundation's Agentic AI Foundation (AAIF). Supported by 25+ tools. Claude Code does NOT natively read AGENTS.md yet.

| Tool | Native config | Also reads |
|------|--------------|------------|
| Claude Code | `CLAUDE.md`, `.claude/rules/` | — |
| Codex CLI | `AGENTS.md` | — |
| Cursor | `.cursor/rules/*.mdc` | `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md` | `AGENTS.md` |
| Windsurf | `.windsurfrules` | `AGENTS.md` |

**Sync tools emerging:**
- **block/ai-rules** (Block/Square) — single source generates for 11 agents
- **agentlink** — "one file to rule them all," designate source, symlink rest
- **ai-rules-sync** — centrally managed rules, syncs via symlinks

### Five Coexistence Strategies

**A: `.sherpa/` source, symlinks into `.claude/`**
- (+) Claude auto-discovers natively; `.sherpa/` is portable canonical
- (-) Symlinks fragile cross-platform; need sync script for adds/removes

**B: `.claude/` source, generator produces `.sherpa/` portable format**
- (+) Zero friction for Claude; generated file strips tool-specific content
- (-) `.sherpa/` doesn't own its rules — downstream of `.claude/`

**C: `.sherpa/` source, `@import` in CLAUDE.md**
- (+) No symlinks; native import mechanism
- (-) Loses `paths:` glob scoping — all rules load unconditionally

**D: Neutral `.agents/` directory, fan out to both**
- (+) Neither tool is privileged; clean conceptual model
- (-) Third directory; `.agents/` not recognized by any tool natively

**E: Dual ownership with `@import` bridge**
- `.claude/rules/` owns Claude-specific rules (path scoping)
- `.sherpa/rules/` owns framework-portable rules
- CLAUDE.md imports `.sherpa/` rules via `@import`
- (+) Clean separation; framework users without Claude only need `.sherpa/`
- (-) Rules that are both framework AND Claude-specific need to pick a home

## Sources

- [Claude Code Memory/Rules](https://code.claude.com/docs/en/memory)
- [Claude Code Rules Guide](https://claudefa.st/blog/guide/mechanics/rules-directory)
- [AGENTS.md Official](https://agents.md/)
- [Linux Foundation AAIF](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [block/ai-rules](https://github.com/block/ai-rules)
- [Cursor Symlink Issues](https://forum.cursor.com/t/cursor-no-longer-can-follow-symlinks-to-rules-mdc-files/146010)
- [EditorConfig](https://editorconfig.org/)
- [Symlinks in Monorepos](https://mykeels.medium.com/symlinks-in-monorepos-cfc917260520)

## Implications

1. **Strategy E (dual ownership + `@import`) is the right long-term answer** — `.claude/` for Claude-specific behavior, `.sherpa/` for portable framework conventions, `@import` bridges them
2. **Strategy B (current agent-context-portability design) is correct for now** — pragmatic, working, low risk
3. **AGENTS.md is the bridge for directory-level context** but not granular rules
4. **`@import` is underused** — can reference `.sherpa/` files directly, ~4,500 tokens for 6 rules is acceptable
5. **Industry converging on "one source, fan out"** — Sherpa's existing scripts are a lightweight version of this

## Open Questions

1. When Claude Code supports AGENTS.md natively, does the symlink/import approach simplify?
2. How do `paths:` globs interact with symlinked rules? Needs empirical testing
3. Should `block/ai-rules` be adopted instead of custom sync scripts?
4. Framework consumers with their own `.claude/rules/` — subdirectory approach (`.claude/rules/sherpa/`) cleaner?
