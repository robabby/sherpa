import { cn } from "./lib/utils";
import type { McpDashboardData } from "@/lib/studio/mcp";
import { HubPanel } from "./hub-panel";

interface HubMcpPanelProps {
  data: McpDashboardData;
}

export function HubMcpPanel({ data }: HubMcpPanelProps) {
  const taskTools = data.tools.filter((t) => t.domain === "tasks");
  const infraTools = data.tools.filter((t) => t.domain === "infrastructure");

  return (
    <HubPanel
      variant="mcp"
      href="/mcp"
      title="MCP Server"
      label="PROTOCOL"
      linkText="View MCP dashboard"
    >
      <div className="space-y-5">
        {/* Connection status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                data.server
                  ? "bg-[var(--color-mcp)] shadow-[0_0_6px_var(--color-mcp)] led-active"
                  : "bg-muted-foreground/40"
              )}
            />
            <span className="text-sm text-foreground">
              {data.server ? "Configured" : "Not configured"}
            </span>
          </div>
          <span className="text-muted-foreground/30">|</span>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                data.lmStudio.available
                  ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)] led-active"
                  : "bg-muted-foreground/40"
              )}
            />
            <span className="text-sm text-foreground">
              LM Studio {data.lmStudio.available ? "online" : "offline"}
            </span>
          </div>
        </div>

        {/* Tool summary */}
        <div className="flex items-baseline gap-4">
          <div>
            <span className="font-heading text-lg text-foreground">
              {data.tools.length}
            </span>
            <span className="ml-1 text-xs text-muted-foreground/60">tools</span>
          </div>
          <div className="flex gap-3 font-mono text-xs text-muted-foreground/50">
            <span>{taskTools.length} tasks</span>
            <span>{infraTools.length} infra</span>
          </div>
        </div>

        {/* Event count */}
        {data.events.length > 0 && (
          <p className="font-mono text-xs text-muted-foreground/50">
            {data.events.length} logged events
          </p>
        )}
      </div>
    </HubPanel>
  );
}
