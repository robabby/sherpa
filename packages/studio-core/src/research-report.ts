import { readProjectFile } from "./content"

// ---------------------------------------------------------------------------
// Extensible report registry
// ---------------------------------------------------------------------------

/**
 * Registry mapping report slugs to their JSON file paths (relative to project root).
 * Consumers populate this via registerResearchReport().
 */
const REPORT_REGISTRY = new Map<string, string>()

/** Register a research report slug → file path mapping. */
export function registerResearchReport(slug: string, filePath: string): void {
  REPORT_REGISTRY.set(slug, filePath)
}

/** Get all registered report slugs. */
export function getRegisteredReportSlugs(): string[] {
  return Array.from(REPORT_REGISTRY.keys())
}

/** Get the file path for a registered report. */
export function getReportFilePath(slug: string): string | undefined {
  return REPORT_REGISTRY.get(slug)
}

/**
 * Load raw JSON for a research report by slug.
 * Returns null if the slug is unknown or the file is missing/unparseable.
 */
export function getResearchReportRaw(slug: string): unknown | null {
  const filePath = REPORT_REGISTRY.get(slug)
  if (!filePath) return null

  const source = readProjectFile(filePath)
  if (!source) return null

  try {
    return JSON.parse(source)
  } catch {
    return null
  }
}
