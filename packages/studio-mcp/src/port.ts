const DEFAULT_PORT = 3100

export function resolvePort(config?: { port?: number }): number {
  const envPort = process.env.SHERPA_MCP_PORT
  if (envPort) {
    const parsed = parseInt(envPort, 10)
    if (!isNaN(parsed) && parsed > 0 && parsed < 65536) return parsed
  }
  return config?.port ?? DEFAULT_PORT
}
