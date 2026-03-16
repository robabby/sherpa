import type Database from "better-sqlite3"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AcquireInput {
  scope: string
  agentId: string
  taskId?: string
  ttlSeconds?: number
  transferFrom?: string
  mode?: "exclusive" | "shared"
}

export interface AcquireResult {
  acquired: boolean
  fenceToken?: number
  expiresAt?: string
  heldBy?: string
  heldUntil?: string
}

export interface ReleaseInput {
  scope: string
  agentId: string
  fenceToken: number
}

export interface ReleaseResult {
  released: boolean
  reason?: string
}

export interface RenewInput {
  scope: string
  agentId: string
  fenceToken: number
  ttlSeconds?: number
}

export interface RenewResult {
  renewed: boolean
  expiresAt?: string
  reason?: string
}

export interface LeaseInfo {
  scope: string
  agentId: string
  taskId: string | null
  fenceToken: number
  mode: string
  ttlSeconds: number
  acquiredAt: string
  expiresAt: string
  renewedAt: string | null
}

// ---------------------------------------------------------------------------
// Default TTLs
// ---------------------------------------------------------------------------

const DEFAULT_TTL_INTERACTIVE = 1800 // 30 minutes

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/** Acquire authority over a scope. Uses BEGIN IMMEDIATE for write safety. */
export function acquireAuthority(db: Database.Database, input: AcquireInput): AcquireResult {
  const ttl = input.ttlSeconds ?? DEFAULT_TTL_INTERACTIVE
  const mode = input.mode ?? "exclusive"

  return db.transaction(() => {
    // Check for existing unexpired lease
    const existing = db.prepare(`
      SELECT agent_id, fence_token, expires_at
      FROM authority_leases
      WHERE scope = ? AND expires_at > datetime('now')
    `).get(input.scope) as { agent_id: string; fence_token: number; expires_at: string } | undefined

    if (existing) {
      // Transfer: current holder must match transferFrom
      if (input.transferFrom && existing.agent_id === input.transferFrom) {
        db.prepare("DELETE FROM authority_leases WHERE scope = ?").run(input.scope)
      } else {
        return {
          acquired: false,
          heldBy: existing.agent_id,
          heldUntil: existing.expires_at,
        }
      }
    } else {
      // Clean up any expired lease still occupying the primary key
      db.prepare("DELETE FROM authority_leases WHERE scope = ? AND expires_at <= datetime('now')").run(input.scope)
    }

    // Get next fence token (globally monotonic)
    db.prepare("UPDATE fence_token_seq SET current_value = current_value + 1").run()
    const { current_value: fenceToken } = db.prepare(
      "SELECT current_value FROM fence_token_seq"
    ).get() as { current_value: number }

    const { now } = db.prepare("SELECT datetime('now') as now").get() as { now: string }
    const { expiresAt } = db.prepare(
      "SELECT datetime('now', '+' || ? || ' seconds') as expiresAt"
    ).get(ttl) as { expiresAt: string }

    db.prepare(`
      INSERT INTO authority_leases (scope, agent_id, task_id, fence_token, mode, ttl_seconds, acquired_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(input.scope, input.agentId, input.taskId ?? null, fenceToken, mode, ttl, now, expiresAt)

    return { acquired: true, fenceToken, expiresAt }
  }).immediate()
}

/** Release authority over a scope. Validates fence token. */
export function releaseAuthority(db: Database.Database, input: ReleaseInput): ReleaseResult {
  return db.transaction(() => {
    const existing = db.prepare(`
      SELECT agent_id, fence_token, expires_at FROM authority_leases WHERE scope = ?
    `).get(input.scope) as { agent_id: string; fence_token: number; expires_at: string } | undefined

    if (!existing) {
      return { released: false, reason: "not_found" }
    }

    // Check if expired
    const { expired } = db.prepare(
      "SELECT ? <= datetime('now') as expired"
    ).get(existing.expires_at) as { expired: number }
    if (expired) {
      return { released: false, reason: "expired" }
    }

    if (existing.agent_id !== input.agentId) {
      return { released: false, reason: "not_owner" }
    }

    if (existing.fence_token !== input.fenceToken) {
      return { released: false, reason: "invalid_fence_token" }
    }

    db.prepare("DELETE FROM authority_leases WHERE scope = ?").run(input.scope)
    return { released: true }
  }).immediate()
}

/** Renew (extend) an authority lease. Validates fence token. */
export function renewAuthority(db: Database.Database, input: RenewInput): RenewResult {
  return db.transaction(() => {
    const existing = db.prepare(`
      SELECT agent_id, fence_token, expires_at, ttl_seconds
      FROM authority_leases
      WHERE scope = ? AND expires_at > datetime('now')
    `).get(input.scope) as { agent_id: string; fence_token: number; expires_at: string; ttl_seconds: number } | undefined

    if (!existing) {
      return { renewed: false, reason: "not_found_or_expired" }
    }

    if (existing.agent_id !== input.agentId) {
      return { renewed: false, reason: "not_owner" }
    }

    if (existing.fence_token !== input.fenceToken) {
      return { renewed: false, reason: "invalid_fence_token" }
    }

    const ttl = input.ttlSeconds ?? existing.ttl_seconds
    const { now } = db.prepare("SELECT datetime('now') as now").get() as { now: string }
    const { expiresAt } = db.prepare(
      "SELECT datetime('now', '+' || ? || ' seconds') as expiresAt"
    ).get(ttl) as { expiresAt: string }

    db.prepare(`
      UPDATE authority_leases SET expires_at = ?, renewed_at = ?, ttl_seconds = ? WHERE scope = ?
    `).run(expiresAt, now, ttl, input.scope)

    return { renewed: true, expiresAt }
  }).immediate()
}

/** Check authority state for a scope (read-only). */
export function checkAuthority(db: Database.Database, scope: string): LeaseInfo | null {
  const row = db.prepare(`
    SELECT scope, agent_id, task_id, fence_token, mode, ttl_seconds, acquired_at, expires_at, renewed_at
    FROM authority_leases
    WHERE scope = ? AND expires_at > datetime('now')
  `).get(scope) as any | undefined

  if (!row) return null

  return {
    scope: row.scope,
    agentId: row.agent_id,
    taskId: row.task_id,
    fenceToken: row.fence_token,
    mode: row.mode,
    ttlSeconds: row.ttl_seconds,
    acquiredAt: row.acquired_at,
    expiresAt: row.expires_at,
    renewedAt: row.renewed_at,
  }
}

/** List all active (unexpired) leases. */
export function listActiveLeases(db: Database.Database, agentId?: string): LeaseInfo[] {
  const query = agentId
    ? "SELECT * FROM authority_leases WHERE expires_at > datetime('now') AND agent_id = ?"
    : "SELECT * FROM authority_leases WHERE expires_at > datetime('now')"

  const rows = agentId
    ? db.prepare(query).all(agentId)
    : db.prepare(query).all()

  return (rows as any[]).map((row) => ({
    scope: row.scope,
    agentId: row.agent_id,
    taskId: row.task_id,
    fenceToken: row.fence_token,
    mode: row.mode,
    ttlSeconds: row.ttl_seconds,
    acquiredAt: row.acquired_at,
    expiresAt: row.expires_at,
    renewedAt: row.renewed_at,
  }))
}

/** Delete all expired leases. Returns count of reaped rows. */
export function reapExpiredLeases(db: Database.Database): number {
  return db.transaction(() => {
    const result = db.prepare(
      "DELETE FROM authority_leases WHERE expires_at <= datetime('now')"
    ).run()
    return result.changes
  }).immediate()
}

/** Release all leases held by an agent. Used on session end. */
export function releaseAllForAgent(db: Database.Database, agentId: string): number {
  return db.transaction(() => {
    const result = db.prepare(
      "DELETE FROM authority_leases WHERE agent_id = ?"
    ).run(agentId)
    return result.changes
  }).immediate()
}
