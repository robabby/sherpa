// ---------------------------------------------------------------------------
// Dispatch metadata — browser-safe (no Node.js imports).
// Shared between server-side dispatch logic and client-side UI components.
// ---------------------------------------------------------------------------

export type Backend =
  // CLI backends
  | 'claude' | 'opencode' | 'codex' | 'gemini' | 'lm-studio'
  // API backends
  | 'groq' | 'google-ai' | 'lm-studio-api'

export type BackendType = 'cli' | 'api'

export interface BackendMeta {
  type: BackendType
  displayName: string
  /** AI SDK provider key. Only for API backends. */
  provider?: string
  /** Env var required for this backend. Null = no key needed (local). */
  envKey?: string | null
}

export const BACKEND_META: Record<Backend, BackendMeta> = {
  // CLI
  'claude':         { type: 'cli', displayName: 'Claude' },
  'opencode':       { type: 'cli', displayName: 'OpenCode' },
  'codex':          { type: 'cli', displayName: 'Codex' },
  'gemini':         { type: 'cli', displayName: 'Gemini' },
  'lm-studio':      { type: 'cli', displayName: 'LM Studio' },
  // API
  'groq':           { type: 'api', displayName: 'Groq',            provider: 'groq',     envKey: 'GROQ_API_KEY' },
  'google-ai':      { type: 'api', displayName: 'Google AI',       provider: 'google',   envKey: 'GOOGLE_GENERATIVE_AI_API_KEY' },
  'lm-studio-api':  { type: 'api', displayName: 'LM Studio (API)', provider: 'lmstudio', envKey: null },
}
