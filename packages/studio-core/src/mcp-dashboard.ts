import fs from "fs";
import path from "path";
import { getProjectRoot } from "./content";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface McpServerConfig {
  name: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
}

export interface McpToolInfo {
  name: string;
  description: string;
  domain: "knowledge" | "governance";
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
  // --- Governance: the initiative lifecycle Claude Code drives ---
  {
    name: "initiative_list",
    description:
      "List initiatives with optional filters by status, type, or risk level.",
    domain: "governance",
    paramCount: 3,
    params: ["status", "type", "risk"],
  },
  {
    name: "initiative_get",
    description:
      "Get full detail for a single initiative: proposal, plan, activity, seeds, and lifecycle state.",
    domain: "governance",
    paramCount: 1,
    params: ["slug"],
  },
  {
    name: "initiative_seeds",
    description:
      "Get seeds (follow-on ideas) from an integrated initiative's activity log.",
    domain: "governance",
    paramCount: 1,
    params: ["slug"],
  },
  {
    name: "initiative_create",
    description:
      "Create a new initiative proposal directory with proposal.md.",
    domain: "governance",
    paramCount: 8,
    params: ["slug", "title", "summary", "body", "type", "risk", "targets", "dependencies"],
  },
  {
    name: "initiative_approve",
    description:
      "Approve a pending initiative. Enforces governance policy for agent actors; creates activity.md.",
    domain: "governance",
    paramCount: 2,
    params: ["slug", "agent_id"],
  },
  {
    name: "initiative_update_status",
    description:
      "Change initiative status with lifecycle transition validation.",
    domain: "governance",
    paramCount: 2,
    params: ["slug", "status"],
  },
  {
    name: "initiative_activity",
    description:
      "Append a timestamped entry to an initiative's activity log.",
    domain: "governance",
    paramCount: 2,
    params: ["slug", "entry"],
  },
  // --- Knowledge: search & summarize the indexed corpus ---
  {
    name: "search_knowledge",
    description:
      "Full-text + semantic search across indexed markdown (initiatives, research, agents, rules, skills). BM25-ranked.",
    domain: "knowledge",
    paramCount: 5,
    params: ["query", "limit", "kind", "initiative", "mode"],
  },
  {
    name: "get_summary",
    description:
      "Structured summary at file, initiative, or portfolio zoom level.",
    domain: "knowledge",
    paramCount: 2,
    params: ["target", "zoom"],
  },
  {
    name: "get_context",
    description:
      "Session bootstrap — role-appropriate system state (scope, neighborhood, portfolio) in one call.",
    domain: "knowledge",
    paramCount: 3,
    params: ["role", "initiative", "max_tokens"],
  },
  {
    name: "query_related",
    description:
      "Find related initiatives: explicit frontmatter edges, emergent similarity, or creative cross-pollination.",
    domain: "knowledge",
    paramCount: 3,
    params: ["source", "mode", "limit"],
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
        { command?: string; args?: string[]; env?: Record<string, string>; url?: string }
      >;
    };
    const studio = raw.mcpServers?.studio;
    if (!studio) return null;

    return {
      name: "studio",
      command: studio.command,
      args: studio.args,
      env: studio.env,
      url: studio.url,
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
          timestamp?: string;
          ts?: string;
          event: string;
          data?: Record<string, unknown>;
        };
        events.push({
          ts: parsed.timestamp ?? parsed.ts ?? "",
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
  const projectRoot = opts?.projectRoot ?? getProjectRoot();
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
