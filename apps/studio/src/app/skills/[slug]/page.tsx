import { notFound } from "next/navigation";
import { Text } from "@radix-ui/themes";

import { DocRenderer } from "@/components/studio/doc-renderer";
import { SectionHeader } from "@/components/studio/section-header";

import { getDocument, getSkills } from "@/lib/studio";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: `${slug} | Skills | Studio`,
    robots: "noindex, nofollow",
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const skills = getSkills();
  const skill = skills.find((s) => s.slug === slug);
  if (!skill) notFound();

  const doc = getDocument(skill.relativePath);
  if (!doc) notFound();

  return (
    <div className="space-y-6">
      <SectionHeader
        label={skill.isProjectSkill ? "Project Skill" : "Third-Party Skill"}
        title={skill.name}
      />

      <div className="flex items-center gap-4">
        <Text size="1" className="font-mono text-muted-foreground">
          {skill.relativePath}
        </Text>
        <Text size="1" className="text-muted-foreground">
          {skill.lineCount} lines
        </Text>
        {skill.isProjectSkill && (
          <span className="inline-flex items-center rounded-full border border-[var(--color-eclipse)]/40 bg-[var(--color-eclipse)]/10 px-2 py-0.5 text-xs text-[var(--color-eclipse)]">
            project
          </span>
        )}
      </div>

      <DocRenderer content={doc.content} relativePath={doc.relativePath} />
    </div>
  );
}
