---
status: integrated
initiative: self-documenting-system
created: 2026-03-16
updated: '2026-03-16'
type: new-skill
risk: structural
targets:
  - .claude/rules/directoturtle-convention.md          # (new file)
  - .claude/rules/provenance-convention.md              # (new file)
  - .claude/skills/integrate/SKILL.md                   # (new file)
  - .claude/skills/doc-bootstrap/SKILL.md               # (new file)
  - docs/architecture/                                   # (new directory)
  - docs/decisions/                                      # (new directory)
  - docs/changelog.md                                    # (new file)
dependencies: []
informs:
  - studio-desktop-app
personas:
  - engineer
  - product-manager
spawned-from: null
---

# Self-Documenting System

## Summary

Introduce a self-documenting system that automatically maintains Sherpa's documentation surface as initiatives complete. Built on two foundations: the directoturtle convention (elevated from initiative-only to system-wide recursive directory structure) and a provenance metadata system that tracks authorship, review state, and freshness on every maintained document. Three mechanisms keep docs current: `/integrate` (post-initiative), `/doc-bootstrap` (history crawl), and drift detection (ongoing staleness checks).

## State Snapshot

Documentation is manually written and rarely updated after initial creation. Five integrated initiatives (dispatch-center, studio-agent-missions, studio-ux-patterns, voice-and-tone, parallel-workflow-governance) have shipped significant system changes that are not reflected in top-level docs. `docs/framework.md` describes the seven pillars but doesn't reflect implementation reality. No `docs/architecture/` directory exists. No cross-cutting decision records exist (initiative-scoped ones live in initiative directories). No changelog exists.

The directoturtle convention is documented in `initiative-convention.md` but scoped only to initiatives. The recursive directory pattern is not applied to documentation, skills, or other system areas.

Post-initiative automation is limited to LM Studio creating `activity.md` and scaffolding `plan.md` on approval. Nothing fires on completion.

## Proposed Changes

### 1. Directoturtle Convention (`.claude/rules/directoturtle-convention.md`)

Elevate directoturtles from initiative-specific to system-wide convention. Define:

- The recursive directory structure with `index.md` as the content file at each level
- Expansion lifecycle: single file -> directory with index.md -> subdirectories
- Standard files at any level (index.md, decisions/, activity.md, research/)
- Application to docs/, initiatives, skills, and future system areas

### 2. Provenance Convention (`.claude/rules/provenance-convention.md`)

Define the provenance metadata system:

- Frontmatter schema: `doc-type`, `maintained-by`, `authored-by`, `reviewed-by`, `last-updated`, `last-verified`, `source-initiatives`
- Four review states: AI/null (generated), AI/human (verified), human/human (traditional), human/AI (validated)
- Auto-generated banner convention derived from frontmatter
- All four states are "live" — provenance tells you trust level, not publication status

### 3. `/integrate` Skill (`.claude/skills/integrate/SKILL.md`)

Post-initiative documentation skill. When an initiative reaches `integrated` status:

- Reads initiative artifacts (proposal, plan, activity, decisions, stake, shape, premortem, git diff)
- Produces documentation updates to existing docs with provenance frontmatter
- Creates new documents when initiatives introduce capabilities with no corresponding doc
- Extracts cross-cutting decisions and promotes them to `docs/decisions/`
- Appends changelog entry to `docs/changelog.md`
- Triages seeds with suggested scope for future initiatives
- Never removes content — only adds or updates. Never edits foundation-stone.md.

### 4. `/doc-bootstrap` Skill (`.claude/skills/doc-bootstrap/SKILL.md`) [future session]

History crawl skill for initial documentation surface generation:

- **Pass 1 (skeleton):** Crawl integrated initiatives + git history, produce directory structure with index.md stubs
- **Pass 2 (depth):** Fill stubs with synthesized content from initiative artifacts and code
- Becomes the scaffolding logic in `sherpa init` for new adopters
- Includes drift detection mode: compare `last-verified` against recent commits, surface stale docs

### 5. Documentation Surface

Seed the directory structure organized by the seven pillars:

```
docs/
  architecture/
    governance-engine/index.md
    execution-pipeline/index.md
    behavioral-agent-system/index.md
    studio-application/index.md
    executable-conventions/index.md
    config-as-code/index.md
    convention-sync/index.md
  decisions/
    NNNN-<slug>.md
  changelog.md
```

### 6. Studio Integration [future session]

- Doc explorer panel in sidebar with provenance badges
- Freshness indicators (green/yellow/red) calculated from last-verified vs commits
- Review queue for docs awaiting human review
- Provenance history per document

## Rationale

Documentation dies in the queue between "proposed" and "published." By making every document live regardless of review state — with provenance metadata that transparently communicates trust level — we eliminate the approval bottleneck that kills documentation systems.

The directoturtle convention unifies how agents navigate the system. Learn the pattern once, traverse any depth. One traversal algorithm handles initiatives, architecture docs, decision records, and any future doc type.

This is a one-time bootstrapping cost. Future Sherpa adopters will never experience the documentation gap because the self-documenting system is present from `sherpa init`.

## Dependencies

None. This initiative introduces new conventions and skills without modifying existing ones. The directoturtle convention extends (not replaces) the existing initiative-convention.md.

## Review Notes

**Key trade-off:** Documents are live in all provenance states. This means an AI-generated doc with no human review is the system's current truth. The risk is inaccuracy; the mitigation is transparent provenance badges and Studio's review queue surfacing what needs human attention.

**Open question:** Should the directoturtle convention retroactively restructure existing initiative directories (e.g., rename proposal.md to index.md)? Recommendation: no. Initiatives keep their existing convention. Directoturtles for docs/ and future system areas use index.md. The two conventions coexist — initiatives are a specialized directoturtle with domain-specific file names.

**Effort:** 5-7 sessions
**Session breakdown:**
- Session 1: Convention rules + /integrate skill + initiative scaffolding (this session)
- Session 2: /doc-bootstrap skill (skeleton pass logic)
- Session 3: Run bootstrap against Sherpa's history (pass 1 + pass 2)
- Session 4: Studio UI — doc explorer panel, provenance badges
- Session 5: Studio UI — review queue, freshness indicators
- Sessions 6-7 (if needed): Drift detection, sherpa init integration
