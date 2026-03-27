# Cron Diagnosis + New Stripe Role — March 26, 2026 (5:30 PM PT)

## Cron Issue: Root Cause Found

**Problem:** Nightly research crons run successfully but produce NO output files. 3 nights of lost research.

**Root cause:** The `researcher` agent only has `read` and `web_search` tools — no `exec` or `write`. Cron tasks tell it to "save output to /path/to/file" but it physically can't write files. The research content exists in the cron run logs (`~/.openclaw/cron/runs/*.jsonl`) but never reaches disk.

**Evidence:** Every cron run log includes the researcher explicitly noting: *"I don't have file-write capability in this session"* and dumping the full report into the session summary instead.

**Fix options:**
1. Switch nightly crons to use `orchestrator` agent (has write access) — but uses Opus, more expensive
2. Give the `researcher` agent `exec` or `write` tools
3. Add a post-cron hook that extracts summaries from run logs and writes them to files
4. Change cron delivery mode to pipe output somewhere useful instead of `"mode": "none"`

**Recommendation:** Option 1 is simplest — change `agentId` from `researcher` to `orchestrator` for the crons that need file output. Or option 2 if we want to keep researcher costs down.

## 🔥 NEW: Stripe Staff Frontend Engineer, AI Design Tooling

Found in today's midday cron run log (researcher spotted it but couldn't write it down):

- **Role:** Staff Frontend Engineer, AI Design Tooling
- **URL:** https://stripe.com/jobs/listing/staff-frontend-engineer-ai-design-tooling/7683133
- **Fit: 9.5/10** — "Designing and building internal AI tools that accelerate prototyping, inspire experimentation and innovation"
- **Why it matters:** Exact title match for Rob — Staff Frontend + AI Tooling. This is arguably the single best Stripe role for his profile, better than the 5 we were already tracking.
- **Status:** Needs URL verification (found by researcher, not yet confirmed)

## Also Found in Cron Logs

- Stripe Senior Staff Frontend Engineer, Merchant Experience (Toronto, may be remote-flexible, posted 3/24)
- Vercel Design Engineer URL: https://vercel.com/careers/design-engineer-us-5709080004 (alternate URL format)
