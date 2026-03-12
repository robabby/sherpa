/**
 * WavePoint-specific type stubs.
 * These types exist so studio-ui components compile.
 * The panels using them are not rendered in Sherpa's pages.
 */

export type PrimitiveLevel = "L1" | "L2" | "L3" | "L4" | "L5"

export interface PrimitiveCatalogEntry {
  module: string
  slug: string
  level: PrimitiveLevel
  detectedExports: ExportSignature[]
  displayName: string
  description: string
  exportCount: number
  lineCount: number
  dependencies: string[]
  dependents: string[]
  relativePath: string
  metadata?: {
    name: string
    level: PrimitiveLevel
    description: string
    keyExports: ExportSignature[]
    status?: string
    dependencies: string[]
    [key: string]: unknown
  } | null
  [key: string]: unknown
}

export type ExportSignatureKind =
  | "function"
  | "type"
  | "type-alias"
  | "variable"
  | "interface"
  | "const"
  | "class"
  | "enum"
  | "unknown"

export interface ExportSignature {
  name: string
  kind: ExportSignatureKind
  typeSignature?: string
  isDefault: boolean
  text?: string
  parameters?: { name: string; type: string; optional?: boolean }[]
  returnType?: string
  properties?: { name: string; type: string; optional?: boolean }[]
  members?: { name: string; value?: string | number }[]
  referencedTypes?: Record<string, ExportSignature>
  [key: string]: unknown
}

export interface EndpointCatalogEntry {
  method: string
  path: string
  slug: string
  tag: string
  description: string
  auth: boolean
  rateLimit: boolean
  metadata: {
    method: "GET" | "POST"
    path: string
    name: string
    description: string
    level: PrimitiveLevel
    auth: string
    primitives: string[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface EclipseActivationEvent {
  date: string
  eclipseDate: string
  eclipseType: string
  transitBody: string
  aspect: string
  longitude: number
  activationLongitude: number
  marsLongitude: number
  eclipseLongitude: number
  eclipseFamily: string
  sarosNumber: string | number
  recessionName?: string | null
  daysToRecession?: number | null
  nearestRecessionStart?: string | null
  isHit?: boolean
  [key: string]: unknown
}

export interface SaturnQuarterCycleEvent {
  date: string
  phase: string
  longitude: number
  quadrant?: string
  nearestRecessionStart?: string | null
  daysToRecession?: number | null
  recessionName?: string | null
  isHit?: boolean
  [key: string]: unknown
}

export interface LongitudeTimeSeriesPoint {
  date: string
  longitude: number
  isQuarterCross?: boolean
  [key: string]: unknown
}

export const PRIMITIVE_LEVELS: PrimitiveLevel[] = [
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
]

export const LEVEL_NAMES: Record<PrimitiveLevel, string> = {
  L1: "Raw",
  L2: "Structured",
  L3: "Scored",
  L4: "Context",
  L5: "Reading",
}

export const LEVEL_DESCRIPTIONS: Record<PrimitiveLevel, string> = {
  L1: "Raw astronomical positions",
  L2: "Structured chart data",
  L3: "Scored timing arcs",
  L4: "Contextual synthesis",
  L5: "Human-readable briefing",
}

export const LEVEL_VERBS: Record<PrimitiveLevel, string> = {
  L1: "computes",
  L2: "structures",
  L3: "scores",
  L4: "synthesizes",
  L5: "narrates",
}

export function getPrimitivesStats(_catalog?: PrimitiveCatalogEntry[]) {
  return { total: 0, byLevel: {} as Record<PrimitiveLevel, number>, perLevel: {} as Record<PrimitiveLevel, number> }
}

export function getApiStats() {
  return { total: 0, endpointCount: 0, computationCount: 0, contentCount: 0, byTag: {} as Record<string, number> }
}

export function getPrimitivesCatalog(): PrimitiveCatalogEntry[] {
  return []
}

export function getApiCatalog(): EndpointCatalogEntry[] {
  return []
}

export function groupByLevel(
  _catalog: PrimitiveCatalogEntry[],
): Record<PrimitiveLevel, PrimitiveCatalogEntry[]> {
  return { L1: [], L2: [], L3: [], L4: [], L5: [] }
}

export function buildDependencyMap(
  _catalog: PrimitiveCatalogEntry[],
): Map<string, Set<string>> {
  return new Map()
}

export function getPrimitiveDependents(
  _module: string,
  _catalog: PrimitiveCatalogEntry[],
): PrimitiveCatalogEntry[] {
  return []
}

export function getLevelPeers(
  _module: string,
  _catalog: PrimitiveCatalogEntry[],
): PrimitiveCatalogEntry[] {
  return []
}

export function resolveDependencies(
  _module: string,
  _catalog: PrimitiveCatalogEntry[],
): PrimitiveCatalogEntry[] {
  return []
}

export function groupEndpointsByTag(
  _catalog: EndpointCatalogEntry[],
): Record<string, EndpointCatalogEntry[]> {
  return {}
}

export function getEndpointsForPrimitive(
  _module: string,
  _catalog: EndpointCatalogEntry[],
): EndpointCatalogEntry[] {
  return []
}

// Research report types (WavePoint-specific)
export interface MonteCarloResult {
  [key: string]: unknown
}

export interface SaturnBacktestPayload {
  [key: string]: unknown
}

export interface EclipseBacktestPayload {
  [key: string]: unknown
}

export interface ResearchReport {
  [key: string]: unknown
}

/**
 * WavePoint-specific: get research files grouped by track.
 * Returns empty in Sherpa (no research/ directory convention).
 */
import type { ContentFile } from "@sherpa/studio-core/types"

export function getResearchByTrack(): Record<string, ContentFile[]> {
  return {}
}

/**
 * WavePoint-specific: get a research report by slug.
 * Returns null in Sherpa.
 */
export function getResearchReport(_slug: string): null {
  return null
}
