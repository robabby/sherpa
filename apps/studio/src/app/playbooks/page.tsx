import { Text } from "@radix-ui/themes";
import Link from "next/link";
import type { Metadata } from "next";

import { SectionHeader } from "@/components/studio/section-header";
import { StudioBreadcrumb } from "@/components/studio/studio-breadcrumb";
import { getInitiatives, getSkills } from "@/lib/studio";
import {
  detectPlaybook,
  PLAYBOOK_IDS,
  type PlaybookId,
  type PlayId,
} from "@/lib/studio/playbooks";

export const metadata: Metadata = {
  title: "Playbooks | Studio",
  robots: "noindex, nofollow",
};

// ---------------------------------------------------------------------------
// Static playbook metadata
// ---------------------------------------------------------------------------

const PLAYBOOK_META: Record<
  PlaybookId,
  { label: string; risk: string; description: string }
> = {
  "fast-track": {
    label: "Fast Track",
    risk: "additive",
    description:
      "Additive risk. 1-2 session initiatives where the cost of being wrong is a wasted session.",
  },
  standard: {
    label: "Standard",
    risk: "evolutionary",
    description:
      "Evolutionary risk. 3-4 session initiatives where multiple approaches exist or the solution isn't obvious.",
  },
  "high-stakes": {
    label: "High Stakes",
    risk: "structural",
    description:
      "Structural risk. 5+ session initiatives that touch shared artifacts, change architecture, or have dependencies.",
  },
};

const PLAYBOOK_SEQUENCES: Record<PlaybookId, PlayId[]> = {
  "fast-track": ["rr", "shape", "plan-tasks"],
  standard: ["rr", "stake", "shape", "design", "plan-tasks"],
  "high-stakes": [
    "rr",
    "stake",
    "premortem",
    "stress-test",
    "spike",
    "shape",
    "design",
    "plan-tasks",
  ],
};

const CROSS_CUTTING: PlayId[] = ["memo", "radar", "retro"];

const PLAY_INFO: Record<
  PlayId,
  { label: string; skill: string; description: string }
> = {
  rr: {
    label: "Research",
    skill: "/rr",
    description:
      "Discover and deepen — parallel research agents, synthesize findings, produce proposals",
  },
  stake: {
    label: "Stake",
    skill: "/stake",
    description:
      "Commit to a direction — frame options as theses, evaluate, define kill criteria",
  },
  premortem: {
    label: "Pre-mortem",
    skill: "/premortem",
    description:
      "Imagine failure — dispatch adversarial agents, rank failure modes, add mitigations",
  },
  "stress-test": {
    label: "Stress Test",
    skill: "/stress-test",
    description:
      "Falsify assumptions — extract claims, design tests, execute what's executable",
  },
  spike: {
    label: "Spike",
    skill: "/spike",
    description:
      "1-session feasibility proof — build the minimum thing that answers the riskiest question",
  },
  shape: {
    label: "Shape",
    skill: "/shape",
    description:
      "Set appetite and boundaries — rabbit holes, no-gos, kill criteria",
  },
  design: {
    label: "Design",
    skill: "/design",
    description:
      "Architecture and UI prototype — data models, component tree, living HTML prototype",
  },
  "plan-tasks": {
    label: "Plan Tasks",
    skill: "/plan-tasks",
    description:
      "Break into dispatchable tasks — session-by-session execution plan",
  },
  memo: {
    label: "Memo",
    skill: "/memo",
    description:
      "Strategic synthesis across initiatives — frame question, gather evidence, recommend",
  },
  radar: {
    label: "Radar",
    skill: "/radar",
    description:
      "Classify a landscape — Adopt, Trial, Assess, Hold rings with evidence",
  },
  retro: {
    label: "Retro",
    skill: "/retro",
    description:
      "Cross-initiative retrospective — test a thesis or survey the portfolio for patterns",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map skill command (e.g. "/rr") to its slug for linking */
function skillSlug(command: string): string {
  return command.replace(/^\//, "");
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function PlayRow({
  playId,
  skillSlugs,
  isLast,
}: {
  playId: PlayId;
  skillSlugs: Set<string>;
  isLast: boolean;
}) {
  const play = PLAY_INFO[playId];
  const slug = skillSlug(play.skill);
  const hasSkillPage = skillSlugs.has(slug);

  return (
    <div className="relative flex gap-3 pb-5 last:pb-0">
      {/* Vertical connector line */}
      <div className="flex flex-col items-center">
        <div className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--color-gold)]" />
        {!isLast && (
          <div className="w-px grow bg-[var(--glass-border)]" />
        )}
      </div>

      {/* Play content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Text
            size="2"
            weight="medium"
            className="text-[var(--color-gold)]"
          >
            {play.label}
          </Text>
          {hasSkillPage ? (
            <Link
              href={`/skills/${slug}`}
              className="font-mono text-xs text-[var(--color-gold)]/60 transition-colors hover:text-[var(--color-gold)]"
            >
              {play.skill}
            </Link>
          ) : (
            <span className="font-mono text-xs text-muted-foreground/40">
              {play.skill}
            </span>
          )}
        </div>
        <Text size="1" className="mt-0.5 block text-muted-foreground">
          {play.description}
        </Text>
      </div>
    </div>
  );
}

function PlaybookCard({
  playbookId,
  skillSlugs,
  initiatives,
}: {
  playbookId: PlaybookId;
  skillSlugs: Set<string>;
  initiatives: { slug: string; title: string }[];
}) {
  const meta = PLAYBOOK_META[playbookId];
  const sequence = PLAYBOOK_SEQUENCES[playbookId];

  return (
    <div className="flex flex-col rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
      {/* Card header */}
      <div className="mb-5">
        <Text
          size="1"
          weight="bold"
          className="block uppercase tracking-widest text-foreground"
        >
          {meta.label}
        </Text>
        <Text size="1" className="mt-1 block text-muted-foreground">
          {meta.risk} &middot; {sequence.length} plays
        </Text>
      </div>

      {/* Play sequence */}
      <div className="mb-5 flex-1">
        {sequence.map((playId, i) => (
          <PlayRow
            key={playId}
            playId={playId}
            skillSlugs={skillSlugs}
            isLast={i === sequence.length - 1}
          />
        ))}
      </div>

      {/* Initiative list */}
      <div className="border-t border-[var(--glass-border)] pt-4">
        <Text
          size="1"
          weight="medium"
          className="mb-2 block uppercase tracking-wider text-muted-foreground"
        >
          Initiatives ({initiatives.length})
        </Text>
        {initiatives.length === 0 ? (
          <Text size="1" className="block text-muted-foreground/50">
            No active initiatives
          </Text>
        ) : (
          <ul className="flex flex-col gap-1">
            {initiatives.map((init) => (
              <li key={init.slug}>
                <Link
                  href={`/process/${init.slug}`}
                  className="text-sm text-foreground/80 transition-colors hover:text-[var(--color-gold)]"
                >
                  {init.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CrossCuttingSection({
  skillSlugs,
}: {
  skillSlugs: Set<string>;
}) {
  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
      <Text
        size="1"
        weight="bold"
        className="mb-4 block uppercase tracking-widest text-muted-foreground"
      >
        Available Anytime
      </Text>
      <div className="grid gap-4 sm:grid-cols-3">
        {CROSS_CUTTING.map((playId) => {
          const play = PLAY_INFO[playId];
          const slug = skillSlug(play.skill);
          const hasSkillPage = skillSlugs.has(slug);

          return (
            <div key={playId} className="flex gap-3">
              <div className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--color-gold)]/40" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <Text
                    size="2"
                    weight="medium"
                    className="text-[var(--color-gold)]"
                  >
                    {play.label}
                  </Text>
                  {hasSkillPage ? (
                    <Link
                      href={`/skills/${slug}`}
                      className="font-mono text-xs text-[var(--color-gold)]/60 transition-colors hover:text-[var(--color-gold)]"
                    >
                      {play.skill}
                    </Link>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground/40">
                      {play.skill}
                    </span>
                  )}
                </div>
                <Text
                  size="1"
                  className="mt-0.5 block text-muted-foreground"
                >
                  {play.description}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PlaybooksPage() {
  const allInitiatives = getInitiatives();
  const skills = getSkills();
  const skillSlugs = new Set(skills.map((s) => s.slug));

  // Group initiatives by playbook — exclude archived and declined
  const activeInitiatives = allInitiatives.filter(
    (i) => i.status !== "archived" && i.status !== "declined",
  );

  const grouped: Record<PlaybookId, { slug: string; title: string }[]> = {
    "fast-track": [],
    standard: [],
    "high-stakes": [],
  };

  for (const init of activeInitiatives) {
    const pbId = detectPlaybook(init.risk);
    grouped[pbId].push({ slug: init.slug, title: init.title });
  }

  return (
    <div className="flex flex-col gap-10">
      <StudioBreadcrumb segments={[{ label: "Playbooks" }]} />

      <div>
        <SectionHeader label="Process" title="3 Playbooks" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLAYBOOK_IDS.map((pbId) => (
            <PlaybookCard
              key={pbId}
              playbookId={pbId}
              skillSlugs={skillSlugs}
              initiatives={grouped[pbId]}
            />
          ))}
        </div>
      </div>

      <CrossCuttingSection skillSlugs={skillSlugs} />
    </div>
  );
}
