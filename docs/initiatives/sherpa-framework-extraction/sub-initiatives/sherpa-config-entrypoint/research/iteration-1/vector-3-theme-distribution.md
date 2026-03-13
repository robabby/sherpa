# Vector 3: Theme Distribution via shadcn Registry

**Question:** How should a white-label framework package, distribute, and apply visual themes using shadcn's registry system?
**Agent dispatched:** 2026-03-12

## Findings

### 1. shadcn `registry:base` — Foundation for Design Systems

- **`registry:base`** is the most comprehensive registry item type — defines an entire design system foundation. Unlike `registry:theme` (colors only) or `registry:style` (component-level styling), it includes configuration, dependencies, CSS variables, fonts, and icon library selection.
- **12 registry item types exist:** `registry:base`, `registry:theme`, `registry:style`, `registry:font`, `registry:component`, `registry:ui`, `registry:block`, `registry:hook`, `registry:lib`, `registry:page`, `registry:file`, `registry:item`
  - Source: https://ui.shadcn.com/docs/registry/registry-item-json
- **A `registry:base` has a unique `config` field** (rawConfigSchema) setting style name, icon library, base color, and tailwind options.
- **Complete design system = `registry:base` + `registry:theme` + `registry:font` + optionally `registry:style`.**

**Concrete example:**
```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "custom-base",
  "type": "registry:base",
  "config": {
    "style": "custom-base",
    "iconLibrary": "lucide",
    "tailwind": { "baseColor": "neutral" }
  },
  "dependencies": ["class-variance-authority", "tw-animate-css", "lucide-react"],
  "registryDependencies": ["utils", "font-inter"],
  "cssVars": {
    "light": { "background": "oklch(1 0 0)", "primary": "oklch(0.21 0.006 285.885)" },
    "dark": { "background": "oklch(0.141 0.005 285.823)", "primary": "oklch(0.985 0 0)" }
  }
}
```

### 2. shadcn Theming (Tailwind v4)

**Two-layer CSS variable system:**
1. `:root` and `.dark` selectors define actual color values (semantic tokens like `--background`, `--primary`)
2. `@theme inline` directive maps those to Tailwind utility classes via `--color-*` namespace variables

**Complete CSS variable set (~28 core vars):**
`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--input`, `--ring`, `--chart-1` through `--chart-5`, `--radius`, `--sidebar` (+ foreground, primary, accent, border, ring variants)

**Color format:** OKLCH (`oklch(0.205 0 0)`) is the current standard.

**Tailwind v4 changes:**
- Config moved from `tailwind.config.js` to `@theme` directive in CSS
- `@theme inline` resolves variable references at definition time
- `@custom-variant dark (&:is(.dark *))` replaces v3 dark mode plugin

### 3. Ecosystem Theme Packaging Patterns

- **DaisyUI (35 built-in themes):** Themes as CSS variable sets in `@plugin "daisyui/theme" {}` blocks. `data-theme` HTML attribute for scoping. No JS runtime needed.
- **Mantine:** JS-first `createTheme()` + `mergeThemeOverrides()` for deep merge. 10-shade arrays per color. `MantineProvider` for context.
- **Chakra UI:** `defineConfig()` + `createSystem()`. CSS vars follow `--chakra-[category]-[name]`. Semantic tokens support conditional values.
- **Radix Themes:** Component-prop approach: `<Theme accentColor="mint" grayColor="gray" radius="full">`.

**Industry convergence:** CSS variables as the theme primitive, with a typed JS config layer on top. shadcn is the most advanced — separates color values from utility-class generation.

### 4. Font Distribution

**shadcn `registry:font` type:**
```json
{
  "name": "font-playfair-display",
  "type": "registry:font",
  "font": {
    "family": "'Playfair Display Variable', serif",
    "provider": "google",
    "import": "Playfair_Display",
    "variable": "--font-heading",
    "subsets": ["latin"],
    "selector": "h1, h2, h3, h4, h5, h6"
  }
}
```

**Installation (from `update-fonts.ts`):**
- **Next.js:** CLI modifies `app/layout.tsx` via ts-morph AST — adds `next/font/google` import, creates font instance, adds `.className` to `<html>`.
- **Non-Next.js:** Falls back to `@fontsource-variable/*` packages with `@import` in CSS.
- **Selector support:** `selector` field scopes fonts to specific elements.

### 5. Dark/Light Mode

- **shadcn uses class-based toggle** via `next-themes` with `attribute="class"`.
- `.dark` class on `<html>`, managed by `ThemeProvider`.
- CSS variables defined twice: `:root` for light, `.dark` for dark.
- `suppressHydrationWarning` on `<html>` prevents React hydration mismatch.
- **White-label:** Each theme must provide both `light` and `dark` CSS variable sets. Dark-only themes set both to same dark values.

### 6. Theme Validation

**shadcn has Zod schemas for everything:**
```typescript
export const registryItemCssVarsSchema = z.object({
  theme: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
})
```

**What's NOT validated:** shadcn validates structure but does NOT check that all required CSS variables are present. Missing `--primary` → component renders with no color, silently.

**Sherpa should add a validation layer:**
```typescript
const REQUIRED_THEME_VARS = [
  'background', 'foreground', 'primary', 'primary-foreground',
  'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'border', 'input', 'ring',
  'card', 'card-foreground', 'popover', 'popover-foreground',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
] as const
```

### 7. shadcn Registry as CDN

**Complete distribution pipeline:**
1. Create `registry.json` with items array
2. Run `pnpm shadcn build` — outputs individual JSON files to `public/r/`
3. Deploy to any HTTP server
4. Consumers configure `components.json`:
   ```json
   { "registries": { "@sherpa": "https://registry.sherpa.dev/r/{name}.json" } }
   ```
5. Install: `npx shadcn add @sherpa/modern-mystic-theme`

**Authentication:** Private registries support Bearer tokens, API keys, query parameters.

**Preset system:** shadcn's `presetSchema` bundles `base` + `style` + `theme` + `font` + `iconLibrary` + `radius` + `menuAccent` + `menuColor`. Current presets: Nova, Vega, Maia, Lyra, Mira.

## Sources

- [shadcn registry overview](https://ui.shadcn.com/docs/registry) — Distribution system
- [shadcn registry getting started](https://ui.shadcn.com/docs/registry/getting-started) — Create, build, serve
- [shadcn registry-item-json](https://ui.shadcn.com/docs/registry/registry-item-json) — Full JSON spec (12 types)
- [shadcn registry examples](https://ui.shadcn.com/docs/registry/examples) — All registry types
- [shadcn registry namespace](https://ui.shadcn.com/docs/registry/namespace) — @namespace/item syntax
- [shadcn registry authentication](https://ui.shadcn.com/docs/registry/authentication) — Private registries
- [shadcn theming](https://ui.shadcn.com/docs/theming) — CSS variables, OKLCH
- [shadcn dark mode](https://ui.shadcn.com/docs/dark-mode/next) — next-themes integration
- [shadcn components.json](https://ui.shadcn.com/docs/components-json) — Config spec
- [shadcn CLI](https://ui.shadcn.com/docs/cli) — init, add, build commands
- [shadcn registry-item schema](https://ui.shadcn.com/schema/registry-item.json) — Raw JSON schema
- [shadcn registry/schema.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/registry/schema.ts) — Zod schemas
- [shadcn update-css-vars.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/utils/updaters/update-css-vars.ts) — CSS injection
- [shadcn update-fonts.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/utils/updaters/update-fonts.ts) — Font installation
- [shadcn add-components.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/utils/add-components.ts) — Installation pipeline
- [shadcn presets.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/preset/presets.ts) — Preset system
- [Tailwind v4 @theme](https://tailwindcss.com/docs/theme) — CSS variable namespaces
- [DaisyUI themes](https://daisyui.com/docs/themes/) — CSS-only theming
- [Mantine theme object](https://mantine.dev/theming/theme-object/) — JS-first theming
- [Chakra UI customization](https://chakra-ui.com/docs/theming/customization/overview) — defineConfig pattern
- [Radix Themes](https://www.radix-ui.com/themes/docs/theme/overview) — Component-prop approach
- [Next.js fonts](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) — next/font

## Raw Links

- https://ui.shadcn.com/docs/registry
- https://ui.shadcn.com/docs/registry/getting-started
- https://ui.shadcn.com/docs/registry/registry-item-json
- https://ui.shadcn.com/docs/registry/registry-json
- https://ui.shadcn.com/docs/registry/examples
- https://ui.shadcn.com/docs/registry/namespace
- https://ui.shadcn.com/docs/registry/authentication
- https://ui.shadcn.com/docs/theming
- https://ui.shadcn.com/docs/dark-mode
- https://ui.shadcn.com/docs/dark-mode/next
- https://ui.shadcn.com/docs/components-json
- https://ui.shadcn.com/docs/cli
- https://ui.shadcn.com/schema/registry-item.json
- https://ui.shadcn.com/themes
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/registry/schema.ts
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/utils/updaters/update-css-vars.ts
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/utils/updaters/update-fonts.ts
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/utils/add-components.ts
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/preset/presets.ts
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/registry/constants.ts
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/registry/config.ts
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/registry/builder.ts
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/registry/validator.ts
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/registry/resolver.ts
- https://tailwindcss.com/docs/theme
- https://daisyui.com/docs/themes/
- https://mantine.dev/theming/theme-object/
- https://chakra-ui.com/docs/theming/customization/overview
- https://www.radix-ui.com/themes/docs/theme/overview
- https://nextjs.org/docs/app/building-your-application/optimizing/fonts

## Implications

1. **Use shadcn's registry as-is.** The `registry:base` + `registry:theme` + `registry:font` composition is the right architecture. Don't invent a custom theme format.
2. **Sherpa theme = shadcn preset.** Model `sherpa.config.ts` theme field after `presetSchema`: `{ base, style, theme, font, iconLibrary }`.
3. **Theme validation gap is real.** Sherpa must add variable completeness checking — shadcn doesn't validate required CSS vars are present.
4. **Font distribution works out of the box.** `registry:font` with `selector` handles body/heading split. CLI handles framework-specific installation.
5. **Registry CDN path:** `https://registry.sherpa.dev/r/{name}.json`. Consumers add `@sherpa` namespace to `components.json`.
6. **WavePoint custom variables** (`--glass-bg`, `--glow-gold`, etc.) go beyond shadcn standard set — define as WavePoint-specific extensions, not required by base theme schema.

## Open Questions

1. Should Sherpa themes extend shadcn's variable set or replace it? `extends: "none"` exists but loses component compatibility.
2. How does `registry:style` interact with theme switching? Style files are massive (~55KB CSS). Ship own style or extend `new-york-v4`?
3. Runtime theme switching vs build-time application? Registry is build-time; SaaS multi-tenant needs runtime approach.
4. Google Fonts only? `registry:font` schema is `z.literal("google")`. Local/custom fonts need different mechanism.
5. Upgrade path when shadcn adds new CSS variables? Theme versioning contract needed.
