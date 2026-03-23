import type { Metadata } from "next";
import { Suspense } from "react";
import path from "path";

import { DispatchContent } from "@/components/studio/dispatch-content";
import { getTaskBoard } from "@/lib/studio/tasks";
import { getAgentRoles } from "@/lib/studio";
import { getBackendHealth } from "@sherpa/studio-core";

export const metadata: Metadata = {
  title: "Dispatch | Studio",
  robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");

const VALID_MODES = ["interactive", "supervised", "overnight"] as const;
type DispatchMode = (typeof VALID_MODES)[number];

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const tasks = await getTaskBoard();
  const roles = getAgentRoles();
  const health = getBackendHealth(PROJECT_ROOT);

  const mode: DispatchMode = (VALID_MODES as readonly string[]).includes(
    params.mode ?? "",
  )
    ? (params.mode as DispatchMode)
    : "supervised";

  return (
    <Suspense>
      <DispatchContent tasks={tasks} roles={roles} health={health} initialMode={mode} />
    </Suspense>
  );
}
