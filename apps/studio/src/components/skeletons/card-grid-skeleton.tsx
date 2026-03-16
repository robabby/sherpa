import { Skeleton } from "@/components/ui/skeleton"

export function CardGridSkeleton({ columns = 2 }: { columns?: 2 | 3 }) {
  const count = columns === 3 ? 6 : 4
  const gridClass =
    columns === 3 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"

  return (
    <div className="animate-skeleton-delayed mx-auto flex max-w-6xl flex-col gap-8 px-6 py-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-6 w-40" />
      <div className={`grid gap-4 ${gridClass}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border bg-card/30 p-4"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
