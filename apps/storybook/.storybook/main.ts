import type { StorybookConfig } from "@storybook/react-vite"
import type { PluginOption } from "vite"
import path from "node:path"
import fs from "node:fs"

// pnpm runs scripts from the package directory, so cwd = apps/storybook/
const storybookRoot = process.cwd()
const monorepoRoot = path.resolve(storybookRoot, "../..")
const studioSrc = path.resolve(storybookRoot, "../studio/src")
const mocks = path.join(storybookRoot, "src/mocks")

/**
 * Custom Vite plugin to resolve @/ imports and Next.js mocks globally,
 * including from files in packages/ outside the Storybook project root.
 */
function sherpaAliasPlugin(): PluginOption {
  const exactMocks: Record<string, string> = {
    "@/lib/studio": path.join(mocks, "studio.ts"),
    "@/app/workforce/actions": path.join(mocks, "workforce-actions.ts"),
    "server-only": path.join(mocks, "empty.ts"),
    "next/link": path.join(mocks, "next-link.tsx"),
    "next/navigation": path.join(mocks, "next-navigation.tsx"),
    "next/image": path.join(mocks, "next-image.tsx"),
    "next/font/google": path.join(mocks, "empty.ts"),
  }

  return {
    name: "sherpa-alias",
    enforce: "pre",
    resolveId(source) {
      // Exact mocks
      if (source in exactMocks) {
        return exactMocks[source]
      }
      // @/ prefix → apps/studio/src/
      if (source.startsWith("@/")) {
        const resolved = path.join(studioSrc, source.slice(2))
        // Try common extensions
        for (const ext of ["", ".ts", ".tsx", ".js", ".jsx"]) {
          const full = resolved + ext
          if (fs.existsSync(full)) return full
        }
        // Try index files
        for (const ext of ["/index.ts", "/index.tsx"]) {
          const full = resolved + ext
          if (fs.existsSync(full)) return full
        }
        return resolved
      }
      return null
    },
  }
}

const isProduction = process.env.NODE_ENV === "production"

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Set <base href> so relative paths (./sb-addons/...) resolve under /storybook/
  managerHead: (head) =>
    isProduction
      ? `${head}<base href="/storybook/" />`
      : head,
  viteFinal(config) {
    // Storybook is served at /storybook/ in production
    config.base = process.env.NODE_ENV === "production" ? "/storybook/" : "/"

    // Add custom resolver plugin
    config.plugins = config.plugins ?? []
    config.plugins.push(sherpaAliasPlugin())

    // Allow Vite to serve files from the entire monorepo
    config.server = config.server ?? {}
    config.server.fs = config.server.fs ?? {}
    config.server.fs.allow = [monorepoRoot]

    return config
  },
}

export default config
