import { notFound } from "next/navigation";
import { Text } from "@radix-ui/themes";

import { SectionHeader } from "@/components/studio/section-header";

import { StatusBadge } from "@/components/studio/status-badge";
import { DocRenderer } from "@/components/studio/doc-renderer";
import { InitiativeActionBar } from "@/components/studio/initiative-action-bar";
import { InitiativeFileTree } from "@/components/studio/initiative-file-tree";
import { InitiativeLifecycleBar } from "@/components/studio/initiative-lifecycle-bar";
import {
  buildInitiativeFileTree,
  detectLifecycle,
  getBranchSeeds,
  getDocument,
  getInitiatives,
  getResearchIterations,
  getWorkstreams,
} from "@/lib/studio";
import { readProjectFile } from "@/lib/studio/content";

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => ({
    title: `${slug} | Process | Studio`,
    robots: "noindex, nofollow",
  }));
}

export default async function InitiativeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const initiatives = getInitiatives();
  const initiative = initiatives.find((i) => i.slug === slug);
  if (!initiative) notFound();

  const doc = getDocument(`docs/initiatives/${slug}/proposal.md`);

  // Compute lifecycle
  const basePath = `docs/initiatives/${slug}`;
  const research = getResearchIterations(slug, basePath);
  const iterationCount = research.iterations.length;
  const hasPlan = readProjectFile(`${basePath}/plan.md`) !== null ||
    initiative.subDirectories.some((d) => d.name === "phases");
  const workstreams = getWorkstreams();
  const linkedWs = workstreams.filter((ws) => ws.initiative?.startsWith(slug));
  let linkedWorkstreamStatus: string | null = null;
  for (const ws of linkedWs) {
    if (ws.status === "active") { linkedWorkstreamStatus = "active"; break; }
    if (ws.status === "completed" && linkedWorkstreamStatus !== "active") linkedWorkstreamStatus = "completed";
    if (ws.status === "paused" && !linkedWorkstreamStatus) linkedWorkstreamStatus = "paused";
  }
  const lifecycle = detectLifecycle({
    status: initiative.status,
    hasResearch: iterationCount > 0,
    iterationCount,
    hasPlan,
    linkedWorkstreamStatus,
  });

  // Build file tree
  const seeds = getBranchSeeds(slug);
  const fileTree = buildInitiativeFileTree(slug, basePath, seeds, research);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionHeader label="Initiative" title={initiative.title} />
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={initiative.status} />
          {initiative.type && <StatusBadge status={initiative.type} />}
          {initiative.risk && <StatusBadge status={initiative.risk} />}
        </div>
        <InitiativeActionBar
          title={initiative.title}
          slug={slug}
          status={initiative.status}
          iterationCount={iterationCount}
        />
      </div>

      <InitiativeLifecycleBar
        lifecycle={lifecycle}
        initiativeTitle={initiative.title}
        initiativeSlug={slug}
        initiativeSource={`docs/initiatives/${slug}/proposal.md`}
        initiativeStatus={initiative.status}
        researchIterationCount={iterationCount}
      />

      {initiative.targets.length > 0 && (
        <div>
          <Text size="1" className="mb-2 block uppercase tracking-widest text-[var(--color-gold)]">
            Targets
          </Text>
          <div className="space-y-1">
            {initiative.targets.map((target) => (
              <Text key={target} size="2" className="block font-mono text-muted-foreground">
                {target}
              </Text>
            ))}
          </div>
        </div>
      )}

      <div>
        <Text size="1" className="mb-2 block uppercase tracking-widest text-[var(--color-gold)]">
          Contents
        </Text>
        <InitiativeFileTree tree={fileTree} />
      </div>

      {doc && (
        <div>
          <Text size="1" className="mb-4 block uppercase tracking-widest text-[var(--color-gold)]">
            Proposal
          </Text>
          <DocRenderer content={doc.content} relativePath={doc.relativePath} />
        </div>
      )}
    </div>
  );
}
