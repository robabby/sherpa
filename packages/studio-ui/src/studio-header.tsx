import { Heading } from "@radix-ui/themes";

export function StudioHeader() {
  return (
    <div className="mx-auto max-w-6xl mb-10 pb-6 lg:mb-14 relative">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.4em] text-muted-foreground/50">
        Studio
      </span>
      <Heading size="8" className="font-display tracking-[-0.02em] text-foreground">
        Mission Control
      </Heading>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent" />
    </div>
  );
}
