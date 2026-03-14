import type { Metadata } from "next";
import { Suspense } from "react";

import { DispatchContent } from "@/components/studio/dispatch-content";
import { getTaskBoard } from "@/lib/studio/tasks";
import { getAgentRoles, getBackendHealth } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Dispatch | Studio",
  robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

export default function DispatchPage() {
  const tasks = getTaskBoard();
  const roles = getAgentRoles();
  const health = getBackendHealth();

  return (
    <Suspense>
      <DispatchContent tasks={tasks} roles={roles} health={health} />
    </Suspense>
  );
}
