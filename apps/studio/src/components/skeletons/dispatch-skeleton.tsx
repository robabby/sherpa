import { Skeleton } from "@/components/ui/skeleton"

export function DispatchSkeleton() {
  return (
    <div className="animate-skeleton-delayed flex h-[calc(100vh-53px)] flex-col border-t">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid flex-1 grid-cols-12 gap-0 overflow-hidden">
        {/* Column 1 */}
        <div className="col-span-3 flex flex-col gap-2 border-r p-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>

        {/* Column 2 */}
        <div className="col-span-5 flex flex-col gap-2 border-r p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>

        {/* Column 3 */}
        <div className="col-span-4 flex flex-col gap-2 p-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
