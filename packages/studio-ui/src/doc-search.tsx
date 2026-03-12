"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { Text } from "@radix-ui/themes";

interface DocSearchItem {
  relativePath: string;
  fileName: string;
  title: string;
}

interface DocSearchProps {
  items: DocSearchItem[];
}

export function DocSearch({ items }: DocSearchProps) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["fileName", "title", "relativePath"],
        threshold: 0.4,
      }),
    [items]
  );

  const results = query.length > 1 ? fuse.search(query).slice(0, 10) : [];

  function pathToSlug(relativePath: string): string {
    // docs/architecture/platform-strategy.md -> architecture/platform-strategy
    // .claude/rules/intelligence-native.md -> rules/intelligence-native
    return relativePath
      .replace(/^docs\//, "")
      .replace(/^\.claude\/rules\//, "rules/")
      .replace(/\.md$/, "");
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search docs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-[var(--border-gold)]/30 bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--color-gold)]/50 focus:outline-none"
      />
      {results.length > 0 && (
        <div className="absolute top-full z-10 mt-1 w-full rounded-md border border-[var(--border-gold)]/30 bg-background shadow-lg">
          {results.map((result) => (
            <Link
              key={result.item.relativePath}
              href={`/docs/${pathToSlug(result.item.relativePath)}`}
              className="block px-4 py-2 text-sm hover:bg-[var(--color-gold)]/10"
              onClick={() => setQuery("")}
            >
              <Text size="2" className="text-foreground">
                {result.item.title}
              </Text>
              <Text size="1" className="block font-mono text-muted-foreground">
                {result.item.relativePath}
              </Text>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
