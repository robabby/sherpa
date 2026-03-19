import type { Metadata } from "next";
import path from "path";

import { WorkforceContent } from "@/components/studio/workforce-content";
import { getAgentRoles } from "@/lib/studio";
import { getTaskBoard } from "@/lib/studio/tasks";

const PROJECT_ROOT = path.resolve(process.cwd(), "../..");

export const metadata: Metadata = {
  title: "Workforce | Studio",
  robots: "noindex, nofollow",
};

export default function WorkforcePage() {
  const roles = getAgentRoles();
  const tasks = getTaskBoard({ projectRoot: PROJECT_ROOT });

  return <WorkforceContent roles={roles} tasks={tasks} />;
}
