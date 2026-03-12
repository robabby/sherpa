import { cn } from "./lib/utils";
import type { ExportSignatureKind } from "@/lib/studio";

const KIND_CONFIG: Partial<Record<
  ExportSignatureKind,
  { label: string; color: string }
>> = {
  function: {
    label: "fn",
    color: "border-blue-500/30 text-blue-400/80 bg-blue-500/8",
  },
  interface: {
    label: "iface",
    color: "border-purple-500/30 text-purple-400/80 bg-purple-500/8",
  },
  "type-alias": {
    label: "type",
    color: "border-emerald-500/30 text-emerald-400/80 bg-emerald-500/8",
  },
  variable: {
    label: "const",
    color: "border-amber-500/30 text-amber-400/80 bg-amber-500/8",
  },
  enum: {
    label: "enum",
    color: "border-rose-500/30 text-rose-400/80 bg-rose-500/8",
  },
};

interface KindBadgeProps {
  kind?: ExportSignatureKind;
  className?: string;
}

export function KindBadge({ kind, className }: KindBadgeProps) {
  if (!kind) return null;

  const config = KIND_CONFIG[kind];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono text-[10px] leading-none",
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
