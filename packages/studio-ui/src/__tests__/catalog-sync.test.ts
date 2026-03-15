import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { COMPONENT_CATALOG, getComponent, getComponentsByPattern, getComponentsByDomain } from "../catalog"

const __dirname = dirname(fileURLToPath(import.meta.url))
const BARREL_PATH = resolve(__dirname, "../index.ts")

/** Extract module paths from barrel export lines */
function extractBarrelModules(source: string): string[] {
  const modules: string[] = []
  const re = /export \* from "\.\/([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source)) !== null) {
    modules.push(match[1])
  }
  return modules
}

const barrelSource = readFileSync(BARREL_PATH, "utf-8")
const barrelModules = extractBarrelModules(barrelSource)

describe("Component catalog ↔ barrel export sync", () => {
  it("barrel has expected number of module exports", () => {
    expect(barrelModules.length).toBeGreaterThanOrEqual(100)
  })

  // Every barrel module has at least one catalog entry
  for (const mod of barrelModules) {
    it(`module "${mod}" has a catalog entry`, () => {
      const entry = COMPONENT_CATALOG.find((c) => c.source === mod)
      expect(
        entry,
        `No catalog entry with source "${mod}"`
      ).toBeDefined()
    })
  }

  // Every catalog entry references a real barrel module
  it("all catalog sources are valid barrel modules", () => {
    const moduleSet = new Set(barrelModules)
    for (const entry of COMPONENT_CATALOG) {
      expect(
        moduleSet.has(entry.source),
        `Catalog entry "${entry.name}" has source "${entry.source}" not found in barrel`
      ).toBe(true)
    }
  })
})

describe("Catalog entry validity", () => {
  it("every entry has a non-empty name and description", () => {
    for (const entry of COMPONENT_CATALOG) {
      expect(entry.name.length).toBeGreaterThan(0)
      expect(entry.description.length).toBeGreaterThan(0)
    }
  })

  it("names are unique", () => {
    const names = COMPONENT_CATALOG.map((c) => c.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it("domains are valid", () => {
    const validDomains = new Set([
      "governance",
      "data-viz",
      "hub",
      "content",
      "layout",
      "agents",
      "domain-panels",
    ])
    for (const entry of COMPONENT_CATALOG) {
      expect(validDomains.has(entry.domain)).toBe(true)
    }
  })

  it("patterns are valid or null", () => {
    const validPatterns = new Set([
      "glass-panel",
      "status-indicator",
      "data-readout",
      "timeline",
      "pipeline-bar",
      "card-list",
      "section-header",
      "badge",
      null,
    ])
    for (const entry of COMPONENT_CATALOG) {
      expect(validPatterns.has(entry.pattern)).toBe(true)
    }
  })
})

describe("Lookup helpers", () => {
  it("getComponent finds by name", () => {
    expect(getComponent("HubPanel")).toBeDefined()
    expect(getComponent("HubPanel")!.pattern).toBe("glass-panel")
    expect(getComponent("NonExistent")).toBeUndefined()
  })

  it("getComponentsByPattern returns matching components", () => {
    const badges = getComponentsByPattern("badge")
    expect(badges.length).toBeGreaterThanOrEqual(4)
    for (const b of badges) {
      expect(b.pattern).toBe("badge")
    }
  })

  it("getComponentsByDomain returns matching components", () => {
    const hub = getComponentsByDomain("hub")
    expect(hub.length).toBeGreaterThanOrEqual(15)
    for (const h of hub) {
      expect(h.domain).toBe("hub")
    }
  })
})
