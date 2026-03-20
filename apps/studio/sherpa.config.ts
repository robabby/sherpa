import path from "node:path"
import { loadConfig } from "@sherpa/studio/config"

export default loadConfig(path.resolve(process.cwd(), "../.."))
