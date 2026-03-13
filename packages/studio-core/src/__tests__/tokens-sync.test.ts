import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import {
  PALETTE,
  SEMANTIC_COLORS,
  DOMAIN_COLORS,
  CHART_COLORS,
  GLOWS,
  BORDERS,
  SURFACES,
  TYPOGRAPHY,
  RADII,
  SIZING,
  TOKEN_CATEGORIES,
  TOKEN_REGISTRY,
  cssVar,
} from "../tokens"

const __dirname = dirname(fileURLToPath(import.meta.url))
const GLOBALS_CSS_PATH = resolve(
  __dirname,
  "../../../../apps/studio/src/styles/globals.css"
)

/** Extract all CSS custom property declarations from a CSS file */
function extractCssVarNames(css: string): Set<string> {
  const names = new Set<string>()
  const re = /--([\w][\w-]*)\s*:/g
  let match: RegExpExecArray | null
  while ((match = re.exec(css)) !== null) {
    names.add(match[1])
  }
  return names
}

const css = readFileSync(GLOBALS_CSS_PATH, "utf-8")
const declaredVars = extractCssVarNames(css)

describe("Token registry ↔ globals.css sync", () => {
  const registries = [
    ["PALETTE", PALETTE],
    ["SEMANTIC_COLORS", SEMANTIC_COLORS],
    ["DOMAIN_COLORS", DOMAIN_COLORS],
    ["CHART_COLORS", CHART_COLORS],
    ["GLOWS", GLOWS],
    ["BORDERS", BORDERS],
    ["SURFACES", SURFACES],
    ["TYPOGRAPHY", TYPOGRAPHY],
    ["RADII", RADII],
    ["SIZING", SIZING],
  ] as const

  for (const [name, registry] of registries) {
    describe(name, () => {
      for (const key of Object.keys(registry)) {
        it(`--${key} is declared in globals.css`, () => {
          expect(
            declaredVars.has(key),
            `Token "${key}" from ${name} not found as --${key} in globals.css`
          ).toBe(true)
        })
      }
    })
  }
})

describe("Token registry structure", () => {
  it("TOKEN_CATEGORIES has 10 entries", () => {
    expect(TOKEN_CATEGORIES).toHaveLength(10)
  })

  it("TOKEN_REGISTRY keys match TOKEN_CATEGORIES", () => {
    const registryKeys = Object.keys(TOKEN_REGISTRY).sort()
    const categoryKeys = [...TOKEN_CATEGORIES].sort()
    expect(registryKeys).toEqual(categoryKeys)
  })

  it("cssVar() produces correct var() syntax", () => {
    expect(cssVar("background")).toBe("var(--background)")
    expect(cssVar("color-gold")).toBe("var(--color-gold)")
    expect(cssVar("text-card-title--line-height")).toBe(
      "var(--text-card-title--line-height)"
    )
  })
})

describe("Sync markers in globals.css", () => {
  it("globals.css contains @sherpa-tokens markers", () => {
    const markers = css.match(/@sherpa-tokens:\s*[\w-]+/g) ?? []
    expect(markers.length).toBeGreaterThanOrEqual(8)
  })
})
