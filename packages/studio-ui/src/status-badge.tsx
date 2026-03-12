import { cn } from "./lib/utils";

type BadgeVariant =
  | "pending"
  | "approved"
  | "in-progress"
  | "integrated"
  | "declined"
  | "archived"
  | "active"
  | "paused"
  | "completed"
  | "additive"
  | "evolutionary"
  | "structural"
  | "default";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  pending:
    "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
  approved:
    "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  "in-progress":
    "border-[var(--color-gold)]/50 text-[var(--color-gold)] bg-[var(--color-gold)]/10",
  integrated:
    "border-blue-500/40 text-blue-400 bg-blue-500/10",
  declined:
    "border-red-500/40 text-red-400 bg-red-500/10",
  archived:
    "border-zinc-500/30 text-zinc-500 bg-zinc-500/10",
  active:
    "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  paused:
    "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
  completed:
    "border-blue-500/40 text-blue-400 bg-blue-500/10",
  additive:
    "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  evolutionary:
    "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
  structural:
    "border-rose-500/40 text-rose-400 bg-rose-500/10",
  default:
    "border-muted-foreground/30 text-muted-foreground bg-muted/50",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = (status in VARIANT_STYLES ? status : "default") as BadgeVariant;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {status}
    </span>
  );
}
