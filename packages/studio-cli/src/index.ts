#!/usr/bin/env node
/**
 * Sherpa Studio CLI
 *
 * Commands:
 *   sherpa init  — Scaffold convention files into a new project
 *   sherpa sync  — Sync convention files with upstream framework
 */

import { init } from "./commands/init.js"
import { sync } from "./commands/sync.js"

const command = process.argv[2]
const projectRoot = process.cwd()

switch (command) {
  case "init":
    await init(projectRoot)
    break
  case "sync":
    await sync(projectRoot)
    break
  default:
    console.log(`
Sherpa Studio CLI

Usage:
  sherpa init   Scaffold convention files into current directory
  sherpa sync   Sync convention files with upstream framework

Options:
  --help        Show this help message
`)
    if (command && command !== "--help" && command !== "-h") {
      console.error(`Unknown command: ${command}`)
      process.exit(1)
    }
}
