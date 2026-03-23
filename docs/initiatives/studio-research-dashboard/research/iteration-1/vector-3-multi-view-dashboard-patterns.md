# Vector 3: Multi-View Dashboard Patterns (shadcn/ui + Next.js)

**Question:** Best patterns for tabbed dashboard views where server-rendered data feeds multiple client-side view modes?
**Agent dispatched:** 2026-03-21

## Findings

**Architecture pattern: Server component fetches once, client component switches views:**

```
page.tsx (async RSC)
  -> fetches all data server-side
  -> groups data for StreamView
  -> reads searchParams for initial view
  -> renders <ResearchDashboard data={data} grouped={grouped} initialView={view} />

ResearchDashboard ('use client')
  -> <Tabs value={view} onValueChange={setView}>
      <TabsContent value="stream"><StreamView grouped={grouped} /></TabsContent>
      <TabsContent value="timeline"><TimelineView items={data} /></TabsContent>
      <TabsContent value="table"><DataTable columns={columns} data={data} /></TabsContent>
    </Tabs>
```

**View switching with shadcn Tabs:**
- Use controlled `value` prop (not `defaultValue`) for URL sync
- All `TabsContent` children are mounted simultaneously (Radix behavior) — hidden tabs use `display:none`
- Each view is its own client component receiving the same data props

**URL state for view selection:**
- The project already uses `searchParams` via page props (process page, tasks page, docs page)
- No need for `nuqs` — the established pattern is `searchParams` prop + `useRouter().push()` for URL updates
- `shallow` navigation (no server re-render) achievable with `router.replace(url, { scroll: false })`

**shadcn DataTable for Table View:**
- Server component fetches data, passes array to client `<DataTable>`
- `useReactTable({ data, columns, getSortedRowModel() })` handles client-side sorting
- Column definitions in a co-located `columns.tsx` using `ColumnDef<T>[]`
- Sort toggle in header: `column.toggleSorting(column.getIsSorted() === "asc")`

**StreamView with Collapsible Cards:**
- Group data server-side (reduce by category), pass `Record<string, Item[]>` to client
- One `<Collapsible>` per category key with `CardHeader` trigger and `CollapsibleContent` body
- Height animation handled by Radix's built-in `data-[state=open/closed]` transitions

## Sources

- [shadcn/ui Tabs](https://ui.shadcn.com/docs/components/tabs)
- [shadcn/ui DataTable](https://ui.shadcn.com/docs/components/data-table)
- [shadcn/ui Collapsible](https://ui.shadcn.com/docs/components/radix/collapsible)
- [Next.js: Adding Search and Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination)
- [sadmann7/shadcn-table](https://github.com/sadmann7/shadcn-table)

## Implications

The architecture aligns with existing Studio patterns. No new dependencies. The process page already demonstrates server data + client interactivity via `searchParams`. The key decision is whether view state should be URL-persisted (for shareable links) or `useState`-only (simpler). Given this is an internal dashboard, `useState` is sufficient — but URL params are a one-liner upgrade if needed.

## Open Questions

1. Should sort state in the table view also be URL-persisted?
2. Should stream sections default to expanded or collapsed?
3. Does the data volume warrant lazy-loading tab content, or is mounting all three views acceptable?
