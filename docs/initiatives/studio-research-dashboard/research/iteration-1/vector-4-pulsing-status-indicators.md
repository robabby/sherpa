# Vector 4: Pulsing Status Indicators in React

**Question:** Effective patterns for building pulsing/live status indicators with Tailwind CSS?
**Agent dispatched:** 2026-03-21

## Findings

**`animate-ping` (not `animate-pulse`) is the correct animation for a heartbeat indicator:**

- `animate-pulse` = opacity-only fade (skeleton loader pattern — signals "loading")
- `animate-ping` = scale to 2x + fade (radar ping — signals "live/active")

**The canonical "live dot" pattern uses two layers:**

```html
<span class="relative flex size-3">
  <!-- outer pinging layer -->
  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
  <!-- inner solid dot -->
  <span class="relative inline-flex size-3 rounded-full bg-emerald-500"></span>
</span>
```

Used by GitHub for profile status dots and documented across Tailwind community resources.

**Three-state mapping for the heartbeat:**
- `active` (updated within 35 min): green (`bg-emerald-500`) with `animate-ping`
- `pending` (within active hours, not recent): amber (`bg-amber-400`), static
- `offline` (outside active hours): zinc/slate (`bg-zinc-400`), static, muted

**Industry references:**
- Vercel Geist `<StatusDot>` — accepts a `state` prop, animation only on active/building states
- GitHub — green pulsing dot, yellow for busy (no animation), gray for offline
- Linear — static colored badges, prioritizes information density over animation

**Custom keyframes in Tailwind v4** use `@theme` directive in CSS:

```css
@theme {
  --animate-heartbeat: heartbeat 2.5s ease-in-out infinite;
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.15); opacity: 0.8; }
  }
}
```

**Auto-refresh strategies:**
1. `router.refresh()` on `setInterval` in a zero-render client component (best fit — keeps page as server component)
2. SWR `refreshInterval` (requires client boundary — overkill for this)
3. Visibility change API (already exists in Sherpa as `RefreshOnFocus`)

**Recommendation:** Combine `setInterval` (every 2-5 minutes) with existing `RefreshOnFocus` for comprehensive staleness prevention.

**Accessibility:**
- Color alone fails color-blind users — add `aria-label` or text label
- `motion-reduce:animate-none` for reduced-motion preference
- Tooltip or visible label alongside the dot

## Sources

- [Tailwind CSS animation docs](https://tailwindcss.com/docs/animation)
- [Vercel Geist Status Dot](https://vercel.com/geist/status-dot)
- [Dave Gray: usePolling hook for Next.js](https://www.davegray.codes/posts/usepolling-custom-hook-for-auto-fetching-in-nextjs)
- [SWR with Next.js](https://swr.vercel.app/docs/with-nextjs)

## Implications

No new dependencies needed. Built-in Tailwind `animate-ping` + the two-layer dot pattern covers the active state. The heartbeat indicator component is small — a single file with a state prop driving color and animation. Adding a periodic `setInterval` refresh (alongside `RefreshOnFocus`) ensures the heartbeat status stays fresh even when the tab is in the foreground for extended periods.

## Open Questions

1. Should the ping animation run at 1s (default) or slower (2-3s) to match the 30-minute heartbeat cadence?
2. Should `RefreshOnFocus` be replaced with a unified refresh component that handles both visibility and interval?
3. Does the dashboard need `prefers-reduced-motion` handling for the pulsing dot?
