// Mock @/lib/studio for Storybook
// Only re-export browser-safe modules (no Node APIs: content, file-tree,
// velocity, deliverables, mcp-dashboard, tasks, config, domain, research-report, process-nodes)

export * from "@sherpa/studio-core/types"
export * from "@sherpa/studio-core/schemas"
export * from "@sherpa/studio-core/lifecycle"
export * from "@sherpa/studio-core/process-nodes-shared"
export * from "@sherpa/studio-core/markdown"
export * from "@sherpa/studio-core/activity-links"
export * from "@sherpa/studio-core/prompts"
export * from "@sherpa/studio-core/catalog"
export * from "@sherpa/studio-core/tokens"
export * from "@sherpa/studio-core/patterns"

// WavePoint type stubs (PrimitiveLevel, LEVEL_NAMES, ExportSignatureKind, etc.)
export * from "../../../studio/src/lib/studio/types-extensions"
