/**
 * SchemaReference — React Server Component that auto-generates
 * configuration reference docs from Zod schemas at build time.
 *
 * Usage in MDX:
 *   import { SchemaReference } from "@/components/docs/schema-reference"
 *   import { userConfigSchema } from "@sherpa/studio-core/config"
 *   <SchemaReference schema={userConfigSchema} title="sherpa.json" />
 */

import { type z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"
import { renderSchemaProperties } from "@/lib/json-schema-renderer"

interface SchemaReferenceProps {
  schema: z.ZodType
  title?: string
  /** Override descriptions for fields that lose info through JSON Schema conversion */
  overrides?: Record<string, { description?: string; type?: string }>
}

export function SchemaReference({ schema, title, overrides }: SchemaReferenceProps) {
  const jsonSchema = zodToJsonSchema(schema, {
    $refStrategy: "none",
    errorMessages: false,
  })

  // zodToJsonSchema wraps in a top-level object
  const root = jsonSchema as Record<string, unknown>

  if (root.type !== "object" || !root.properties) {
    return <p className="text-muted-foreground">Schema has no documentable properties.</p>
  }

  return (
    <div className="not-prose">
      {title && <h3 className="mb-4 font-mono text-base font-semibold">{title}</h3>}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {renderSchemaProperties(root as any, overrides)}
    </div>
  )
}
