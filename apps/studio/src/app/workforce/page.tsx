import type { Metadata } from "next";

import { WorkforceContent } from "@/components/studio/workforce-content";
import { getAgentRoles } from "@/lib/studio";
import { getTaskBoard } from "@/lib/studio/tasks";

export const metadata: Metadata = {
  title: "Workforce | Studio",
  robots: "noindex, nofollow",
};

export default function WorkforcePage() {
  const roles = getAgentRoles();
  const tasks = getTaskBoard();

  return <WorkforceContent roles={roles} tasks={tasks} />;
}
