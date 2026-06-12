/**
 * generate-reference-docs.ts
 *
 * Prebuild script that auto-generates reference documentation from:
 * 1. Component catalog (@sherpa/studio-ui/catalog) → domain-grouped MDX pages
 * 2. MCP tool definitions (via InMemoryTransport extraction) → domain-grouped MDX pages
 *
 * Run: pnpm generate-docs (or automatically via prebuild in build script)
 * Output: content/docs/reference/components/*.mdx and content/docs/reference/mcp-tools/*.mdx
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEBSITE_ROOT = path.resolve(__dirname, "..")
const CONTENT_ROOT = path.join(WEBSITE_ROOT, "content/docs/reference")
const REPO_ROOT = path.resolve(WEBSITE_ROOT, "../..")

// ── Component Catalog Generation ──────────────────────────────────────

interface CatalogEntry {
  name: string
  description: string
  pattern: string | null
  variants?: string[]
  tokens: string[]
  composedWith?: string[]
  isClient: boolean
  domain: string
  source: string
}

async function generateComponentDocs() {
  const catalogModule = await import("@sherpa/studio-ui/catalog")
  const catalog: CatalogEntry[] = catalogModule.COMPONENT_CATALOG

  // Group by domain
  const byDomain = new Map<string, CatalogEntry[]>()
  for (const entry of catalog) {
    const group = byDomain.get(entry.domain) ?? []
    group.push(entry)
    byDomain.set(entry.domain, group)
  }

  const outDir = path.join(CONTENT_ROOT, "components")
  fs.mkdirSync(outDir, { recursive: true })

  // Write meta.json (hand-authored files like index.mdx are NOT generated)
  const domainSlugs = [...byDomain.keys()].sort()
  fs.writeFileSync(
    path.join(outDir, "meta.json"),
    JSON.stringify(
      {
        title: "Components",
        pages: ["index", ...domainSlugs],
      },
      null,
      2,
    ) + "\n",
  )

  // Write index page
  const totalCount = catalog.length
  const domainTable = domainSlugs
    .map((d) => `| [${d}](/docs/reference/components/${d}) | ${byDomain.get(d)!.length} |`)
    .join("\n")

  fs.writeFileSync(
    path.join(outDir, "index.mdx"),
    `---
title: Components
description: "${totalCount} React components across ${domainSlugs.length} domains in @sherpa/studio-ui."
---

{/* AUTO-GENERATED — do not edit. Source: apps/website/scripts/generate-reference-docs.ts */}

## Component Catalog

${totalCount} components organized by domain.

| Domain | Count |
|--------|-------|
${domainTable}

See [Concepts: Studio](/docs/concepts/studio) for architecture context.
`,
  )

  // Write per-domain pages
  for (const [domain, entries] of byDomain) {
    const sorted = entries.sort((a, b) => a.name.localeCompare(b.name))
    const rows = sorted
      .map((e) => {
        const pattern = e.pattern ?? "—"
        const client = e.isClient ? "client" : "server"
        const composed = e.composedWith?.join(", ") ?? "—"
        return `| \`${e.name}\` | ${e.description} | ${pattern} | ${client} | ${composed} |`
      })
      .join("\n")

    fs.writeFileSync(
      path.join(outDir, `${domain}.mdx`),
      `---
title: "${domain.charAt(0).toUpperCase() + domain.slice(1)} Components"
description: "${entries.length} components in the ${domain} domain."
---

{/* AUTO-GENERATED — do not edit. Source: apps/website/scripts/generate-reference-docs.ts */}

## ${domain.charAt(0).toUpperCase() + domain.slice(1)} Domain

${entries.length} components.

| Component | Description | Pattern | Render | Composed With |
|-----------|-------------|---------|--------|---------------|
${rows}
`,
    )
  }

  console.log(
    `[generate-docs] Components: ${totalCount} entries → ${domainSlugs.length} domain pages`,
  )
}

// ── MCP Tool Documentation Generation ─────────────────────────────────

interface ToolDef {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
  annotations?: Record<string, unknown>
}

const TOOL_DOMAINS: Record<string, string[]> = {
  tasks: ["task_list", "task_get", "task_create", "task_update", "task_dispatch", "task_logs"],
  knowledge: ["search_knowledge", "get_summary", "get_context", "query_related"],
  infrastructure: ["lm_status"],
  authority: ["authority_acquire", "authority_release", "authority_renew", "get_dashboard"],
  initiatives: [
    "initiative_list",
    "initiative_get",
    "initiative_seeds",
    "initiative_create",
    "initiative_approve",
    "initiative_update_status",
    "initiative_activity",
  ],
}

function getDomain(toolName: string): string {
  for (const [domain, tools] of Object.entries(TOOL_DOMAINS)) {
    if (tools.includes(toolName)) return domain
  }
  return "other"
}

async function generateMcpToolDocs() {
  let tools: ToolDef[]

  try {
    // Try InMemoryTransport extraction
    const { Client } = await import("@modelcontextprotocol/sdk/client/index.js")
    const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js")
    const { createStudioMcpServer } = await import("@sherpa/studio-mcp")

    const server = createStudioMcpServer({
      projectRoot: path.resolve(WEBSITE_ROOT, "../.."),
    })

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    await server.connect(serverTransport)

    const client = new Client({ name: "docs-generator", version: "1.0.0" })
    await client.connect(clientTransport)

    const result = await client.listTools()
    tools = result.tools as ToolDef[]

    await client.close()
    console.log(`[generate-docs] MCP tools: extracted ${tools.length} tools via InMemoryTransport`)
  } catch (err) {
    console.warn(
      `[generate-docs] MCP tool extraction failed (${(err as Error).message}). Skipping MCP docs.`,
    )
    return
  }

  const outDir = path.join(CONTENT_ROOT, "mcp-tools")
  fs.mkdirSync(outDir, { recursive: true })

  // Group tools by domain
  const byDomain = new Map<string, ToolDef[]>()
  for (const tool of tools) {
    const domain = getDomain(tool.name)
    const group = byDomain.get(domain) ?? []
    group.push(tool)
    byDomain.set(domain, group)
  }

  const domainSlugs = [...byDomain.keys()].sort()

  // Write meta.json
  fs.writeFileSync(
    path.join(outDir, "meta.json"),
    JSON.stringify(
      {
        title: "MCP Tools",
        pages: ["index", ...domainSlugs],
      },
      null,
      2,
    ) + "\n",
  )

  // Write index page
  const domainTable = domainSlugs
    .map((d) => `| [${d}](/docs/reference/mcp-tools/${d}) | ${byDomain.get(d)!.length} |`)
    .join("\n")

  fs.writeFileSync(
    path.join(outDir, "index.mdx"),
    `---
title: MCP Tools
description: "${tools.length} tools across ${domainSlugs.length} domains in the Sherpa Studio MCP server."
---

{/* AUTO-GENERATED — do not edit. Source: apps/website/scripts/generate-reference-docs.ts */}

## Tool Reference

The Sherpa Studio MCP server exposes ${tools.length} tools via the Model Context Protocol.
Connect via Streamable HTTP at \`http://localhost:3100/mcp\`.

| Domain | Tools |
|--------|-------|
${domainTable}
`,
  )

  // Write per-domain pages
  for (const [domain, domainTools] of byDomain) {
    const toolBlocks = domainTools
      .map((t) => {
        const params = t.inputSchema?.properties
          ? Object.entries(t.inputSchema.properties as Record<string, Record<string, unknown>>)
              .map(([name, prop]) => {
                const required = (t.inputSchema?.required as string[])?.includes(name)
                  ? "**yes**"
                  : "no"
                const type = (prop.type as string) ?? "unknown"
                const desc = (prop.description as string) ?? ""
                return `| \`${name}\` | ${type} | ${required} | ${desc} |`
              })
              .join("\n")
          : null

        return `### \`${t.name}\`

${t.description ?? ""}

${
  params
    ? `| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
${params}`
    : "*No parameters.*"
}
`
      })
      .join("\n---\n\n")

    fs.writeFileSync(
      path.join(outDir, `${domain}.mdx`),
      `---
title: "${domain.charAt(0).toUpperCase() + domain.slice(1)} Tools"
description: "MCP tools for ${domain} operations."
---

{/* AUTO-GENERATED — do not edit. Source: apps/website/scripts/generate-reference-docs.ts */}

${toolBlocks}`,
    )
  }

  console.log(`[generate-docs] MCP tools: ${tools.length} tools → ${domainSlugs.length} domain pages`)
}

// ── Framework Stats Generation ────────────────────────────────────────

function countMdFiles(dir: string): number {
  return fs.readdirSync(dir).filter((n) => n.endsWith(".md")).length
}

function countDirsContaining(dir: string, marker: string): number {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, marker)))
    .length
}

function countPageRoutes(dir: string): number {
  let count = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) count += countPageRoutes(path.join(dir, entry.name))
    else if (entry.name === "page.tsx") count += 1
  }
  return count
}

/**
 * Counts the real governance artifacts in the repository so marketing copy
 * can never drift from reality. Output is committed (src/generated/) so
 * typechecking works without a prior generate run; every dev/build refreshes it.
 */
async function generateFrameworkStats() {
  const catalogModule = await import("@sherpa/studio-ui/catalog")

  const stats = {
    agentRoles: countMdFiles(path.join(REPO_ROOT, "docs/agents/roles")),
    skills: countDirsContaining(path.join(REPO_ROOT, ".claude/skills"), "SKILL.md"),
    rules: countMdFiles(path.join(REPO_ROOT, ".claude/rules")),
    components: (catalogModule.COMPONENT_CATALOG as CatalogEntry[]).length,
    studioRoutes: countPageRoutes(path.join(REPO_ROOT, "apps/studio/src/app")),
    initiatives: countDirsContaining(path.join(REPO_ROOT, "docs/initiatives"), "proposal.md"),
  }

  const zeroes = Object.entries(stats).filter(([, v]) => v === 0)
  if (zeroes.length > 0) {
    throw new Error(
      `[generate-docs] Framework stats counted 0 for: ${zeroes.map(([k]) => k).join(", ")} — refusing to publish a zero count`,
    )
  }

  const outDir = path.join(WEBSITE_ROOT, "src/generated")
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, "framework-stats.ts"),
    `// AUTO-GENERATED — do not edit. Source: apps/website/scripts/generate-reference-docs.ts
// Counts measured from the repository at build time.
export const FRAMEWORK_STATS = ${JSON.stringify(stats, null, 2)} as const
`,
  )

  console.log(`[generate-docs] Framework stats: ${JSON.stringify(stats)}`)
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(CONTENT_ROOT, { recursive: true })

  await generateComponentDocs()
  await generateMcpToolDocs()
  await generateFrameworkStats()

  console.log("[generate-docs] Done.")
}

main().catch((err) => {
  console.error("[generate-docs] Fatal error:", err)
  process.exit(1)
})
