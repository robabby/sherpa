"use server"

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { revalidatePath } from "next/cache"

import { behavioralAgentFrontmatterSchema } from "@/lib/studio/schemas"

// Resolve project root from sherpa.config.ts location
const APP_ROOT = process.cwd()
const PROJECT_ROOT = path.resolve(APP_ROOT, "../..")

const ALLOWED_PREFIXES = ["docs/agents/roles/"]

export async function updateAgentRole(
  slug: string,
  updates: { frontmatter?: Record<string, unknown>; body?: string },
): Promise<{ success: boolean; error?: string }> {
  if (process.env.NODE_ENV !== "development") {
    return { success: false, error: "Editing is only available in development" }
  }

  const relativePath = `docs/agents/roles/${slug}.md`
  const normalized = path.normalize(relativePath)

  if (
    normalized.includes("..") ||
    !ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  ) {
    return { success: false, error: "Invalid path" }
  }

  try {
    const realPath = path.resolve(PROJECT_ROOT, normalized)
    if (!fs.existsSync(realPath)) {
      return { success: false, error: "Role file not found" }
    }

    const rawContent = fs.readFileSync(realPath, "utf-8")
    const parsed = matter(rawContent)

    if (updates.frontmatter) {
      Object.assign(parsed.data, updates.frontmatter)
    }

    const result = behavioralAgentFrontmatterSchema.safeParse(parsed.data)
    if (!result.success) {
      return {
        success: false,
        error: `Validation failed: ${result.error.issues.map((i) => i.message).join(", ")}`,
      }
    }

    const content =
      updates.body !== undefined
        ? `# ${parsed.data["display-name"]}\n\n${updates.body}`
        : parsed.content

    const updated = matter.stringify(content, parsed.data)
    fs.writeFileSync(realPath, updated, "utf-8")

    revalidatePath("/workforce")

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}
