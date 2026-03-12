import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface McpServerConfig {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

export interface McpToolInfo {
  name: string;
  description: string;
  domain: "tasks" | "infrastructure";
  paramCount: number;
  params: string[];
}

export interface LmStudioStatus {
  available: boolean;
  models: string[];
  error: string | null;
}

export interface McpEvent {
  ts: string;
  event: string;
  data: Record<string, unknown>;
  taskSlug: string;
}

export interface McpDashboardData {
  server: McpServerConfig | null;
  tools: McpToolInfo[];
  lmStudio: LmStudioStatus;
  events: McpEvent[];
  configPath: string;
}

export interface McpDashboardOptions {
  /** Absolute path to the project root. */
  projectRoot?: string;
  /** Relative path from project root to .mcp.json config. */
  mcpConfigPath?: string;
  /** Relative path from project root to task logs directory. */
  taskLogsPath?: string;
  /** LM Studio API base URL. */
  lmStudioUrl?: string;
}

// ---------------------------------------------------------------------------
// Static tool catalog (mirrors MCP server tool definitions)
// ---------------------------------------------------------------------------

const TOOL_CATALOG: McpToolInfo[] = [
  {
    name: "task_list",
    description:
      "List tasks from the task board, sorted by priority. Supports filtering by status, role, backend, and initiative.",
    domain: "tasks",
    paramCount: 4,
    params: ["status", "role", "backend", "initiative"],
  },
  {
    name: "task_get",
    description:
      "Get a single task by ID with full details: metadata, body content, output, blockers, and verdict.",
    domain: "tasks",
    paramCount: 1,
    params: ["id"],
  },
  {
    name: "task_create",
    description:
      "Create a new task on the task board. Only lm-studio backend is supported.",
    domain: "tasks",
    paramCount: 10,
    params: [
      "id",
      "title",
      "role",
      "priority",
      "initiative",
      "model",
      "objective",
      "context",
      "acceptance_criteria",
      "constraints",
    ],
  },
  {
    name: "task_update",
    description:
      "Update a task's metadata field. Use for status changes, judge verdicts, or archiving.",
    domain: "tasks",
    paramCount: 3,
    params: ["id", "field", "value"],
  },
  {
    name: "task_dispatch",
    description:
      "Dispatch a pending task to LM Studio for execution. Runs as a detached background process.",
    domain: "tasks",
    paramCount: 1,
    params: ["id"],
  },
  {
    name: "task_logs",
    description:
      "Read logs for a task: NDJSON events (activity trail) and artifact logs (output, blockers, verdict).",
    domain: "tasks",
    paramCount: 3,
    params: ["id", "log_type", "tail"],
  },
  {
    name: "lm_status",
    description:
      "Check if LM Studio is running and which models are loaded.",
    domain: "infrastructure",
    paramCount: 0,
    params: [],
  },
];

// ---------------------------------------------------------------------------
// Data loaders
// ---------------------------------------------------------------------------

function readMcpConfig(projectRoot: string, configPath: string): McpServerConfig | null {
  const fullPath = path.resolve(projectRoot, configPath);

  if (!fs.existsSync(fullPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(fullPath, "utf-8")) as {
      mcpServers?: Record<
        string,
        { command: string; args: string[]; env?: Record<string, string> }
      >;
    };
    const studio = raw.mcpServers?.studio;
    if (!studio) return null;

    return {
      name: "studio",
      command: studio.command,
      args: studio.args,
      env: studio.env ?? {},
    };
  } catch {
    return null;
  }
}

function readAllEvents(logsDir: string): McpEvent[] {
  if (!fs.existsSync(logsDir)) return [];

  const events: McpEvent[] = [];
  const files = fs.readdirSync(logsDir).filter((f) => f.endsWith(".ndjson"));

  for (const file of files) {
    const taskSlug = file.replace("-events.ndjson", "");
    const content = fs.readFileSync(path.join(logsDir, file), "utf-8");
    for (const line of content.split("\n").filter(Boolean)) {
      try {
        const parsed = JSON.parse(line) as {
          ts: string;
          event: string;
          data?: Record<string, unknown>;
        };
        events.push({
          ts: parsed.ts,
          event: parsed.event,
          data: parsed.data ?? {},
          taskSlug,
        });
      } catch {
        // Skip malformed lines
      }
    }
  }

  // Sort newest first
  events.sort((a, b) => b.ts.localeCompare(a.ts));
  return events;
}

async function checkLmStudio(baseUrl: string): Promise<LmStudioStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${baseUrl}/v1/models`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { available: false, models: [], error: `HTTP ${res.status}` };
    }

    const data = (await res.json()) as { data?: Array<{ id: string }> };
    const models = (data.data ?? []).map((m) => m.id);
    return { available: true, models, error: null };
  } catch (err) {
    return {
      available: false,
      models: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getMcpDashboard(opts?: McpDashboardOptions): Promise<McpDashboardData> {
  const projectRoot = opts?.projectRoot ?? process.cwd();
  const mcpConfigPath = opts?.mcpConfigPath ?? ".mcp.json";
  const taskLogsPath = opts?.taskLogsPath ?? "docs/tasks/logs";
  const lmStudioUrl = opts?.lmStudioUrl ?? process.env.LM_STUDIO_URL ?? "http://localhost:1234";

  const server = readMcpConfig(projectRoot, mcpConfigPath);
  const lmStudio = await checkLmStudio(lmStudioUrl);
  const events = readAllEvents(path.resolve(projectRoot, taskLogsPath));

  return {
    server,
    tools: TOOL_CATALOG,
    lmStudio,
    events,
    configPath: mcpConfigPath,
  };
}
