#!/usr/bin/env -S pnpm exec tsx
/**
 * Generate an API key for an agent.
 *
 * Usage:
 *   pnpm dlx tsx scripts/generate-api-key.ts --email "$AUTH_ADMIN_EMAIL" --name "Luna"
 *
 * Requires BETTER_AUTH_SECRET in environment (from .env.local or .env.production).
 */
import { betterAuth } from "better-auth"
import { apiKey } from "@better-auth/api-key"
import Database from "better-sqlite3"
import path from "node:path"
import { parseArgs } from "node:util"

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string", default: "Agent" },
  },
})

if (!values.email) {
  console.error("Usage: pnpm dlx tsx scripts/generate-api-key.ts --email <owner-email> --name <key-name>")
  process.exit(1)
}

if (!process.env.BETTER_AUTH_SECRET) {
  console.error("Error: BETTER_AUTH_SECRET must be set in environment")
  process.exit(1)
}

const projectRoot = process.env.SHERPA_PROJECT_ROOT ?? process.cwd()
const dbPath = path.join(projectRoot, ".sherpa", "auth.db")

const auth = betterAuth({
  database: new Database(dbPath),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
  plugins: [apiKey({ defaultPrefix: "sk_sherpa_" })],
})

// Run migrations (in case auth.db is fresh)
const ctx = await auth.$context
await ctx.runMigrations()

// Find the user
const db = new Database(dbPath)
const user = db.prepare("SELECT id FROM user WHERE email = ?").get(values.email) as { id: string } | undefined
if (!user) {
  console.error(`User not found: ${values.email}`)
  console.error(`Run seed-auth-user.ts first to create the user.`)
  process.exit(1)
}

// Create API key via the auth API
const result = await auth.api.createApiKey({
  body: {
    name: values.name,
    userId: user.id,
  },
})

if (!result || !("key" in result)) {
  console.error("Failed to create API key:", result)
  process.exit(1)
}

console.log(`API key created for ${values.name}:`)
console.log(`  Key: ${result.key}`)
console.log(``)
console.log(`Store this key securely — it cannot be retrieved again.`)
console.log(`Set it as MCP_API_KEY in the agent's environment on the VPS.`)
