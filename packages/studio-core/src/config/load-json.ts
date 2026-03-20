import fs from "node:fs"
import path from "node:path"
import type { SherpaUserConfig } from "./types"

const CONFIG_FILES = ["sherpa.json", ".sherpa/config.json"] as const

/** Interpolate ${ENV_VAR} references in a raw JSON string. */
function resolveEnvVars(raw: string): string {
  return raw.replace(/\$\{(\w+)\}/g, (match, name: string) => {
    const value = process.env[name]
    if (value === undefined) {
      throw new Error(`Environment variable ${name} is not set (referenced in sherpa.json)`)
    }
    return value
  })
}

/**
 * Discover and load sherpa.json from project root.
 * Searches: sherpa.json, .sherpa/config.json
 * Interpolates ${ENV_VAR} references before parsing.
 * Returns null if no config file found.
 */
export function loadJsonConfig(projectRoot: string): SherpaUserConfig | null {
  for (const filename of CONFIG_FILES) {
    const configPath = path.join(projectRoot, filename)
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8")
      let parsed: SherpaUserConfig
      try {
        parsed = JSON.parse(resolveEnvVars(raw)) as SherpaUserConfig
      } catch (err) {
        throw new Error(`Failed to parse ${configPath}: ${(err as Error).message}`)
      }
      // Resolve projectRoot relative to config file location
      parsed.projectRoot = parsed.projectRoot
        ? path.resolve(path.dirname(configPath), parsed.projectRoot)
        : projectRoot
      return parsed
    }
  }
  return null
}
