import type Database from "better-sqlite3"
import type { KnowledgeBackend } from "../knowledge/types"
import { agglomerativeClusters, labelCluster } from "../knowledge/clustering"

export interface EmbeddingSyncStats {
  summariesCreated: number
  inferredEdgesCreated: number
  clustersCreated: number
}

/**
 * Sync embeddings and summaries for all initiative proposals.
 * Builds a TF-IDF corpus index, generates extractive summaries,
 * computes pairwise similarity, and populates inferred_edges.
 *
 * Uses rank-based retrieval (top-K per initiative), not threshold-based.
 * Stress test A7 showed TF-IDF scores range 0.05-0.20 on this corpus.
 */
export function syncEmbeddings(
  db: Database.Database,
  backend: KnowledgeBackend,
  topK: number = 5,
): EmbeddingSyncStats {
  const stats: EmbeddingSyncStats = { summariesCreated: 0, inferredEdgesCreated: 0, clustersCreated: 0 }

  // Load all initiative proposals
  const proposals = db.prepare(`
    SELECT initiative, content FROM files
    WHERE kind = 'initiative' AND initiative IS NOT NULL
  `).all() as Array<{ initiative: string; content: string }>

  if (proposals.length < 2) return stats

  // Build corpus index
  backend.buildCorpusIndex(
    proposals.map(p => ({ id: p.initiative, text: p.content }))
  )

  // Generate summaries and embeddings for each initiative
  const upsertSummary = db.prepare(`
    INSERT INTO summaries (id, level, parent_id, summary, embedding, stale, updated_at)
    VALUES (?, 'initiative', NULL, ?, ?, 0, ?)
    ON CONFLICT(id) DO UPDATE SET
      summary = excluded.summary,
      embedding = excluded.embedding,
      stale = 0,
      updated_at = excluded.updated_at
  `)

  const now = Date.now()
  const embeddings = new Map<string, number[]>()

  for (const proposal of proposals) {
    const summary = backend.summarize(proposal.content, 150)
    const embedding = backend.embedWithCorpus(proposal.initiative)
    if (!embedding) continue

    embeddings.set(proposal.initiative, embedding)
    upsertSummary.run(
      proposal.initiative,
      summary,
      JSON.stringify(embedding),
      now,
    )
    stats.summariesCreated++
  }

  // Compute pairwise similarity and store top-K inferred edges per initiative
  const clearInferred = db.prepare("DELETE FROM inferred_edges")
  const insertInferred = db.prepare(`
    INSERT OR IGNORE INTO inferred_edges (source, target, similarity, kind, created_at)
    VALUES (?, ?, ?, ?, ?)
  `)

  // Load explicit edges to distinguish emergent from creative
  const explicitPairs = new Set<string>()
  const explicitEdges = db.prepare("SELECT source, target FROM edges").all() as Array<{ source: string; target: string }>
  for (const e of explicitEdges) {
    explicitPairs.add(`${e.source}:${e.target}`)
    explicitPairs.add(`${e.target}:${e.source}`)
  }

  clearInferred.run()

  const slugs = Array.from(embeddings.keys())
  for (let i = 0; i < slugs.length; i++) {
    const source = slugs[i]!
    const sourceVec = embeddings.get(source)!

    // Compute similarity to all other initiatives
    const similarities: Array<{ target: string; similarity: number }> = []
    for (let j = 0; j < slugs.length; j++) {
      if (i === j) continue
      const target = slugs[j]!
      const targetVec = embeddings.get(target)!
      const sim = backend.cosineSimilarity(sourceVec, targetVec)
      similarities.push({ target, similarity: sim })
    }

    // Sort by similarity descending, take top-K
    similarities.sort((a, b) => b.similarity - a.similarity)
    const topPairs = similarities.slice(0, topK)

    for (const pair of topPairs) {
      const hasExplicitEdge = explicitPairs.has(`${source}:${pair.target}`)
      const kind = hasExplicitEdge ? "semantic-neighbor" : "semantic-neighbor"
      // Both get "semantic-neighbor" — the distinction between emergent and creative
      // is computed at query time based on graph distance, not at index time.

      insertInferred.run(source, pair.target, pair.similarity, kind, now)
      stats.inferredEdgesCreated++
    }
  }

  // Phase 3: Agglomerative clustering
  const clusterItems = Array.from(embeddings.entries()).map(([id, embedding]) => ({ id, embedding }))
  const clusters = agglomerativeClusters(clusterItems, backend)

  const clearClusters = db.prepare("DELETE FROM clusters")
  const insertCluster = db.prepare(
    "INSERT INTO clusters (cluster_id, label, member_ids, updated_at) VALUES (?, ?, ?, ?)"
  )

  clearClusters.run()
  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i]!
    const memberTexts = proposals
      .filter(p => cluster.members.includes(p.initiative))
      .map(p => ({ id: p.initiative, text: p.content }))
    const label = labelCluster(memberTexts)

    insertCluster.run(
      `cluster-${i}`,
      label,
      JSON.stringify(cluster.members),
      now,
    )
    stats.clustersCreated++
  }

  return stats
}
