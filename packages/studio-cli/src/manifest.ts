import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SherpaManifest {
  $schema: "sherpa/manifest@1"
  frameworkVersion: string
  syncedAt: string
  files: Record<string, ManifestFileEntry>
}

export interface ManifestFileEntry {
  /** Hash of the upstream (framework) version at last sync. */
  upstreamHash: string
  /** Hash of the local file at last sync. */
  localHashAtSync: string
  /** Current sync status. */
  status: "synced" | "modified" | "new" | "deleted" | "diverged" | "orphaned"
  /** Framework version this was synced from. */
  syncedVersion: string
  /** ISO timestamp of last sync. */
  syncedAt: string
}

export type FileStatus = ManifestFileEntry["status"]

// ---------------------------------------------------------------------------
// Hash utility
// ---------------------------------------------------------------------------

export function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16)
}

// ---------------------------------------------------------------------------
// Manifest I/O
// ---------------------------------------------------------------------------

const MANIFEST_FILE = "sherpa.manifest.json"

export function getManifestPath(projectRoot: string): string {
  return path.join(projectRoot, MANIFEST_FILE)
}

export function readManifest(projectRoot: string): SherpaManifest | null {
  const manifestPath = getManifestPath(projectRoot)
  if (!fs.existsSync(manifestPath)) return null
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
  } catch {
    return null
  }
}

export function writeManifest(projectRoot: string, manifest: SherpaManifest): void {
  const manifestPath = getManifestPath(projectRoot)
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
}

export function createEmptyManifest(frameworkVersion: string): SherpaManifest {
  return {
    $schema: "sherpa/manifest@1",
    frameworkVersion,
    syncedAt: new Date().toISOString(),
    files: {},
  }
}

// ---------------------------------------------------------------------------
// File status classification
// ---------------------------------------------------------------------------

export interface ClassifiedFile {
  relativePath: string
  status: FileStatus
  upstreamContent: string | null
  localContent: string | null
  manifestEntry: ManifestFileEntry | null
}

/**
 * Classify a managed file's sync status by comparing hashes.
 */
export function classifyFile(
  relativePath: string,
  projectRoot: string,
  upstreamContent: string | null,
  manifestEntry: ManifestFileEntry | null,
): ClassifiedFile {
  const localPath = path.join(projectRoot, relativePath)
  const localContent = fs.existsSync(localPath)
    ? fs.readFileSync(localPath, "utf-8")
    : null

  // No manifest entry — new upstream file
  if (!manifestEntry) {
    return {
      relativePath,
      status: localContent ? "diverged" : "new",
      upstreamContent,
      localContent,
      manifestEntry: null,
    }
  }

  // Upstream removed
  if (!upstreamContent) {
    return {
      relativePath,
      status: "orphaned",
      upstreamContent: null,
      localContent,
      manifestEntry,
    }
  }

  // Local deleted
  if (!localContent) {
    return {
      relativePath,
      status: "deleted",
      upstreamContent,
      localContent: null,
      manifestEntry,
    }
  }

  const localHash = hashContent(localContent)
  const upstreamHash = hashContent(upstreamContent)

  // Both unchanged
  if (localHash === manifestEntry.localHashAtSync && upstreamHash === manifestEntry.upstreamHash) {
    return { relativePath, status: "synced", upstreamContent, localContent, manifestEntry }
  }

  // Only upstream changed
  if (localHash === manifestEntry.localHashAtSync && upstreamHash !== manifestEntry.upstreamHash) {
    return { relativePath, status: "new", upstreamContent, localContent, manifestEntry }
  }

  // Only local changed
  if (localHash !== manifestEntry.localHashAtSync && upstreamHash === manifestEntry.upstreamHash) {
    return { relativePath, status: "modified", upstreamContent, localContent, manifestEntry }
  }

  // Both changed
  return { relativePath, status: "diverged", upstreamContent, localContent, manifestEntry }
}
