import { createHmac, timingSafeEqual } from "node:crypto"

const SEPARATOR = "."

/**
 * Generate a deterministic, tamper-proof share token for a research document.
 *
 * Token format: {base64url(project:relativePath)}.{hmac-hex-16}
 * The payload is reversible; the HMAC signature prevents forgery.
 */
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

/**
 * Resolve a share token back to its project and file path.
 * Returns null if the token is malformed, tampered, or signed with a different secret.
 */
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

  if (
    sig.length !== expectedSig.length ||
    !timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
  ) return null

  const colonIndex = payload.indexOf(":")
  if (colonIndex === -1) return null

  return {
    project: payload.slice(0, colonIndex),
    relativePath: payload.slice(colonIndex + 1),
  }
}
