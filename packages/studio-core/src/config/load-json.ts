import fs from "node:fs"
import path from "node:path"
import type { SherpaUserConfig } from "./types"

const CONFIG_FILES = ["sherpa.json", ".sherpa/config.json"] as const

/**
 * Discover and load sherpa.json from project root.
 * Searches: sherpa.json, .sherpa/config.json
 * Returns null if no config file found.
 */
export function loadJsonConfig(projectRoot: string): SherpaUserConfig | null {
  for (const filename of CONFIG_FILES) {
    const configPath = path.join(projectRoot, filename)
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8")
      let parsed: SherpaUserConfig
      try {
        parsed = JSON.parse(raw) as SherpaUserConfig
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
