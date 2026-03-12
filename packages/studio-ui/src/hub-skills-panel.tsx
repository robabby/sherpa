import Link from "next/link";

import type { Skill } from "@/lib/studio";
import { HubPanel } from "./hub-panel";

interface HubSkillsPanelProps {
  skills: Skill[];
}

export function HubSkillsPanel({ skills }: HubSkillsPanelProps) {
  const projectSkills = skills.filter((s) => s.isProjectSkill);
  const thirdPartyCount = skills.length - projectSkills.length;

  return (
    <HubPanel
      variant="skills"
      href="/skills"
      title="Agent Skills"
      label="SKILLS"
      linkText="View all skills"
    >
      <div className="space-y-5">
        <p className="font-heading text-lg text-foreground">
          {skills.length} skills installed
        </p>

        {projectSkills.length > 0 && (
          <div className="space-y-2.5">
            {projectSkills.map((skill) => (
              <div key={skill.slug} className="min-w-0">
                <Link
                  href={`/skills/${skill.slug}`}
                  className="block font-heading text-sm font-medium text-foreground transition-colors hover:text-[var(--color-eclipse)]"
                >
                  {skill.name}
                </Link>
                <p className="line-clamp-1 text-xs text-muted-foreground/70">
                  {skill.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {thirdPartyCount > 0 && (
          <p className="font-mono text-xs text-muted-foreground/60">
            {thirdPartyCount} third-party skills
          </p>
        )}
      </div>
    </HubPanel>
  );
}
