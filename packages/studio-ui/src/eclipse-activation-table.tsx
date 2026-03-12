"use client";

import { useState } from "react";
import type { EclipseActivationEvent } from "@/lib/studio/types";
import { cn } from "./lib/utils";

type SortKey = "date" | "eclipseLongitude" | "daysToRecession";
type SortDir = "asc" | "desc";

interface EclipseActivationTableProps {
  events: EclipseActivationEvent[];
}

export function EclipseActivationTable({ events }: EclipseActivationTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = [...events].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "date":
        return a.date.localeCompare(b.date) * dir;
      case "eclipseLongitude":
        return (a.eclipseLongitude - b.eclipseLongitude) * dir;
      case "daysToRecession":
        return (
          ((a.daysToRecession ?? 99999) - (b.daysToRecession ?? 99999)) * dir
        );
      default:
        return 0;
    }
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/10 text-muted-foreground/60">
            <th
              className="cursor-pointer pb-2 text-left font-normal hover:text-muted-foreground"
              onClick={() => toggleSort("date")}
            >
              Activation Date{arrow("date")}
            </th>
            <th
              className="cursor-pointer pb-2 text-left font-normal hover:text-muted-foreground"
              onClick={() => toggleSort("eclipseLongitude")}
            >
              Eclipse Degree{arrow("eclipseLongitude")}
            </th>
            <th className="pb-2 text-left font-normal">Source Eclipse</th>
            <th className="pb-2 text-left font-normal">Nearest Recession</th>
            <th
              className="cursor-pointer pb-2 text-right font-normal hover:text-muted-foreground"
              onClick={() => toggleSort("daysToRecession")}
            >
              Days{arrow("daysToRecession")}
            </th>
            <th className="pb-2 text-right font-normal">Result</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((event, i) => (
            <tr
              key={`${event.date}-${event.eclipseDate}-${i}`}
              className={cn(
                "border-b border-border/5",
                event.isHit
                  ? "bg-[var(--chart-1)]/[0.04] text-foreground"
                  : "text-foreground",
              )}
            >
              <td className="py-2 font-mono">{event.date}</td>
              <td className="py-2">
                {event.eclipseLongitude.toFixed(1)}° (Mars {event.marsLongitude.toFixed(1)}°)
              </td>
              <td className="py-2 text-muted-foreground">
                <span className="capitalize">{event.eclipseFamily}</span>{" "}
                <span className="font-mono text-[10px] text-muted-foreground/60">
                  ({event.eclipseDate}, S{event.sarosNumber})
                </span>
              </td>
              <td className="py-2 text-muted-foreground">
                {event.recessionName ?? "—"}
                {event.nearestRecessionStart && (
                  <span className="ml-1 font-mono text-[10px] text-muted-foreground/60">
                    ({event.nearestRecessionStart})
                  </span>
                )}
              </td>
              <td className="py-2 text-right font-mono">
                {event.daysToRecession != null
                  ? `${event.daysToRecession > 0 ? "+" : ""}${event.daysToRecession}`
                  : "—"}
              </td>
              <td className="py-2 text-right">
                {event.isHit ? (
                  <span className="font-mono text-[var(--chart-1)]">HIT</span>
                ) : (
                  <span className="font-mono text-muted-foreground/40">
                    miss
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
