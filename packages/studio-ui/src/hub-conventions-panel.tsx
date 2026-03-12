import Link from "next/link";

import type { ContentFile, Rule } from "@/lib/studio";
import { HubPanel } from "./hub-panel";

interface HubConventionsPanelProps {
  conventions: {
    rules: Rule[];
    claudeMdFiles: ContentFile[];
    uxGuides: ContentFile[];
  };
}

export function HubConventionsPanel({
  conventions,
}: HubConventionsPanelProps) {
  const { rules, claudeMdFiles, uxGuides } = conventions;

  // Always-on rules (alwaysApply: true)
  const alwaysOnRules = rules.filter((r) => r.alwaysApply).slice(0, 4);

  // Scoped rules (have globs, not always-apply)
  const scopedRules = rules.filter(
    (r) => !r.alwaysApply && r.globs.length > 0
  );

  // Sample glob patterns for scoped summary
  const sampleGlobs = scopedRules
    .flatMap((r) => r.globs)
    .slice(0, 3);

  // Stat strip
  const statParts = [
    `${rules.length} rules`,
    `${claudeMdFiles.length} CLAUDE.md`,
    `${uxGuides.length} UX guides`,
  ];

  return (
    <HubPanel
      variant="conventions"
      href="/conventions"
      title="System Rules"
      label="CONVENTIONS"
      linkText="View conventions"
    >
      <div className="space-y-5">
        {/* Inline stat strip (hero) */}
        <p className="font-mono text-sm text-muted-foreground">
          {statParts.map((part, i) => (
            <span key={part}>
              {i > 0 && (
                <span className="mx-1.5 text-muted-foreground/30">·</span>
              )}
              {part}
            </span>
          ))}
        </p>

        {/* Always-on rules */}
        {alwaysOnRules.length > 0 && (
          <div className="space-y-2">
            {alwaysOnRules.map((rule) => (
              <div
                key={rule.fileName}
                className="flex items-center gap-2"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/30" />
                <Link
                  href={ruleHref(rule)}
                  className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  {rule.name}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Scoped summary */}
        {scopedRules.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground/60">
              {scopedRules.length} scoped rules
            </span>
            {sampleGlobs.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {sampleGlobs.map((glob) => (
                  <span
                    key={glob}
                    className="inline-block rounded border border-muted-foreground/15 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50"
                  >
                    {glob}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </HubPanel>
  );
}

/**
 * Convert a rule to its conventions spoke href.
 * Rule files: ".claude/rules/foo-bar.md" → "/conventions/foo-bar"
 */
function ruleHref(rule: Rule): string {
  const slug = rule.fileName.replace(/\.md$/, "");
  return `/conventions/${slug}`;
}
