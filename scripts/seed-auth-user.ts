#!/usr/bin/env -S pnpm exec tsx
/**
 * Seed an admin user for Better Auth.
 *
 * Usage:
 *   pnpm exec tsx scripts/seed-auth-user.ts --email "$AUTH_ADMIN_EMAIL" --password "$AUTH_ADMIN_PASSWORD" --name Rob
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
    password: { type: "string" },
    name: { type: "string", default: "Admin" },
  },
})

if (!values.email || !values.password) {
  console.error("Usage: pnpm exec tsx scripts/seed-auth-user.ts --email <email> --password <pw> --name <name>")
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

const result = await auth.api.signUpEmail({
  body: {
    email: values.email,
    password: values.password,
    name: values.name,
  },
})

if ("error" in result && result.error) {
  console.error("Failed to create user:", result.error)
  process.exit(1)
}

console.log(`User created: ${values.email}`)
console.log(`You can now sign in at http://localhost:3000/auth/sign-in`)
