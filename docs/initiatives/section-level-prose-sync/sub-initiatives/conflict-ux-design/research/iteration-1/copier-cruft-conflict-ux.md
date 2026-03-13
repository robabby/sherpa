# Copier & Cruft Conflict UX: How Template Sync Tools Present Conflicts

**Research iteration:** 1
**Date:** 2026-03-12
**Focus:** How do Copier and Cruft (template sync tools) present conflicts to users? File-level .rej files, inline markers, or interactive prompts? What do users actually prefer?

---

## Key Discoveries

### 1. Copier offers two conflict modes: inline markers (default) and .rej files

Copier's `--conflict` flag provides two strategies for presenting unresolvable merge conflicts during `copier update`:

- **`--conflict inline` (default since v8.0.0):** Inserts Git-style conflict markers directly into the conflicted file. Labels are `<<<<<<< before updating`, `=======`, `>>>>>>> after updating`. This integrates with IDE merge tools (VS Code, IntelliJ, PyCharm). ([Copier docs: Updating](https://copier.readthedocs.io/en/stable/updating/), [DeepWiki: Updating Projects](https://deepwiki.com/copier-org/copier/3.4-updating-projects))

- **`--conflict rej`:** Creates a separate `.rej` file alongside each conflicted file, containing the rejected diff hunks in unified diff format. The original file is left in its pre-update state. ([Copier docs: Updating](https://copier.readthedocs.io/en/stable/updating/))

The switch from `rej` to `inline` as the default happened in **Copier v8.0.0 (June 2023)**, alongside increasing default context lines from 1 to 3. The change generated zero user complaints in the v8.0.0 release discussion, suggesting silent acceptance. ([v8.0.0 Discussion](https://github.com/orgs/copier-org/discussions/1174))

### 2. Copier's three-way merge algorithm works at file level, not section level

Copier's update algorithm:
1. Regenerates the old project cleanly from old template + old answers (the "base")
2. Calculates a unified diff between base and current project (the "user diff")
3. Renders the new template with updated answers (the "new version")
4. Applies the user diff as a patch onto the new version via `git apply --reject`
5. For any rejected hunks (when using inline mode): runs `git merge-file` with three inputs: current file, old clean file, new template file
6. Scans the result for conflict markers to identify unresolved conflicts

The `--context-lines` parameter (default: 3) controls unified diff context depth, affecting merge accuracy vs. conflict frequency. Higher values = more accurate but more conflicts when the project has diverged significantly. ([Source: copier/_main.py](https://github.com/copier-org/copier/blob/master/copier/_main.py), [DeepWiki](https://deepwiki.com/copier-org/copier/3.4-updating-projects))

### 3. Copier's inline mode had a critical bug: conflicts disappeared in merge tools

**Issue #1833:** When using `--conflict inline`, conflict markers appeared correctly in the file text, but `git mergetool`, VS Code's Merge Editor, and PyCharm's merge editor all showed no conflicts. Root cause: after running `git merge-file`, Copier recorded the same blob hash for all three index stages (base/ours/theirs), so merge tools saw no actual difference. Fixed in PR #1907 (Jan 2025) by correctly recording distinct blob hashes for each stage. ([Issue #1833](https://github.com/copier-org/copier/issues/1833))

This bug reveals a subtle but critical UX requirement: **inline conflict markers alone are not enough**. For IDE merge tools to work, the git index must also correctly record the three-way merge state. Just having `<<<<<<<` markers in the file is insufficient for tool integration.

### 4. Cruft's .rej file approach is widely despised

Cruft uses `git apply --reject` as its conflict fallback, producing `.rej` files for each failed hunk. User feedback is consistently negative:

- **"the main pain point"** - Mike O'Connor, cruft/cruft#49 ([Issue #49](https://github.com/cruft/cruft/issues/49))
- **"quite annoying"** - iuiu34, proposing a single `cookiecutter.diff` file instead ([Issue #206](https://github.com/cruft/cruft/issues/206))
- **"a game changer"** (if improved) - Isaac Backus on the potential of better conflict handling ([Issue #49](https://github.com/cruft/cruft/issues/49))
- **One user still runs cruft < 1.4 in 2025** to get the old inline merge markers instead of `.rej` files - Gaspard Charles, Jan 2025 ([Issue #49](https://github.com/cruft/cruft/issues/49))
- A third-party tool (`rejx`) was created specifically to manage the pain of `.rej` files ([rejx on GitHub](https://github.com/MarkusSagen/rejx), [rejx on PyPI](https://pypi.org/project/rejx/))
- Teams use `wiggle` (a 1988 Unix tool) to force-apply `.rej` files with inline conflict markers ([wiggle on GitHub](https://github.com/neilbrown/wiggle), [Issue #181 comment](https://github.com/cruft/cruft/issues/181))

The core complaint: `.rej` files require mentally holding two contexts (the original file and the rejection file) while manually transferring changes. Inline markers keep everything in one place.

### 5. Cruft had a regression that made conflict handling worse

**Cruft < 1.4:** Used `patch --merge` which produced inline conflict markers in the target file, similar to git merge conflicts. Users could resolve them with standard tools.

**Cruft >= 1.4 (and 2.x):** Switched to `git apply --reject`, producing `.rej` files. Worse: version 2.2.0 had a bug where it reported "Good work! Project's cruft has been updated and is as clean as possible!" even when patches completely failed to apply, silently dropping changes.

**Nick DeRobertis** (Flexlate author, March 2021): "I like how cruft < 1.4 created merge conflict markers... lots of GUIs for handling these, and IMO more straightforward when the original and changes are in the same file." He proposed a two-pass strategy: first try `git apply -3` (three-way merge), then fall back to `patch -p1 --merge --no-backup-if-mismatch` for inline markers. ([Issue #49](https://github.com/cruft/cruft/issues/49), [Issue #47](https://github.com/cruft/cruft/issues/47))

### 6. Cruft silently updates metadata even when conflicts are unresolved

The Blenddata blog (a team running template sync at scale) identified a critical Cruft flaw: when conflicts occur, "the original file stays unchanged, even if the update partially fails" but Cruft still updates `.cruft.json` to the latest commit hash. This means the next update skips the unresolved changes entirely, and merge requests can be accepted with silently dropped updates. ([Blenddata: Cruft vs Copier](https://www.blenddata.nl/en/blogs/cruft-vs-copier-automating-template-updates-at-scale))

### 7. Flexlate exists specifically because .rej files are bad UX

Flexlate was created by Nick DeRobertis explicitly to solve the conflict UX problem in Copier and Cruft. Its key innovation: **creating real Git merge conflicts** (proper three-way merge recorded in the Git index) rather than fake inline markers or `.rej` files. This enables standard merge tools (VS Code, GitKraken, kdiff3) to work correctly.

Flexlate maintains two Git branches: one with clean template output history, one with merged project+template output. Conflicts are real Git merge conflicts resolved with standard Git tools, and the resolution is stored in Git history so **the same conflict is never presented twice**. ([Flexlate FAQ](https://nickderobertis.github.io/flexlate/faqs.html), [Flexlate GitHub](https://github.com/nickderobertis/flexlate))

### 8. Copier never implemented interactive conflict resolution

Despite multiple requests over 10 years, Copier has no interactive conflict resolution:

- **Issue #8 (2016):** "launch merge tool to solve conflicts" - rejected by original maintainer as "beyond the scope I want the project to have" ([Issue #8](https://github.com/copier-org/copier/issues/8))
- **Issue #343 (2021):** "Show diff on conflict before deciding if overwrite or skip" - proposed UX: `conflict some-file.txt overwrite? [y=yes / n=no / d=see diff / r=save .rej file]` - closed as "not planned" ([Issue #343](https://github.com/copier-org/copier/issues/343))
- **Discussion #341 (2021):** "Resolve conflict: overwrite, skip, keep both or diff" - users wanted more options than binary overwrite/skip ([Discussion #341](https://github.com/orgs/copier-org/discussions/341))

The Copier project explicitly chose batch-mode conflict output (write markers/files, let user resolve later) over interactive resolution. This is a deliberate design decision, not an oversight.

### 9. The copier adopt proposal (Feb 2026) validates inline markers as the preferred approach

The newest Copier feature request (`copier adopt`, Issue #2486, Feb 2026) proposes handling conflicts with Git-style inline markers when adopting existing projects into templates. The proposal describes this as "explicit, reviewable conflict resolution" and frames it as the natural approach. No one in the discussion proposed `.rej` files as an alternative. ([Issue #2486](https://github.com/copier-org/copier/issues/2486))

### 10. zdiff3 represents the state-of-the-art for inline conflict markers

Git's `zdiff3` conflict style (added in Git 2.35, Jan 2022) automatically removes common lines from conflict blocks, making them smaller and easier to resolve. It shows the base version (like diff3) but "zealously" pushes shared prefix/suffix lines outside the conflict markers.

Standard diff3 problem: duplicate lines appear inside conflict markers, confusing users who must manually identify and remove them. zdiff3 solves this automatically. ([Ductile Systems: zdiff3](https://www.ductile.systems/zdiff3/), [Rebecca: Why diff3 is confusing](https://becca.ooo/blog/why-diff3-is-confusing/), [Adam Johnson: zdiff3](https://adamj.eu/tech/2023/12/29/git-conflict-display-zdiff3/))

### 11. Jujutsu (jj) pioneered a novel snapshot+diff conflict format

Jujutsu VCS uses a conflict marker format that shows one "snapshot" (full content from one side) plus "diffs" (changes to apply from other sides). This is conceptually different from Git's ours/base/theirs model:

```
<<<<<<< conflict 1 of 1
%%%%%%% diff from: base → side A
 apple
-grape
+grapefruit
 orange
+++++++ side B
APPLE
GRAPE
ORANGE
>>>>>>> conflict 1 of 1 ends
```

Key insight: "you don't need to spend time manually comparing the sides to spot the differences between them." The diff sections make it obvious what changed, while the snapshot provides full context. Jujutsu also supports Git-style markers via `ui.conflict-marker-style: git` for tool compatibility. ([Jujutsu docs: Conflicts](https://docs.jj-vcs.dev/latest/conflicts/))

### 12. Deferred conflict resolution is a validated UX pattern

Chris Krycho's analysis of Jujutsu articulates a principle directly relevant to `sherpa sync`: **separate conflict detection from conflict resolution**. Make conflicts visible immediately but don't force resolution. Users should be able to defer resolution and continue working on other things. ([Chris Krycho: Deferred Conflict Resolution](https://v5.chriskrycho.com/journal/deferred-conflict-resolution-in-jujutsu/))

### 13. At scale (1000+ repos), silent conflict absorption is the worst outcome

A Renovate+Copier user managing ~1000 Kubernetes cluster repositories reported that merged PRs with unresolved inline conflict markers broke their deployment pipeline. The conflict markers were "absorbed" by Renovate's automated PR process without flagging them as errors. The user advocated for `.rej` files specifically because they fail CI checks more visibly than inline markers that look like valid file content. ([Renovate Discussion #31592](https://github.com/renovatebot/renovate/discussions/31592))

This reveals a tension: inline markers are better for manual resolution, but `.rej` files are better for automated pipeline detection.

### 14. Pre-commit hooks are the safety net for both modes

Copier's documentation recommends pre-commit hooks as the guardrail:
- For inline: `check-merge-conflict` with `--assume-in-merge` flag
- For .rej: Custom hook that fails if any `.rej` files exist

Both hooks prevent committing unresolved conflicts. The documentation explicitly supports using both simultaneously for teams with mixed preferences. ([Copier docs: Updating](https://copier.readthedocs.io/en/stable/updating/), [pre-commit-hooks](https://github.com/pre-commit/pre-commit-hooks))

---

## Implications for Section-Level Conflict UX in sherpa sync

### Strong signals

1. **Inline markers are the clear winner for human resolution.** Copier switched defaults to inline. Cruft users actively fight to get inline markers back. Flexlate was built to create "real" Git merge conflicts. The entire ecosystem has moved away from `.rej` files.

2. **But inline markers must integrate with tooling, not just be text.** Copier's bug (#1833) where markers were present but tools couldn't see them shows that writing `<<<<<<<` into a file is necessary but not sufficient. Git index state matters for tool integration.

3. **sherpa sync's section-level granularity is a genuine innovation.** No existing tool operates at heading-level markdown sections. Copier, Cruft, and Flexlate all work at file level. Section-level merge will produce smaller, more focused conflict regions -- a major UX advantage.

4. **The zdiff3/Jujutsu insight applies directly.** For section-level prose conflicts, showing the base version of the section (like diff3) plus highlighting what specifically changed (like Jujutsu's diff markers) would give users the most actionable information. A section conflict that shows "upstream changed lines 3-5, you changed lines 7-8" is far more useful than raw three-way content.

5. **Deferred resolution is essential.** sherpa sync should allow users to accept the merge with unresolved conflicts marked, continue working, and resolve later. Forcing immediate resolution (like Git rebase) would be bad UX for convention files that aren't immediately blocking work.

6. **Detection must be separate from presentation.** At scale, CI should be able to detect unresolved section conflicts (via markers or metadata) without requiring human interpretation. The Renovate/Copier failure mode of silent conflict absorption is a real risk.

### Design recommendations

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Default conflict output | Inline markers in the markdown file | Industry consensus; IDE integration; single-file context |
| Marker format | Git-compatible `<<<<<<<`/`=======`/`>>>>>>>` with section context | Tool ecosystem compatibility; zdiff3-aware editors can parse them |
| Include base version | Yes (diff3-style with upstream/base/local) | Overwhelming HN/user consensus that base is essential for resolution |
| .rej file option | Not needed for MVP | Section-level conflicts are small enough that inline is always manageable |
| Interactive mode | Future enhancement, not MVP | Copier deliberately chose batch mode; validates batch-first approach |
| Machine detection | Add frontmatter or comment metadata marking unresolved conflicts | Prevents silent absorption; enables CI guardrails |
| Deferred resolution | Support merging with conflicts; mark but don't block | Validated by Jujutsu pattern; convention files aren't immediately critical |

### Key differentiator opportunity

Copier/Cruft operate at **file level**: an entire file either merges cleanly or has conflicts. sherpa sync operates at **section level**: each markdown heading section merges independently. This means:

- A file with 10 sections might have 9 clean merges and 1 conflict
- The conflict is presented in context (surrounding sections are clean)
- Users see exactly which convention changed and where the disagreement is
- Resolution is scoped to a small, semantically meaningful unit

This is fundamentally better UX than any existing template sync tool offers.

---

## Sources

### Copier documentation and source
- [Copier docs: Updating a project](https://copier.readthedocs.io/en/stable/updating/) - Official docs on conflict handling, --conflict flag, pre-commit hooks
- [Copier docs: Configuring a template](https://copier.readthedocs.io/en/stable/configuring/) - Template configuration reference
- [Copier docs: Comparisons](https://copier.readthedocs.io/en/stable/comparisons/) - Official comparison with Cookiecutter and Yeoman
- [DeepWiki: Updating Projects](https://deepwiki.com/copier-org/copier/3.4-updating-projects) - Detailed analysis of update algorithm
- [DeepWiki: Template Configuration](https://deepwiki.com/copier-org/copier/3.2-template-configuration-reference) - Template config reference
- [DeepWiki: CLI Reference](https://deepwiki.com/copier-org/copier/5.2-cli-reference) - CLI flags and options
- [copier/_main.py source](https://github.com/copier-org/copier/blob/master/copier/_main.py) - Core implementation of merge-file, conflict detection, index manipulation
- [copier/docs/updating.md](https://github.com/copier-org/copier/blob/master/docs/updating.md) - Source for updating docs
- [Copier CHANGELOG](https://github.com/copier-org/copier/blob/master/CHANGELOG.md) - Version history

### Copier GitHub issues and discussions
- [Issue #8: Launch merge tool to solve conflicts (2016)](https://github.com/copier-org/copier/issues/8) - Rejected request for interactive merge tool
- [Issue #343: Show diff on conflict before overwrite/skip](https://github.com/copier-org/copier/issues/343) - Proposed interactive conflict UX, closed as not planned
- [Issue #943: copier not overwriting file, .rej file wrong](https://github.com/copier-org/copier/issues/943) - Bug where .rej files showed backwards diffs
- [Issue #1263: Printed actions incorrect](https://github.com/copier-org/copier/issues/1263) - Status reporting accuracy
- [Issue #1517: Migrate from cruft to copier](https://github.com/copier-org/copier/issues/1517) - Migration challenges
- [Issue #1833: Merge conflicts disappear in mergetool/IDEs](https://github.com/copier-org/copier/issues/1833) - Critical bug where inline markers invisible to tools
- [Issue #2486: copier adopt feature request (Feb 2026)](https://github.com/copier-org/copier/issues/2486) - Newest proposal using inline markers for adoption
- [Discussion #341: Resolve conflict: overwrite, skip, keep both or diff](https://github.com/orgs/copier-org/discussions/341) - User requests for richer conflict options
- [Discussion #456: Always a conflict when not identical](https://github.com/copier-org/copier/discussions/456) - Terminology confusion between "conflict" and "update needed"
- [Discussion #1174: v8.0.0 release (inline default)](https://github.com/orgs/copier-org/discussions/1174) - Default changed from rej to inline
- [Copier issues tracker](https://github.com/copier-org/copier/issues) - Full issue list

### Cruft documentation and issues
- [Cruft official docs](https://cruft.github.io/cruft/) - Main documentation
- [Cruft GitHub](https://github.com/cruft/cruft) - Source repository
- [Issue #47: Cruft fails to apply without providing conflict](https://github.com/cruft/cruft/issues/47) - Regression from 1.3 to 2.x
- [Issue #49: Improve cruft update's rejection fallback](https://github.com/cruft/cruft/issues/49) - Core UX complaint; Nick DeRobertis's inline markers advocacy
- [Issue #53: Update fails on moved files, no clear errors](https://github.com/cruft/cruft/issues/53) - Error messaging failures
- [Issue #181: 3-way merge failing on cruft update](https://github.com/cruft/cruft/issues/181) - Merge failures in CI; wiggle workaround
- [Issue #206: cookiecutter.diff instead of .rej files](https://github.com/cruft/cruft/issues/206) - Proposal for single diff file approach

### Flexlate
- [Flexlate GitHub](https://github.com/nickderobertis/flexlate) - Source repository
- [Flexlate FAQ: Why Flexlate over Copier/Cruft](https://nickderobertis.github.io/flexlate/faqs.html) - Detailed comparison, real Git merge conflict advantage
- [Flexlate docs: Updating](https://nickderobertis.github.io/flexlate/tutorial/updating.html) - Update tutorial
- [Flexlate docs: CI Automation](https://nickderobertis.github.io/flexlate/tutorial/ci-automation.html) - CI workflow

### Conflict resolution tools and third-party solutions
- [rejx: CLI for managing .rej files](https://github.com/MarkusSagen/rejx) - Tool created to cope with cruft's .rej files
- [rejx on PyPI](https://pypi.org/project/rejx/) - Package listing
- [wiggle: Apply rejected patches with inline markers](https://github.com/neilbrown/wiggle) - Unix tool for force-applying .rej files
- [wiggle man page](https://linux.die.net/man/1/wiggle) - Documentation
- [wiggle LWN announcement](https://lwn.net/Articles/32919/) - Original announcement

### Git conflict styles and merge UX
- [Ductile Systems: Better Git conflicts with zdiff3](https://www.ductile.systems/zdiff3/) - zdiff3 explanation with examples
- [Rebecca: Why diff3 is confusing](https://becca.ooo/blog/why-diff3-is-confusing/) - UX problems with diff3 markers
- [Adam Johnson: zdiff3](https://adamj.eu/tech/2023/12/29/git-conflict-display-zdiff3/) - zdiff3 recommendation
- [DEV: Better git conflicts zdiff3](https://dev.to/ccoveille/better-git-conflicts-zdiff3-54g) - zdiff3 tutorial
- [neg4n: Understanding zdiff3](https://neg4n.dev/blog/understanding-zealous-diff3-style-git-conflict-markers) - Technical deep dive
- [nilbus: Take the pain out of conflict resolution with diff3](https://blog.nilbus.com/take-the-pain-out-of-git-conflict-resolution-use-diff3/) - diff3 advocacy
- [Medium: Git's diff3 conflict style](https://medium.com/codex/gits-diff3-conflict-style-and-how-to-use-it-91132a040837) - diff3 tutorial
- [HN: Take the pain out of conflict resolution use diff3](https://news.ycombinator.com/item?id=31075608) - Community discussion on conflict styles
- [VS Code: Explore UX for three-way merge (Issue #146091)](https://github.com/microsoft/vscode/issues/146091) - VS Code's merge editor design process
- [VS Code: Resolve merge conflicts docs](https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts) - VS Code merge UI documentation
- [git-scm: Advanced Merging](https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging) - Git's merging documentation
- [git-scm: git-apply](https://git-scm.com/docs/git-apply) - --reject vs --merge flags
- [git-scm: git-merge](https://git-scm.com/docs/git-merge) - Merge documentation
- [GNU: patch options](http://www.gnu.org/s/diffutils/manual/html_node/patch-Options.html) - patch --merge vs --reject

### Jujutsu (jj) conflict model
- [Jujutsu docs: Conflicts](https://docs.jj-vcs.dev/latest/conflicts/) - Conflict marker format, snapshot+diff approach
- [Chris Krycho: Deferred Conflict Resolution in Jujutsu](https://v5.chriskrycho.com/journal/deferred-conflict-resolution-in-jujutsu/) - UX pattern analysis
- [Steve Klabnik: Jujutsu Tutorial - Conflicts](https://steveklabnik.github.io/jujutsu-tutorial/branching-merging-and-conflicts/conflicts.html) - Tutorial
- [Jujutsu GitHub](https://github.com/jj-vcs/jj) - Source repository
- [jj/docs/conflicts.md](https://github.com/martinvonz/jj/blob/main/docs/conflicts.md) - Conflicts documentation source
- [HN: Jujutsu tracks merge conflicts](https://news.ycombinator.com/item?id=41895702) - HN discussion
- [DEV: Auto-resolve formatting conflicts with jj fix](https://dev.to/nyctef/automatically-resolve-formatting-conflicts-with-jj-fix-b92) - Automated resolution

### Renovate + template sync at scale
- [Renovate docs: Copier manager](https://docs.renovatebot.com/modules/manager/copier/) - Copier support in Renovate
- [Discussion #31592: Fail copier renovate update when conflicts present](https://github.com/renovatebot/renovate/discussions/31592) - 1000-repo scale conflict problem
- [Discussion #31590: Handling of Renovate copier updates with merge conflicts](https://github.com/renovatebot/renovate/discussions/31590) - Related discussion
- [Issue #31600: Copier updates with conflicts should fail artifacts check](https://github.com/renovatebot/renovate/issues/31600) - Feature request
- [Discussion #32760: Copier/cruft integration](https://github.com/renovatebot/renovate/discussions/32760) - Integration discussion
- [Discussion #24000: Add Manager for Cruft](https://github.com/renovatebot/renovate/discussions/24000) - Cruft support request

### Blog posts and comparisons
- [Blenddata: Cruft vs Copier](https://www.blenddata.nl/en/blogs/cruft-vs-copier-automating-template-updates-at-scale) - Detailed comparison at scale
- [Timothy Crosley: Introducing cruft](https://timothycrosley.com/project-6-cruft) - Cruft creator's blog
- [Astronomer: Standardizing projects with Cookiecutter and Cruft](https://www.astronomer.io/blog/standardizing-astro-projects-with-cookiecutter-and-cruft/) - Real-world Cruft usage
- [Medium: Standardizing DBT Projects with Cookiecutter and Cruft](https://medium.com/@bctello8/standardizing-dbt-projects-at-scale-with-cookiecutter-and-cruft-20acc4dc3f74) - Scale experience
- [john-miller.dev: Cookiecutter with Cruft for Platform Engineering](https://john-miller.dev/posts/cookiecutter-with-cruft-for-platform-engineering/) - Platform engineering perspective
- [pawamoy: copier-pdm](https://pawamoy.github.io/showcase/copier-pdm/) - Copier template showcase
- [pawamoy: Somewhat modern Python](https://pawamoy.github.io/posts/somewhat-modern-python-development/) - Tooling recommendations
- [Cortex: Cookiecutter Benefits and Limitations](https://www.cortex.io/post/an-overview-of-cookiecutter) - Overview
- [lyz-code: Copier (The Blue Book)](https://lyz-code.github.io/blue-book/copier/) - Copier usage guide
- [Altova: Comparing Markdown Files in the Age of Agentic AI](https://www.altova.com/blog/2026/02/comparing-markdown-files-in-the-age-of-agentic-ai-why-diffdog) - Markdown diff tools

### Three-way merge algorithms and research
- [diff3 - Wikipedia](https://en.wikipedia.org/wiki/Diff3) - Algorithm overview
- [Blog: Merging with diff3 (James Coglan)](https://blog.jcoglan.com/2017/05/08/merging-with-diff3/) - Detailed algorithm explanation
- [Three-Way Merge (revctrl.org)](https://tonyg.github.io/revctrl.org/ThreeWayMerge.html) - Theory
- [Blog: The Magic of 3-Way Merge](https://blog.git-init.com/the-magic-of-3-way-merge/) - Accessible explanation
- [GitHub: three-way-merge JS/TS library](https://github.com/movableink/three-way-merge) - JavaScript implementation
- [GitHub: threeway-merge-rs (Rust)](https://github.com/levish0/threeway-merge-rs) - Rust implementation using libgit2/xdiff
- [GitHub: three-merge Python library](https://github.com/spyder-ide/three-merge) - Python implementation
- [GitHub: diff3 Python (Myers + diff3)](https://github.com/nagaokayuji/diff3/) - Python implementation
- [Gist: 3-way merge based on O(NP) Myers diff](https://gist.github.com/memononen/2c83d183c2749e5f4a493ce7ddb73f4d) - Algorithm implementation
- [metacpan: Algorithm::Merge (Perl)](https://metacpan.org/pod/Algorithm::Merge) - Perl implementation
- [arxiv: Evaluation of Version Control Merge Tools (ASE 2024)](https://arxiv.org/abs/2410.09934) - Comprehensive evaluation of 16 merge tools
- [arxiv: Semistructured Merge with Syntactic Separators](https://arxiv.org/html/2407.18888v1) - Structured merge research
- [OOPSLA 2018: Conflict Resolution for Structured Merge via Version Space Algebra](https://feihe.github.io/materials/oopsla18.pdf) - Academic research
- [arxiv: Program Merge Conflict Resolution via Neural Transformers](https://ar5iv.labs.arxiv.org/html/2109.00084) - ML-based resolution
- [MergeBERT paper](https://openreview.net/pdf?id=WXwg_9eRQ0T) - ML-based resolution
- [arxiv: Alleviating Merge Conflicts with Fine-grained Visual Awareness](https://ar5iv.labs.arxiv.org/html/1508.01872) - Visual conflict tools
- [Mastery: Shifted-Code-Aware Structured Merging](https://paulz.me/files/mastery-preprint.pdf) - Structured merge tool
- [LastMerge: Language-agnostic structured merge](https://arxiv.org/html/2507.19687) - Recent structured merge tool
- [GitHub: AST-Merging-Evaluation](https://github.com/benedikt-schesch/AST-Merging-Evaluation) - Merge tool evaluation framework

### Merge tool UX (general)
- [Atlassian: Advanced Git merge conflict resolution](https://community.atlassian.com/forums/App-Central-articles/Advanced-Git-merge-conflict-resolution-techniques/ba-p/2476971) - Technique overview
- [Atlassian: Git merge conflicts tutorial](https://www.atlassian.com/git/tutorials/using-branches/merge-conflicts) - Tutorial
- [GitKraken: Merge conflict resolution tool](https://www.gitkraken.com/features/merge-conflict-resolution-tool) - Visual merge tool
- [SmartGit: Conflict resolution](https://www.smartgit.dev/features/conflict-resolution/) - Three-way merge tool
- [Graphite: GUI merge tools](https://graphite.com/guides/graphical-user-interfaces-git-merge-tools) - Tool comparison
- [GitLab: Merge conflicts docs](https://docs.gitlab.com/user/project/merge_requests/conflicts/) - GitLab's conflict UI
- [GitHub Desktop: Unclear conflict UX (Issue #1627)](https://github.com/desktop/desktop/issues/1627) - UX complaints
- [pre-commit-hooks](https://github.com/pre-commit/pre-commit-hooks) - Conflict detection hooks
- [Gist: Version Control Diff/Patch/Merge Analysis](https://gist.github.com/CMCDragonkai/b11dcd8ec0bf07459d197fd671738a5e) - Comprehensive analysis

---

## Raw Links

Every URL encountered during this research, including tangentially relevant ones:

```
https://copier.readthedocs.io/en/stable/updating/
https://github.com/copier-org/copier/blob/master/docs/updating.md
https://github.com/copier-org/copier/issues/943
https://copier.readthedocs.io/en/stable/configuring/
https://lyz-code.github.io/blue-book/copier/
https://deepwiki.com/copier-org/copier/3.2-template-configuration-reference
https://nickderobertis.github.io/flexlate/faqs.html
https://deepwiki.com/copier-org/copier/5.2-cli-reference
https://github.com/copier-org/copier/discussions/456
https://deepwiki.com/copier-org/copier/3-user-guide
https://github.com/copier-org/copier/issues/1833
https://github.com/copier-org/copier/issues/8
https://github.com/copier-org/copier/issues
https://github.com/copier-org/copier/issues/1595
https://github.com/orgs/copier-org/discussions/456
https://github.com/copier-org/copier/blob/master/copier/_main.py
https://cruft.github.io/cruft/
https://www.blenddata.nl/en/blogs/cruft-vs-copier-automating-template-updates-at-scale
https://github.com/copier-org/copier/issues/1517
https://timothycrosley.com/project-6-cruft
https://pawamoy.github.io/showcase/copier-pdm/
https://github.com/renovatebot/renovate/discussions/24000
https://github.com/renovatebot/renovate/discussions/32760
https://python-basics-tutorial.readthedocs.io/en/latest/packs/templating/cruft.html
https://github.com/cruft/cruft/issues/206
https://gist.github.com/w00tzenheimer/0fef0f80199141c4e2b793f4ab00f455
https://github.com/cruft/cruft/issues/181
https://github.com/cruft/cruft/issues/53
https://github.com/cruft/cruft/issues/49
https://github.com/python-boltons/cc-python
https://medium.com/@bctello8/standardizing-dbt-projects-at-scale-with-cookiecutter-and-cruft-20acc4dc3f74
https://github.com/cruft/cruft
https://john-miller.dev/posts/cookiecutter-with-cruft-for-platform-engineering/
https://en.wikipedia.org/wiki/Diff3
https://blog.jcoglan.com/2017/05/08/merging-with-diff3/
https://en.wikipedia.org/wiki/Merge_(version_control)
https://blog.git-init.com/the-magic-of-3-way-merge/
https://tonyg.github.io/revctrl.org/ThreeWayMerge.html
https://github.com/nagaokayuji/diff3/
https://metacpan.org/pod/Algorithm::Merge
https://metacpan.org/pod/Text::Diff3
https://itsfoss.gitlab.io/post/how-to-use-diff3-command-for-file-merging-in-linux/
https://www.gnu.org/software/diffutils/manual/html_mono/diff.html
https://github.com/copier-org/copier/blob/master/CHANGELOG.md
https://copier.readthedocs.io/en/v9.2.0/changelog/
https://github.com/orgs/copier-org/discussions/1174
https://github.com/copier-org/copier/issues/1263
https://github.com/copier-org/copier/issues/2486
https://copier.readthedocs.io/en/stable/comparisons/
https://github.com/orgs/copier-org/discussions/341
https://github.com/copier-org/copier/issues/343
https://github.com/copier-org/copier/issues/1090
https://github.com/copier-org/copier/issues/1131
https://github.com/copier-org/copier/issues/934
https://github.com/copier-org/copier/issues/184
https://github.com/orgs/copier-org/discussions/319
https://github.com/copier-org/copier/issues/1977
https://github.com/copier-org/copier/blob/master/docs/configuring.md
https://github.com/nickderobertis/flexlate
https://nickderobertis.github.io/flexlate/index.html
https://nickderobertis.github.io/flexlate/tutorial/updating.html
https://nickderobertis.github.io/flexlate/tutorial/ci-automation.html
https://github.com/nickderobertis/flexlate/issues
https://snyk.io/advisor/python/flexlate
https://github.com/MarkusSagen/rejx
https://pypi.org/project/rejx/
https://github.com/neilbrown/wiggle
https://manpages.ubuntu.com/manpages/focal/man1/wiggle.1.html
https://linux.die.net/man/1/wiggle
https://github.com/neilbrown/wiggle/blob/master/wiggle.spec
https://lwn.net/Articles/32919/
https://man.cx/wiggle(1)
https://commandmasters.com/commands/wiggle-common/
https://github.com/neilbrown/wiggle/blob/master/wiggle.1
https://www.mankier.com/1/wiggle
https://jj-vcs.github.io/jj/latest/conflicts/
https://docs.jj-vcs.dev/latest/conflicts/
https://dev.to/nyctef/automatically-resolve-formatting-conflicts-with-jj-fix-b92
https://steveklabnik.github.io/jujutsu-tutorial/branching-merging-and-conflicts/conflicts.html
https://github.com/jj-vcs/jj
https://github.com/martinvonz/jj/blob/main/docs/conflicts.md
https://v5.chriskrycho.com/journal/deferred-conflict-resolution-in-jujutsu/
https://reasonablypolymorphic.com/blog/jj-strategy/
https://neugierig.org/software/blog/2024/12/jujutsu.html
https://gist.github.com/christianromney/27fd1fca9e5f24ef24d9ed6c9eddda50
https://jj-for-everyone.github.io/conflict.html
https://news.ycombinator.com/item?id=41895702
https://www.ductile.systems/zdiff3/
https://becca.ooo/blog/why-diff3-is-confusing/
https://blog.nilbus.com/take-the-pain-out-of-git-conflict-resolution-use-diff3/
https://dev.to/ccoveille/better-git-conflicts-zdiff3-54g
https://adamj.eu/tech/2023/12/29/git-conflict-display-zdiff3/
https://neg4n.dev/blog/understanding-zealous-diff3-style-git-conflict-markers
https://mopacic.net/til/2024/02/24/zdiff3.html
https://github.com/ansible/ansible/issues/84115
https://medium.com/codex/gits-diff3-conflict-style-and-how-to-use-it-91132a040837
https://news.ycombinator.com/item?id=31075608
https://docs.renovatebot.com/modules/manager/copier/
https://github.com/renovatebot/renovate/discussions/31592
https://gitlab.com/gitlab-com/gl-infra/common-ci-tasks/-/merge_requests/146
https://github.com/renovatebot/renovate
https://github.com/renovatebot/renovate/discussions/31590
https://github.com/renovatebot/renovate/issues/31600
https://docs.renovatebot.com/
https://github.com/microsoft/vscode/issues/146091
https://code.visualstudio.com/docs/sourcecontrol/merge-conflicts
https://www.gitkraken.com/features/merge-conflict-resolution-tool
https://www.smartgit.dev/features/conflict-resolution/
https://docs.gitlab.com/user/project/merge_requests/conflicts/
https://www.atlassian.com/git/tutorials/using-branches/merge-conflicts
https://graphite.com/guides/graphical-user-interfaces-git-merge-tools
https://graphite.com/guides/how-to-resolve-merge-conflicts-in-git
https://github.com/desktop/desktop/issues/1627
https://design.xwiki.org/xwiki/bin/view/Design/MergeConflictResolutionUI
https://community.atlassian.com/forums/App-Central-articles/Advanced-Git-merge-conflict-resolution-techniques/ba-p/2476971
https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging
https://git-scm.com/docs/git-apply
https://git-scm.com/docs/git-merge
https://git-scm.com/docs/git-merge/2.38.0
https://www.flosum.com/blog/how-to-resolve-merge-conflicts-in-git
http://www.gnu.org/s/diffutils/manual/html_node/patch-Options.html
https://gist.github.com/CMCDragonkai/b11dcd8ec0bf07459d197fd671738a5e
https://gist.github.com/stepchowfun/4713315
https://github.com/movableink/three-way-merge
https://github.com/lyxell/nway
https://gist.github.com/memononen/2c83d183c2749e5f4a493ce7ddb73f4d
https://github.com/microsoft/vscode/issues/155251
https://github.com/sctweedie/csvdiff3
https://github.com/levish0/threeway-merge-rs
https://github.com/spyder-ide/three-merge
https://github.com/topics/merge-conflicts?o=desc&s=stars
https://gist.github.com/robertsdotpm/c7efac82a143780e5ed99efaa3e9e23e
https://arxiv.org/abs/2410.09934
https://arxiv.org/pdf/2410.09934
https://dl.acm.org/doi/10.1145/3691620.3695075
https://github.com/benedikt-schesch/AST-Merging-Evaluation
https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024.pdf
https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024-slides.pdf
https://homes.cs.washington.edu/~mernst/pubs/merge-evaluation-ase2024-abstract.html
https://conf.researchr.org/details/ase-2024/ase-2024-research/67/Evaluation-of-Version-Control-Merge-Tools
https://feihe.github.io/materials/oopsla18.pdf
https://arxiv.org/html/2407.18888v1
https://arxiv.org/pdf/1802.06551
https://paulz.me/files/mastery-preprint.pdf
https://ar5iv.labs.arxiv.org/html/2109.00084
https://openreview.net/pdf?id=WXwg_9eRQ0T
https://www.researchgate.net/publication/328508000_Conflict_resolution_for_structured_merge_via_version_space_algebra
https://www.sciencedirect.com/science/article/pii/S0164121224001158
https://ar5iv.labs.arxiv.org/html/1508.01872
https://arxiv.org/html/2507.19687
https://www.altova.com/blog/2026/02/comparing-markdown-files-in-the-age-of-agentic-ai-why-diffdog
https://github.com/knennigtri/merge-markdown
https://www.markdowntoolbox.com/tools/combine-files
https://github.com/abhinav/stitchmd
https://github.com/kovetskiy/mark
https://www.surfsidemedia.in/post/how-do-you-handle-merge-conflicts-in-markdown-files
https://pre-commit.com/
https://github.com/pre-commit/pre-commit-hooks
https://github.com/pre-commit/pre-commit-hooks/issues/881
https://github.com/pre-commit/pre-commit-hooks/issues/300
https://gist.github.com/maxmarkus/8a81edd58dd65a45731f
https://www.marcusfolkesson.se/blog/pre-commit/
https://www.elliotjordan.com/posts/pre-commit-01-intro/
https://github.com/napari/napari/issues/6122
https://www.cortex.io/post/an-overview-of-cookiecutter
https://pawamoy.github.io/posts/somewhat-modern-python-development/
https://www.astronomer.io/blog/standardizing-astro-projects-with-cookiecutter-and-cruft/
https://www.linkedin.com/posts/chriskrycho_jujutsu-jj-git-activity-7267318463709241344-Jxr8
https://www.linkedin.com/posts/chriskrycho_jj-initsympolymathesy-by-chris-krycho-activity-7159258932136267777-crAg
https://mastodon.social/@chriskrycho/111870328199685180
https://lobste.rs/s/xaobva/better_merge_workflow_with_jujutsu
https://github.com/dfm/corner.py/pull/205
https://github.com/cruft/cruft/issues/47
https://github.com/cruft/cruft/issues/287
https://github.com/cruft/cruft/issues/131
https://github.com/cruft/cruft/issues/67
https://github.com/cruft/cruft/issues/142
https://github.com/cruft/cruft/issues/82
https://github.com/cruft/cruft/issues/276
https://www.jetbrains.com/help/idea/resolve-conflicts.html
https://medium.com/@kaltepeter/tools-to-master-merge-conflicts-6d05b21a8ba8
http://tedfelix.com/software/git-conflict-resolution.html
https://articles.mergify.com/resolve-git-merge-conflicts/
https://www.blenddata.nl/blogs/cruft-vs-copier-template-updates-automatiseren-op-schaal
https://engineering.salesforce.com/automating-70-of-dependency-vulnerability-management-with-renovate-and-ci-cd/
https://docs.renovatebot.com/modules/manager/gitlabci/
https://www.mend.io/renovate/
```

---

## Open Questions

1. **Should sherpa sync produce Git-compatible conflict markers or custom section markers?** Git markers enable IDE tooling but imply line-level granularity. Custom markers could encode section-level semantics (heading path, section hash) but sacrifice tooling compatibility.

2. **How should machine-readable conflict metadata work?** Options: YAML frontmatter field (`conflicts: [section-slug-1, section-slug-2]`), HTML comments inline (`<!-- sherpa:conflict section="..." -->`), or sidecar `.conflicts.json` file. The Renovate/Copier failure mode demands that unresolved conflicts be programmatically detectable.

3. **What does "deferred resolution" mean for convention files?** If a convention file has an unresolved section conflict, is the convention active? Does the local version apply until resolved? Does the entire file become inactive? This has behavioral implications for agent systems consuming conventions.

4. **Should sherpa sync offer a `--conflict` flag like Copier?** Given the strong consensus toward inline markers, a simpler approach might be: always inline, never .rej, but provide `sherpa sync --check` for CI that exits non-zero if unresolved conflicts exist.

5. **How does Copier's context-lines parameter map to section-level merge?** Copier uses line-count context for patch matching. Section-level merge uses heading boundaries as natural context delimiters, potentially eliminating this parameter entirely.

6. **What conflict marker format should be used inside markdown sections?** Standard Git `<<<<<<<`/`=======`/`>>>>>>>` will render visibly in markdown preview tools. Is this a feature (visible reminder) or a bug (broken docs)?

7. **Should resolved conflicts leave audit trails?** Flexlate stores resolution history in Git branches to avoid re-presenting resolved conflicts. Should sherpa sync track which sections were manually resolved to avoid re-conflicting on the same content?
