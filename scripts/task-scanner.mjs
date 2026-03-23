#!/usr/bin/env node

/**
 * Scans Linear for tasks and returns structured data.
 * Replaces the filesystem-based scanner with Linear API queries.
 *
 * Usage:
 *   node scripts/task-scanner.mjs                    # list all tasks
 *   node scripts/task-scanner.mjs --status pending   # filter by status
 *   node scripts/task-scanner.mjs --id <identifier>  # get single task (e.g. SG-306)
 *   node scripts/task-scanner.mjs --role <role>      # filter by role
 *   node scripts/task-scanner.mjs --backend <backend> # filter by backend (from description metadata)
 *   node scripts/task-scanner.mjs --task-type <type> # filter by task-type
 *   node scripts/task-scanner.mjs --mode <mode>      # filter by mode
 *   node scripts/task-scanner.mjs --stale [hours]    # find stale dispatched tasks (default: 2h)
 *   node scripts/task-scanner.mjs --update <identifier> <field> <value>
 *
 * Env: SHERPA_LINEAR_API_KEY (required)
 */

import { LinearClient } from "@linear/sdk";

// ── State mapping ──────────────────────────────────────────────────

const STATE_TYPE_TO_STATUS = {
  triage: "pending",
  backlog: "pending",
  unstarted: "pending",
  started: "dispatched",
  completed: "completed",
  canceled: "failed",
  duplicate: "failed",
};

const STATUS_TO_STATE_TYPE = {
  pending: "backlog",
  dispatched: "started",
  completed: "completed",
  failed: "canceled",
  reviewed: "completed", // reviewed stays completed, verdict label distinguishes
};

const LINEAR_PRIORITY = { 1: "urgent", 2: "high", 3: "medium", 4: "low" };

// ── Client ─────────────────────────────────────────────────────────

function getClient() {
  const apiKey = process.env.SHERPA_LINEAR_API_KEY;
  if (!apiKey) {
    console.error("Error: SHERPA_LINEAR_API_KEY env var is required");
    process.exit(1);
  }
  return new LinearClient({ apiKey });
}

function parseIdentifier(id) {
  const match = id.match(/^([A-Za-z]+)-(\d+)$/);
  if (!match) return null;
  return { teamKey: match[1], number: parseInt(match[2], 10) };
}

// ── Issue → task shape ─────────────────────────────────────────────

async function issueToTask(issue) {
  const state = await issue.state;
  const labelsConn = await issue.labels();
  const labelMap = {};

  for (const label of labelsConn.nodes) {
    const parent = await label.parent;
    if (parent?.name) {
      labelMap[parent.name] = label.name;
    }
  }

  // Extract backend/model from structured metadata in description if present
  // Format: _Sherpa metadata: slug=X | backend=Y | model=Z | ..._
  let backend = "";
  let model = "";
  let budgetUsd = "1.00";
  const desc = issue.description ?? "";
  const metaMatch = desc.match(/_Sherpa metadata:([^_]+)_/);
  if (metaMatch) {
    const pairs = metaMatch[1].split("|").map((p) => p.trim());
    for (const pair of pairs) {
      const [k, v] = pair.split("=").map((s) => s.trim());
      if (k === "backend" && v && v !== "undefined") backend = v;
      if (k === "model" && v && v !== "default" && v !== "undefined") model = v;
      if (k === "budget-usd" && v) budgetUsd = v;
    }
  }

  return {
    id: issue.identifier,
    file: "",
    status: STATE_TYPE_TO_STATUS[state.type] ?? "pending",
    role: labelMap["Role"] ?? "engineer",
    backend,
    model,
    "task-type": labelMap["Task Type"] ?? "general",
    mode: labelMap["Mode"] ?? "supervised",
    priority: LINEAR_PRIORITY[issue.priority] ?? "medium",
    initiative: null,
    "budget-usd": budgetUsd,
    worktree: null,
    "dispatched-at": null,
    "completed-at": issue.completedAt?.toISOString() ?? null,
    body: desc,
  };
}

// ── Query functions ────────────────────────────────────────────────

async function queryTasks(filter = {}) {
  const client = getClient();
  const linearFilter = {};

  // If filtering by ID, use identifier-based query
  if (filter.id) {
    const parsed = parseIdentifier(filter.id);
    if (!parsed) {
      console.log("[]");
      return;
    }
    linearFilter.team = { key: { eq: parsed.teamKey } };
    linearFilter.number = { eq: parsed.number };
  }

  const issuesConnection = await client.issues({
    first: 100,
    filter: Object.keys(linearFilter).length > 0 ? linearFilter : undefined,
  });

  const tasks = [];
  for (const issue of issuesConnection.nodes) {
    const task = await issueToTask(issue);

    // Apply post-query filters
    if (filter.status && task.status !== filter.status) continue;
    if (filter.role && task.role !== filter.role) continue;
    if (filter.backend && task.backend !== filter.backend) continue;
    if (filter["task-type"] && task["task-type"] !== filter["task-type"]) continue;
    if (filter.mode && task.mode !== filter.mode) continue;

    tasks.push(task);
  }

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  tasks.sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));

  console.log(JSON.stringify(tasks, null, 2));
}

async function findStaleTasks(thresholdHours = 2) {
  const client = getClient();
  const now = Date.now();
  const thresholdMs = thresholdHours * 60 * 60 * 1000;

  // Query issues in "started" state (dispatched)
  const issuesConnection = await client.issues({
    first: 100,
    filter: { state: { type: { eq: "started" } } },
  });

  const stale = [];
  for (const issue of issuesConnection.nodes) {
    const updatedAt = issue.updatedAt?.getTime?.() ?? now;
    if (now - updatedAt > thresholdMs) {
      stale.push({
        id: issue.identifier,
        file: "",
        dispatchedAt: issue.updatedAt?.toISOString() ?? null,
        hoursElapsed: Math.round(((now - updatedAt) / 3600000) * 10) / 10,
        role: "unknown",
        backend: "",
      });
    }
  }

  console.log(JSON.stringify(stale, null, 2));
}

// ── Update function ────────────────────────────────────────────────

async function updateTask(identifier, field, value) {
  const client = getClient();
  const parsed = parseIdentifier(identifier);
  if (!parsed) {
    console.error(`Invalid identifier: ${identifier}`);
    process.exit(1);
  }

  // Find the issue
  const issuesConnection = await client.issues({
    first: 1,
    filter: {
      team: { key: { eq: parsed.teamKey } },
      number: { eq: parsed.number },
    },
  });

  const issue = issuesConnection.nodes[0];
  if (!issue) {
    console.error(`Task not found: ${identifier}`);
    process.exit(1);
  }

  if (field === "status") {
    const targetStateType = STATUS_TO_STATE_TYPE[value];
    if (!targetStateType) {
      console.error(`Unknown status: ${value}`);
      process.exit(1);
    }

    // Find the workflow state with the matching type
    const team = await issue.team;
    const states = await team.states();
    const targetState = states.nodes.find((s) => s.type === targetStateType);
    if (!targetState) {
      console.error(`No workflow state with type '${targetStateType}' found`);
      process.exit(1);
    }

    await client.updateIssue(issue.id, { stateId: targetState.id });
    console.log(JSON.stringify({ updated: identifier, field, value }));
  } else if (field === "judge-verdict") {
    // Update the Verdict label group
    await updateLabelGroup(client, issue, "Verdict", value);
    console.log(JSON.stringify({ updated: identifier, field, value }));
  } else if (field === "mode") {
    // Update the Mode label group
    await updateLabelGroup(client, issue, "Mode", value);
    console.log(JSON.stringify({ updated: identifier, field, value }));
  } else if (field === "dispatched-at" || field === "completed-at") {
    // Linear tracks these timestamps internally via state transitions.
    // No-op — print success for caller compatibility.
    console.log(JSON.stringify({ updated: identifier, field, value, note: "tracked by Linear state transitions" }));
  } else {
    // For unrecognized fields, post as a structured comment
    await client.createComment({
      issueId: issue.id,
      body: `**Sherpa field update:** \`${field}\` → \`${value ?? "null"}\``,
    });
    console.log(JSON.stringify({ updated: identifier, field, value }));
  }
}

async function updateLabelGroup(client, issue, groupName, labelName) {
  const team = await issue.team;
  const labelsConn = await team.labels();
  const existingLabelsConn = await issue.labels();

  // Remove existing labels from this group
  for (const label of existingLabelsConn.nodes) {
    const parent = await label.parent;
    if (parent?.name === groupName) {
      await issue.removeLabel(label.id);
    }
  }

  // Add the new label
  const targetLabel = labelsConn.nodes.find((l) => {
    // Match by name — we'll verify the parent group after
    return l.name === labelName;
  });

  if (targetLabel) {
    // Verify it belongs to the right group
    const parent = await targetLabel.parent;
    if (parent?.name === groupName) {
      await issue.addLabel(targetLabel.id);
    }
  }
}

// ── CLI ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args[0] === "--stale") {
  const hours = args[1] && !args[1].startsWith("--") ? parseFloat(args[1]) : 2;
  if (isNaN(hours) || hours < 0) {
    console.error("--stale requires a non-negative number of hours");
    process.exit(1);
  }
  findStaleTasks(hours).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
} else if (args[0] === "--update" && args.length >= 4) {
  updateTask(args[1], args[2], args[3]).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
} else {
  const filter = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === "--status") filter.status = args[i + 1];
    if (args[i] === "--id") filter.id = args[i + 1];
    if (args[i] === "--role") filter.role = args[i + 1];
    if (args[i] === "--backend") filter.backend = args[i + 1];
    if (args[i] === "--task-type") filter["task-type"] = args[i + 1];
    if (args[i] === "--mode") filter.mode = args[i + 1];
  }
  queryTasks(filter).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
