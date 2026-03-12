import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "./lib/utils";

type PanelVariant = "process" | "portfolio" | "activity" | "docs" | "conventions" | "skills" | "primitives" | "api" | "workforce" | "sessions" | "transit-content" | "tasks" | "mcp" | "workflow";

interface HubPanelProps {
  variant: PanelVariant;
  href: string;
  title: string;
  children: ReactNode;
  linkText: string;
  label: string;
  className?: string;
}

const VARIANT_STYLES: Record<
  PanelVariant,
  {
    container: string;
    hover: string;
    label: string;
    link: string;
    glow: string | null;
    accentBar: string | null;
  }
> = {
  process: {
    container:
      "border-[var(--color-copper)]/20 bg-card/30 backdrop-blur-sm",
    hover:
      "hover:border-[var(--color-copper)]/40 hover:shadow-[0_0_20px_var(--glow-copper)] hover:-translate-y-px",
    label: "text-[var(--color-copper)]/80",
    link: "text-[var(--color-copper)]",
    glow: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-copper)] opacity-[0.04] blur-[40px]",
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-copper)]/50 to-transparent",
  },
  portfolio: {
    container:
      "border-[var(--border-gold)] bg-card/40 backdrop-blur-sm shadow-[var(--glass-inner-shadow)]",
    hover:
      "hover:border-[var(--color-gold)]/50 hover:shadow-[var(--glass-inner-shadow),0_0_24px_var(--glow-gold)] hover:-translate-y-px",
    label: "text-[var(--color-gold)]/80",
    link: "text-[var(--color-gold)]",
    glow: null,
    accentBar: null,
  },
  activity: {
    container:
      "border-[var(--border-gold)] bg-card/30 backdrop-blur-sm",
    hover:
      "hover:border-[var(--color-gold)]/40 hover:shadow-[0_0_20px_var(--glow-gold)] hover:-translate-y-px",
    label: "text-[var(--color-gold)]/80",
    link: "text-[var(--color-gold)]",
    glow: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-gold)] opacity-[0.03] blur-[40px]",
    accentBar: null,
  },
  docs: {
    container:
      "border-[var(--color-bronze)]/15 bg-card/20 backdrop-blur-[2px]",
    hover:
      "hover:border-[var(--color-bronze)]/25 hover:-translate-y-px",
    label: "text-[var(--color-bronze)]/80",
    link: "text-[var(--color-bronze)]",
    glow: null,
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-bronze)]/30 to-transparent",
  },
  conventions: {
    container: "border-muted-foreground/10 bg-background",
    hover: "hover:border-muted-foreground/20",
    label: "text-muted-foreground/60",
    link: "text-muted-foreground",
    glow: null,
    accentBar: null,
  },
  skills: {
    container:
      "border-[var(--color-eclipse)]/20 bg-card/25 backdrop-blur-[2px]",
    hover:
      "hover:border-[var(--color-eclipse)]/35 hover:-translate-y-px",
    label: "text-[var(--color-eclipse)]/80",
    link: "text-[var(--color-eclipse)]",
    glow: null,
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-eclipse)]/40 to-transparent",
  },
  primitives: {
    container:
      "border-[var(--color-primitive)]/20 bg-card/25 backdrop-blur-[2px]",
    hover:
      "hover:border-[var(--color-primitive)]/40 hover:shadow-[0_0_20px_var(--glow-primitive)] hover:-translate-y-px",
    label: "text-[var(--color-primitive)]/80",
    link: "text-[var(--color-primitive)]",
    glow: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-primitive)] opacity-[0.04] blur-[40px]",
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-primitive)]/40 to-transparent",
  },
  api: {
    container:
      "border-[var(--color-api)]/20 bg-card/25 backdrop-blur-[2px]",
    hover:
      "hover:border-[var(--color-api)]/40 hover:shadow-[0_0_20px_var(--glow-api)] hover:-translate-y-px",
    label: "text-[var(--color-api)]/80",
    link: "text-[var(--color-api)]",
    glow: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-api)] opacity-[0.04] blur-[40px]",
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-api)]/40 to-transparent",
  },
  workforce: {
    container:
      "border-[var(--color-eclipse)]/20 bg-card/25 backdrop-blur-[2px]",
    hover:
      "hover:border-[var(--color-eclipse)]/40 hover:shadow-[0_0_20px_var(--glow-eclipse)] hover:-translate-y-px",
    label: "text-[var(--color-eclipse)]/80",
    link: "text-[var(--color-eclipse)]",
    glow: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-eclipse)] opacity-[0.04] blur-[40px]",
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-eclipse)]/40 to-transparent",
  },
  sessions: {
    container:
      "border-[var(--color-session)]/20 bg-card/25 backdrop-blur-[2px]",
    hover:
      "hover:border-[var(--color-session)]/40 hover:shadow-[0_0_20px_var(--glow-session)] hover:-translate-y-px",
    label: "text-[var(--color-session)]/80",
    link: "text-[var(--color-session)]",
    glow: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-session)] opacity-[0.04] blur-[40px]",
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-session)]/40 to-transparent",
  },
  tasks: {
    container:
      "border-[var(--color-copper)]/20 bg-card/25 backdrop-blur-[2px]",
    hover:
      "hover:border-[var(--color-copper)]/40 hover:shadow-[0_0_20px_var(--glow-copper)] hover:-translate-y-px",
    label: "text-[var(--color-copper)]/80",
    link: "text-[var(--color-copper)]",
    glow: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-copper)] opacity-[0.04] blur-[40px]",
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-copper)]/50 to-transparent",
  },
  "transit-content": {
    container:
      "border-[var(--color-transit)]/20 bg-card/25 backdrop-blur-[2px]",
    hover:
      "hover:border-[var(--color-transit)]/40 hover:shadow-[0_0_20px_var(--glow-transit)] hover:-translate-y-px",
    label: "text-[var(--color-transit)]/80",
    link: "text-[var(--color-transit)]",
    glow: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-transit)] opacity-[0.04] blur-[40px]",
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-transit)]/50 to-transparent",
  },
  mcp: {
    container:
      "border-[var(--color-mcp)]/20 bg-card/25 backdrop-blur-[2px]",
    hover:
      "hover:border-[var(--color-mcp)]/40 hover:shadow-[0_0_20px_var(--glow-mcp)] hover:-translate-y-px",
    label: "text-[var(--color-mcp)]/80",
    link: "text-[var(--color-mcp)]",
    glow: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-mcp)] opacity-[0.04] blur-[40px]",
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-mcp)]/50 to-transparent",
  },
  workflow: {
    container:
      "border-[var(--color-copper)]/20 bg-card/25 backdrop-blur-[2px]",
    hover:
      "hover:border-[var(--color-copper)]/40 hover:shadow-[0_0_20px_var(--glow-copper)] hover:-translate-y-px",
    label: "text-[var(--color-copper)]/80",
    link: "text-[var(--color-copper)]",
    glow: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-copper)] opacity-[0.04] blur-[40px]",
    accentBar:
      "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[var(--color-copper)]/50 to-transparent",
  },
};

export function HubPanel({
  variant,
  href,
  title,
  children,
  linkText,
  label,
  className,
}: HubPanelProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="group h-full">
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-xl border p-7 transition-all duration-300 sm:p-8",
          styles.container,
          styles.hover,
          className
        )}
      >
        {/* Atmospheric glow */}
        {styles.glow && <div className={styles.glow} />}

        {/* Accent bar */}
        {styles.accentBar && <div className={styles.accentBar} />}

        {/* Header */}
        <div className="relative mb-5">
          <span
            className={cn(
              "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.25em]",
              styles.label
            )}
          >
            {label}
          </span>
          <h2 className="font-heading text-card-title text-foreground">
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="relative flex-1">{children}</div>

        {/* Footer link */}
        <div className="relative mt-6">
          <Link
            href={href}
            className={cn(
              "inline-flex items-center gap-1 text-sm transition-opacity",
              styles.link,
              variant === "conventions"
                ? "opacity-50 group-hover:opacity-70"
                : "opacity-70 group-hover:opacity-100"
            )}
          >
            {linkText}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-[3px]">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
