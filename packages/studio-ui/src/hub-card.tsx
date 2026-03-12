import { Card, Text } from "@radix-ui/themes";
import Link from "next/link";

interface HubCardProps {
  href: string;
  title: string;
  stats: { label: string; value: string | number }[];
  linkText: string;
}

export function HubCard({ href, title, stats, linkText }: HubCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="border border-[var(--border-gold)]/30 bg-background p-6 transition-all hover:border-[var(--color-gold)]/50 hover:shadow-[0_0_20px_rgba(212,168,75,0.1)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-[var(--color-gold)]">◈</span>
          <Text size="4" weight="medium" className="text-foreground">
            {title}
          </Text>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <Text
                size="6"
                weight="bold"
                className="block font-mono text-foreground"
              >
                {stat.value}
              </Text>
              <Text size="1" className="text-muted-foreground">
                {stat.label}
              </Text>
            </div>
          ))}
        </div>
        <Text
          size="2"
          className="text-[var(--color-gold)] opacity-70 transition-opacity group-hover:opacity-100"
        >
          {linkText} →
        </Text>
      </Card>
    </Link>
  );
}
