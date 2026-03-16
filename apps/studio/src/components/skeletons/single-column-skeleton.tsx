import { Skeleton } from "@/components/ui/skeleton"

export function SingleColumnSkeleton() {
  return (
    <div className="animate-skeleton-delayed flex flex-col gap-10 p-6">
      {/* Section 1 */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      {/* Section 2 */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-36" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}
