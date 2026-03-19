export { createStudioMcpServer } from "./server"
export type { StudioMcpOptions } from "./server"
export { startHttpServer } from "./http-server"
export type { HttpServerOptions } from "./http-server"
export { SessionManager } from "./session-manager"
export type { Session } from "./session-manager"
export { resolvePort } from "./port"
export {
  applyAuthoritySchema,
  acquireAuthority,
  releaseAuthority,
  renewAuthority,
  checkAuthority,
  listActiveLeases,
  reapExpiredLeases,
  releaseAllForAgent,
  startReaper,
  stopReaper,
} from "./authority"
export type {
  AcquireInput,
  AcquireResult,
  ReleaseInput,
  ReleaseResult,
  RenewInput,
  RenewResult,
  LeaseInfo,
} from "./authority"
export { buildDashboard } from "./dashboard"
export type { Dashboard, DashboardOptions } from "./dashboard"
export { createMcpAuth } from "./auth"
export type { McpAuthOptions } from "./auth"
