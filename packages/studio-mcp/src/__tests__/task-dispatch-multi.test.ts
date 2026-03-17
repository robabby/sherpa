import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { BACKEND_META } from "@sherpa/studio-core"
import type { Backend } from "@sherpa/studio-core"

describe("task_dispatch multi-backend", () => {
  const repoRoot = path.resolve(__dirname, "../../../../")

  it("all backends have a known type (cli or api)", () => {
    for (const [, meta] of Object.entries(BACKEND_META)) {
      expect(["cli", "api"]).toContain(meta.type)
    }
  })

  it("worker.sh exists at expected path", () => {
    const workerPath = path.join(repoRoot, "scripts/worker.sh")
    expect(fs.existsSync(workerPath)).toBe(true)
  })

  it("every backend has a matching script in scripts/backends/", () => {
    const backends = Object.keys(BACKEND_META) as Backend[]
    for (const backend of backends) {
      const mjsPath = path.join(repoRoot, `scripts/backends/${backend}.mjs`)
      const shPath = path.join(repoRoot, `scripts/backends/${backend}.sh`)
      const exists = fs.existsSync(mjsPath) || fs.existsSync(shPath)
      expect(exists, `Missing script for backend: ${backend}`).toBe(true)
    }
  })
})
