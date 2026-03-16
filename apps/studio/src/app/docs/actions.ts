"use server";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";

const WEB_ROOT = process.cwd();
const MONOREPO_ROOT = path.resolve(WEB_ROOT, "../..");

/** Allowed source path prefixes to prevent path traversal. */
const ALLOWED_PREFIXES = ["docs/", ".claude/rules/"];

/**
 * Mark a document as human-reviewed by setting `reviewed-by: human`
 * and `last-verified: YYYY-MM-DD` in its frontmatter.
 */
export async function markDocReviewed(
  relativePath: string,
): Promise<{ success: boolean; error?: string }> {
  // Validate path prefix
  if (!ALLOWED_PREFIXES.some((p) => relativePath.startsWith(p))) {
    return { success: false, error: `Path not allowed: ${relativePath}` };
  }

  const absPath = path.resolve(MONOREPO_ROOT, relativePath);

  // Prevent path traversal
  if (!absPath.startsWith(MONOREPO_ROOT)) {
    return { success: false, error: "Path traversal detected" };
  }

  if (!fs.existsSync(absPath)) {
    return { success: false, error: `File not found: ${relativePath}` };
  }

  try {
    const raw = fs.readFileSync(absPath, "utf-8");
    const { data: frontmatter, content } = matter(raw);

    frontmatter["reviewed-by"] = "human";
    frontmatter["last-verified"] = new Date().toISOString().slice(0, 10);

    const updated = matter.stringify(content, frontmatter);
    fs.writeFileSync(absPath, updated, "utf-8");

    revalidatePath("/docs");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
