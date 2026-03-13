# Config-as-Code Deep Dive: Designing `sherpa.config.ts`

**Research date:** 2026-03-11
**Question:** What should a `sherpa.config.ts` config-as-code entrypoint look like for a white-label governance/workflow framework?
**Iteration:** 2, Vector 1 (of iteration-2)

---

## Key Discoveries

### 1. Payload CMS `buildConfig()` — The Primary Model

Payload CMS is the closest structural analog. Its config system has these properties:

- **Single entrypoint:** `payload.config.ts` exports a default `buildConfig()` call that returns a validated, typed config object. ([Payload config docs](https://payloadcms.com/docs/configuration/overview), [GitHub source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts))

- **Two required fields:** `secret` (string for encryption) and `db` (database adapter). Everything else has sensible defaults. This is a critical design insight — the config should work with just 2-3 required fields.

- **Top-level properties** (extracted from Payload's raw docs):
  - `admin` — Admin panel config (branding, components, custom views)
  - `collections` — Array of content type definitions
  - `globals` — Array of singleton content definitions
  - `plugins` — Array of plugin functions
  - `db` — Database adapter (required)
  - `editor` — Rich text editor adapter
  - `email` — Email adapter
  - `endpoints` — Custom REST endpoints
  - `hooks` — Root-level hooks
  - `i18n` — Admin UI languages
  - `localization` — Content localization
  - `cors` / `csrf` — Security config
  - `routes` — Route structure customization
  - `typescript` — Type generation config
  - `custom` — Arbitrary extension data for plugins
  - `onInit` — Startup callback

- **Minimal config example** (from Payload docs):
  ```ts
  import { buildConfig } from 'payload'
  import { mongooseAdapter } from '@payloadcms/db-mongodb'

  export default buildConfig({
    secret: process.env.PAYLOAD_SECRET,
    db: mongooseAdapter({ url: process.env.DATABASE_URL }),
    collections: [
      {
        slug: 'pages',
        fields: [{ name: 'title', type: 'text' }],
      },
    ],
  })
  ```

- **Key takeaway for Sherpa:** `buildConfig()` pattern is the right entrypoint. Two required fields, everything else optional with defaults. The function validates the config and returns a sanitized version.

### 2. Payload Plugin System — The Curried Pattern

Payload's plugin system is the most relevant for Sherpa because it uses a functional composition pattern:

- **Plugin type signature** (from [Payload plugin docs](https://payloadcms.com/docs/plugins/build-your-own)):
  ```ts
  type Plugin = (incomingConfig: Config) => Config
  ```

- **Curried pattern for plugins with options:**
  ```ts
  export const samplePlugin =
    (pluginOptions: PluginTypes) =>
    (incomingConfig: Config): Config => {
      let config = { ...incomingConfig }

      config.collections = [
        ...(config.collections || []),
        newCollection,
      ]

      config.globals = [
        ...(config.globals || []),
        newGlobal,
      ]

      config.onInit = async payload => {
        if (incomingConfig.onInit) await incomingConfig.onInit(payload)
      }

      return config
    }
  ```

- **Plugin composition** — plugins are applied sequentially in the `plugins` array. Each receives the config as modified by all previous plugins. This is simple function composition: `plugin3(plugin2(plugin1(baseConfig)))`.

- **The `custom` field** — Payload provides a `custom: Record<string, unknown>` field specifically for plugins to store arbitrary data. Plugins can read and write to this field without interfering with core config. This is an important pattern for extensibility.

- **Key takeaway for Sherpa:** Adopt the exact same curried pattern. A Sherpa plugin is `(options) => (config) => modifiedConfig`. Plugins can add entity types, lifecycle stages, agent roles, or MCP tools.

### 3. Sanity Studio `defineConfig()` — Workspace Multiplexing

Sanity's config system adds a pattern Payload doesn't have: multiple workspaces from one config. ([Sanity config docs](https://www.sanity.io/docs/configuration))

- **Single or multi-workspace:**
  ```ts
  // Single
  export default defineConfig({
    projectId: '...',
    dataset: 'production',
    plugins: [structureTool()],
    schema: { types: schemaTypes },
  })

  // Multiple
  export default defineConfig([
    { name: 'production', basePath: '/production', dataset: 'production', ... },
    { name: 'staging', basePath: '/staging', dataset: 'staging', ... },
  ])
  ```

- **Callback-based override pattern:** Many Sanity config properties accept either a static value or a callback `(prev, context) => newValue`. This allows plugins to extend rather than replace:
  ```ts
  schema: {
    types: (prev, context) => [...schemaTypes, ...prev]
  }
  ```

- **Plugin invocation as functions:** Plugins are always called as functions in the array: `plugins: [structureTool(), visionTool()]`. This matches Payload's curried pattern — the outer function accepts options, returns the actual plugin.

- **Key takeaway for Sherpa:** The callback pattern `(prev, context) => newValue` is powerful for extension points like lifecycle stages, entity types, and vocabulary. Consider using this for properties consumers might want to extend rather than replace.

### 4. Keystatic `config()` — Simplicity and Reader Pattern

Keystatic demonstrates the most minimal config system of the group. ([Keystatic config docs](https://keystatic.com/docs/configuration))

- **Minimal entrypoint:**
  ```ts
  import { config, fields, collection } from '@keystatic/core'

  export default config({
    storage: { kind: 'local' },
    collections: {
      posts: collection({
        label: 'Posts',
        slugField: 'title',
        path: 'src/content/posts/*',
        schema: { title: fields.slug({ name: { label: 'Title' } }) },
      }),
    },
  })
  ```

- **Reader API** — Keystatic exports a `createReader()` that takes the config and returns a typed data access layer: ([Keystatic reader docs](https://keystatic.com/docs/reader-api))
  ```ts
  import { createReader } from '@keystatic/core/reader'
  import keystaticConfig from './keystatic.config'

  const reader = createReader(process.cwd(), keystaticConfig)
  const posts = await reader.collections.posts.all()
  ```

- **Next.js integration via route handler:**
  ```ts
  import { makeRouteHandler } from '@keystatic/next/route-handler'
  import config from '../keystatic.config'
  export const { POST, GET } = makeRouteHandler({ config })
  ```

- **Key takeaway for Sherpa:** The `createReader(cwd, config)` pattern is directly applicable. Sherpa should export `createStudio(config)` that returns a typed governance data access layer. The route handler pattern is also relevant — `makeSherpaRouteHandler(config)` for API routes.

### 5. Backstage `app-config.yaml` — Schema-Driven Plugin Config

Backstage takes a fundamentally different approach: YAML config with plugin-contributed schemas. ([Backstage config docs](https://backstage.io/docs/conf/), [Backstage defining config](https://backstage.io/docs/conf/defining/))

- **YAML + environment layering:**
  ```yaml
  # app-config.yaml (base)
  app:
    title: My Portal
    baseUrl: http://localhost:3000
  backend:
    listen: 0.0.0.0:7007
  ```
  Merged with `app-config.production.yaml`, `app-config.local.yaml`, environment variables (`APP_CONFIG_app_baseUrl`), and `--config` CLI flags.

- **Plugin config schema via `package.json`:**
  ```json
  { "configSchema": "config.d.ts" }
  ```
  ```ts
  // config.d.ts
  export interface Config {
    app: {
      /** @visibility frontend */
      baseUrl: string;
    };
    backend: {
      /** @deepVisibility secret */
      customCredentials: { password: string };
    };
  }
  ```

- **Visibility system:** `frontend` (visible to browser), `backend` (server only), `secret` (excluded from logs). `@deepVisibility` applies recursively.

- **Dynamic includes:**
  ```yaml
  backend:
    mySecretKey:
      $env: MY_SECRET_KEY
    config:
      $file: ./my-secret.txt
      $include: ./secrets.json#deployment.key
  ```

- **Plugin creation** via `createPlugin()`:
  ```ts
  export const examplePlugin = createPlugin({
    id: 'example',
    routes: { root: rootRouteRef },
  })
  ```

- **Key takeaway for Sherpa:** The visibility system is interesting for separating what's safe to send to the client vs. server-only config. But YAML is wrong for Sherpa — TypeScript config provides type safety, IDE support, and the ability to import/compute values. The schema contribution pattern (plugins declare their config shape) is worth adopting in TypeScript.

### 6. Next.js Config Wrapping — `withPayload()` and `createNextIntlPlugin()`

Both Payload and next-intl wrap `next.config.ts` using the same pattern:

- **Payload's `withPayload()`:**
  ```ts
  import { withPayload } from '@payloadcms/next/withPayload'
  const nextConfig = { output: 'standalone' }
  export default withPayload(nextConfig)
  ```
  Injects webpack config, turbopack config, and admin route handling. ([Payload Next.js guide](https://payloadcms.com/posts/blog/the-ultimate-guide-to-using-nextjs-with-payload), [withPayload issues](https://github.com/payloadcms/payload/issues/14354))

- **next-intl's `createNextIntlPlugin()`:** ([next-intl plugin docs](https://next-intl.dev/docs/usage/plugin))
  ```ts
  import createNextIntlPlugin from 'next-intl/plugin'
  const withNextIntl = createNextIntlPlugin()
  export default withNextIntl(nextConfig)
  ```
  Supports options like custom request config path and experimental features.

- **Composition of multiple wrappers:**
  ```ts
  export default withPayload(withNextIntl(nextConfig))
  // or
  export default withPayload(otherWrapper(nextConfig))
  ```

- **NextAuth's split config pattern:** ([NextAuth docs](https://authjs.dev/reference/nextjs))
  ```ts
  // auth.config.ts — edge-safe config (no database adapter)
  export const authConfig = {
    pages: { signIn: '/login' },
    callbacks: { ... },
    providers: [],
  } satisfies NextAuthConfig

  // auth.ts — full config (adds database adapter)
  export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [Credentials({})],
  })
  ```

- **Key takeaway for Sherpa:** `withSherpa()` should wrap `next.config.ts` to inject Sherpa's route handlers, middleware, and any build-time configuration. The function should be minimal — just inject what's needed for Sherpa Studio routes to work. Actual Studio config lives in `sherpa.config.ts`, not inside `next.config.ts`.

### 7. Vocabulary via i18n — Strapi + next-intl Integration

The most elegant vocabulary customization pattern combines Strapi's approach with next-intl's infrastructure:

- **Strapi's translation override:** ([Strapi translation docs](https://docs.strapi.io/cms/admin-panel-customization/locales-translations))
  ```ts
  export default {
    config: {
      translations: {
        en: {
          "Users": "Team Members",
          "content-type-builder.plugin.name": "Schema Builder"
        }
      }
    }
  }
  ```
  Plugin translations use prefixed keys: `"[plugin-name].[key]": "value"`.

- **next-intl's namespace system:** ([next-intl config docs](https://next-intl.dev/docs/usage/configuration))
  ```ts
  // i18n/request.ts
  export default getRequestConfig(async () => ({
    messages: {
      ...(await import(`../../messages/${locale}/login.json`)).default,
      ...(await import(`../../messages/${locale}/dashboard.json`)).default
    }
  }))
  ```
  Messages are split by namespace, merged at request time. Missing keys fall through to `getMessageFallback`.

- **Sherpa vocabulary integration design:**
  1. Sherpa ships a default vocabulary file: `@sherpa/studio/messages/en.json`
  2. Consumer's `sherpa.config.ts` specifies vocabulary overrides
  3. At request time, Sherpa merges defaults with consumer overrides
  4. Components use `useTranslations('sherpa')` — never hardcode entity names

- **Key takeaway:** The vocabulary config should be a flat object in `sherpa.config.ts`, not a separate JSON file. The framework automatically generates the next-intl messages from the config, so consumers don't need to know about i18n internals.

### 8. Sanity Studio Theming — CSS Variable Approach

Sanity provides a programmatic theming approach via `buildLegacyTheme`: ([Sanity theming docs](https://www.sanity.io/docs/theming))
```ts
import { buildLegacyTheme } from 'sanity'

const myTheme = buildLegacyTheme({
  '--black': '#1a1a1a',
  '--brand-primary': '#4285f4',
  '--default-button-primary-color': '#4285f4',
  '--state-success-color': '#0f9d58',
  '--main-navigation-color': '#1a1a1a',
})

export default defineConfig({ theme: myTheme })
```

A web-based "Themer" tool lets designers visually construct palettes and export config.

- **Key takeaway:** Sherpa should support theme definition directly in `sherpa.config.ts` via CSS variable overrides, but should default to the consumer's existing CSS variables (from their shadcn theme). The config theme should be a sparse override — only specify what differs from the default.

---

## Draft `sherpa.config.ts` — Full TypeScript Types

Based on all research, here is the complete config design:

```ts
// ============================================================================
// @sherpa/studio — Configuration Types
// ============================================================================

import type { NextConfig } from 'next'

// ---------------------------------------------------------------------------
// Core builder function
// ---------------------------------------------------------------------------

/**
 * Create a validated Sherpa Studio configuration.
 * Follows the Payload CMS `buildConfig()` pattern.
 *
 * @example
 * ```ts
 * // sherpa.config.ts
 * import { defineConfig } from '@sherpa/studio'
 *
 * export default defineConfig({
 *   projectDir: process.cwd(),
 * })
 * ```
 */
export declare function defineConfig(config: SherpaUserConfig): SherpaConfig

/**
 * Wrap next.config.ts to inject Sherpa Studio route handlers and middleware.
 * Follows the Payload `withPayload()` / next-intl `createNextIntlPlugin()` pattern.
 *
 * @example
 * ```ts
 * // next.config.ts
 * import { withSherpa } from '@sherpa/studio/next'
 * import type { NextConfig } from 'next'
 *
 * const nextConfig: NextConfig = {}
 * export default withSherpa(nextConfig)
 * ```
 */
export declare function withSherpa(
  nextConfig: NextConfig,
  sherpaConfigPath?: string
): NextConfig

// ---------------------------------------------------------------------------
// User-facing config (what consumers write in sherpa.config.ts)
// ---------------------------------------------------------------------------

export interface SherpaUserConfig {
  /**
   * Absolute path to the project root.
   * Used to resolve relative paths for docs, tasks, agents, etc.
   * @default process.cwd()
   */
  projectDir?: string

  /**
   * Branding configuration for the Studio admin panel.
   * Mirrors Payload CMS's admin branding surface.
   */
  admin?: AdminConfig

  /**
   * Visual theme overrides.
   * Sparse — only specify CSS variables you want to override.
   * Defaults come from the consumer's existing shadcn/ui CSS variables.
   */
  theme?: ThemeConfig

  /**
   * Vocabulary customization.
   * Rename any governance entity without touching code.
   * Fed into next-intl automatically.
   */
  vocabulary?: VocabularyConfig

  /**
   * Directory paths for Sherpa's file-based data sources.
   * All paths are relative to `projectDir`.
   */
  paths?: PathsConfig

  /**
   * Entity type definitions.
   * Extend or override default governance entity types (initiative, task, etc.).
   * Follows Sanity's callback pattern: static value or (defaults) => merged.
   */
  entities?: EntitiesConfig

  /**
   * Agent catalog configuration.
   * Defines where agent role definitions live and how they're structured.
   */
  agents?: AgentsConfig

  /**
   * MCP server configuration.
   * Controls the Studio task MCP server behavior.
   */
  mcp?: McpConfig

  /**
   * Plugin array.
   * Plugins use the Payload curried pattern: (options) => (config) => modifiedConfig.
   */
  plugins?: SherpaPlugin[]

  /**
   * Lifecycle stage definitions.
   * Override or extend the default governance lifecycle.
   * Callback pattern: static array or (defaults) => merged array.
   */
  lifecycle?: LifecycleStageDefinition[] | ((defaults: LifecycleStageDefinition[]) => LifecycleStageDefinition[])

  /**
   * Arbitrary extension data for plugins to read/write.
   * Same pattern as Payload's `custom` field.
   */
  custom?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Admin panel config
// ---------------------------------------------------------------------------

export interface AdminConfig {
  /** Logo component or image path for the navigation sidebar. */
  logo?: string | React.ComponentType

  /** Logo component or image path for the login/auth screen. */
  loginLogo?: string | React.ComponentType

  /** Favicon path. */
  favicon?: string

  /** Open Graph image for link previews. */
  ogImage?: string

  /** Suffix appended to page titles. @default "Studio" */
  titleSuffix?: string

  /** Base route for the Studio admin panel. @default "/studio" */
  basePath?: string

  /** Default color mode. @default "dark" */
  defaultColorMode?: 'light' | 'dark' | 'system'

  /**
   * Injection zones for custom React components.
   * Follows Payload's before/after slot pattern.
   */
  components?: {
    beforeDashboard?: React.ComponentType[]
    afterDashboard?: React.ComponentType[]
    beforeNavLinks?: React.ComponentType[]
    afterNavLinks?: React.ComponentType[]
    /** Custom providers wrapping the entire Studio. */
    providers?: React.ComponentType<{ children: React.ReactNode }>[]
  }
}

// ---------------------------------------------------------------------------
// Theme config
// ---------------------------------------------------------------------------

export interface ThemeConfig {
  /**
   * CSS variable overrides for light mode.
   * Keys are CSS custom property names WITHOUT the `--` prefix.
   * Values are CSS color values (OKLCH, HSL, hex, etc.).
   *
   * @example
   * ```ts
   * theme: {
   *   light: {
   *     primary: 'oklch(0.6 0.15 250)',
   *     'primary-foreground': 'oklch(0.98 0.01 250)',
   *   }
   * }
   * ```
   */
  light?: Record<string, string>

  /**
   * CSS variable overrides for dark mode.
   * Same format as `light`.
   */
  dark?: Record<string, string>

  /**
   * Border radius token. @default "0.5rem"
   */
  radius?: string

  /**
   * Font family overrides.
   */
  fonts?: {
    /** Sans-serif font family. @default "system-ui" */
    sans?: string
    /** Monospace font family. @default "ui-monospace" */
    mono?: string
  }
}

// ---------------------------------------------------------------------------
// Vocabulary config
// ---------------------------------------------------------------------------

/**
 * Flat vocabulary overrides.
 * Keys are dot-notation paths into the default vocabulary.
 * Values are the display strings.
 *
 * The framework ships sensible defaults for all keys.
 * Consumers only need to override what they want to rename.
 */
export interface VocabularyConfig {
  // ---- Core entities ----
  /** @default "Initiative" */
  initiative?: string
  /** @default "Initiatives" */
  initiativePlural?: string
  /** @default "Proposal" */
  proposal?: string
  /** @default "Proposals" */
  proposalPlural?: string
  /** @default "Task" */
  task?: string
  /** @default "Tasks" */
  taskPlural?: string
  /** @default "Agent" */
  agent?: string
  /** @default "Agents" */
  agentPlural?: string
  /** @default "Role" */
  role?: string
  /** @default "Roles" */
  rolePlural?: string

  // ---- Lifecycle ----
  /** @default "Pending" */
  statusPending?: string
  /** @default "Approved" */
  statusApproved?: string
  /** @default "In Progress" */
  statusInProgress?: string
  /** @default "Integrated" */
  statusIntegrated?: string
  /** @default "Declined" */
  statusDeclined?: string
  /** @default "Archived" */
  statusArchived?: string

  // ---- Sections ----
  /** @default "Dashboard" */
  dashboard?: string
  /** @default "Process" */
  process?: string
  /** @default "Research" */
  research?: string
  /** @default "Conventions" */
  conventions?: string
  /** @default "Portfolio" */
  portfolio?: string

  /**
   * Arbitrary additional vocabulary overrides.
   * Passed through to next-intl messages under the `sherpa` namespace.
   */
  [key: string]: string | undefined
}

// ---------------------------------------------------------------------------
// Paths config
// ---------------------------------------------------------------------------

export interface PathsConfig {
  /** Directory containing initiative directories. @default "docs/initiatives" */
  initiatives?: string
  /** Directory containing task files. @default "docs/tasks" */
  tasks?: string
  /** Directory containing agent role definitions. @default "docs/agents/roles" */
  agentRoles?: string
  /** Directory containing rule files. @default ".claude/rules" */
  rules?: string
  /** Directory containing skill directories. @default ".claude/skills" */
  skills?: string
  /** Directory containing session manifests. @default "docs/sessions" */
  sessions?: string
  /** Directory containing research docs. @default "docs/research" */
  research?: string
  /** Roadmap file path. @default "docs/roadmap.md" */
  roadmap?: string
  /** MCP config file path. @default ".mcp.json" */
  mcpConfig?: string
  /** Archive directory within initiatives. @default ".archive" */
  archive?: string
}

// ---------------------------------------------------------------------------
// Entity config
// ---------------------------------------------------------------------------

export interface EntityTypeDefinition {
  /** Machine-readable slug. */
  slug: string
  /** Display label (can be overridden by vocabulary). */
  label: string
  /** Plural display label. */
  labelPlural: string
  /** Icon component or icon name. */
  icon?: string | React.ComponentType
  /** CSS color for status badges. */
  color?: string
}

export interface EntitiesConfig {
  /**
   * Initiative status values.
   * Callback pattern: provide a static array to replace, or a function to extend defaults.
   */
  initiativeStatuses?: string[] | ((defaults: string[]) => string[])

  /**
   * Initiative type values (roadmap-update, research-synthesis, etc.).
   */
  initiativeTypes?: string[] | ((defaults: string[]) => string[])

  /**
   * Initiative risk levels.
   */
  initiativeRisks?: string[] | ((defaults: string[]) => string[])

  /**
   * Task priority levels.
   * @default ["urgent", "high", "medium", "low"]
   */
  taskPriorities?: string[] | ((defaults: string[]) => string[])

  /**
   * Task backend options.
   * @default ["claude", "lm-studio"]
   */
  taskBackends?: string[] | ((defaults: string[]) => string[])

  /**
   * Custom entity types beyond the defaults.
   * These appear in the Studio navigation and can have their own file-based storage.
   */
  customEntities?: EntityTypeDefinition[]
}

// ---------------------------------------------------------------------------
// Agent config
// ---------------------------------------------------------------------------

export interface AgentsConfig {
  /**
   * Model tier definitions.
   * Maps tier names to model identifiers or descriptions.
   */
  modelTiers?: Record<string, {
    label: string
    description?: string
    /** Suggested models for this tier. */
    models?: string[]
  }>

  /**
   * Agent role categories.
   * @default ["strategy", "design", "engineering", "domain", "operations"]
   */
  categories?: string[] | ((defaults: string[]) => string[])

  /**
   * URL for the local LM Studio instance.
   * @default "http://localhost:1234"
   */
  lmStudioUrl?: string
}

// ---------------------------------------------------------------------------
// MCP config
// ---------------------------------------------------------------------------

export interface McpConfig {
  /**
   * Enable the built-in MCP task server.
   * @default true
   */
  enabled?: boolean

  /**
   * MCP server name as registered in .mcp.json.
   * @default "studio"
   */
  serverName?: string

  /**
   * Additional MCP tools beyond the built-in task tools.
   * Plugins can add tools via this mechanism.
   */
  additionalTools?: McpToolDefinition[]

  /**
   * Tool name prefix for vocabulary customization.
   * e.g., prefix "project" turns "task_list" into "project_task_list".
   * @default undefined (no prefix)
   */
  toolPrefix?: string
}

export interface McpToolDefinition {
  name: string
  description: string
  domain: string
  parameters: McpToolParameter[]
  handler: (params: Record<string, unknown>) => Promise<unknown>
}

export interface McpToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean'
  description: string
  required?: boolean
  enum?: string[]
}

// ---------------------------------------------------------------------------
// Lifecycle config
// ---------------------------------------------------------------------------

export interface LifecycleStageDefinition {
  /** Machine-readable slug. */
  slug: string
  /** Display label. */
  label: string
  /** Action prompt shown in the UI. */
  nextAction: string
  /** Who takes the next action. */
  actor: 'human' | 'agent' | null
}

// ---------------------------------------------------------------------------
// Plugin system
// ---------------------------------------------------------------------------

/**
 * A Sherpa plugin is a curried function.
 * Outer function accepts plugin-specific options.
 * Inner function receives the config and returns a modified config.
 *
 * Follows the Payload CMS plugin pattern exactly.
 *
 * @example
 * ```ts
 * const myPlugin: SherpaPlugin = (config) => ({
 *   ...config,
 *   entities: {
 *     ...config.entities,
 *     customEntities: [
 *       ...(config.entities?.customEntities ?? []),
 *       { slug: 'risk', label: 'Risk', labelPlural: 'Risks' },
 *     ],
 *   },
 * })
 * ```
 */
export type SherpaPlugin = (config: SherpaConfig) => SherpaConfig

/**
 * Helper for creating plugins with options.
 *
 * @example
 * ```ts
 * import { createPlugin } from '@sherpa/studio'
 *
 * interface JiraPluginOptions {
 *   projectKey: string
 *   apiToken: string
 * }
 *
 * export const jiraPlugin = createPlugin<JiraPluginOptions>(
 *   (options) => (config) => ({
 *     ...config,
 *     vocabulary: {
 *       ...config.vocabulary,
 *       initiative: 'Epic',
 *       task: 'Issue',
 *     },
 *   })
 * )
 * ```
 */
export declare function createPlugin<TOptions>(
  factory: (options: TOptions) => SherpaPlugin
): (options: TOptions) => SherpaPlugin

// ---------------------------------------------------------------------------
// Resolved config (after defaults + plugins applied)
// ---------------------------------------------------------------------------

/**
 * The fully resolved, validated config.
 * All optional fields have been filled with defaults.
 * Plugins have been applied.
 * Returned by `defineConfig()`.
 */
export interface SherpaConfig {
  projectDir: string
  admin: Required<AdminConfig>
  theme: Required<ThemeConfig>
  vocabulary: Required<VocabularyConfig>
  paths: Required<PathsConfig>
  entities: Required<EntitiesConfig>
  agents: Required<AgentsConfig>
  mcp: Required<McpConfig>
  lifecycle: LifecycleStageDefinition[]
  plugins: SherpaPlugin[]
  custom: Record<string, unknown>
}
```

---

## Usage Examples

### Minimal config (defaults for everything)

```ts
// sherpa.config.ts
import { defineConfig } from '@sherpa/studio'

export default defineConfig({})
```

### Consulting agency with vocabulary overrides

```ts
// sherpa.config.ts
import { defineConfig } from '@sherpa/studio'

export default defineConfig({
  admin: {
    logo: '/images/acme-logo.svg',
    titleSuffix: 'ACME Studio',
    defaultColorMode: 'light',
  },
  vocabulary: {
    initiative: 'Project',
    initiativePlural: 'Projects',
    proposal: 'RFC',
    proposalPlural: 'RFCs',
    task: 'Ticket',
    taskPlural: 'Tickets',
    agent: 'Assistant',
    agentPlural: 'Assistants',
    dashboard: 'Home',
  },
  theme: {
    light: {
      primary: 'oklch(0.55 0.15 250)',
      'primary-foreground': 'oklch(0.98 0.01 250)',
    },
    radius: '0.75rem',
  },
})
```

### WavePoint (the first consumer)

```ts
// sherpa.config.ts
import { defineConfig } from '@sherpa/studio'

export default defineConfig({
  admin: {
    logo: '/images/wavepoint-logo.svg',
    titleSuffix: 'Studio',
    basePath: '/app/studio',
    defaultColorMode: 'dark',
  },
  paths: {
    initiatives: 'docs/initiatives',
    tasks: 'docs/tasks',
    agentRoles: 'docs/agents/roles',
    sessions: 'docs/sessions',
    roadmap: 'docs/roadmap.md',
  },
  agents: {
    lmStudioUrl: 'http://localhost:1234',
    modelTiers: {
      high: { label: 'High', models: ['claude-opus-4-6'] },
      medium: { label: 'Medium', models: ['claude-sonnet-4-6'] },
      low: { label: 'Low', models: ['qwen-3.5-9b'] },
    },
  },
})
```

### With a plugin

```ts
// sherpa.config.ts
import { defineConfig } from '@sherpa/studio'
import { linearPlugin } from '@sherpa/studio-linear'

export default defineConfig({
  plugins: [
    linearPlugin({
      teamId: 'SG',
      apiKey: process.env.LINEAR_API_KEY!,
    }),
  ],
})
```

### Next.js integration

```ts
// next.config.ts
import type { NextConfig } from 'next'
import { withSherpa } from '@sherpa/studio/next'

const nextConfig: NextConfig = {
  // your Next.js config
}

export default withSherpa(nextConfig)
```

---

## How Config Resolution Works

```
sherpa.config.ts (user writes)
       │
       ▼
defineConfig(userConfig)
       │
       ├── 1. Apply defaults for all omitted fields
       ├── 2. Resolve callback properties (lifecycle, entity enums)
       ├── 3. Apply plugins sequentially: plugin[n](config) => config
       ├── 4. Generate next-intl vocabulary messages from VocabularyConfig
       ├── 5. Validate with Zod (runtime safety)
       └── 6. Return frozen SherpaConfig

next.config.ts
       │
       ▼
withSherpa(nextConfig)
       │
       ├── 1. Load sherpa.config.ts (or path from second arg)
       ├── 2. Register Studio catch-all route at admin.basePath
       ├── 3. Register API route handlers for MCP / data access
       └── 4. Return modified NextConfig
```

---

## Comparison Matrix

| Feature | Payload CMS | Sanity Studio | Keystatic | Backstage | **Sherpa** |
|---------|------------|---------------|-----------|-----------|-----------|
| Config format | TypeScript | TypeScript | TypeScript | YAML | **TypeScript** |
| Builder function | `buildConfig()` | `defineConfig()` | `config()` | N/A | **`defineConfig()`** |
| Plugin type | `(config) => config` | Function in array | N/A | `createPlugin()` | **`(config) => config`** |
| Plugin options | Curried: `(opts) => (cfg) => cfg` | Function call: `plugin()` | N/A | Constructor | **Curried** |
| Theming | CSS vars + SCSS | `buildLegacyTheme()` | N/A | CSS vars + MUI | **CSS vars (shadcn-native)** |
| Vocabulary | `i18n` admin UI langs | N/A | N/A | Fixed terms | **VocabularyConfig → next-intl** |
| Next.js wrapper | `withPayload()` | N/A | Route handler | N/A | **`withSherpa()`** |
| Config validation | Internal | Internal | Zod | JSON Schema | **Zod** |
| Multi-workspace | No | Yes (array) | No | Yes (env files) | **No (Phase 1)** |
| Extension data | `custom: {}` | N/A | N/A | N/A | **`custom: {}`** |

---

## Sources

### Payload CMS
- [Payload config overview](https://payloadcms.com/docs/configuration/overview) — Top-level buildConfig() options and examples
- [Payload config types source](https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts) — TypeScript type definitions
- [Payload config overview MDX source](https://github.com/payloadcms/payload/blob/main/docs/configuration/overview.mdx) — Raw documentation source
- [Payload plugin overview](https://payloadcms.com/docs/plugins/overview) — Plugin system introduction
- [Payload build your own plugin](https://payloadcms.com/docs/plugins/build-your-own) — Plugin authoring guide with curried pattern
- [Payload collections config](https://payloadcms.com/docs/configuration/collections) — Collection definition reference
- [Payload TypeScript overview](https://payloadcms.com/docs/typescript/overview) — Type generation and strictDraftTypes
- [Payload GitHub](https://github.com/payloadcms/payload) — Source repository
- [Payload Next.js guide](https://payloadcms.com/posts/blog/the-ultimate-guide-to-using-nextjs-with-payload) — withPayload() integration
- [withPayload turbopack issue](https://github.com/payloadcms/payload/issues/11020) — Known webpack injection behavior
- [withPayload Next.js 16 issue](https://github.com/payloadcms/payload/issues/14354) — Turbopack default conflict
- [@payloadcms/next-payload npm](https://www.npmjs.com/package/@payloadcms/next-payload) — Package reference

### Sanity Studio
- [Sanity configuration](https://www.sanity.io/docs/configuration) — defineConfig(), workspaces, plugins, callback pattern
- [Sanity theming](https://www.sanity.io/docs/theming) — buildLegacyTheme(), CSS variable overrides

### Keystatic
- [Keystatic configuration](https://keystatic.com/docs/configuration) — config(), storage, collections, singletons
- [Keystatic reader API](https://keystatic.com/docs/reader-api) — createReader() typed data access
- [Keystatic Next.js installation](https://keystatic.com/docs/installation-next-js) — Route handler integration
- [Keystatic Next.js disable admin](https://keystatic.com/docs/recipes/nextjs-disable-admin-ui-in-production) — Production routing

### Backstage
- [Backstage configuration overview](https://backstage.io/docs/conf/) — YAML config system, file loading priority
- [Backstage writing configuration](https://backstage.io/docs/conf/writing) — Environment variables, includes, substitution
- [Backstage defining configuration](https://backstage.io/docs/conf/defining/) — Plugin config schemas via .d.ts, visibility system
- [Backstage plugin structure](https://backstage.io/docs/plugins/structure-of-a-plugin/) — Plugin directory layout
- [Backstage createPlugin](https://backstage.io/docs/reference/core-plugin-api.createplugin/) — Plugin creation API
- [Backstage plugin development](https://backstage.io/docs/plugins/plugin-development/) — Plugin authoring guide

### next-intl
- [next-intl configuration](https://next-intl.dev/docs/usage/configuration) — getRequestConfig(), messages, formats, error handling
- [next-intl plugin](https://next-intl.dev/docs/usage/plugin) — createNextIntlPlugin(), Next.js wrapper, options
- [next-intl App Router setup](https://next-intl.dev/docs/getting-started/app-router) — Full setup guide
- [next-intl TypeScript augmentation](https://next-intl.dev/docs/workflows/typescript) — Type-safe messages

### NextAuth / Auth.js
- [Auth.js Next.js reference](https://authjs.dev/reference/nextjs) — NextAuth configuration pattern
- [Next.js adding authentication](https://nextjs.org/learn/dashboard-app/adding-authentication) — auth.config.ts split pattern

### Strapi
- [Strapi locales and translations](https://docs.strapi.io/cms/admin-panel-customization/locales-translations) — Translation override config, plugin key prefixing
- [Strapi i18n guide](https://strapi.io/blog/strapi-5-i18n-complete-guide) — Internationalization overview
- [Strapi admin customization](https://docs.strapi.io/cms/admin-panel-customization) — Admin panel customization root

### shadcn/ui
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming) — CSS variable system, OKLCH, dark mode
- [shadcn/ui manual installation](https://ui.shadcn.com/docs/installation/manual) — components.json configuration
- [DeepWiki CSS variable management](https://deepwiki.com/shadcn-ui/ui/4.6-css-variable-and-theme-management) — Token management internals

### Next.js
- [Next.js config reference](https://nextjs.org/docs/app/api-reference/config/next-config-js) — next.config.ts API

---

## Raw Links

```
https://payloadcms.com/docs/configuration/overview
https://github.com/payloadcms/payload/blob/main/packages/payload/src/config/types.ts
https://github.com/payloadcms/payload/blob/main/docs/configuration/overview.mdx
https://payloadcms.com/docs/plugins/overview
https://payloadcms.com/docs/plugins/build-your-own
https://payloadcms.com/docs/configuration/collections
https://payloadcms.com/docs/typescript/overview
https://github.com/payloadcms/payload
https://payloadcms.com/posts/blog/the-ultimate-guide-to-using-nextjs-with-payload
https://github.com/payloadcms/payload/issues/11020
https://github.com/payloadcms/payload/issues/14354
https://www.npmjs.com/package/@payloadcms/next-payload
https://github.com/payloadcms/payload/releases
https://github.com/payloadcms/payload/blob/main/docs/configuration/collections.mdx
https://github.com/payloadcms/payload/releases/tag/v3.64.0
https://payloadcms.com/docs/typescript/generating-types
https://github.com/payloadcms/payload/issues/7494
https://payloadcms.com/docs/plugins/form-builder
https://payloadcms.com/docs/plugins/mcp
https://www.sanity.io/docs/configuration
https://www.sanity.io/docs/theming
https://keystatic.com/docs/configuration
https://keystatic.com/docs/reader-api
https://keystatic.com/docs/installation-next-js
https://keystatic.com/docs/recipes/nextjs-disable-admin-ui-in-production
https://keystatic.com/docs/recipes/real-time-previews
https://backstage.io/docs/conf/
https://backstage.io/docs/conf/writing
https://backstage.io/docs/conf/defining/
https://backstage.io/docs/plugins/structure-of-a-plugin/
https://backstage.io/docs/reference/core-plugin-api.createplugin/
https://backstage.io/docs/plugins/plugin-development/
https://backstage.io/docs/plugins/backend-plugin/
https://backstage.io/docs/overview/architecture-overview/
https://backstage.io/docs/getting-started/configure-app-with-plugins/
https://next-intl.dev/docs/usage/configuration
https://next-intl.dev/docs/usage/plugin
https://next-intl.dev/docs/getting-started/app-router
https://next-intl.dev/docs/workflows/typescript
https://authjs.dev/reference/nextjs
https://nextjs.org/learn/dashboard-app/adding-authentication
https://next-auth.js.org/configuration/nextjs
https://next-auth.js.org/configuration/initialization
https://next-auth.js.org/configuration/options
https://authjs.dev/getting-started/migrating-to-v5
https://docs.strapi.io/cms/admin-panel-customization/locales-translations
https://strapi.io/blog/strapi-5-i18n-complete-guide
https://docs.strapi.io/cms/features/internationalization
https://docs.strapi.io/cms/admin-panel-customization
https://ui.shadcn.com/docs/theming
https://ui.shadcn.com/docs/installation/manual
https://deepwiki.com/shadcn-ui/ui/4.6-css-variable-and-theme-management
https://nextjs.org/docs/app/api-reference/config/next-config-js
https://nextjs.org/docs/pages/api-reference/config/next-config-js
https://nextjs.org/docs/pages/api-reference/config/typescript
https://oven.studio/blog/payload-cms/
https://spin.atomicobject.com/embed-payload-cms-next-js-app/
https://medium.com/@yrogovich/how-payload-3-0-is-changing-the-headless-cms-game-in-2025-c6b8ce193518
https://www.deployhq.com/guides/payload-cms
https://www.buildwithmatija.com/blog/deploy-payload-cms-nextjs-16-self-hosted
https://github.com/payloadcms/payload/discussions/14330
https://github.com/payloadcms/payload/issues/12640
https://github.com/payloadcms/payload/issues/8064
https://github.com/payloadcms/payload/issues/6441
https://www.thisdot.co/blog/internationalization-in-next-js-with-next-intl
https://i18nexus.com/tutorials/nextjs/next-intl
https://poeditor.com/blog/next-js-i18n/
https://www.buildwithmatija.com/blog/nextjs-internationalization-guide-next-intl-2025
https://docs.tolgee.io/js-sdk/integrations/react/next/app-router-next-intl
https://github.com/amannn/next-intl/discussions/324
https://github.com/amannn/next-intl/issues/1779
https://github.com/Thinkmill/keystatic/discussions/1168
https://keystatic.com/
https://makerkit.dev/docs/next-supabase-turbo/content/keystatic
https://github.com/nextauthjs/next-auth-example
```

---

## Implications for Sherpa's Framework Architecture

### 1. `defineConfig()` is the entrypoint, not `buildConfig()`

Sanity and Vite both use `defineConfig()`. Payload uses `buildConfig()`. The `define-` prefix is more idiomatic in the modern TypeScript ecosystem and signals "this is declarative configuration, not imperative building." The function still validates and resolves defaults internally.

### 2. Two-file integration pattern

Sherpa requires exactly two touchpoints in a consumer's Next.js project:
- `sherpa.config.ts` — all Sherpa configuration (branding, vocabulary, paths, plugins)
- `next.config.ts` — wrap with `withSherpa()` to inject route handlers

This matches Payload's two-file pattern (`payload.config.ts` + `withPayload()` in `next.config.ts`). No other files need modification for basic setup.

### 3. Vocabulary is a config concern, not an i18n concern

Consumers should never touch next-intl configuration files. The `vocabulary` object in `sherpa.config.ts` is the single source of truth. Sherpa internally translates this into next-intl messages, but that's an implementation detail. This is the Strapi insight (i18n for vocabulary) married to the Payload insight (config is the entrypoint).

### 4. Callback pattern for extensible properties

Properties that consumers might want to extend (not replace) should support the `(defaults) => merged` callback pattern from Sanity:
```ts
lifecycle: (defaults) => [
  ...defaults,
  { slug: 'client-review', label: 'Client Review', nextAction: 'Send to client', actor: 'human' },
]
```
This applies to: `lifecycle`, `entities.initiativeStatuses`, `entities.taskPriorities`, `agents.categories`.

### 5. Plugin architecture is deferred but designed

The curried plugin pattern is defined in the types but plugin development is a Phase 2 concern. Phase 1 ships with the config system and zero plugins. The first plugin will likely be `@sherpa/studio-linear` (Linear integration) or `@sherpa/studio-github` (GitHub Projects sync).

### 6. Paths config enables zero-convention adoption

By making every directory path configurable, Sherpa can be adopted by projects that don't follow the WavePoint convention structure. A project using `./tasks/` instead of `docs/tasks/` just sets `paths.tasks: 'tasks'`. This is critical for framework adoption beyond WavePoint.

### 7. MCP tool naming follows vocabulary

If a consumer renames "task" to "ticket", the MCP tool `task_list` should become `ticket_list`. This is a unique requirement that none of the reference frameworks handle — it's specific to agent-native tools. The `mcp.toolPrefix` is a simple first step; full vocabulary-aware tool naming is a Phase 2 feature.

---

## Open Questions

1. **Config hot-reloading:** Should `sherpa.config.ts` changes take effect without restarting the dev server? Payload requires a restart. Sanity does hot-reload schemas. For governance tools (low change frequency), restart is probably fine.

2. **Type generation from config:** Should Sherpa auto-generate TypeScript types from the resolved config (like Payload's `typescript.outputFile`)? This would give consumers typed access to their custom entity types and vocabulary keys.

3. **Multi-project config:** Can one `sherpa.config.ts` manage multiple projects (like Sanity's multi-workspace)? This matters if Sherpa is used for agency portfolio management across client projects.

4. **Config validation errors:** How should invalid config be surfaced? Payload throws on startup. Backstage logs warnings. For a governance tool, startup failure with clear messages (like Payload) is better than silent degradation.

5. **Plugin dependency resolution:** If Plugin B depends on config added by Plugin A, order in the `plugins` array matters. Should Sherpa enforce dependency declarations (like Backstage) or keep it simple (like Payload's ordered array)?

6. **React Server Component compatibility:** Payload's admin components are RSC by default. Sherpa's Studio runs inside Next.js App Router. The `admin.components` injection zones need to specify whether injected components must be RSC-compatible or can be client components.

7. **`createStudio()` reader pattern:** Following Keystatic's `createReader()`, should Sherpa export a `createStudio(config)` that returns a typed API for reading governance data (initiatives, tasks, roles) without going through HTTP? This would be the "internal consumption" API for the host Next.js app.
