import { getBranchSeeds, getResearchTree } from "@/lib/studio";
import { ResearchTreeClient } from "./research-tree-client";

interface ResearchTreeProps {
  initiativeSlug: string | null;
  basePath?: string;
}

export function ResearchTree({ initiativeSlug, basePath }: ResearchTreeProps) {
  if (!initiativeSlug) return null;

  const tree = getResearchTree(initiativeSlug, 0, 3, basePath);
  if (!tree) return null;

  const seeds = getBranchSeeds(initiativeSlug, basePath);

  return <ResearchTreeClient tree={tree} seeds={seeds} />;
}
