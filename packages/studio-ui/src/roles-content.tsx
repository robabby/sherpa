import type { AgentRole } from "@sherpa/studio-core";

/**
 * Read-only catalog of behavioral role definitions, grouped by category.
 *
 * Roles are authored conventions (in `agents/` and `docs/agents/roles/`), not
 * dispatchable agents — so this view shows only convention fields (disposition,
 * patterns, structure, description) and deliberately omits the dispatch-era
 * affordances (model tier, task types, health, active-task counts, editing).
 */

function RoleCard({ role }: { role: AgentRole }) {
  return (
    <div className="rounded-lg border border-[var(--border-gold)]/20 bg-card/30 p-4">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground">{role.displayName}</h4>
        {role.structure && (
          <span className="shrink-0 rounded-full border border-muted-foreground/20 px-2 py-0.5 text-[10px] text-muted-foreground/70">
            {role.structure}
          </span>
        )}
      </div>
      {role.disposition && (
        <p className="mb-2 text-xs italic text-muted-foreground/70">{role.disposition}</p>
      )}
      {role.description && (
        <p className="text-xs leading-relaxed text-muted-foreground/80">{role.description}</p>
      )}
      {role.patterns.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {role.patterns.map((p) => (
            <span
              key={p}
              className="rounded-full border border-muted-foreground/20 px-2 py-0.5 font-mono text-[10px] text-muted-foreground/60"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export interface RolesContentProps {
  roles: AgentRole[];
}

export function RolesContent({ roles }: RolesContentProps) {
  if (roles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/60">
        No role definitions found. Roles live in{" "}
        <code className="font-mono">agents/</code> and{" "}
        <code className="font-mono">docs/agents/roles/</code>.
      </p>
    );
  }

  // Group by category, preserving first-seen order.
  const byCategory = new Map<string, AgentRole[]>();
  for (const role of roles) {
    const list = byCategory.get(role.category) ?? [];
    list.push(role);
    byCategory.set(role.category, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl text-foreground">Roles</h2>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Behavioral role definitions — read-only conventions authored in{" "}
          <code className="font-mono">agents/</code>. {roles.length} roles.
        </p>
      </div>

      {[...byCategory.entries()].map(([category, categoryRoles]) => (
        <div key={category}>
          <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)]/70">
            {category}{" "}
            <span className="text-muted-foreground/40">{categoryRoles.length}</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryRoles.map((role) => (
              <RoleCard key={role.slug} role={role} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
