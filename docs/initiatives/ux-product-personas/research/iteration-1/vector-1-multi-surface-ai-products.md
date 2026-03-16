# Vector 1: Multi-Surface AI Product Design

**Question:** How do multi-surface AI products differentiate their UX across surfaces for different user types while maintaining a shared underlying system?
**Agent dispatched:** 2026-03-15

## Findings

### Anthropic's Claude: Three Surfaces, One Intelligence

- **Claude AI (Web/Mobile):** Conversational chat, 200k context, no filesystem. Targets strategists, executives, researchers. Optimized for strategic synthesis.
- **Claude Code (Terminal/IDE):** Agentic coding, 400k context, full repo access. Targets developers. Core insight: "The agentic loop, tools, and capabilities are the same everywhere. What changes is where code executes and how you interact." ([Claude Code docs](https://code.claude.com/docs/en/how-claude-code-works))
- **Claude Cowork (Desktop):** Sandboxed desktop agent for knowledge workers. Scoped folder access via Apple Virtualization Framework. Targets PMs, admins — "drowning in document chaos." Built on same Agent SDK as Code. ([VentureBeat](https://venturebeat.com/technology/anthropic-launches-cowork-a-claude-desktop-agent-that-works-in-your-files-no))
- **Shared across all three:** Same models, same reasoning. Skills portable across Code, Desktop, and Web.
- **Remote Control** bridges surfaces: start in terminal, manage from phone. ([VentureBeat](https://venturebeat.com/orchestration/anthropic-just-released-a-mobile-version-of-claude-code-called-remote))

### Microsoft Copilot: Same Graph, Surface-Specific Behavior

- All surfaces run on Microsoft Graph (documents, emails, meetings, chats). Fluent design provides visual consistency. "Dynamic Action Button" (DAB) = single unified entry point. ([Microsoft Design](https://microsoft.design/articles/behind-the-design-meet-copilot/))
- Surface-specific behavior is dramatic: Excel = exploratory modeling, Word = collaborative drafting, PowerPoint = brand compliance. Same AI, different interaction contracts. ([Microsoft Tech Community](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/from-draft-to-done-agentic-copilot-in-excel-word-and-powerpoint/4500196))
- Three-altitude UX: Immersive (full-screen, cross-app), Assistive/Embedded (in-app), Chat-first (unified entry). "Productivity unfolds at multiple altitudes." ([Microsoft Design](https://microsoft.design/articles/behind-the-design-meet-copilot/))

### GitHub Copilot: Progressive Surface Expansion

- Started as inline code completion. Expanded to Chat, CLI, GitHub.com, Agent HQ, non-developer use cases.
- Agent HQ: centralized governance for engineering managers/security teams. ([Visual Studio Magazine](https://visualstudiomagazine.com/articles/2025/10/28/github-introduces-agent-hq-to-orchestrate-any-agent-any-way-you-work.aspx))
- Non-developer expansion: explicitly markets to PMs, security pros, scrum masters. Natural language prompts + visual workflows replace code generation. ([GitHub Blog](https://github.blog/ai-and-ml/github-copilot/not-just-for-developers-how-product-and-security-teams-can-use-github-copilot/))

### Cursor: Visual Editor for Designers

- Visual Editor (Dec 2025): surfaces design system tokens, lets designers manipulate styles visually. Point-and-Prompt pattern. ([Builder.io](https://www.builder.io/blog/cursor-design-mode-visual-editing))
- Slack integration: non-developers tag @Cursor to start work without entering the IDE. Third surface (messaging-first) for stakeholders. ([Fast Company](https://www.fastcompany.com/91271112/anysphere-most-innovative-companies-2025))

### Vercel v0: One Chat, Role-Adapted Workflows

- Single conversational interface, output adapts to role. Developers get React+Tailwind. Designers get Figma-imported prototypes. PMs get functional dashboards from user stories. 4M+ users. ([Vercel blog](https://vercel.com/blog/transforming-how-you-work-with-v0))

### Atlassian Rovo: Teamwork Graph

- Maps relationships across Jira, Confluence, Bitbucket. AI spans all surfaces via graph. Specialized Dev Agents for code review. Permissions always surface-specific. ([Atlassian](https://www.atlassian.com/software/rovo))

## Key Patterns

1. **Shared Reasoning, Surface-Specific Tooling.** Model is shared. Tools define the surface.
2. **Information Density Scales with Technical Depth.** Developers see diffs, PMs see summaries, executives see synthesis.
3. **Interaction Model Reflects Task Structure.** Developers get agentic loops, designers get point-and-prompt, PMs get conversational request-response.
4. **Convention/Configuration is the Differentiation Layer.** CLAUDE.md, skills, hooks — not the AI itself — make each surface feel purpose-built.
5. **Permissions Define the Surface Boundary.** Role-based access is a UX decision, not just security.

## Implications

- Sherpa's convention layer (CLAUDE.md, skills, behavioral roles, defineConfig) IS the surface differentiator. Role-aware configuration loading creates role-specific experiences without separate apps.
- Three natural surfaces map to Sherpa: CLI/Terminal (Engineers), Studio (PMs/Leads), Conversational/MCP (Designers/Stakeholders).
- MCP is the portable tool layer — Sherpa's equivalent of Microsoft Graph.
- Skills should work across surfaces (portable). The surface determines rendering, not capability.

## Open Questions

1. How should `sherpa.config.ts` handle role-aware configuration?
2. What is Sherpa's "Dynamic Action Button" — command palette, contextual sidebar, chat panel?
3. Should Studio have "altitudes" (immersive/assistive/embedded)?
4. What's the Cowork equivalent for Sherpa?
5. Should skills declare surface compatibility?
