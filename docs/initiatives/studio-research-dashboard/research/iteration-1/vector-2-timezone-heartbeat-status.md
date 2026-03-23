# Vector 2: Timezone-Aware Heartbeat Status

**Question:** How to compute heartbeat status (active/pending/offline) in a Next.js server component using Pacific Time?
**Agent dispatched:** 2026-03-21

## Findings

**Intl.DateTimeFormat with `America/Los_Angeles` handles DST automatically:**

```typescript
function getPacificTime(date: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) =>
    parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);
  return { hour: get('hour') % 24, minute: get('minute') };
}
```

No external date libraries needed. The `% 24` guard handles a Node.js v14-v18 bug where midnight returns "24" — harmless on Node.js v22 (which Sherpa uses) but a safe one-liner.

**ISO timestamp comparison is trivial:**

```typescript
const lastUpdated = new Date("2026-03-21T14:30:00-07:00");
const elapsedMs = Date.now() - lastUpdated.getTime();
const isRecent = elapsedMs < 35 * 60 * 1000;
```

The offset in the ISO string handles DST. `Date.now()` and `getTime()` are both UTC epoch milliseconds — subtraction is timezone-agnostic.

**Critical Next.js constraint: `await connection()` required before `Date.now()`:**

In Next.js 15/16, calling `Date.now()` or `new Date()` in a server component before any uncached data access triggers a prerender error. The fix is `await connection()` from `next/server`, which opts into dynamic rendering:

```typescript
import { connection } from 'next/server';

async function HeartbeatStatus() {
  await connection(); // must come before Date.now()
  const now = new Date();
  // ... time logic
}
```

A `<Suspense>` boundary above the component is required when using `await connection()`.

**Alternative:** `export const dynamic = 'force-dynamic'` at the page level. Heavier but simpler for a fully dynamic page.

**Next-heartbeat calculation:**

```typescript
const minutesUntilNext = 30 - (pacificMinute % 30);
```

Active hours check: `hour >= 8 && hour < 23` (8 AM inclusive, 11 PM exclusive).

## Sources

- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [MDN: Intl.DateTimeFormat.formatToParts()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts)
- [Next.js: Cannot access Date.now() before uncached data](https://nextjs.org/docs/messages/next-prerender-current-time)
- [Node.js issue #33089: midnight "24" bug](https://github.com/nodejs/node/issues/33089)

## Implications

No external dependencies needed — native Intl API + `await connection()` covers everything. The `connection()` import is the key discovery — without it the page would fail to build in production. The heartbeat status function should be a pure utility in studio-core, with the `connection()` call happening in the page component before calling it.

## Open Questions

1. Should the research page use `force-dynamic` (simpler) or `await connection()` (more precise)?
2. Should the component auto-revalidate on an interval, or just rely on RefreshOnFocus?
3. Is the 11 PM cutoff exclusive (23:00 starts inactive) or inclusive (23:01 starts inactive)?
