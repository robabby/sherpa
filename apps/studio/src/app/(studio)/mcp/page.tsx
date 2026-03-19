import type { Metadata } from "next";

import { McpContent } from "@/components/studio/mcp-content";
import { getMcpDashboard } from "@/lib/studio/mcp";

export const metadata: Metadata = {
  title: "MCP | Studio",
  robots: "noindex, nofollow",
};

export default async function McpPage() {
  const data = await getMcpDashboard();

  return <McpContent data={data} />;
}
