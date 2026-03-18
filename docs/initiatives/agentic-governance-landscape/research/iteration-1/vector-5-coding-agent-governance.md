# Coding Agent Governance — Landscape Research

> **AI-generated** 2026-03-17 · Awaiting human review
> Sources: agentic-governance-landscape

Research covering the developer-tier of Vector 1 (Vendor Landscape), Vector 3 (Market Segmentation — developer teams), and Vector 4 (Product Category Taxonomy) from the initiative proposal. Maps governance capabilities across seven major coding agents as of March 2026.

---

## Key Discoveries

### 1. Cursor Has the Most Mature Governance Stack Among Coding Agents

Cursor Enterprise ships the broadest set of governance features of any coding IDE:

- **Hooks system** (shipped October 2025) provides lifecycle interception points: `beforeShellExecution`, `beforeMCPExecution`, `afterMCPExecution`, `beforeReadFile`, `afterFileEdit`, `stop`. These enable external scripts to observe, block, or modify agent behavior at runtime. ([Source](https://cursor.com/blog/hooks-partners))
- **Team Rules** with enforcement hierarchy: Team Rules > Project Rules > User Rules. Admins can mark rules as "enforced" so team members cannot disable them. Rules are managed via dashboard and apply across all repositories. ([Source](https://cursor.com/docs/rules))
- **Audit logs** tracking authentication, user management, API key operations, privacy settings, team rules lifecycle. Logs stream to SIEM platforms (Splunk, Datadog, Sumo Logic), webhooks, S3, or Elasticsearch. Events arrive as JSON with timestamp, event ID, team ID, IP, email. Key limitation: **audit logs do not capture agent responses or generated code content**. ([Source](https://cursor.com/docs/enterprise/compliance-and-monitoring))
- **Agent Trace** — an open specification (RFC, v0.1.0, January 2026) for tracking AI-generated code attribution. JSON-based trace records connect code ranges to conversations and contributors. Classifies contributions as `human`, `ai`, `mixed`, or `unknown`. Vendor-neutral, multi-VCS (Git, Jujutsu, Mercurial). ([Source](https://github.com/cursor/agent-trace))
- **Cursor Blame** — AI-aware git blame showing human vs. AI code attribution per commit, distinguishing Tab completions, agent runs (by model), and human edits. ([Source](https://forum.cursor.com/t/cursor-2-4-cursor-blame/149405/1))
- **AI Code Tracking API** — per-commit AI usage attribution and metrics available programmatically for enterprise. ([Source](https://cursor.com/docs/account/teams/ai-code-tracking-api))
- **Security partner ecosystem** built on hooks: Oasis Security (least-privilege enforcement + audit trails), Semgrep (real-time vulnerability scanning), Snyk (prompt injection detection), Endor Labs (malicious dependency interception), 1Password (secrets management), MintMCP (MCP server inventory + data scanning), Runlayer (centralized MCP broker). ([Source](https://cursor.com/blog/hooks-partners))
- **Additional controls**: Privacy Mode (zero data retention), repository blocklist, model access restrictions, sandbox mode (terminal isolation), auto-run/network restrictions. ([Source](https://cursor.com/docs/enterprise))

### 2. GitHub Copilot Has Enterprise-Grade Admin But Governance Gaps for Agents

GitHub's Enterprise AI Controls (GA February 2026) represent the most IT-admin-oriented governance for a coding tool:

- **Agent Control Plane** — consolidated admin workspace for all AI-related policies. Includes agent activity visibility with `agent_session.task` audit events capturing when sessions start, complete, or fail. Agents marked in audit logs when acting on behalf of users. ([Source](https://github.blog/changelog/2026-02-26-enterprise-ai-controls-agent-control-plane-now-generally-available/))
- **Custom Agent Standards** — enterprise-wide agent definitions in `.github/agents/*.md`, protected by 1-click push rules preventing unauthorized edits. Version-controlled governance. ([Source](https://github.blog/changelog/2026-02-26-enterprise-ai-controls-agent-control-plane-now-generally-available/))
- **MCP Enterprise Allowlists** (Preview) — centralized allowlist of approved MCP servers. Not yet GA. ([Source](https://github.com/orgs/community/discussions/169533))
- **Content exclusions** — admins can exclude files/paths from Copilot context. However: **content exclusion does not work with Copilot coding agent, Agent mode, or CLI**. This is a significant governance gap — the most autonomous modes have the fewest content controls. ([Source](https://docs.github.com/en/copilot/concepts/context/content-exclusion))
- **Custom instructions** via `.github/copilot-instructions.md` — but **not honored in Agent and Edit modes**. Same gap as content exclusions. ([Source](https://copilot-instructions.md/))
- **Policy management** at org and enterprise levels via REST API. Enterprise owners set global policies or delegate to org owners. ([Source](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/manage-policies))
- **Roadmap signals**: GitHub plans to add more comprehensive session activity coverage, programmatic access to agent activity, granularity in AI Controls policies, and more MCP governance options. ([Source](https://github.blog/changelog/2026-02-26-enterprise-ai-controls-agent-control-plane-now-generally-available/))

### 3. Claude Code Governance Is Convention-Based with Enterprise Overlay

Claude Code has the deepest filesystem-based governance of any coding agent, plus a growing enterprise layer:

- **CLAUDE.md system** — hierarchical project instructions loaded automatically per session. Multiple levels: root CLAUDE.md, app-specific, module-specific, plus `.claude/rules/` with glob-based auto-loading. This is the closest parallel to Sherpa's convention-based governance in the market. ([Source](https://code.claude.com/docs/en/settings))
- **Hooks** — four lifecycle points: `PreToolUse`, `PostToolUse`, `Notification`, `Stop`. Managed hooks can be locked by enterprise admins (`allowManagedHooksOnly`). HTTP hook URL allowlists configurable at any settings level. ([Source](https://www.anthropic.com/news/claude-code-on-team-and-enterprise))
- **Permission system** — three modes with allow/deny rules per tool: `Read(./src/**)`, `Bash(git *)`, `deny: Read(./.env)`. Enterprise managed policies (`managed-settings.json`) cannot be overridden by users. ([Source](https://platform.claude.com/docs/en/agent-sdk/permissions))
- **Compliance API** — real-time programmatic access to usage data and conversation content. Enables continuous monitoring and automated policy enforcement. Available on Enterprise plan. ([Source](https://www.anthropic.com/news/claude-code-on-team-and-enterprise))
- **Enterprise controls**: SSO, seat management, spending limits (org and user level), usage analytics (lines of code accepted, suggestion accept rate, usage patterns). ([Source](https://www.anthropic.com/news/claude-code-on-team-and-enterprise))
- **Community governance patterns**: The HackerNoon article documents a four-hook governance stack achieving 90%+ skill activation (up from ~25% baseline) — SessionStart for context, UserPromptSubmit for forced skill evaluation, PreToolUse for safety blocking, Stop for completion closure. This validates that hooks + conventions can form an effective governance layer. ([Source](https://hackernoon.com/how-to-build-a-governance-layer-for-claude-code-with-hooks-skills-and-agents))

### 4. Devin Operates on Human-in-the-Loop Checkpoints, Not Conventional Governance

Devin is the most autonomous coding agent and has the simplest governance model:

- **Two non-negotiable checkpoints**: (1) Planning Checkpoint — human reviews and approves Devin's step-by-step plan before code execution. (2) PR Checkpoint — human performs final code review before merge. ([Source](https://www.wwt.com/blog/empowering-the-enterprise-a-strategic-view-of-devin-ai-and-the-autonomous-workforce))
- **Playbooks** — reusable instruction templates for repeated task types. Stored in Settings > Knowledge. Schedulable (configure frequency, prompt, playbook). API access for session management and Knowledge CRUD. ([Source](https://docs.devin.ai/essential-guidelines/instructing-devin-effectively))
- **Enterprise RBAC** — custom roles with specific permissions, assignable to users or IdP groups. Enterprise account admins manage members and access across multiple organizations. ([Source](https://docs.devin.ai/enterprise/security-access/custom-roles))
- **SSO**: SAML, Okta, Azure AD with OIDC. ([Source](https://docs.devin.ai/enterprise/security-access/sso/saml))
- **Sandbox isolation** — all code execution in secured sandboxed environment. Dedicated SaaS deployments with tenant-isolated data storage. ([Source](https://docs.devin.ai/enterprise/security-access/security/enterprise-security))
- **SOC 2 Type II** certified since September 2024. Zero training on customer data. ([Source](https://docs.devin.ai/enterprise/security-access/security/enterprise-security))
- **No audit log documentation found** — enterprise audit trail capabilities are not documented in public docs. The 2025 performance review acknowledges "human review is still necessary, because code quality is not straightforwardly verifiable." ([Source](https://cognition.ai/blog/devin-annual-performance-review-2025))

### 5. Windsurf Has Enterprise Controls But Is In Transition

After Cognition acquired Windsurf in July 2025, the platform is evolving:

- **Rules system**: `.windsurfrules` file in project root for conventions. Global rules in user settings. Rules limited to 6,000 characters each, 12,000 total. Global rules take priority if limits exceeded. ([Source](https://docs.windsurf.com/windsurf/cascade/cascade))
- **Enterprise audit**: Every accepted autocomplete suggestion and chat conversation logged to database for audit. Enterprise can trail all AI generations. ([Source](https://harini.blog/2025/07/02/windsurf-detailed-enterprise-security-readiness-report/))
- **MDM policy deployment**: Enterprises can push rules and workflow files to user machines via MDM. Custom commands execute at key Cascade workflow points for auditing. ([Source](https://docs.windsurf.com/plugins/accounts/rbac-role-management))
- **Three deployment modes**: Cloud, Hybrid, Self-Hosted. SAML SSO, RBAC, audit logs across all tiers. ([Source](https://windsurf.com/security))
- **Compliance**: SOC 2 Type II, FedRAMP High, IL5 authorization, HIPAA BAA. Zero data retention default for paid seats. ([Source](https://windsurf.com/security))
- **Government tier**: Windsurf Government (March 2025) for FedRAMP/IL5 environments. ([Source](https://harini.blog/2025/07/02/windsurf-detailed-enterprise-security-readiness-report/))

### 6. Amazon Q Developer Inherits AWS Governance Infrastructure

Amazon Q Developer governance is largely delegated to existing AWS services:

- **IAM integration**: Q Developer operates within IAM permissions. If a developer can only read EC2 resources, Q can only read EC2 resources. No separate agent permissions — inherits the user's IAM boundary. ([Source](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/security-iam.html))
- **Service Control Policies (SCPs)**: Org-level controls over which Q Developer features are available. ([Source](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/security_iam_manage-access-with-policies.html))
- **Security scanning**: Detects vulnerabilities (resource leaks, SQL injection, XSS) and secrets (hardcoded passwords, connection strings) in code. ([Source](https://aws.amazon.com/blogs/devops/code-security-scanning-with-amazon-q-developer/))
- **Code review**: Automated code review capability that scans for security issues and code quality problems. ([Source](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/code-reviews.html))
- **CloudTrail logging**: All Q Developer API calls logged for audit. ([Source](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/security.html))
- **Compliance**: Eligible for SOC, ISO, HIPAA, PCI environments depending on AWS configuration. ([Source](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/security.html))
- **No project-level rules system**: Q Developer has no equivalent of .cursorrules, CLAUDE.md, or .windsurfrules. Governance is purely at the infrastructure level.

### 7. Sourcegraph Cody: Shrinking Footprint, Enterprise Context Controls

Cody is narrowing to enterprise-only after closing Free/Pro plans in July 2025:

- **Context filters**: Admin-controlled repository access policies. Multi-repo vector embedding indexing for context. ([Source](https://sourcegraph.com/docs/cody/enterprise/features))
- **Guardrails** (deprecated): Exact string matching against 290K open-source repos to prevent matching code. Feature was deprecated. ([Source](https://sourcegraph.com/docs/cody/enterprise/features))
- **Enterprise controls**: Self-hosted deployment, SSO, RBAC, audit logs, zero data retention for LLM inferences, no training on customer code. ([Source](https://sourcegraph.com/blog/cody-is-enterprise-ready))
- **Compliance**: SOC 2 Type II, ISO 27001:2022, CCPA, GDPR. Uncapped IP indemnification. ([Source](https://sourcegraph.com/enterprise))
- **Strategic shift**: Sourcegraph is pivoting toward "Amp" as their agentic tool, with Cody becoming a narrower autocomplete/chat product. Governance investment may shift to Amp. ([Source](https://sourcegraph.com/blog/cody-is-enterprise-ready))

### 8. AI-Generated Code Provenance Is an Emerging Governance Category

Multiple tools and standards are emerging specifically for tracking which code is AI-generated:

- **Cursor Agent Trace** (RFC v0.1.0, January 2026): Open specification for AI code attribution. Vendor-neutral, multi-VCS, line-level granularity with `human`/`ai`/`mixed`/`unknown` classification. ([Source](https://github.com/cursor/agent-trace))
- **Git AI** (v1.0): Vendor-agnostic CLI that wraps git to tag AI-generated code at creation. Uses PreEdit/PostEdit checkpoints stored as git notes. Survives rebase, cherry-pick, merge. Works with Claude Code, Cursor, Copilot. "800-1000x faster" than repository-sized scanning. ([Source](https://usegitai.com/blog/introducing-git-ai))
- **Tabnine Provenance**: CI/CD pipeline integration tracking origins of generated code with provenance bills of materials (PBOMs). ([Source](https://www.tabnine.com/blog/from-suggestion-to-source-why-provenance-and-attribution-belong-in-your-ci-cd-pipeline/))
- **AI Provenance Protocol (APP)**: Open standard for verifying AI-generated content with machine-readable format tracking model identity, inputs, and human review. Designed for EU AI Act Article 50 compliance. ([Source](https://github.com/AI-Provenance-Protocol/ai-provenance-protocol))
- **Regulatory driver**: EU AI Act Article 50 (enforceable August 2, 2026) requires AI providers to mark output in machine-readable, detectable format. This will make provenance tracking mandatory, not optional.

### 9. Code Review Tools Are Becoming a Governance Layer

AI-powered code review is emerging as the quality gate for AI-generated code:

- **CodeRabbit**: Automated PR review focused on diff-level feedback. 46% accuracy on runtime bugs. Free for open source, $12-24/dev/month. Limited to current repo context — no cross-repo awareness. ([Source](https://www.coderabbit.ai/))
- **Qodo**: Agentic code integrity platform. 15+ automated workflows (bug detection, test coverage, documentation, changelog). Cross-repo indexing across thousands of repos. Enterprise governance features: coding standards enforcement, architecture rules, compliance policies on every change. $30-45/user/month. ([Source](https://www.qodo.ai/))
- **Market context**: PR volume up 29% YoY due to AI coding, but manual review can't keep pace. Multi-agent review workflows (one agent writes, another critiques, another tests, another validates compliance) are normalizing. ([Source](https://www.coderabbit.ai/blog/2025-was-the-year-of-ai-speed-2026-will-be-the-year-of-ai-quality))

### 10. Regulated Enterprises Are Deploying Coding Agents Under Existing Governance Frameworks

- **Goldman Sachs** deployed Devin across its 12,000-developer workforce (July 2025). Governance approach: human supervision of all Devin tasks, human code review before merge, enterprise compliance rules apply to AI-generated code same as human code. Hundreds of Devin instances ramping to thousands "subject to governance." ([Source](https://www.cnbc.com/2025/07/11/goldman-sachs-autonomous-coder-pilot-marks-major-ai-milestone.html))
- **Goldman internal platform**: 10,000 employees with AI tool access, company-wide rollout "subject to governance" with human reviewer of chatbot responses and employee training on hallucination risks. ([Source](https://www.pymnts.com/artificial-intelligence-2/2025/inside-goldman-sachs-big-bet-on-ai-at-scale/))
- **Cognizant + Cognition** (January 2026): Integrating Devin into delivery frameworks with "security, governance and operational rigor required by large organizations." ([Source](https://news.cognizant.com/2026-01-28-Cognizant-and-Cognition-Partner-to-Scale-Autonomous-Software-Engineering-and-Deliver-Business-Value-Across-Enterprise-Operations))
- **Infosys + Cognition**: Deploying Devin within customer environments, providing "ongoing operation, governance, and optimization" via curated knowledge and playbooks. ([Source](https://cognition.ai/blog/infosys-cognition))
- **Enterprise governance gap**: Financial institutions' AI infrastructure for responsible deployment and testing/validation of AI outputs is still "embryotic." Enterprise-wide standards and controls for monitoring, measurement, analysis and model evaluation are in early stages. ([Source](https://qa-financial.com/goldman-sachs-joins-jpmorgan-and-morgan-stanley-in-race-to-adopt-genai/))

---

## Feature Matrix

| Feature | Cursor | GitHub Copilot | Claude Code | Devin | Windsurf | Amazon Q | Cody |
|---------|--------|----------------|-------------|-------|----------|----------|------|
| **Admin dashboard** | Yes | Yes (AI Controls tab) | Yes | Yes | Yes | AWS Console | Yes |
| **SSO/SAML** | Yes | Yes | Yes | Yes (Okta, Azure AD) | Yes | AWS IAM/SSO | Yes |
| **RBAC** | Yes | Yes (custom roles) | Partial (expanding) | Yes (custom roles) | Yes | IAM policies | Yes |
| **Audit logs** | Yes (no code content) | Yes (agent sessions) | Yes (Compliance API) | Not documented | Yes (all AI generations) | CloudTrail | Yes |
| **Project-level rules** | `.cursor/rules/` + Team Rules | `.github/copilot-instructions.md`* | `CLAUDE.md` + `.claude/rules/` | Playbooks + Knowledge | `.windsurfrules` | None | None |
| **Enforced team rules** | Yes (can't be disabled) | Custom agent standards + push rules | Managed policies (can't override) | Org-level Knowledge | MDM-deployed rules | SCPs | Admin config |
| **Lifecycle hooks** | 6+ hook types | Not available | 4 hook types | None | Custom commands at workflow points | None | None |
| **Content exclusions** | Repository blocklist | Yes (but NOT for agent mode) | Permission deny rules | N/A (sandbox) | Not documented | IAM boundaries | Context filters |
| **AI code attribution** | Agent Trace + Cursor Blame | Not available | Not available | Not available | Not available | Not available | Not available |
| **Security scanning** | Via partners (Semgrep, Snyk) | Built-in code scanning | Via hooks | Not documented | Not documented | Built-in (vulnerabilities + secrets) | Guardrails (deprecated) |
| **Human review gates** | Via hooks | PR review | Via hooks | Two mandatory checkpoints | Via custom commands | Code review feature | Not documented |
| **Model restrictions** | Yes (per user/team) | Policy-based | Permission system | N/A (proprietary) | Not documented | N/A (proprietary) | Admin config |
| **MCP governance** | Via hooks + partners | Allowlist (preview) | Managed settings | N/A | Not documented | N/A | N/A |
| **Data retention control** | Privacy Mode (zero retention) | Enterprise setting | Enterprise setting | Zero training default | Zero retention default | AWS config | Zero retention |
| **Compliance certs** | SOC 2, GDPR | Enterprise compliance | SOC 2 | SOC 2 | SOC 2, FedRAMP High, IL5 | SOC, ISO, HIPAA, PCI | SOC 2, ISO 27001 |
| **Self-hosted option** | No | GitHub Enterprise Server | Terminal-based (local) | Dedicated SaaS | Yes (3 deployment modes) | AWS account | Yes |

*GitHub Copilot custom instructions are **not honored in Agent and Edit modes** — the most autonomous modes.

---

## Analysis: Where Governance Actually Lives

### Three layers of coding agent governance are emerging:

**Layer 1: Platform-native controls (inside the agent)**
What the coding agent vendor provides. Ranges from comprehensive (Cursor hooks + Team Rules + audit) to minimal (Amazon Q delegates to AWS). The vendor controls the scope of what's governable.

**Layer 2: External enforcement (around the agent)**
Security partners wrapping the agent runtime. Cursor's hook ecosystem (Oasis, Semgrep, Snyk, Endor Labs, 1Password, MintMCP, Runlayer) is the most developed example. GitHub's agent control plane is a platform-level version. These add governance that the agent vendor doesn't provide natively.

**Layer 3: Convention and process governance (above the agent)**
Project rules, behavioral constraints, review gates, initiative lifecycle. This is where Sherpa operates. CLAUDE.md, .cursorrules, and .windsurfrules are primitive versions of this layer — they encode conventions but don't enforce lifecycle, quality gates, or behavioral constraints.

### The governance gap

No coding agent provides:
- **Behavioral constraints** — disposition, quality bar, operational approach as agent governance primitives
- **Initiative lifecycle** — structured proposal > plan > execute > review > integrate workflow for agent work
- **Quality gates with scorecards** — systematic evaluation criteria applied to agent output
- **Cross-agent governance** — conventions that work regardless of which coding agent is used
- **Filesystem-native audit trail** — git history as the audit log, not a separate system

Every coding agent's governance is siloed to that agent. Cursor hooks don't govern Claude Code sessions. GitHub policies don't apply to Cursor. Devin playbooks don't transfer to Windsurf. There is no governance layer that spans coding agents.

---

## Implications for Sherpa

### Sherpa's position: the cross-agent convention layer

1. **Sherpa governs the work, not the tool.** Every coding agent in this study governs what the agent *can access* (content exclusions, permissions, MCP allowlists). None govern what the agent *should do* (behavioral constraints, quality standards, lifecycle process). Sherpa's behavioral agent system, initiative lifecycle, and Planner/Worker/Judge pipeline address the "should do" layer.

2. **Convention portability is a real differentiator.** `.claude/rules/`, `.cursor/rules/`, `.windsurfrules`, `.github/copilot-instructions.md` — every agent has its own convention format. Sherpa's conventions (CLAUDE.md, behavioral roles, initiative directories) are the governance artifacts. Agent-specific rule files are the delivery mechanism. A `sherpa sync` command that generates agent-specific rule files from Sherpa conventions would make Sherpa the source of truth across agents.

3. **The hooks ecosystem validates Sherpa's approach.** Cursor's hook partners (Oasis, Semgrep, Snyk, etc.) prove that external governance wrapping the agent runtime is viable and valued. Sherpa's hooks serve the same purpose but at the convention layer (behavioral enforcement, quality gates) rather than the security layer (access control, vulnerability scanning). These are complementary.

4. **AI code provenance aligns with Sherpa's provenance convention.** Cursor's Agent Trace, Git AI, and the EU AI Act's Article 50 requirements are creating a provenance tracking category. Sherpa already has provenance metadata in its documents (`authored-by`, `reviewed-by`, `maintained-by`). Extending this to code-level provenance (which agent generated which code, under which behavioral constraints, reviewed by which judge) would be a natural evolution.

5. **Enterprise governance is IT-admin-facing. Sherpa is developer-facing.** GitHub AI Controls, Cursor Enterprise dashboard, and AWS IAM are designed for IT administrators managing fleets. Sherpa's governance lives in the developer workflow — same directory as the code, same git history, same review process. These serve different buyers and can coexist.

6. **The "no governance" segment is underserved.** Goldman Sachs governance approach boils down to "human reviews Devin's PRs." Cognizant and Infosys provide "governance" via consulting playbooks. The enterprise governance infrastructure described in vendor docs is aspirational — actual deployed governance at most enterprises is code review + hope. Sherpa's convention-based approach is implementable today without procurement.

### Integration opportunities

- **Cursor hooks**: Sherpa could provide a hook that enforces behavioral constraints at Cursor's `beforeShellExecution` and `beforeMCPExecution` lifecycle points
- **GitHub custom agents**: Sherpa behavioral role definitions could generate `.github/agents/*.md` files for Copilot
- **Agent Trace**: Sherpa's provenance convention could consume Agent Trace records to link code provenance to governance provenance
- **Compliance API**: Claude Code's Compliance API could feed Sherpa's activity logs with enterprise usage data

---

## Open Questions

1. **Will agent-specific rule formats converge?** `.cursorrules`, `CLAUDE.md`, `.windsurfrules`, `.github/copilot-instructions.md` are four incompatible formats. Will MCP or another protocol standardize project-level AI instructions, or will fragmentation persist?

2. **Does Cursor's Agent Trace become an actual standard?** It's RFC v0.1.0 from January 2026. If adopted broadly, it becomes the provenance format. If not, Git AI or the AI Provenance Protocol may fill the gap. The EU AI Act deadline (August 2026) creates urgency.

3. **How do enterprises actually govern multi-agent workflows?** Goldman uses Devin, presumably alongside Copilot and internal tools. No public documentation describes how enterprises coordinate governance across multiple coding agents.

4. **Will GitHub's agent control plane expand to govern non-GitHub agents?** GitHub's AI Controls currently govern Copilot and third-party agents within GitHub's platform. If GitHub positions this as a broader agent governance platform, it could compete with standalone governance layers.

5. **Is "code review as governance" sufficient for regulated industries?** Goldman's approach (human reviews AI PRs) is the de facto governance model. But EU AI Act, financial regulators, and compliance teams may require structured audit trails, not just PR approvals. What triggers the shift from informal to formal governance?

6. **What is the actual adoption rate of enterprise governance features?** Every vendor ships enterprise governance. How many enterprises actually configure audit logs, enforce team rules, or use compliance APIs? The 84% AI tool adoption vs. 18% formal governance policy gap (from Augment Code's data) suggests massive under-governance.

7. **How does Windsurf's acquisition by Cognition (Devin's parent) affect governance?** Cognition now owns both an autonomous agent (Devin) and an IDE (Windsurf). Will governance unify across them? Will Devin's playbooks become Windsurf features?

---

## Sources

All claims sourced inline. Primary documentation accessed March 17, 2026:

**Cursor**
- Cursor Enterprise: https://cursor.com/docs/enterprise
- Cursor Compliance & Monitoring: https://cursor.com/docs/enterprise/compliance-and-monitoring
- Cursor Rules: https://cursor.com/docs/rules
- Cursor Hooks Partners: https://cursor.com/blog/hooks-partners
- Agent Trace Specification: https://github.com/cursor/agent-trace
- AI Code Tracking API: https://cursor.com/docs/account/teams/ai-code-tracking-api

**GitHub Copilot**
- Enterprise AI Controls GA: https://github.blog/changelog/2026-02-26-enterprise-ai-controls-agent-control-plane-now-generally-available/
- Content Exclusion: https://docs.github.com/en/copilot/concepts/context/content-exclusion
- Custom Instructions: https://copilot-instructions.md/
- Policy Management: https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/manage-policies
- MCP Allowlist: https://docs.github.com/en/copilot/reference/mcp-allowlist-enforcement

**Claude Code**
- Claude Code Enterprise: https://www.anthropic.com/news/claude-code-on-team-and-enterprise
- Settings: https://code.claude.com/docs/en/settings
- Permissions: https://platform.claude.com/docs/en/agent-sdk/permissions
- Community Governance Layer: https://hackernoon.com/how-to-build-a-governance-layer-for-claude-code-with-hooks-skills-and-agents

**Devin**
- Enterprise Security: https://docs.devin.ai/enterprise/security-access/security/enterprise-security
- Custom Roles: https://docs.devin.ai/enterprise/security-access/custom-roles
- 2025 Performance Review: https://cognition.ai/blog/devin-annual-performance-review-2025
- Goldman Sachs Deployment: https://www.cnbc.com/2025/07/11/goldman-sachs-autonomous-coder-pilot-marks-major-ai-milestone.html

**Windsurf**
- Enterprise Security Report: https://harini.blog/2025/07/02/windsurf-detailed-enterprise-security-readiness-report/
- Security: https://windsurf.com/security
- RBAC: https://docs.windsurf.com/plugins/accounts/rbac-role-management

**Amazon Q Developer**
- Security: https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/security.html
- IAM: https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/security-iam.html
- Code Review: https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/code-reviews.html
- Security Scanning: https://aws.amazon.com/blogs/devops/code-security-scanning-with-amazon-q-developer/

**Sourcegraph Cody**
- Enterprise Features: https://sourcegraph.com/docs/cody/enterprise/features
- Enterprise Ready: https://sourcegraph.com/blog/cody-is-enterprise-ready

**Code Provenance**
- Git AI: https://usegitai.com/blog/introducing-git-ai
- AI Provenance Protocol: https://github.com/AI-Provenance-Protocol/ai-provenance-protocol
- Tabnine Provenance: https://www.tabnine.com/blog/from-suggestion-to-source-why-provenance-and-attribution-belong-in-your-ci-cd-pipeline/

**Code Review as Governance**
- CodeRabbit: https://www.coderabbit.ai/
- Qodo: https://www.qodo.ai/
- CodeRabbit 2026 Quality: https://www.coderabbit.ai/blog/2025-was-the-year-of-ai-speed-2026-will-be-the-year-of-ai-quality

**Enterprise & Regulatory**
- Forrester Agent Control Plane: https://www.forrester.com/blogs/announcing-our-evaluation-of-the-agent-control-plane-market/
- NIST AI Agent Standards: https://www.pillsburylaw.com/en/news-and-insights/nist-ai-agent-standards.html
- Kyndryl Policy-as-Code: https://www.kyndryl.com/us/en/about-us/news/2026/02/policy-as-code-agentic-ai-governance
- Goldman Sachs AI Strategy: https://www.pymnts.com/artificial-intelligence-2/2025/inside-goldman-sachs-big-bet-on-ai-at-scale/
- Cognizant + Cognition: https://news.cognizant.com/2026-01-28-Cognizant-and-Cognition-Partner-to-Scale-Autonomous-Software-Engineering-and-Deliver-Business-Value-Across-Enterprise-Operations
