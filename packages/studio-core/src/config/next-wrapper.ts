/**
 * Wraps next.config to inject Sherpa Studio transpile packages.
 * MVP: just adds transpilePackages. Full route injection is Phase 3+.
 */
export function withSherpa<T extends Record<string, unknown> & { transpilePackages?: string[] }>(
  nextConfig: T,
  _sherpaConfigPath?: string,
): T {
  const existing = nextConfig.transpilePackages ?? []
  return {
    ...nextConfig,
    transpilePackages: [
      ...existing,
      "@sherpa/studio-core",
      "@sherpa/studio-ui",
      "@sherpa/studio",
    ],
  }
}
