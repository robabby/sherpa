import { describe, it, expect, afterEach, beforeEach } from "vitest"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { loadJsonConfig } from "../config/load-json"

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sherpa-test-"))
})

afterEach(() => {
  if (tmpDir) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

describe("loadJsonConfig", () => {
  it("returns null when no config file exists", () => {
    const result = loadJsonConfig(tmpDir)
    expect(result).toBeNull()
  })

  it("loads sherpa.json from project root", () => {
    fs.writeFileSync(
      path.join(tmpDir, "sherpa.json"),
      JSON.stringify({
        admin: { projectName: "Test" },
      }),
    )

    const result = loadJsonConfig(tmpDir)
    expect(result).not.toBeNull()
    expect(result!.admin!.projectName).toBe("Test")
    expect(result!.projectRoot).toBe(tmpDir)
  })

  it("loads .sherpa/config.json as fallback", () => {
    fs.mkdirSync(path.join(tmpDir, ".sherpa"), { recursive: true })
    fs.writeFileSync(
      path.join(tmpDir, ".sherpa/config.json"),
      JSON.stringify({
        admin: { projectName: "Dotfolder" },
      }),
    )

    const result = loadJsonConfig(tmpDir)
    expect(result).not.toBeNull()
    expect(result!.admin!.projectName).toBe("Dotfolder")
  })

  it("prefers sherpa.json over .sherpa/config.json", () => {
    fs.writeFileSync(
      path.join(tmpDir, "sherpa.json"),
      JSON.stringify({ admin: { projectName: "Root" } }),
    )
    fs.mkdirSync(path.join(tmpDir, ".sherpa"), { recursive: true })
    fs.writeFileSync(
      path.join(tmpDir, ".sherpa/config.json"),
      JSON.stringify({ admin: { projectName: "Dotfolder" } }),
    )

    const result = loadJsonConfig(tmpDir)
    expect(result!.admin!.projectName).toBe("Root")
  })

  it("throws on invalid JSON", () => {
    fs.writeFileSync(path.join(tmpDir, "sherpa.json"), "not valid json{{{")
    expect(() => loadJsonConfig(tmpDir)).toThrow("Failed to parse")
  })
})

describe("env var interpolation", () => {
  const ENV_KEY = "SHERPA_TEST_PROJECTS_DIR"

  beforeEach(() => {
    process.env[ENV_KEY] = "/test/projects"
  })

  afterEach(() => {
    delete process.env[ENV_KEY]
  })

  it("interpolates ${VAR} in string values", () => {
    fs.writeFileSync(
      path.join(tmpDir, "sherpa.json"),
      JSON.stringify({
        admin: { projectName: "Test" },
        projects: [
          {
            name: "Other",
            slug: "other",
            root: "${SHERPA_TEST_PROJECTS_DIR}/other",
            remote: "git@github.com:test/other.git",
          },
        ],
      }),
    )

    const result = loadJsonConfig(tmpDir)
    expect(result!.projects![0]!.root).toBe("/test/projects/other")
  })

  it("interpolates multiple env vars in the same string", () => {
    process.env.SHERPA_TEST_PREFIX = "prefix"
    fs.writeFileSync(
      path.join(tmpDir, "sherpa.json"),
      JSON.stringify({
        admin: { projectName: "${SHERPA_TEST_PREFIX}-${SHERPA_TEST_PROJECTS_DIR}" },
      }),
    )

    const result = loadJsonConfig(tmpDir)
    expect(result!.admin!.projectName).toBe("prefix-/test/projects")
    delete process.env.SHERPA_TEST_PREFIX
  })

  it("throws when referenced env var is not set", () => {
    fs.writeFileSync(
      path.join(tmpDir, "sherpa.json"),
      JSON.stringify({
        projects: [
          { name: "X", slug: "x", root: "${NONEXISTENT_VAR_12345}/x" },
        ],
      }),
    )

    expect(() => loadJsonConfig(tmpDir)).toThrow("NONEXISTENT_VAR_12345")
  })

  it("leaves strings without ${} unchanged", () => {
    fs.writeFileSync(
      path.join(tmpDir, "sherpa.json"),
      JSON.stringify({
        admin: { projectName: "No interpolation here" },
      }),
    )

    const result = loadJsonConfig(tmpDir)
    expect(result!.admin!.projectName).toBe("No interpolation here")
  })
})
