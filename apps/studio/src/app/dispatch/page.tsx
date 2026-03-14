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

export default function DispatchPage() {
  const tasks = getTaskBoard({ projectRoot: PROJECT_ROOT });
  const roles = getAgentRoles();
  const health = getBackendHealth(PROJECT_ROOT);

  return (
    <Suspense>
      <DispatchContent tasks={tasks} roles={roles} health={health} />
    </Suspense>
  );
}
