# Cross-Functional AI Adoption: How Engineering-First Tools Expand to Other Roles

**Question:** How do organizations adopt AI collaboration tools across functions (engineering, product, design, marketing, etc.)? What friction points emerge when engineering-first tools expand to other roles? What bridges have worked?

**Date:** 2026-03-15

---

## Key Discoveries

### 1. Engineering Dominates AI Spend, But Adoption Clusters Differently by Function

The data is unambiguous: coding/engineering captures 55% of all departmental AI spend ($4.0B of $7.3B total), dwarfing IT (10%), marketing (9%), customer success (9%), design (7%), and HR (5%). ([Menlo Ventures: State of Generative AI in the Enterprise 2025](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/))

However, **revenue impact** tells a different story. Sales and marketing accounts for 28% of total potential economic value from gen AI, followed by software engineering at 25%, customer service at 11%, and R&D at 9%. Engineering gets the tools first, but go-to-market functions may capture more business value. ([McKinsey: State of AI 2025](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai))

Adoption rates by department (median/top quartile):
- **Engineering**: 65-75% / 85-95%
- **Sales & Marketing**: 55-70% / 80-90%
- **Customer Success**: 60-75% / 85-95%
- **HR**: 45-60% / 70-85%
- **Finance & Operations**: 40-55% / 65-80%

([Worklytics: 2025 AI Adoption Benchmarks by Department](https://www.worklytics.co/resources/2025-employee-ai-adoption-benchmarks-by-department-industry))

**Pattern:** Engineering adopts first and heaviest, but the adoption ceiling across functions is converging. The gap is less about willingness and more about whether tools are designed for each function's workflows.

### 2. The Developer-to-Everyone Adoption Cascade Is Real and Documented

Multiple sources describe the same pattern: tools spread bottom-up from individual power users, not top-down from procurement.

- **Shadow AI is massive.** 27% of personal ChatGPT usage is work-related, and shadow AI adoption may represent close to 40% of total application AI spend. Tools like Cursor and n8n were adopted by "hundreds of employees" before formal enterprise procurement. ([Menlo Ventures](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/))

- **Claude Code followed this exact cascade.** What began as a specialized tool for software engineers gradually attracted product managers who wanted to prototype ideas, then designers who needed implementation tweaks, then finance professionals automating spreadsheet workflows, then marketing teams building custom analytics tools. Thousands of non-technical users decided the payoff was worth learning basic terminal commands. ([TechBuzz: Claude Code Cracks Product-Market Fit](https://www.techbuzz.ai/articles/claude-code-cracks-product-market-fit-across-industries))

- **Coding is spreading beyond engineering.** OpenAI reports that coding-related ChatGPT messages increased 36% for workers outside of technical functions. Designers lean on programming for front-end prototyping; project managers combine writing, media generation, coding, and data analysis. ([OpenAI: ChatGPT Usage and Adoption Patterns at Work](https://openai.com/business/guides-and-resources/chatgpt-usage-and-adoption-patterns-at-work/))

- **The bottom-up pattern converts to enterprise.** Many discover tools for individual use, prove their value in day-to-day work, and create bottom-up demand that eventually converts to enterprise contracts. 27% of all AI application spend comes through product-led growth motions, nearly 4x the rate in traditional software (7%). ([Menlo Ventures](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/))

**Pattern:** Adoption doesn't spread uniformly across departments. It follows champions: engineering adopts first, then adjacent roles (product, design) who collaborate directly with engineers, then progressively further functions. Each hop requires the tool to prove value in that function's native workflow.

### 3. Terminal and CLI Are the Primary Barrier for Non-Engineering Roles

The most consistent friction point across all sources is the command-line interface.

- **"The terminal looks intimidating. Black screen. Text-only interface. It feels like something only engineers should touch."** Non-engineers lack familiarity with terminal navigation, GitHub workflows, and script execution. ([ProductTalk: Claude Code for Non-Technical People](https://www.producttalk.org/claude-code-what-it-is-and-how-its-different/))

- **The CLI "scares off ~99% of non-engineer technology professionals."** When product managers, finance, legal, and operations teams need to interact with a platform, terminal literacy creates significant friction. ([Technically: Who's Afraid of the CLI?](https://technically.dev/posts/whos-afraid-of-the-cli))

- **Most Claude Code tutorials assume engineering comfort.** "Most of the other Claude Code tutorials assume that you're either an engineer who is comfortable with the terminal or you're already familiar with how it works." ([Department of Product: Claude Code for Non-Engineering Use Cases](https://departmentofproduct.substack.com/p/how-to-use-claude-code-for-non-engineering))

- **GitHub recognized this explicitly.** Non-technical team members encounter code snippets that "seem like a foreign language." Markdown syntax is "overwhelming when getting started." GitHub Actions workflows present "a learning curve" for those unfamiliar with automation tools. CLI commands with subcommands and flags are a persistent stumbling block for data analysts and security engineers. ([GitHub Blog: Not Just for Developers](https://github.blog/ai-and-ml/github-copilot/not-just-for-developers-how-product-and-security-teams-can-use-github-copilot/))

**But the barrier is surmountable when value is high enough.** Claude Code's cross-industry success demonstrates that "thousands of non-technical users decided the payoff was worth learning basic terminal commands. They watched YouTube tutorials, asked developer friends for help, and fumbled through setup processes." The value proposition justified the learning cost. ([TechBuzz](https://www.techbuzz.ai/articles/claude-code-cracks-product-market-fit-across-industries))

### 4. Beyond the Terminal: Deeper Friction Patterns for Non-Engineering Roles

The barriers go well beyond CLI anxiety:

- **Convention overhead.** Engineering-first tools assume familiarity with file-based conventions (CLAUDE.md, config files, YAML frontmatter, directory structures as data). Non-engineers use document-centric mental models (Google Docs, Notion pages, Confluence), not filesystem-centric ones.

- **"Gen AI adoption at work rarely fails because people can't write good prompts. It fails because employees struggle to see how AI fits into their real workflows."** Stanford researchers studying Google found that employees initially ask "What can this tool do?" (tool-first thinking) rather than "What problem do I have?" (problem-first thinking). The mental model shift is the real barrier, not the interface. ([HBR: To Drive AI Adoption, Build Your Teams' Product Management Skills](https://hbr.org/2026/02/to-drive-ai-adoption-build-your-teams-product-management-skills))

- **Emotional barriers.** "Desk workers often experience multiple conflicting emotions when using AI, including feeling intimidated, resourceful, guilty, and nervous simultaneously." Fear of judgment if experiments fail, concern that success constitutes "cheating," and difficulty identifying where to start without clear problem definition. ([Worklytics](https://www.worklytics.co/resources/2025-employee-ai-adoption-benchmarks-by-department-industry); [HBR](https://hbr.org/2026/02/to-drive-ai-adoption-build-your-teams-product-management-skills))

- **Trust gaps vary by role.** 44.2% of lapsed Microsoft Copilot users cite distrust of answers as the primary reason for stopping use. Auditors resist AI citing regulatory risk. Radiologists ignore AI recommendations "to protect professional pride." Insurance employees engage in "fault-finding: holding AI to much higher standards than humans." ([Creati.ai: Microsoft Copilot Adoption Challenges](https://creati.ai/ai-news/2026-02-04/microsoft-copilot-adoption-challenges/); [HBR: Overcoming Organizational Barriers to AI Adoption](https://hbr.org/2025/11/overcoming-the-organizational-barriers-to-ai-adoption))

- **Different success metrics.** Engineers measure AI value in velocity (code completion speed, PR throughput). PMs measure it in signal-to-noise (better decisions from better data). Designers measure it in constraint compliance (outputs that respect the design system). Marketing measures it in content throughput and personalization quality. A single tool can't optimize for all of these simultaneously without role-aware interfaces.

### 5. The "Silicon Ceiling": Frontline vs. Manager Adoption Gap

BCG's 2025 survey of 10,600 employees across 11 countries found a stark hierarchy gap:

- **Leaders and managers:** 75%+ use GenAI several times a week
- **Frontline employees:** Stalled at 51%, down 1 percentage point from 2023

Only one-quarter of frontline employees say they receive leadership support for AI adoption. But with strong leadership support, the share of employees who feel positive about GenAI rises from 15% to 55%. ([BCG: AI at Work 2025](https://www.bcg.com/publications/2025/ai-at-work-momentum-builds-but-gaps-remain))

**Middle management is the critical blocker.** "Managers are the gatekeepers of AI adoption, yet their authority often depends on the size of their teams. When efficiency threatens to shrink those teams, their self-interest can quietly derail otherwise valuable AI initiatives." Translation department leaders "hesitated to automate because doing so would shrink their headcount, bonuses, and prestige." At a Chinese IT firm, "programmers were 16-18% less likely to recommend AI access to their own teammates," hoarding knowledge to maintain competitive advantage. ([HBR: Overcoming Organizational Barriers to AI Adoption](https://hbr.org/2025/11/overcoming-the-organizational-barriers-to-ai-adoption))

**Pattern:** AI adoption has a hierarchy problem, not just a role problem. The biggest resistance comes not from the people who would use the tools, but from the managers whose authority is threatened by them.

### 6. Successful Bridges: How Developer-First Tools Expanded to Other Roles

Three documented strategies have worked:

**Strategy 1: Create role-specific surface areas on shared infrastructure (Figma model).**

Figma started as a designer tool, then systematically expanded: FigJam for PMs and brainstorming, Dev Mode for developers, Inspect for engineers to grab code specs directly. Each surface area was purpose-built for the role while sharing the same underlying collaborative canvas. The key insight: "Winning both designers and developers expanded the market dramatically." The handoff features made Figma useful "not just for design teams, but for entire product squads." ([How Figma Grows](https://www.howtheygrow.co/p/how-figma-grows); [Figma Product-Led Growth analysis](https://www.ptengine.com/blog/business-strategy/figma-product-led-growth-how-a-design-tool-took-over-the-world/))

**Strategy 2: Create a simplified parallel product for non-technical users (Jira model).**

Atlassian launched Jira Work Management specifically for non-technical teams, with simplified interface, business-oriented templates, and views designed so "new teams should be able to track and manage their work without any kind of training whatsoever." 20+ business project templates, list/timeline/calendar views instead of sprint boards. Shared architecture with Jira Software enables cross-department collaboration while respecting that "business teams work differently than their technical counterparts." ([Seibert Group: Jira Work Management](https://seibert.group/blog/en/jira-work-management-gap-technical-business/); [Atlassian: Jira Work Management launch](https://www.computerworld.com/article/1613711/atlassian-launches-jira-work-management-opening-its-jira-platform-to-all-business-teams.html))

**Strategy 3: Reframe the tool's identity from "code generator" to "workflow partner" (Claude Code model).**

Claude Code's expansion beyond developers happened through reframing: non-engineering guides position it as a "thought partner rather than a code generator," emphasizing document generation, analysis, and workflow automation rather than software development. Slash commands abstract complexity so users invoke `/update-competitors` without understanding underlying mechanics. Agents-as-delegation lets non-developers say "use four agents to do the last four analyses" without grasping parallel processing details. ([ProductTalk](https://www.producttalk.org/claude-code-what-it-is-and-how-its-different/); [Department of Product](https://departmentofproduct.substack.com/p/how-to-use-claude-code-for-non-engineering))

### 7. Organizations Do Form Cross-Functional Adoption Clusters

The "nodes" concept has research support. Organizations adopt AI in clusters, not uniformly:

- **Network topology matters.** HBR describes organizations as networks of interconnected nodes (teams/departments), where AI improvements in one node can create bottlenecks at adjacent nodes. A car manufacturer improved software development productivity with AI, but "the overall vehicle production network showed little improvement, as hardware manufacturing became the primary bottleneck." Organizations should "map the entire network topology -- understanding how workflows between teams and identifying potential bottlenecks." ([HBR: Overcoming Organizational Barriers to AI Adoption](https://hbr.org/2025/11/overcoming-the-organizational-barriers-to-ai-adoption))

- **Departments silo AI adoption.** Deloitte-HKU survey identified "siloed departments preventing cooperation" as the top adoption barrier among C-suite participants. Larger divisions with sophisticated AI models "show little incentive to share them with smaller units." ([HBR](https://hbr.org/2025/11/overcoming-the-organizational-barriers-to-ai-adoption))

- **Cross-department bridges accelerate diffusion.** Organizations with strong "bridging effects" through cross-departmental communication see faster AI diffusion. Digital leaders who create "open, inclusive, and trial-and-error-oriented innovation atmosphere" improve absorptive capacity and reduce technology silos. ([Tandfonline: Exploring AI Adoption in Public Organizations](https://www.tandfonline.com/doi/full/10.1080/14719037.2022.2048685))

- **Three-level adoption model.** HBR proposes thinking about AI adoption at three levels: Node (individual team workflows), Edge (inter-departmental data flows and handoffs), and Network (synchronized improvements across all connected units). Most organizations only optimize at the node level. ([HBR](https://hbr.org/2025/11/overcoming-the-organizational-barriers-to-ai-adoption))

- **The champion pattern is universal.** High-performing organizations are three times more likely to have senior leaders who demonstrate ownership of AI initiatives. But the most effective adoption comes from what McKinsey calls the "gardener's mindset" -- identifying employees, teams, or departments experimenting with new technologies and nurturing promising early results, rather than the "carpenter's mindset" of planning every detail top-down. ([McKinsey: How to Accelerate AI Adoption](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-learning-organization-how-to-accelerate-ai-adoption))

### 8. Microsoft Copilot: The Cautionary Tale of Cross-Functional AI Expansion

Microsoft's Copilot offers the clearest case study of what goes wrong when an engineering-adjacent tool tries to serve everyone:

- **Workplace conversion rate is just 35.8%.** When employees have access to both Copilot and ChatGPT, only 18% choose Copilot while 76% choose ChatGPT. When all three platforms (Copilot, ChatGPT, Claude) are available, Copilot's share falls to 8%. ([Creati.ai](https://creati.ai/ai-news/2026-02-04/microsoft-copilot-adoption-challenges/))

- **Developer vs. general adoption gap is ~300x.** GitHub Copilot has 4.7M subscribers (robust developer adoption), while M365 Copilot has ~3% penetration across 450M seats. ([Creati.ai](https://creati.ai/ai-news/2026-02-04/microsoft-copilot-adoption-challenges/))

- **"Feature fatigue" for non-technical users.** Persistent Copilot branding and unsolicited AI suggestions in Word and Outlook are "distracting rather than helpful." General staff struggle to see clear productivity value outside specialized domains. ([Creati.ai](https://creati.ai/ai-news/2026-02-04/microsoft-copilot-adoption-challenges/))

- **Brand fragmentation confuses users.** Multiple product tiers (M365 Copilot, Copilot Pro, GitHub Copilot, Security Copilot, Copilot for Service) complicate training and dilute perceived value. ([Creati.ai](https://creati.ai/ai-news/2026-02-04/microsoft-copilot-adoption-challenges/))

- **Only 6% of enterprises moved AI projects past pilot.** Most remain in "experimental mode," limiting licenses to small test groups. ([Gartner 2025 survey via Creati.ai](https://creati.ai/ai-news/2026-02-04/microsoft-copilot-adoption-challenges/))

**Lesson:** Bolting AI onto existing tools (Word, Outlook, Excel) without redesigning workflows produces shallow adoption. Users need problem-specific workflows, not AI sprinkled across general-purpose interfaces.

---

## Implications for Sherpa

These findings have direct implications for designing an AI collaboration system that serves multiple organizational roles:

### 1. The CLI/filesystem model is both Sherpa's strength and its ceiling

Sherpa's filesystem-based governance (CLAUDE.md, initiative directories, config-as-code) is powerful for engineers who think in files, branches, and directory structures. But this is the exact interface pattern that "scares off ~99% of non-engineer technology professionals." The question is not whether to keep the filesystem model -- it's whether to build role-specific surface areas on top of it (the Figma strategy) or create a simplified parallel interface (the Jira Work Management strategy).

### 2. Convention overhead is the second barrier after CLI

Beyond terminal anxiety, Sherpa's convention system (behavioral agent definitions, initiative lifecycle, proposal frontmatter, activity logs) requires understanding a framework's governance model before being productive. Non-engineers need pathways that let them be productive on day one while gradually introducing conventions as needed -- not front-loading the governance model.

### 3. The Studio app is the natural bridge

Studio already visualizes the filesystem governance data in a web UI. The research suggests the path forward is making Studio the primary interface for non-engineering roles, with the CLI remaining the power-user interface for engineers. This mirrors Figma (shared canvas, role-specific modes) and Jira (shared data model, role-specific views).

### 4. Different roles need different "views" of the same collaboration data

An engineer sees an initiative as files in a directory with YAML frontmatter. A PM should see it as a Kanban card with status, dependencies, and linked decisions. A designer should see it as a design brief with constraints and approval status. Same underlying data, different surface areas optimized for each role's mental model.

### 5. Slash commands and agents-as-delegation are the proven pattern

Claude Code's expansion to non-engineers was enabled by abstracting complexity behind slash commands. Sherpa's skill system (`/rr`, `/plan-tasks`, `/integration-review`) already follows this pattern. The opportunity is creating role-specific skills: `/pm-brief`, `/design-review`, `/marketing-brief` that produce role-appropriate outputs from the same governance data.

### 6. Middle management resistance is a real factor

If Sherpa is adopted in organizations, the framework should anticipate that managers whose authority depends on team size or information gatekeeping will resist. The HBR "growth framing" insight applies: position AI collaboration as expanding what teams can accomplish, not shrinking headcount.

### 7. Bottom-up adoption requires low-cost entry points

The research is clear that the most successful enterprise AI tools start with individual power users and spread organically. Sherpa needs a zero-friction entry point -- something a PM or designer can try in 5 minutes without installing anything, understanding conventions, or learning terminal commands.

### 8. Network-level thinking, not just node-level

Most AI tools optimize individual productivity (node level). The real value -- and Sherpa's differentiator -- is in the edges (cross-role handoffs) and network (synchronized multi-role workflows). The dispatch system, governance pipeline, and judge reviews are inherently network-level constructs. The research suggests this is where most organizations fail to capture value.

---

## Open Questions

1. **What is the right "first five minutes" experience for a non-engineer?** Claude Code's success shows non-engineers will learn terminal commands if the value is high enough. But should Sherpa require that, or should Studio provide a full web-based alternative? What's the minimum viable onboarding for a PM who wants to participate in an initiative?

2. **How do convention costs scale across roles?** Engineers absorb conventions as part of their workflow (linters, CI, code review). Do non-engineers need a fundamentally different convention model, or do they just need conventions presented differently (visual, guided, progressive disclosure)?

3. **What happens at the role boundaries?** The research shows AI adoption siloes by department. When a PM writes a proposal in Studio and an engineer implements it via CLI dispatch, what breaks at the handoff? Is the initiative directory structure legible to both roles, or does it need translation layers?

4. **Should Sherpa have role-specific "modes" or role-specific "products"?** Figma chose modes (Dev Mode within Figma). Atlassian chose products (Jira Work Management alongside Jira Software). Which model fits a governance/collaboration framework better?

5. **How do you measure success differently by role?** Engineers measure velocity. PMs measure decision quality. Designers measure system compliance. If Sherpa's judge pipeline evaluates all work through the same lens, it may systematically undervalue non-engineering contributions.

6. **What is the equivalent of "coding spreading beyond engineering" for Sherpa?** OpenAI found that coding-related messages increased 36% among non-technical workers. What is the Sherpa equivalent -- non-engineers writing behavioral agent definitions? Creating initiative proposals? Running dispatch? Which governance activities naturally appeal to non-engineering roles?

7. **How does the "gardener's mindset" apply to framework adoption?** McKinsey found top-down "carpenter's mindset" adoption fails. If Sherpa adoption should be organic and bottom-up, what seeds does the framework plant that different roles can discover and grow?
