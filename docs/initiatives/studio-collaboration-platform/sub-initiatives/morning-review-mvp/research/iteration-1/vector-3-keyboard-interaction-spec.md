# Vector 3: Keyboard Interaction Spec

**Question:** Design the review queue keyboard shortcuts. What happens on approve/reject/iterate? What downstream effects?
**Agent dispatched:** 2026-03-09

## Findings

### Reference Patterns

- **Linear Triage**: `1` Accept, `2` Mark as Duplicate, `3` Decline. `J`/`K` next/previous. `H` Snooze. `X` Select. Auto-advance after action. ([Linear Triage Docs](https://linear.app/docs/triage))
- **Superhuman**: `E` mark done (archive), `J`/`K` navigation, `Shift+J`/`Shift+K` extend selection, `Cmd+K` command palette. Single-key actions auto-advance. ([UseTheKeyboard](https://usethekeyboard.com/superhuman/))
- **Gmail**: `X` select, `E` archive, `L` label. Batch: select multiple with `X`, apply action to all. ([Gmail Help](https://support.google.com/mail/answer/6594?hl=en))
- **VS Code PR review**: Limited keyboard shortcuts. `Cmd+Ctrl+C` marks file as viewed. No single-key approve/reject — validates this is an underserved pattern. ([VS Code Blog](https://code.visualstudio.com/blogs/2018/09/10/introducing-github-pullrequests))
- **react-hotkeys-hook**: 4M+ weekly npm downloads, supports scopes and sequential keys. But WavePoint already has `useKeyboardShortcuts` hook — extend that instead. ([npm](https://www.npmjs.com/package/react-hotkeys-hook))
- **Sonner toast**: Already wired up at `apps/web/src/components/ui/sonner.tsx`. Undo actions should persist until dismissed for actionable toasts. ([benrajalu.net](https://benrajalu.net/articles/ux-of-notification-toasts))

### Queue Ordering

Composite sort key:
1. **Status bucket**: `completed` > `failed` > `dispatched` > `reviewed`
2. **Priority**: `urgent` > `high` > `medium` > `low`
3. **Backend**: `claude` before `lm-studio` (higher stakes)
4. **Completed-at**: oldest first (FIFO within same priority)

### Keybinding Table

#### Queue Navigation (scope: `queue`)

| Key | Action | Downstream Effect |
|-----|--------|-------------------|
| `J` / `↓` | Select next task | Highlight moves down, side panel updates |
| `K` / `↑` | Select previous task | Highlight moves up, side panel updates |
| `Enter` / `L` | Open detail panel | Side panel slides in, focus scope → `detail` |
| `Escape` | Deselect / close panel | Backs up one level |
| `?` | Toggle shortcut help | Modal overlay |

#### Verdict Actions (scope: `queue` or `detail`)

| Key | Action | Downstream Effect |
|-----|--------|-------------------|
| `A` | **Approve** | `judge-verdict: approved`, `status: reviewed`. Claude tasks: trigger PR creation flow. LM Studio tasks: mark for integration. Auto-advance. Toast: "Task approved" (5s undo). |
| `R` | **Request changes** | `judge-verdict: needs-changes`. Opens inline comment field. On submit: creates `<slug>-v2.md` iteration task. Auto-advance. Toast: "Iteration task created" (5s undo). |
| `D` | **Reject** | `judge-verdict: rejected`, `status: reviewed`. Requires confirmation (`D` then `Enter`). Archives task. Toast: "Task rejected" (8s undo, longer for destructive). |
| `S` | **Skip / Snooze** | Moves to end of queue, no persistence change. Auto-advance. |

#### Batch Operations (scope: `queue`)

| Key | Action | Downstream Effect |
|-----|--------|-------------------|
| `X` | Toggle select | Adds/removes from multi-select set |
| `Shift+J` | Select next + extend | Like Gmail batch selection |
| `Shift+K` | Select prev + extend | Reverse batch selection |
| `Shift+A` | Batch approve | Applies to all selected. Toast: "N tasks approved" |
| `Shift+D` | Batch reject | Confirmation required. Toast (8s undo). |

#### Detail Panel (scope: `detail`)

| Key | Action | Downstream Effect |
|-----|--------|-------------------|
| `J` / `↓` | Scroll detail down | Content scroll |
| `K` / `↑` | Scroll detail up | Content scroll |
| `]` | Next section | Jump: Summary → Output → Diff → Verdict |
| `[` | Previous section | Reverse |
| `Escape` | Close detail | Return focus to queue |
| `A`/`R`/`D` | Verdict actions | Same as queue scope |

### Auto-Advance Behavior

1. Current task animates out (slide left + fade, 200ms)
2. Next task in filtered queue becomes selected
3. Detail panel updates if open
4. If no tasks remain: "All caught up" empty state with "Plan next batch" link
5. Queue counter updates: "3 of 7 reviewed"

### Escape Ladder (each press backs up one level)

1. Inline comment field focused → blur
2. Detail panel open → close
3. Tasks multi-selected → clear selection
4. Task highlighted → deselect

### Undo via Toast

- Every verdict shows Sonner toast with "Undo" button
- Duration: 5s approve/iterate, 8s reject (destructive)
- Undo reverts frontmatter, re-inserts task at original position
- Only most recent action undoable
- `Cmd+Z` while toast visible

### Server Action Design

```typescript
// apps/studio/src/app/morning/actions.ts

async function approveTask(slug: string)
  // → update status: "reviewed", judge-verdict: "approved"
  // → if backend === "claude" && branch exists: create PR via gh
  // → revalidatePath("/app/studio/morning")

async function requestChanges(slug: string, feedback: string)
  // → update judge-verdict: "needs-changes"
  // → create docs/tasks/<slug>-v2.md with feedback in Constraints
  // → revalidatePath("/app/studio/morning")

async function rejectTask(slug: string, reason?: string)
  // → update status: "reviewed", judge-verdict: "rejected"
  // → move to docs/tasks/archive/YYYY-MM-DD/
  // → cleanup worktree if exists
  // → revalidatePath("/app/studio/morning")

async function undoVerdict(slug: string, previousState: TaskState)
  // → restore frontmatter
  // → un-archive if rejected, delete iteration task if created
  // → revalidatePath("/app/studio/morning")
```

### Implementation Notes

- **No new dependencies.** Extend existing `useKeyboardShortcuts` hook + Sonner toast.
- **Server actions need filesystem write.** Works in dev (same machine). Internal-only page.
- **PR creation** requires `gh` CLI on server. Alternative: "Copy PR command" button.
- **Detail panel content** should lazy-load via separate server actions to avoid loading all outputs upfront.

## Sources

- [Linear Triage Docs](https://linear.app/docs/triage)
- [Linear Shortcuts](https://shortcuts.design/tools/toolspage-linear/)
- [Superhuman Shortcuts](https://usethekeyboard.com/superhuman/)
- [Superhuman Help](https://help.superhuman.com/hc/en-us/articles/45191759067411-Speed-Up-With-Shortcuts)
- [Gmail Shortcuts](https://support.google.com/mail/answer/6594?hl=en)
- [VS Code PR Review](https://code.visualstudio.com/blogs/2018/09/10/introducing-github-pullrequests)
- [react-hotkeys-hook](https://www.npmjs.com/package/react-hotkeys-hook)
- [Toast UX Patterns](https://benrajalu.net/articles/ux-of-notification-toasts)
- [Toast Best Practices](https://blog.logrocket.com/ux-design/toast-notifications/)
- [Carbon Notification Pattern](https://carbondesignsystem.com/patterns/notification-pattern/)

## Raw Links

- https://linear.app/docs/triage
- https://shortcuts.design/tools/toolspage-linear/
- https://keycombiner.com/collections/linear/
- https://linear.app/docs/inbox
- https://usethekeyboard.com/superhuman/
- https://help.superhuman.com/hc/en-us/articles/45191759067411-Speed-Up-With-Shortcuts
- https://superhuman.com/products/mail/shortcuts
- https://nickgray.net/superhuman/
- https://support.google.com/mail/answer/6594?hl=en
- https://www.getinboxzero.com/blog/post/gmail-shortcuts-cheat-sheet
- https://code.visualstudio.com/blogs/2018/09/10/introducing-github-pullrequests
- https://dev.to/krisplatis/boost-your-code-review-game-with-custom-vscode-shortcuts-3p8o
- https://github.com/microsoft/vscode-pull-request-github/issues/1342
- https://www.npmjs.com/package/react-hotkeys-hook
- https://github.com/JohannesKlauss/react-hotkeys-hook
- https://react-hotkeys-hook.vercel.app/
- https://benrajalu.net/articles/ux-of-notification-toasts
- https://blog.logrocket.com/ux-design/toast-notifications/
- https://carbondesignsystem.com/patterns/notification-pattern/
- https://maxschmitt.me/posts/toasts-bad-ux
- https://www.radix-ui.com/primitives/docs/components/toast

## Open Questions

- Should the morning page reuse `useKeyboardShortcuts` or create a dedicated `useMorningReviewShortcuts` hook?
- Should PR creation be automated via server action or surface a "copy command" UX?
- How to handle keyboard shortcuts when the user has a text field focused (inline comments)?
