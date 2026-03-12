"use client";

import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import {
  Crown,
  Palette,
  Wrench,
  Compass,
  Settings,
  Users,
  Zap,
  Clock,
  type LucideIcon,
} from "lucide-react";

import { StudioBreadcrumb } from "./studio-breadcrumb";
import { TaskSummaryWidget } from "./task-summary-widget";
import { EASE_STANDARD } from "./lib/animation-constants";
import { cn } from "./lib/utils";
import type { AgentRole, AgentRoleCategory } from "@/lib/studio";
import type { TaskBoardEntry } from "@/lib/studio/tasks";

// ---------------------------------------------------------------------------
// Category visual system
// ---------------------------------------------------------------------------

interface CategoryStyle {
  label: string;
  icon: LucideIcon;
  color: string;
  border: string;
  hoverBorder: string;
  hoverGlow: string;
  accentBar: string;
  badge: string;
  statBg: string;
}

const CATEGORY_STYLES: Record<AgentRoleCategory, CategoryStyle> = {
  strategy: {
    label: "Strategy",
    icon: Crown,
    color: "var(--color-gold)",
    border: "border-[var(--color-gold)]/20",
    hoverBorder: "hover:border-[var(--color-gold)]/45",
    hoverGlow: "hover:shadow-[0_0_24px_var(--glow-gold)]",
    accentBar:
      "bg-gradient-to-b from-[var(--color-gold)]/60 via-[var(--color-gold)]/20 to-transparent",
    badge: "border-[var(--color-gold)]/30 bg-[var(--color-gold)]/8 text-[var(--color-gold)]",
    statBg: "bg-[var(--color-gold)]/8 border-[var(--color-gold)]/20",
  },
  design: {
    label: "Design",
    icon: Palette,
    color: "var(--color-copper)",
    border: "border-[var(--color-copper)]/20",
    hoverBorder: "hover:border-[var(--color-copper)]/45",
    hoverGlow: "hover:shadow-[0_0_24px_var(--glow-copper)]",
    accentBar:
      "bg-gradient-to-b from-[var(--color-copper)]/60 via-[var(--color-copper)]/20 to-transparent",
    badge: "border-[var(--color-copper)]/30 bg-[var(--color-copper)]/8 text-[var(--color-copper)]",
    statBg: "bg-[var(--color-copper)]/8 border-[var(--color-copper)]/20",
  },
  engineering: {
    label: "Engineering",
    icon: Wrench,
    color: "var(--color-primitive)",
    border: "border-[var(--color-primitive)]/20",
    hoverBorder: "hover:border-[var(--color-primitive)]/45",
    hoverGlow: "hover:shadow-[0_0_24px_var(--glow-primitive)]",
    accentBar:
      "bg-gradient-to-b from-[var(--color-primitive)]/60 via-[var(--color-primitive)]/20 to-transparent",
    badge:
      "border-[var(--color-primitive)]/30 bg-[var(--color-primitive)]/8 text-[var(--color-primitive)]",
    statBg: "bg-[var(--color-primitive)]/8 border-[var(--color-primitive)]/20",
  },
  domain: {
    label: "Domain",
    icon: Compass,
    color: "var(--color-eclipse)",
    border: "border-[var(--color-eclipse)]/20",
    hoverBorder: "hover:border-[var(--color-eclipse)]/45",
    hoverGlow: "hover:shadow-[0_0_24px_var(--glow-eclipse)]",
    accentBar:
      "bg-gradient-to-b from-[var(--color-eclipse)]/60 via-[var(--color-eclipse)]/20 to-transparent",
    badge:
      "border-[var(--color-eclipse)]/30 bg-[var(--color-eclipse)]/8 text-[var(--color-eclipse)]",
    statBg: "bg-[var(--color-eclipse)]/8 border-[var(--color-eclipse)]/20",
  },
  operations: {
    label: "Operations",
    icon: Settings,
    color: "var(--color-session)",
    border: "border-[var(--color-session)]/20",
    hoverBorder: "hover:border-[var(--color-session)]/45",
    hoverGlow: "hover:shadow-[0_0_24px_var(--glow-session)]",
    accentBar:
      "bg-gradient-to-b from-[var(--color-session)]/60 via-[var(--color-session)]/20 to-transparent",
    badge:
      "border-[var(--color-session)]/30 bg-[var(--color-session)]/8 text-[var(--color-session)]",
    statBg: "bg-[var(--color-session)]/8 border-[var(--color-session)]/20",
  },
};

// ---------------------------------------------------------------------------
// Tier + status badge styles
// ---------------------------------------------------------------------------

const TIER_STYLES: Record<string, { label: string; className: string }> = {
  high: {
    label: "high",
    className:
      "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
  },
  medium: {
    label: "medium",
    className:
      "border-[var(--color-copper)]/40 bg-[var(--color-copper)]/10 text-[var(--color-copper)]",
  },
  low: {
    label: "low",
    className:
      "border-[var(--color-bronze)]/40 bg-[var(--color-bronze)]/10 text-[var(--color-bronze)]",
  },
};


// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
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

const fadeVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: EASE_STANDARD },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip markdown heading markers and collapse to plain text for card preview */
function cleanDescription(raw: string): string {
  return raw
    .replace(/^#{1,6}\s+.*$/gm, "") // strip all heading lines
    .replace(/\*\*([^*]+)\*\*/g, "$1") // strip bold markers
    .replace(/`([^`]+)`/g, "$1") // strip inline code
    .replace(/\n{2,}/g, " ") // collapse paragraph breaks
    .replace(/\n/g, " ") // collapse remaining newlines
    .replace(/\s{2,}/g, " ") // collapse whitespace
    .trim();
}

// ---------------------------------------------------------------------------
// Summary Stats
// ---------------------------------------------------------------------------

function WorkforceSummary({
  roles,
  tasks,
}: {
  roles: AgentRole[];
  tasks: TaskBoardEntry[];
}) {
  const tierCounts = { high: 0, medium: 0, low: 0 };
  for (const r of roles) {
    if (r.modelTier in tierCounts) tierCounts[r.modelTier as keyof typeof tierCounts]++;
  }

  const activeTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "dispatched"
  ).length;

  const stats = [
    {
      value: roles.length,
      label: "Total Roles",
      icon: Users,
      style: "bg-muted/50 border-muted-foreground/10",
    },
    {
      value: tierCounts.high,
      label: "High Tier",
      icon: Zap,
      style: CATEGORY_STYLES.strategy.statBg,
    },
    {
      value: tierCounts.medium,
      label: "Medium Tier",
      icon: Settings,
      style: CATEGORY_STYLES.design.statBg,
    },
    {
      value: activeTasks,
      label: "Active Tasks",
      icon: Clock,
      style:
        activeTasks > 0
          ? "bg-[var(--color-copper)]/8 border-[var(--color-copper)]/20"
          : "bg-muted/50 border-muted-foreground/10",
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {stats.map((s) => (
        <motion.div
          key={s.label}
          variants={fadeVariant}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3",
            s.style
          )}
        >
          <s.icon className="h-4 w-4 shrink-0 text-muted-foreground/60" />
          <div>
            <p className="text-lg font-semibold leading-none text-foreground">
              {s.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">{s.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}


// ---------------------------------------------------------------------------
// Role Card
// ---------------------------------------------------------------------------

function RoleCard({
  role,
  categoryStyle,
}: {
  role: AgentRole;
  categoryStyle: CategoryStyle;
}) {
  const tier = TIER_STYLES[role.modelTier];
  const description = cleanDescription(role.description);

  return (
    <motion.div variants={cardVariant}>
      <Link
        href={`/workforce/${role.slug}`}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card/30 backdrop-blur-[2px] transition-all duration-200",
          categoryStyle.border,
          categoryStyle.hoverBorder,
          categoryStyle.hoverGlow,
          "hover:-translate-y-px"
        )}
      >
        {/* Left accent bar */}
        <div
          className={cn(
            "absolute left-0 top-3 bottom-3 w-[2px] rounded-full",
            categoryStyle.accentBar
          )}
        />

        {/* Card content */}
        <div className="flex flex-1 flex-col p-4 pl-5">
          {/* Header: name + tier */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-snug text-foreground group-hover:text-foreground/90">
              {role.displayName}
            </h3>
            {tier && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-1.5 py-px text-[10px] font-medium",
                  tier.className
                )}
              >
                {tier.label}
              </span>
            )}
          </div>

          {/* Structure badge */}
          {role.structure && (
            <span
              className={cn(
                "mt-1.5 inline-flex w-fit items-center rounded border px-1.5 py-0.5 text-[10px]",
                categoryStyle.badge
              )}
            >
              {role.structure.replace(/-/g, " ")}
            </span>
          )}

          {/* Description */}
          <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted-foreground/80">
            {description}
          </p>

          {/* Pattern tags */}
          {role.patterns.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1 border-t border-muted-foreground/8 pt-3">
              {role.patterns.slice(0, 3).map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center rounded-full border border-muted-foreground/12 px-1.5 py-0.5 text-[10px] text-muted-foreground/50"
                >
                  {p}
                </span>
              ))}
              {role.patterns.length > 3 && (
                <span className="self-center text-[10px] text-muted-foreground/35">
                  +{role.patterns.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Category Section
// ---------------------------------------------------------------------------

const AGENT_ROLE_CATEGORIES: AgentRoleCategory[] = [
  "strategy",
  "design",
  "engineering",
  "domain",
  "operations",
];

function CategorySection({
  category,
  roles,
}: {
  category: AgentRoleCategory;
  roles: AgentRole[];
}) {
  const style = CATEGORY_STYLES[category];
  const Icon = style.icon;

  return (
    <motion.div variants={fadeVariant}>
      {/* Category header with icon */}
      <div className="mb-5 flex items-center gap-2.5">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border",
            style.statBg
          )}
        >
          <Icon
            className="h-3.5 w-3.5"
            style={{ color: style.color }}
          />
        </div>
        <div>
          <p
            className="text-[11px] font-medium uppercase tracking-[0.2em]"
            style={{ color: style.color, opacity: 0.8 }}
          >
            {style.label}
          </p>
          <p className="text-xs text-muted-foreground/50">
            {roles.length} {roles.length === 1 ? "role" : "roles"}
          </p>
        </div>
      </div>

      {/* Card grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {roles.map((role) => (
          <RoleCard key={role.slug} role={role} categoryStyle={style} />
        ))}
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Content
// ---------------------------------------------------------------------------

interface WorkforceContentProps {
  roles: AgentRole[];
  tasks: TaskBoardEntry[];
}

export function WorkforceContent({ roles, tasks }: WorkforceContentProps) {
  // Group roles by category
  const byCategory = new Map<AgentRoleCategory, AgentRole[]>();
  for (const role of roles) {
    const existing = byCategory.get(role.category);
    if (existing) existing.push(role);
    else byCategory.set(role.category, [role]);
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-10"
      >
        <motion.div variants={fadeVariant}>
          <StudioBreadcrumb segments={[{ label: "Workforce" }]} />
        </motion.div>

        {/* Summary stats */}
        <WorkforceSummary roles={roles} tasks={tasks} />

        {/* Task pipeline */}
        <TaskSummaryWidget tasks={tasks} />

        {/* Role categories */}
        {AGENT_ROLE_CATEGORIES.map((cat) => {
          const catRoles = byCategory.get(cat);
          if (!catRoles?.length) return null;
          return (
            <CategorySection key={cat} category={cat} roles={catRoles} />
          );
        })}
      </motion.div>
    </MotionConfig>
  );
}
