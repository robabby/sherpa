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

type LedColor = "emerald" | "amber" | "rose" | "blue" | "zinc";

const LED_VARIANT_MAP: Record<BadgeVariant, LedColor> = {
  active: "emerald",
  approved: "emerald",
  additive: "emerald",
  pending: "amber",
  paused: "amber",
  evolutionary: "amber",
  "in-progress": "amber",
  declined: "rose",
  structural: "rose",
  integrated: "blue",
  completed: "blue",
  archived: "zinc",
  default: "zinc",
};

const LED_STYLES: Record<LedColor, string> = {
  emerald: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]",
  amber: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]",
  rose: "bg-rose-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]",
  blue: "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.4)]",
  zinc: "bg-zinc-500 shadow-[0_0_4px_rgba(113,113,122,0.3)]",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  mode?: "badge" | "led";
}

export function StatusBadge({ status, className, mode = "badge" }: StatusBadgeProps) {
  const variant = (status in VARIANT_STYLES ? status : "default") as BadgeVariant;

  if (mode === "led") {
    const ledColor = LED_VARIANT_MAP[variant];
    return (
      <span
        className={cn(
          "inline-block h-2 w-2 rounded-full",
          LED_STYLES[ledColor],
          className
        )}
        title={status}
      />
    );
  }

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
