import fs from "fs"

import { readProjectFile, resolveProjectPath } from "./content"
import { chartSpecSchema, deckSpecSchema } from "./schemas"
import type { ChartSpec, DeckSpec, DeliverableSummary } from "./types"

/**
 * List JSON files in a directory within the project.
 */
function listDeliverableJsonFiles(dirPath: string): string[] {
  const abs = resolveProjectPath(dirPath)
  if (!fs.existsSync(abs)) return []

  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".json"))
    .map((f) => `${dirPath}/${f}`)
}

/**
 * Parse and validate a deliverable JSON file.
 * Returns the typed spec or null if invalid.
 */
function parseDeliverable(
  relativePath: string,
): ChartSpec | DeckSpec | null {
  const source = readProjectFile(relativePath)
  if (!source) return null

  try {
    const json = JSON.parse(source)
    const schema = json?.$schema

    if (schema === "wavepoint/chart@1") {
      const result = chartSpecSchema.safeParse(json)
      return result.success ? result.data : null
    }

    if (schema === "wavepoint/deck@1") {
      const result = deckSpecSchema.safeParse(json)
      return result.success ? result.data : null
    }

    return null
  } catch {
    return null
  }
}

/**
 * Get lightweight summaries of all deliverables for an initiative.
 */
export function getDeliverables(basePath: string): DeliverableSummary[] {
  const dirPath = `${basePath}/deliverables`
  const files = listDeliverableJsonFiles(dirPath)
  const summaries: DeliverableSummary[] = []

  for (const filePath of files) {
    const spec = parseDeliverable(filePath)
    if (!spec) continue

    const fileName = filePath.split("/").pop() ?? filePath
    const isChart = spec.$schema === "wavepoint/chart@1"

    summaries.push({
      id: spec.id,
      type: isChart ? "chart" : "deck",
      title: spec.title,
      description: spec.description,
      created: spec.created,
      sourceIteration: spec.sourceIteration,
      fileName,
      slideCount: !isChart ? (spec as DeckSpec).slides.length : undefined,
    })
  }

  return summaries.sort((a, b) => b.created.localeCompare(a.created))
}

/**
 * Load a single deliverable by ID from the given initiative path.
 */
export function getDeliverable(
  basePath: string,
  id: string,
): ChartSpec | DeckSpec | null {
  const dirPath = `${basePath}/deliverables`
  const files = listDeliverableJsonFiles(dirPath)

  for (const filePath of files) {
    const spec = parseDeliverable(filePath)
    if (spec && spec.id === id) return spec
  }

  return null
}

/**
 * Count deliverables for an initiative (lightweight — no parsing).
 */
export function getDeliverableCount(basePath: string): number {
  const dirPath = `${basePath}/deliverables`
  const abs = resolveProjectPath(dirPath)
  if (!fs.existsSync(abs)) return 0

  return fs.readdirSync(abs).filter((f) => f.endsWith(".json")).length
}
