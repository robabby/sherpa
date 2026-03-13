# Role Taxonomy Research: Cross-Industry Agent Catalog Organization

**Research date:** 2026-03-11
**Question:** How should agent roles be taxonomized for a cross-industry catalog, and what evidence exists for optimal organizational structures?
**Context:** Sherpa needs a taxonomy that works across industries (tech, consulting, startups, enterprises). Source material (agency-agents) uses 12 marketing-agency divisions. Draft proposal uses 9 categories: engineering, product, design, research, quality, operations, security, data, specialized.

---

## Key Discoveries

### 1. Consulting Firms Use a Two-Axis Model: Function x Industry

Every major consulting firm organizes around two independent dimensions, not a single hierarchy:

- **McKinsey** has ~10 functional practices (Strategy & Corporate Finance, Operations, Growth Marketing & Sales, Digital & Technology, People & Organizational Performance, Risk & Resilience, Sustainability, Transformation, Implementation) crossed with 20+ industry practices (Healthcare, Financial Services, Energy, etc.). An engagement typically has a generalist covering the region + specialists with either industry or functional expertise. ([McKinsey Capabilities](https://www.mckinsey.com/capabilities), [Management Consulted](https://managementconsulted.com/mckinsey/))

- **Deloitte Consulting** has 5 service areas: Strategy and Analytics, Human Capital, Customer and Marketing, Enterprise Technology and Performance, Core Business Operations. ([CaseBasix](https://www.casebasix.com/pages/deloitte-consulting))

- **Accenture** had 5 service lines (Strategy & Consulting, Technology, Operations, Song, Industry X) before consolidating into "Reinvention Services" in 2025. ([Consulting.us](https://www.consulting.us/news/11992/accenture-restructures-organization-makes-senior-appointments))

- **StrategyU's 15 consulting types** provides a useful universal breakdown: Strategy & Operations, Technology, Financial/Transaction Advisory, HR & Talent, Marketing & Sales, Risk & Compliance, Environmental/Sustainability, Economic, Healthcare/Life Sciences, Supply Chain & Operations, Digital Transformation, Change Management, Legal/Investigative, Board Advisory, Innovation & Product Development. ([StrategyU](https://strategyu.co/consulting-industry/))

**Implication for Sherpa:** The consulting industry's universal functional categories are: Strategy, Operations, Technology, People/HR, Finance, Marketing/Sales, Risk/Compliance. These recur across every firm regardless of size. Industry is always a separate axis, never mixed into functional categories.

### 2. Tech Companies Organize Around Value Streams, Not Functional Silos

- **Stripe** (8,500+ people, ~40% engineers): Organizes engineering into Product Development teams (around major products like Billing, Terminal, Fraud) and Infrastructure & Operations teams. Specialized roles (ML, Security, Mobile) exist alongside "full stack" as the dominant mode. ([Pragmatic Engineer: Stripe Part 1](https://newsletter.pragmaticengineer.com/p/stripe), [Stripe Atlas: Scaling Engineering](https://stripe.com/guides/atlas/scaling-eng))

- **Linear** (~50 people): No durable cross-functional teams. No traditional PMs (duties distributed across engineering and design). Teams assemble around a project and disperse. Product, design, and engineering are talked about as "Product" holistically. ([Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-linear-builds-product), [First Round: Linear Org Chart](https://review.firstround.com/make-an-org-chart-you-want-to-ship-advice-from-linear-on-how-heirloom-tomatoes-should-inspire-team-design/))

- **Basecamp** (~50 people, ~12 in product): Shape Up methodology. Teams of 1 designer + 1-2 developers assemble per project. A small senior group shapes work in parallel. No permanent team assignments. ([Basecamp Shape Up](https://basecamp.com/shapeup/0.3-chapter-01))

- **Vercel** (~823 people, 66 in engineering): Three core engineering teams named after retro video games. Distinct "Design Engineering" team for highest-polish UI work. ([Vercel Design Engineering Blog](https://vercel.com/blog/design-engineering-at-vercel))

**Implication for Sherpa:** Small tech companies don't have divisions -- they have fluid project teams. The taxonomy should describe *capabilities* an agent brings, not *departments* it belongs to. An agent with "frontend" + "design" capabilities can slot into any project team.

### 3. Team Topologies Provides the Best Agent-Applicable Framework

The Team Topologies book (Skelton & Pais) defines four fundamental team types, which map cleanly to agent roles:

- **Stream-aligned teams** (deliver value to customers) → Most agents: engineers, designers, content creators
- **Platform teams** (create services that accelerate stream-aligned teams) → DevOps, infrastructure, tooling agents
- **Enabling teams** (help stream-aligned teams overcome obstacles) → Architecture review, coaching, research agents
- **Complicated subsystem teams** (deep specialist knowledge) → Security, ML/AI, data science agents

([Team Topologies](https://teamtopologies.com/key-concepts), [Martin Fowler](https://martinfowler.com/bliki/TeamTopologies.html), [Atlassian](https://www.atlassian.com/devops/frameworks/team-topologies))

**Implication for Sherpa:** Team Topologies' four types could be a facet on agent roles (e.g., `topology: stream-aligned | platform | enabling | subsystem`). This captures how the agent is *used*, complementing what the agent *does*.

### 4. Spotify Model Shows Chapters = Functional Specialties, Squads = Cross-Functional

The Spotify model uses:
- **Squads** (cross-functional project teams, <8 people)
- **Tribes** (groups of 3-5 squads, <100 people, Dunbar-oriented)
- **Chapters** (cross-squad groups with similar skills -- the functional specialty axis)
- **Guilds** (cross-tribe communities of interest)

([Atlassian: Spotify Model](https://www.atlassian.com/agile/agile-at-scale/spotify))

**Implication for Sherpa:** "Chapter" = category in our taxonomy. An agent's category is its Chapter affinity (engineering, design, etc.). But deployment is always into Squads (cross-functional project teams). This validates that category should describe capability, not assignment.

### 5. Enterprise Agent Platforms Use Function x Industry, Just Like Consulting

- **Google Cloud Agent Finder** (1,914+ agents) uses three independent filter dimensions: Business Functions (Customer Support, Data Analysis, Finance & Accounting, HR, IT Operations, Legal & Compliance, Marketing, Procurement & Supply Chain, Product Development, Sales), Industries (10 categories), and Solution Types (Data, Developer Tools, MCP server, Security, Validations). ([Google Cloud Agent Finder](https://cloud.withgoogle.com/agentfinder/))

- **Salesforce Agentforce** has named agents: Service Agent, SDR, Sales Coach, Merchandiser, Buyer Agent, Personal Shopper, Campaign Optimizer. Functional categories: Customer Service, Sales Development, Employee Support, Deep Research, Coaching, Product Recommendation, Scheduling. ([Salesforce Agentforce](https://www.salesforce.com/agentforce/))

- **Workday** organizes agents by business domain: Recruiting, Expenses, Succession, Document-Driven Accounting, Contract Intelligence, Frontline, Self-Service. ([Workday AI Agents](https://www.workday.com/en-us/artificial-intelligence/ai-agents.html))

- **Kore.ai** offers 250+ domain-specific templates across sales, marketing, HR, finance, customer service, healthcare. ([Kore.ai Marketplace](https://www.kore.ai/ai-marketplace))

**Google Cloud's 10 Business Functions are the strongest signal** for a universal taxonomy: Customer Support, Data Analysis, Finance & Accounting, Human Resources, IT Operations, Legal & Compliance, Marketing, Procurement & Supply Chain, Product Development, Sales.

### 6. Open-Source Agent Frameworks Don't Prescribe Taxonomy

- **CrewAI** defines agents by role/goal/backstory but provides no standard role catalog. Example roles: Researcher, Writer, Analyst, Manager. The CrewAI Marketplace (Q2 2025) accepts crew templates but doesn't impose categories. ([CrewAI Docs](https://docs.crewai.com/en/concepts/agents), [CrewAI Marketplace](https://docs.crewai.com/en/enterprise/features/marketplace))

- **AutoGen** (Microsoft) provides ConversableAgent, AssistantAgent, and UserProxyAgent as base classes. No predefined role catalog. ([AutoGen Agents](https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tutorial/agents.html))

- **LangChain** supports multi-agent patterns (subagents, handoffs, skills) but has no role taxonomy. ([LangChain Multi-Agent](https://docs.langchain.com/oss/python/langchain/multi-agent))

- **Anthropic's guidance** on building effective agents emphasizes architectural patterns (orchestrator-worker, evaluator-optimizer, routing) over role taxonomies. "Developers should design role structures based on specific use-case requirements rather than following standardized taxonomies." ([Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents))

**Implication for Sherpa:** No open-source framework has solved the taxonomy problem. This is an opportunity -- Sherpa could define the standard. But Anthropic's advice to avoid rigid taxonomies is notable.

### 7. The AI Agent Directory Ecosystem Shows Organic Categorization

- **AI Agents Directory** (2,227+ agents, 74 categories) has emergent, messy categories: AI Agents Platform (221), AI Video Agents (153), Productivity (147), Content Creation (89), Customer Service (81), Sales (63), Data Analysis (62), Research (50), Marketing (45), Coding Agent (34), AI Security (25), Finance (16), Operations AI Agents (15), Health Care (12), Legal (2). ([AI Agents Directory](https://aiagentsdirectory.com/categories))

- **TrillionAgent** claims "300+ human-equivalent roles" but doesn't publish the taxonomy. ([TrillionAgent](https://trillionagent.com))

**Implication for Sherpa:** Organic taxonomies become messy fast (74 overlapping categories). A curated, principled taxonomy is a differentiated product.

### 8. ITIL 4 Provides the Most Rigorous Role/Practice Framework

ITIL 4 defines 34 management practices across three domains:

- **General Management (14):** Architecture, Continual Improvement, Information Security, Knowledge Management, Measurement & Reporting, Organizational Change, Portfolio, Project, Relationship, Risk, Service Financial, Strategy, Supplier, Workforce & Talent
- **Service Management (17):** Availability, Business Analysis, Capacity & Performance, Change Enablement, Incident, IT Asset, Monitoring & Event, Problem, Release, Service Catalog, Service Configuration, Service Continuity, Service Design, Service Desk, Service Level, Service Request, Service Validation & Testing
- **Technical Management (3):** Deployment, Infrastructure & Platform, Software Development

([ITSM Tools: 34 ITIL 4 Practices](https://itsm.tools/34-itil-4-management-practices/))

Generic role types: Process Owner, Process Manager, Service Owner, Process Practitioner. ([IT Process Wiki](https://wiki.en.it-processmaps.com/index.php/ITIL_Roles))

**Implication for Sherpa:** ITIL's three-domain split (General / Service / Technical) is a proven organizational pattern for 34 practices. It validates separating "how the org works" (general management) from "what the org delivers" (service/technical).

### 9. SOC System: The Gold Standard for Occupational Taxonomy

The US Standard Occupational Classification has 23 major groups covering all occupations:
- Management, Business & Financial, Computer & Mathematical, Architecture & Engineering, Life/Physical/Social Science, Community & Social Service, Legal, Educational, Arts/Design/Entertainment/Media, Healthcare Practitioners, Healthcare Support, Protective Service, Food Preparation, Building Maintenance, Personal Care, Sales, Office & Administrative, Farming, Construction, Installation/Maintenance/Repair, Production, Transportation, Military

([BLS SOC System](https://www.bls.gov/soc/2018/major_groups.htm), [O*NET Taxonomy](https://www.onetcenter.org/taxonomy.html))

**Implication for Sherpa:** The SOC system proves that ~20 major groups can cover *all* human occupations. Our agent catalog will have 50-200 agents, far fewer than the ~867 detailed SOC occupations. 9-12 categories should be sufficient.

### 10. SAFe and Scrum Define Cross-Functional Role Types, Not Functional Categories

- **Scrum**: Product Owner, Scrum Master, Development Team (3-9 people). No functional categories. ([Scrum Institute](https://www.scrum-institute.org/Scrum_Roles_The_Scrum_Team.php))

- **SAFe**: Roles at four levels (Team → Program → Solution → Portfolio). Team: Scrum Master, Product Owner, Team Members. Program: Release Train Engineer, Product Manager. Solution: Solution Architect, Solution Train Engineer. Portfolio: Epic Owner, Enterprise Architect. ([World of Agile](https://worldofagile.com/blog/roles-in-safe/), [Agility.ac](https://agility.ac/frequent-agile-questions/what-are-the-roles-in-safe))

**Implication for Sherpa:** PM frameworks define meta-roles (who decides, who builds, who coordinates) rather than functional specialties. Sherpa should consider a `role-type` facet (e.g., planner | worker | reviewer | coordinator) separate from functional category.

### 11. Hierarchical vs. Faceted vs. Flat: Evidence for the 50-200 Item Range

**Flat taxonomy:**
- Works for <30 categories but doesn't scale. ([Hedden Information Management](https://www.hedden-information.com/when-a-taxonomy-should-not-be-hierarchical/))
- "Flat taxonomies are easy to implement but don't scale past 20-30 categories before becoming overwhelming." ([Matrix Flows](https://www.matrixflows.com/blog/knowledge-base-taxonomy-best-practices))

**Hierarchical taxonomy:**
- "Category hierarchies should not include more than 3 levels, with a maximum of 2 levels recommended." ([Hypotenuse AI](https://www.hypotenuse.ai/blog/mastering-seo-taxonomy-optimizing-your-ecommerce-website-structure))
- Good for narrow, homogeneous content. Brittle for cross-cutting concerns. ([Hedden](https://www.hedden-information.com/faceted-classification-and-faceted-taxonomies/))

**Faceted taxonomy:**
- "More suitable for broad and heterogeneous content." ([Hedden](https://www.hedden-information.com/faceted-classification-and-faceted-taxonomies/))
- "New facets may be created at any time without disruption." ([Wikipedia: Faceted Classification](https://en.wikipedia.org/wiki/Faceted_classification))
- "Facets are typically much simpler and shallower than hierarchical taxonomies, as each facet only considers one aspect." ([Hedden](https://www.hedden-information.com/faceted-classification-and-faceted-taxonomies/))
- NN/g recommends faceted search as a better alternative than extensive polyhierarchies for catalogs with significant category overlap. ([NN/g: Polyhierarchy](https://www.nngroup.com/articles/polyhierarchy/))

**Polyhierarchy (items in multiple categories):**
- Target puts Nintendo Switch under both "Video Games" and "Electronics" but avoids exhaustive cross-referencing. Restraint is essential. ([NN/g: Polyhierarchy](https://www.nngroup.com/articles/polyhierarchy/))
- "Keep polyhierarchy to a minimum to avoid confusion." ([Hedden: Polyhierarchy](https://www.hedden-information.com/polyhierarchy-in-taxonomies/))

**The hybrid recommendation (near-universal across sources):**
"A hybrid approach combining hierarchical primary navigation with faceted filtering and intelligent search." ([Adobe Experience Manager](https://experienceleague.adobe.com/en/docs/experience-manager-learn/sites/page-authoring/expert-advice/site-hierarchy))

**For 50-200 items specifically:**
- Hedden notes that a set of ~68 terms "can easily be browsed (even with some scrolling) without a hierarchy to organize it."
- The 7+/-2 rule is commonly cited but experts say it's irrelevant to navigation design -- what matters is "the number of links and density of links." ([Laws of UX: Miller's Law](https://lawsofux.com/millers-law/))

**Implication for Sherpa:** For a catalog of 50-200 agents, the optimal approach is: a flat primary category (9-12 categories, no deeper hierarchy) + multiple facet dimensions (tags, capabilities, topology type, model tier) + search. No hierarchy deeper than 1 level needed.

### 12. TBM Taxonomy Shows How to Do Universal Base + Industry Extensions

The Technology Business Management (TBM) Council maintains a universal taxonomy with industry extensions:
- **Universal base:** Covers all IT cost, consumption, and value modeling
- **7 industry extensions:** Federal Government, State Government, Healthcare Providers, Manufacturing, Banking, Insurance, Utilities
- Extensions tailor the Solutions Layer without replacing the base framework

([TBM Council: Taxonomy Extensions](https://www.tbmcouncil.org/learn-tbm/tbm-taxonomy/tbm-taxonomy-extensions/))

**Implication for Sherpa:** The extension model is the answer to "universal vs. industry-specific." Ship a universal base catalog + allow organizations to add industry-specific agent definitions that follow the same schema. Don't try to pre-build every industry.

### 13. Conway's Law Applied to Agent Catalogs

"One team per service leads to one service per team -- a Customer Support team builds a support agent, a Sales team builds a lead-qualification agent." Agent catalogs mirror organizational structure. ([Medium: Conway's Law for Agentic AI](https://medium.com/@amine.aitelharraj/-3eb5cd3dbcea), [Reynders.co](https://reynders.co/blog/how-organizations-shape-their-agentic-systems/))

The Inverse Conway Maneuver: "Instead of systems accidentally mirroring the org, you shape the org to mirror the architecture you want." ([Reynders.co](https://reynders.co/blog/how-organizations-shape-their-agentic-systems/))

**Implication for Sherpa:** An agent catalog is implicitly an org chart template. The taxonomy we ship signals to organizations how we think work should be organized. Choose categories that encourage good organizational patterns, not just reflect existing dysfunction.

### 14. HBR: Agent Managers and Organizational Placement

HBR (Feb 2026) introduces the "Agent Manager" role -- the person responsible for ensuring AI agents deliver business outcomes. Key finding: "Domain expertise matters more than AI expertise." Agent managers should sit inside business units, not IT. Three placement options: digital customer success, sales management with AI alignment, or cross-functional transformation office. ([HBR: Agent Managers](https://hbr.org/2026/02/to-thrive-in-the-ai-era-companies-need-agent-managers))

HBR (Jan 2026) reframes human roles as Owners (set strategic direction, define constraints) and Verifiers (audit outputs, handle exceptions, maintain accountability). ([HBR: Workplace AI Agents](https://hbr.org/2026/01/is-your-workplace-set-up-for-ai-agents))

**Implication for Sherpa:** The catalog should include meta-roles (coordinator, reviewer, planner) alongside functional roles. The "agent manager" pattern validates Sherpa's Judge/Planner roles as first-class catalog entries.

### 15. Hierarchical Multi-Agent Systems: Academic Taxonomy

A 2025 arxiv paper defines five taxonomy dimensions for multi-agent systems:
1. **Control Hierarchy** (centralized / decentralized / hybrid)
2. **Information Flow** (top-down / bottom-up / peer-to-peer)
3. **Role and Task Delegation** (fixed roles / emergent roles)
4. **Temporal Hierarchy** (strategic / tactical / operational)
5. **Communication Structure** (static / dynamic networks)

([arxiv: Taxonomy of Hierarchical Multi-Agent Systems](https://arxiv.org/html/2508.12683))

**Implication for Sherpa:** These are system-level architectural concerns, not role-level taxonomy. But "fixed vs. emergent roles" is relevant -- Sherpa's catalog provides fixed roles while the dispatch pipeline allows emergent role assembly.

---

## Synthesis: Recommended Taxonomy Architecture for Sherpa

### The Pattern That Recurs Everywhere

Every successful large-scale categorization system uses the same structure:

1. **A single primary dimension** for navigation (flat or shallow hierarchy)
2. **Multiple independent facets** for filtering and discovery
3. **Search** for direct access

This is true of consulting firms (function x industry), Google Cloud Agent Finder (function x industry x solution type), ITIL (general / service / technical), SOC (23 major groups → 98 minor → 459 broad → 867 detailed), and TBM (universal base + industry extensions).

### Recommended Primary Categories (10)

Based on convergence across consulting, enterprise platforms, and tech organizational patterns:

| Category | Maps To | Evidence |
|----------|---------|----------|
| **engineering** | Software development, architecture, DevOps | Universal in tech (Stripe, Linear, Vercel); SOC 15-0000; ITIL Technical Management |
| **product** | Product management, business analysis, strategy | McKinsey Strategy; SAFe Product Owner/Manager; Deloitte Strategy & Analytics |
| **design** | UX, UI, content design, design systems | Vercel Design Engineering; SOC 27-0000 (Arts/Design); agency-agents Design division |
| **research** | Market research, user research, data science | Google Cloud "Data Analysis"; McKinsey Analytics; CrewAI Researcher pattern |
| **quality** | QA, testing, code review, compliance | ITIL Service Validation & Testing; agency-agents Testing division; SAFe quality roles |
| **operations** | IT ops, infrastructure, deployment, SRE | McKinsey Operations; Google Cloud "IT Operations"; ITIL Service Management |
| **security** | AppSec, compliance, risk, audit | Google Cloud "Security"; McKinsey Risk & Resilience; ITIL Information Security |
| **data** | Data engineering, analytics, ML/AI | Google Cloud "Data Analysis"; SOC 15-0000 subset; Workday document agents |
| **marketing** | Content, growth, brand, communications | McKinsey Growth Marketing & Sales; Google Cloud "Marketing"; Deloitte Customer & Marketing |
| **governance** | Planning, coordination, review, meta-roles | SAFe Release Train Engineer; HBR Agent Manager; Sherpa's Planner/Worker/Judge |

**Changes from draft proposal:**
- Added **marketing** (appears in every consulting and enterprise taxonomy; too large to fold into "specialized")
- Renamed "specialized" to **governance** (meta-roles deserve their own category, not a catch-all)
- Kept the count at 10 (within the sweet spot; no deeper hierarchy needed)

### Recommended Facet Dimensions

Beyond the primary category, agents should be filterable by:

| Facet | Values | Source |
|-------|--------|--------|
| `tags` | Free-form keywords (react, python, accessibility, etc.) | Standard practice everywhere |
| `topology` | stream-aligned, platform, enabling, subsystem | Team Topologies |
| `role-type` | planner, worker, reviewer, coordinator | SAFe levels; Sherpa Planner/Worker/Judge |
| `model-tier` | high, medium, low | Already in schema spec |
| `industry` | (optional org-specific extensions) | TBM extension pattern; Google Cloud industries |

### Category Should Be a Tag, Not a Folder

**Strong recommendation:** Do not use directory-based categories (e.g., `agents/engineering/frontend-developer.yaml`). Instead, use a flat directory with category as a metadata field:

```
agents/
  frontend-developer.yaml    # category: engineering
  product-manager.yaml       # category: product
  security-auditor.yaml      # category: security
```

Reasons:
1. Agents that span categories (a "DevOps engineer" is both engineering and operations) can have a primary category + tags without polyhierarchy confusion
2. Adding/renaming categories doesn't require moving files
3. Flat browsing works for <200 items (Hedden: ~68 items browsable without hierarchy)
4. Search + faceted filtering handles discovery better than directory navigation
5. Matches how every successful agent marketplace works (Google Cloud, Salesforce, Kore.ai)

### The Extension Model

Following TBM's pattern:
- **Base catalog** (ships with Sherpa): 50-80 agents across 10 categories, domain-agnostic
- **Organization extensions**: Each Sherpa customer adds domain-specific agents using the same schema
- **Industry packs** (future): Pre-built extensions for common verticals (SaaS, consulting, e-commerce)

WavePoint's 13 astrology-specific roles are the first example of an organization extension.

---

## Open Questions

1. **Should "sales" be its own category or fold into "marketing"?** Google Cloud separates them. McKinsey combines them ("Growth, Marketing & Sales"). Agency-agents has a Sales division. For the initial catalog, marketing + sales could be one category with tags distinguishing them, splitting later if the catalog grows enough to warrant it.

2. **Where do "content" agents live?** Content creation spans marketing (blog posts), product (documentation), and design (copy). This is exactly the kind of cross-cutting concern that tags handle better than categories. Primary category by the *output type's home* (marketing for blog, product for docs), with a `content-creation` tag.

3. **Should governance include project management?** The agency-agents repo has a separate "Project Management" division. In Sherpa's model, project management behaviors (task decomposition, status tracking, dependency management) are what the Planner role-type does. A dedicated "project manager" agent lives in governance with `role-type: planner`.

4. **How to handle the agency-agents divisions that don't map cleanly?** "Spatial Computing," "Game Dev," and "Paid Media" are industry/domain verticals, not functional categories. These become tags or industry extensions, not top-level categories.

5. **Is 10 categories too many or too few for 50-80 agents?** At 50 agents, that's ~5 per category on average. Some categories (engineering, product) will have 10+; others (security, governance) might have 3-4. This distribution mirrors real organizations (engineering is always the biggest team). The asymmetry is a feature (Linear's "heirloom tomato" principle).

6. **Should the taxonomy be configurable per organization?** The schema already supports `category` as a metadata field. An organization could define its own categories. But the *default* categories matter enormously for first impressions and for the base catalog.

---

## Sources

### Consulting Firm Taxonomies
- [McKinsey Capabilities](https://www.mckinsey.com/capabilities) -- McKinsey's functional practice areas
- [McKinsey Hierarchy (CaseBasix)](https://www.casebasix.com/pages/mckinsey-hierarchy) -- Role levels and career progression
- [McKinsey (Management Consulted)](https://managementconsulted.com/mckinsey/) -- Practice areas and engagement structure
- [Deloitte Consulting (CaseBasix)](https://www.casebasix.com/pages/deloitte-consulting) -- Five service areas
- [Deloitte Services](https://www.deloitte.com/global/en/services.html) -- Global service offerings
- [Accenture Restructuring (Consulting.us)](https://www.consulting.us/news/11992/accenture-restructures-organization-makes-senior-appointments) -- 2025 consolidation
- [Accenture Firm Overview (CaseBasix)](https://www.casebasix.com/pages/accenture-firm-overview) -- Service lines
- [StrategyU: 15+ Kinds of Consulting](https://strategyu.co/consulting-industry/) -- Complete consulting type taxonomy
- [Consulting Success: 25 Types of Consulting](https://www.consultingsuccess.com/types-of-consulting) -- Comprehensive consulting categories
- [BCG Consulting Roles (CaseBasix)](https://www.casebasix.com/pages/bcg-consulting-roles-and-levels) -- Role hierarchy

### Tech Company Org Structures
- [Pragmatic Engineer: Inside Stripe's Engineering Culture Part 1](https://newsletter.pragmaticengineer.com/p/stripe) -- Stripe team structure
- [Pragmatic Engineer: Inside Stripe's Engineering Culture Part 2](https://newsletter.pragmaticengineer.com/p/stripe-part-2) -- Stripe org deep dive
- [Stripe Atlas: Scaling Engineering](https://stripe.com/guides/atlas/scaling-eng) -- Engineering org guide
- [Stripe Atlas: Organizations and Hypergrowth](https://stripe.com/guides/atlas/organizations-and-hypergrowth) -- Scaling patterns
- [Lenny's Newsletter: How Linear Builds Product](https://www.lennysnewsletter.com/p/how-linear-builds-product) -- Linear's no-PM, no-durable-teams approach
- [First Round: Linear Org Chart (Heirloom Tomatoes)](https://review.firstround.com/make-an-org-chart-you-want-to-ship-advice-from-linear-on-how-heirloom-tomatoes-should-inspire-team-design/) -- Asymmetric org design
- [Basecamp Shape Up](https://basecamp.com/shapeup/0.3-chapter-01) -- Small team methodology
- [Basecamp Shape Up: Adjust to Your Size](https://basecamp.com/shapeup/4.1-appendix-02) -- Scaling Shape Up
- [Vercel Design Engineering Blog](https://vercel.com/blog/design-engineering-at-vercel) -- Design engineering team

### Open-Source Agent Frameworks
- [CrewAI Agents Docs](https://docs.crewai.com/en/concepts/agents) -- Agent definition model
- [CrewAI Marketplace Docs](https://docs.crewai.com/en/enterprise/features/marketplace) -- Enterprise marketplace
- [CrewAI Examples (GitHub)](https://github.com/crewAIInc/crewAI-examples) -- Example agent projects
- [AutoGen Examples](https://microsoft.github.io/autogen/0.2/docs/Examples/) -- AutoGen example agents
- [AutoGen Agents](https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tutorial/agents.html) -- Agent class hierarchy
- [LangChain Multi-Agent](https://docs.langchain.com/oss/python/langchain/multi-agent) -- Multi-agent patterns
- [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) -- Agent architecture guidance
- [Anthropic: Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system) -- Production multi-agent architecture

### Enterprise Agent Platforms
- [Google Cloud Agent Finder](https://cloud.withgoogle.com/agentfinder/) -- 1,914+ agents, function x industry taxonomy
- [Salesforce Agentforce](https://www.salesforce.com/agentforce/) -- Predefined enterprise agents
- [Workday AI Agents](https://www.workday.com/en-us/artificial-intelligence/ai-agents.html) -- HR and finance agents
- [Kore.ai Marketplace](https://www.kore.ai/ai-marketplace) -- 250+ domain-specific templates
- [AI Agents Directory](https://aiagentsdirectory.com/categories) -- 2,227+ agents, 74 categories
- [TrillionAgent](https://trillionagent.com) -- 300+ human-equivalent roles
- [Relevance AI Workforce](https://relevanceai.com/workforce) -- No-code multi-agent platform
- [AWS Marketplace AI Agents](https://aws.amazon.com/marketplace/solutions/ai-agents-and-tools) -- Agent discovery hub

### ITSM/ITIL Frameworks
- [ITSM Tools: 34 ITIL 4 Practices](https://itsm.tools/34-itil-4-management-practices/) -- Complete practice list
- [IT Process Wiki: ITIL Roles](https://wiki.en.it-processmaps.com/index.php/ITIL_Roles) -- Generic role types
- [Invensis: ITIL 4 Roles](https://www.invensislearning.com/info/itil-roles-and-responsibilities) -- Role responsibilities
- [ITIL 4 Wiki](https://wiki.en.it-processmaps.com/index.php/ITIL_4) -- Framework overview

### Project Management Frameworks
- [World of Agile: SAFe Roles](https://worldofagile.com/blog/roles-in-safe/) -- Complete SAFe role list
- [Agility.ac: SAFe Roles](https://agility.ac/frequent-agile-questions/what-are-the-roles-in-safe) -- Role descriptions
- [Scrum Institute: Team Roles](https://www.scrum-institute.org/Scrum_Roles_The_Scrum_Team.php) -- Scrum role definitions
- [SAFe Framework](https://framework.scaledagile.com/) -- Official SAFe site

### Team Organization Models
- [Team Topologies](https://teamtopologies.com/key-concepts) -- Four fundamental team types
- [Martin Fowler: Team Topologies](https://martinfowler.com/bliki/TeamTopologies.html) -- Summary
- [Atlassian: Spotify Model](https://www.atlassian.com/agile/agile-at-scale/spotify) -- Squads/Tribes/Chapters/Guilds
- [IT Revolution: Product Taxonomy](https://itrevolution.com/articles/product-taxonomy-the-seven-domains-of-transformation/) -- Seven domains of transformation

### Taxonomy Design & Information Architecture
- [NN/g: Taxonomy 101](https://www.nngroup.com/articles/taxonomy-101/) -- Taxonomy fundamentals
- [NN/g: Polyhierarchy](https://www.nngroup.com/articles/polyhierarchy/) -- Multi-parent categories
- [Hedden: When Taxonomy Should Not Be Hierarchical](https://www.hedden-information.com/when-a-taxonomy-should-not-be-hierarchical/) -- Flat taxonomy criteria
- [Hedden: Faceted Classification](https://www.hedden-information.com/faceted-classification-and-faceted-taxonomies/) -- Faceted taxonomy guide
- [Hedden: Polyhierarchy in Taxonomies](https://www.hedden-information.com/polyhierarchy-in-taxonomies/) -- Multi-parent best practices
- [Springer: Taxonomies and Controlled Vocabularies](https://link.springer.com/article/10.1057/dam.2010.29) -- Academic best practices
- [Laws of UX: Miller's Law](https://lawsofux.com/millers-law/) -- 7+/-2 rule and its limitations

### Occupational Classification
- [BLS SOC System](https://www.bls.gov/soc/) -- Standard Occupational Classification
- [BLS SOC Major Groups](https://www.bls.gov/soc/2018/major_groups.htm) -- 23 major occupation groups
- [O*NET Taxonomy](https://www.onetcenter.org/taxonomy.html) -- 1,016 occupational titles

### Industry Extension Models
- [TBM Council: Taxonomy Extensions](https://www.tbmcouncil.org/learn-tbm/tbm-taxonomy/tbm-taxonomy-extensions/) -- Universal base + 7 industry extensions

### AI Agent Organizational Strategy
- [HBR: Agent Managers (Feb 2026)](https://hbr.org/2026/02/to-thrive-in-the-ai-era-companies-need-agent-managers) -- New enterprise role
- [HBR: Workplace AI Agents (Jan 2026)](https://hbr.org/2026/01/is-your-workplace-set-up-for-ai-agents) -- Owner/Verifier framework
- [Beam.ai: Agent Manager Role](https://beam.ai/agentic-insights/what-is-an-agent-manager-the-new-role-every-ai-company-needs-in-2026) -- Operational guidance
- [Gartner: AI Agents in Enterprise Apps](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025) -- 40% adoption prediction
- [Forrester: 2026 Predictions](https://www.forrester.com/blogs/predictions-2026-ai-agents-changing-business-models-and-workplace-culture-impact-enterprise-software/) -- Enterprise software impact

### Conway's Law & Agent Architecture
- [Medium: Conway's Law for Agentic AI](https://medium.com/@amine.aitelharraj/-3eb5cd3dbcea) -- Applying Conway's Law to agents
- [Reynders.co: How Organizations Shape Agentic Systems](https://reynders.co/blog/how-organizations-shape-their-agentic-systems/) -- Inverse Conway Maneuver
- [Team Topologies: AI Agents](https://teamtopologies.com/news-blogs-newsletters/2025/1/14/the-future-of-team-topologies-when-ai-agents-dominate) -- Future of team topologies
- [arxiv: Taxonomy of Hierarchical Multi-Agent Systems](https://arxiv.org/html/2508.12683) -- Five-dimensional academic taxonomy

### Multi-Agent Framework Comparisons
- [Top 7 Agentic AI Frameworks 2026 (AlphaMatch)](https://www.alphamatch.ai/blog/top-agentic-ai-frameworks-2026) -- Framework comparison
- [Medium: LangChain vs AutoGen](https://medium.com/@jdegange85/langchain-vs-autogen-a-comparison-of-multi-agent-frameworks-c864e8792cfee) -- Framework comparison
- [DigitalOcean: CrewAI Guide](https://www.digitalocean.com/community/tutorials/crewai-crash-course-role-based-agent-orchestration) -- Role-based orchestration
- [DataCamp: CrewAI Tutorial](https://www.datacamp.com/tutorial/crew-ai) -- Multi-agent examples
- [AWS: Multi-Agent Patterns](https://aws.amazon.com/blogs/machine-learning/multi-agent-collaboration-patterns-with-strands-agents-and-amazon-nova/) -- Collaboration patterns

---

## Raw Links (All URLs Encountered)

```
https://www.casebasix.com/pages/mckinsey-hierarchy
https://www.casebasix.com/pages/bcg-consulting-roles-and-levels
https://www.casebasix.com/pages/mbb-vs-big-4
https://www.preplounge.com/consulting-forum/roles-and-seniority-at-mckinsey-bcg-bain-6580
https://www.casebasix.com/pages/top-consulting-firms
https://www.preplounge.com/consulting-forum/position-levels-in-mckinsey-1126
https://www.joinleland.com/library/a/what-do-consultants-do-at-mckinsey-bcg-and-bain
https://www.preplounge.com/en/blog/consulting/firms/difference-mbb-and-big-four
https://caselane.ai/blog/consulting-application-deadlines-2025-2026
https://managementconsulted.com/accenture-vs-deloitte/
https://fireart.studio/blog/accenture-vs-deloitte-comparison/
https://www.casebasix.com/pages/accenture-vs-deloitte-comparison
https://www.casebasix.com/pages/accenture-firm-overview
https://www.casebasix.com/pages/deloitte-consulting
https://www.deloitte.com/global/en/services.html
https://www.britannica.com/money/Accenture
https://www.wallstreetoasis.com/forum/consulting/accenture-consulting-vs-deloitte-advisory-advice-on-the-offers
https://mconsultingprep.com/big-4-consulting-firms
https://www.consulting.us/news/11992/accenture-restructures-organization-makes-senior-appointments
https://stripe.com/guides/atlas/scaling-eng
https://meet-engineering-2025.vercel.app/
https://3.basecamp-help.com/article/34-how-we-work
https://stripe.com/guides/atlas/organizations-and-hypergrowth
https://newsletter.pragmaticengineer.com/p/stripe
https://www.clay.com/dossier/stripe-executives
https://newsletter.pragmaticengineer.com/p/stripe-part-2
https://stripe.com/blog/engineering
https://docs.crewai.com/en/concepts/agents
https://latenode.com/blog/ai-frameworks-technical-infrastructure/crewai-framework/crewai-framework-2025-complete-review-of-the-open-source-multi-agent-ai-platform
https://github.com/crewAIInc/crewAI
https://www.alphamatch.ai/blog/top-agentic-ai-frameworks-2026
https://www.projectpro.io/article/crew-ai-projects-ideas-and-examples/1117
https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-frameworks/crewai.html
https://www.digitalocean.com/community/tutorials/crewai-crash-course-role-based-agent-orchestration
https://www.datacamp.com/tutorial/crew-ai
https://bizzmarkblog.com/saas-solutions/crewai/
https://medium.com/@jeevitha.m/types-of-ai-agents-explained-with-crewai-examples-2b4e35146106
https://medium.com/@jdegange85/langchain-vs-autogen-a-comparison-of-multi-agent-frameworks-c864e8ef08ee
https://neon.com/blog/multi-agent-ai-solution-with-neon-langchain-autogen-and-azure-openai
https://medium.com/@akankshasinha247/agent-orchestration-when-to-use-langchain-langgraph-autogen-or-build-an-agentic-rag-system-cc298f785ea4
https://microsoft.github.io/autogen/0.2/docs/Examples/
https://arxiv.org/pdf/2308.08155
https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tutorial/agents.html
https://towardsdatascience.com/diving-deep-into-autogen-and-agentic-frameworks-3e161fa3c086/
https://microsoft.github.io/autogen/docs/Use-Cases/agent_chat/
https://medium.com/@yashwant.deshmukh23/langchain-autogen-and-crewai-2593e7645de7
https://docs.langchain.com/oss/python/langchain/multi-agent
https://wiki.en.it-processmaps.com/index.php/ITIL_Roles
https://www.invensislearning.com/info/itil-roles-and-responsibilities
https://www.simpliaxis.com/resources/itil-roles-and-responsibilities
https://blog.invgate.com/itil-roles-types-responsibilities
https://www.knowledgehut.com/blog/it-service-management/it-service-management-roles-and-responsibilities
https://en.wikipedia.org/wiki/IT_service_management
https://www.itsmprocesses.com/Wiki/Englisch/ITIL%20Roles.htm
https://itsm.tools/which-it-support-and-itsm-roles-does-your-organization-have-and-need/
https://www.startly.com/what-is-a-service-management-role/
https://www.itsm-docs.com/blogs/service-management/it-service-management-roles-and-responsibilities
https://www.pmi.org/learning/library/pm-role-lean-agile-world-9350
https://www.agilealliance.org/wp-content/uploads/2016/01/Mapping-the-PMI-Project-Manager-Role-to-a-Scrum-Master.pdf
https://www.qrpinternational.be/blog/glossary/key-safe-roles/
https://staragile.com/blog/roles-in-safe
https://www.project-management-prepcast.com/free/pmi-acp-exam/articles/848-agile-project-management-roles
https://www.pmi.org/learning/library/agile-project-management-scrum-6269
https://www.projectmanagement.com/articles/425207/Scrum-Framework-Team-Roles-and-How-Project-Management-Activities-Are-Distributed
https://worldofagile.com/blog/roles-in-safe/
https://www.knowledgehut.com/blog/agile/the-role-of-a-project-manager-in-an-agile-environment
https://www.scrum-institute.org/Scrum_Roles_The_Scrum_Team.php
https://experienceleague.adobe.com/en/docs/experience-manager-learn/sites/page-authoring/expert-advice/site-hierarchy
https://www.hypotenuse.ai/blog/mastering-seo-taxonomy-optimizing-your-ecommerce-website-structure
https://link.springer.com/article/10.1057/dam.2010.29
https://www.matrixflows.com/blog/knowledge-base-taxonomy-best-practices
https://digwp.com/2023/04/taxonomies-categories-tags/
https://www.nngroup.com/articles/taxonomy-101/
https://www.dotcms.com/docs/latest/taxonomies-and-tags
https://medium.com/prodsight/how-to-build-a-strong-tag-taxonomy-and-make-sense-of-your-feedback-f0eccb33d71f
https://syndigo.com/guides/taxonomy-101/
https://itrevolution.com/articles/product-taxonomy-the-seven-domains-of-transformation/
https://www.earley.com/insights/5-key-product-taxonomies-and-how-they-drive-your-business
https://documentation.softwareag.com/webmethods/compendiums/v10-3/C_API_Management/api-mgmt-comp/co-taxonomy_intro.html
https://www.crobox.com/blog/product-taxonomy-framework
https://www.dubberly.com/articles/taxonomy-of-models.html
https://www.pivotree.com/blog/how-product-taxonomy-powers-ecommerce/
https://www.cartesian.com/product-taxonomy-and-product-catalog/
https://link.springer.com/article/10.1007/s12599-021-00723-x
https://www.sciencedirect.com/science/article/pii/S0950584917300472
https://www.channelengine.com/en/blog/product-taxonomy-categorization-in-ecommerce
https://www.salesforce.com/agentforce/agent-builder/
https://relevanceai.com/
https://clevertap.com/blog/ai-agent-examples/
https://cloud.withgoogle.com/agentfinder/
https://www.salesforce.com/agentforce/
https://www.salesforce.com/sales/ai-sales-agent/guide/
https://www.ai21.com/knowledge/ai-agent-use-cases/
https://aiagentstore.ai/
https://www.workday.com/en-us/artificial-intelligence/ai-agents.html
https://hbr.org/2026/02/to-thrive-in-the-ai-era-companies-need-agent-managers
https://www.moveworks.com/us/en/resources/blog/workday-ai-agents-use-cases
https://www.nojitter.com/ai-automation/workday-s-new-hr-and-finance-ai-agents-aim-at-workflow-automation
https://newsroom.workday.com/2024-09-17-Workday-Announces-New-AI-Agents-to-Transform-HR-and-Finance-Processes
https://www.techtarget.com/searchhrsoftware/news/366625056/Workday-adds-seven-agents-to-Illuminate-platform
https://www.workday.com/en-us/perspectives/artificial-intelligence/2025/03/ai-agents-enterprise-how-will-they-change-way-we-work.html
https://www.workday.com/en-us/topics/ai/agentic-ai.html
https://itsm.tools/34-itil-4-management-practices/
https://www.knowledgehut.com/tutorials/it-service-management/itil4-tutorial/itil-management-practices-processes
https://itsm.tools/itil-4-explained/
https://invgate.com/itsm/itil/service-value-system
https://wiki.en.it-processmaps.com/index.php/ITIL_4
https://www.manageengine.com/products/service-desk/itsm/what-is-itil-4-service-value-chain.html
https://www.owlpoint.com/itil-4/itil-4-practices/
https://www.freshworks.com/itil/itil-4/
https://www.manageengine.com/products/service-desk/itsm/itil-4.html
https://itsm.tools/the-itil-4-service-value-system-explained/
https://agility.ac/frequent-agile-questions/what-are-the-roles-in-safe
https://worldofagile.com/blog/roles-in-safe/
https://www.6sigma.us/six-sigma-in-focus/scaled-agile-framework-roles/
https://staragile.com/blog/roles-in-safe
https://en.wikipedia.org/wiki/Scaled_agile_framework
https://www.enov8.com/blog/the-hierarchy-of-safe-scaled-agile-framework-explained/
https://echometerapp.com/en/what-are-the-levels-of-the-scaled-agile-framework/
https://sprintagile.com.au/roles-artefacts-and-ceremonies-of-scaled-agile-framework-in-a-nutshell/
https://framework.scaledagile.com/
https://www.inflectra.com/Ideas/Entry/scaled-agile-roles-1616.aspx
https://www.researchgate.net/figure/A-hierarchical-and-a-faceted-taxonomy_fig1_2945220
https://www.hedden-information.com/faceted-classification-and-faceted-taxonomies/
https://www.linkedin.com/advice/0/what-differences-between-hierarchical-56r2f
https://www.researchgate.net/figure/Hierarchical-vs-faceted-organization_fig10_32954494
https://en.wikipedia.org/wiki/Faceted_classification
https://www.consultmu.co.uk/faceted-v-hierarchical-taxonomies-why-all-the-fuss/
http://accidental-taxonomist.blogspot.com/2020/06/when-taxonomy-should-not-be-hierarchical.html
https://www.sciencedirect.com/topics/computer-science/faceted-classification
https://www.hedden-information.com/when-a-taxonomy-should-not-be-hierarchical/
https://www.mckinsey.com/capabilities
https://www.mckinsey.com/careers/meet-our-people/careers-blog/pick-a-role
https://managementconsulted.com/mckinsey/
https://www.mckinsey.com/locations/mckinsey-client-capabilities-network/our-work
https://www.mckinsey.com/business-functions/risk-and-resilience/how-we-help-clients/about-this-practice
https://en.wikipedia.org/wiki/McKinsey_&_Company
https://casecoach.com/b/why-mckinsey/
https://www.quora.com/What-is-more-about-the-specializations-specific-practice-areas-of-different-McKinsey-offices-across-the-globe
https://caseinterview.com/mckinsey-careers
https://www.mckinsey.com/industries
https://managementconsulted.com/mckinsey-hierarchy/
https://strategyu.co/consulting-roles/
https://www.casebasix.com/pages/what-does-a-partner-at-mckinsey-do
https://www.casebasix.com/pages/what-does-an-associate-at-mckinsey-do
https://www.casebasix.com/pages/what-is-the-difference-between-engagement-manager-and-partner-at-mckinsey
https://www.mckinsey.com/careers/search-jobs/jobs/associate-15178
https://strategycase.com/mckinsey-hierarchy-and-salary/
https://slidescience.co/mckinsey-roles-levels-salary/
https://www.deloitte.com/global/en/services/consulting/services/human-capital.html
https://www.deloitte.com/us/en/services/consulting/services/about-our-hr-transformation-services.html
https://www.deloitte.com/global/en/services/consulting/services/human-capital-as-a-service.html
https://www.deloitte.com/us/en/services/consulting/services/human-capital.html
https://www.deloitte.com/us/en/services/consulting/services/human-capital-insights-innovation-operate.html
https://www.deloitte.com/southeast-asia/en/services/consulting/perspectives/2025-human-capital-trends.html
https://www.deloitte.com/us/en/services/consulting/articles/human-capital-and-hr-trends-thought-leadership.html
https://www.accenture.com/us-en/about/consulting-index
https://en.wikipedia.org/wiki/Accenture
https://managementconsulted.com/accenture/
https://www.dcfmodeling.com/blogs/vision/acn-mission-vision
https://www.casebasix.com/pages/working-at-accenture-strategy
https://www.accenture.com/us-en/services/technology-transformation/technology-strategy
https://fourweekmba.com/accenture-business-model-in-a-nutshell/
https://newsroom.accenture.com/fact-sheet
https://docs.crewai.com/en/enterprise/features/marketplace
https://marketplace.crewai.com/
https://github.com/crewAIInc/marketplace-crew-template
https://github.com/crewAIInc/marketplace-crew-template/blob/main/README.md
https://crewai.com/
https://crewai.com/open-source
https://crewai.com/amp
https://www.ibm.com/think/topics/crew-ai
https://github.com/crewAIInc/crewAI-examples
https://www.microsoft.com/en-us/microsoft-copilot/copilot-101/ai-agents-types-and-uses
https://www.microsoft.com/en-us/microsoft-365/blog/2026/03/09/powering-frontier-transformation-with-copilot-and-agents/
https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/agents-overview
https://www.microsoft.com/en-us/microsoft-copilot/copilot-101/copilot-ai-agents
https://www.microsoft.com/en-us/microsoft-365-copilot/agents
https://www.microsoft.com/en-us/microsoft-365/blog/2025/11/18/microsoft-agent-365-the-control-plane-for-ai-agents/
https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-gpt-overview
https://code.visualstudio.com/docs/copilot/agents/overview
https://www.ramsac.com/blog/microsoft-copilot-agents-explained-what-you-really-need-to-know/
https://www.kore.ai/ai-marketplace
https://www.kore.ai/
https://www.kore.ai/ai-agent-platform
https://www.kore.ai/ai-for-work
https://docs.kore.ai/agent-platform/ai-agents/agentic-apps/marketplace/
https://www.kore.ai/ai-agent-platform/integrations
https://marketplace.kore.ai/
https://www.kore.ai/about-us
https://www.kore.ai/blog/7-best-agentic-ai-platforms
https://aws.amazon.com/marketplace/pp/prodview-aqvqtrrbtj72q
https://aiagentsdirectory.com/
https://aiagentsdirectory.com/categories
https://trillionagent.com
https://aiagentstore.ai/ai-agents-platform
https://dev.to/aiagentstore/ai-agent-directory-in-ai-agent-store-4dif
https://aiagents.directory/
https://agentispro.com/ai-agents-directory-guide/
https://docs.aws.amazon.com/marketplace/latest/buyerguide/ai-agent-discovery.html
https://aws.amazon.com/about-aws/whats-new/2025/07/ai-agents-tools-aws-marketplace/
https://aws.amazon.com/blogs/apn/aws-partner-guide-to-ai-agents-and-tools-in-aws-marketplace/
https://aws.amazon.com/about-aws/whats-new/2025/11/aws-marketplace-agent-mode-ai-enhanced-search/
https://www.channelinsider.com/ai/the-new-aws-marketplace-category-for-ai-agents-and-tools/
https://aws.amazon.com/marketplace/solutions/ai-agents-and-tools
https://docs.aws.amazon.com/marketplace/latest/userguide/ai-agents-tools.html
https://www.pymnts.com/artificial-intelligence-2/2025/aws-unveils-ai-agent-marketplace-as-one-stop-shop-for-enterprise-deployment/
https://aws.amazon.com/blogs/awsmarketplace/aws-marketplace-simplifying-the-path-from-discovery-to-deployment-in-the-ai-era/
https://docs.aws.amazon.com/marketplace/latest/userguide/listing-saas-ai-agents.html
https://www.nngroup.com/topic/information-architecture/
https://www.nngroup.com/videos/polyhierarchy-information-architecture/
https://www.nngroup.com/videos/information-architecture-models/
https://www.nngroup.com/reports/topic/information-architecture/
https://www.knowledge-architecture.com/blog/intranet-best-practices-research-findings-from-nielsen-norman-group-and-knowledge-architecture
https://www.nngroup.com/articles/ia-study-guide/
https://www.nngroup.com/courses/information-architecture/
https://blog.uxtweak.com/information-taxonomy/
https://www.nngroup.com/reports/intranet-information-architecture-design-methods/
https://www.nngroup.com/articles/polyhierarchy/
https://db.arabpsychology.com/the-magical-number-seven-plus-or-minus-two-2/
https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two
https://elearningindustry.com/magical-number-seven-plus-minus-two-memory-affects-the-perception-of-information
https://instructionaldesignjunction.com/2021/08/23/george-a-millers-7-plus-or-minus-2-rule-and-simon-and-chases-chunking-principle/
https://lawsofux.com/millers-law/
https://www.digital-web.com/news/2004-09-rule-of-seven/
https://www.researchgate.net/publication/10255186_The_Magical_Number_Seven_Plus_Or_Minus_2_Some_Limits_On_Our_Capacity_for_Processing_Information
https://blog.uxtweak.com/millers-law/
https://www.historyofinformation.com/detail.php?id=3384
https://vulpinecreations.com/blog/712-seven-plus-or-minus-two-why-overloading-working-memory-makes-method-invisible
https://hbr.org/2026/02/to-thrive-in-the-ai-era-companies-need-agent-managers
https://hbr.org/2026/01/is-your-workplace-set-up-for-ai-agents
https://beam.ai/agentic-insights/what-is-an-agent-manager-the-new-role-every-ai-company-needs-in-2026
https://hbr.org/sponsored/2026/02/a-blueprint-for-enterprise-wide-agentic-ai-transformation
https://hbr.org/podcast/2026/02/with-rise-of-agents-we-are-entering-the-world-of-identic-ai
https://www.reltio.com/resources/blog/hbr-research-agentic-ai-will-reshape-business-but-only-trusted-data-can-make-it-work/
https://www.brianheger.com/agentic-ai-is-already-changing-the-workforce-harvard-business-review/
https://hbr.org/2026/03/how-deep-industry-research-agents-can-change-your-organization
https://www.brianheger.com/how-ai-is-redefining-managerial-roles-harvard-business-review/
https://store.hbr.org/product/to-thrive-in-the-ai-era-companies-need-agent-managers/H092LZ
https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025
https://www.devopsdigest.com/gartner-40-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026
https://www.uctoday.com/unified-communications/gartner-predicts-40-of-enterprise-apps-will-feature-ai-agents-by-2026/
https://www.forrester.com/blogs/predictions-2026-ai-agents-changing-business-models-and-workplace-culture-impact-enterprise-software/
https://www.processexcellencenetwork.com/ai/news/gartner-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026
https://joget.com/ai-agent-adoption-in-2026-what-the-analysts-data-shows/
https://consumergoods.com/gartner-predicts-sharp-rise-ai-agents-within-enterprise-applications-2026
https://onereach.ai/blog/what-shapes-enterprise-ai-agents-in-the-future/
https://www.rockingrobots.com/40-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-in-2025/
https://www.gartner.com/en/newsroom/press-releases/2025-10-20-gartner-identifies-the-top-strategic-technology-trends-for-2026
https://www.matrixflows.com/blog/10-best-practices-for-creating-taxonomy-for-your-company-knowledge-base
https://refactoring.guru/design-patterns/classification
https://www.tbmcouncil.org/learn-tbm/tbm-taxonomy/tbm-taxonomy-extensions/
https://blog.actualog.com/universal-categories-vs-universal-groups-of-attributes/
https://enterprise-knowledge.com/taxonomy-and-information-architecture-for-the-semantic-layer/
https://ecs.syr.edu/faculty/fawcett/Handouts/cse776/Lecture20/References/Thesis-Magnus.htm
https://uxmag.com/articles/a-common-design-taxonomy
https://startwithdata.co.uk/insight/the-ultimate-guide-to-taxonomy-and-attribution-in-ecommerce/
https://teamtopologies.com/key-concepts
https://martinfowler.com/bliki/TeamTopologies.html
https://www.atlassian.com/devops/frameworks/team-topologies
https://itrevolution.com/articles/four-team-types/
https://framework.scaledagile.com/organizing-agile-teams-and-arts-team-topologies-at-scale/
https://teamtopologies.com/book
https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies
https://yoan-thirion.gitbook.io/knowledge-base/xtrem-reading/resources/book-notes/team-topologies
https://www.port.io/glossary/team-topologies
https://medium.com/@tpierrain/team-topologies-explained-to-ted-lasso-eb6e7792cfea
https://www.atlassian.com/agile/agile-at-scale/spotify
https://productschool.com/blog/product-fundamentals/spotify-model-scaling-agile
https://echometerapp.com/en/agile-spotify-model-squads-tribes-chapters-and-guilds-explained/
https://achardypm.medium.com/agile-team-organisation-squads-chapters-tribes-and-guilds-80932ace0fdc
https://www.wrike.com/agile-guide/squads-tribes-guilds/
https://blog.crisp.se/wp-content/uploads/2012/11/SpotifyScaling.pdf
https://www.createq.com/en/software-engineering-hub/spotify-squad-framework
https://www.launchnotes.com/blog/decoding-the-spotify-model-for-agile-scaling
https://www.functionly.com/orginometry/real-org-charts/spotify-org-structure
https://businessmap.io/blog/spotify-model
https://www.lennysnewsletter.com/p/how-linear-builds-product
https://linear.app/method/manage-design-projects
https://sequoiacap.com/article/linear-spotlight/
https://www.morgen.so/blog-posts/linear-project-management
https://x.com/lennysan/status/1706685617726443842
https://theorg.com/org/linear/teams/product-and-design-team
https://linear.app/
https://review.firstround.com/make-an-org-chart-you-want-to-ship-advice-from-linear-on-how-heirloom-tomatoes-should-inspire-team-design/
https://creately.com/blog/diagrams/types-of-organizational-charts/
https://www.marcusmth.com/linear-project-organization-guide
https://basecamp.com/shapeup/4.1-appendix-02
https://basecamp.com/shapeup/4.0-appendix-01
https://basecamp.com/shapeup/0.3-chapter-01
https://basecamp.com/shapeup/3.4-chapter-13
https://www.curiouslab.io/blog/what-is-basecamps-shape-up-method-a-complete-overview
https://basecamp.com/shapeup
https://spencerfarley.com/2023/11/30/shape-up-small-teams/
https://3.basecamp-help.com/article/412-hill-charts
https://medium.com/@povilaskorop/basecamps-shape-up-review-or-how-to-scope-and-manage-projects-358bdfa122f
https://www.prodify.group/blog/book-report-5-key-takeaways-from-shape-up-by-basecamps-ryan-singer
https://vercel.com/blog/design-engineering-at-vercel
https://theorg.com/org/vercel/teams/engineering-team
https://vercel.com/solutions/design-engineering
https://getlatka.com/companies/vercel
https://meet-engineering-2025.vercel.app/
https://vercel.com/careers
https://vercel.com/careers/design-engineer-product-uk-us-5056771004
https://vercel.com/careers/software-engineer-vercel-marketplace-5387745004
https://www.alancharlesworth.me/posts/design-engineering-at-vercel
https://www.anthropic.com/engineering/multi-agent-research-system
https://code.claude.com/docs/en/agent-teams
https://www.sitepoint.com/anthropic-claude-code-agent-teams/
https://www.anthropic.com/research/building-effective-agents
https://techkraftinc.com/scaling-enterprise-ai-with-anthropic-agent-skills-architecture-and-best-practices/
https://www.constellationr.com/blog-news/insights/anthropics-multi-agent-system-overview-must-read-cios
https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them
https://aimultiple.com/building-ai-agents
https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea
https://github.com/wshobson/agents
https://medium.com/@josef-dijon/from-code-to-conway-architecting-the-future-with-agentic-ai-teams-3b4b1ebedc05
https://reynders.co/blog/how-organizations-shape-their-agentic-systems/
https://amplefai.com/blog/future-of-teams
https://martinfowler.com/bliki/ConwaysLaw.html
https://practicaldatamodeling.substack.com/p/conways-law-and-data-modeling
https://www.computerweekly.com/blog/CW-Developer-Network/AI-workflow-StrongestLayer-Why-Conways-Law-changes-everything
https://deviq.com/laws/conways-law/
https://www.syntaxia.com/post/conways-law
https://www.microsoft.com/en-us/microsoft-365-life-hacks/organization/what-is-conways-law
https://www.graphapp.ai/blog/understanding-conway-s-law-how-organizational-structure-influences-software-design
https://teamtopologies.com/news-blogs-newsletters/2025/1/14/the-future-of-team-topologies-when-ai-agents-dominate
https://arxiv.org/html/2508.12683
https://zylos.ai/research/2026-03-08-ai-agent-delegation-team-coordination-patterns
https://medium.com/@amine.aitelharraj/-3eb5cd3dbcea
https://aws.amazon.com/blogs/machine-learning/multi-agent-collaboration-patterns-with-strands-agents-and-amazon-nova/
https://www.confluent.io/blog/event-driven-multi-agent-systems/
https://arxiv.org/pdf/2508.12683
https://arxiv.org/pdf/2507.18224
https://arxiv.org/html/2410.11782v1
https://tetrate.io/learn/ai/multi-agent-systems
https://www.hedden-information.com/polyhierarchy-in-taxonomies/
https://berkeley.pressbooks.pub/tdo4p/chapter/faceted-classification/
https://www.knowledgespeak.com/ontospeak/faceted-classification-and-faceted-taxonomies/
https://journalofia.org/volume2/issue2/04-fricke/
https://www.sanity.io/guides/faceted-taxonomy-setup-use
https://grokipedia.com/page/Faceted_classification
https://managementconsulted.com/top-consulting-firms/
https://strategyu.co/consulting-industry/
https://www.consultingsuccess.com/types-of-consulting
https://sashandcompany.com/consultancy/types-of-strategy-consulting-projects/
https://www.ibm.com/consulting/promontory
https://www.myconsultingoffer.org/what-is-consulting/types-of-consulting-firms/
https://aurorafinancials.com/top-strategy-consulting-companies-to-watch-in-2025/
https://www.consulting.us/rankings/top-consulting-firms-in-the-us-by-area-of-expertise/risk-compliance
https://www.myconsultingoffer.org/what-is-consulting/tier-2-consulting-firms/
https://www.bls.gov/soc/2018/major_groups.htm
https://www.bls.gov/soc/
https://www.onetcenter.org/taxonomy.html
https://en.wikipedia.org/wiki/Standard_Occupational_Classification_System
https://lmi.workforcegps.org/resources/2015/06/18/11/24/SOC_Standard_Occupational_Coding_System
https://www.bls.gov/soc/soc_2010_class_and_coding_structure.pdf
https://kb.lightcast.io/en/articles/8078633-us-o-net-soc-occupation-taxonomy-o-net
https://dlr.sd.gov/lmic/soc_overview.aspx
https://kb.lightcast.io/en/articles/7136419-us-standard-occupation-classification-soc
https://kb.lightcast.io/en/articles/7934158-standard-occupation-classification-soc-us
https://relevanceai.com/workforce
https://relevanceai.com/docs/get-started/introduction
https://relevanceai.com/blog/building-an-ai-agent-team
https://github.com/RelevanceAI/relevanceai
https://relevanceai.com/blog/the-anatomy-of-an-ai-agent
https://relevanceai.com/multi-agents
https://deepgram.com/ai-apps/relevance-ai
https://www.analyticsvidhya.com/blog/2024/11/build-an-agent-using-relevance-ai/
https://www.godofprompt.ai/blog/how-to-create-an-ai-agent-with-relevanceai-quick-and-easy-guide
https://beam.ai/agentic-insights/agent-deployment-engineers-the-evolution-of-deployment-roles-in-enterprise-software
https://beam.ai/platform
https://beam.ai/
https://eliteai.tools/tool/beam.ai
https://beam.ai/careers/head-of-operations
https://beam.ai/agentic-insights/5-ready-to-use-ai-agent-templates-that-save-40-hours-per-week
https://beam.ai/solutions/company-size/enterprise
https://skywork.ai/skypage/en/Beam-AI-In-Depth:-Your-2025-Guide-to-Agentic-Process-Automation/1975589906492878848
https://docs.beam.cloud/v2/agents/introduction
https://skillsmp.com
https://skillsmp.com/categories
https://www.opensourceprojects.dev/post/1c26f6a8-e7c4-4ee5-85f2-0ef86fa8ab11
https://www.larrybrain.com/docs
https://aiagents.wiki/skills
https://pinggy.io/blog/ai_agent_skills/
https://www.aitoolsspace.com/en/tools/agentskills
https://agent.ai/
https://www.aiagentstore.io/
https://itrevolution.com/articles/seven-domains-of-transformation/
https://itrevolution.com/architecture-the-seven-domains-of-transformation/
https://itrevolution.com/articles/business-and-technology-synchronicity-the-seven-domains-of-transformation/
https://itrevolution.com/articles/funding-model-the-seven-domains-of-transformation/
https://itrevolution.com/workforce-and-talent-the-seven-domains-of-transformation/
https://itrevolution.com/culture-and-leadership-the-seven-domains-of-transformation/
https://itrevolution.com/articles/transformation-implementation/
https://veracitysolutions.com/7-domains-of-the-project-to-product-transformation/
https://itrevolution.com/articles/project-to-product-transformation-case-study-fortune-100-retail-enterprise/
https://cloud.google.com/blog/topics/startups/four-steps-for-startups-to-build-multi-agent-systems
https://codelabs.developers.google.com/codelabs/production-ready-ai-roadshow/1-building-a-multi-agent-system/building-a-multi-agent-system
https://cloud.google.com/blog/products/ai-machine-learning/build-and-manage-multi-system-agents-with-vertex-ai
https://developer.microsoft.com/blog/designing-multi-agent-intelligence
https://dev.to/eira-wexford/how-to-build-multi-agent-systems-complete-2026-guide-1io6
https://cloud.google.com/blog/topics/developers-practitioners/build-your-first-adk-agent-workforce
https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/building-a-digital-workforce-with-multi-agents-in-azure-ai-foundry-agent-service/4414671
https://google.github.io/adk-docs/agents/multi-agents/
https://github.com/agentsystems/agent-template
https://poetsandquants.com/2025/12/09/consulting-exit-ramps-where-mckinsey-bain-bcg-professionals-are-headed/
https://www.mckinsey.com/capabilities/growth-marketing-and-sales/how-we-help-clients/about-this-practice
https://www.mckinsey.com/capabilities/growth-marketing-and-sales/how-we-help-clients/digital-marketing
https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-people
https://www.mckinsey.com/capabilities/growth-marketing-and-sales/how-we-help-clients/digital-marketing-operations-and-technology
https://www.mckinsey.com/capabilities/growth-marketing-and-sales/solutions/mckinsey-sciences-for-growth
```
