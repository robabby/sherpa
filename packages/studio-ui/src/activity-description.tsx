import type { ActivitySegment } from "@/lib/studio";

interface ActivityDescriptionProps {
  segments: ActivitySegment[];
}

export function ActivityDescription({ segments }: ActivityDescriptionProps) {
  return (
    <>
      {segments.map((segment, i) => {
        if (segment.type === "text") {
          return <span key={i}>{segment.value}</span>;
        }
        return (
          <a
            key={i}
            href={segment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[var(--color-gold)] hover:underline"
          >
            (#{segment.number})
          </a>
        );
      })}
    </>
  );
}
