# Week Ahead Intel — April 1, 2026

**Compiled:** Mon Mar 31 / Tue Apr 1 (late evening PT)
**Focus:** Quick intelligence scan for Rob's job search & professional strategy

---

## 1. Seattle AI Startup Summit (April 1-2)

**Nothing new found.** No last-minute agenda updates, speaker announcements, or attendee lists surfaced in search. Workshop Day is tomorrow (Apr 1, 2-6 PM). The summit's web presence appears thin in indexed results — if Rob is attending, worth checking the site directly for any day-of updates.

---

## 2. Linear — New Developments Since March 24 Agent Launch

**🔥 Significant press coverage landed this week.** Multiple outlets covered the launch:

- **The Register (Mar 26):** "Linear adopts agentic AI as CEO declares issue tracking dead." Karri Saarinen quote: *"Agents are not mind readers. They become useful through context."*
- **The Register** also confirmed Linear plans to **add AI coding assistance** beyond the current agent — this is new intel. The agent currently works in web/mobile/desktop + Slack/Teams/Zendesk plugins.
- **DevClass (Mar 27):** Confirmed Agent + Skills require **Business ($16/user/mo) or Enterprise plan**.
- **Runtime News (Mar 29):** Noted that a feature allowing the agent to **understand a customer's codebase is "coming soon"** — this is NEW and significant for Rob's positioning.
- **Department of Product (Substack, ~Mar 26):** Deep analysis framing Saarinen's "issue tracking is dead" thesis as a shift from hand-off model to collaborative agent model.

**Key takeaway for Rob:** The "codebase understanding" feature coming soon means Linear is expanding from project management into dev tooling territory. This creates more surface area for engineering roles. No new job postings found this week, but the product direction confirms Rob's instinct that Linear is the #1 target.

---

## 3. Vercel v0 — Product Engineer Role & Agentic Capabilities

**No new job posting details found.** But significant product developments:

- **v0 is now fully agentic** — NxCode's comprehensive 2026 guide confirms: v0 "plans, reasons, and executes multi-step tasks." It can search the web for reference implementations, inspect live sites for design inspiration, and connect to databases (Snowflake, AWS).
- **Vercel Changelog (recent):** The platform now offers "39 platform skills, three specialist agents, and real-time code validation" via their plugin.
- **Vercel Labs** released `agent-browser` (browser automation CLI for AI agents) and `agent-skills` (React Best Practices, Web Design Guidelines).
- **🚨 axios supply chain attack (Mar 31):** Vercel's changelog explicitly notes they investigated and remediated the compromised `axios@0.30.4` package. This is a major security event (see Section 4).

**Key takeaway:** v0's agentic capabilities are exactly the kind of product Rob should reference in applications. The "plans → reasons → executes" pipeline mirrors his Sherpa/agent infrastructure work. If applying, he should cite this alignment.

---

## 4. Major AI Engineering News (Today/This Weekend)

### 🔴 axios npm Supply Chain Attack (Mar 30-31) — BREAKING
The `axios` package (100M+ weekly downloads) was compromised. Attackers hijacked the `jasonsaayman` npm account, published `axios@0.30.4` with a malicious dependency (`plain-crypto-js@4.2.1`) that delivers a cross-platform Remote Access Trojan (RAT). Elastic, Snyk, SANS, Huntress, The Hacker News all covered it. **Rob should know this for interviews** — supply chain security is increasingly relevant for any engineering role.

### 🔴 Red Hat "Agentic SDLC" Memo (Mar 31) — BREAKING
Red Hat CTO Chris Wright and SVP Ashesh Badani sent an internal memo announcing transition to an **"Agentic Software Development Lifecycle."** Quote: *"The gap we face today isn't just technical – it's organizational."* Roles will evolve, engineers must adopt AI tooling, workflows measured by cycle time and defect rate. **This is exactly the "company of one" narrative Rob should reference** — large companies are formalizing what solo builders have been doing.

### JetBrains AI Pulse Survey
- 90% of developers already use AI at work
- 66% of companies plan to adopt coding agents within 12 months
- JetBrains warning about an "AI agent ROI crisis" similar to cloud cost management

### MiniMax M2.5 Launched (Today)
New SOTA model for coding, agentic tool use, and search. Trained with RL in 100K+ real-world environments. Another data point that the agentic coding space is moving fast.

### Liquid AI LFM2.5-350M
Proved reliable agentic loops can run on a 350M parameter model — the "small model" narrative continues to gain steam.

### "Context Engineering" Terminology
The Q1 2026 AI Vocabulary List from AI PM Guru (Substack, today) includes "context engineering" and defines "human-in-the-loop" as now meaning *a human approves specific actions before an agent takes them*. This framing is useful for Rob's carousel content.

---

## Action Items for Rob

1. **Carousel content:** The Red Hat agentic SDLC memo + axios attack are timely hooks. "Context engineering" is officially in the PM vocabulary — good framing.
2. **Linear application:** Codebase understanding feature = more reason to apply now. The press wave shows momentum.
3. **Vercel v0:** Reference the "plans → reasons → executes" agentic pipeline in cover letters as direct parallel to his Sherpa work.
4. **Interview prep:** axios supply chain attack is a current-events question waiting to happen. Know the details.
5. **Seattle AI Startup Summit:** Check site directly for tomorrow's Workshop Day details.
