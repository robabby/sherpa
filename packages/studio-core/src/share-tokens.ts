import { createHmac } from "node:crypto"

const SEPARATOR = "."

export function generateShareToken(
  secret: string,
  project: string,
  relativePath: string,
): string {
  const payload = `${project}:${relativePath}`
  const encoded = Buffer.from(payload).toString("base64url")
  const sig = createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .slice(0, 16)
  return `${encoded}${SEPARATOR}${sig}`
}

export function resolveShareToken(
  secret: string,
  token: string,
): { project: string; relativePath: string } | null {
  const dotIndex = token.lastIndexOf(SEPARATOR)
  if (dotIndex <= 0) return null

  const encoded = token.slice(0, dotIndex)
  const sig = token.slice(dotIndex + 1)

  let payload: string
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf-8")
  } catch {
    return null
  }

  const expectedSig = createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .slice(0, 16)

  if (sig !== expectedSig) return null

  const colonIndex = payload.indexOf(":")
  if (colonIndex === -1) return null

  return {
    project: payload.slice(0, colonIndex),
    relativePath: payload.slice(colonIndex + 1),
  }
}
