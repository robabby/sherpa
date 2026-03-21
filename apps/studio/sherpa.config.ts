import fs from "node:fs"
import path from "node:path"
import { loadConfig } from "@sherpa/studio/config"

// In dev, cwd is apps/studio/ so ../../ reaches the monorepo root.
// In production, cwd is the monorepo root itself (WorkingDirectory in systemd).
// Detect which case by checking if sherpa.json exists at cwd.
const cwd = process.cwd()
const root = fs.existsSync(path.join(cwd, "sherpa.json"))
  ? cwd
  : path.resolve(cwd, "../..")

// Load root .env.local — Next.js only auto-loads apps/studio/.env.local
const envFile = path.join(root, ".env.local")
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^(\w+)=(.*)$/)
    if (m?.[1] && !(m[1] in process.env)) process.env[m[1]] = m[2] ?? ""
  }
}

export default loadConfig(root)
