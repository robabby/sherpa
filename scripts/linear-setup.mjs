#!/usr/bin/env node
/**
 * One-time Linear workspace setup for Sherpa.
 * Creates label groups and labels matching Sherpa's task taxonomy.
 * Idempotent — skips existing groups/labels.
 *
 * Usage: SHERPA_LINEAR_API_KEY=lin_... node scripts/linear-setup.mjs
 */
import { LinearClient } from "@linear/sdk"

const apiKey = process.env.SHERPA_LINEAR_API_KEY
if (!apiKey) {
  console.error("Set SHERPA_LINEAR_API_KEY env var")
  process.exit(1)
}

const client = new LinearClient({ apiKey })

const LABEL_GROUPS = {
  "Task Type": [
    "code-implementation", "code-review", "architect", "research",
    "content-generation", "audit", "embeddings", "general",
  ],
  "Mode": ["interactive", "supervised", "autonomous"],
  "Role": ["engineer", "research-lead", "technical-writer", "code-reviewer", "designer"],
  "Verdict": ["pending", "approved", "needs-changes", "rejected"],
}

async function main() {
  const org = await client.organization
  console.log(`Setting up Linear workspace: ${org.name}`)

  // Fetch existing labels (groups are labels with isGroup=true)
  const existingLabels = await client.issueLabels({ first: 250 })
  const labelsByName = new Map(existingLabels.nodes.map((l) => [l.name, l]))

  for (const [groupName, labels] of Object.entries(LABEL_GROUPS)) {
    // Check if group already exists
    const existingGroup = existingLabels.nodes.find(
      (l) => l.name === groupName && l.isGroup,
    )

    let groupId
    if (existingGroup) {
      console.log(`  ✓ Group "${groupName}" already exists`)
      groupId = existingGroup.id
    } else {
      const result = await client.createIssueLabel({ name: groupName, isGroup: true })
      const label = await result.issueLabel
      if (!label) throw new Error(`Failed to create group: ${groupName}`)
      groupId = label.id
      console.log(`  + Created group "${groupName}"`)
    }

    // Create labels within group
    for (const labelName of labels) {
      const existing = labelsByName.get(labelName)
      if (existing) {
        console.log(`    ✓ Label "${labelName}" already exists`)
        continue
      }
      await client.createIssueLabel({ name: labelName, parentId: groupId })
      console.log(`    + Created label "${labelName}"`)
    }
  }

  console.log("\nDone. Label groups configured for Sherpa task taxonomy.")
}

main().catch((err) => {
  console.error("Setup failed:", err.message)
  process.exit(1)
})
