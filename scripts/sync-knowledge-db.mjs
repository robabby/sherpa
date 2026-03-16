#!/usr/bin/env node
/**
 * Sync the knowledge database from the filesystem.
 * Usage: node scripts/sync-knowledge-db.mjs [--project-root <path>]
 */
import path from "node:path"
import { resolveDbPaths, openDb, closeAll, applyKnowledgeSchema, syncFromFilesystem } from "@sherpa/studio-core/db"

const projectRoot = process.argv.includes("--project-root")
  ? process.argv[process.argv.indexOf("--project-root") + 1]
  : process.cwd()

const paths = resolveDbPaths(projectRoot)

console.log("Syncing knowledge database...")
console.log(`  Project root: ${projectRoot}`)
console.log(`  Database:     ${paths.knowledge}`)

const db = openDb(paths.knowledge)
applyKnowledgeSchema(db)

const start = Date.now()
const stats = syncFromFilesystem(db, projectRoot)
const elapsed = Date.now() - start

console.log(`\nSync complete in ${elapsed}ms:`)
console.log(`  Files processed:           ${stats.filesProcessed}`)
console.log(`  Files skipped (unchanged): ${stats.filesSkipped}`)
console.log(`  Files removed:             ${stats.filesRemoved}`)
console.log(`  Edges created:             ${stats.edgesCreated}`)

const fileCount = /** @type {{ count: number }} */ (db.prepare("SELECT COUNT(*) as count FROM files").get()).count
const edgeCount = /** @type {{ count: number }} */ (db.prepare("SELECT COUNT(*) as count FROM edges").get()).count
console.log(`\nDatabase totals:`)
console.log(`  Files indexed: ${fileCount}`)
console.log(`  Edges tracked: ${edgeCount}`)

closeAll()
