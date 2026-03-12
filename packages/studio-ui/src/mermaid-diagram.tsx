"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  definition: string;
}

let idCounter = 0;

export function MermaidDiagram({ definition }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mmd-${++idCounter}`);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          background: "transparent",
          primaryColor: "#141414",
          primaryBorderColor: "rgba(212, 168, 75, 0.3)",
          primaryTextColor: "#e5e5e5",
          secondaryColor: "#0f0f0f",
          secondaryBorderColor: "rgba(212, 168, 75, 0.2)",
          secondaryTextColor: "#a3a3a3",
          tertiaryColor: "#0a0a0a",
          tertiaryBorderColor: "rgba(212, 168, 75, 0.15)",
          tertiaryTextColor: "#a3a3a3",
          lineColor: "#d4a84b",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: "13px",
          nodeBorder: "rgba(212, 168, 75, 0.35)",
          mainBkg: "#181818",
          nodeTextColor: "#e5e5e5",
          clusterBkg: "rgba(212, 168, 75, 0.04)",
          clusterBorder: "rgba(212, 168, 75, 0.15)",
          titleColor: "#d4a84b",
          edgeLabelBackground: "#0a0a0a",
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 16,
          nodeSpacing: 40,
          rankSpacing: 50,
        },
      });

      if (cancelled || !containerRef.current) return;

      try {
        const { svg } = await mermaid.render(idRef.current, definition);
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    };

    render();
    return () => { cancelled = true; };
  }, [definition]);

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">
        Diagram render error: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="[&_svg]:mx-auto [&_svg]:max-w-full"
    />
  );
}
