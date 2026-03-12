"use client";

import { motion, MotionConfig } from "motion/react";

import { formatDistanceToNowStrict } from "date-fns";

import { SectionHeader } from "./section-header";
import { StudioBreadcrumb } from "./studio-breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EASE_STANDARD } from "./lib/animation-constants";
import { cn } from "./lib/utils";
import type { McpDashboardData, McpEvent, McpToolInfo } from "@/lib/studio/mcp";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const fadeVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: EASE_STANDARD },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_STANDARD },
  },
};

// ---------------------------------------------------------------------------
// Status Indicator
// ---------------------------------------------------------------------------

function StatusDot({
  active,
  color = "mcp",
}: {
  active: boolean;
  color?: "mcp" | "emerald";
}) {
  const activeClass =
    color === "emerald"
      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
      : "bg-[var(--color-mcp)] shadow-[0_0_8px_var(--glow-mcp)]";

  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full transition-colors",
        active ? activeClass : "bg-muted-foreground/30"
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Server Config Card
// ---------------------------------------------------------------------------

function ServerConfigCard({
  data,
}: {
  data: McpDashboardData;
}) {
  return (
    <motion.div
      variants={cardVariant}
      className="rounded-xl border border-[var(--color-mcp)]/20 bg-card/30 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base text-foreground">
          Server Configuration
        </h3>
        <StatusDot active={!!data.server} />
      </div>

      {data.server ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/60">Name</span>
            <span className="font-mono text-xs text-[var(--color-mcp)]">
              {data.server.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/60">Runtime</span>
            <span className="font-mono text-xs text-foreground/80">
              {data.server.command}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/60">Script</span>
            <span className="font-mono text-xs text-foreground/80">
              {data.server.args.join(" ")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/60">Config</span>
            <span className="font-mono text-xs text-muted-foreground/50">
              {data.configPath}
            </span>
          </div>
          {Object.entries(data.server.env).length > 0 && (
            <div className="mt-3 border-t border-[var(--color-mcp)]/10 pt-3">
              <span className="mb-2 block text-xs text-muted-foreground/60">
                Environment
              </span>
              {Object.entries(data.server.env).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-0.5"
                >
                  <span className="font-mono text-[10px] text-muted-foreground/50">
                    {key}
                  </span>
                  <span className="font-mono text-[10px] text-foreground/60">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/50">
          No .mcp.json configuration found at repo root.
        </p>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// LM Studio Status Card
// ---------------------------------------------------------------------------

function LmStudioCard({
  status,
}: {
  status: McpDashboardData["lmStudio"];
}) {
  return (
    <motion.div
      variants={cardVariant}
      className="rounded-xl border border-[var(--color-mcp)]/20 bg-card/30 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base text-foreground">LM Studio</h3>
        <StatusDot active={status.available} color="emerald" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground/60">Status</span>
          <span
            className={cn(
              "text-xs font-medium",
              status.available ? "text-emerald-500" : "text-muted-foreground/50"
            )}
          >
            {status.available ? "Online" : "Offline"}
          </span>
        </div>

        {status.available && status.models.length > 0 && (
          <div>
            <span className="mb-2 block text-xs text-muted-foreground/60">
              Loaded Models
            </span>
            <div className="space-y-1.5">
              {status.models.map((model) => (
                <div
                  key={model}
                  className="flex items-center gap-2 rounded-md border border-emerald-500/15 bg-emerald-500/5 px-3 py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                  <span className="font-mono text-xs text-foreground/80">
                    {model}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {status.available && status.models.length === 0 && (
          <p className="text-xs text-muted-foreground/50">
            No models currently loaded.
          </p>
        )}

        {!status.available && status.error && (
          <div className="rounded-md border border-rose-500/15 bg-rose-500/5 px-3 py-2">
            <span className="font-mono text-[10px] text-rose-500/70">
              {status.error}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Tool Card
// ---------------------------------------------------------------------------

const DOMAIN_STYLES = {
  tasks: {
    border: "border-[var(--color-mcp)]/15",
    badge: "border-[var(--color-mcp)]/30 bg-[var(--color-mcp)]/8 text-[var(--color-mcp)]",
    dot: "bg-[var(--color-mcp)]/60",
  },
  infrastructure: {
    border: "border-[var(--color-mcp)]/10",
    badge:
      "border-muted-foreground/20 bg-muted-foreground/8 text-muted-foreground/70",
    dot: "bg-muted-foreground/40",
  },
} as const;

function ToolCard({ tool }: { tool: McpToolInfo }) {
  const style = DOMAIN_STYLES[tool.domain];

  return (
    <motion.div
      variants={cardVariant}
      className={cn(
        "group rounded-lg border bg-card/20 p-5 transition-all duration-200 hover:bg-card/40",
        style.border
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <h4 className="font-mono text-sm font-medium text-foreground">
          {tool.name}
        </h4>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px]",
            style.badge
          )}
        >
          {tool.domain}
        </span>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-muted-foreground/70">
        {tool.description}
      </p>

      {tool.params.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tool.params.map((param) => (
            <span
              key={param}
              className="rounded border border-muted-foreground/10 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50"
            >
              {param}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Event Log
// ---------------------------------------------------------------------------

const EVENT_STYLES: Record<string, { color: string; label: string }> = {
  task_created: { color: "text-[var(--color-mcp)]", label: "Created" },
  task_status_changed: { color: "text-[var(--color-copper)]", label: "Status" },
  task_dispatched: { color: "text-[var(--color-gold)]", label: "Dispatched" },
  context_resolved: { color: "text-muted-foreground", label: "Context" },
  api_call_started: { color: "text-[var(--color-api)]", label: "API Call" },
  api_call_completed: { color: "text-emerald-500", label: "API Done" },
  api_call_failed: { color: "text-rose-500", label: "API Error" },
  output_written: { color: "text-emerald-500", label: "Output" },
};

function formatEventTime(ts: string): string {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    const age = formatDistanceToNowStrict(d, { addSuffix: true });
    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return `${time} (${age})`;
  } catch {
    return ts;
  }
}

function formatEventData(data: Record<string, unknown>): string | null {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    parts.push(`${key}: ${String(value)}`);
  }
  return parts.length > 0 ? parts.join(", ") : null;
}

function EventLog({ events }: { events: McpEvent[] }) {
  return (
    <motion.div
      variants={cardVariant}
      className="rounded-xl border border-[var(--color-mcp)]/20 bg-card/30 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-mcp)]/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-base text-foreground">
            Activity Log
          </h3>
          <span className="rounded-full border border-[var(--color-mcp)]/20 bg-[var(--color-mcp)]/8 px-2 py-0.5 font-mono text-[10px] text-[var(--color-mcp)]">
            {events.length}
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/40">
          NDJSON
        </span>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="divide-y divide-[var(--color-mcp)]/5">
          {events.map((event, i) => {
            const style = EVENT_STYLES[event.event] ?? {
              color: "text-muted-foreground",
              label: event.event,
            };
            const dataStr = formatEventData(event.data);

            return (
              <div
                key={`${event.ts}-${i}`}
                className="group flex items-start gap-4 px-6 py-3 transition-colors hover:bg-[var(--color-mcp)]/5"
              >
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center pt-1.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      event.event.includes("failed")
                        ? "bg-rose-500/70"
                        : event.event.includes("created")
                          ? "bg-[var(--color-mcp)]/70"
                          : "bg-[var(--color-copper)]/50"
                    )}
                  />
                </div>

                {/* Event label */}
                <div className="w-20 shrink-0">
                  <span
                    className={cn(
                      "font-mono text-[11px] font-medium",
                      style.color
                    )}
                  >
                    {style.label}
                  </span>
                </div>

                {/* Task + data */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-xs text-foreground/80">
                      {event.taskSlug}
                    </span>
                  </div>
                  {dataStr && (
                    <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/40">
                      {dataStr}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <div className="shrink-0 text-right">
                  <span className="font-mono text-[10px] text-muted-foreground/40">
                    {formatEventTime(event.ts)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {events.length === 0 && (
        <div className="px-6 py-8 text-center text-sm text-muted-foreground/40">
          No events recorded yet
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Content
// ---------------------------------------------------------------------------

interface McpContentProps {
  data: McpDashboardData;
}

export function McpContent({ data }: McpContentProps) {
  const taskTools = data.tools.filter((t) => t.domain === "tasks");
  const infraTools = data.tools.filter((t) => t.domain === "infrastructure");

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={fadeVariant}>
          <StudioBreadcrumb segments={[{ label: "MCP" }]} />
        </motion.div>

        <motion.div variants={fadeVariant}>
          <SectionHeader label="protocol" title="MCP Server" />
        </motion.div>

        {/* Status cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ServerConfigCard data={data} />
          <LmStudioCard status={data.lmStudio} />
        </div>

        {/* Event log */}
        {data.events.length > 0 && (
          <EventLog events={data.events} />
        )}

        {/* Tool inventory */}
        <motion.div variants={fadeVariant}>
          <h3 className="mb-1 font-heading text-base text-foreground">
            Tool Inventory
          </h3>
          <p className="mb-5 text-xs text-muted-foreground/50">
            {data.tools.length} tools across{" "}
            {new Set(data.tools.map((t) => t.domain)).size} domains
          </p>
        </motion.div>

        {/* Task tools */}
        {taskTools.length > 0 && (
          <div>
            <motion.div
              variants={fadeVariant}
              className="mb-3 flex items-center gap-2"
            >
              <span className="h-1 w-1 rounded-full bg-[var(--color-mcp)]/60" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-mcp)]/70">
                Tasks
              </span>
              <span className="text-[10px] text-muted-foreground/40">
                {taskTools.length}
              </span>
            </motion.div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {taskTools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </div>
          </div>
        )}

        {/* Infrastructure tools */}
        {infraTools.length > 0 && (
          <div>
            <motion.div
              variants={fadeVariant}
              className="mb-3 flex items-center gap-2"
            >
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50">
                Infrastructure
              </span>
              <span className="text-[10px] text-muted-foreground/40">
                {infraTools.length}
              </span>
            </motion.div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {infraTools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </MotionConfig>
  );
}
