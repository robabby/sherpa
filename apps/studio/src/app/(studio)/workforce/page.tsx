import type { Metadata } from "next";

import { WorkforceContent } from "@/components/studio/workforce-content";
import { getAgentRoles } from "@/lib/studio";
import { getTaskBoard } from "@/lib/studio/tasks";

export const metadata: Metadata = {
  title: "Workforce | Studio",
  robots: "noindex, nofollow",
};

export default async function WorkforcePage() {
  const roles = getAgentRoles();
  const tasks = await getTaskBoard();

  return <WorkforceContent roles={roles} tasks={tasks} />;
}
