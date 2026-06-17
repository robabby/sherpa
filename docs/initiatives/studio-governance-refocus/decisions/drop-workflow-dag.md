---
decision: "Drop the Workflow React Flow DAG canvas; Playbooks becomes the canonical process-flow view"
date: 2026-06-17
skill: /shape
alternatives-rejected:
  - "Port the interactive DAG canvas into Playbooks — rejected: re-homes complexity (React Flow, node/edge layout) to preserve a visualization that overlaps what Playbooks already shows as play timelines"
  - "Keep Workflow as its own tab — rejected: it is a phase blueprint, redundant with Playbooks; two views of the same process flow is exactly the proliferation this initiative removes"
confidence: high
kill-criteria: "If an interactive, navigable process graph proves to be a distinct user need (not served by Playbooks timelines), reopen as a separate initiative"
---

The Workflow tab renders a React Flow DAG of phases (research→shape→design→plan). Playbooks already renders the same sequences as timelines linked to skills and initiatives. Merging means **dropping the canvas**, not porting it. If a flow picture earns its place in Playbooks, it is a small static diagram, not an interactive graph. This keeps one canonical view of the process flow and removes a maintenance surface (React Flow) that served a redundant lens.
