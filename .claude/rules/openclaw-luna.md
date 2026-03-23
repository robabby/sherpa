---
alwaysApply: true
---

# Luna — OpenClaw Agent on the Sherpa VPS

Luna is the always-on OpenClaw agent running on the Hetzner VPS. She is Rob's Personal Collaborator and the primary Sherpa dispatch backend. Pronouns: she/her.

- **Identity:** Luna (Sherpa AI), luna.sherpa.ai@gmail.com, GitHub: [luna-sherpa](https://github.com/luna-sherpa)
- **Runtime:** Docker container `openclaw-openclaw-gateway-1` on the VPS
- **Access:** Telegram bot + TUI (always reachable)

## Technical Details

| Detail | Value |
|--------|-------|
| Workspace root | `/home/node/.openclaw/workspace` (mount of `/root/.openclaw/workspace`) |
| Sherpa repo | `/home/node/.openclaw/workspace/sherpa` (bind-mount of `/root/sherpa` on host) |
| Identity files | `SOUL.md`, `AGENTS.md`, `IDENTITY.md`, `USER.md`, `TOOLS.md` at workspace root |
| Git identity | `Luna (Sherpa AI) <luna.sherpa.ai@gmail.com>` |
| Git config | `/home/node/.openclaw/.gitconfig` (persisted via volume mount) |
| SSH deploy key | `/home/node/.openclaw/ssh/config` |
| GitHub CLI | `/usr/local/bin/gh`, logged in as `robabby` |
| MCP endpoint | `http://172.18.0.1:3100/mcp` (`SHERPA_MCP_URL`) |
| Studio endpoint | `http://172.18.0.1:3000` (`SHERPA_STUDIO_URL`) |
| Memory | Files at `/home/node/.openclaw/workspace/memory/`, `MEMORY.md` at workspace root |

## Governance Gap

Luna does **not** auto-load `.claude/rules/` or hierarchically load `CLAUDE.md`/`AGENTS.md` files. She can read these files explicitly at task start, but it's not automatic — governance context must be injected into task prompts or she must be told which files to read.

This is the problem the **agent-context-portability** initiative solves. See `docs/initiatives/agent-context-portability/proposal.md` (pending). Until it lands, always inject governance context when writing tasks for Luna.

## When to Prefer Luna

**Prefer Luna** for tasks that benefit from persistence, overnight execution, or VPS-side access to MCP/Studio. She excels at long-running research, audits, and content generation that don't need interactive feedback loops.

**Prefer local backends** for interactive work requiring rapid iteration, tight human-in-the-loop cycles, or access to Rob's local filesystem.

## How We Collaborate

**Division of labor:**
- Claude Code runs interactively during Rob's work sessions
- Luna runs autonomously — overnight cron jobs at 1am PST (task runner), 2am (memory housekeeping), 6am (morning briefing)
- Both share the same repo; the 15-minute host cron runs git pull inside Luna's container via `docker exec` (never as root on host, to avoid root-owned `.git` artifacts)

**Git workflow:**
- Luna always works on `luna/<description>` branches, never commits to main
- Every Luna commit includes: `Co-Authored-By: Luna (OpenClaw) <luna.sherpa.ai@gmail.com>`
- Rob reviews and merges all PRs

**Capabilities:**

| Can do | Cannot do (requires human oversight) |
|--------|--------------------------------------|
| Research, audit, content-generation, code-review, general tasks | Code-implementation, architect tasks |
| Open PRs, push branches, run shell commands on VPS | Access Rob's local filesystem |
| Overnight autonomous work on eligible task types | Auto-load `.claude/` governance context |

Eligible overnight task types: `research`, `audit`, `content-generation`, `embeddings`, `general`, `code-review`.

## Writing Tasks for Luna

When creating a task with `backend: openclaw`:

1. **Include all relevant context in the task body.** Luna doesn't auto-load rules or conventions — she needs to be told what to read.

2. **Reference specific files by path.** Don't assume directory awareness; name the files she needs to read.

3. **Add a Context section** that points Luna to the governance rules she'll need:

```markdown
## Context

Before starting, read these governance files:
- `.claude/rules/directoturtle-convention.md` — directory structure convention
- `.claude/rules/initiative-convention.md` — proposal format, frontmatter, activity logs
- `.claude/rules/behavioral-engineering.md` — agent role definitions use behavioral constraints
- `.claude/rules/content-quality.md` — quality scorecard for published content
- `.claude/rules/effort-estimation.md` — sessions as unit of effort
- `.claude/rules/provenance-convention.md` — provenance frontmatter and banners
```

4. **Luna reads `CLAUDE.md` manually** when she enters a directory — put important context there for her benefit.

5. **For coding tasks:** reference specific files and expected outputs. Luna performs best with concrete, well-scoped work and explicit acceptance criteria.
