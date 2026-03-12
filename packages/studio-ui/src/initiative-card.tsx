import { Card, Text } from "@radix-ui/themes";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import type { Initiative } from "@/lib/studio";

interface InitiativeCardProps {
  initiative: Initiative;
}

export function InitiativeCard({ initiative }: InitiativeCardProps) {
  return (
    <Link href={`/process/${initiative.slug}`}>
      <Card className="border border-[var(--border-gold)]/30 bg-background p-5 transition-all hover:border-[var(--color-gold)]/50 hover:shadow-[0_0_20px_rgba(212,168,75,0.1)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Text size="3" weight="medium" className="text-foreground">
            {initiative.title}
          </Text>
          <StatusBadge status={initiative.status} />
        </div>

        {initiative.summary && (
          <Text size="2" className="mb-3 line-clamp-2 text-muted-foreground">
            {initiative.summary}
          </Text>
        )}

        <div className="flex flex-wrap gap-2">
          {initiative.type && <StatusBadge status={initiative.type} />}
          {initiative.risk && <StatusBadge status={initiative.risk} />}
        </div>

        {initiative.subDirectories.length > 0 && (
          <div className="mt-3 flex gap-3 border-t border-[var(--border-gold)]/10 pt-3">
            {initiative.subDirectories.map((sub) => (
              <Text key={sub.name} size="1" className="font-mono text-muted-foreground">
                {sub.name}/ ({sub.fileCount})
              </Text>
            ))}
          </div>
        )}

        <Text size="1" className="mt-3 block font-mono text-muted-foreground">
          {initiative.created}
        </Text>
      </Card>
    </Link>
  );
}
