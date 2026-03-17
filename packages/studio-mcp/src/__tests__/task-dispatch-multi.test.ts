import { describe, it, expect } from "vitest"
import { BACKEND_META } from "@sherpa/studio-core"

describe("task_dispatch multi-backend", () => {
  it("all backends have a known type (cli or api)", () => {
    for (const [, meta] of Object.entries(BACKEND_META)) {
      expect(["cli", "api"]).toContain(meta.type)
    }
  })

  it("worker.sh exists at expected path", () => {
    const fs = require("node:fs")
    const path = require("node:path")
    const repoRoot = path.resolve(__dirname, "../../../../")
    const workerPath = path.join(repoRoot, "scripts/worker.sh")
    expect(fs.existsSync(workerPath)).toBe(true)
  })
})
