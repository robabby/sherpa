#!/usr/bin/env node
/**
 * One-time migration: import existing task files to Linear.
 * Usage: Set SHERPA_LINEAR_API_KEY in .env.local, then:
 *   set -a && source .env.local && set +a && node scripts/linear-import-tasks.mjs
 */
import { LinearClient } from "@linear/sdk";
import fs from "fs";
import path from "path";

const TASKS_DIR = path.resolve(process.cwd(), "docs/tasks");

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      meta[key] = val === "null" ? null : val;
    }
  }
  return { meta, body: match[2] };
}

const PRIORITY_MAP = { urgent: 1, high: 2, medium: 3, low: 4 };

async function main() {
  const apiKey = process.env.SHERPA_LINEAR_API_KEY;
  if (!apiKey) { console.error("Set SHERPA_LINEAR_API_KEY"); process.exit(1); }

  const client = new LinearClient({ apiKey });
  const teams = await client.teams();
  const team = teams.nodes[0];
  if (!team) { console.error("No team found"); process.exit(1); }

  // Fetch existing labels for task-type mapping
  const labels = await client.issueLabels({ first: 250 });
  const labelByName = new Map(labels.nodes.map((l) => [l.name, l.id]));

  const files = fs.readdirSync(TASKS_DIR)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();

  console.log(`Importing ${files.length} tasks to Linear team "${team.name}"...\n`);

  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const content = fs.readFileSync(path.join(TASKS_DIR, file), "utf-8");
    const { meta, body } = parseFrontmatter(content);
    const title = body.match(/^#\s+(.+)/m)?.[1] ?? meta.id ?? file.replace(".md", "");
    const priority = PRIORITY_MAP[meta.priority] ?? 3;

    // Collect label IDs — task-type only (role labels share the same
    // Linear group as task-type, so applying both causes a conflict)
    const labelIds = [];
    if (meta["task-type"] && labelByName.has(meta["task-type"])) {
      labelIds.push(labelByName.get(meta["task-type"]));
    }
    if (meta.mode && labelByName.has(meta.mode)) {
      labelIds.push(labelByName.get(meta.mode));
    }
    // Deduplicate (e.g. role === task-type)
    const uniqueLabelIds = [...new Set(labelIds)];

    // Build description with Sherpa metadata header
    const sherpaHeader = [
      `> **Sherpa Task:** \`${meta.id ?? file.replace(".md", "")}\``,
      meta.backend ? `> **Backend:** ${meta.backend}` : null,
      meta.status ? `> **Original Status:** ${meta.status}` : null,
      meta.initiative ? `> **Initiative:** ${meta.initiative}` : null,
    ].filter(Boolean).join("\n");

    const description = `${sherpaHeader}\n\n${body}`;

    try {
      const result = await client.createIssue({
        teamId: team.id,
        title,
        description,
        priority,
        labelIds: uniqueLabelIds.length > 0 ? uniqueLabelIds : undefined,
      });
      const issue = await result.issue;
      console.log(`  + ${file} → ${issue?.identifier ?? "?"} (${meta.status ?? "unknown"})`);
      imported++;
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nDone. Imported: ${imported}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
