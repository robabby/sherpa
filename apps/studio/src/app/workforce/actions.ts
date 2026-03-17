"use server";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";

import { behavioralAgentFrontmatterSchema } from "@/lib/studio/schemas";

const WEB_ROOT = process.cwd();
const MONOREPO_ROOT = path.resolve(WEB_ROOT, "../..");
const CACHE_ROOT = path.resolve(WEB_ROOT, ".studio-cache");

const ALLOWED_PREFIXES = ["docs/agents/roles/"];

export async function updateAgentRole(
  slug: string,
  updates: { frontmatter?: Record<string, unknown>; body?: string },
): Promise<{ success: boolean; error?: string }> {
  if (process.env.NODE_ENV !== "development") {
    return { success: false, error: "Editing is only available in development" };
  }

  const relativePath = `docs/agents/roles/${slug}.md`;
  const normalized = path.normalize(relativePath);

  if (
    normalized.includes("..") ||
    !ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  ) {
    return { success: false, error: "Invalid path" };
  }

  try {
    const realPath = path.resolve(MONOREPO_ROOT, normalized);
    if (!fs.existsSync(realPath)) {
      return { success: false, error: "Role file not found" };
    }

    const rawContent = fs.readFileSync(realPath, "utf-8");
    const parsed = matter(rawContent);

    // Merge frontmatter updates
    if (updates.frontmatter) {
      Object.assign(parsed.data, updates.frontmatter);
    }

    // Validate merged frontmatter
    const result = behavioralAgentFrontmatterSchema.safeParse(parsed.data);
    if (!result.success) {
      return {
        success: false,
        error: `Validation failed: ${result.error.issues.map((i) => i.message).join(", ")}`,
      };
    }

    // Update body if provided
    const content = updates.body !== undefined ? `# ${parsed.data["display-name"]}\n\n${updates.body}` : parsed.content;

    // Write back to real file
    const updated = matter.stringify(content, parsed.data);
    fs.writeFileSync(realPath, updated, "utf-8");

    // Update cache copy
    const cachePath = path.resolve(CACHE_ROOT, normalized);
    if (fs.existsSync(path.dirname(cachePath))) {
      fs.writeFileSync(cachePath, updated, "utf-8");
    }

    revalidatePath("/workforce");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
