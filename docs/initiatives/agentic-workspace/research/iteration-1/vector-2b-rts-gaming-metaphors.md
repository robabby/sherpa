# Vector 2: RTS/Gaming UI Metaphors for Agent Fleet Management

**Question:** What can real-time strategy games, MMO raid frames, and god-mode interfaces teach us about managing multiple AI agents?

## The Core Thesis

David Hoang (Proof of Concept newsletter) articulated the foundational argument: "Managing a fleet of agents is going to require multi-tasking, background tasks, and visibility of work to instruct. I believe agent interactions are going to feel like playing a Real Time Strategy (RTS) game." ([Proof of Concept](https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces))

The gaming industry spent decades and billions of dollars optimizing interfaces for humans to control many units simultaneously. These patterns are directly applicable to agent fleet management.

## RTS Command Interface Patterns

### Mission Control Dashboard (from RTS Minimap)
Hoang proposes "a real-time Mission Control: an overview of all running agents, states, and goals" as the home experience. This maps directly to the RTS minimap — a persistent, always-visible overview of the entire battlefield that lets you zoom into specific operations. ([Proof of Concept](https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces))

### Spatial Visualization (from RTS Maps)
"A figurative (or literal) map of an abstracted project overview" allowing users to zoom into specific operations — reminiscent of RTS game maps showing multiple battlefronts simultaneously. No agent management product has implemented this yet. ([Proof of Concept](https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces))

### Resource Dashboard (from RTS Resource Bars)
"In Real-Time Strategy games, you track lumber, gold, and population capacity. These same principles apply to agentic AI — just with different resources." For agents: tokens spent, concurrent sessions, context windows remaining. ([Proof of Concept](https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces))

### Asynchronous Command Loop (from RTS Macro)
"The best players aren't the ones who build the most — they're the ones who use the least to do the most." Orchestrators "operate at a higher altitude, focusing on coordination rather than execution" while agents work in parallel. The best StarCraft players issue commands then rotate attention — same pattern as checking on agents. ([Proof of Concept](https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces))

### Unit Selection and Specialization (from RTS Unit Types)
Just as RTS players deploy different unit types for different roles, agent orchestration requires model selection — matching lightweight models for summarization versus long-context models for research. "Prompting is commanding units. Model selection is unit composition. Orchestration is your battle strategy." ([Proof of Concept](https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces))

### Hotkey-Driven Command (from RTS APM)
"Learning hotkeys are vital for competitive-level play, and the ability to instantly give commands through key presses as opposed to mouse clicks cannot be understated." This directly validates the Linear Triage keyboard-driven pattern from iteration 1 research. ([Game Wisdom](https://game-wisdom.com/critical/ui-strategy-game-design))

## The "God Mode UX" Thesis

Daniel Rodriguez's "God Mode UX" article argues that a multi-agent ecosystem needs five elements reminiscent of The Sims or Age of Empires: ([Medium - sadasant](https://medium.com/sadasant/god-mode-ux-why-your-next-interface-will-look-more-like-starcraft-than-slack-12498eb274d4))

1. **Map layout** — spatial overview of agent activity
2. **Resource dashboards** — token/compute/cost tracking
3. **Task orchestration** — assignment and prioritization
4. **Event logs** — timeline of agent actions
5. **Conflict resolution** — handling competing agent modifications

Hacker News discussion (limited engagement but sharp) added: "If you've played civ management games they always devolve into spreadsheets. Resource management, throughput analysis, etc." — suggesting that highly complex agent operations may ultimately need tabular data views, not purely graphical ones. ([HN Discussion](https://news.ycombinator.com/item?id=46458231))

## MMO Raid Frame Patterns

World of Warcraft raid frames are the most optimized "many-entity health dashboard" ever built, refined over 20 years of iteration. Key patterns:

### Health Bars as Agent Status
Each raid member gets a compact bar showing health (= progress), active buffs/debuffs (= status indicators), and role icon (= agent type). 40 entities visible simultaneously in a grid. ([Icy Veins Raid UI Guide](https://www.icy-veins.com/wow/advanced-raid-ui-setup-guide))

### Color-Coded Priority
Debuffs are color-coded by type (magic = blue, curse = purple, poison = green, disease = brown), enabling instant visual triage. This maps to agent status: working = green, blocked = amber, failed = red, waiting = blue. ([CurseForge - Enhanced Raid Frames](https://www.curseforge.com/wow/addons/enhanced-raid-frames))

### Role-Specific Layouts
Healers position raid frames centrally for fastest reaction. DPS and tanks push them to the periphery. The layout adapts to the operator's role — a pattern directly applicable to different Sherpa user roles. ([MMO Champion - Healer UI](https://www.mmo-champion.com/threads/2524877-Elements-of-a-proper-healer-UI))

### Aura Indicators with Countdown
Each buff/debuff shows presence, countdown time, and stack size in configurable layouts. This maps perfectly to agent task progress: started time, estimated completion, retry count. ([CurseForge - RaidFrameSettings](https://www.curseforge.com/wow/addons/raid-frame-settings/files/5824497))

### Information Density Control
Proper raid frames show "only essential buffs, debuffs, and incoming healing" — progressive disclosure applied to a dense real-time dashboard. The user configures what they want to see, not the system. ([Luke Bott - WoW Raid UI](https://lukebott.com/enhancing-your-wow-raid-ui-best-addons-interface-settings/))

## The Conductor-to-Orchestrator Evolution

Addy Osmani (Google Chrome team, O'Reilly) frames the evolution in three stages: ([Addy Osmani Blog](https://addyosmani.com/blog/future-agentic-coding/))

| Mode | Interaction | Tools |
|------|------------|-------|
| **Coder** | Write code directly | IDE, compiler |
| **Conductor** | Single agent, synchronous, micro-level | Cursor inline chat, Claude Code CLI |
| **Orchestrator** | Multiple agents, asynchronous, macro-level | GitHub Mission Control, Cursor Background Agents |

The orchestrator gives each agent (A, B, C) a prompt or issue description, then steps back. "You get perhaps three PRs: one for backend, one for frontend, one for tests." The human role becomes: select tasks, evaluate outputs, ensure quality gates. ([O'Reilly Radar](https://www.oreilly.com/radar/conductors-to-orchestrators-the-future-of-agentic-coding/))

## The Spreadsheet Inevitability

The HN commenter's observation deserves emphasis: complex management games (Europa Universalis, Stellaris, EVE Online) all evolve into spreadsheet-driven interfaces. This suggests that while spatial/visual metaphors work for initial overview, power users will want:
- Sortable/filterable tables of agent sessions
- Token usage columns with totals
- Batch selection and bulk operations
- Export to CSV for analysis

This aligns with iteration 1's finding that the Pipeline View beats the Board View.

## Implications for Sherpa Studio

1. **Minimap equivalent** — a persistent compact overview of all active agents/sessions visible on every page (sidebar widget or header bar)
2. **Raid frame grid** — compact per-agent status cards showing progress, state, and type, viewable 5-10 at a time
3. **Keyboard-first** — hotkeys for cycling between agents, approving/rejecting, and navigating (already validated by RTS APM research + Linear Triage)
4. **Resource bar** — persistent token/cost indicator, not per-request but aggregate
5. **Configurable density** — let users choose how much detail per agent card (MMO addon customization model)
6. **Tabular power view** — sortable session list for power users, not just cards
7. **Role-based layouts** — different default views for different behavioral roles (product owner sees strategic overview, engineer sees execution detail)

## Sources

- [David Hoang - RTS Games and AI Interfaces](https://www.proofofconcept.pub/p/real-time-strategy-games-and-ai-interfaces)
- [Daniel Rodriguez - God Mode UX](https://medium.com/sadasant/god-mode-ux-why-your-next-interface-will-look-more-like-starcraft-than-slack-12498eb274d4)
- [HN Discussion - God Mode UX](https://news.ycombinator.com/item?id=46458231)
- [Addy Osmani - Future of Agentic Coding](https://addyosmani.com/blog/future-agentic-coding/)
- [Addy Osmani - Conductors to Orchestrators (O'Reilly)](https://www.oreilly.com/radar/conductors-to-orchestrators-the-future-of-agentic-coding/)
- [Addy Osmani - Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/)
- [Game Wisdom - UI Strategy Game Design](https://game-wisdom.com/critical/ui-strategy-game-design)
- [Icy Veins - Advanced Raid UI Setup](https://www.icy-veins.com/wow/advanced-raid-ui-setup-guide)
- [Luke Bott - WoW Raid UI](https://lukebott.com/enhancing-your-wow-raid-ui-best-addons-interface-settings/)
- [MMO Champion - Healer UI Elements](https://www.mmo-champion.com/threads/2524877-Elements-of-a-proper-healer-UI)
- [CurseForge - Enhanced Raid Frames](https://www.curseforge.com/wow/addons/enhanced-raid-frames)
- [CurseForge - RaidFrameSettings](https://www.curseforge.com/wow/addons/raid-frame-settings/files/5824497)
