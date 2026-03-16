import matter from "gray-matter"
import type { KnowledgeBackend } from "./types"

/**
 * Zero-dependency algorithmic backend: TF-IDF vectors + extractive summaries.
 *
 * Stress test A7 showed TF-IDF works on the Sherpa corpus (not collapsed),
 * but similarity scores are low (avg 0.05, max 0.32). Use rank-based
 * retrieval (top-K), not threshold-based (similarity > X).
 */
export class AlgorithmicBackend implements KnowledgeBackend {
  private corpusDf = new Map<string, number>()
  private corpusN = 0
  private corpusDocs = new Map<string, Map<string, number>>()
  private corpusVocab: string[] = []

  embed(text: string): number[] {
    const tf = this.termFrequency(this.tokenize(text))
    return this.normalizeVector(Array.from(tf.values()))
  }

  summarize(text: string, maxTokens: number): string {
    let status: string | null = null
    let body = text
    try {
      const parsed = matter(text)
      if (parsed.data?.status) status = String(parsed.data.status)
      body = parsed.content
    } catch { /* use raw text */ }

    const titleMatch = body.match(/^#\s+(.+)$/m)
    const title = titleMatch?.[1]?.trim() ?? null

    const sections: string[] = []
    const h2Regex = /^##\s+(.+)$/gm
    let match
    while ((match = h2Regex.exec(body)) !== null) {
      const sectionName = match[1]!.trim()
      const afterHeading = body.slice(match.index + match[0].length)
      const nextH2 = afterHeading.search(/^##\s/m)
      const sectionBody = (nextH2 > -1 ? afterHeading.slice(0, nextH2) : afterHeading).trim()
      const firstSentence = sectionBody.match(/^[^\n]+/)?.[0]?.trim()
      if (firstSentence && firstSentence.length > 10) {
        sections.push(`${sectionName}: ${firstSentence}`)
      }
    }

    const parts: string[] = []
    if (title) parts.push(title)
    if (status) parts.push(`[${status}]`)
    parts.push(...sections)

    let summary = parts.join(" — ")
    const maxChars = maxTokens * 4
    if (summary.length > maxChars) {
      summary = summary.slice(0, maxChars - 3) + "..."
    }
    return summary
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0
    let dot = 0, magA = 0, magB = 0
    for (let i = 0; i < a.length; i++) {
      dot += a[i]! * b[i]!
      magA += a[i]! * a[i]!
      magB += b[i]! * b[i]!
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB)
    return denom === 0 ? 0 : dot / denom
  }

  buildCorpusIndex(docs: Array<{ id: string; text: string }>): void {
    this.corpusDf.clear()
    this.corpusDocs.clear()
    this.corpusN = docs.length

    for (const doc of docs) {
      const tokens = this.tokenize(doc.text)
      const tf = this.termFrequency(tokens)
      this.corpusDocs.set(doc.id, tf)

      for (const term of tf.keys()) {
        this.corpusDf.set(term, (this.corpusDf.get(term) ?? 0) + 1)
      }
    }

    this.corpusVocab = Array.from(this.corpusDf.keys()).sort()
  }

  embedWithCorpus(id: string): number[] | null {
    const tf = this.corpusDocs.get(id)
    if (!tf) return null

    const vec = this.corpusVocab.map(term => {
      const termTf = tf.get(term) ?? 0
      const df = this.corpusDf.get(term) ?? 0
      const idf = Math.log((this.corpusN + 1) / (df + 1))
      return termTf * idf
    })

    return this.normalizeVector(vec)
  }

  /** Embed a query against the existing corpus vocabulary. */
  embedQuery(text: string): number[] {
    if (this.corpusVocab.length === 0) return this.embed(text)

    const tokens = this.tokenize(text)
    const tf = this.termFrequency(tokens)

    const vec = this.corpusVocab.map(term => {
      const termTf = tf.get(term) ?? 0
      const df = this.corpusDf.get(term) ?? 0
      const idf = Math.log((this.corpusN + 1) / (df + 1))
      return termTf * idf
    })

    return this.normalizeVector(vec)
  }

  // --- internals ---

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(t => t.length >= 3)
  }

  private termFrequency(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>()
    for (const token of tokens) {
      tf.set(token, (tf.get(token) ?? 0) + 1)
    }
    const len = tokens.length || 1
    for (const [term, count] of tf) {
      tf.set(term, count / len)
    }
    return tf
  }

  private normalizeVector(vec: number[]): number[] {
    const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
    return mag === 0 ? vec : vec.map(v => v / mag)
  }
}
