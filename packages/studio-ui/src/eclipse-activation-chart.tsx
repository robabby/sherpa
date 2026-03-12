"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as d3Scale from "d3-scale";
import * as d3Axis from "d3-axis";
import * as d3Brush from "d3-brush";
import * as d3Selection from "d3-selection";
import * as d3Time from "d3-time";
import "d3-transition"; // side-effect import for selection.transition()
import { cn } from "./lib/utils";
import type { EclipseActivationEvent } from "@/lib/studio/types";

// ---------------------------------------------------------------------------
// NBER recessions
// ---------------------------------------------------------------------------

const RECESSION_BANDS = [
  ["1857-06-01", "1858-12-01"],
  ["1873-10-01", "1879-03-01"],
  ["1893-01-01", "1894-06-01"],
  ["1907-05-01", "1908-06-01"],
  ["1920-01-01", "1921-07-01"],
  ["1929-08-01", "1933-03-01"],
  ["1937-05-01", "1938-06-01"],
  ["1945-02-01", "1945-10-01"],
  ["1948-11-01", "1949-10-01"],
  ["1953-07-01", "1954-05-01"],
  ["1957-08-01", "1958-04-01"],
  ["1960-04-01", "1961-02-01"],
  ["1969-12-01", "1970-11-01"],
  ["1973-11-01", "1975-03-01"],
  ["1980-01-01", "1980-07-01"],
  ["1981-07-01", "1982-11-01"],
  ["1990-07-01", "1991-03-01"],
  ["2001-03-01", "2001-11-01"],
  ["2007-12-01", "2009-06-01"],
  ["2020-02-01", "2020-04-01"],
] as const;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FULL_DOMAIN: [Date, Date] = [new Date("1854-01-01"), new Date("2030-12-31")];
const MARGIN = { top: 12, right: 20, bottom: 24, left: 20 };
const CONTEXT_HEIGHT = 50;
const FOCUS_HEIGHT = 200;
const GAP = 36;

// Deterministic jitter from event key
function jitter(key: string, range: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return ((((hash % 1000) + 1000) % 1000) / 1000) * range;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EclipseActivationChartProps {
  events: EclipseActivationEvent[];
}

export function EclipseActivationChart({ events }: EclipseActivationChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 0 });
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    event: EclipseActivationEvent;
  } | null>(null);

  // Parse dates once
  const parsed = useRef(
    events.map((e) => ({
      ...e,
      dateObj: new Date(e.date),
    })),
  );

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 900;
      setDimensions({
        width: Math.max(w, 400),
        height: MARGIN.top + FOCUS_HEIGHT + GAP + CONTEXT_HEIGHT + MARGIN.bottom,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // D3 rendering
  const renderChart = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || dimensions.width === 0) return;

    const { width } = dimensions;
    const innerW = width - MARGIN.left - MARGIN.right;

    const root = d3Selection.select(svg);
    root.selectAll("*").remove();

    // ── Scales ────────────────────────────────────────────────────
    const xContext = d3Scale
      .scaleTime()
      .domain(FULL_DOMAIN)
      .range([0, innerW]);

    const xFocus = d3Scale
      .scaleTime()
      .domain(FULL_DOMAIN)
      .range([0, innerW]);

    // ── Groups ────────────────────────────────────────────────────
    const defs = root.append("defs");

    // Clip path for focus area
    defs
      .append("clipPath")
      .attr("id", "clip-focus")
      .append("rect")
      .attr("width", innerW)
      .attr("height", FOCUS_HEIGHT);

    const gFocus = root
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const gContext = root
      .append("g")
      .attr(
        "transform",
        `translate(${MARGIN.left},${MARGIN.top + FOCUS_HEIGHT + GAP})`,
      );

    // ── Focus area ────────────────────────────────────────────────

    // Background
    gFocus
      .append("rect")
      .attr("width", innerW)
      .attr("height", FOCUS_HEIGHT)
      .attr("fill", "var(--card)")
      .attr("opacity", 0.15)
      .attr("rx", 6);

    // Recession bands (focus)
    const focusRecessions = gFocus
      .append("g")
      .attr("clip-path", "url(#clip-focus)");

    focusRecessions
      .selectAll("rect.recession")
      .data(RECESSION_BANDS)
      .enter()
      .append("rect")
      .attr("class", "recession")
      .attr("y", 0)
      .attr("height", FOCUS_HEIGHT)
      .attr("fill", "rgb(251, 113, 133)")
      .attr("opacity", 0.1)
      .attr("rx", 2);

    // Event marks (focus) — clipped
    const focusMarks = gFocus
      .append("g")
      .attr("clip-path", "url(#clip-focus)");

    // Miss marks
    focusMarks
      .selectAll("circle.miss")
      .data(parsed.current.filter((e) => !e.isHit))
      .enter()
      .append("circle")
      .attr("class", "miss")
      .attr("cy", (d) => 10 + jitter(d.date + d.eclipseDate, FOCUS_HEIGHT - 20))
      .attr("r", 2.5)
      .attr("fill", "var(--chart-4)")
      .attr("opacity", 0.15)
      .style("cursor", "crosshair");

    // Hit marks
    focusMarks
      .selectAll("circle.hit")
      .data(parsed.current.filter((e) => e.isHit))
      .enter()
      .append("circle")
      .attr("class", "hit")
      .attr("cy", (d) => 10 + jitter(d.date + d.eclipseDate, FOCUS_HEIGHT - 20))
      .attr("r", 5)
      .attr("fill", "var(--chart-1)")
      .attr("opacity", 0.85)
      .style("cursor", "crosshair");

    // Focus axis
    const focusAxisG = gFocus
      .append("g")
      .attr("transform", `translate(0,${FOCUS_HEIGHT})`);

    // ── Context area (minimap) ────────────────────────────────────

    // Background
    gContext
      .append("rect")
      .attr("width", innerW)
      .attr("height", CONTEXT_HEIGHT)
      .attr("fill", "var(--card)")
      .attr("opacity", 0.08)
      .attr("rx", 4);

    // Recession bands (context)
    RECESSION_BANDS.forEach(([start, end]) => {
      gContext
        .append("rect")
        .attr("x", xContext(new Date(start)))
        .attr("width", Math.max(xContext(new Date(end)) - xContext(new Date(start)), 1))
        .attr("y", 0)
        .attr("height", CONTEXT_HEIGHT)
        .attr("fill", "rgb(251, 113, 133)")
        .attr("opacity", 0.08);
    });

    // Event ticks (context) — thin lines, very compact
    parsed.current.forEach((e) => {
      gContext
        .append("line")
        .attr("x1", xContext(e.dateObj))
        .attr("x2", xContext(e.dateObj))
        .attr("y1", e.isHit ? 4 : 12)
        .attr("y2", e.isHit ? CONTEXT_HEIGHT - 4 : CONTEXT_HEIGHT - 12)
        .attr("stroke", e.isHit ? "var(--chart-1)" : "var(--chart-4)")
        .attr("stroke-width", e.isHit ? 1.5 : 0.5)
        .attr("opacity", e.isHit ? 0.8 : 0.1);
    });

    // Context axis
    gContext
      .append("g")
      .attr("transform", `translate(0,${CONTEXT_HEIGHT})`)
      .call(
        d3Axis
          .axisBottom(xContext)
          .ticks(d3Time.timeYear.every(20))
          .tickFormat((d) => String((d as Date).getFullYear()))
          .tickSize(0)
          .tickPadding(6),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll("text")
          .attr("fill", "var(--muted-foreground)")
          .attr("font-size", 9)
          .attr("opacity", 0.5),
      );

    // ── Update function ───────────────────────────────────────────

    function updateFocus(domain: [Date, Date]) {
      xFocus.domain(domain);

      // Update recession bands
      focusRecessions
        .selectAll<SVGRectElement, readonly [string, string]>("rect.recession")
        .attr("x", (d) => xFocus(new Date(d[0])))
        .attr("width", (d) =>
          Math.max(xFocus(new Date(d[1])) - xFocus(new Date(d[0])), 0),
        );

      // Update marks
      focusMarks
        .selectAll<SVGCircleElement, (typeof parsed.current)[number]>("circle.miss")
        .attr("cx", (d) => xFocus(d.dateObj));

      focusMarks
        .selectAll<SVGCircleElement, (typeof parsed.current)[number]>("circle.hit")
        .attr("cx", (d) => xFocus(d.dateObj));

      // Update axis
      const yearSpan =
        (domain[1].getTime() - domain[0].getTime()) / (365.25 * 86_400_000);
      const tickInterval =
        yearSpan > 100 ? 20 : yearSpan > 40 ? 10 : yearSpan > 15 ? 5 : yearSpan > 5 ? 2 : 1;

      focusAxisG
        .call(
          d3Axis
            .axisBottom(xFocus)
            .ticks(d3Time.timeYear.every(tickInterval))
            .tickFormat((d) => String((d as Date).getFullYear()))
            .tickSize(0)
            .tickPadding(6),
        )
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll("text")
            .attr("fill", "var(--muted-foreground)")
            .attr("font-size", 10)
            .attr("opacity", 0.5),
        );
    }

    // Initial render
    updateFocus(FULL_DOMAIN);

    // ── Brush ─────────────────────────────────────────────────────

    const brush = d3Brush
      .brushX()
      .extent([
        [0, 0],
        [innerW, CONTEXT_HEIGHT],
      ])
      .on("brush end", (event: d3Brush.D3BrushEvent<unknown>) => {
        if (!event.selection) {
          updateFocus(FULL_DOMAIN);
          return;
        }
        const [x0, x1] = event.selection as [number, number];
        updateFocus([xContext.invert(x0), xContext.invert(x1)]);
      });

    const brushG = gContext.append("g").attr("class", "brush").call(brush);

    // Style brush handles
    brushG
      .selectAll(".selection")
      .attr("fill", "var(--chart-1)")
      .attr("fill-opacity", 0.12)
      .attr("stroke", "var(--chart-1)")
      .attr("stroke-opacity", 0.4)
      .attr("rx", 4);

    brushG
      .selectAll(".handle")
      .attr("fill", "var(--chart-1)")
      .attr("fill-opacity", 0.3)
      .attr("rx", 2);

    // Set initial brush to a 40-year window for a nice default zoom
    const initialStart = xContext(new Date("1900-01-01"));
    const initialEnd = xContext(new Date("1940-01-01"));
    brushG.call(brush.move as never, [initialStart, initialEnd]);

    // ── Tooltips via overlay ──────────────────────────────────────

    // Invisible overlay for hit detection
    focusMarks
      .selectAll<SVGCircleElement, (typeof parsed.current)[number]>("circle")
      .on("mouseenter", function (event: MouseEvent, d) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        d3Selection.select(this).attr("r", d.isHit ? 8 : 5).attr("opacity", 1);
        setTooltip({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
          event: d,
        });
      })
      .on("mouseleave", function (_event: MouseEvent, d) {
        d3Selection
          .select(this)
          .attr("r", d.isHit ? 5 : 2.5)
          .attr("opacity", d.isHit ? 0.85 : 0.15);
        setTooltip(null);
      });
  }, [dimensions]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full"
      />

      {/* "Brush to zoom" hint */}
      <div className="mt-1 text-center text-[9px] text-muted-foreground/30">
        Drag on the minimap below to zoom into a time period
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className={cn(
            "pointer-events-none absolute z-10 rounded-lg border border-border/20 bg-card/95 px-3 py-2 text-[11px] shadow-xl backdrop-blur-sm",
          )}
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 80,
          }}
        >
          <p className="font-mono font-medium text-foreground">
            {tooltip.event.date}
          </p>
          <div className="mt-1 space-y-0.5 text-muted-foreground">
            <p>
              Mars {tooltip.event.marsLongitude.toFixed(1)}° →{" "}
              Eclipse {tooltip.event.eclipseLongitude.toFixed(1)}°
            </p>
            <p>
              <span className="capitalize">{tooltip.event.eclipseFamily}</span>{" "}
              eclipse · {tooltip.event.eclipseDate} · Saros {tooltip.event.sarosNumber}
            </p>
          </div>
          {tooltip.event.isHit ? (
            <p className="mt-1 font-mono text-[var(--chart-1)]">
              HIT — {tooltip.event.recessionName} ({tooltip.event.daysToRecession! > 0 ? "+" : ""}
              {tooltip.event.daysToRecession}d)
            </p>
          ) : (
            <p className="mt-1 text-muted-foreground/40">
              Nearest: {tooltip.event.recessionName ?? "—"} ({tooltip.event.daysToRecession != null ? `${tooltip.event.daysToRecession > 0 ? "+" : ""}${tooltip.event.daysToRecession}d` : "—"})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
