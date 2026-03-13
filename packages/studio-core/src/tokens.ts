/**
 * Sherpa Design Token Registry
 *
 * Machine-readable catalog of all CSS custom properties declared in
 * apps/studio/src/styles/globals.css. This module provides programmatic
 * access and semantic grouping — the CSS file remains the source of truth.
 *
 * Sync test: src/__tests__/tokens-sync.test.ts
 */

// ── Types ──────────────────────────────────────────────────────────

export type LightDarkPair = {
  readonly light: string
  readonly dark: string
}

// ── Helper ─────────────────────────────────────────────────────────

/** Returns a CSS var() reference for a token name (without --) */
export function cssVar(token: string): string {
  return `var(--${token})`
}

// ── 1. Palette ─────────────────────────────────────────────────────
// Warm legacy palette. Static values (same in light/dark).
// CSS: @theme block in globals.css

export const PALETTE = {
  "color-obsidian": "#08080a",
  "color-warm-charcoal": "#18181b",
  "color-dark-bronze": "#27272a",
  "color-gold": "#d4a574",
  "color-gold-bright": "#e8c49a",
  "color-gold-muted": "#b08a5e",
  "color-copper": "#c49a6c",
  "color-bronze": "#8b7355",
  "color-tarnished": "#6b5a42",
  "color-cream": "#f5f0e8",
  "color-warm-gray": "#9a8e80",
  "color-dim": "#71665a",
  "color-ambient-warm": "#d4a574",
} as const

// ── 2. Semantic Colors ─────────────────────────────────────────────
// shadcn/ui tokens. Light/dark pairs from :root and .dark.

export const SEMANTIC_COLORS = {
  // Core
  background: { light: "#ffffff", dark: "#08080a" },
  foreground: { light: "#09090b", dark: "#e8e4e0" },
  card: { light: "#ffffff", dark: "#0a0a0c" },
  "card-foreground": { light: "#09090b", dark: "#e8e4e0" },
  popover: { light: "#ffffff", dark: "#0a0a0c" },
  "popover-foreground": { light: "#09090b", dark: "#e8e4e0" },
  primary: { light: "#18181b", dark: "#e8e4e0" },
  "primary-foreground": { light: "#fafafa", dark: "#18181b" },
  secondary: { light: "#f4f4f5", dark: "#1a1a1e" },
  "secondary-foreground": { light: "#18181b", dark: "#e8e4e0" },
  muted: { light: "#f4f4f5", dark: "#1a1a1e" },
  "muted-foreground": { light: "#71717a", dark: "#9a8e80" },
  accent: { light: "#f4f4f5", dark: "#1a1a1e" },
  "accent-foreground": { light: "#18181b", dark: "#e8e4e0" },
  destructive: { light: "#ef4444", dark: "#ef4444" },
  border: { light: "#e4e4e7", dark: "#1e1e22" },
  input: { light: "#e4e4e7", dark: "#1e1e22" },
  ring: { light: "#18181b", dark: "#d4a574" },
  // Sidebar
  sidebar: { light: "#f4f4f5", dark: "#0e0e10" },
  "sidebar-foreground": { light: "#09090b", dark: "#e8e4e0" },
  "sidebar-primary": { light: "#18181b", dark: "#e8e4e0" },
  "sidebar-primary-foreground": { light: "#fafafa", dark: "#18181b" },
  "sidebar-accent": { light: "#f4f4f5", dark: "#1a1a1e" },
  "sidebar-accent-foreground": { light: "#18181b", dark: "#e8e4e0" },
  "sidebar-border": { light: "#e4e4e7", dark: "#1e1e22" },
  "sidebar-ring": { light: "#18181b", dark: "#d4a574" },
} as const satisfies Record<string, LightDarkPair>

// ── 3. Domain Colors ───────────────────────────────────────────────
// Panel accent colors for each domain. Light/dark pairs.

export const DOMAIN_COLORS = {
  // Session (indigo)
  "color-session": { light: "#6366f1", dark: "#818cf8" },
  "color-session-bright": { light: "#818cf8", dark: "#a5b4fc" },
  "color-session-muted": { light: "#4f46e5", dark: "#6366f1" },
  // MCP (cyan)
  "color-mcp": { light: "#0891b2", dark: "#22d3ee" },
  "color-mcp-bright": { light: "#22d3ee", dark: "#67e8f9" },
  "color-mcp-muted": { light: "#0e7490", dark: "#06b6d4" },
  // Primitive (emerald)
  "color-primitive": { light: "#059669", dark: "#34d399" },
  "color-primitive-bright": { light: "#34d399", dark: "#6ee7b7" },
  "color-primitive-muted": { light: "#047857", dark: "#10b981" },
  // API (blue)
  "color-api": { light: "#2563eb", dark: "#60a5fa" },
  "color-api-bright": { light: "#60a5fa", dark: "#93c5fd" },
  "color-api-muted": { light: "#1d4ed8", dark: "#3b82f6" },
  // Eclipse/Transit (violet)
  "color-eclipse": { light: "#7c3aed", dark: "#a78bfa" },
  "color-transit": { light: "#7c3aed", dark: "#a78bfa" },
  // Engagement
  "color-engaged": { light: "#18181b", dark: "#e8e4e0" },
  "color-not-engaged": {
    light: "rgba(24, 24, 27, 0.15)",
    dark: "rgba(232, 228, 224, 0.2)",
  },
} as const satisfies Record<string, LightDarkPair>

// ── 4. Chart Colors ────────────────────────────────────────────────
// Chart accent palette. Same values in light and dark mode.

export const CHART_COLORS = {
  "chart-1": "#e76e50",
  "chart-2": "#2a9d90",
  "chart-3": "#274754",
  "chart-4": "#e9c46a",
  "chart-5": "#f4a462",
} as const

// ── 5. Glows ───────────────────────────────────────────────────────
// Ambient glow effects for panels and accents. Light/dark pairs.

export const GLOWS = {
  "glow-gold": {
    light: "rgba(24, 24, 27, 0.08)",
    dark: "rgba(212, 165, 116, 0.04)",
  },
  "glow-copper": {
    light: "rgba(24, 24, 27, 0.06)",
    dark: "rgba(196, 154, 108, 0.03)",
  },
  "glow-session": {
    light: "rgba(99, 102, 241, 0.1)",
    dark: "rgba(129, 140, 248, 0.04)",
  },
  "glow-mcp": {
    light: "rgba(8, 145, 178, 0.1)",
    dark: "rgba(34, 211, 238, 0.04)",
  },
  "glow-primitive": {
    light: "rgba(5, 150, 105, 0.1)",
    dark: "rgba(52, 211, 153, 0.04)",
  },
  "glow-api": {
    light: "rgba(37, 99, 235, 0.1)",
    dark: "rgba(96, 165, 250, 0.04)",
  },
  "glow-eclipse": {
    light: "rgba(124, 58, 237, 0.1)",
    dark: "rgba(167, 139, 250, 0.04)",
  },
  "glow-transit": {
    light: "rgba(124, 58, 237, 0.1)",
    dark: "rgba(167, 139, 250, 0.04)",
  },
} as const satisfies Record<string, LightDarkPair>

// ── 6. Borders ─────────────────────────────────────────────────────
// Domain-tinted border tokens. Light/dark pairs.

export const BORDERS = {
  "border-gold": {
    light: "rgba(24, 24, 27, 0.15)",
    dark: "rgba(212, 165, 116, 0.10)",
  },
  "border-copper": {
    light: "rgba(24, 24, 27, 0.12)",
    dark: "rgba(196, 154, 108, 0.08)",
  },
  "border-mcp": {
    light: "rgba(8, 145, 178, 0.2)",
    dark: "rgba(34, 211, 238, 0.12)",
  },
  "border-primitive": {
    light: "rgba(5, 150, 105, 0.2)",
    dark: "rgba(52, 211, 153, 0.12)",
  },
  "border-api": {
    light: "rgba(37, 99, 235, 0.2)",
    dark: "rgba(96, 165, 250, 0.12)",
  },
} as const satisfies Record<string, LightDarkPair>

// ── 7. Surfaces ────────────────────────────────────────────────────
// Surface hierarchy and glass tokens. Dark-mode specific.

export const SURFACES = {
  // Surface hierarchy
  "surface-primary": "rgba(255, 255, 255, 0.03)",
  "surface-primary-border": "rgba(255, 255, 255, 0.06)",
  "surface-elevated": "rgba(255, 255, 255, 0.05)",
  "surface-elevated-border": "rgba(255, 255, 255, 0.08)",
  "surface-inset": "rgba(0, 0, 0, 0.2)",
  "surface-hover": "rgba(255, 255, 255, 0.06)",
  "surface-hover-border": "rgba(255, 255, 255, 0.10)",
  // Glass tokens
  "glass-bg": "rgba(255, 255, 255, 0.03)",
  "glass-bg-hover": "rgba(255, 255, 255, 0.05)",
  "glass-border": "rgba(255, 255, 255, 0.06)",
  "glass-border-hover": "rgba(255, 255, 255, 0.10)",
  "glass-shadow":
    "0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)",
  "glass-shadow-hover":
    "0 2px 4px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.25)",
  "glass-inner-shadow": "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
} as const

// ── 8. Typography ──────────────────────────────────────────────────
// Font family stacks. Resolved via next/font CSS variables at runtime.

export const TYPOGRAPHY = {
  "font-sans":
    'var(--font-dm-sans), "DM Sans", ui-sans-serif, system-ui, sans-serif',
  "font-mono":
    'var(--font-jetbrains), "JetBrains Mono", ui-monospace, monospace',
  "font-display": 'var(--font-fraunces), "Fraunces", Georgia, serif',
  "font-heading": 'var(--font-fraunces), "Fraunces", Georgia, serif',
} as const

// ── 9. Radii ───────────────────────────────────────────────────────
// Border radius tokens. Base radius defined in :root.

export const RADII = {
  radius: "0.625rem",
  "radius-sm": "calc(var(--radius) - 4px)",
  "radius-md": "calc(var(--radius) - 2px)",
  "radius-lg": "var(--radius)",
  "radius-xl": "calc(var(--radius) + 4px)",
} as const

// ── 10. Sizing ─────────────────────────────────────────────────────
// Component sizing tokens.

export const SIZING = {
  "text-card-title": "1.25rem",
  "text-card-title--line-height": "1.4",
} as const

// ── Aggregate ──────────────────────────────────────────────────────

/** All token category names */
export const TOKEN_CATEGORIES = [
  "palette",
  "semantic",
  "domain",
  "chart",
  "glows",
  "borders",
  "surfaces",
  "typography",
  "radii",
  "sizing",
] as const

export type TokenCategory = (typeof TOKEN_CATEGORIES)[number]

/** All token registries by category */
export const TOKEN_REGISTRY = {
  palette: PALETTE,
  semantic: SEMANTIC_COLORS,
  domain: DOMAIN_COLORS,
  chart: CHART_COLORS,
  glows: GLOWS,
  borders: BORDERS,
  surfaces: SURFACES,
  typography: TYPOGRAPHY,
  radii: RADII,
  sizing: SIZING,
} as const
