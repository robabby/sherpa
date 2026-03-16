/** Pluggable backend for embeddings and summaries. */
export interface KnowledgeBackend {
  /** Embed a text string into a numeric vector. */
  embed(text: string): number[]

  /** Generate an extractive summary of markdown content. */
  summarize(text: string, maxTokens: number): string

  /** Compute cosine similarity between two vectors. */
  cosineSimilarity(a: number[], b: number[]): number

  /**
   * Build a TF-IDF corpus index from a set of documents.
   * After calling this, embedWithCorpus() returns IDF-weighted vectors.
   */
  buildCorpusIndex(docs: Array<{ id: string; text: string }>): void

  /** Embed using the corpus IDF weights. Returns null if id not in corpus. */
  embedWithCorpus(id: string): number[] | null
}
