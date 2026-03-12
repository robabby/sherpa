"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "./lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TransitEventRow {
  slug: string;
  planet1: string;
  planet2: string;
  aspectType: string;
  sign: string;
  orbStart: string;
  orbEnd: string;
  durationCategory: string;
  contentStatus: string | null;
  significanceScore: number | null;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className:
      "border-muted-foreground/30 bg-muted/10 text-muted-foreground",
  },
  generated: {
    label: "Generated",
    className:
      "border-[var(--chart-3)]/40 bg-[var(--chart-3)]/10 text-[var(--chart-3)]",
  },
  reviewed: {
    label: "Reviewed",
    className:
      "border-[var(--chart-1)]/40 bg-[var(--chart-1)]/10 text-[var(--chart-1)]",
  },
};

const PAGE_SIZE = 20;

export function EventBrowserPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusFilter = searchParams.get("s") ?? "all";
  const durationFilter = searchParams.get("d") ?? "all";
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const [events, setEvents] = useState<TransitEventRow[]>([]);
  const [total, setTotal] = useState(0);
  // Derive loading from comparing current filter key to last-settled key
  const filterKey = `${statusFilter}:${durationFilter}:${page}`;
  const [settledKey, setSettledKey] = useState("");
  const loading = settledKey !== filterKey;
  const fetchIdRef = useRef(0);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || !value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Reset to page 1 on filter change
      if (key !== "page") params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    const id = ++fetchIdRef.current;
    const currentKey = filterKey;
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (durationFilter !== "all") params.set("duration", durationFilter);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String((page - 1) * PAGE_SIZE));

    fetch(`/api/studio/transit-events?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { events: TransitEventRow[]; total: number }) => {
        if (id !== fetchIdRef.current) return;
        setEvents(data.events);
        setTotal(data.total);
        setSettledKey(currentKey);
      })
      .catch(() => {
        if (id !== fetchIdRef.current) return;
        setEvents([]);
        setTotal(0);
        setSettledKey(currentKey);
      });
  }, [statusFilter, durationFilter, page, filterKey]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-medium text-foreground">
          Event Browser
        </h3>
        <span className="text-xs text-muted-foreground">
          {total} event{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => updateParam("s", v)}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="generated">Generated</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={durationFilter}
          onValueChange={(v) => updateParam("d", v)}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All durations</SelectItem>
            <SelectItem value="epoch">Epoch</SelectItem>
            <SelectItem value="passage">Passage</SelectItem>
            <SelectItem value="flash">Flash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Event list */}
      <div className="space-y-1.5">
        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground/60">
            Loading...
          </div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground/60">
            No events match filters
          </div>
        ) : (
          events.map((e) => {
            const badge = STATUS_BADGE[e.contentStatus ?? "pending"]!;
            return (
              <div
                key={e.slug}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-card/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs text-foreground">
                    {e.planet1} {e.aspectType} {e.planet2}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {e.sign} · {e.orbStart} → {e.orbEnd}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-[10px]", badge.className)}
                >
                  {badge.label}
                </Badge>
                <span className="shrink-0 rounded-full bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {e.durationCategory}
                </span>
                {e.significanceScore != null && (
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground/50">
                    {e.significanceScore}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
          >
            <ChevronLeft className="h-3 w-3" />
            Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            disabled={page >= totalPages}
            onClick={() => updateParam("page", String(page + 1))}
          >
            Next
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
