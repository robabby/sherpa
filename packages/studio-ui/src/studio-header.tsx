import { Heading } from "@radix-ui/themes";

export function StudioHeader() {
  return (
    <div className="mx-auto max-w-6xl mb-10 border-b border-[var(--border-gold)]/20 pb-6 lg:mb-14">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-gold)]/80">
        Studio
      </span>
      <Heading size="8" className="font-display text-foreground">
        Mission Control
      </Heading>
    </div>
  );
}
