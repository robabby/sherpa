"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownAZ, ArrowDownWideNarrow, Clock, Activity } from "lucide-react";
import { cn } from "./lib/utils";

export const SORT_OPTIONS = [
  { value: "activity", label: "Activity", icon: Activity },
  { value: "updated", label: "Updated", icon: Clock },
  { value: "alpha", label: "A\u2013Z", icon: ArrowDownAZ },
  { value: "status", label: "Status", icon: ArrowDownWideNarrow },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export function SortControl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get("sort") as SortOption) || "activity";

  function setSort(value: SortOption) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "activity") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-1">
      {SORT_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = current === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                : "text-muted-foreground/50 hover:text-muted-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
