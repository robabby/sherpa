/**
 * Generic catalog registry for domain-specific data.
 * Consumers populate registries via config; the framework provides the pattern.
 */

export interface CatalogRegistry<T> {
  entries: Map<string, T>
  register(slug: string, entry: T): void
  get(slug: string): T | undefined
  getAll(): T[]
  has(slug: string): boolean
  size(): number
}

export function createCatalogRegistry<T>(): CatalogRegistry<T> {
  const entries = new Map<string, T>()
  return {
    entries,
    register(slug, entry) { entries.set(slug, entry) },
    get(slug) { return entries.get(slug) },
    getAll() { return Array.from(entries.values()) },
    has(slug) { return entries.has(slug) },
    size() { return entries.size },
  }
}
