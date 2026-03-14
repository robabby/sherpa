import Link from "next/link";
import type { Metadata } from "next";

import { SectionHeader } from "@/components/studio/section-header";

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
  { label: string; risk: string; description: string; sessions: string }
> = {
  "fast-track": {
    label: "Fast Track",
    risk: "additive",
    description:
      "The cost of being wrong is a wasted session, not a wasted quarter.",
    sessions: "1-2 sessions",
  },
  standard: {
    label: "Standard",
    risk: "evolutionary",
    description:
      "Multiple approaches exist or the solution isn't obvious.",
    sessions: "3-4 sessions",
  },
  "high-stakes": {
    label: "High Stakes",
    risk: "structural",
    description:
      "Touches shared artifacts, changes architecture, has dependencies.",
    sessions: "5+ sessions",
  },
};

const ACCENT_CLASSES: Record<PlaybookId, string> = {
  "fast-track": "border-l-2 border-l-[var(--color-gold)]/30",
  standard: "border-l-2 border-l-[var(--color-gold)]/50",
  "high-stakes": "border-l-2 border-l-[var(--color-gold)]/80",
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

/** Checkmark SVG for completed nodes */
function CheckIcon() {
  return (
    <svg
      className="size-3 text-[var(--color-gold)]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

/**
 * A single node on the vertical timeline rail.
 *
 * Visual states:
 * - completed (index 0): gold circle with checkmark, gold connector line
 * - suggested (index 1): pulsing ring with inner dot, description shown
 * - future (index 2+): muted border circle with tiny inner dot
 */
function RailNode({
  playId,
  state,
  skillSlugs,
  isLast,
}: {
  playId: PlayId;
  state: "completed" | "suggested" | "future";
  skillSlugs: Set<string>;
  isLast: boolean;
}) {
  const play = PLAY_INFO[playId];
  const slug = skillSlug(play.skill);
  const hasSkillPage = skillSlugs.has(slug);

  const nodeClasses = isLast ? "rail-node" : "rail-node pb-5";
  const stateClass = state === "completed" ? " completed" : "";

  return (
    <div className={`${nodeClasses}${stateClass}`}>
      <div className="flex items-start gap-3">
        {/* Node circle */}
        {state === "completed" && (
          <div className="mt-1 flex size-[22px] shrink-0 items-center justify-center rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/20">
            <CheckIcon />
          </div>
        )}
        {state === "suggested" && (
          <div className="pulse-ring mt-1 flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-gold)]/60 bg-[var(--color-gold)]/10">
            <div className="size-2 rounded-full bg-[var(--color-gold)]" />
          </div>
        )}
        {state === "future" && (
          <div className="mt-1 flex size-[22px] shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)]">
            <div className="size-1.5 rounded-full bg-muted-foreground/10" />
          </div>
        )}

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            {state === "completed" && (
              <>
                <span className="text-sm font-medium text-[var(--color-gold)]/70">
                  {play.label}
                </span>
                {hasSkillPage ? (
                  <Link
                    href={`/skills/${slug}`}
                    className="font-mono text-[10px] text-muted-foreground/30 transition-colors hover:text-[var(--color-gold)]"
                  >
                    {play.skill}
                  </Link>
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground/30">
                    {play.skill}
                  </span>
                )}
              </>
            )}
            {state === "suggested" && (
              <>
                <span className="text-sm font-semibold text-[var(--color-gold)]">
                  {play.label}
                </span>
                {hasSkillPage ? (
                  <Link
                    href={`/skills/${slug}`}
                    className="font-mono text-[10px] text-[var(--color-gold)]/50 transition-colors hover:text-[var(--color-gold)]"
                  >
                    {play.skill}
                  </Link>
                ) : (
                  <span className="font-mono text-[10px] text-[var(--color-gold)]/50">
                    {play.skill}
                  </span>
                )}
              </>
            )}
            {state === "future" && (
              <>
                <span className="text-sm font-medium text-muted-foreground/40">
                  {play.label}
                </span>
                {hasSkillPage ? (
                  <Link
                    href={`/skills/${slug}`}
                    className="font-mono text-[10px] text-muted-foreground/20 transition-colors hover:text-[var(--color-gold)]"
                  >
                    {play.skill}
                  </Link>
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground/20">
                    {play.skill}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Description only for suggested play */}
          {state === "suggested" && (
            <p className="mt-0.5 text-[11px] text-muted-foreground/50">
              {play.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const MAX_CHIPS = 3;

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
  const overflow = initiatives.length - MAX_CHIPS;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)]">
      <div className={`p-5 ${ACCENT_CLASSES[playbookId]}`}>
        {/* Header */}
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {meta.label}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/10 px-2 py-0.5 font-mono text-[10px] text-[var(--color-gold)]">
                {meta.risk}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/40">
                {sequence.length} plays
              </span>
            </div>
          </div>
          <span className="mt-1 font-mono text-[10px] text-muted-foreground/30">
            {meta.sessions}
          </span>
        </div>

        <p className="mb-5 mt-2 text-xs text-muted-foreground/50">
          {meta.description}
        </p>

        {/* Play rail — vertical timeline */}
        <div>
          {sequence.map((playId, i) => {
            // For static demo: first play = completed, second = suggested, rest = future
            let state: "completed" | "suggested" | "future";
            if (i === 0) state = "completed";
            else if (i === 1) state = "suggested";
            else state = "future";

            return (
              <RailNode
                key={playId}
                playId={playId}
                state={state}
                skillSlugs={skillSlugs}
                isLast={i === sequence.length - 1}
              />
            );
          })}
        </div>
      </div>

      {/* Initiatives section */}
      <div className="border-t border-[var(--glass-border)] bg-card/30 px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/50">
            Initiatives
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/30">
            {initiatives.length} active
          </span>
        </div>
        {initiatives.length === 0 ? (
          <span className="text-xs text-muted-foreground/40">
            No active initiatives
          </span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {initiatives.slice(0, MAX_CHIPS).map((init) => (
              <Link
                key={init.slug}
                href={`/process/${init.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--glass-border)] px-2.5 py-1 text-xs text-foreground/70 transition-colors hover:border-[var(--color-gold)]/30 hover:text-[var(--color-gold)]"
              >
                {init.title}
              </Link>
            ))}
            {overflow > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs text-muted-foreground/40">
                +{overflow} more
              </span>
            )}
          </div>
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
    <div className="flex items-center gap-4 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-4">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/40">
        Available anytime
      </span>
      <div className="flex items-center gap-4">
        {CROSS_CUTTING.map((playId, i) => {
          const play = PLAY_INFO[playId];
          const slug = skillSlug(play.skill);
          const hasSkillPage = skillSlugs.has(slug);

          return (
            <div key={playId} className="flex items-center gap-4">
              {i > 0 && (
                <span className="text-muted-foreground/10">|</span>
              )}
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-[var(--color-gold)]/30" />
                {hasSkillPage ? (
                  <Link
                    href={`/skills/${slug}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground/50 transition-colors hover:text-[var(--color-gold)]"
                  >
                    <span className="font-medium">{play.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground/30">
                      {play.skill}
                    </span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-2 text-xs text-muted-foreground/50">
                    <span className="font-medium">{play.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground/30">
                      {play.skill}
                    </span>
                  </span>
                )}
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
      <div>
        <SectionHeader label="Process" title="Playbooks" />
        <p className="mb-10 max-w-xl text-sm text-muted-foreground">
          Three tracks for moving from research to implementation. The
          initiative&apos;s risk level determines the default playbook.
        </p>

        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
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
