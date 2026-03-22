import type { ReactNode } from "react"

/**
 * Renders inline markdown patterns (bold, italic, code, links) as React elements.
 * Unmatched patterns pass through as plain text. No dangerouslySetInnerHTML.
 */
export function renderInlineMarkdown(text: string): ReactNode[] {
  if (!text) return []

  const pattern = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g
  const result: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      result.push(<strong key={key++} className="font-medium text-foreground">{match[2]}</strong>)
    } else if (match[3]) {
      result.push(<em key={key++}>{match[4]}</em>)
    } else if (match[5]) {
      result.push(
        <code key={key++} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8125em]">
          {match[6]}
        </code>
      )
    } else if (match[7]) {
      result.push(
        <a
          key={key++}
          href={match[9]}
          className="text-[var(--color-gold)] no-underline border-b border-[var(--border-gold)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[8]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result
}
