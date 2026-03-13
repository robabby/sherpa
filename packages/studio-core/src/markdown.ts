import matter from "gray-matter";
import type { ZodSchema } from "zod";

import type { ActivityEntry, SectionHeading } from "./types";

/**
 * Parse YAML frontmatter from markdown source.
 * Returns null data if frontmatter is empty or malformed.
 */
export function parseFrontmatter(source: string): {
  data: Record<string, unknown> | null;
  content: string;
} {
  try {
    const { data, content } = matter(source);
    if (!data || Object.keys(data).length === 0) {
      return { data: null, content };
    }
    return { data, content };
  } catch {
    return { data: null, content: source };
  }
}

/**
 * Parse frontmatter and validate against a Zod schema.
 * Returns null data if parsing or validation fails.
 */
export function parseValidatedFrontmatter<T>(
  source: string,
  schema: ZodSchema<T>
): { data: T | null; content: string } {
  const { data, content } = parseFrontmatter(source);
  if (!data) return { data: null, content };

  const result = schema.safeParse(data);
  if (!result.success) return { data: null, content };

  return { data: result.data, content };
}

/**
 * Extract the first H1 heading from markdown content.
 */
export function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1] ? match[1].trim() : null;
}

/**
 * Extract H2 and H3 headings with slugified IDs.
 */
export function extractSections(markdown: string): SectionHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const sections: SectionHeading[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const hashes = match[1];
    const rawText = match[2];
    if (!hashes || !rawText) continue;
    const level = hashes.length;
    const text = rawText.trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    sections.push({ level, text, id });
  }

  return sections;
}

/**
 * Extract the text after `## Summary` until the next heading.
 */
export function extractSummarySection(
  markdown: string
): string | null {
  const section = extractSection(markdown, "Summary");
  return section ? section.trim() : null;
}

/**
 * Count lines in content.
 */
export function countLines(content: string): number {
  if (!content) return 0;
  return content.split("\n").length;
}

/**
 * Parse activity log entries from markdown.
 * Supports four formats:
 * - Bold list: `- **YYYY-MM-DD** — description`
 * - Plain list: `- YYYY-MM-DD: description` or `- YYYY-MM-DD — description`
 * - H2 heading: `## YYYY-MM-DD — title`
 * - H3 heading: `### YYYY-MM-DD — title`
 */
export function parseActivityLog(markdown: string): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const seen = new Set<string>();

  function add(date: string, desc: string) {
    const key = `${date}::${desc}`;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({ date, description: desc.trim() });
  }

  let match;

  // Bold list format: - **YYYY-MM-DD** — description
  const boldListRegex =
    /^-\s+\*\*(\d{4}-\d{2}-\d{2})\*\*\s*[—–:-]\s*(.+)$/gm;
  while ((match = boldListRegex.exec(markdown)) !== null) {
    if (match[1] && match[2]) add(match[1], match[2]);
  }

  // Plain list format: - YYYY-MM-DD: description  or  - YYYY-MM-DD — description
  const plainListRegex =
    /^-\s+(\d{4}-\d{2}-\d{2})\s*[—–:-]\s*(.+)$/gm;
  while ((match = plainListRegex.exec(markdown)) !== null) {
    if (match[1] && match[2]) add(match[1], match[2]);
  }

  // H2/H3 heading format: ## YYYY-MM-DD — Title  or  ### YYYY-MM-DD — Title
  const headingRegex =
    /^#{2,3}\s+(\d{4}-\d{2}-\d{2})\s*[—–:-]\s*(.+)$/gm;
  while ((match = headingRegex.exec(markdown)) !== null) {
    if (match[1] && match[2]) add(match[1], match[2]);
  }

  // Sort by date descending (most recent first)
  entries.sort((a, b) => b.date.localeCompare(a.date));

  return entries;
}

/**
 * Parse a markdown pipe-separated table into row arrays.
 * Skips the header and separator rows.
 */
export function parseMarkdownTable(
  section: string
): string[][] {
  const lines = section.split("\n").filter((l) => l.trim());
  const tableLines = lines.filter((l) => l.includes("|"));

  if (tableLines.length < 2) return [];

  // Skip header row (index 0) and separator row (index 1)
  return tableLines.slice(2).map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0)
  );
}

/**
 * Extract numbered list items from an "Open Questions" section.
 * Matches any ## heading starting with "Open Questions" (various suffixes).
 */
export function extractOpenQuestions(markdown: string): string[] {
  const sectionRegex = /^## Open Questions[^\n]*$([\s\S]*?)(?=^##\s|$(?!\n))/m;
  const section = markdown.match(sectionRegex)?.[1];
  if (!section) return [];

  const items: string[] = [];
  const itemRegex = /^\d+\.\s+(.+(?:\n(?!\d+\.)(?!^## ).+)*)/gm;
  let match;
  while ((match = itemRegex.exec(section)) !== null) {
    if (match[1]) items.push(match[1].replace(/\n\s*/g, " ").trim());
  }
  return items;
}

/**
 * Extract numbered list items from a markdown section string.
 */
export function extractNumberedItems(section: string): string[] {
  const items: string[] = [];
  const regex = /^\d+\.\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(section)) !== null) {
    if (match[1]) items.push(match[1].trim());
  }
  return items;
}

/**
 * Extract content between `## Name` and the next `##` heading.
 */
export function extractSection(
  markdown: string,
  sectionName: string
): string | null {
  const escapedName = sectionName.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
  const regex = new RegExp(
    `^##\\s+${escapedName}\\s*$([\\s\\S]*?)(?=^##\\s|$(?!\\n))`,
    "m"
  );
  const match = markdown.match(regex);
  return match?.[1] ? match[1].trim() : null;
}
