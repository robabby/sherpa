import type { Metadata } from "next";

import { RolesContent } from "@/components/studio/roles-content";
import { getAgentRoles } from "@/lib/studio";

export const metadata: Metadata = {
  title: "Roles | Studio",
  robots: "noindex, nofollow",
};

export default function RolesPage() {
  const roles = getAgentRoles();
  return <RolesContent roles={roles} />;
}
