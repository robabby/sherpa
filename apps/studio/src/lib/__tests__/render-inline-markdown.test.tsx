import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { renderInlineMarkdown } from "../render-inline-markdown"
import { createElement } from "react"

function render(text: string): string {
  const nodes = renderInlineMarkdown(text)
  return renderToStaticMarkup(createElement("span", null, ...nodes))
}

describe("renderInlineMarkdown", () => {
  it("returns plain text unchanged", () => {
    expect(render("hello world")).toBe("<span>hello world</span>")
  })

  it("renders bold", () => {
    expect(render("hello **bold** world")).toContain("<strong")
    expect(render("hello **bold** world")).toContain("bold</strong>")
  })

  it("renders italic", () => {
    expect(render("hello *italic* world")).toContain("<em>italic</em>")
  })

  it("renders inline code", () => {
    const result = render("use `useState` hook")
    expect(result).toContain("<code")
    expect(result).toContain("useState")
  })

  it("renders links", () => {
    const result = render("see [docs](https://example.com)")
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain("docs")
  })

  it("handles multiple patterns in one string", () => {
    const result = render("**bold** and *italic* and `code`")
    expect(result).toContain("<strong")
    expect(result).toContain("<em>italic</em>")
    expect(result).toContain("<code")
  })

  it("handles unclosed bold gracefully", () => {
    const result = render("hello **unclosed")
    expect(result).toBe("<span>hello **unclosed</span>")
  })

  it("returns empty array for empty string", () => {
    expect(renderInlineMarkdown("")).toEqual([])
  })
})
