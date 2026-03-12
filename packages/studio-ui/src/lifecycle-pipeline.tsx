import { Text } from "@radix-ui/themes";
import type { Initiative } from "@/lib/studio";

const STAGES = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "in-progress", label: "In Progress" },
  { key: "integrated", label: "Integrated" },
] as const;

interface LifecyclePipelineProps {
  initiatives: Initiative[];
}

export function LifecyclePipeline({ initiatives }: LifecyclePipelineProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {STAGES.map((stage, i) => {
        const count = initiatives.filter((init) => init.status === stage.key).length;
        const isActive = count > 0;
        return (
          <div key={stage.key} className="flex items-center gap-2">
            {i > 0 && (
              <div className="h-px w-6 bg-[var(--border-gold)]/30" />
            )}
            <div
              className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
                isActive
                  ? "border-[var(--color-gold)]/50 bg-[var(--color-gold)]/10"
                  : "border-muted-foreground/20 bg-muted/30"
              }`}
            >
              {isActive && (
                <span className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
              )}
              <Text size="2" weight="medium" className={isActive ? "text-foreground" : "text-muted-foreground"}>
                {stage.label}
              </Text>
              <Text size="1" className="font-mono text-muted-foreground">
                {count}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}
