import path from "node:path"
import { defineConfig } from "@sherpa/studio/config"

export default defineConfig({
  projectRoot: path.resolve(process.cwd(), "../.."),
  admin: {
    projectName: "Sherpa",
    projectDescription: "Behavioral agentic collaboration framework",
  },
  paths: {
    initiatives: "docs/initiatives",
    agentRoles: "docs/agents/roles",
    rules: ".claude/rules",
    skills: ".claude/skills",
  },
  entities: {
    projectSkillSlugs: ["rr", "integration-review", "plan-tasks"],
    claudeMdLocations: ["CLAUDE.md"],
    claudeMdScanDirs: [],
  },
})
