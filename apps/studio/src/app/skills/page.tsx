import { Text } from "@radix-ui/themes";
import Link from "next/link";
import type { Metadata } from "next";
import { Zap } from "lucide-react";

import { SectionHeader } from "@/components/studio/section-header";
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateCommand,
} from "@sherpa/studio-ui";

import { getSkills } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Skills | Studio",
  robots: "noindex, nofollow",
};

export default function SkillsPage() {
  const skills = getSkills();
  const projectSkills = skills.filter((s) => s.isProjectSkill);
  const thirdPartySkills = skills.filter((s) => !s.isProjectSkill);

  if (skills.length === 0) {
    return (
      <EmptyState>
        <EmptyStateIcon><Zap className="size-5" /></EmptyStateIcon>
        <EmptyStateTitle>Create a skill</EmptyStateTitle>
        <EmptyStateDescription>
          Skills extend Claude with specialized workflows and domain knowledge.
        </EmptyStateDescription>
        <EmptyStateCommand>.claude/skills/my-skill/SKILL.md</EmptyStateCommand>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-10">
      {projectSkills.length > 0 && (
        <div>
          <SectionHeader
            label="Project"
            title={`${projectSkills.length} Project Skills`}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectSkills.map((skill) => (
              <Link
                key={skill.slug}
                href={`/skills/${skill.slug}`}
                className="rounded-lg border border-[var(--color-eclipse)]/30 bg-background p-4 transition-all hover:border-[var(--color-eclipse)]/50 hover:shadow-[0_0_20px_rgba(167,139,205,0.1)]"
              >
                <div className="flex items-center gap-2">
                  <Text size="2" weight="medium" className="text-foreground">
                    {skill.name}
                  </Text>
                  <span className="inline-flex items-center rounded-full border border-[var(--color-eclipse)]/40 bg-[var(--color-eclipse)]/10 px-2 py-0.5 text-xs text-[var(--color-eclipse)]">
                    project
                  </span>
                </div>
                <Text size="2" className="mt-1.5 line-clamp-2 block text-muted-foreground">
                  {skill.description}
                </Text>
                <Text size="1" className="mt-2 block font-mono text-muted-foreground/60">
                  {skill.lineCount} lines
                </Text>
              </Link>
            ))}
          </div>
        </div>
      )}

      {thirdPartySkills.length > 0 && (
        <div>
          <SectionHeader
            label="Third-party"
            title={`${thirdPartySkills.length} Third-Party Skills`}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {thirdPartySkills.map((skill) => (
              <Link
                key={skill.slug}
                href={`/skills/${skill.slug}`}
                className="rounded-lg border border-muted-foreground/15 bg-background p-4 transition-all hover:border-[var(--color-eclipse)]/30"
              >
                <Text size="2" weight="medium" className="text-foreground">
                  {skill.name}
                </Text>
                <Text size="2" className="mt-1.5 line-clamp-2 block text-muted-foreground">
                  {skill.description}
                </Text>
                <Text size="1" className="mt-2 block font-mono text-muted-foreground/60">
                  {skill.lineCount} lines
                </Text>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
