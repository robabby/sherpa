/**
 * Sherpa Pattern Library
 *
 * Documents the 8 recurring visual patterns across @sherpa/studio-ui.
 * Each pattern provides a composable recipe: base Tailwind classes, named
 * slots, variant overrides, token references with light/dark values,
 * and implementation provenance.
 *
 * These recipes are consumed by the /design skill to generate on-brand
 * UI prototypes, and by Storybook to demonstrate pattern composition.
 */

// ── Types ──────────────────────────────────────────────────────────

export interface PatternSlot {
  /** Slot name (e.g. "label", "content", "footer") */
  name: string
  /** Tailwind classes for this slot */
  classes: string
}

export interface PatternVariant {
  /** Variant name */
  name: string
  /** Classes to add/override when this variant is active */
  classes: string
}

export interface PatternToken {
  /** CSS custom property name (without --) */
  name: string
  /** Light mode value */
  light: string
  /** Dark mode value */
  dark: string
}

export interface PatternDefinition {
  /** URL-safe identifier */
  slug: string
  /** Human-readable name */
  name: string
  /** One-line description */
  description: string
  /** Functional category */
  category: "container" | "indicator" | "display" | "navigation" | "layout"
  /** Base Tailwind classes applied to the root element */
  base: string
  /** Hover state classes */
  hover: string
  /** Named content slots with their classes */
  slots: PatternSlot[]
  /** Named variant class overrides */
  variants: PatternVariant[]
  /** CSS custom properties this pattern depends on */
  tokens: PatternToken[]
  /** Component file names that implement this pattern */
  implementedBy: string[]
  /** Other pattern slugs commonly composed with */
  composedWith: string[]
  /** Accessibility notes */
  a11y: string
}

// ── Pattern definitions ────────────────────────────────────────────

export const PATTERNS: PatternDefinition[] = [
  // ── 1. Glass Panel ───────────────────────────────────────────────
  {
    slug: "glass-panel",
    name: "Glass Panel",
    description:
      "Frosted glass container with backdrop blur, surface tokens, variant-driven glow, and accent bar",
    category: "container",
    base: [
      "relative flex flex-col overflow-hidden rounded-xl border p-7 sm:p-8",
      "backdrop-blur-xl",
      "bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)]",
      "transition-all duration-200",
    ].join(" "),
    hover: [
      "hover:bg-[var(--glass-bg-hover)]",
      "hover:border-[var(--glass-border-hover)]",
      "hover:shadow-[var(--glass-shadow-hover)]",
      "hover:-translate-y-px",
    ].join(" "),
    slots: [
      {
        name: "glow",
        classes:
          "absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-[0.04] blur-[80px] panel-glow",
      },
      {
        name: "accent-bar",
        classes:
          "absolute left-0 top-4 bottom-4 w-[2px] bg-gradient-to-b from-current/50 to-transparent",
      },
      {
        name: "label",
        classes:
          "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.35em]",
      },
      {
        name: "title",
        classes: "font-heading text-card-title text-foreground",
      },
      {
        name: "content",
        classes: "relative flex-1",
      },
      {
        name: "footer",
        classes:
          "relative mt-6 inline-flex items-center gap-1 text-sm opacity-70 transition-opacity group-hover:opacity-100",
      },
    ],
    variants: [
      {
        name: "copper",
        classes:
          "border-[var(--color-copper)]/10 [&_.glow]:bg-[var(--color-copper)] [&_.label]:text-[var(--color-copper)]/80",
      },
      {
        name: "gold",
        classes:
          "border-[var(--color-gold)]/10 [&_.glow]:bg-[var(--color-gold)] [&_.label]:text-[var(--color-gold)]/80",
      },
      {
        name: "eclipse",
        classes:
          "border-[var(--color-eclipse)]/10 [&_.glow]:bg-[var(--color-eclipse)] [&_.label]:text-[var(--color-eclipse)]/80",
      },
    ],
    tokens: [
      {
        name: "glass-bg",
        light: "transparent",
        dark: "rgba(255, 255, 255, 0.03)",
      },
      {
        name: "glass-border",
        light: "rgba(0, 0, 0, 0.06)",
        dark: "rgba(255, 255, 255, 0.06)",
      },
      {
        name: "glass-shadow",
        light: "none",
        dark: "0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
      },
      {
        name: "glass-bg-hover",
        light: "transparent",
        dark: "rgba(255, 255, 255, 0.05)",
      },
      {
        name: "glass-border-hover",
        light: "rgba(0, 0, 0, 0.10)",
        dark: "rgba(255, 255, 255, 0.10)",
      },
      {
        name: "glass-shadow-hover",
        light: "none",
        dark: "0 2px 4px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.25)",
      },
    ],
    implementedBy: ["hub-panel.tsx", "initiative-lifecycle-hero.tsx"],
    composedWith: ["section-header", "status-indicator"],
    a11y: "Container is a group element. Interactive children must be individually focusable. Glass tokens maintain WCAG contrast on both light and dark backgrounds.",
  },

  // ── 2. Status Indicator ──────────────────────────────────────────
  {
    slug: "status-indicator",
    name: "Status Indicator",
    description:
      "LED dots and badge pills with semantic color mapping for lifecycle status",
    category: "indicator",
    base: "inline-block",
    hover: "",
    slots: [
      {
        name: "led",
        classes: "inline-block h-2 w-2 rounded-full",
      },
      {
        name: "badge",
        classes:
          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
      },
    ],
    variants: [
      {
        name: "pending",
        classes: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
      },
      {
        name: "approved",
        classes: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      },
      {
        name: "in-progress",
        classes:
          "border-[var(--color-gold)]/50 text-[var(--color-gold)] bg-[var(--color-gold)]/10",
      },
      {
        name: "integrated",
        classes: "border-blue-500/40 text-blue-400 bg-blue-500/10",
      },
      {
        name: "declined",
        classes: "border-red-500/40 text-red-400 bg-red-500/10",
      },
      {
        name: "archived",
        classes: "border-zinc-500/30 text-zinc-500 bg-zinc-500/10",
      },
    ],
    tokens: [
      {
        name: "color-gold",
        light: "#d4a574",
        dark: "#d4a574",
      },
    ],
    implementedBy: [
      "status-badge.tsx",
      "hub-mcp-panel.tsx",
      "hub-process-panel.tsx",
      "hub-tasks-panel.tsx",
      "hub-conventions-panel.tsx",
    ],
    composedWith: [],
    a11y: "LED mode requires a title attribute for screen readers. Badge text provides inherent labeling. Use aria-label when status context isn't provided by surrounding text.",
  },

  // ── 3. Data Readout ──────────────────────────────────────────────
  {
    slug: "data-readout",
    name: "Data Readout",
    description:
      "Monospace metric displays with dot-separated stats and label+value pairs",
    category: "display",
    base: "rounded-md bg-muted/30 px-4 py-2 font-mono text-xs text-muted-foreground/60",
    hover: "",
    slots: [
      {
        name: "value",
        classes: "text-foreground/60",
      },
      {
        name: "separator",
        classes: "mx-2 text-muted-foreground/30",
      },
    ],
    variants: [],
    tokens: [],
    implementedBy: [
      "hub-operational-pulse.tsx",
      "activity-stats-bar.tsx",
    ],
    composedWith: [],
    a11y: "Dot separators are decorative. Use semantic HTML (dl/dt/dd) for structured data when appropriate. Monospace font aids scanning of numeric values.",
  },

  // ── 4. Timeline ──────────────────────────────────────────────────
  {
    slug: "timeline",
    name: "Timeline",
    description:
      "Vertical activity log with spine connector, category-colored dots, and date column",
    category: "display",
    base: "relative flex gap-4",
    hover: "",
    slots: [
      {
        name: "date",
        classes:
          "w-16 shrink-0 pt-0.5 text-right font-mono text-xs text-muted-foreground",
      },
      {
        name: "spine",
        classes: "relative flex w-4 shrink-0 flex-col items-center",
      },
      {
        name: "dot",
        classes:
          "mt-1 flex h-4 w-4 items-center justify-center rounded-full",
      },
      {
        name: "connector",
        classes: "w-px flex-1 bg-[var(--color-copper)]/20",
      },
      {
        name: "content",
        classes: "min-w-0 flex-1 pb-5",
      },
    ],
    variants: [
      {
        name: "milestone",
        classes: "[&_.dot]:bg-[var(--color-gold)]",
      },
      {
        name: "launch",
        classes: "[&_.dot]:bg-emerald-400",
      },
      {
        name: "iteration",
        classes: "[&_.dot]:bg-[var(--color-copper)]",
      },
      {
        name: "update",
        classes: "[&_.dot]:bg-[var(--color-copper)]/40",
      },
    ],
    tokens: [
      {
        name: "color-gold",
        light: "#d4a574",
        dark: "#d4a574",
      },
      {
        name: "color-copper",
        light: "#c49a6c",
        dark: "#c49a6c",
      },
    ],
    implementedBy: [
      "activity-entry.tsx",
      "activity-full-timeline.tsx",
      "activity-timeline.tsx",
      "hub-activity-panel.tsx",
      "process-activity-tab.tsx",
    ],
    composedWith: ["status-indicator"],
    a11y: "Timeline should use an ordered list (ol) for chronological entries. Dot icons need aria-hidden. Date links should describe the destination.",
  },

  // ── 5. Pipeline Bar ──────────────────────────────────────────────
  {
    slug: "pipeline-bar",
    name: "Pipeline Bar",
    description:
      "Proportional segmented horizontal bar showing status distribution",
    category: "display",
    base: "flex h-3 w-full overflow-hidden rounded-full",
    hover: "",
    slots: [
      {
        name: "segment",
        classes: "transition-all",
      },
      {
        name: "first-segment",
        classes: "rounded-l-full",
      },
      {
        name: "last-segment",
        classes: "rounded-r-full",
      },
    ],
    variants: [
      {
        name: "pending",
        classes: "bg-[var(--color-copper)]/50",
      },
      {
        name: "approved",
        classes: "bg-emerald-400/50",
      },
      {
        name: "in-progress",
        classes: "bg-[var(--color-gold)]/50",
      },
      {
        name: "integrated",
        classes: "bg-blue-400/50",
      },
    ],
    tokens: [
      {
        name: "color-copper",
        light: "#c49a6c",
        dark: "#c49a6c",
      },
      {
        name: "color-gold",
        light: "#d4a574",
        dark: "#d4a574",
      },
    ],
    implementedBy: [
      "process-pipeline-chart.tsx",
      "lifecycle-pipeline.tsx",
      "initiative-lifecycle-bar.tsx",
    ],
    composedWith: [],
    a11y: "Use role='img' with aria-label summarizing the distribution. Each segment should have a title attribute with its label and count.",
  },

  // ── 6. Card List ─────────────────────────────────────────────────
  {
    slug: "card-list",
    name: "Card List",
    description:
      "Compact selectable rows with status indicator, title, metadata, and tree indentation",
    category: "navigation",
    base: "flex w-full items-start gap-2.5 border-l-2 py-2 text-left transition-colors",
    hover: "hover:bg-[var(--color-warm-charcoal)]/60",
    slots: [
      {
        name: "icon",
        classes: "mt-0.5 shrink-0 text-muted-foreground/40",
      },
      {
        name: "title",
        classes: "truncate text-sm font-medium text-foreground/90",
      },
      {
        name: "meta",
        classes:
          "mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/40",
      },
      {
        name: "separator",
        classes: "text-muted-foreground/30",
      },
    ],
    variants: [
      {
        name: "selected",
        classes:
          "border-[var(--color-gold)] bg-[var(--color-dark-bronze)]",
      },
      {
        name: "focused",
        classes:
          "bg-[var(--color-warm-charcoal)]/40 ring-1 ring-inset ring-[var(--color-gold)]/20",
      },
      {
        name: "default",
        classes: "border-transparent",
      },
    ],
    tokens: [
      {
        name: "color-gold",
        light: "#d4a574",
        dark: "#d4a574",
      },
      {
        name: "color-dark-bronze",
        light: "#27272a",
        dark: "#27272a",
      },
      {
        name: "color-warm-charcoal",
        light: "#18181b",
        dark: "#18181b",
      },
    ],
    implementedBy: [
      "process-item-list.tsx",
      "initiative-card.tsx",
      "unified-initiative-card.tsx",
      "app-tile.tsx",
      "primitive-card.tsx",
    ],
    composedWith: ["status-indicator", "badge"],
    a11y: "List items should be buttons or links for keyboard access. Selected state needs aria-selected. Focus ring provides visible focus indicator. Tree indentation uses padding, not nested lists.",
  },

  // ── 7. Section Header ────────────────────────────────────────────
  {
    slug: "section-header",
    name: "Section Header",
    description:
      "Monospace uppercase label in gold above a large serif display heading",
    category: "layout",
    base: "mb-6",
    hover: "",
    slots: [
      {
        name: "label",
        classes:
          "mb-2 block uppercase tracking-widest text-[var(--color-gold)]",
      },
      {
        name: "heading",
        classes: "font-display text-foreground",
      },
    ],
    variants: [],
    tokens: [
      {
        name: "color-gold",
        light: "#d4a574",
        dark: "#d4a574",
      },
    ],
    implementedBy: ["section-header.tsx", "studio-header.tsx"],
    composedWith: [],
    a11y: "Label is decorative context; heading provides the semantic structure. Use appropriate heading level (h1-h6) for document outline.",
  },

  // ── 8. Badge ─────────────────────────────────────────────────────
  {
    slug: "badge",
    name: "Badge",
    description:
      "Categorical indicator pills with semantic color borders, text, and backgrounds",
    category: "indicator",
    base: "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    hover: "",
    slots: [],
    variants: [
      {
        name: "emerald",
        classes: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      },
      {
        name: "amber",
        classes: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
      },
      {
        name: "rose",
        classes: "border-rose-500/40 text-rose-400 bg-rose-500/10",
      },
      {
        name: "blue",
        classes: "border-blue-500/40 text-blue-400 bg-blue-500/10",
      },
      {
        name: "zinc",
        classes: "border-zinc-500/30 text-zinc-500 bg-zinc-500/10",
      },
      {
        name: "gold",
        classes:
          "border-[var(--color-gold)]/50 text-[var(--color-gold)] bg-[var(--color-gold)]/10",
      },
    ],
    tokens: [
      {
        name: "color-gold",
        light: "#d4a574",
        dark: "#d4a574",
      },
    ],
    implementedBy: [
      "status-badge.tsx",
      "kind-badge.tsx",
      "scope-badge.tsx",
      "level-badge.tsx",
      "api-method-badge.tsx",
    ],
    composedWith: [],
    a11y: "Badge text must be readable at small sizes. Ensure sufficient contrast between border/background and text colors. Consider aria-label when badge appears without surrounding context.",
  },
]

// ── Lookup helpers ─────────────────────────────────────────────────

/** All pattern slugs */
export const PATTERN_SLUGS = PATTERNS.map((p) => p.slug)

/** Find a pattern by slug */
export function getPattern(
  slug: string
): PatternDefinition | undefined {
  return PATTERNS.find((p) => p.slug === slug)
}

/** List all patterns in a category */
export function getPatternsByCategory(
  category: PatternDefinition["category"]
): PatternDefinition[] {
  return PATTERNS.filter((p) => p.category === category)
}

/** List all patterns that reference a given token */
export function getPatternsByToken(
  tokenName: string
): PatternDefinition[] {
  return PATTERNS.filter((p) =>
    p.tokens.some((t) => t.name === tokenName)
  )
}
