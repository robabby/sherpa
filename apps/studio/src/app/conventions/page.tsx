import { Text } from "@radix-ui/themes";
import Link from "next/link";
import type { Metadata } from "next";

import { SectionHeader } from "@/components/studio/section-header";

import { getConventions } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Conventions | Studio",
  robots: "noindex, nofollow",
};

export default function ConventionsPage() {
  const { rules, claudeMdFiles, uxGuides } = getConventions();

  return (
    <div className="space-y-10">
      <div>
        <SectionHeader label="Rules" title={`${rules.length} Convention Rules`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-gold)]/20">
                <th className="pb-2 pr-4 text-left font-medium text-foreground">
                  Rule
                </th>
                <th className="pb-2 pr-4 text-left font-medium text-foreground">
                  Scope
                </th>
                <th className="pb-2 text-left font-medium text-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr
                  key={rule.fileName}
                  className="border-b border-[var(--border-gold)]/10"
                >
                  <td className="py-2 pr-4">
                    <Link
                      href={`/conventions/${rule.fileName.replace(/\.md$/, "")}`}
                      className="text-foreground hover:text-[var(--color-gold)]"
                    >
                      {rule.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {rule.alwaysApply && (
                        <span className="inline-flex items-center rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 px-2 py-0.5 text-xs text-[var(--color-gold)]">
                          always
                        </span>
                      )}
                      {rule.globs.map((glob) => (
                        <span
                          key={glob}
                          className="inline-flex items-center rounded-full border border-muted-foreground/30 px-2 py-0.5 font-mono text-xs text-muted-foreground"
                        >
                          {glob}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {rule.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionHeader
          label="CLAUDE.md"
          title={`${claudeMdFiles.length} CLAUDE.md Files`}
        />
        <div className="space-y-2">
          {claudeMdFiles.map((file) => (
            <Link
              key={file.relativePath}
              href={`/conventions/claudemd-${file.relativePath.replace(/\//g, "-").replace(/\.md$/, "")}`}
              className="flex items-center justify-between rounded-md border border-[var(--border-gold)]/20 px-4 py-2 hover:border-[var(--color-gold)]/40"
            >
              <Text size="2" className="font-mono text-foreground">
                {file.relativePath}
              </Text>
              <Text size="1" className="text-muted-foreground">
                {file.lineCount} lines
              </Text>
            </Link>
          ))}
        </div>
      </div>

      {uxGuides.length > 0 && (
        <div>
          <SectionHeader
            label="UX System"
            title={`${uxGuides.length} UX Guidelines`}
          />
          <div className="flex flex-wrap gap-2">
            {uxGuides.map((guide) => (
              <Link
                key={guide.relativePath}
                href={`/docs/ux/${guide.fileName.replace(/\.md$/, "")}`}
                className="rounded-full border border-[var(--border-gold)]/30 px-4 py-1.5 text-sm text-foreground transition-colors hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/10"
              >
                {guide.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
