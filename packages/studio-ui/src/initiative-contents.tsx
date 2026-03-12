"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Text } from "@radix-ui/themes";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ContentFile } from "@/lib/studio";

interface InitiativeContentsProps {
  slug: string;
  basePath?: string;
  files: Record<string, ContentFile[]>;
}

export function InitiativeContents({ slug, basePath, files }: InitiativeContentsProps) {
  const subDirs = Object.keys(files).sort();

  if (subDirs.length === 0) {
    return (
      <Text size="2" className="text-muted-foreground">
        No contents found.
      </Text>
    );
  }

  return (
    <div className="space-y-1">
      {subDirs.map((subDir) => {
        const dirFiles = files[subDir] ?? [];
        return (
          <Collapsible key={subDir}>
            <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-copper)]/5">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
              <Text size="2" className="font-mono text-foreground">
                {subDir}/
              </Text>
              <Text size="1" className="text-muted-foreground">
                {dirFiles.length} {dirFiles.length === 1 ? "file" : "files"}
              </Text>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-[1.125rem] space-y-0.5 border-l border-[var(--color-copper)]/15 pl-3">
                {dirFiles.map((file) => (
                  <Link
                    key={file.relativePath}
                    href={`/app/studio/docs/${(basePath ?? `docs/initiatives/${slug}`).replace(/^docs\//, "")}/${subDir}/${file.fileName.replace(/\.md$/, "")}`}
                    className="block rounded-md px-2 py-1 text-sm text-foreground/80 transition-colors hover:bg-[var(--color-copper)]/5 hover:text-foreground"
                  >
                    {file.title}
                  </Link>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
