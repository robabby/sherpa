import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { apiKey } from "@better-auth/api-key"
import Database from "better-sqlite3"
import path from "node:path"
import fs from "node:fs"
import { env } from "@/env"

function resolveProjectRoot(): string {
  // Explicit env var takes priority
  if (process.env.SHERPA_PROJECT_ROOT) return process.env.SHERPA_PROJECT_ROOT

  // Walk up from cwd looking for pnpm-workspace.yaml (monorepo root marker)
  let dir = process.cwd()
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir
    dir = path.dirname(dir)
  }

  return process.cwd()
}

const projectRoot = resolveProjectRoot()
const dbPath = path.join(projectRoot, ".sherpa", "auth.db")

// Ensure directory exists (Better Auth's Kysely adapter doesn't create it)
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

export const auth = betterAuth({
  database: new Database(dbPath),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh daily
  },
  plugins: [
    apiKey({
      defaultPrefix: "sk_sherpa_",
    }),
    nextCookies(),
  ],
})
