/**
 * Shared utility for rendering JSON Schema as Fumadocs TypeTable components.
 * Used by <SchemaReference> and <McpTool> components.
 */

import { TypeTable } from "fumadocs-ui/components/type-table"

type JSONSchemaProperty = {
  type?: string | string[]
  description?: string
  default?: unknown
  enum?: unknown[]
  items?: JSONSchemaProperty
  properties?: Record<string, JSONSchemaProperty>
  required?: string[]
  oneOf?: JSONSchemaProperty[]
  anyOf?: JSONSchemaProperty[]
  const?: unknown
}

type JSONSchemaObject = {
  type?: string
  properties?: Record<string, JSONSchemaProperty>
  required?: string[]
  description?: string
}

function formatType(prop: JSONSchemaProperty): string {
  if (prop.const !== undefined) return JSON.stringify(prop.const)
  if (prop.enum) return prop.enum.map((v) => JSON.stringify(v)).join(" | ")
  if (prop.oneOf) return prop.oneOf.map(formatType).join(" | ")
  if (prop.anyOf) return prop.anyOf.map(formatType).join(" | ")
  if (prop.type === "array" && prop.items) return `${formatType(prop.items)}[]`
  if (Array.isArray(prop.type)) return prop.type.filter((t) => t !== "null").join(" | ")
  return prop.type ?? "unknown"
}

function formatDefault(value: unknown): string | undefined {
  if (value === undefined) return undefined
  if (value === null) return "null"
  if (typeof value === "string") return `"${value}"`
  return JSON.stringify(value)
}

function isObjectWithProperties(prop: JSONSchemaProperty): boolean {
  return prop.type === "object" && !!prop.properties && Object.keys(prop.properties).length > 0
}

export function renderSchemaProperties(
  schema: JSONSchemaObject,
  overrides?: Record<string, { description?: string; type?: string }>,
): React.ReactNode {
  if (!schema.properties) return null

  const required = schema.required ?? []
  const flatProps: Record<string, JSONSchemaProperty> = {}
  const nestedProps: Array<{ key: string; schema: JSONSchemaObject }> = []

  for (const [key, prop] of Object.entries(schema.properties)) {
    if (isObjectWithProperties(prop)) {
      nestedProps.push({ key, schema: prop as JSONSchemaObject })
    } else {
      flatProps[key] = prop
    }
  }

  const tableData: Record<string, {
    type: string
    description: React.ReactNode
    default?: string
    required?: boolean
  }> = {}

  for (const [key, prop] of Object.entries(flatProps)) {
    const override = overrides?.[key]
    tableData[key] = {
      type: override?.type ?? formatType(prop),
      description: override?.description ?? prop.description ?? "",
      default: formatDefault(prop.default),
      required: required.includes(key),
    }
  }

  return (
    <>
      {Object.keys(tableData).length > 0 && <TypeTable type={tableData} />}
      {nestedProps.map(({ key, schema: nested }) => (
        <div key={key} className="mt-6">
          <h4 className="mb-2 font-mono text-sm font-semibold">{key}</h4>
          {nested.description && (
            <p className="mb-3 text-sm text-muted-foreground">{nested.description}</p>
          )}
          {renderSchemaProperties(nested, overrides)}
        </div>
      ))}
    </>
  )
}
