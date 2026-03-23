/**
 * McpTool — Renders a single MCP tool definition with parameter table.
 *
 * Used in auto-generated reference pages for MCP tool documentation.
 * Receives pre-extracted tool data (name, description, inputSchema).
 */

import { renderSchemaProperties } from "@/lib/json-schema-renderer"

interface McpToolProps {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  annotations?: {
    readOnlyHint?: boolean
    destructiveHint?: boolean
  }
}

export function McpTool({ name, description, inputSchema, annotations }: McpToolProps) {
  const hasParams =
    inputSchema.properties && Object.keys(inputSchema.properties as object).length > 0

  return (
    <div className="not-prose mb-8 rounded-lg border border-border p-4">
      <div className="mb-2 flex items-center gap-2">
        <h3 id={name} className="font-mono text-base font-semibold">
          {name}
        </h3>
        {annotations?.readOnlyHint && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            read-only
          </span>
        )}
        {annotations?.destructiveHint && (
          <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
            destructive
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      {hasParams ? (
        <>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Parameters
          </h4>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {renderSchemaProperties(inputSchema as any)}
        </>
      ) : (
        <p className="text-sm italic text-muted-foreground">No parameters.</p>
      )}
    </div>
  )
}
