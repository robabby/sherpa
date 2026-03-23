/**
 * Linear API Client
 *
 * Factory and singleton accessor for the Linear SDK client.
 * All Linear integration modules import from here.
 */

import { LinearClient } from "@linear/sdk"

// ── Types ──────────────────────────────────────────────────────────

export interface CreateLinearClientOpts {
  /** Linear API key. Falls back to SHERPA_LINEAR_API_KEY env var. */
  apiKey?: string
}

// ── Singleton cache ────────────────────────────────────────────────

let cachedClient: LinearClient | null = null

// ── Public API ─────────────────────────────────────────────────────

/**
 * Create a new LinearClient instance.
 * Reads the API key from `opts.apiKey` or the `SHERPA_LINEAR_API_KEY`
 * environment variable. Throws if neither is set.
 */
export function createLinearClient(opts?: CreateLinearClientOpts): LinearClient {
  const apiKey = opts?.apiKey ?? process.env.SHERPA_LINEAR_API_KEY
  if (!apiKey) {
    throw new Error(
      "Linear API key not found. Set SHERPA_LINEAR_API_KEY or pass { apiKey } to createLinearClient()."
    )
  }
  return new LinearClient({ apiKey })
}

/**
 * Return a cached singleton LinearClient, creating it on first call.
 * Uses `createLinearClient()` internally (reads env var).
 */
export function getLinearClient(): LinearClient {
  if (!cachedClient) {
    cachedClient = createLinearClient()
  }
  return cachedClient
}

/**
 * Clear the cached singleton (useful in tests).
 */
export function resetLinearClient(): void {
  cachedClient = null
}
