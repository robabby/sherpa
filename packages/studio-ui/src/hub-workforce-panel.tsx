import Link from "next/link";

import type { AgentRole, Workstream } from "@/lib/studio";
import { HubPanel } from "./hub-panel";

const CATEGORY_ORDER = ["strategy", "engineering", "design", "domain", "operations"] as const;

interface HubWorkforcePanelProps {
  roles: AgentRole[];
  workstreams?: Workstream[];
}

export function HubWorkforcePanel({ roles, workstreams = [] }: HubWorkforcePanelProps) {
  const byCat = new Map<string, AgentRole[]>();
  for (const role of roles) {
    const existing = byCat.get(role.category);
    if (existing) existing.push(role);
    else byCat.set(role.category, [role]);
  }

  return (
    <HubPanel
      variant="workforce"
      href="/workforce"
      title="Agent Workforce"
      label="WORKFORCE"
      linkText="View all roles"
    >
      <div className="space-y-5">
        <p className="font-heading text-lg text-foreground">
          {roles.length} roles defined
        </p>
        {(() => {
          const wsWithRoles = workstreams.filter((w) => w.roles.length > 0);
          const activeCount = workstreams.reduce(
            (sum, w) => sum + w.roles.filter((r) => r.status === "active").length,
            0,
          );
          if (activeCount === 0) return null;
          return (
            <p className="font-mono text-xs text-muted-foreground/60">
              {activeCount} active across {wsWithRoles.length} workstream{wsWithRoles.length !== 1 ? "s" : ""}
            </p>
          );
        })()}

        <div className="space-y-3">
          {CATEGORY_ORDER.map((cat) => {
            const catRoles = byCat.get(cat);
            if (!catRoles) return null;
            return (
              <div key={cat}>
                <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60">
                  {cat}
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {catRoles.map((role) => (
                    <Link
                      key={role.slug}
                      href={`/workforce/${role.slug}`}
                      className="font-heading text-sm text-foreground transition-colors hover:text-[var(--color-eclipse)]"
                    >
                      {role.displayName}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </HubPanel>
  );
}
