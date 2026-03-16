"use client"

// Re-export from studio-ui — canonical implementation lives in the shared package
// so client components in studio-ui (MissionWorkspace, DispatchContent) can use it.
export { usePageStatus, taskStatusToPageStatus } from "@sherpa/studio-ui/hooks/use-page-status"
export type { PageStatus } from "@sherpa/studio-ui/hooks/use-page-status"
