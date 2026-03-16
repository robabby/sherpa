import { Skeleton } from "@/components/ui/skeleton"

export function SplitPaneSkeleton() {
  return (
    <div className="animate-skeleton-delayed flex h-[calc(100vh-53px)] border-t">
      {/* Left pane */}
      <div className="flex w-80 shrink-0 flex-col gap-2 border-r bg-[var(--color-obsidian)] p-3">
        <Skeleton className="h-7 w-full" />
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>

      {/* Right pane */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-4 h-40 w-full rounded-lg" />
      </div>
    </div>
  )
}
