"use client";

import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { Text } from "@radix-ui/themes";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { InitiativeResearch } from "@/lib/studio";

function docHref(relativePath: string): string {
  return `/app/studio/docs/${relativePath.replace(/^docs\//, "").replace(/\.md$/, "")}`;
}

interface ResearchLibraryProps {
  research: InitiativeResearch;
  basePath: string;
}

export function ResearchLibrary({ research }: ResearchLibraryProps) {
  const { readme, iterations, looseFiles } = research;
  const autoExpand = iterations.length === 1;

  return (
    <div className="space-y-1">
      {/* Research README link */}
      {readme && (
        <Link
          href={docHref(readme.relativePath)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-[var(--color-copper)]/5 hover:text-foreground"
        >
          <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--color-gold)]/60" />
          Research Index
        </Link>
      )}

      {/* Loose research files (legacy/non-iteration) */}
      {looseFiles.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-copper)]/5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
            <Text size="2" className="text-foreground">
              Research Files
            </Text>
            <Text size="1" className="text-muted-foreground">
              {looseFiles.length} {looseFiles.length === 1 ? "file" : "files"}
            </Text>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-[1.125rem] space-y-0.5 border-l border-[var(--color-copper)]/15 pl-3">
              {looseFiles.map((file) => (
                <Link
                  key={file.relativePath}
                  href={docHref(file.relativePath)}
                  className="block rounded-md px-2 py-1 text-sm text-foreground/80 transition-colors hover:bg-[var(--color-copper)]/5 hover:text-foreground"
                >
                  {file.title}
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Iteration groups */}
      {iterations.map((iter) => (
        <Collapsible key={iter.number} defaultOpen={autoExpand}>
          <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-copper)]/5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
            <Text size="2" className="font-medium text-[var(--color-gold)]">
              Iteration {iter.number}
            </Text>
            {iter.synthesis && (
              <Text size="1" className="truncate text-muted-foreground">
                {iter.synthesis.title}
              </Text>
            )}
            {iter.vectors.length > 0 && (
              <Text size="1" className="ml-auto shrink-0 text-muted-foreground">
                {iter.vectors.length} vector{iter.vectors.length !== 1 && "s"}
              </Text>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-[1.125rem] space-y-0.5 border-l border-[var(--color-gold)]/20 pl-3">
              {/* Synthesis link */}
              {iter.synthesis && (
                <Link
                  href={docHref(iter.synthesis.relativePath)}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-[var(--color-gold)]/80 transition-colors hover:bg-[var(--color-copper)]/5 hover:text-[var(--color-gold)]"
                >
                  <FileText className="h-3 w-3 shrink-0" />
                  Synthesis
                </Link>
              )}

              {/* Vector links */}
              {iter.vectors.map((vec) => (
                <Link
                  key={vec.relativePath}
                  href={docHref(vec.relativePath)}
                  className="block rounded-md px-2 py-1 text-sm text-[var(--color-copper)]/80 transition-colors hover:bg-[var(--color-copper)]/5 hover:text-[var(--color-copper)]"
                >
                  {vec.title}
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
