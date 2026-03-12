"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "./lib/utils";
import { ChartRenderer } from "./chart-renderer";
import type {
  ChartSpec,
  ChartSlide,
  ContentSlide,
  DeckSpec,
  SlideSpec,
  SplitSlide,
  TitleSlide,
} from "@/lib/studio/types";

interface SlideDeckProps {
  spec: DeckSpec;
  className?: string;
}

export function SlideDeck({ spec, className }: SlideDeckProps) {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = spec.slides.length;

  const next = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, total - 1));
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, isFullscreen]);

  const progress = total > 1 ? ((current + 1) / total) * 100 : 100;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border border-[var(--border-gold)]/20",
        isFullscreen ? "bg-black" : "bg-card",
        className,
      )}
    >
      {/* Progress bar */}
      <div className="h-0.5 w-full bg-muted/20">
        <div
          className="h-full bg-[var(--color-gold)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide content */}
      <div
        className={cn(
          "relative flex flex-1 items-center justify-center overflow-hidden",
          isFullscreen ? "min-h-screen p-12" : "min-h-[400px] p-8",
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex h-full w-full max-w-4xl flex-col"
          >
            <SlideRenderer
              slide={spec.slides[current]!}
              isFullscreen={isFullscreen}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t border-[var(--border-gold)]/10 px-4 py-2">
        <button
          onClick={prev}
          disabled={current === 0}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="font-mono text-xs text-muted-foreground/60">
          {current + 1} / {total}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleFullscreen}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={next}
            disabled={current === total - 1}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SlideRenderer({
  slide,
  isFullscreen,
}: {
  slide: SlideSpec;
  isFullscreen: boolean;
}) {
  switch (slide.type) {
    case "title":
      return <TitleSlideView slide={slide} isFullscreen={isFullscreen} />;
    case "content":
      return <ContentSlideView slide={slide} isFullscreen={isFullscreen} />;
    case "chart":
      return <ChartSlideView slide={slide} isFullscreen={isFullscreen} />;
    case "split":
      return <SplitSlideView slide={slide} isFullscreen={isFullscreen} />;
    default:
      return null;
  }
}

function TitleSlideView({
  slide,
  isFullscreen,
}: {
  slide: TitleSlide;
  isFullscreen: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <h1
        className={cn(
          "font-serif font-bold text-[var(--color-gold)]",
          isFullscreen ? "text-5xl" : "text-3xl",
        )}
      >
        {slide.heading}
      </h1>
      {slide.subtitle && (
        <p
          className={cn(
            "mt-4 text-muted-foreground",
            isFullscreen ? "text-xl" : "text-base",
          )}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

function ContentSlideView({
  slide,
  isFullscreen,
}: {
  slide: ContentSlide;
  isFullscreen: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h2
        className={cn(
          "mb-6 font-serif font-semibold text-[var(--color-gold)]",
          isFullscreen ? "text-3xl" : "text-xl",
        )}
      >
        {slide.heading}
      </h2>
      <div
        className={cn(
          "flex-1 text-foreground/90",
          isFullscreen ? "text-lg leading-relaxed" : "text-sm leading-relaxed",
        )}
      >
        <InlineMarkdown text={slide.body} />
      </div>
      {slide.footnote && (
        <p className="mt-4 text-xs text-muted-foreground/50 italic">
          {slide.footnote}
        </p>
      )}
    </div>
  );
}

function ChartSlideView({
  slide,
  isFullscreen,
}: {
  slide: ChartSlide;
  isFullscreen: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h2
        className={cn(
          "mb-4 font-serif font-semibold text-[var(--color-gold)]",
          isFullscreen ? "text-3xl" : "text-xl",
        )}
      >
        {slide.heading}
      </h2>
      <div className="flex-1">
        <ChartRenderer
          spec={slide.chart}
          compact={!isFullscreen}
          className={isFullscreen ? "min-h-[400px] w-full" : "min-h-[200px] w-full"}
        />
      </div>
      {slide.caption && (
        <p className="mt-3 text-center text-xs text-muted-foreground/60">
          {slide.caption}
        </p>
      )}
    </div>
  );
}

function SplitSlideView({
  slide,
  isFullscreen,
}: {
  slide: SplitSlide;
  isFullscreen: boolean;
}) {
  const hasChart = "chart" in slide.right;

  return (
    <div className="flex flex-1 flex-col">
      <h2
        className={cn(
          "mb-6 font-serif font-semibold text-[var(--color-gold)]",
          isFullscreen ? "text-3xl" : "text-xl",
        )}
      >
        {slide.heading}
      </h2>
      <div className="grid flex-1 gap-8 md:grid-cols-2">
        <div
          className={cn(
            "text-foreground/90",
            isFullscreen ? "text-base leading-relaxed" : "text-sm leading-relaxed",
          )}
        >
          <InlineMarkdown text={slide.left.body} />
        </div>
        <div>
          {hasChart ? (
            <ChartRenderer
              spec={(slide.right as { chart: ChartSpec }).chart}
              compact
            />
          ) : (
            <div
              className={cn(
                "text-foreground/90",
                isFullscreen
                  ? "text-base leading-relaxed"
                  : "text-sm leading-relaxed",
              )}
            >
              <InlineMarkdown
                text={(slide.right as { body: string }).body}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Lightweight inline markdown renderer.
 * Supports: **bold**, *italic*, `code`, [links](url), - bullet lists, numbered lists
 */
function InlineMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushList() {
    if (listItems.length === 0) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    elements.push(
      <Tag
        key={elements.length}
        className={cn(
          "mb-3 space-y-1 pl-5",
          listType === "ol" ? "list-decimal" : "list-disc",
        )}
      >
        {listItems.map((item, i) => (
          <li key={i}>
            <InlineText text={item} />
          </li>
        ))}
      </Tag>,
    );
    listItems = [];
    listType = null;
  }

  for (const line of lines) {
    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    const orderedMatch = line.match(/^\d+\.\s+(.+)/);

    if (bulletMatch) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listItems.push(bulletMatch[1]!);
    } else if (orderedMatch) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listItems.push(orderedMatch[1]!);
    } else {
      flushList();
      if (line.trim() === "") {
        elements.push(<br key={elements.length} />);
      } else {
        elements.push(
          <p key={elements.length} className="mb-2">
            <InlineText text={line} />
          </p>,
        );
      }
    }
  }
  flushList();

  return <>{elements}</>;
}

function InlineText({ text }: { text: string }) {
  // Process inline formatting: **bold**, *italic*, `code`, [link](url)
  const parts = text.split(
    /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/,
  );

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded bg-muted/30 px-1 py-0.5 font-mono text-[0.9em]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          return (
            <a
              key={i}
              href={linkMatch[2]}
              className="text-[var(--color-gold)] underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkMatch[1]}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}
