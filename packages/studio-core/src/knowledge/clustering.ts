import type { KnowledgeBackend } from "./types"

export interface Cluster {
  members: string[]
  label: string
}

/**
 * Simple agglomerative clustering with single-linkage.
 * O(n²) — fine for 40-100 initiatives. Upgrade path to HDBSCAN
 * documented in shape.md for 500+ initiatives.
 *
 * Uses rank-based similarity from the corpus embeddings.
 * minSimilarity defaults to 0.08 based on stress test A7
 * (average pairwise = 0.05, useful signal at 0.08+).
 */
export function agglomerativeClusters(
  items: Array<{ id: string; embedding: number[] }>,
  backend: KnowledgeBackend,
  minSimilarity: number = 0.15,
): Cluster[] {
  if (items.length < 2) return []

  // Initialize: each item is its own cluster
  let clusters: Array<{ members: string[]; centroid: number[] }> = items.map(item => ({
    members: [item.id],
    centroid: item.embedding,
  }))

  // Merge until no pair exceeds threshold
  while (true) {
    let bestI = -1
    let bestJ = -1
    let bestSim = -1

    // Find the most similar pair
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const sim = backend.cosineSimilarity(clusters[i]!.centroid, clusters[j]!.centroid)
        if (sim > bestSim) {
          bestSim = sim
          bestI = i
          bestJ = j
        }
      }
    }

    if (bestSim < minSimilarity || bestI === -1) break

    // Merge clusters[bestJ] into clusters[bestI]
    const a = clusters[bestI]!
    const b = clusters[bestJ]!
    const mergedMembers = [...a.members, ...b.members]

    // Average centroid
    const mergedCentroid = a.centroid.map((val, idx) => {
      const aWeight = a.members.length
      const bWeight = b.members.length
      return (val * aWeight + (b.centroid[idx] ?? 0) * bWeight) / (aWeight + bWeight)
    })

    clusters[bestI] = { members: mergedMembers, centroid: mergedCentroid }
    clusters.splice(bestJ, 1)
  }

  // Filter out singletons and label clusters
  return clusters
    .filter(c => c.members.length >= 2)
    .map(c => ({
      members: c.members,
      label: c.members.join(", "), // Placeholder — improved below
    }))
}

/**
 * Generate a label for a cluster from the highest-IDF shared terms.
 * Requires the corpus to be indexed in the backend first.
 */
export function labelCluster(
  memberTexts: Array<{ id: string; text: string }>,
  topN: number = 3,
): string {
  if (memberTexts.length === 0) return "empty"

  // Tokenize all member documents
  const allTokens = new Map<string, number>()
  for (const doc of memberTexts) {
    const tokens = doc.text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(t => t.length >= 3)

    const seen = new Set<string>()
    for (const token of tokens) {
      if (!seen.has(token)) {
        allTokens.set(token, (allTokens.get(token) ?? 0) + 1)
        seen.add(token)
      }
    }
  }

  // Find terms that appear in ALL members (shared vocabulary)
  const sharedTerms = Array.from(allTokens.entries())
    .filter(([, count]) => count === memberTexts.length)
    .map(([term]) => term)

  // If not enough shared terms, use most common terms
  if (sharedTerms.length < topN) {
    const commonTerms = Array.from(allTokens.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([term]) => term)
      .filter(t => !["the", "and", "for", "that", "this", "with", "from", "are", "has", "not", "but"].includes(t))

    return commonTerms.slice(0, topN).join(" + ")
  }

  // Filter out governance boilerplate
  const boilerplate = new Set([
    "initiative", "initiatives", "status", "approved", "pending", "integrated",
    "proposal", "summary", "rationale", "dependencies", "targets", "created",
    "updated", "type", "risk", "spawned", "from", "null", "docs", "the",
    "and", "that", "this", "with", "for", "are", "has", "not", "but",
    "will", "can", "into", "when", "each", "new", "plan", "changes",
    "state", "current", "existing", "based", "work", "support", "system",
    "snapshot", "proposed", "review", "notes", "section", "would", "should",
    "could", "need", "use", "used", "using", "make", "build", "add",
    "sherpa", "studio", "2026-03-16", "2026-03-15", "2026-03-14", "2026-03-13",
    "2026-03-12", "2026-03-11", "new-plan", "new-skill", "research-synthesis",
    "additive", "evolutionary", "structural", "process-change",
    "---", "yaml", "frontmatter",
  ])

  const meaningful = sharedTerms.filter(t => !boilerplate.has(t))
  if (meaningful.length >= topN) return meaningful.slice(0, topN).join(" + ")
  return sharedTerms.filter(t => !boilerplate.has(t)).concat(sharedTerms).slice(0, topN).join(" + ")
}
