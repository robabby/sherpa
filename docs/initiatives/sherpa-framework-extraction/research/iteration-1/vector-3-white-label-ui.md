# White-Label Theming, Vocabulary, and Branding Parameterization Patterns

**Research date:** 2026-03-11
**Question:** How do white-label/multi-tenant UI frameworks handle theming, vocabulary customization, and branding parameterization?

---

## Key Discoveries

### 1. Backstage.io: Dual Theming System (MUI + CSS Variables)

Backstage maintains two parallel UI systems with different theming approaches:

- **Legacy (MUI-based):** Uses `createUnifiedTheme` from `@backstage/theme`. Themes are JS objects with palette, typography, spacing, page themes, and component overrides. Registered in `App.tsx` with `{id, title, variant, icon, Provider}`. Multiple themes can be registered and users switch via Settings page. ([Backstage custom theme docs](https://backstage.io/docs/conf/user-interface/))

- **New (BUI / Backstage UI):** Pure CSS-first system using CSS variables. Override via a CSS file imported in `App.tsx`. Variables include backgrounds (`--bui-bg-app`, `--bui-bg-neutral-1` through `-4`, `--bui-bg-solid`), foregrounds (`--bui-fg-primary`, `--bui-fg-secondary`), borders, typography (`--bui-font-regular`, `--bui-font-mono`), spacing (`--bui-space`), and radius (`--bui-radius-1` through `--bui-radius-full`). Components use `.bui-[ComponentName]` class names with `data-` attributes. ([Backstage UI theming](https://ui.backstage.io/theming))

- **Vocabulary/entity customization is limited.** Backstage has fixed "Kinds" (Component, System, Domain, etc.) that don't map cleanly to every organization's terminology. Custom kinds require registering a new processor and JSONSchema — a code-level change, not configuration. The `type` field within kinds is fully user-definable but constrained to a single word with no spaces. Best practice: use Scaffolder templates with dropdown selectors to guide users toward existing types. ([Roadie: Kinds and Types](https://roadie.io/blog/kinds-and-types-in-backstage/), [Backstage extending the model](https://backstage.io/docs/features/software-catalog/extending-the-model/))

- **Key lesson for Sherpa:** Backstage proves that CSS variables are sufficient for visual theming at scale, but vocabulary customization requires a separate system. Their entity model is rigid enough that organizations work around it rather than reconfigure it.

### 2. Payload CMS: Deep Component Swapping + CSS Variables

Payload is the most relevant comparison for Sherpa because it's a Next.js-native admin panel designed for white-labeling.

- **Branding surface:** Logo (login view), Icon (nav), favicon, ogImage, titleSuffix — all configured in the `admin` object of Payload config. About 10 lines of code for basic branding. ([Payload white-label blog](https://dev.to/payloadcms/white-label-the-payload-cms-admin-ui-52hh))

- **CSS variables:** `--theme-elevation-0` through `--theme-elevation-1000`, `--theme-bg`, plus status colors (success/warning/error). Payload auto-inverts elevation colors for dark mode. Full variable list maintained in source code, not docs. Override via custom SCSS file referenced in config. ([Payload CSS customization](https://payloadcms.com/docs/admin/customizing-css), [Payload CSS blog](https://dev.to/payloadcms/how-to-customize-the-look-and-feel-of-payload-with-css-1c05))

- **Component swap points (injection zones):** `beforeDashboard`, `afterDashboard`, `beforeLogin`, `afterLogin`, `beforeNavLinks`, `afterNavLinks`, plus per-collection view overrides (`admin.components.views`) and per-field component overrides (`admin.components.Field`). All custom components are React Server Components by default. ([Payload admin overview](https://payloadcms.com/docs/admin/overview), [Payload custom views](https://payloadcms.com/docs/custom-components/custom-views))

- **Tailwind 4 integration challenge:** Payload uses `data-theme="dark"` (not a CSS class), so Tailwind's dark mode selector must be reconfigured. Tailwind preflight must be disabled to avoid breaking Payload's base styles. Scoping via `twp`/`no-twp` classes is required. ([Payload Tailwind 4 guide](https://payloadcms.com/posts/guides/how-to-theme-the-payload-admin-panel-with-tailwind-css-4))

- **Key lesson for Sherpa:** Payload's injection zone pattern (before/after slots at defined points) is a proven, low-complexity approach to component customization without requiring full component replacement. The elevation-based CSS variable system is elegant for dark-first UIs.

### 3. Strapi: Theme Extension + Translation Override

- **Theme:** `config.theme.light` and `config.theme.dark` objects in `./admin/src/app.js`. Override color tokens like `primary600`. Design system based on Strapi's own component library with Storybook documentation. ([Strapi theme extension docs](https://docs.strapi.io/cms/admin-panel-customization/theme-extension))

- **Logos:** Separate `config.auth.logo` (login) and `config.menu.logo` (nav) — same pattern as Payload. ([Strapi logos docs](https://docs.strapi.io/cms/admin-panel-customization/logos))

- **Translation/vocabulary override:** Strapi uses i18n translation files that can be extended with custom entries like `"Auth.form.email.label": "test"`. Plugins add navigation links via `addMenuLink()` with `intlLabel.id` referencing translation keys. This means vocabulary IS customizable through the i18n system even within a single language. ([Strapi admin customization](https://docs.strapi.io/cms/admin-panel-customization))

- **Injection zones:** Plugins can inject React components into predefined layout areas. ([Strapi plugin admin panel API](https://docs.strapi.io/cms/plugins-development/admin-panel-api))

- **Key lesson for Sherpa:** Strapi demonstrates that i18n translation files are a practical vehicle for vocabulary customization, not just language translation. Override keys for the same language = rename entities.

### 4. Refine: Headless Architecture + UI Library Agnostic

- **Architecture:** Headless React framework — business logic (data providers, auth, access control) is decoupled from UI. Supports Ant Design, Material UI, Mantine, Chakra UI, or custom components. ([Refine GitHub](https://github.com/refinedev/refine))

- **Theming:** Delegates entirely to the chosen UI library. For MUI: `createTheme()` with palette, typography, spacing. Custom variables via TypeScript module augmentation (extend the theme type to store brand-specific values). ([Refine MUI theming](https://refine.dev/core/docs/ui-integrations/material-ui/theming/))

- **White-label pattern:** Nest `ThemeProvider` components — base theme underneath, white-label theme on top. Inner theme overrides outer theme. This is the standard MUI white-label pattern. ([Flatirons: White Label React with MUI](https://flatirons.com/blog/white-label-react-material-u/))

- **Key lesson for Sherpa:** Refine's headless approach is the most flexible but requires the most work from consumers. For Sherpa, a partially-headless approach (own the layout shell, let consumers theme it) is probably the sweet spot.

### 5. shadcn/ui: Registry System as Design System Distribution

This is the most directly relevant technology for Sherpa since Studio already uses shadcn/ui.

- **CSS variable theming:** ~25 semantic tokens (background, foreground, primary, secondary, muted, accent, destructive, border, input, ring, card, sidebar, chart-1 through chart-5) in OKLCH color space. Light/dark via `:root` and `.dark` selectors. ([shadcn/ui theming](https://ui.shadcn.com/docs/theming))

- **Style variants:** `nova`, `vega`, `new-york` (legacy default), `default` — different visual treatments of the same component APIs. New York uses larger border radius (`rounded-lg`), smaller buttons, card shadows, Radix Icons. Default uses `rounded-md`, larger inputs, lucide-react. Structure and color are the same; visual foundation differs. ([shadcndesign comparison](https://www.shadcndesign.com/blog/difference-between-default-and-new-york-style-in-shadcn-ui), [shadcn-ui discussion #2930](https://github.com/shadcn-ui/ui/discussions/2930))

- **`registry:base` — complete design system in one install.** New in 2025/2026. A `registry:base` item defines style, iconLibrary, Tailwind config, dependencies, CSS variables (light + dark), fonts, and import aliases. One `npx shadcn add` installs the entire design system. Fonts are now a first-class registry type with family, provider, import, and CSS variable mapping. ([shadcn/ui registry docs](https://ui.shadcn.com/docs/registry), [shadcn/ui registry examples](https://ui.shadcn.com/docs/registry/examples))

- **Custom registries with namespaces and auth.** Third-party registries use namespace prefixes (`@myorg/button`). Support for private registries with auth headers. MCP server integration for AI-native component discovery. ([shadcn/ui registry intro](https://ui.shadcn.com/docs/registry))

- **Key lesson for Sherpa:** `registry:base` is the distribution mechanism. Sherpa Studio's design system should be a shadcn registry that consumers override with their own `registry:base`. This means Sherpa ships: base components (governance UI), base theme (CSS variables), and consumers install then override variables. No fork required.

### 6. Vocabulary/Terminology Customization Patterns

Three patterns emerged across frameworks:

**Pattern A: i18n namespace override (Strapi, i18next)**
Use the same i18n infrastructure for vocabulary customization within a single language. Default namespace provides base terms ("initiative", "proposal", "task"). Tenant namespace overrides specific keys ("project", "RFC", "ticket"). i18next supports this natively with namespace fallback chains. ([i18next namespaces](https://www.i18next.com/principles/namespaces), [Strapi admin customization](https://docs.strapi.io/cms/admin-panel-customization))

**Pattern B: Jira-style terminology configuration**
Jira has a dedicated "Configuring Terminology" admin feature that renames "sprint" and "epic" globally. Limitations: only English, doesn't affect JQL queries, database still stores original terms, capitalization varies by context. ([Atlassian terminology docs](https://confluence.atlassian.com/adminjiraserver/configuring-terminology-1063561685.html), [Atlassian community](https://community.atlassian.com/forums/Jira-questions/Terminology-changes-in-Jira-Cloud-eg-sprint/qaq-p/2956141))

**Pattern C: Config object + React Context (multi-tenant React apps)**
TypeScript config object defining all entity labels, passed via React Context. Components consume labels from context rather than hardcoding. Most type-safe approach but requires every component to use the context. ([Multi-Tenant React App](https://github.com/Sandeep821/Multi-Tenant-React-App), [Kent C. Dodds: React Context](https://kentcdodds.com/blog/how-to-use-react-context-effectively))

**Pattern D: Backstage custom kinds (code-level)**
Register new entity processors and JSONSchema validators. Most powerful, most work. Inappropriate for simple renames. ([Backstage extending the model](https://backstage.io/docs/features/software-catalog/extending-the-model/))

### 7. Minimum Viable White-Label Surface

Across all frameworks and SaaS platforms studied, the consensus minimum viable set is:

1. **Logo** (login + nav icon) — two assets, immediate brand recognition
2. **Primary color** (+ foreground) — a single accent color changes the entire feel
3. **Custom domain** — `studio.clientname.com` eliminates vendor presence entirely
4. **Favicon + page title suffix** — browser tab branding

This is "Level 1" white-labeling. Every platform studied starts here. ([PayPro Global guide](https://payproglobal.com/how-to/start-white-label-saas/), [GoHighLevel guide](https://blog.gohighlevel.com/white-label-saas-a-beginners-guide-for-agencies-entrepreneurs/), [Agency Handy](https://www.agencyhandy.com/white-label-saas/))

**Level 2** adds: full color palette, typography (font family), dark/light mode customization, email templates, notification branding.

**Level 3** adds: vocabulary/terminology, component-level overrides, custom navigation, injection zones for custom content.

**Key finding:** For a governance/task UI specifically, vocabulary customization (Level 3) matters more than in other domains. "Initiative" vs "project" vs "epic" is not cosmetic — it signals whether the tool understands your process. Logo + colors alone make it look branded; vocabulary makes it feel native.

---

## Multi-Tenant Theming Architecture Pattern

The most production-ready pattern for Next.js + Tailwind + shadcn/ui (from [mandyHellz/multi-tenant-frontend](https://github.com/mandyHellz/multi-tenant-frontend)):

1. **Tenant resolution:** Host-based (subdomain) or route-based (`/tenants/:id`), resolved at middleware/edge
2. **Remote config:** Each tenant defined by a JSON file with branding, SEO, design tokens, and page structure
3. **Token injection:** Layout component loads tenant config, applies CSS variables as custom properties on a wrapper element
4. **Section registry:** Components selected by `type` + `variant` from config — avoids `if (tenant === 'x')` checks entirely
5. **No code forks:** All tenants run the same codebase; differences are pure configuration

---

## Sources

### Backstage.io
- [Backstage custom theme docs](https://backstage.io/docs/conf/user-interface/) — Official theming documentation
- [Backstage UI theming](https://ui.backstage.io/theming) — BUI CSS variable system
- [Backstage getting started theme](https://backstage.io/docs/getting-started/app-custom-theme/) — Theme creation guide
- [Backstage extending the model](https://backstage.io/docs/features/software-catalog/extending-the-model/) — Custom entity kinds
- [Backstage system model](https://backstage.io/docs/features/software-catalog/system-model/) — Entity terminology
- [Roadie: Kinds and Types](https://roadie.io/blog/kinds-and-types-in-backstage/) — Vocabulary customization limitations
- [Kosli: Backstage customization](https://www.kosli.com/blog/succeeding-with-backstage-part-1-customizing-the-look-and-feel-of-backstage/) — Practical theming walkthrough
- [eXXcellent: Backstage corporate theme](https://tech-blog.exxcellent.de/posts/2024-01-10-backstage-part1-customizing/backstage-part1-customizing) — Corporate theme implementation

### Payload CMS
- [Payload white-label landing](https://payloadcms.com/white-label-cms-admin-panel) — White-label overview
- [Payload white-label blog](https://dev.to/payloadcms/white-label-the-payload-cms-admin-ui-52hh) — Step-by-step branding guide
- [Payload admin overview](https://payloadcms.com/docs/admin/overview) — Admin panel documentation
- [Payload CSS customization](https://payloadcms.com/docs/admin/customizing-css) — CSS variable override docs
- [Payload CSS blog](https://dev.to/payloadcms/how-to-customize-the-look-and-feel-of-payload-with-css-1c05) — CSS variable list and patterns
- [Payload Tailwind 4 guide](https://payloadcms.com/posts/guides/how-to-theme-the-payload-admin-panel-with-tailwind-css-4) — Tailwind 4 integration
- [Payload custom views](https://payloadcms.com/docs/custom-components/custom-views) — View customization
- [Payload root components](https://payloadcms.com/docs/custom-components/root-components) — Injection zone list
- [Payload component swapping](https://payloadcms.com/docs/admin/components) — Component override system
- [Payload custom providers](https://payloadcms.com/docs/custom-components/custom-providers) — Context provider injection
- [Payload theme manager plugin](https://github.com/Lionel-Dutrieux/payloadcms-theme-manager) — Community theme manager
- [Payload @payloadcms/ui RFC](https://github.com/payloadcms/payload/discussions/15543) — Future Tailwind + styles API

### Strapi
- [Strapi admin customization](https://docs.strapi.io/cms/admin-panel-customization) — Main admin customization docs
- [Strapi theme extension](https://docs.strapi.io/cms/admin-panel-customization/theme-extension) — Theme override config
- [Strapi logos](https://docs.strapi.io/cms/admin-panel-customization/logos) — Logo customization
- [Strapi plugin admin API](https://docs.strapi.io/cms/plugins-development/admin-panel-api) — Injection zones and menu API
- [Strapi design system](https://design-system.strapi.io/) — Storybook reference

### Refine
- [Refine GitHub](https://github.com/refinedev/refine) — Source and architecture overview
- [Refine MUI theming](https://refine.dev/core/docs/ui-integrations/material-ui/theming/) — Material UI theming integration
- [Refine vs React Admin](https://marmelab.com/blog/2023/07/04/react-admin-vs-refine.html) — Architecture comparison
- [Flatirons: White Label React with MUI](https://flatirons.com/blog/white-label-react-material-u/) — Nested ThemeProvider pattern

### shadcn/ui
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming) — CSS variable theming docs
- [shadcn/ui registry intro](https://ui.shadcn.com/docs/registry) — Registry system overview
- [shadcn/ui registry getting started](https://ui.shadcn.com/docs/registry/getting-started) — Registry creation guide
- [shadcn/ui registry examples](https://ui.shadcn.com/docs/registry/examples) — registry:base schema and examples
- [shadcn/ui registry directory](https://ui.shadcn.com/docs/directory) — Community registry index
- [shadcn/ui changelog](https://ui.shadcn.com/docs/changelog) — Recent features (OKLCH, registry:base, fonts)
- [shadcn/ui CLI v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — March 2026 CLI release
- [shadcn/ui registry template](https://github.com/shadcn-ui/registry-template) — Official registry starter
- [DeepWiki: shadcn architecture](https://deepwiki.com/shadcn-ui/ui/2-architecture) — Style system internals
- [DeepWiki: CSS variable management](https://deepwiki.com/shadcn-ui/ui/4.6-css-variable-and-theme-management) — Token management internals
- [shadcndesign: New York vs Default](https://www.shadcndesign.com/blog/difference-between-default-and-new-york-style-in-shadcn-ui) — Style comparison
- [shadcn-ui discussion #2930](https://github.com/shadcn-ui/ui/discussions/2930) — Community style discussion
- [registry.directory](https://registry.directory/) — Community registry explorer
- [Vercel: creating registry file](https://vercel.com/academy/shadcn-ui/creating-a-shadcn-registry-file) — Registry tutorial

### v0 / AI Design Systems
- [v0 design systems](https://v0.app/docs/design-systems) — Registry as AI context distribution

### Vocabulary/Terminology
- [Jira configuring terminology](https://confluence.atlassian.com/adminjiraserver/configuring-terminology-1063561685.html) — Sprint/epic renaming
- [Jira flexible terminology](https://confluence.atlassian.com/jiracore/flexible-terminology-1031282393.html) — Terminology feature overview
- [Jira community: terminology changes](https://community.atlassian.com/forums/Jira-questions/Terminology-changes-in-Jira-Cloud-eg-sprint/qaq-p/2956141) — Limitations discussion
- [i18next namespaces](https://www.i18next.com/principles/namespaces) — Namespace architecture for vocabulary
- [next-intl docs](https://next-intl.dev/) — Next.js i18n library
- [next-intl configuration](https://next-intl.dev/docs/usage/configuration) — Request-level config for tenant override
- [react-i18next namespace guide](https://linguinecode.com/post/react-i18next-namespaces) — Namespace implementation
- [react-i18next multiple files](https://react.i18next.com/guides/multiple-translation-files) — Multi-file translation loading

### Multi-Tenant Architecture
- [mandyHellz/multi-tenant-frontend](https://github.com/mandyHellz/multi-tenant-frontend) — Next.js multi-tenant with design tokens + section registry
- [Multi-Tenant React App](https://github.com/Sandeep821/Multi-Tenant-React-App) — Customizable style, UI, verbiage per tenant
- [Clerk: multi-tenancy guide](https://clerk.com/articles/multi-tenancy-in-react-applications-guide) — Auth-based multi-tenancy
- [Kent C. Dodds: React Context](https://kentcdodds.com/blog/how-to-use-react-context-effectively) — Context provider patterns

### White-Label SaaS Strategy
- [PayPro Global guide](https://payproglobal.com/how-to/start-white-label-saas/) — Starting a white-label SaaS
- [GoHighLevel guide](https://blog.gohighlevel.com/white-label-saas-a-beginners-guide-for-agencies-entrepreneurs/) — White-label branding guide
- [Agency Handy](https://www.agencyhandy.com/white-label-saas/) — Top white-label platforms compared
- [SaaS Custom Domains](https://saascustomdomains.com/) — Custom domain infrastructure
- [Unlayer: white-label editor](https://unlayer.com/blog/how-to-white-label-embeddable-editor) — Embeddable white-label patterns
- [Wildnet Edge: build white-label SaaS](https://www.wildnetedge.com/blogs/how-to-build-a-white-label-saas-product-for-multi-branding-success) — Multi-branding architecture

---

## Raw Link List

```
https://backstage.io/docs/conf/user-interface/
https://ui.backstage.io/theming
https://backstage.io/docs/getting-started/app-custom-theme/
https://backstage.io/docs/features/software-catalog/extending-the-model/
https://backstage.io/docs/features/software-catalog/system-model/
https://roadie.io/blog/kinds-and-types-in-backstage/
https://www.kosli.com/blog/succeeding-with-backstage-part-1-customizing-the-look-and-feel-of-backstage/
https://tech-blog.exxcellent.de/posts/2024-01-10-backstage-part1-customizing/backstage-part1-customizing
https://payloadcms.com/white-label-cms-admin-panel
https://payloadcms.com/posts/blog/white-label-admin-ui
https://dev.to/payloadcms/white-label-the-payload-cms-admin-ui-52hh
https://payloadcms.com/docs/admin/overview
https://payloadcms.com/docs/admin/customizing-css
https://payloadcms.com/posts/blog/how-to-customize-the-look-and-feel-of-payload-with-css
https://dev.to/payloadcms/how-to-customize-the-look-and-feel-of-payload-with-css-1c05
https://payloadcms.com/posts/guides/how-to-theme-the-payload-admin-panel-with-tailwind-css-4
https://payloadcms.com/docs/custom-components/custom-views
https://payloadcms.com/docs/custom-components/root-components
https://payloadcms.com/docs/admin/components
https://payloadcms.com/docs/custom-components/custom-providers
https://github.com/Lionel-Dutrieux/payloadcms-theme-manager
https://github.com/payloadcms/payload/discussions/15543
https://www.buildwithmatija.com/blog/payload-cms-custom-admin-ui-components-guide
https://docs.strapi.io/cms/admin-panel-customization
https://docs.strapi.io/cms/admin-panel-customization/theme-extension
https://docs.strapi.io/cms/admin-panel-customization/logos
https://docs.strapi.io/cms/plugins-development/admin-panel-api
https://design-system.strapi.io/
https://github.com/refinedev/refine
https://refine.dev/core/docs/ui-integrations/material-ui/theming/
https://marmelab.com/blog/2023/07/04/react-admin-vs-refine.html
https://flatirons.com/blog/white-label-react-material-u/
https://ui.shadcn.com/docs/theming
https://ui.shadcn.com/docs/registry
https://ui.shadcn.com/docs/registry/getting-started
https://ui.shadcn.com/docs/registry/examples
https://ui.shadcn.com/docs/directory
https://ui.shadcn.com/docs/changelog
https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
https://github.com/shadcn-ui/registry-template
https://deepwiki.com/shadcn-ui/ui/2-architecture
https://deepwiki.com/shadcn-ui/ui/4.6-css-variable-and-theme-management
https://www.shadcndesign.com/blog/difference-between-default-and-new-york-style-in-shadcn-ui
https://github.com/shadcn-ui/ui/discussions/2930
https://registry.directory/
https://vercel.com/academy/shadcn-ui/creating-a-shadcn-registry-file
https://v0.app/docs/design-systems
https://confluence.atlassian.com/adminjiraserver/configuring-terminology-1063561685.html
https://confluence.atlassian.com/jiracore/flexible-terminology-1031282393.html
https://community.atlassian.com/forums/Jira-questions/Terminology-changes-in-Jira-Cloud-eg-sprint/qaq-p/2956141
https://www.i18next.com/principles/namespaces
https://next-intl.dev/
https://next-intl.dev/docs/usage/configuration
https://linguinecode.com/post/react-i18next-namespaces
https://react.i18next.com/guides/multiple-translation-files
https://github.com/mandyHellz/multi-tenant-frontend
https://github.com/Sandeep821/Multi-Tenant-React-App
https://clerk.com/articles/multi-tenancy-in-react-applications-guide
https://kentcdodds.com/blog/how-to-use-react-context-effectively
https://payproglobal.com/how-to/start-white-label-saas/
https://blog.gohighlevel.com/white-label-saas-a-beginners-guide-for-agencies-entrepreneurs/
https://www.agencyhandy.com/white-label-saas/
https://saascustomdomains.com/
https://unlayer.com/blog/how-to-white-label-embeddable-editor
https://www.wildnetedge.com/blogs/how-to-build-a-white-label-saas-product-for-multi-branding-success
```

---

## Implications for Sherpa White-Label Strategy

### Recommended Architecture: Three-Layer Customization

**Layer 1 — Visual Theme (CSS variables, zero code)**
Ship Sherpa Studio with a `sherpa-base` shadcn registry (`registry:base`) defining default CSS variables, fonts, and tokens. Consumers override by defining their own CSS variables in their project's `globals.css`. This is the shadcn-native way — no special framework needed. Sherpa's "Modern Mystic" theme becomes one such override.

Minimum variable set for Sherpa:
```
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--card, --card-foreground
--border, --input, --ring
--sidebar-*, --chart-1 through --chart-5
--radius
--font-sans, --font-mono
```

**Layer 2 — Branding Assets (config object, zero code)**
A `SherpaConfig` object (or `sherpa.config.ts` file) for:
- `logo` (nav), `loginLogo`, `favicon`, `ogImage`
- `meta.titleSuffix`
- `theme.defaultMode: 'light' | 'dark'`

This mirrors Payload's proven pattern. Passed via React Context, consumed by shell components.

**Layer 3 — Vocabulary (i18n namespace, low code)**
Use next-intl (already Next.js-native) with a `sherpa` default namespace containing all entity labels:

```json
{
  "entity.initiative": "Initiative",
  "entity.initiative.plural": "Initiatives",
  "entity.proposal": "Proposal",
  "entity.task": "Task",
  "entity.workstream": "Workstream",
  "status.pending": "Pending",
  "status.approved": "Approved",
  "status.in-progress": "In Progress",
  "status.integrated": "Integrated"
}
```

Consumers provide their own namespace file that overrides any subset. WavePoint keeps the defaults. A consulting client might rename "Initiative" to "Project" and "Proposal" to "RFC" — one JSON file, no code changes.

### Why Not Deeper Customization Initially

Payload's injection zones (beforeDashboard, etc.) and Backstage's component override system are powerful but complex. For Sherpa's initial extraction:

1. **CSS variables handle 80% of "feel mine" perception** (logo + colors + fonts)
2. **Vocabulary handles the remaining 20%** for governance tools specifically
3. **Component-level overrides are a Phase 2 concern** — add injection zones when the first non-WavePoint consumer requests them

### Distribution Strategy

Use shadcn's registry system:
- `@sherpa/studio` — registry with governance components (initiative cards, task boards, proposal views)
- Each consumer runs `npx shadcn add @sherpa/studio/initiative-board` etc.
- Consumer's `registry:base` (their design system) takes precedence for CSS variables
- Sherpa's components use semantic tokens (`bg-primary`, `text-muted-foreground`) — never hardcoded colors

This means Sherpa's "Modern Mystic" dark theme with gold accents is just one `registry:base` consuming the same `@sherpa/studio` components that another project might render in corporate blue on white.

---

## Open Questions

1. **Vocabulary type safety:** If we use next-intl for vocabulary, how do we ensure type safety so that adding a new entity label in Sherpa forces consumers to provide a translation? TypeScript plugin for next-intl? Zod schema for the vocabulary config?

2. **Component variant vs. component override:** Should governance components (e.g., initiative card) support shadcn-style `variant` props for visual treatments, or should consumers override entire components? Variants are safer but less flexible.

3. **Dark/light mode ownership:** Does Sherpa enforce dark-first (like WavePoint), or does the consumer's `registry:base` control the default mode? Payload uses `data-theme` attribute; shadcn uses `.dark` class. Need to pick one convention.

4. **Registry versioning:** When Sherpa ships a component update, how do consumers adopt it? shadcn's model is "copy source code" — updates are opt-in. This is good for stability but bad for security patches. Need a strategy for breaking vs. non-breaking component changes.

5. **Custom domain infrastructure:** If Sherpa Studio is deployed as a SaaS (not just self-hosted), what infrastructure handles custom domains? [SaaS Custom Domains](https://saascustomdomains.com/) documents the patterns, but it's a non-trivial infrastructure concern.

6. **MCP server branding:** The MCP server is 100% domain-agnostic today. Should vocabulary customization extend to MCP tool names and descriptions? An AI agent calling `list_initiatives` vs. `list_projects` is a real UX concern for agent-native consumers.
