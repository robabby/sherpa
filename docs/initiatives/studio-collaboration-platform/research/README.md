# Studio Collaboration Platform — Research

## Iterations

| # | Date | Vectors | Key Insight |
|---|------|---------|-------------|
| 1 | 2026-03-09 | Solo dashboards, AI-native PM, review UX, cost visibility, job transparency | Morning review is the primary interaction; pipeline view not board; exception-first design |
| 2 | 2026-03-12 | Fleet interfaces, RTS/gaming metaphors, agent status protocols, delegation/dispatch, collaborative editing, progressive disclosure | Fleet minimap is the missing primitive; delegation-not-assignment; Sherpa already has what industry is building toward |

## Open Questions for Next Iteration

1. **Fleet minimap wireframe** — What specific component renders? What data feeds it? How does it integrate into Studio's existing sidebar? What's the information hierarchy within the minimap?

2. **Delegation UX design** — How does dispatching a task from an initiative look in Studio? From the morning review? Natural language delegation from where?

3. **AG-UI event model adaptation** — How do AG-UI's 17 event types map to Sherpa's MCP server? What events does studio-mcp need to emit? How does the frontend subscribe?

4. **Agent activity stream component** — What does the Linear-style activity stream (tool calls, thoughts, elicitations, responses) look like in shadcn/ui? Can this be a reusable component in studio-ui?

5. **Notification architecture** — How should "needs your input" notifications reach the user when Studio is not open? Email digest? System notifications? Slack integration?

6. **Cost visibility without anxiety** — Iteration 1 established "retrospective weather report, not real-time bill." How does this integrate with the fleet minimap? Per-initiative or per-session?

## Research Archive

- `iteration-1.md` — Synthesis (2026-03-09)
- `iteration-1/` — Full agent reports (5 vectors)
- `iteration-2.md` — Synthesis (2026-03-12)
- `iteration-2/` — Full agent reports (6 vectors)
