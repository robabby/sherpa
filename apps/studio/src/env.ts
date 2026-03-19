/**
 * Environment variable validation for Studio auth.
 * Fails fast on missing required vars in production.
 */
function required(key: string): string {
  const value = process.env[key]
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value ?? ""
}

export const env = {
  BETTER_AUTH_SECRET: required("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
} as const
