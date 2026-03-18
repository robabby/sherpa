# Vector 1: Hackers, Red Teams, and Security Researchers

**Question:** How do security professionals use VPS to run AI models and autonomous agents?
**Agent dispatched:** 2026-03-17

## Findings

### Autonomous Pentesting Agents (Docker-first, VPS-native)

The ecosystem has exploded. Every major tool deploys via Docker Compose:

- **PentAGI** — 20+ integrated tools (nmap, metasploit, sqlmap), Go backend + Neo4j knowledge graph + React frontend. Supports Ollama for fully local inference. vLLM + Qwen3.5-27B-FP8 for production.
- **RedAmon** — Full red team pipeline: recon → exploitation → post-exploitation with zero human intervention. LangGraph agent + Neo4j graph + MCP tool selection. Every component in Docker.
- **Shannon** — 96% success rate on XBOW benchmark. Claude Agent SDK powered. White-box analysis with parallel agents.
- **ARACNE** — SSH-driven pentesting agent. 60% success against autonomous defenders. Goals in <5 commands.
- **PentestAgent** — Multi-mode autonomy (Assist/Agent/Crew/Interact). Kali-enhanced Docker images.
- **HexStrike AI** — MCP server bridging AI to 150+ security tools. Already weaponized against Citrix zero-days within hours of release.

### Disposable VPS Patterns

Two-tier infrastructure: **persistent core** (C2, payload delivery) + **disposable redirectors** (rebuilt in minutes via Terraform).

- **Red Baron** — Terraform modules for AWS, DO, Azure, GCP, Linode. Each module creates disposable C2/phishing/redirector resources.
- **Anonymous providers** — AnonVM, Cloudzy (Monero, pre-installed Whonix), BitLaunch (Bitcoin, no KYC).

### Self-Hosted Inference for OPSEC

Privacy is the primary motivator. Sending target data to cloud APIs = data exfiltration risk + program compliance violation.

- **AIRecon** — Autonomous recon agent: Ollama + Kali Docker sandbox. 100% local. 57 skill files, 289 keyword mappings. Requires 30B+ model.
- **CAI** — Open-source, MIT. 300+ models. 11x faster than humans, 156x more cost-effective. Top-30 Spain on HackTheBox.
- **CyberSentinel-AI** — 33+ tools, 100% local via Docker + Ollama.
- **Kali official stack** — Ollama + MCP Kali Server + 5ire. Tested on GTX 1060 (6GB).

### Uncensored Models

Cloud APIs refuse offensive security prompts. Self-hosted alternatives:
- **WhiteRabbitNeo** — Trained on 1.7M offensive/defensive samples. Available in Ollama.
- Underground: FraudGPT, DarkestGPT, GhostGPT (subscription-based, criminal use).

### VPS Provider Preferences (Security Community)

- **OVHcloud** — Explicitly allows pentesting in ToS. No prior notification needed.
- **Hetzner** — Accounts suspended within 1-2 hours of scanning.
- **DigitalOcean** — Prohibits scanning without written permission.
- **Vultr** — Automated suspension on suspicious traffic.

### CTF and Academic Competitions

- **DARPA AIxCC** — $14M competition at DEF CON 33. Autonomous systems found 86% of synthetic vulnerabilities in 54M lines of code. 18 real vulnerabilities discovered. Open-source CRS releases.
- **CTFAgent** — Outperforms 88% of human teams (automated), 94% (human-in-the-loop).
- **EnIGMA** (NYU) — 3x more CTF challenges solved than previous AI agents.

### OSINT with Local LLMs

- **OSINT-with-LLM** — Feed email/domain/IP, get full recon report via local Ollama.
- **SpiderFoot MCP** — 200+ OSINT modules exposed to AI via MCP server.
- **GraphAware** — Neo4j + LLMs for entity extraction. Months of manual work → minutes.

## Key Patterns

1. **Docker-first deployment** — every tool ships as Docker Compose
2. **Ollama as runtime standard** — supported by PentAGI, AIRecon, CyberSentinel, CAI, Kali stack
3. **MCP as bridge layer** — HexStrike, MCP Kali Server, SpiderFoot MCP
4. **Knowledge graphs for state** — Neo4j in PentAGI, RedAmon, OSINT tools
5. **OPSEC hierarchy** — Cloud API (worst) → persistent VPS (better) → local (best) → disposable VPS + crypto (operational)

## Sources

- https://github.com/vxcontrol/pentagi — PentAGI
- https://github.com/samugit83/redamon — RedAmon
- https://github.com/KeygraphHQ/shannon — Shannon
- https://github.com/pikpikcu/airecon — AIRecon
- https://github.com/aliasrobotics/cai — CAI
- https://github.com/0x4m4/hexstrike-ai — HexStrike AI
- https://github.com/Coalfire-Research/Red-Baron — Red Baron Terraform
- https://www.kali.org/blog/kali-llm-ollama-5ire/ — Kali official LLM stack
- https://notchrisgroves.com/vps-provider-comparison/ — VPS provider pentesting comparison
- https://www.darpa.mil/news/2025/aixcc-results — DARPA AIxCC results
- https://blog.checkpoint.com/executive-insights/hexstrike-ai-when-llms-meet-zero-day-exploitation/ — HexStrike weaponization
- https://blogs.cisco.com/security/detecting-exposed-llm-servers-shodan-case-study-on-ollama — 14K exposed Ollama servers

## Implications

The security community has the most mature VPS + AI deployment patterns. Docker Compose + Ollama + MCP is already the standard stack. The disposable infrastructure pattern (Terraform + anonymous VPS) is directly relevant to Sherpa's client deployment pipeline — same automation, different purpose. The OPSEC motivation (don't send data to cloud APIs) maps perfectly to Sherpa's compliance/privacy positioning for consulting clients.

**Critical insight for Hetzner:** Hetzner suspends accounts that scan. If any Sherpa client work involves security testing, OVHcloud is the provider, not Hetzner.
