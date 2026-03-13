# Vector 1: shadcn/ui Framework Extraction

**Question:** How do React component libraries that depend on shadcn/ui handle packaging and distribution?
**Agent dispatched:** 2026-03-11

## Findings

### shadcn/ui Registry System (`registry:base`)

- **The shadcn registry is a code distribution system, not a package manager.** Components are defined as JSON manifests with inline source code, dependencies, and registryDependencies. The `shadcn build` CLI compiles a `registry.json` into static `public/r/[name].json` files that consumers install via `pnpm dlx shadcn@latest add <url>`. ([shadcn registry getting started](https://ui.shadcn.com/docs/registry/getting-started))

- **Import rewriting is automatic.** Registry items use `@/registry/new-york/ui/button` or `@/components/ui/button` import paths in their source code. When the shadcn CLI installs a component, it reads the consumer's `components.json` aliases and rewrites all imports accordingly. ([components.json docs](https://ui.shadcn.com/docs/components-json))

- **`registryDependencies` is how primitives are declared.** A registry item declares `"registryDependencies": ["button", "card", "input"]` to reference other registry items. The CLI recursively resolves these. Remote URLs also supported. ([registry examples](https://ui.shadcn.com/docs/registry/examples))

- **`registry:base` defines entire design systems** — including config (style, iconLibrary, rsc, tsx, tailwind baseColor) and alias mappings. ([registry examples](https://ui.shadcn.com/docs/registry/examples))

- **Namespaced registries** (e.g., `@plate/`, `@diceui/`, `@acme/`) are configured in the consumer's `components.json` under `"registries"` with URL templates containing `{name}` placeholders. ([registry namespace docs](https://ui.shadcn.com/docs/registry/namespace))

### Plate (Most Mature shadcn-Based Ecosystem)

- **Plate uses the shadcn registry for UI, npm packages for logic.** The `@platejs/*` npm scope contains core editor logic. The `@plate/*` scope is a shadcn registry namespace — `pnpm dlx shadcn@latest add @plate/toolbar` copies component source into the consumer's project. ([Plate installation](https://platejs.org/docs/installation/next))

- **Plate's registry items use standard `@/` aliases that get rewritten on install.** Verified from `https://platejs.org/r/toolbar.json`: the file content contains `import { Separator } from '@/components/ui/separator'` and `import { cn } from '@/lib/utils'`. Rewritten by shadcn CLI. ([platejs.org/r/toolbar.json](https://platejs.org/r/toolbar.json))

- **Plate does NOT bundle shadcn primitives.** Their registryDependencies reference the consumer's existing shadcn installation. ([platejs.org/r/toolbar.json](https://platejs.org/r/toolbar.json))

### Payload CMS

- **Payload does NOT use shadcn/ui.** Their `@payloadcms/ui` uses custom components on `@faceless-ui/*` headless primitives and `@dnd-kit/*`. Not a useful reference for the shadcn extraction problem. ([Payload UI package.json](https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/package.json))

### npm Package Approach (Bundling Primitives)

- **@chroniconl/ui bundles everything.** Published on npm, re-exports 35 shadcn components. Uses relative imports internally (`import { cn } from '../utils/cn'`), NOT `@/` aliases. All Radix packages as direct dependencies. ([chroniconl/ui](https://github.com/chroniconl/ui))

- **Tremor (tremor-raw) also bundles everything.** Uses `tailwind-variants`, `tailwind-merge`, and `clsx` internally. All Radix primitives as direct deps. Relative paths. Builds with Vite + tsc. ([Tremor package.json](https://raw.githubusercontent.com/tremorlabs/tremor/main/package.json))

### Tailwind CSS in Component Libraries

- **Tailwind v4 `@source` directive is the intended solution.** Consumers add `@source "../node_modules/@my-company/ui-lib"` to their CSS. Node_modules is ignored by default. ([Tailwind docs](https://tailwindcss.com/docs/detecting-classes-in-source-files))

- **Library authors should distribute source files** and use only complete, static class names. Dynamic class construction breaks detection. ([Tailwind docs](https://tailwindcss.com/docs/detecting-classes-in-source-files))

### The Four Approaches

| Approach | Example | How @/ handled | Pros | Cons |
|----------|---------|----------------|------|------|
| Bundle primitives (npm) | @chroniconl/ui, tremor | Relative imports | Simple install | Can't customize primitives, version lock |
| shadcn Registry (copy) | Plate, DiceUI, tablecn | CLI rewrites paths | Full customization, ecosystem standard | Components copied not versioned |
| Peer-depend on shadcn | None found | N/A | N/A | shadcn not published as npm package |
| Copy-paste | Magic UI, shadcn-expansions | Manual | Zero overhead | No version control |

## Sources

- [shadcn registry overview](https://ui.shadcn.com/docs/registry) — Registry system docs
- [shadcn registry getting started](https://ui.shadcn.com/docs/registry/getting-started) — How to create registries
- [shadcn registry examples](https://ui.shadcn.com/docs/registry/examples) — All item types
- [shadcn registry-json](https://ui.shadcn.com/docs/registry/registry-json) — Schema spec
- [shadcn registry-item-json](https://ui.shadcn.com/docs/registry/registry-item-json) — Item schema
- [shadcn namespace](https://ui.shadcn.com/docs/registry/namespace) — Namespaced registries
- [shadcn components.json](https://ui.shadcn.com/docs/components-json) — Alias configuration
- [shadcn registry template](https://github.com/shadcn-ui/registry-template) — Official third-party template
- [Plate installation](https://platejs.org/docs/installation/next) — Plate install guide
- [Plate UI installation](https://platejs.org/docs/installation/plate-ui) — Plate UI component install
- [platejs.org/r/toolbar.json](https://platejs.org/r/toolbar.json) — Verified registry item
- [Payload UI package.json](https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/package.json) — No shadcn
- [chroniconl/ui](https://github.com/chroniconl/ui) — Bundled shadcn package
- [Tremor](https://raw.githubusercontent.com/tremorlabs/tremor/main/package.json) — Bundled component library
- [Tailwind class detection](https://tailwindcss.com/docs/detecting-classes-in-source-files) — @source directive
- [Tailwind v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config
- [DiceUI](https://diceui.com/docs/components/data-table) — Registry + noted CLI limitations
- [Magic UI](https://github.com/magicuidesign/magicui) — Copy-paste model

## Raw Links

- https://ui.shadcn.com/docs/registry
- https://ui.shadcn.com/docs/registry/getting-started
- https://ui.shadcn.com/docs/registry/examples
- https://ui.shadcn.com/docs/registry/registry-json
- https://ui.shadcn.com/docs/registry/registry-item-json
- https://ui.shadcn.com/docs/registry/namespace
- https://ui.shadcn.com/docs/registry/authentication
- https://ui.shadcn.com/docs/registry/open-in-v0
- https://ui.shadcn.com/docs/components-json
- https://ui.shadcn.com/schema/registry.json
- https://ui.shadcn.com/schema/registry-item.json
- https://github.com/shadcn-ui/registry-template
- https://registry-template.vercel.app
- https://github.com/shadcn-ui/ui
- https://github.com/shadcn-ui/ui/discussions/9944
- https://github.com/shadcn-ui/ui/discussions/9562
- https://github.com/shadcn-ui/ui/issues/9291
- https://github.com/shadcn-ui/ui/issues/9237
- https://github.com/shadcn-ui/ui/issues/8552
- https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/package.json
- https://github.com/udecode/plate
- https://github.com/udecode/plate/tree/main/packages
- https://platejs.org/docs/installation/next
- https://platejs.org/docs/installation/plate-ui
- https://platejs.org/r/toolbar.json
- https://platejs.org/r/editor.json
- https://raw.githubusercontent.com/udecode/plate/refs/heads/main/apps/www/public/r/toolbar.json
- https://raw.githubusercontent.com/udecode/plate/refs/heads/main/apps/www/components.json
- https://raw.githubusercontent.com/udecode/plate/refs/heads/main/apps/www/registry.json
- https://github.com/hsuanyi-chou/shadcn-ui-expansions
- https://github.com/sadmann7/tablecn
- https://diceui.com/docs/components/data-table
- https://github.com/magicuidesign/magicui
- https://github.com/mehdibha/dotUI
- https://dotui.org
- https://coss.com/ui
- https://github.com/intentui/intentui
- https://github.com/chroniconl/ui
- https://raw.githubusercontent.com/chroniconl/ui/main/package.json
- https://raw.githubusercontent.com/chroniconl/ui/main/src/button.tsx
- https://raw.githubusercontent.com/tremorlabs/tremor/main/package.json
- https://tailwindcss.com/docs/detecting-classes-in-source-files
- https://tailwindcss.com/blog/tailwindcss-v4
- https://pro.platejs.org/docs/components/editor

## Implications

**For monorepo JIT phase:** Path A (relative imports, bundle primitives) is pragmatic. Components are internal packages, not published. Copy the ~19 shadcn primitives into `packages/studio-ui/src/ui/`, rewrite `@/components/ui/*` to `./ui/*`, ship `cn()` as internal utility.

**For future Publishable phase:** Design registry-compatible structure. Plate's model (npm for logic, registry for UI) is the ecosystem standard. A `@sherpa` namespaced registry would let external consumers install components via the shadcn CLI with full customization.

**The hybrid path:** Use relative imports within the package for monorepo use today, but maintain a `registry.json` alongside for future external distribution. Plate does this — source uses `@/` imports, build generates registry JSON.

## Open Questions

1. Should studio-ui bundle its own shadcn primitives or share with apps/web? In the monorepo, both need the same Button.
2. Can a hybrid approach (relative imports for JIT, registry.json for publishable) work without duplicating effort?
3. What about custom shadcn extensions (`collapsible-section`, `chart`) — these must be bundled regardless.
4. Does DiceUI's warning about "the shadcn CLI doesn't handle custom component paths properly" affect deeply nested studio components?
