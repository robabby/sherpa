---
status: launched
source-iteration: 1
spawned-from: mmo-patterns-for-agents
created: 2026-03-11
priority: high
sub-initiative: sub-initiatives/game-authority-as-mcp-protocol
---

# Game Authority Transfer as MCP Protocol Design

## Context

Iteration 1 established that the MCP coordination server IS the replication layer (Star Citizen pattern) and that authority transfer needs bounded timeouts, fencing tokens, orphan detection, and per-artifact permission levels. But the research was architectural — it didn't design the actual MCP tool API. This branch translates game authority protocols into concrete MCP tool definitions that Sherpa's Planner/Worker/Judge can call.

## Question

What MCP tools does the coordination server expose for authority management? How do the Improbable patent's four-state model, coherence's Request/Steal/NotTransferable modes, fencing tokens, and orphan detection translate into a concrete tool API that agents call during task execution?

## Suggested Vectors

1. **MCP tool API design** — What are the specific tools? `claim_authority(file, token)`, `release_authority(file, token)`, `check_authority(file)`, `list_orphans()`? What parameters, what responses, what error states?
2. **Fencing tokens in practice** — How to implement monotonically increasing tokens backed by SQLite (cross-ref `sqlite-agentic-state`). What happens when a token check fails? How does the agent handle rejection?
3. **Heartbeat and orphan detection** — How does the MCP server detect that a Worker has crashed? What's the heartbeat interval? What's the adoption protocol? Auto-assign or Planner-reassign?
4. **Authority transfer state machine** — Map the Improbable patent's AUTHORITATIVE → AUTHORITY_LOSS_IMMINENT → NOT_AUTHORITATIVE states to MCP tool call sequences. What does the Worker do during AUTHORITY_LOSS_IMMINENT (save partial work, commit WIP)?
5. **Permission levels per artifact type** — Unity Netcode's five permission levels (None/Distributable/Transferable/RequestRequired/SessionOwner) mapped to file types in Sherpa. Which files get which permission level?

## Links

- [Improbable Patent US10878146](https://patents.google.com/patent/US10878146B2/en)
- [coherence Authority Transfer](https://docs.coherence.io/manual/authority/authority-transfer)
- [Unity Netcode Ownership](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.10/manual/terms-concepts/ownership.html)
- [Kleppmann - Fencing Tokens](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
- [MCP Agent Mail](https://github.com/Dicklesworthstone/mcp_agent_mail)
- [Star Citizen Replication Layer](https://starcitizen.tools/Replication_layer)
