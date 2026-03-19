"use server";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";

const WEB_ROOT = process.cwd();
const MONOREPO_ROOT = path.resolve(WEB_ROOT, "../..");
const CACHE_ROOT = path.resolve(WEB_ROOT, ".studio-cache");

/** Allowed source path prefixes to prevent path traversal. */
const ALLOWED_PREFIXES = [
  "docs/initiatives/",
];

/** Valid statuses per node kind. */
const VALID_STATUSES: Record<string, string[]> = {
  initiative: ["pending", "approved", "in-progress", "integrated", "declined", "archived"],
  seed: ["seed", "launched"],
};

export async function updateNodeStatus(
  source: string,
  kind: string,
  newStatus: string,
): Promise<{ success: boolean; error?: string }> {
  // Validate kind supports status editing
  const validStatuses = VALID_STATUSES[kind];
  if (!validStatuses) {
    return { success: false, error: `Status editing not supported for ${kind}` };
  }

  // Validate status value
  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: `Invalid status "${newStatus}" for ${kind}` };
  }

  // Validate source path (prevent path traversal)
  const normalized = path.normalize(source);
  if (
    normalized.includes("..") ||
    !ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  ) {
    return { success: false, error: "Invalid source path" };
  }

  try {
    // Read from the real monorepo file
    const realPath = path.resolve(MONOREPO_ROOT, normalized);
    if (!fs.existsSync(realPath)) {
      return { success: false, error: "Source file not found" };
    }

    const rawContent = fs.readFileSync(realPath, "utf-8");
    const parsed = matter(rawContent);

    // Update the status field
    parsed.data.status = newStatus;
    parsed.data.updated = new Date().toISOString().split("T")[0];

    // Write back to real file
    const updated = matter.stringify(parsed.content, parsed.data);
    fs.writeFileSync(realPath, updated, "utf-8");

    // Update cache copy
    const cachePath = path.resolve(CACHE_ROOT, normalized);
    if (fs.existsSync(path.dirname(cachePath))) {
      fs.writeFileSync(cachePath, updated, "utf-8");
    }

    // Revalidate the process page
    revalidatePath("/process");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function archiveInitiative(
  slug: string,
): Promise<{ success: boolean; error?: string }> {
  // Validate slug (no slashes, no dots, no traversal)
  if (!slug || slug.includes("/") || slug.includes("..") || slug.startsWith(".")) {
    return { success: false, error: "Invalid initiative slug" };
  }

  try {
    const srcDir = path.resolve(MONOREPO_ROOT, "docs/initiatives", slug);
    const archiveDir = path.resolve(MONOREPO_ROOT, "docs/initiatives/.archive");
    const destDir = path.resolve(archiveDir, slug);

    if (!fs.existsSync(srcDir)) {
      return { success: false, error: `Initiative "${slug}" not found` };
    }

    if (fs.existsSync(destDir)) {
      return { success: false, error: `Archive already contains "${slug}"` };
    }

    // Update proposal.md status to archived before moving
    const proposalPath = path.resolve(srcDir, "proposal.md");
    if (fs.existsSync(proposalPath)) {
      const rawContent = fs.readFileSync(proposalPath, "utf-8");
      const parsed = matter(rawContent);
      parsed.data.status = "archived";
      parsed.data.updated = new Date().toISOString().split("T")[0];
      fs.writeFileSync(proposalPath, matter.stringify(parsed.content, parsed.data), "utf-8");
    }

    // Ensure .archive/ directory exists
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    // Move directory
    fs.renameSync(srcDir, destDir);

    revalidatePath("/process");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function restoreInitiative(
  slug: string,
): Promise<{ success: boolean; error?: string }> {
  if (!slug || slug.includes("/") || slug.includes("..") || slug.startsWith(".")) {
    return { success: false, error: "Invalid initiative slug" };
  }

  try {
    const srcDir = path.resolve(MONOREPO_ROOT, "docs/initiatives/.archive", slug);
    const destDir = path.resolve(MONOREPO_ROOT, "docs/initiatives", slug);

    if (!fs.existsSync(srcDir)) {
      return { success: false, error: `Archived initiative "${slug}" not found` };
    }

    if (fs.existsSync(destDir)) {
      return { success: false, error: `Active initiative "${slug}" already exists` };
    }

    // Update proposal.md status back to pending
    const proposalPath = path.resolve(srcDir, "proposal.md");
    if (fs.existsSync(proposalPath)) {
      const rawContent = fs.readFileSync(proposalPath, "utf-8");
      const parsed = matter(rawContent);
      parsed.data.status = "pending";
      parsed.data.updated = new Date().toISOString().split("T")[0];
      fs.writeFileSync(proposalPath, matter.stringify(parsed.content, parsed.data), "utf-8");
    }

    // Move directory back
    fs.renameSync(srcDir, destDir);

    revalidatePath("/process");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

