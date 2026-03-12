"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const MONOREPO_ROOT = path.resolve(process.cwd(), "../..");
const CACHE_ROOT = path.resolve(process.cwd(), ".studio-cache");
const LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions";
const LM_STUDIO_MODEL = "qwen2.5-coder-7b-instruct";

interface AutomationResult {
  success: boolean;
  tasks: string[];
  error?: string;
}

async function callLmStudio(prompt: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(LM_STUDIO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LM_STUDIO_MODEL,
        messages: [{ role: "user", content: prompt + " /no_think" }],
        temperature: 0.3,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

function writeFileWithCache(relativePath: string, content: string) {
  const realPath = path.resolve(MONOREPO_ROOT, relativePath);
  fs.mkdirSync(path.dirname(realPath), { recursive: true });
  fs.writeFileSync(realPath, content, "utf-8");

  const cachePath = path.resolve(CACHE_ROOT, relativePath);
  if (fs.existsSync(path.dirname(cachePath))) {
    fs.writeFileSync(cachePath, content, "utf-8");
  }
}

function readProjectFile(relativePath: string): string | null {
  try {
    return fs.readFileSync(path.resolve(MONOREPO_ROOT, relativePath), "utf-8");
  } catch {
    return null;
  }
}

export async function runPostApproval(
  slug: string,
  _source: string,
): Promise<AutomationResult> {
  const completed: string[] = [];
  const today = new Date().toISOString().split("T")[0];

  // 1. Create activity.md if it doesn't exist
  const activityPath = `docs/initiatives/${slug}/activity.md`;
  const existingActivity = readProjectFile(activityPath);

  if (!existingActivity) {
    const activityContent = [
      "---",
      `started: ${today}`,
      "worktree: null",
      "---",
      "",
      `# ${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
      "",
      "## Activity Log",
      "",
      `- **${today}** — Proposal approved`,
      "",
    ].join("\n");

    writeFileWithCache(activityPath, activityContent);
    completed.push(`Created activity log: ${activityPath}`);
  } else {
    completed.push("Activity log already exists — skipped");
  }

  // 2. Scaffold plan.md if missing
  const planPath = `docs/initiatives/${slug}/plan.md`;
  const existingPlan = readProjectFile(planPath);

  if (!existingPlan) {
    const proposalSource = readProjectFile(`docs/initiatives/${slug}/proposal.md`);
    let planContent: string | null = null;

    if (proposalSource) {
      planContent = await callLmStudio(
        `You are a technical planner. Read this approved proposal and generate a plan skeleton in markdown. Include:\n- A title "# <Name> — Implementation Plan"\n- A "## Goal" section (1 sentence)\n- A "## Tasks" section with 3-5 numbered placeholder tasks as "### Task N: <name>" with a brief description\n- A "## Verification" section listing what to check\n\nOutput ONLY the markdown, no commentary.\n\n${proposalSource.slice(0, 4000)}`
      );
    }

    if (planContent && planContent.length > 50) {
      writeFileWithCache(planPath, planContent.trim() + "\n");
      completed.push(`Scaffolded plan: ${planPath} (via LM Studio)`);
    } else {
      // Fallback: minimal skeleton
      const fallback = [
        `# ${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Implementation Plan`,
        "",
        "## Goal",
        "",
        "<!-- Fill in from the approved proposal -->",
        "",
        "## Tasks",
        "",
        "### Task 1: TBD",
        "",
        "### Task 2: TBD",
        "",
        "## Verification",
        "",
        "- [ ] `pnpm check` passes",
        "",
      ].join("\n");

      writeFileWithCache(planPath, fallback);
      completed.push(`Scaffolded plan skeleton: ${planPath} (LM Studio unavailable — manual fill needed)`);
    }
  } else {
    completed.push("Plan already exists — skipped");
  }

  revalidatePath("/process");

  const hadLmStudioError = completed.some((t) => t.includes("unavailable"));

  return {
    success: true,
    tasks: completed,
    error: hadLmStudioError
      ? "LM Studio was unreachable for some tasks. Scaffolds created with placeholders."
      : undefined,
  };
}
