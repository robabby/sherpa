import fs from "node:fs"
import path from "node:path"
import { loadConfig } from "@sherpa/studio/config"

const root = path.resolve(process.cwd(), "../..")

// Load root .env.local — Next.js only auto-loads apps/studio/.env.local
const envFile = path.join(root, ".env.local")
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^(\w+)=(.*)$/)
    if (m?.[1] && !(m[1] in process.env)) process.env[m[1]] = m[2] ?? ""
  }
}

export default loadConfig(root)
