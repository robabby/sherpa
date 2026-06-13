# Studio Walkthrough — Shot List & Recording Script (R6)

**Status:** Ready for Rob to record. The audit (R6) asked for a 90-second Studio walkthrough embedded (muted, looped) in the "See it running" section. A headless Playwright recording was trialed and rejected — see "Why a human recording" below. This is the shot list to record a polished version.

## Why a human recording (not the automated capture)

A Playwright `record_video_dir` capture was produced during Phase 5 and judged not shippable:
- Navigation between routes is `goto`-based, which produces hard white cuts (no smooth transitions).
- Headless capture quality and framerate are unreliable, and couldn't be verified in the build environment (no ffmpeg / no playback).
- It rendered as the throwaway capture user and mixed light list views with the dark detail view.

A 20–30 second screen recording by hand — smooth scrolling, real cursor, signed in as the real user — will look dramatically better as a homepage hero loop. The audit's own note: *"A muted autoplaying 15s loop of the process workspace … outperforms static images."* Favor short and smooth over long and complete.

## Setup

1. Run Studio locally signed in as the **Rob Abby** account (not a throwaway) so the user chip in the sidebar reads correctly:
   ```bash
   BETTER_AUTH_URL=http://localhost:3300 NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3300 PORT=3300 \
     pnpm --filter @sherpa/studio-app start
   ```
2. Browser window at **1440×900** (or record full-screen at 1920×1080 and crop to 16:10). Hide bookmarks bar and any extensions chrome.
3. Studio renders **dark when an initiative/mission is selected** and light for bare list views — keep an item selected in each scene so the loop stays dark and consistent (dark reads as "serious systems," which is the goal).
4. Use a screen recorder that captures a clean cursor (macOS screen recording, or CleanShot). 30 fps. No audio — this ships muted.

## Shot list (~90s, but a tight 30s edit is preferred)

| # | Scene | Route | On screen | Duration |
|---|-------|-------|-----------|----------|
| 1 | Process workspace | `/projects/sherpa/process` | The initiative list with "125 nodes in workspace." Slowly scroll the list a third of the way and back. | 0:00–0:12 |
| 2 | One initiative's trail | search "dispatch" → click **Dispatch Center** | The detail pane opens dark: the RESEARCH → PROPOSAL → PLAN → ACTIVE → INTEGRATED lifecycle bar, the High Stakes playbook track, and the attached files (proposal.md, plan.md, research/). Pause on the lifecycle bar. Scroll the detail pane down to reveal the file tree. | 0:12–0:38 |
| 3 | Task board | `/projects/sherpa/tasks` | The board with the backend filter chips (Claude, OpenCode, Codex, Gemini, LM Studio, Groq, Google AI, LM Studio API, OpenClaw) and the "62 pending / 38 completed" counts. Click one mission to open its detail. | 0:38–0:62 |
| 4 | Research dashboard | `/projects/sherpa/research` | The research streams / heartbeat schedule. Slow scroll. | 0:62–0:90 |

Recommended **short cut for the homepage loop:** scenes 1 → 2 only, ~18 seconds, ending on the Dispatch Center lifecycle bar. That single shot answers "what is this and is it real" better than the full tour.

## Post-production

- Trim dead frames at the start/end. Mute. 
- Export **two formats**: `studio-walkthrough.mp4` (H.264) and `studio-walkthrough.webm` (VP9) for browser coverage. Target < 3 MB for the short cut.
- Grab a **poster frame** (the Dispatch Center lifecycle bar) as `studio-walkthrough-poster.jpg`.
- Place all three in `apps/website/public/studio/`.

## Embedding (exact change)

In `apps/website/src/components/sections/see-it-running.tsx`, replace the **first** of the three screenshot figures (the process-workspace image) with a muted, looped, autoplaying video that falls back to the existing image via the `poster`:

```tsx
<video
  className="rounded-lg border border-border/60"
  autoPlay
  muted
  loop
  playsInline
  poster="/studio/studio-walkthrough-poster.jpg"
  aria-label="Sherpa Studio governing its own development"
>
  <source src="/studio/studio-walkthrough.webm" type="video/webm" />
  <source src="/studio/studio-walkthrough.mp4" type="video/mp4" />
</video>
```

Keep the existing `task-board.png` and `research-dashboard.png` figures as the other two — the video replaces only the lead image. Leave the captions unchanged.

## Notes

- The sidebar 404s and the 60s task-board render were fixed in Phase 3, so every route in this script loads fast and clean — safe to record without dead time.
- The `/dispatch` and `/playbooks` pages poll continuously; they're not in this script, but if you wander there while recording, expect a network spinner that never fully settles.
