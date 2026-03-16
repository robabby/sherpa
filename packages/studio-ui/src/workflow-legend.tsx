"use client";

import { cn } from "./lib/utils";
import {
  WORKFLOW_EDGE_TYPES,
  WORKFLOW_EDGE_STYLES,
  type WorkflowEdgeType,
} from "@sherpa/studio-core/workflow";

// ---------------------------------------------------------------------------
// Display names for edge types
// ---------------------------------------------------------------------------

const EDGE_TYPE_LABELS: Record<WorkflowEdgeType, string> = {
  ideas: "Ideas",
  governance: "Governance",
  tasks: "Tasks",
  code: "Code",
  content: "Content",
  review: "Review",
  delivery: "Delivery",
  audit: "Audit",
  feedback: "Feedback",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WorkflowLegendProps {
  hiddenTypes: Set<WorkflowEdgeType>;
  onToggleType: (type: WorkflowEdgeType) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorkflowLegend({
  hiddenTypes,
  onToggleType,
  onShowAll,
  onHideAll,
}: WorkflowLegendProps) {
  return (
    <div className="bg-[rgba(8,8,10,0.85)] backdrop-blur-xl border border-[var(--glass-border)] rounded-lg p-3">
      <div className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-2">
        Data Flow
      </div>

      <div className="flex flex-col gap-1">
        {WORKFLOW_EDGE_TYPES.map((type) => {
          const style = WORKFLOW_EDGE_STYLES[type];
          const hidden = hiddenTypes.has(type);

          return (
            <button
              key={type}
              type="button"
              className={cn(
                "flex items-center gap-2 px-1 py-0.5 rounded cursor-pointer transition-opacity hover:bg-white/5",
                hidden && "opacity-40",
              )}
              onClick={() => onToggleType(type)}
            >
              {/* SVG line swatch */}
              <svg width={20} height={10} className="shrink-0">
                <line
                  x1={0}
                  y1={5}
                  x2={20}
                  y2={5}
                  stroke={style.color}
                  strokeWidth={style.width}
                  {...(type === "feedback"
                    ? { strokeDasharray: "3 2" }
                    : {})}
                />
              </svg>

              {/* Label */}
              <span
                className={cn(
                  "text-[11px] text-foreground/80",
                  hidden && "line-through",
                )}
              >
                {EDGE_TYPE_LABELS[type]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Show all / Hide all */}
      <div className="flex gap-3 mt-2 pt-2 border-t border-white/5">
        <button
          type="button"
          className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          onClick={onShowAll}
        >
          Show all
        </button>
        <button
          type="button"
          className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          onClick={onHideAll}
        >
          Hide all
        </button>
      </div>
    </div>
  );
}
