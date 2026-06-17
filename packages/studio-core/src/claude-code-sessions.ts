/**
 * Claude Code session adapter.
 *
 * Reads real Claude Code session logs from `~/.claude/projects/<encoded-cwd>/*.jsonl`
 * and maps them into the `Session` shape that Studio's OBSERVE surfaces render.
 *
 * Defensive by design: the JSONL format is undocumented and evolves across
 * Claude Code versions. Missing or renamed fields degrade gracefully, malformed
 * lines are skipped, and a missing projects directory yields `[]`. All
 * host-path coupling is isolated in this module — no other code knows where
 * Claude Code stores its logs.
 */
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import type { Session, SessionOutcome, SessionTokens } from "./types"

/**
 * Claude Code derives a project's log directory name from its working directory
 * by replacing path separators and dots with hyphens
 * (e.g. `/Users/rob/Workbench/sherpa` -> `-Users-rob-Workbench-sherpa`).
 */
export function encodeClaudeProjectDir(projectRoot: string): string {
  return projectRoot.replace(/[/.]/g, "-")
}

interface RawRecord {
  type?: string
  timestamp?: string
  sessionId?: string
  gitBranch?: string
  summary?: string
  message?: {
    model?: string
    usage?: {
      input_tokens?: number
      output_tokens?: number
      cache_read_input_tokens?: number
      cache_creation_input_tokens?: number
    }
    content?: Array<{ type?: string; name?: string }>
  }
}

/** A session whose last activity is within this window is treated as in-progress. */
const IN_PROGRESS_WINDOW_MS = 30 * 60 * 1000

function parseSessionFile(filePath: string, fallbackId: string): Session | null {
  let raw: string
  try {
    raw = fs.readFileSync(filePath, "utf-8")
  } catch {
    return null
  }

  let sessionId = fallbackId
  let branch = ""
  let model = "unknown"
  let firstTs: string | null = null
  let lastTs: string | null = null
  let summary: string | null = null
  const tokens: SessionTokens = { input: 0, output: 0, cacheRead: 0, cacheCreation: 0 }
  const toolsUsed = new Set<string>()
  let sawRecord = false

  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    let rec: RawRecord
    try {
      rec = JSON.parse(trimmed) as RawRecord
    } catch {
      continue // tolerate malformed / partial lines
    }
    sawRecord = true

    if (typeof rec.sessionId === "string") sessionId = rec.sessionId
    if (!branch && typeof rec.gitBranch === "string") branch = rec.gitBranch
    if (typeof rec.timestamp === "string") {
      if (!firstTs) firstTs = rec.timestamp
      lastTs = rec.timestamp
    }
    if (rec.type === "summary" && typeof rec.summary === "string") {
      summary = rec.summary
    }

    const msg = rec.message
    if (msg) {
      if (model === "unknown" && typeof msg.model === "string") model = msg.model
      const u = msg.usage
      if (u) {
        tokens.input += u.input_tokens ?? 0
        tokens.output += u.output_tokens ?? 0
        tokens.cacheRead += u.cache_read_input_tokens ?? 0
        tokens.cacheCreation += u.cache_creation_input_tokens ?? 0
      }
      if (Array.isArray(msg.content)) {
        for (const item of msg.content) {
          if (item?.type === "tool_use" && typeof item.name === "string") {
            toolsUsed.add(item.name)
          }
        }
      }
    }
  }

  if (!sawRecord || !firstTs) return null

  const startedAt = firstTs
  const endedAt = lastTs
  const durationMinutes =
    endedAt && startedAt
      ? Math.max(
          0,
          Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000),
        )
      : null
  const recent = endedAt ? Date.now() - new Date(endedAt).getTime() < IN_PROGRESS_WINDOW_MS : false
  const outcome: SessionOutcome = recent ? "in-progress" : "completed"

  return {
    sessionId,
    startedAt,
    endedAt,
    durationMinutes,
    model,
    branch,
    // Not present in Claude Code logs — degrade to null/empty (see Phase E seed).
    initiative: null,
    role: null,
    tokens,
    filesModified: [],
    commits: [],
    outcome,
    summary,
    toolsUsed: [...toolsUsed],
  }
}

/**
 * Read Claude Code sessions for a project, most recent first.
 * Returns `[]` if the project's log directory is absent or unreadable.
 * Never throws.
 */
export function readClaudeCodeSessions(opts?: {
  homeDir?: string
  projectRoot?: string
}): Session[] {
  const homeDir = opts?.homeDir ?? os.homedir()
  const projectRoot = opts?.projectRoot ?? process.cwd()
  const dir = path.join(homeDir, ".claude", "projects", encodeClaudeProjectDir(projectRoot))

  let files: string[]
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".jsonl"))
  } catch {
    return [] // no Claude Code logs for this project
  }

  const sessions: Session[] = []
  for (const file of files) {
    const session = parseSessionFile(path.join(dir, file), file.replace(/\.jsonl$/, ""))
    if (session) sessions.push(session)
  }

  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}
