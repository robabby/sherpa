import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { apiKey } from "@better-auth/api-key"
import Database from "better-sqlite3"
import path from "node:path"
import { env } from "@/env"

const projectRoot = process.env.SHERPA_PROJECT_ROOT ?? process.cwd()
const dbPath = path.join(projectRoot, ".sherpa", "auth.db")

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
