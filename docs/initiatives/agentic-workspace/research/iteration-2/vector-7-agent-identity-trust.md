# Vector 10: Agent Identity, Authentication, and Trust Models

**Research question:** When AI agents act autonomously (writing code, making API calls, creating PRs, sending messages), what identity, authentication, and trust models are emerging? How do you verify an agent is authorized to act? What capability-based security models exist?

**Date:** 2026-03-12

---

## Key Discoveries

### 1. Agent Identity Is Now a Standards-Track Problem

Three parallel standards efforts are converging on agent identity in early 2026:

- **NIST AI Agent Standards Initiative** (Feb 2026): Three pillars — industry-led standards, open-source protocol development, and research in AI agent security and identity. NIST's NCCoE released a concept paper "Accelerating the Adoption of Software and AI Agent Identity and Authorization" (comments due April 2, 2026) exploring how existing IAM standards (OAuth 2.0, SPIFFE) apply to AI agents. A separate RFI on AI Agent Security closed March 9, 2026. ([NIST CAISI](https://www.nist.gov/caisi/ai-agent-standards-initiative), [NCCoE Concept Paper](https://www.nccoe.nist.gov/projects/software-and-ai-agent-identity-and-authorization), [Federal Register RFI](https://www.federalregister.gov/documents/2026/01/08/2026-00206/request-for-information-regarding-security-considerations-for-artificial-intelligence-agents))

- **IETF AAuth (Agentic Authorization)**: An OAuth 2.1 extension (draft-rosenberg-oauth-aauth) defining the Agent Authorization Grant for confidential agent clients. Introduces a `reason` parameter, natural-language scope descriptions, and three token retrieval methods (HTTP polling, SSE, WebSocket). Designed for agents operating in non-browser channels (voice, SMS, messaging) where interactive OAuth redirects are impossible. ([IETF draft-rosenberg-oauth-aauth-00](https://www.ietf.org/archive/id/draft-rosenberg-oauth-aauth-00.html), [IETF datatracker](https://datatracker.ietf.org/doc/draft-rosenberg-oauth-aauth/))

- **OWASP Top 10 for Agentic Applications (Dec 2025)**: ASI03 (Identity and Privilege Abuse) is the third-highest risk. Agents inherit high-privilege credentials, session tokens, and delegated access that can be escalated or passed across agents. Mitigations: short-lived credentials, task-scoped permissions, isolated identities per agent. The framework also introduces the principle of **Least Agency** — the agentic equivalent of least privilege. ([OWASP Agentic Top 10](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), [Aikido Full Guide](https://www.aikido.dev/blog/owasp-top-10-agentic-applications))

### 2. OAuth 2.1 Is the Consensus Foundation — But Adoption Lags

Industry consensus: OAuth already has the mechanisms agents need. The problem is adoption, not innovation.

- **"AI agent identity: it's just OAuth"** — Maya Kaczorowski's influential post argues organizations should fix existing OAuth granularity before designing agent-specific permissions. OAuth's scope system enables precise control; token lifecycle provides natural expiration; identity binding distinguishes user-level from org-level access. The framework breaks down for local device agents (Claude MCP, Claude computer use) where agents operate within your session rather than authenticating externally. ([mayakaczorowski.com](https://mayakaczorowski.com/blogs/ai-agent-authentication))

- **MCP spec mandates OAuth 2.1 compliance** with PKCE for client apps, Client Credentials for server-to-server auth. Tokens must have 15-60 minute lifespans. Refresh token rotation required. MCP servers must NOT use sessions for authentication. Token passthrough is forbidden — servers must validate directly. ([Security Boulevard](https://securityboulevard.com/2026/03/mcp-authentication-and-authorization-patterns/))

- **Astrix research (Oct 2025)**: Scanned 5,000+ MCP servers. 88% require credentials, but 53% rely on static API keys or PATs. Only 8.5% use OAuth. 79% pass API keys via environment variables. The foundational approach to credentials in MCP is systemically broken. ([Astrix State of MCP Security](https://astrix.security/learn/blog/state-of-mcp-server-security-2025/), [Astrix PR](https://www.prnewswire.com/news-releases/astrix-research-team-uncovers-credential-risk-in-the-majority-of-mcp-servers-and-releases-open-source-tool-to-mitigate-it-302583965.html))

- **Additional IETF drafts**: draft-yao-agent-auth-considerations (further OAuth agent auth considerations), draft-oauth-ai-agents-on-behalf-of-user (OBO for AI agents), draft-goswami-agentic-jwt (JWT extensions for agents). ([IETF draft-yao](https://www.ietf.org/archive/id/draft-yao-agent-auth-considerations-01.html), [IETF OBO draft](https://www.ietf.org/archive/id/draft-oauth-ai-agents-on-behalf-of-user-00.html), [Agentic JWT](https://datatracker.ietf.org/doc/html/draft-goswami-agentic-jwt-00))

### 3. Capability-Based Security Is the Right Model for Agents

The industry is shifting from credentials (who you are) to capabilities (what you are allowed to do right now). This is the most architecturally significant finding for Sherpa.

- **Tenuo** is the most mature implementation: a Rust-core capability engine providing cryptographic warrants with offline attenuation. A warrant is a signed token specifying which tools an agent can call, under what constraints, and for how long. Key properties: verification in ~27 microseconds without network calls, proof-of-possession binding (stolen tokens are useless), monotonic attenuation (delegation can only narrow authority, never expand it). Integrates natively with LangChain, LangGraph, Google ADK, OpenAI, MCP, and A2A. ([Tenuo GitHub](https://github.com/tenuo-ai/tenuo), [tenuo.dev](https://tenuo.dev/), [crates.io/tenuo](https://crates.io/crates/tenuo))

- **MiniScope** (arXiv 2512.11147, Dec 2025): Academic least-privilege framework for tool-calling agents. Reconstructs permission hierarchies automatically by analyzing tool call relationships, then integrates with a mobile-style permission model. Only 1-6% latency overhead vs standard agents. ([arXiv](https://arxiv.org/pdf/2512.11147))

- **The credentials-to-capabilities shift** is well-articulated by Token Security: credentials authenticate identity, not intent. API keys are binary (valid/invalid) with no semantic understanding of whether the action aligns with purpose. Capabilities function as unforgeable tokens of authority for a specific task, with fine-grained scoping at object/action level, ephemeral lifetimes (seconds-to-minutes), and automatic expiration. If compromised at step 2, the agent cannot execute step 3 because it lacks that capability. ([Token Security](https://www.token.security/blog/the-shift-from-credentials-to-capabilities-in-ai-access-control-systems))

- **CyberArk Secure AI Agents** (GA Dec 2025): First enterprise identity security product purpose-built for AI agents. Enforces least-privilege, zero standing privileges, real-time anomaly detection, and lifecycle management. Fewer than 1 in 10 organizations have deployed agentic security controls. 90% of agents are over-permissioned. ([CyberArk press](https://www.cyberark.com/press/cyberark-introduces-first-identity-security-solution-purpose-built-to-protect-ai-agents-with-privilege-controls/))

### 4. Cryptographic Signing and Audit Trails Are Emerging

Multiple projects now enable agents to cryptographically sign their actions, creating tamper-evident provenance chains.

- **Sigstore A2A** (sigstore/sigstore-a2a): Python library for keyless signing of A2A Agent Cards using Sigstore infrastructure and SLSA provenance attestations. Uses ambient OIDC credentials from CI/CD (GitHub Actions). Short-lived certificates (valid minutes) tied to OIDC tokens — no long-lived keys. Every signature logged in Rekor transparency log. Can enforce identity constraints (specific repos, workflows, actors). ([GitHub](https://github.com/sigstore/sigstore-a2a), [Dev.to](https://dev.to/lukehinds/building-trust-in-the-ai-agent-economy-sigstore-meets-agent2agent-44f5))

- **Gitsign** (sigstore/gitsign): Keyless git commit signing using OIDC identity providers (GitHub, Google, Microsoft). For CI/CD automation, uses ambient OIDC tokens — no GPG key management. Every signed commit recorded in Rekor transparency log. Directly applicable to AI agents making git commits. ([GitHub](https://github.com/sigstore/gitsign), [Chainguard](https://www.chainguard.dev/unchained/keyless-git-commit-signing-with-gitsign-and-github-actions))

- **Agent Identity Protocol (AIP)** (faalantir/mcp-agent-identity): MCP server providing a local cryptographic "wallet" for AI agents. Generates RSA-2048 keypairs, signs arbitrary payloads, provides verification SDK. Self-signed certificate model — good for attribution, requires external trust for authorization. Roadmap: Ed25519 (v0.2), cloud KMS (v0.3), TPM (v0.4), centralized registry (v1.0). ([GitHub](https://github.com/faalantir/mcp-agent-identity), [Glama](https://glama.ai/mcp/servers/@faalantir/mcp-agent-identity))

- **Agent identity for git commits**: Best practice is dedicated bot accounts with distinct SSH keys. Use `GIT_AUTHOR_NAME`/`GIT_AUTHOR_EMAIL` environment variables (scoped per-command, no permanent config changes). GitHub App tokens automatically get verified commit signatures via GitHub's GPG key. ([Dev.to](https://dev.to/jpoehnelt/agent-identity-for-git-commits-53n1), [Chainguard Gitsign](https://www.chainguard.dev/unchained/keyless-git-commit-signing-with-gitsign-and-github-actions))

- **Crittora**: Released a cryptographic trust layer for agentic AI ensuring agents act only on verifiably authentic, untampered, authorized inputs. ([Crittora](https://www.crittora.com/field-notes/press-crittora-cryptographic-trust-layer-agentic-ai/))

### 5. Enterprise Agent Identity Products Have Launched

Two major enterprise platforms now treat AI agents as first-class identity principals:

- **Microsoft Entra Agent ID** (Preview, Feb 2026): Specialized identity construct for AI agents within Microsoft Entra ID. Agents get unique identity accounts distinct from user and application identities. Supports autonomous access (direct permissions), delegated access (on behalf of user), and incoming message authentication (other agents verify caller identity). Designed for ephemerality — bulk creation, consistent policy, automatic retirement. Agent identities can be paired with "agent users" (special Entra user accounts) for system compatibility. Conditional Access, identity protection, and network controls all apply. Part of Microsoft Agent 365 ($15/user/month, GA May 2026). ([Microsoft Learn](https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/what-is-agent-id), [Entra Agent ID overview](https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/microsoft-entra-agent-identities-for-ai-agents), [ID Governance](https://learn.microsoft.com/en-us/entra/id-governance/agent-id-governance-overview))

- **Devin Enterprise RBAC**: Two-tier role system (organization-level + account-level). 14 organization permissions + 18 enterprise permissions. Custom roles with specific granular permissions. SSO integration with IdP group-based role assignment. Dedicated permissions for MCP servers, API keys, secrets, playbooks. ([Devin Docs](https://docs.devin.ai/enterprise/security-access/custom-roles))

### 6. Claude Code's Permission Model Is the Reference Implementation for HITL

Claude Code implements the most mature human-in-the-loop permission system for agentic coding tools.

- **Tiered permission rules**: deny > ask > allow, evaluated in order. First matching rule wins. Deny always takes precedence. Rules apply to all tools (Bash, Read, Edit, WebFetch, MCP). ([Claude Code Docs](https://code.claude.com/docs/en/permissions))

- **Sandboxing architecture**: Uses Linux bubblewrap and macOS seatbelt for OS-level enforcement. Filesystem isolation restricts access to the current working directory. Network isolation via unix domain socket proxy that enforces domain restrictions. Together, sandboxing reduces permission prompts by 84% while increasing security. ([Anthropic Engineering](https://www.anthropic.com/engineering/claude-code-sandboxing))

- **Hooks system**: PreToolUse hooks run before the permission system and can approve or deny tool calls. This is Sherpa's enforcement integration point — a hook that validates agent actions against behavioral definitions could close the soft/hard governance gap. ([Claude Code Docs](https://code.claude.com/docs/en/permissions))

- **Critical analysis**: Claude Code's permission model has been critiqued for allowing `bypassPermissions` mode and for hooks executing before certain safety checks. The permission model is designed for developer productivity, not enterprise compliance. ([Siddhant Khare](https://siddhantkhare.com/writing/claude-code-permission-model-is-broken), [Backslash](https://www.backslash.security/blog/claude-code-security-best-practices))

### 7. MCP Supply Chain Security Remains Critical

The MCP ecosystem faces acute supply chain threats, directly relevant to Sherpa's tool/skill governance.

- **Snyk ToxicSkills (Feb 2026)**: Scanned 3,984 skills from ClawHub and skills.sh. 36.82% (1,467) had at least one security flaw. 13.4% (534) had critical issues. 76 confirmed malicious payloads for credential theft, backdoor installation, data exfiltration. 100% of malicious skills contained malicious code patterns; 91% simultaneously used prompt injection. Submissions jumped from 50/day to 500/day in weeks. ([Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/), [Snyk Agent Scan](https://github.com/snyk/agent-scan))

- **MCP attack surface** is comprehensive: tool poisoning (malicious instructions in descriptions executed in model context), rug pull attacks (servers modify tool descriptions post-approval without re-prompting), confused deputy (no user context propagation), sampling-based prompt injection (servers inject via reverse direction), command injection in config files (CVE-2025-6514, CVE-2025-59536, CVE-2026-21852), cross-server data exfiltration. ([Christian Schneider](https://christian-schneider.net/blog/securing-mcp-defense-first-architecture/), [Practical DevSecOps](https://www.practical-devsecops.com/mcp-security-vulnerabilities/))

- **Required mitigations**: Signed descriptors and implementations as first-class MCP spec citizens. Version pinning with immutable versions. Transparency logs (append-only, TLS-certificate style). SLSA attestations for reproducibility. Hash-based verification of approved tool descriptions. Rug-pull detection via description change monitoring. ([Boomi](https://boomi.com/blog/securing-the-mcp-supply-chain-oct-2025/))

### 8. Decentralized Identity for Agents (DID + Verifiable Credentials)

W3C standards for decentralized identity are being applied to agents, particularly for cross-organizational trust.

- **DID + VC for agents** (arXiv 2511.02841): Each agent gets a unique, ledger-anchored W3C DID with third-party-issued Verifiable Credentials. Enables spontaneous trust establishment across organizational boundaries without prior interactions. Challenge: delegating cryptographic operations to LLMs is unreliable. ([arXiv](https://arxiv.org/pdf/2511.02841))

- **Ethereum ERC-8004** (live on mainnet Jan 2026): Three on-chain registries — Identity (ERC-721 NFT resolving to registration file), Reputation (persistent, queryable ratings history), Validation (independent verification of agent claims). Gas-efficient: only the "skeleton of trust" on-chain. Co-authored by contributors from MetaMask, Ethereum Foundation, Google, Coinbase. ([EIP-8004](https://eips.ethereum.org/EIPS/eip-8004), [Allium explanation](https://www.allium.so/blog/onchain-ai-identity-what-erc-8004-unlocks-for-agent-infrastructure/))

- **Know Your Agent (KYA)**: Emerging trust layer for agentic commerce — establishing identity attributes, authorizations, and permissions of an AI agent before transactions. Each agent needs a DID about which others can make public attestations. ([Biometric Update](https://www.biometricupdate.com/202601/kya-emerges-as-essential-tool-to-ensure-agentic-ai-is-trustworthy), [Sumsub](https://sumsub.com/blog/know-your-agent/))

### 9. Agent Reputation and Marketplace Trust

- **TrustClaw**: First security-scanned marketplace for OpenClaw skills. Automated scanning for malicious patterns, credential access, shell execution, obfuscated code. Human review before approval. ([TrustClaw](https://trustclaw.xyz/))

- **ClawVault**: Agent labor marketplace with escrow, safety, and reputation infrastructure. Agents register skills; users find agents backed by historical performance data. ([ClawVault](https://www.clawvault.sh/))

- **AIVSS Scoring System**: OWASP's scoring system for agentic AI risks, providing standardized severity assessment. ([OWASP AIVSS](https://aivss.owasp.org/assets/publications/AIVSS%20Scoring%20System%20For%20OWASP%20Agentic%20AI%20Core%20Security%20Risks%20v0.5.pdf))

- **GitHub agent identity project survey**: 9 projects found on GitHub in early 2026, only 2 with real users. Most converge on Ed25519 cryptography but remain spec-focused. The critical gap is between theoretical design and operational infrastructure. Frictionless registration correlates directly with adoption. ([Dev.to survey](https://dev.to/thenexusguard/i-found-9-agent-identity-projects-on-github-only-2-have-real-users-3aed))

### 10. Multi-Tenant Agent Isolation

- **Sandboxing stack**: Docker containers (millisecond startup, process-level isolation, kernel-shared), gVisor (syscall-level, 10-30% I/O overhead), Firecracker MicroVMs (~125ms boot, <5MiB, hardware-level isolation, 150 VMs/second), Kata Containers (~200ms boot, Kubernetes-native, hardware-enforced). For untrusted agent code, Firecracker or Kata is the minimum. ([Northflank](https://northflank.com/blog/how-to-sandbox-ai-agents))

- **Google Agent Sandbox** (KubeCon NA 2025): Kubernetes primitive specifically for agent code execution and computer use. ([Google Cloud Blog](https://cloud.google.com/blog/products/containers-kubernetes/agentic-ai-on-kubernetes-and-gke))

- **Multi-tenant MCP**: Tenant isolation required across all layers — data storage, authorization processes, SDK-level tenant_id filters. Every vector stamped with tenant_id; finance/healthcare customers need separate indexes. ([Prefactor](https://prefactor.tech/blog/mcp-security-multi-tenant-ai-agents-explained))

- **Hardware-bound identity**: Beyond Identity argues API keys are "just strings" that can be embedded in documents, injected via prompts, or copy-pasted anywhere. Solution: device/workload-bound credentials with private keys cryptographically tied to environments, per-request cryptographic proofs making stolen tokens unusable. ([Beyond Identity](https://www.beyondidentity.com/resource/the-attacker-gave-claude-their-api-key-why-ai-agents-need-hardware-bound-identity))

### 11. Human-in-the-Loop Authorization Patterns

Four distinct HITL patterns are emerging:

1. **Approval-based**: Agent requests operation, pauses execution, human reviewer approves/denies, workflow resumes only on approval. (LangGraph `interrupt()`, Claude Code `ask` rules)
2. **Confidence-based routing**: Agent executes autonomously for high-confidence actions, routes to human review when confidence drops below threshold.
3. **Asynchronous audit**: Agent executes autonomously while logging all decisions for later human review. Near-zero latency, accepts delayed error detection.
4. **Multi-stage escalation**: Multiple approval stages — analyst review, manager approval, compliance check before final action.

Key principle: every human override must be logged with identity metadata for compliance, incident response, and model tuning. Humans should only intervene where they're authorized with policy-governed authority. ([Auth0](https://auth0.com/blog/secure-human-in-the-loop-interactions-for-ai-agents/), [Permit.io](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo), [Cloudflare Agents](https://developers.cloudflare.com/agents/concepts/human-in-the-loop/), [Galileo](https://galileo.ai/blog/human-in-the-loop-agent-oversight))

---

## Implications for Sherpa

### The Identity Gap Is Sherpa's Biggest Unsolved Problem

Sherpa agents currently inherit the human's credentials (git config, API keys, MCP tokens). This means:
- **No attribution**: Logs show the human performing actions an agent took autonomously
- **Over-privilege**: Agents inherit all accumulated user privileges
- **No audit trail**: Cannot distinguish which agent session performed which action
- **No blast radius containment**: A compromised agent has the human's full access

### Capability-Based Authorization Maps Directly to Sherpa's Architecture

Tenuo's warrant model (scoped, attenuating, time-bound capability tokens) is architecturally aligned with Sherpa's behavioral agent definitions:
- A behavioral agent definition's `disposition` and `quality-bar` fields could compile to capability constraints
- Warrant attenuation (delegation can only narrow, never expand) maps to Sherpa's initiative lifecycle (proposals narrow scope, not expand it)
- Offline verification (~27 microseconds) is compatible with PreToolUse hook latency requirements
- MCP and A2A integration already exists in Tenuo

### Concrete Next Steps for Sherpa

1. **Agent identity per worktree**: Each git worktree gets a distinct agent identity (bot account + SSH key). Environment variables (`GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`) scope identity per command. This is implementable today with zero infrastructure.

2. **Gitsign for agent commits**: Keyless commit signing using ambient OIDC tokens from CI/CD. Every agent commit gets recorded in a transparency log. No key management required.

3. **Capability warrants for tool access**: Behavioral agent definitions compile to Tenuo warrants. A research agent gets `read_file` + `web_search` capabilities. An implementation agent gets `read_file` + `edit_file` + `bash` capabilities. Warrants expire when the task/session ends.

4. **PreToolUse enforcement hook**: Claude Code's hook system can validate agent actions against behavioral definitions at runtime. This is the binding between Sherpa's convention layer and the runtime.

5. **Structured audit logging**: Every agent action → structured JSON log entry with agent identity, tool called, parameters, warrant that authorized it, timestamp. This satisfies EU AI Act Article 12 (automatic tamper-resistant event logging).

---

## Sources

### Standards and Regulation
- [NIST AI Agent Standards Initiative](https://www.nist.gov/caisi/ai-agent-standards-initiative) — Three-pillar initiative for agent standards, protocols, and research
- [NCCoE Concept Paper: Agent Identity and Authorization](https://www.nccoe.nist.gov/projects/software-and-ai-agent-identity-and-authorization) — Demonstration project exploring IAM for AI agents
- [NCCoE Concept Paper PDF](https://www.nccoe.nist.gov/sites/default/files/2026-02/accelerating-the-adoption-of-software-and-ai-agent-identity-and-authorization-concept-paper.pdf) — Full text of the NIST concept paper
- [Federal Register RFI on AI Agent Security](https://www.federalregister.gov/documents/2026/01/08/2026-00206/request-for-information-regarding-security-considerations-for-artificial-intelligence-agents) — NIST seeking public comments on agent security
- [NIST Cybersecurity Framework Profile for AI (Draft)](https://www.nist.gov/news-events/news/2025/12/draft-nist-guidelines-rethink-cybersecurity-ai-era) — Draft guidelines for AI cybersecurity
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) — Canonical risk taxonomy for autonomous AI
- [OWASP Agentic Top 10 Full Guide (Aikido)](https://www.aikido.dev/blog/owasp-top-10-agentic-applications) — Detailed breakdown of all 10 risks with mitigations
- [OWASP Agentic AI Threats and Mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/) — Companion threat modeling resource
- [AIVSS Scoring System for OWASP Agentic AI Risks](https://aivss.owasp.org/assets/publications/AIVSS%20Scoring%20System%20For%20OWASP%20Agentic%20AI%20Core%20Security%20Risks%20v0.5.pdf) — Standardized severity scoring

### OAuth and Authentication
- [IETF AAuth draft-rosenberg-oauth-aauth-00](https://www.ietf.org/archive/id/draft-rosenberg-oauth-aauth-00.html) — Agentic Authorization OAuth 2.1 Extension (full spec)
- [IETF AAuth datatracker](https://datatracker.ietf.org/doc/draft-rosenberg-oauth-aauth/) — Draft status and revisions
- [IETF draft-yao-agent-auth-considerations](https://www.ietf.org/archive/id/draft-yao-agent-auth-considerations-01.html) — Further agent auth considerations
- [IETF draft-oauth-ai-agents-on-behalf-of-user](https://www.ietf.org/archive/id/draft-oauth-ai-agents-on-behalf-of-user-00.html) — On-behalf-of user delegation for agents
- [IETF draft-goswami-agentic-jwt](https://datatracker.ietf.org/doc/html/draft-goswami-agentic-jwt-00) — JWT extensions for agentic systems
- [AI agent identity: it's just OAuth (Maya Kaczorowski)](https://mayakaczorowski.com/blogs/ai-agent-authentication) — Influential argument that OAuth suffices
- [OpenID Foundation: Identity Management for Agentic AI](https://openid.net/wp-content/uploads/2025/10/Identity-Management-for-Agentic-AI.pdf) — OpenID perspective on agent identity
- [Auth0: Access Control in the Era of AI Agents](https://auth0.com/blog/access-control-in-the-era-of-ai-agents/) — Auth0's analysis of agent access control patterns
- [Curity: IAM for AI Agents](https://curity.io/blog/identity-and-access-management-for-AI-agents/) — Enterprise IAM perspective
- [LoginRadius: Auth for AI Agents with OAuth 2.1](https://www.loginradius.com/blog/engineering/auth-for-ai-agents) — OAuth 2.1 agent auth implementation guide
- [Strata: Why Agentic AI Demands More from OAuth](https://www.strata.io/blog/agentic-identity/why-agentic-ai-demands-more-from-oauth-6a/) — OAuth token exchange and DPoP for agents
- [Strata: OAuth and Agentic Identity Zero Trust](https://www.strata.io/blog/agentic-identity/oauth-agentic-identity-zero-trust-ai-6b/) — Zero trust integration
- [WorkOS: Best OAuth/OIDC Providers for AI Agents](https://workos.com/blog/best-oauth-oidc-providers-for-authenticating-ai-agents-2025) — Provider comparison
- [Stytch: Agent-to-Agent OAuth with MCP](https://stytch.com/blog/agent-to-agent-oauth-guide/) — A2A OAuth patterns
- [MCP Authentication and Authorization Patterns (Security Boulevard)](https://securityboulevard.com/2026/03/mcp-authentication-and-authorization-patterns/) — Comprehensive MCP auth pattern catalog

### Capability-Based Security
- [Tenuo GitHub](https://github.com/tenuo-ai/tenuo) — Rust capability engine with cryptographic warrants
- [tenuo.dev](https://tenuo.dev/) — Tenuo documentation and concepts
- [Tenuo on crates.io](https://crates.io/crates/tenuo) — Rust package
- [Token Security: Credentials to Capabilities Shift](https://www.token.security/blog/the-shift-from-credentials-to-capabilities-in-ai-access-control-systems) — The definitive article on why capabilities > credentials for agents
- [MiniScope paper (arXiv 2512.11147)](https://arxiv.org/pdf/2512.11147) — Least privilege framework for tool-calling agents
- [Awesome OCAP](https://github.com/dckc/awesome-ocap) — Object capability security resource list
- [Systems Security Foundations for Agentic Computing (ePrint)](https://eprint.iacr.org/2025/2173.pdf) — Academic paper on capability-based agent security
- [AWS Well-Architected: Least Privilege for Agentic Workflows](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/gensec05-bp01.html) — AWS best practices
- [IBM: AI Agent Security Best Practices](https://www.ibm.com/think/tutorials/ai-agent-security) — IBM's agent security tutorial
- [warrant.sh](https://www.warrant.sh/) — Capability policies for AI agents
- [A2A Discussion: Capability-based authorization](https://github.com/a2aproject/A2A/discussions/1404) — A2A protocol discussion

### Cryptographic Signing and Provenance
- [Sigstore A2A GitHub](https://github.com/sigstore/sigstore-a2a) — Keyless signing of A2A Agent Cards
- [Sigstore A2A: Building Trust in AI Agent Economy (Dev.to)](https://dev.to/lukehinds/building-trust-in-the-ai-agent-economy-sigstore-meets-agent2agent-44f5) — Motivation and architecture
- [Gitsign GitHub](https://github.com/sigstore/gitsign) — Keyless git commit signing
- [Chainguard: Keyless Git Commit Signing with Gitsign](https://www.chainguard.dev/unchained/keyless-git-commit-signing-with-gitsign-and-github-actions) — GitHub Actions integration guide
- [Agent Identity Protocol (AIP) GitHub](https://github.com/faalantir/mcp-agent-identity) — MCP server for cryptographic agent identity
- [AIP on Glama](https://glama.ai/mcp/servers/@faalantir/mcp-agent-identity) — MCP server listing
- [AgentCred GitHub](https://github.com/agentcred-ai/agentcred) — Agent "blue badge" trust system
- [Agent Identity for Git Commits (Dev.to)](https://dev.to/jpoehnelt/agent-identity-for-git-commits-53n1) — Bot account setup guide
- [Signing commits in GitHub Actions](https://httgp.com/signing-commits-in-github-actions/) — Bot commit signing patterns
- [GitHub: Commit signing with GitHub Apps](https://github.com/orgs/community/discussions/50055) — App-based verified commits
- [Crittora Cryptographic Trust Layer](https://www.crittora.com/field-notes/press-crittora-cryptographic-trust-layer-agentic-ai/) — Cryptographic security for agentic AI
- [OpenAI Cookbook: Precision Decisioning & Agentic Trust](https://github.com/openai/openai-cookbook/issues/2461) — Cryptographic authorization proofs
- [Who Signed This? Provenance for AI Agents (Medium)](https://medium.com/@alexzanfir/who-signed-this-provenance-for-ai-agents-78208f9574f1) — Provenance concepts
- [AGENTSAFE Framework (arXiv)](https://arxiv.org/html/2512.03180v1) — Ethical assurance and governance framework

### Enterprise Identity Products
- [Microsoft Entra Agent ID: What Is It?](https://learn.microsoft.com/en-us/entra/agent-id/identity-platform/what-is-agent-id) — Full technical documentation
- [Microsoft Entra Agent ID Overview](https://learn.microsoft.com/en-us/entra/agent-id/identity-professional/microsoft-entra-agent-identities-for-ai-agents) — Identity professional guide
- [Microsoft Entra Agent ID Governance](https://learn.microsoft.com/en-us/entra/id-governance/agent-id-governance-overview) — Governance and lifecycle management
- [Microsoft Foundry: Agent Identity](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-identity) — Azure AI Foundry integration
- [Microsoft Security: Entra Agent ID](https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-agent-id) — Product page
- [Microsoft Security Blog: Secure Agentic AI](https://www.microsoft.com/en-us/security/blog/2026/03/09/secure-agentic-ai-for-your-frontier-transformation/) — Security architecture overview
- [CyberArk Secure AI Agents](https://www.cyberark.com/press/cyberark-introduces-first-identity-security-solution-purpose-built-to-protect-ai-agents-with-privilege-controls/) — Enterprise privilege controls for agents
- [CyberArk: Solution Capabilities](https://www.cyberark.com/resources/product-insights-blog/cyberark-secure-ai-agents) — Detailed capability breakdown
- [Devin RBAC Docs](https://docs.devin.ai/enterprise/security-access/custom-roles) — Two-tier enterprise RBAC
- [WSO2: Why AI Agents Need Own Identity](https://wso2.com/library/blogs/why-ai-agents-need-their-own-identity-lessons-from-2025-and-resolutions-for-2026/) — Agent-first identity model argument
- [WorkOS: AI Agent Access Control](https://workos.com/blog/ai-agent-access-control) — Permission management patterns

### MCP and Supply Chain Security
- [Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) — 36.82% of skills flawed, 13.4% critical
- [Snyk Agent Scan GitHub](https://github.com/snyk/agent-scan) — Scanner for AI agents, MCP servers, skills
- [Malicious Google Skill on ClawHub (Snyk/Medium)](https://medium.com/@snyksec/how-a-malicious-google-skill-on-clawhub-tricks-users-into-installing-malware-d19970a64cbc) — Case study
- [Cursor + Jira MCP 0-Click Vulnerability (Snyk Labs)](https://labs.snyk.io/resources/cursor-jira-mcp-vulnerability-explained/) — MCP vulnerability analysis
- [Securing MCP: Defense-First Architecture (Christian Schneider)](https://christian-schneider.net/blog/securing-mcp-defense-first-architecture/) — Comprehensive 4-layer defense architecture
- [Boomi: Securing the MCP Supply Chain](https://boomi.com/blog/securing-the-mcp-supply-chain-oct-2025/) — Signing, versioning, transparency logs
- [Astrix: State of MCP Server Security 2025](https://astrix.security/learn/blog/state-of-mcp-server-security-2025/) — 5,000+ MCP server security audit
- [Adversa AI: Top MCP Security Resources (March 2026)](https://adversa.ai/blog/top-mcp-security-resources-march-2026/) — Curated security resource list
- [Adversa AI: Top MCP Security Resources (February 2026)](https://adversa.ai/blog/top-mcp-security-resources-february-2026/) — Previous month's resources
- [Practical DevSecOps: MCP Security Vulnerabilities](https://www.practical-devsecops.com/mcp-security-vulnerabilities/) — Prompt injection and tool poisoning prevention
- [Data Science Dojo: MCP Security Risks](https://datasciencedojo.com/blog/mcp-security-risks-and-challenges/) — Risk overview and case studies

### Claude Code Security
- [Claude Code Permissions Docs](https://code.claude.com/docs/en/permissions) — Official permission model documentation
- [Anthropic Engineering: Claude Code Sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing) — Sandbox architecture (84% prompt reduction)
- [Claude Code Permission Configuration (Claude Agent SDK)](https://platform.claude.com/docs/en/agent-sdk/permissions) — Agent SDK permission docs
- [Claude Code's Broken Permission Model (Siddhant Khare)](https://siddhantkhare.com/writing/claude-code-permission-model-is-broken) — Critical analysis
- [Backslash: Claude Code Security Best Practices](https://www.backslash.security/blog/claude-code-security-best-practices) — Security hardening guide
- [Claude Code Tool Configuration (DeepWiki)](https://deepwiki.com/anthropics/claude-code-action/5.3-tool-and-permission-configuration) — GitHub Action tool configuration

### Decentralized Identity
- [AI Agents with DIDs and VCs (arXiv 2511.02841)](https://arxiv.org/pdf/2511.02841) — Academic paper on DID+VC for agents
- [Interoperable Architecture for Digital Identity Delegation (arXiv 2601.14982)](https://arxiv.org/pdf/2601.14982) — Identity delegation architecture
- [Authenticated Delegation and Authorized AI Agents (arXiv 2501.09674)](https://arxiv.org/html/2501.09674v1) — Delegation authorization framework
- [Zero-Trust Identity Framework for Agentic AI (arXiv 2505.19301)](https://arxiv.org/html/2505.19301v1) — Decentralized auth and fine-grained access
- [ERC-8004: Trustless Agents (EIP)](https://eips.ethereum.org/EIPS/eip-8004) — Ethereum agent identity/reputation/validation registries
- [ERC-8004 Explained (Backpack Exchange)](https://learn.backpack.exchange/articles/erc-8004-explained) — Plain-language guide
- [ERC-8004 and Agent Infrastructure (Allium)](https://www.allium.so/blog/onchain-ai-identity-what-erc-8004-unlocks-for-agent-infrastructure/) — Infrastructure implications
- [Indicio: Verifiable Credentials for AI in 2026](https://indicio.tech/blog/why-verifiable-credentials-will-power-ai-in-2026/) — VC adoption forecast
- [KYA for Agentic AI (Biometric Update)](https://www.biometricupdate.com/202601/kya-emerges-as-essential-tool-to-ensure-agentic-ai-is-trustworthy) — Know Your Agent concept

### Agent Reputation and Marketplaces
- [TrustClaw](https://trustclaw.xyz/) — Security-verified skill marketplace
- [ClawVault](https://www.clawvault.sh/) — Autonomous labor marketplace with reputation
- [Agent Identity Projects Survey (Dev.to)](https://dev.to/thenexusguard/i-found-9-agent-identity-projects-on-github-only-2-have-real-users-3aed) — 9 projects analyzed, 2 with real users
- [Agent Skills Security: 42K Downloads (WeekendByte)](https://weekendbyte.com/p/agent-skills-can-you-trust-what-you-download) — Agent skills trust analysis
- [Best Claude Code Skills (ShareUHack)](https://www.shareuhack.com/en/posts/claude-code-skills-top-picks) — Curated skill picks

### Multi-Tenant and Sandboxing
- [Northflank: How to Sandbox AI Agents](https://northflank.com/blog/how-to-sandbox-ai-agents) — MicroVMs, gVisor, isolation strategies comparison
- [Prefactor: MCP Security for Multi-Tenant Agents](https://prefactor.tech/blog/mcp-security-multi-tenant-ai-agents-explained) — Tenant isolation patterns
- [Azure Confidential Computing for AI Agents](https://markaicode.com/azure-confidential-computing-ai-agents-2025/) — Hardware-level agent isolation
- [Google: Agentic AI on Kubernetes and GKE](https://cloud.google.com/blog/products/containers-kubernetes/agentic-ai-on-kubernetes-and-gke) — Agent Sandbox primitive
- [Multi-Tenant AI Agent Architecture (Fast.io)](https://fast.io/resources/ai-agent-multi-tenant-architecture/) — Design guide
- [Beyond Identity: Hardware-Bound Agent Identity](https://www.beyondidentity.com/resource/the-attacker-gave-claude-their-api-key-why-ai-agents-need-hardware-bound-identity) — Why API keys fail for agents

### HITL and Authorization Patterns
- [Auth0: Secure HITL Interactions for AI Agents](https://auth0.com/blog/secure-human-in-the-loop-interactions-for-ai-agents/) — Authorization patterns with identity metadata
- [Permit.io: HITL for AI Agents](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo) — Best practices and framework comparison
- [Cloudflare Agents: Human-in-the-Loop](https://developers.cloudflare.com/agents/concepts/human-in-the-loop/) — Cloudflare's HITL pattern
- [Galileo: HITL Agent Oversight](https://galileo.ai/blog/human-in-the-loop-agent-oversight) — Oversight architecture
- [Zapier: HITL in AI Workflows](https://zapier.com/blog/human-in-the-loop/) — Practical HITL patterns
- [Orkes: HITL in Agentic Workflows](https://orkes.io/blog/human-in-the-loop/) — Orchestration-based HITL
- [Microsoft Learn: HITL with AG-UI](https://learn.microsoft.com/en-us/agent-framework/integrations/ag-ui/human-in-the-loop) — AG-UI integration

### Industry Analysis
- [Obsidian Security: AI Agent Security 2025](https://www.obsidiansecurity.com/blog/security-for-ai-agents) — Comprehensive agent security landscape
- [Obsidian Security: 2025 AI Agent Market Landscape](https://www.obsidiansecurity.com/blog/ai-agent-market-landscape) — Market players and trends
- [ISACA: The Looming Authorization Crisis](https://www.isaca.org/resources/news-and-trends/industry-news/2025/the-looming-authorization-crisis-why-traditional-iam-fails-agentic-ai) — Why traditional IAM fails for agents
- [SC Media: 2026 Identity Security for AI Agents](https://www.scworld.com/native/2026-identity-security-governing-ai-agents-nhis-and-mcp-access) — Governing agents, NHIs, and MCP
- [BetaNews: Identity Predictions for 2026](https://betanews.com/2025/12/19/adapting-to-ai-agents-growing-risks-and-perimeter-focus-identity-predictions-for-2026/) — Industry predictions
- [Galileo: AI Agent Compliance & Governance](https://galileo.ai/blog/ai-agent-compliance-governance-audit-trails-risk-management) — Compliance framework
- [Sendbird: RBAC for AI Agents](https://sendbird.com/blog/ai-agent-role-based-access-control) — Two-layer RBAC implementation
- [OWASP Agentic Top 10 Security Reference (XOR)](https://www.xor.tech/resources/owasp-agentic-top-10) — Quick reference
- [Ethereum Decentralized AI Revolution (Technology.org)](https://www.technology.org/2026/02/05/ethereums-decentralized-ai-revolution-surges-as-agentic-standards-transform-2026/) — Blockchain agent standards
- [Datadome: Agent Authentication & Authorization](https://datadome.co/agent-trust-management/authentication-and-authorization/) — Trust management overview
- [NIST launches AI Agent Standards (Pillsbury)](https://www.pillsburylaw.com/en/news-and-insights/nist-ai-agent-standards.html) — Legal analysis
- [NIST AI Agent Standards (ANSI)](https://www.ansi.org/standards-news/all-news/2-18-26-nist-launches-ai-agent-standards-initiative) — Standards body perspective
- [NIST AI Agent Standards (Jones Walker)](https://www.joneswalker.com/en/insights/blogs/ai-law-blog/nists-ai-agent-standards-initiative-why-autonomous-ai-just-became-washingtons.html) — Washington policy analysis
- [NIST AI Agent Standards (Hogan Lovells)](https://www.hoganlovells.com/en/publications/shaping-the-future-of-ai-security-nist-seeking-input-on-agent-identity-authorization) — Law firm analysis
- [Trust Without Verification (Doug Seven)](https://dougseven.com/2026/02/09/trust-without-verification/) — Analysis of trust assumptions in agent ecosystems

---

## Open Questions

1. **Should Sherpa adopt Tenuo warrants or build its own capability token system?** Tenuo is MIT-licensed, Rust-core with Python bindings. It already integrates with MCP and A2A. But adopting it means external governance of the authorization layer. A TypeScript SDK is not yet available (planned v0.2).

2. **How should agent identity persist across sessions?** An agent in a worktree may run across multiple Claude Code sessions. Should identity be tied to the worktree (filesystem-based), to a long-lived bot account (GitHub-based), or to an ephemeral OIDC token (Sigstore-based)?

3. **Can behavioral agent definitions compile to capability constraints?** A research agent's definition says "read-only, web search, propose changes." Can this mechanically translate to a Tenuo warrant with `read_file` + `web_search` capabilities and no `edit_file` or `bash` access?

4. **What's the right granularity for agent audit logging?** Per-tool-call (every `read_file`, `edit_file`, `bash`) is comprehensive but voluminous. Per-milestone (research complete, proposal written, PR created) is manageable but loses detail. The EU AI Act requires "automatic" logging but doesn't specify granularity.

5. **How does agent identity interact with MCP server trust?** If an agent has a verified identity, should MCP servers use that identity for authorization decisions? The MCP spec doesn't currently support agent identity propagation.
