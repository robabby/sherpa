"use client";

import type { Components } from "react-markdown";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DocRendererProps {
  content: string;
  /** Relative path of the current document (e.g. "docs/research/intelligence-native/README.md") */
  relativePath?: string;
}

// ---------------------------------------------------------------------------
// Path resolution — convert relative .md refs to Studio viewer URLs
// ---------------------------------------------------------------------------

/** Get the directory portion of a file path. */
function dirname(filePath: string): string {
  const i = filePath.lastIndexOf("/");
  return i === -1 ? "" : filePath.slice(0, i);
}

/** Resolve a relative path against a base directory (simple .. and . handling). */
function resolvePath(base: string, relative: string): string {
  const parts = base.split("/").filter(Boolean);
  for (const segment of relative.split("/")) {
    if (segment === "..") parts.pop();
    else if (segment !== "." && segment !== "") parts.push(segment);
  }
  return parts.join("/");
}

/** Convert a monorepo-relative file path to a Studio docs URL, or null if unmappable. */
function pathToStudioUrl(resolvedPath: string): string | null {
  // .claude/rules/foo.md → /app/studio/docs/rules/foo
  if (resolvedPath.startsWith(".claude/rules/")) {
    const name = resolvedPath.replace(".claude/rules/", "").replace(/\.md$/, "");
    return `/app/studio/docs/rules/${name}`;
  }
  // */CLAUDE.md → /app/studio/docs/claudemd/<dir>
  if (resolvedPath.endsWith("CLAUDE.md")) {
    const dir = resolvedPath.replace(/\/?CLAUDE\.md$/, "");
    return dir
      ? `/app/studio/docs/claudemd/${dir}`
      : `/app/studio/docs/claudemd`;
  }
  // docs/foo/bar.md → /app/studio/docs/foo/bar
  if (resolvedPath.startsWith("docs/")) {
    const slug = resolvedPath.replace(/^docs\//, "").replace(/\.md$/, "");
    return `/app/studio/docs/${slug}`;
  }
  return null;
}

/** Try to convert a relative .md href into a Studio URL. */
function resolveDocHref(
  href: string,
  currentDocPath: string | undefined,
): string | null {
  if (!currentDocPath) return null;
  if (!href.endsWith(".md")) return null;
  // Skip absolute URLs
  if (href.startsWith("http://") || href.startsWith("https://")) return null;

  // Already root-relative — resolve directly without prepending current dir
  if (href.startsWith("docs/") || href.startsWith(".claude/")) {
    return pathToStudioUrl(href);
  }

  const dir = dirname(currentDocPath);
  const resolved = resolvePath(dir, href);
  return pathToStudioUrl(resolved);
}

/** Extract plain text from children (handles strings and nested elements). */
function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

// ---------------------------------------------------------------------------
// Component factory — creates react-markdown components with path context
// ---------------------------------------------------------------------------

function buildComponents(relativePath?: string): Components {
  return {
    // Headings — Cormorant Garamond with gold accent
    h1: ({ children }) => (
      <h1 className="mb-4 mt-8 font-heading text-3xl font-semibold text-[var(--color-gold)] first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-8 border-b border-[var(--color-gold)]/15 pb-2 font-heading text-2xl font-semibold text-[var(--color-gold)]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-6 font-heading text-xl font-medium text-[var(--color-gold-bright)]">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-4 font-heading text-lg font-medium text-foreground">
        {children}
      </h4>
    ),

    // Body text
    p: ({ children }) => (
      <p className="mb-4 leading-relaxed text-foreground/90">{children}</p>
    ),

    // Strong / emphasis
    strong: ({ children }) => (
      <strong className="font-semibold text-[var(--color-gold-bright)]">
        {children}
      </strong>
    ),
    em: ({ children }) => <em className="text-foreground/80">{children}</em>,

    // Links — resolve relative .md hrefs to Studio URLs
    a: ({ href, children }) => {
      const studioUrl = href ? resolveDocHref(href, relativePath) : null;
      const resolvedHref = studioUrl ?? href;
      const isExternal =
        !studioUrl &&
        (href?.startsWith("http://") || href?.startsWith("https://"));

      if (studioUrl) {
        return (
          <Link
            href={studioUrl}
            className="text-[var(--color-gold)] underline decoration-[var(--color-gold-muted)]/50 underline-offset-2 transition-colors hover:text-[var(--color-gold-bright)] hover:decoration-[var(--color-gold)]"
          >
            {children}
          </Link>
        );
      }

      return (
        <a
          href={resolvedHref}
          className="text-[var(--color-gold)] underline decoration-[var(--color-gold-muted)]/50 underline-offset-2 transition-colors hover:text-[var(--color-gold-bright)] hover:decoration-[var(--color-gold)]"
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },

    // Lists
    ul: ({ children }) => (
      <ul className="mb-4 ml-1 space-y-1.5 text-foreground/90">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 ml-1 list-decimal space-y-1.5 pl-5 text-foreground/90">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="relative pl-5 leading-relaxed before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-[var(--color-gold)]/60 before:content-[''] [ol_&]:pl-0 [ol_&]:before:content-none">
        {children}
      </li>
    ),

    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-2 border-[var(--color-gold)]/40 pl-4 italic text-foreground/70">
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: () => (
      <hr className="my-8 border-t border-[var(--color-gold)]/15" />
    ),

    // Code — inline code with .md filenames become links
    code: ({ className, children }) => {
      const isBlock = className?.includes("language-");
      if (isBlock) {
        return (
          <code className={`${className ?? ""} block`}>{children}</code>
        );
      }

      // Detect .md file references in inline code and make them links
      const text = extractText(children);
      if (text.endsWith(".md") && relativePath) {
        const studioUrl = resolveDocHref(text, relativePath);
        if (studioUrl) {
          return (
            <Link
              href={studioUrl}
              className="rounded-sm bg-[var(--color-warm-charcoal)] px-1.5 py-0.5 font-mono text-[0.875em] text-[var(--color-gold)] underline decoration-[var(--color-gold-muted)]/40 underline-offset-2 transition-colors hover:bg-[var(--color-warm-charcoal)]/80 hover:text-[var(--color-gold-bright)] hover:decoration-[var(--color-gold)]"
            >
              {children}
            </Link>
          );
        }
      }

      return (
        <code className="rounded-sm bg-[var(--color-warm-charcoal)] px-1.5 py-0.5 font-mono text-[0.875em] text-[var(--color-gold)]">
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="my-4 overflow-x-auto rounded-lg border border-[var(--color-gold)]/10 bg-[var(--color-obsidian)] p-4 font-mono text-sm leading-relaxed text-foreground/80">
        {children}
      </pre>
    ),

    // Tables
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-[var(--color-gold)]/15">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-[var(--color-gold)]/30 bg-[var(--color-warm-charcoal)]/50">
        {children}
      </thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-[var(--color-gold)]/8 transition-colors hover:bg-[var(--color-warm-charcoal)]/30">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2.5 text-left font-heading font-semibold text-[var(--color-gold)]">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-foreground/80">{children}</td>
    ),

    // Images
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt ?? ""}
        className="my-4 max-w-full rounded-lg border border-[var(--color-gold)]/10"
      />
    ),
  };
}

export function DocRenderer({ content, relativePath }: DocRendererProps) {
  const components = buildComponents(relativePath);
  return (
    <div className="max-w-none">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}
