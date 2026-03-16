# Convention Accessibility Research

**Question:** How do file/document-based governance and convention systems make themselves accessible to users with varying technical comfort levels? What patterns bridge the gap between CLI-native engineers and GUI-native product/design roles?

**Date:** 2026-03-15

---

## Key Discoveries

### 1. GitHub: Layering Abstraction Without Removing the Foundation

GitHub's core strategy is building **parallel interfaces at increasing abstraction levels** on top of the same git data.

- **Web file editing eliminates the CLI entirely for simple operations.** The `github.dev` editor (press `.` on any repo) gives a full VS Code-like editing experience in the browser. Users edit markdown, commit changes, and never touch a terminal. The underlying git operations (commit, branch, push) happen invisibly. ([GitHub Docs: github.dev web-based editor](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor))

- **Issues and Projects are a PM layer on top of the repo.** GitHub Projects provides table, board (kanban), and roadmap (timeline) views of the same underlying issue data. PMs interact with cards, drag items between columns, and set dates -- the fact that these are backed by git-tracked issue metadata is invisible. ([GitHub Features: Issues](https://github.com/features/issues), [GitHub Docs: About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects))

- **One-click merge conflict resolution abstracts git's hardest concept.** GitHub added "Accept incoming / Accept current / Accept both" buttons directly in the web editor, replicating VS Code's merge UI. Simple conflicts never require the CLI. Complex ones gracefully degrade to "resolve locally." ([GitHub Changelog, Oct 2025](https://github.blog/changelog/2025-10-02-one-click-merge-conflict-resolution-now-in-the-web-interface/))

- **@mentions and cross-references create a communication layer that non-technical users already understand.** Tagging someone in an issue or PR uses the same mental model as Slack or email. The underlying git graph is invisible. ([Ben Balter: GitHub for Non-Technical Roles](https://ben.balter.com/2023/03/02/github-for-non-technical-roles/))

**Pattern:** Same data, multiple access tiers. Engineers use CLI/API. PMs use web board views. Everyone converges on the same artifacts.

### 2. Notion: The Block Model Makes Structure Feel Like Freeform

Notion's key innovation is making structured data feel like a simple document by unifying everything into blocks.

- **Everything is a block -- text, images, database rows, pages.** There is no conceptual boundary between "writing a document" and "filling in a database." A database row IS a page. A page can contain a database. The user never has to choose between "document mode" and "database mode." ([Notion Blog: Data Model Behind Notion](https://www.notion.com/blog/data-model-behind-notion))

- **Views are projections, not copies.** Table, board, calendar, gallery, and timeline views all show the same underlying data. When you change data in any view, it appears in all others. Each team member can create personalized views without affecting others. ([Stephen Ou: The Beauty of Notion](https://stephenou.com/beauty-of-notion))

- **Type transformation preserves data.** Changing a block from a heading to a callout keeps background color, text, and other properties. Changing a property type (e.g., text to select) migrates values gracefully. This forgiveness makes non-technical users confident to experiment. ([Stephen Ou: The Beauty of Notion](https://stephenou.com/beauty-of-notion))

- **Templates teach conventions through example, not documentation.** Notion personalizes which 5 templates a new user sees based on their signup questionnaire. Templates contain demo data so users see the pattern in action rather than reading about it. The onboarding uses learn-by-doing: interactive checklists where completing items teaches product conventions. ([Appcues: Notion's Lightweight Onboarding](https://goodux.appcues.com/blog/notions-lightweight-onboarding))

- **Smart defaults encode conventions invisibly.** When you create a new page while a filtered view is selected, the filters are automatically applied to the new page. The convention is enforced without the user knowing it exists. ([Stephen Ou: The Beauty of Notion](https://stephenou.com/beauty-of-notion))

**Pattern:** Unify structure and freeform into one model. Teach conventions through pre-filled templates, not docs. Make conventions self-enforcing through smart defaults.

### 3. Linear: Opinionated Defaults as Convention Delivery

Linear's core thesis is that **opinionated defaults reduce decision fatigue** and that flexible tools create chaos at scale.

- **Default workflows encode best practices.** Issues move Triage -> Backlog -> In Progress -> Done by default. Teams don't configure this; they opt out of it if needed. This is convention delivery through defaults rather than documentation. ([Linear Method: Introduction](https://linear.app/method/introduction))

- **Triage is a shared inbox, not a backlog.** New issues from integrations or other teams land in Triage -- a separate space where they must be explicitly accepted or rejected before entering the team's workflow. This forces a governance step (review before work) without calling it governance. ([Linear Docs: Triage](https://linear.app/docs/triage))

- **Automatic status transitions remove process overhead.** When a developer copies a git branch name, the issue moves to In Progress. When a PR is opened, it moves to In Review. When merged, it moves to Done. PMs see progress without developers "managing tickets." ([Linear Docs: Configuring Workflows](https://linear.app/docs/configuring-workflows))

- **Cycles replace manually managed sprints.** Automated, time-boxed periods with automatic rollover of incomplete work. The convention (iterate in fixed cycles) is baked into the tool rather than taught through process documentation. ([Linear App Reviews](https://www.morgen.so/blog-posts/linear-project-management))

- **"Build with the end users -- the creators -- in mind."** Linear's stated principle is that keeping individuals productive is more important than generating perfect reports. This directly addresses the tension between governance (reports, status) and productivity (building things). ([Linear Method](https://linear.app/method))

**Pattern:** Encode conventions as defaults. Make the right thing the easy thing. Automate status transitions so governance happens as a side effect of doing work, not as separate process overhead.

### 4. Markdown-Based Systems: The Editing Mode Spectrum

Obsidian, Docusaurus, and the CMS ecosystem show distinct strategies for the raw-files-to-GUI spectrum.

- **Obsidian's Live Preview is a hybrid mode.** The rendered markdown is shown by default; only the line you're editing shows raw syntax. This lets non-markdown-fluent users read and navigate comfortably while preserving the "files on disk" mental model for power users. ([Obsidian Forum: Live Preview](https://forum.obsidian.md/t/switch-between-markdown-wysiwyg-editing-mode/52434))

- **Obsidian Publish provides a read-only web layer.** Notes render as a website with hover previews (like Wikipedia), graph views, and navigation. Consumers interact with a polished web UI; producers work in the desktop app with files. This cleanly separates the authoring interface from the consumption interface. ([Obsidian Publish](https://obsidian.md/publish))

- **TinaCMS turns frontmatter YAML into visual forms.** Content editors see form fields (title, description, tags) instead of YAML syntax. Changes write back to markdown files in git. Developers define the schema; editors interact with forms. The underlying file format is invisible to non-technical users. ([TinaCMS](https://tina.io/), [Vercel Blog: Visual Editing Meets Markdown](https://vercel.com/blog/visual-editing-meets-markdown))

- **Nuxt Studio generates forms from Zod schemas.** Frontmatter schemas defined in code automatically become visual form editors with icon pickers, media selectors, and custom inputs. The schema IS the form. ([Nuxt Content: Frontmatter Form](https://content.nuxt.com/changelog/frontmatter-form))

- **Docusaurus acknowledges the gap.** Its own feature request board has "Make Content Editing Easier" as a top request. The solution ecosystem (Dhub, CloudCannon, Netlify CMS) exists precisely because raw markdown + git is too high a barrier for non-developers. ([Docusaurus Feature Requests](https://docusaurus.io/feature-requests/p/make-content-editing-easier))

**Pattern:** Separate authoring from consumption. For authoring, offer a rendering spectrum from raw markdown to live preview to full WYSIWYG. For structured metadata, generate forms from schemas so non-technical users never see YAML.

### 5. Convention Accessibility: Teaching Without Docs

Multiple systems converge on patterns for making conventions learnable without requiring users to read documentation.

- **Progressive disclosure: show essentials first, reveal complexity on demand.** GitLab's Pajamas design system codifies this: primary content immediately visible, secondary easily accessible, supporting information behind explicit triggers. They warn that 3+ nested levels of disclosure signals excessive complexity. ([GitLab Pajamas: Progressive Disclosure](https://design.gitlab.com/patterns/progressive-disclosure/))

- **Golden paths: pre-built templates that encode conventions.** Backstage (Spotify) uses Software Templates where developers fill in form fields and get a correctly-structured project with CI/CD already configured. The convention (project structure, naming, tooling) is delivered through the template, not a style guide. Template-driven creation cut service creation from ~1 week to ~10 minutes. ([Backstage.io](https://backstage.io/), [Platform Engineering Blog](https://platformengineering.org/blog/backstage-implementations-for-more-than-100k-developers))

- **Learn-by-doing beats read-then-do.** Notion's onboarding uses interactive checklists where completing items teaches the product. High-contrast tooltips appear contextually as users explore. Templates contain demo data showing the pattern in action. ([Appcues: Notion Onboarding](https://goodux.appcues.com/blog/notions-lightweight-onboarding), [Durran: Notion Onboarding](https://www.durran.co/blog/notion---onboarding-new-users-through-complex-workflows))

- **Guardrails over gates: make violations visible, not impossible.** Convention-over-configuration works when the default path follows conventions and deviating requires explicit action. But conventions must be "continually resold to each developer" -- one violation can compromise the whole structure. ([Grokipedia: Convention over Configuration](https://grokipedia.com/page/Convention_over_configuration))

- **Form-based creation enforces structure without teaching it.** When creating a new item requires filling in a form with defined fields (status, type, risk level), the convention is enforced at creation time. The user doesn't need to know the YAML schema; they interact with dropdowns and text inputs. ([GitCMS: Frontmatter Editor](https://gitcms.blog/posts/frontmatter-editor/))

- **Figma Dev Mode: same artifact, role-specific view.** Designers see the canvas; developers see inspect panels, tokens, and code snippets. The artifact is the same; the interface is role-appropriate. Annotations let designers attach context that surfaces in the developer view. ([Figma: Guide to Dev Mode](https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode))

- **Vercel preview URLs make deployment status tangible.** Every PR automatically gets a preview URL. PMs and designers click a link and see the change. The git/deployment machinery is invisible. Screenshots of production deployments appear in the dashboard. ([Vercel Docs: Deployments](https://vercel.com/docs/deployments))

**Pattern:** Deliver conventions through templates and forms, not documentation. Use progressive disclosure to manage complexity. Provide role-specific views of shared artifacts.

### 6. Governance-as-Code: Making Policy Visible

The policy-as-code movement shows how governance rules stored in files can be made accessible.

- **Compliance dashboards visualize policy status.** Violations are grouped, visualized, and reported to centralized dashboards. Stakeholders see compliance status without reading policy files. ([XenonStack: Compliance as Code](https://www.xenonstack.com/blog/compliance-as-a-code/))

- **Policy languages are designed for readability.** HashiCorp's Sentinel is designed to be "clear enough to parse even by a non-expert." The gap between policy intent and policy code is deliberately minimized. ([HashiCorp: Policy as Code](https://www.hashicorp.com/en/blog/policy-as-code-explained))

- **Collaborative authoring with technical enforcement.** Policies are "built and reviewed in collaboration with stakeholders from compliance, finance, cybersecurity" but enforced programmatically. The authoring is human-readable; the enforcement is automated. ([Platform Engineering: Policy as Code](https://platformengineering.org/blog/policy-as-code))

**Pattern:** Store governance as readable files. Visualize status through dashboards. Enforce automatically. Let non-technical stakeholders review intent while engineers handle enforcement.

---

## Implications for Sherpa Studio

Based on these findings, here are the concrete implications for making Sherpa's markdown/filesystem governance accessible to non-engineering roles.

### Architecture Implications

1. **Same artifacts, multiple interfaces.** Proposals, initiatives, and activity logs live as markdown files. Engineers interact via CLI/editor. Studio renders them as cards, boards, and detail views. Both read/write the same files. This is the GitHub pattern.

2. **Form-based creation for structured artifacts.** When a PM creates a proposal, they should see a form with fields (status dropdown, risk selector, target file picker, description textarea) -- not a YAML frontmatter editor. Studio generates the markdown file from the form submission. This is the TinaCMS/Nuxt Studio pattern.

3. **Schema-driven forms.** Define proposal/initiative schemas in `studio-core` (already partially done with types). Generate Studio forms from these schemas. When the schema evolves, forms evolve automatically. This is the Nuxt Content pattern.

4. **Views as projections of governance data.** The task board should offer table, kanban, and timeline views of the same underlying task files. PMs use kanban for triage; engineers use table for assignment. This is the Notion/GitHub Projects pattern.

### Convention Delivery Implications

5. **Encode conventions in templates, not docs.** "Create Proposal" should pre-fill the directoturtle structure, required frontmatter fields, and section headings. The convention is delivered through the template. This is the Backstage golden path pattern.

6. **Opinionated defaults for lifecycle.** New proposals should default to `status: pending`. Approval should automatically create `activity.md` and set `status: in-progress`. The lifecycle convention should be baked into Studio's state machine, not taught through the initiative-convention rule file. This is the Linear pattern.

7. **Automatic status transitions.** When a worker completes a task (worktree merged), the task status should update automatically. When all tasks for an initiative complete, prompt for integration review. Governance happens as a side effect of doing work. This is the Linear/Vercel pattern.

### Onboarding Implications

8. **Progressive disclosure of governance complexity.** New Studio users see: active initiatives, their tasks, and status. They don't see: frontmatter schemas, convention rules, dispatch configuration. Advanced views are available but not default. This is the GitLab Pajamas pattern.

9. **Learn-by-doing onboarding.** First interaction should be "review this proposal" (read + approve/decline), not "understand the initiative lifecycle." Governance concepts are learned through participation, not documentation. This is the Notion pattern.

10. **Guardrails at creation time.** When creating artifacts through Studio, validation prevents convention violations (missing required fields, invalid status transitions, improper naming). The form won't submit without required fields. Convention compliance is structural, not disciplinary. This is the form-based creation pattern.

### View Architecture Implications

11. **Role-specific default views.** Engineer view: file tree, terminal output, dispatch status. PM view: initiative board, task kanban, activity timeline. Designer view: component gallery, design review queue. Same data, different entry points. This is the Figma Dev Mode pattern.

12. **Rendered consumption, structured authoring.** Activity logs render as timelines. Proposals render as structured cards with status badges. The markdown source is available but not the default view. This is the Obsidian Publish pattern.

---

## Open Questions

1. **Write-back fidelity.** When Studio generates markdown from forms, how do we preserve formatting, comments, and hand-edited content that engineers may have added directly to files? TinaCMS solves this with AST-level parsing -- do we need that complexity?

2. **Convention drift detection.** When conventions evolve (new required frontmatter field, changed lifecycle states), how does Studio surface this to users who learned the old conventions? Do we need migration tooling for governance artifacts?

3. **Conflict resolution for governance files.** If a PM edits a proposal through Studio while an engineer edits the same file in their editor, we have a merge conflict on a governance artifact. GitHub's web conflict resolution works for code -- does it work for structured frontmatter?

4. **Schema ownership.** If forms are generated from schemas, who owns the schema? Engineers define types in `studio-core`, but PMs may need fields that engineers wouldn't add. Is there a governance process for the governance schema itself?

5. **Convention discoverability in the CLI.** Studio solves GUI accessibility, but do CLI-native engineers actually know about all the conventions? Should `sherpa init` generate example artifacts? Should dispatch scripts validate convention compliance before execution?

6. **Offline/async governance.** PMs may want to review proposals on mobile or in contexts where they can't run Studio. Do governance artifacts need a lightweight read-only rendering path (like Obsidian Publish) separate from the full Studio app?

7. **Permission model.** GitHub's "suggest changes" pattern lets non-maintainers propose edits. Should Studio have a similar pattern where PMs can propose changes to governance artifacts that engineers approve? Or is the current proposal/review lifecycle already that pattern?
