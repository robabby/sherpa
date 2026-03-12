import { notFound } from "next/navigation";
import { Text } from "@radix-ui/themes";

import { SectionHeader } from "@/components/studio/section-header";
import { StudioBreadcrumb } from "@/components/studio/studio-breadcrumb";
import { PromptCopyButton } from "@/components/studio/prompt-copy-button";
import { RoleEditor } from "@/components/studio/role-editor";
import { getAgentRoles, generateRolePrompt } from "@/lib/studio";

const isDev = process.env.NODE_ENV === "development";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roles = getAgentRoles();
  const role = roles.find((r) => r.slug === slug);
  return {
    title: `${role?.displayName ?? slug} | Workforce | Studio`,
    robots: "noindex, nofollow",
  };
}

const TIER_BADGE: Record<string, { label: string; className: string }> = {
  high: {
    label: "high",
    className:
      "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-[var(--color-gold)]",
  },
  medium: {
    label: "medium",
    className:
      "border-[var(--color-copper)]/40 bg-[var(--color-copper)]/10 text-[var(--color-copper)]",
  },
  low: {
    label: "low",
    className:
      "border-[var(--color-bronze)]/40 bg-[var(--color-bronze)]/10 text-[var(--color-bronze)]",
  },
};

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Text
        size="1"
        weight="medium"
        className="block uppercase tracking-wider text-muted-foreground/60"
      >
        {title}
      </Text>
      {children}
    </div>
  );
}

function PillList({ items }: { items: string[] }) {
  if (!items.length) return <Text size="2" className="text-muted-foreground/40">None</Text>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full border border-muted-foreground/15 bg-muted-foreground/5 px-2.5 py-0.5 text-xs text-muted-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default async function WorkforceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roles = getAgentRoles();
  const role = roles.find((r) => r.slug === slug);
  if (!role) notFound();

  const tier = TIER_BADGE[role.modelTier];
  const rolePrompt = generateRolePrompt(role);

  return (
    <div className="space-y-8">
      <StudioBreadcrumb
        segments={[
          { label: "Workforce", href: "/workforce" },
          { label: role.displayName },
        ]}
      />

      <div>
        <SectionHeader label={role.category} title={role.displayName} />
        <div className="flex items-center gap-3">
          {tier && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${tier.className}`}
            >
              {tier.label} tier
            </span>
          )}
          {role.structure && (
            <span className="inline-flex items-center rounded-full border border-[var(--color-eclipse)]/30 bg-[var(--color-eclipse)]/10 px-2.5 py-0.5 text-xs text-[var(--color-eclipse)]">
              {role.structure}
            </span>
          )}
          <PromptCopyButton prompt={rolePrompt} variant="workforce" />
          {isDev && <RoleEditor role={role} />}
        </div>
      </div>

      {/* Description */}
      <div className="max-w-prose">
        {role.description.split("\n\n").map((para, i) => (
          <Text
            key={i}
            as="p"
            size="2"
            className="mb-3 leading-relaxed text-muted-foreground"
          >
            {para}
          </Text>
        ))}
      </div>

      {/* Metadata grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <DetailSection title="Patterns">
          <PillList items={role.patterns} />
        </DetailSection>

        <DetailSection title="Tool Permissions">
          <PillList items={role.toolPermissions} />
        </DetailSection>

        <DetailSection title="Context Packages">
          <div className="space-y-1">
            {role.contextPackages.length === 0 ? (
              <Text size="2" className="text-muted-foreground/40">None</Text>
            ) : (
              role.contextPackages.map((pkg) => (
                <Text
                  key={pkg}
                  size="1"
                  className="block font-mono text-muted-foreground"
                >
                  {pkg}
                </Text>
              ))
            )}
          </div>
        </DetailSection>

        <DetailSection title="Rules">
          <PillList items={role.rules} />
        </DetailSection>

        <DetailSection title="Skills">
          <PillList items={role.skills} />
        </DetailSection>

        <DetailSection title="Escalation">
          <div className="space-y-1">
            {role.escalation.length === 0 ? (
              <Text size="2" className="text-muted-foreground/40">None</Text>
            ) : (
              role.escalation.map((esc) => (
                <Text
                  key={esc}
                  size="2"
                  className="block text-muted-foreground"
                >
                  {esc}
                </Text>
              ))
            )}
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
