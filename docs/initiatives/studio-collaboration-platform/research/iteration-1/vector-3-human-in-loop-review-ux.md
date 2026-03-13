# Vector 3: Human-in-the-Loop Review UX

**Question:** What UX patterns work best for "review N items efficiently" — batch approval, review queues, and morning review workflows?
**Agent dispatched:** 2026-03-09

## Findings

### GitHub PR Review: The Tri-State Model

- **Tri-state decision model:** Approve / Request Changes / Comment. "Comment without deciding" is first-class — not every item demands an immediate yes/no. ([GitHub Docs](https://docs.github.com/articles/reviewing-proposed-changes-in-a-pull-request))
- **Batched submission:** Comments accumulate as private drafts during review. The entire review is submitted in one action, preventing notification spam.
- **"Viewed" checkbox per file:** Collapses file, updates progress bar, resets if file is modified. No keyboard shortcut. ([GitHub Community](https://github.com/orgs/community/discussions/10197))
- **Keyboard shortcuts:** `T` to filter files, `n`/`p` to cycle commits, `w` to toggle whitespace, `I` to toggle comments. No shortcut for file-to-file navigation in "Files changed." ([TestDouble](https://testdouble.com/insights/github-shortcuts-to-speed-up-prs))

### Reviewable.io: Beyond GitHub

- **Discussion dispositions:** Participants set a stance per discussion — working on it, satisfied, or just adding context. Discussion resolves only when all dispositions align. Much more nuanced than GitHub's binary model. ([Reviewable Docs](https://docs.reviewable.io/discussions.html))
- **Revision mapping:** Tracks which revisions each reviewer has seen. After rebase/amend, shows the net delta, not the full diff. A file matrix shows each file's state across revisions. ([Reviewable Docs](https://docs.reviewable.io/files.html))
- **Built by ex-Google engineers** who missed Critique (Google's internal code review tool). ([Blog](https://www.reviewable.io/blog/from-critique-to-reviewable/))

### Content Moderation Queues

- **Core actions:** Approve, Reject, Skip, Escalate. Skip is first-class — lets moderators defer uncertain items. ([Higher Logic](https://support.higherlogic.com/hc/en-us/articles/360032694632-Manage-Your-Site-s-Moderation-Queue))
- **Nyckel's interface:** Current item in large font at top, next items previewed below in smaller font, auto-scroll to next item after decision. Every decision feeds model improvement. ([Nyckel](https://www.nyckel.com/blog/content-moderation-features/))
- **Reddit modqueue research (2024-2025):** Two papers surveyed 110+ moderators across 400+ subreddits. Key challenges: coordination (multiple mods on same item), limited sorting/filtering, fragmented third-party tools. ([arXiv](https://arxiv.org/abs/2409.16840))

### Superhuman's Keyboard-Driven Inbox Zero

- **Core shortcuts:** `E` mark done, `R` reply, `H` snooze, `Del` delete, `Cmd+K` command palette, `Ctrl+U` unsubscribe. Training: "Don't touch your mouse." ([Superhuman](https://blog.superhuman.com/email-triage/))
- **Split Inbox:** ML-powered categorization creates separate streams. Eliminates context switching by enabling batch processing per category. ([Superhuman](https://blog.superhuman.com/how-to-split-your-inbox-in-superhuman/))
- **Keyboard shortcuts save ~134 hours/year (~17 working days).** ([Superhuman](https://blog.superhuman.com/email-triage/))
- **Snooze as first-class action:** "Not now, but not never" — items return at a chosen time. ([Superhuman](https://blog.superhuman.com/inbox-zero-in-7-steps/))

### Vercel Preview Deployments

- **Every code push auto-generates a unique preview URL.** Review the live experience, not just code diffs. ([Vercel](https://vercel.com/docs/deployments/environments))
- **Comments directly on visual elements** in the preview, synchronized with Slack. ([Vercel Blog](https://vercel.com/blog/introducing-commenting-on-preview-deployments))
- **Manual promotion control:** Disable auto-promotion and manually promote preview to production. ([Vercel](https://vercel.com/docs/deployments/promote-preview-to-production))

### Tinder-Style Swipe for Professional Tools

- **Why it works:** Innate gesture, prevents decision-regretting by blocking revisits, "one at a time" creates focus. ([Built In](https://builtin.com/articles/tinder-swipe-design))
- **Professional adoption is limited:** Microsoft Teams Adaptive Cards, fashion e-commerce. NOT widely adopted in developer tools — this is an **opportunity gap**.
- **Limitations:** Binary decisions only, no batch operations, risks speed over thoughtfulness.

### Side-by-Side Diff Viewers

- **Monaco Editor:** Split and inline modes, toggleable dynamically, responsive auto-switch to inline when narrow. ([Monaco API](https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IDiffEditorBaseOptions.html))
- **GitClear's semantic diffs:** Recognizes 5 change types (added, deleted, moved, updated, find-and-replaced, copy/pasted), de-emphasizes moved lines — **30% less to review.** Also provides AI-generated file summaries. ([GitClear](https://www.gitclear.com/help/pull_request_review_demo_github_alternative))

### Keyboard-Driven Batch Operations

- **Linear Triage (best-in-class):** `1` accept, `2` duplicate, `3` decline, `H` snooze. Items auto-advance. `X` to select, `Shift+Up/Down` multi-select. ([Linear Docs](https://linear.app/docs/triage))
- **NNGroup's 3 guidelines for bulk actions:** Provide Select All, use a contextual action bar, give clear feedback with undo option. ([NNGroup](https://www.nngroup.com/videos/bulk-actions-design-guidelines/))
- **Persistent action bar:** Must stay visible while scrolling, expand/contract based on selection count. ([Eleken](https://www.eleken.co/blog-posts/bulk-actions-ux))

### Human-in-the-Loop AI Review Patterns

- **Green/Amber/Red lane model:** Green (high confidence) auto-approves with sampling, Amber routes to review queue with SLAs, Red blocks or requires dual control. Most cited pattern. ([All Days Tech](https://alldaystech.com/guides/artificial-intelligence/human-in-the-loop-ai-review-queue-workflows))
- **Gartner: 90% of enterprise GenAI apps will require formal HITL processes by 2026.** ([Parseur](https://parseur.com/blog/future-of-hitl-ai))
- **Cloudflare Agents SDK:** `waitForApproval()` pauses execution, `approveWorkflow()`/`rejectWorkflow()` resume or reject. State persists across disconnections. ([Cloudflare](https://developers.cloudflare.com/agents/concepts/human-in-the-loop/))

### Graphite: Stacked PRs and Review Efficiency

- **Breaks large changes into smaller, dependent PRs.** Developers keep working without waiting for reviews. ([Graphite](https://graphite.com/))
- **Merge queue auto-rebases, re-runs CI, merges with one click.** Skips redundant CI across stacked changes.

## Sources

- [GitHub PR Review Docs](https://docs.github.com/articles/reviewing-proposed-changes-in-a-pull-request)
- [Reviewable Discussion Dispositions](https://docs.reviewable.io/discussions.html)
- [Reviewable Revision Mapping](https://docs.reviewable.io/files.html)
- [Superhuman Email Triage](https://blog.superhuman.com/email-triage/)
- [Superhuman Split Inbox](https://blog.superhuman.com/how-to-split-your-inbox-in-superhuman/)
- [Nyckel Content Moderation](https://www.nyckel.com/blog/content-moderation-features/)
- [Vercel Preview Comments](https://vercel.com/blog/introducing-commenting-on-preview-deployments)
- [Linear Triage Docs](https://linear.app/docs/triage)
- [NNGroup Bulk Actions](https://www.nngroup.com/videos/bulk-actions-design-guidelines/)
- [HITL Green/Amber/Red](https://alldaystech.com/guides/artificial-intelligence/human-in-the-loop-ai-review-queue-workflows)
- [Cloudflare Agents HITL](https://developers.cloudflare.com/agents/concepts/human-in-the-loop/)
- [GitClear Semantic Diffs](https://www.gitclear.com/help/pull_request_review_demo_github_alternative)
- [Graphite Stacked PRs](https://graphite.com/)

## Raw Links

- https://docs.github.com/articles/reviewing-proposed-changes-in-a-pull-request
- https://github.blog/changelog/2026-01-22-improved-pull-request-files-changed-page-on-by-default/
- https://github.com/orgs/community/discussions/169802
- https://github.com/orgs/community/discussions/10197
- https://testdouble.com/insights/github-shortcuts-to-speed-up-prs
- https://reviewable.io/
- https://www.reviewable.io/blog/from-critique-to-reviewable/
- https://docs.reviewable.io/
- https://docs.reviewable.io/files.html
- https://docs.reviewable.io/discussions.html
- https://blog.superhuman.com/email-triage/
- https://blog.superhuman.com/how-to-split-your-inbox-in-superhuman/
- https://blog.superhuman.com/inbox-zero-in-7-steps/
- https://download.superhuman.com/Superhuman%20Keyboard%20Shortcuts.pdf
- https://www.nyckel.com/blog/content-moderation-features/
- https://support.higherlogic.com/hc/en-us/articles/360032694632-Manage-Your-Site-s-Moderation-Queue
- https://arxiv.org/abs/2409.16840
- https://arxiv.org/abs/2509.07314
- https://vercel.com/docs/deployments/environments
- https://vercel.com/blog/introducing-commenting-on-preview-deployments
- https://vercel.com/docs/deployments/promote-preview-to-production
- https://builtin.com/articles/tinder-swipe-design
- https://petri.com/how-to-manage-tasks-and-approvals-in-teams-with-adaptive-cards/
- https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IDiffEditorBaseOptions.html
- https://www.gitclear.com/help/pull_request_review_demo_github_alternative
- https://www.gitclear.com/research_studies/pull_request_diff_methods_comparison_faster_review
- https://www.blog.brightcoding.dev/2026/03/05/difit-the-ai-powered-git-diff-tool-every-developer-needs
- https://linear.app/docs/triage
- https://www.nngroup.com/videos/bulk-actions-design-guidelines/
- https://www.patternfly.org/patterns/bulk-selection/
- https://helios.hashicorp.design/patterns/table-multi-select
- https://www.eleken.co/blog-posts/bulk-actions-ux
- https://alldaystech.com/guides/artificial-intelligence/human-in-the-loop-ai-review-queue-workflows
- https://parseur.com/blog/future-of-hitl-ai
- https://developers.cloudflare.com/agents/concepts/human-in-the-loop/
- https://www.comet.com/site/blog/human-in-the-loop/
- https://cobbai.com/blog/human-in-the-loop-support-ai
- https://graphite.com/
- https://graphite.com/docs/best-practices-for-reviewing-stacks

## Implications

1. **Linear's Triage view is the closest pattern:** single-key decisions (`1`/`2`/`3`/`H`), auto-advance, keyboard-only.
2. **Superhuman's Split Inbox solves categorization:** group by type first, then batch-process each category.
3. **Reviewable's revision mapping solves "what's new since I last looked"** — critical for iterative agent output.
4. **Green/Amber/Red routing** is the standard for confidence-based queue splitting.
5. **Nyckel's auto-advance with preview** optimizes throughput for content review.
6. **Batched submission** (GitHub pattern) prevents triggering actions per individual decision.

## Open Questions

1. Where does the review queue live — Studio route, dedicated `/app/review`, or CLI?
2. What's the item granularity — per PR, per file, per agent session, per initiative?
3. How does "request changes" work for AI agents — new task, PR comment, or workstream update?
4. Trust escalation: agents with high approval rates get auto-approved over time?
5. At what queue depth does review quality degrade? Daily review cap?
