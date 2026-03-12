import { Heading, Text } from "@radix-ui/themes";

interface SectionHeaderProps {
  label: string;
  title: string;
}

export function SectionHeader({ label, title }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <Text
        size="1"
        className="mb-2 block uppercase tracking-widest text-[var(--color-gold)]"
      >
        {label}
      </Text>
      <Heading size="6" className="font-display text-foreground">
        {title}
      </Heading>
    </div>
  );
}
