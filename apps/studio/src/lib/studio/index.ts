import "server-only"

// Side-effect: trigger defineConfig → setProjectRoot
import "./init"

// Re-export everything from studio-core
export * from "@sherpa/studio-core"

// Re-export WavePoint-specific stubs (types + empty functions)
export * from "./types-extensions"
