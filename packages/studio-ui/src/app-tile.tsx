import { Card, Text } from "@radix-ui/themes";

interface AppTileProps {
  name: string;
  type: string;
  currentPhase: string;
  health: string;
  nextMilestone: string;
}

export function AppTile({
  name,
  type,
  currentPhase,
  health,
  nextMilestone,
}: AppTileProps) {
  const isActive =
    health === "On track" &&
    !currentPhase.toLowerCase().includes("paused");

  return (
    <Card className="border border-[var(--border-gold)]/30 bg-background p-4 transition-all hover:border-[var(--color-gold)]/50 hover:shadow-[0_0_20px_rgba(212,168,75,0.1)]">
      <div className="mb-2 flex items-center gap-2">
        {isActive && (
          <span className="text-[var(--color-gold)]">&#x25C8;</span>
        )}
        <Text size="3" weight="medium" className="text-foreground">
          {name}
        </Text>
      </div>
      <Text size="1" className="mb-1 block font-mono text-muted-foreground">
        {type}
      </Text>
      <Text size="2" className="mb-2 block text-muted-foreground">
        {currentPhase}
      </Text>
      <Text size="1" className="block text-muted-foreground">
        {nextMilestone}
      </Text>
    </Card>
  );
}
