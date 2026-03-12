# Mylyn & Furnas DOI Deep Dive

Research artifact from Iteration 1 of the DOI Model for Agents sub-initiative.
Date: 2026-03-12

---

## 1. Furnas's Generalized Fisheye Views (CHI 1986)

### The Original DOI Formula

Furnas defined:

```
DOI_fisheye(x | . = y) = API(x) - D(x, y)
```

Where:
- **x** = any point in the information structure
- **y** = the current focal point (`. = y` means "given the user is looking at y")
- **API(x)** = A Priori Importance of x — how globally important x is, independent of where the user is looking
- **D(x, y)** = Distance from x to y in the information structure

The formula says: **an element's interest = its global importance minus its distance from the user's focus**. Elements with DOI below a threshold are filtered out.

### API (A Priori Importance) — Concrete Meaning

For **tree structures** (the primary data structure Furnas analyzed):
- API is typically mapped to **depth in the tree** — root nodes have highest API, leaves have lowest
- Specifically: `API(x) = -depth(x)` (negative, because deeper = less important)
- For an organizational chart: the CEO has API = 0, VPs have API = -1, etc.
- For source code: a package has higher API than a class, which has higher API than a method

For **calendars** (Furnas's running example):
- Year has highest API, month next, week next, day lowest
- Today's date always has high DOI regardless of API because D = 0

For **source code** (Furnas discussed this as an application domain):
- API maps to the nesting level in the program structure tree
- Top-level declarations have higher API than nested blocks
- The "current line" being edited has D = 0, making it always visible regardless of API

### D (Distance) — How It's Computed

For tree structures, Furnas defined distance as **tree distance** — the number of edges on the unique path between two nodes in the tree. This means:
- Sibling nodes have D = 2 (up to parent, down to sibling)
- Parent has D = 1
- Grandparent has D = 2
- A node in a totally different subtree can have very high D

### The Threshold/Filtering Mechanism

Elements are shown if and only if:
```
DOI_fisheye(x | . = y) >= threshold
```

The threshold can be adjusted to show more or less context. A higher threshold shows only the most important nearby elements; a lower threshold shows a wider view.

### Key Insight for Agent Context

Furnas's model is **static and structural** — it assumes a fixed hierarchy and computes DOI from structure alone. There is no learning, no interaction history, no decay. The "current point" y changes as the user navigates, but the formula itself doesn't adapt to behavior.

**Source:** Furnas, G.W. (1986). "Generalized Fisheye Views." CHI '86 Proceedings, pp. 16-23. ACM.
- ACM DL: https://dl.acm.org/doi/10.1145/22627.22342
- Semantic Scholar: https://www.semanticscholar.org/paper/Generalized-Fisheye-Views-Furnas/28b62332c5b25fd74e6d15ef5c6a1e3e4de65823

---

## 2. Mylyn's DOI Implementation — Exact Algorithm from Source Code

### Overview of the Divergence from Furnas

Mylyn fundamentally redefines DOI. Where Furnas computed DOI from **structure** (tree depth + distance), Mylyn computes DOI from **interaction history** (what you've selected, edited, and executed). The formula is entirely different:

```
DOI(element) = EncodedValue + PredictedBias + PropagatedBias

EncodedValue = (selections * SELECTION_SCALING)
             + (edits * EDIT_SCALING)
             + (commands * COMMAND_SCALING)
             + manipulationBias
             - DecayValue

DecayValue = (currentUserEventCount - eventCountOnCreation) * DECAY_RATE
```

This is sourced directly from the Mylyn source code (see Section 2.1 below).

### 2.1 Exact Default Coefficients (from InteractionContextScaling.java)

| Parameter | Default Value | Meaning |
|-----------|--------------|---------|
| `SELECTION_SCALING` | **1.0** | Weight per selection event |
| `EDIT_SCALING` | **0.7** | Weight per edit event (less than selection!) |
| `COMMAND_SCALING` | **1.0** | Weight per command event (fallback default) |
| `DECAY_RATE` | **0.017** | Interest lost per subsequent user event |
| `INTERESTING_THRESHOLD` | **0.0** | Minimum DOI to be considered "interesting" |
| `LANDMARK_THRESHOLD` | **30.0** | DOI value at which element becomes a "landmark" |
| `FORCED_LANDMARK` | **210.0** | 7x landmark; user-explicit "Mark as Landmark" |

**Critical finding: Edit scaling (0.7) is LOWER than selection scaling (1.0).** This is counterintuitive — you'd expect edits to be more important than selections. The rationale (from the code comment style and Kersten's work): edits produce more events than selections for the same conceptual action, so the scaling compensates. A single conceptual edit produces multiple edit events (character-by-character), while a selection is a single discrete event.

**Source:** `InteractionContextScaling.java` in `org.eclipse.mylyn.internal.context.core`
- GitHub: https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContextScaling.java

### 2.2 Decay Mechanism — Per-Interaction, Not Per-Time

**This is a critical architectural decision.** Mylyn's decay is NOT time-based. It is based on the **count of user interaction events** since the element was first touched.

```java
public float getDecayValue() {
    if (context != null) {
        return (context.getUserEventCount() - eventCountOnCreation) * contextScaling.getDecay();
    } else {
        return 0;
    }
}
```

- `context.getUserEventCount()` = total SELECTION + EDIT + COMMAND + PREFERENCE events in the entire context
- `eventCountOnCreation` = the global event count at the time this element first appeared in context
- Each subsequent user event across the ENTIRE context decays ALL existing elements by 0.017

**Why this matters for agents:** Time-based decay would be meaningless for agents (they can process in milliseconds or pause for hours). Event-based decay transfers directly — you can count "agent actions" or "LLM invocations" instead of clock time.

**Example walkthrough:**
- User selects MethodA at global event #100. eventCountOnCreation = 100.
- MethodA gets 1.0 interest (1 selection * 1.0 scaling).
- User makes 50 more interactions elsewhere. Global count = 150.
- MethodA's decay = (150 - 100) * 0.017 = 0.85
- MethodA's encoded value = 1.0 - 0.85 = 0.15 (still above 0.0, still "interesting")
- After ~59 more events with no interaction with MethodA: decay = 109 * 0.017 = 1.853 > 1.0, so it becomes uninteresting

**At default settings, a single selection decays to uninteresting after ~59 subsequent events.** A single edit decays after ~41 events (0.7 / 0.017 ≈ 41). A landmark (DOI >= 30) requires ~30 selections without any decay, or sustained interaction over time.

**Source:** `DegreeOfInterest.java` in `org.eclipse.mylyn.internal.context.core`
- GitHub: https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/DegreeOfInterest.java

### 2.3 Interest Classification

From `DegreeOfInterest.java`:

| Classification | Condition | Meaning |
|---------------|-----------|---------|
| **Interesting** | `getValue() > 0.0` | Shown in focused views |
| **Landmark** | `getValue() >= 30.0` | Shown prominently, bolded |
| **Propagated** | No direct interaction, but parent/child interest > 0 | Shown due to structural relation |
| **Predicted** | Interest only from prediction bias | Machine-suggested relevance |

### 2.4 Event Types and Their Roles

From `InteractionEvent.java`, Mylyn tracks 8 event kinds:

| Kind | Source | isUserEvent | Effect on DOI |
|------|--------|-------------|---------------|
| `SELECTION` | Eclipse post-selection | Yes | Adds to `selections` accumulator |
| `EDIT` | Text changes in editor | Yes | Adds to `edits` accumulator |
| `COMMAND` | Buttons, menus, shortcuts | Yes | Adds to `commands` accumulator |
| `PREFERENCE` | Workbench preference changes | Yes | No direct DOI effect |
| `PREDICTION` | ML/heuristic suggestions | No | Adds to `predictedBias` |
| `PROPAGATION` | Parent interest from child | No | Adds to `propagatedBias` |
| `MANIPULATION` | "Mark as Landmark", decay correction | No | Adds to `manipulationBias` |
| `ATTENTION` | Task/workbench lifecycle | No | Used for activity tracking only |

Only `isUserEvent()` events (SELECTION, EDIT, COMMAND, PREFERENCE) increment `numUserEvents`, which drives decay for ALL elements.

**Source:** `InteractionEvent.java` in `org.eclipse.mylyn.monitor.core`
- GitHub: https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.commons/org.eclipse.mylyn.monitor.core/src/org/eclipse/mylyn/monitor/core/InteractionEvent.java

### 2.5 Interest Propagation to Parents

From `InteractionContextManager.java`, propagation follows this policy:

> "A parent should not have an interest lower than that of one of its children."

The propagation algorithm (method `propegateInterestToParents` — note the typo in the actual source):

1. When a user event touches an element, propagation walks UP the containment tree
2. Maximum propagation depth: **17 levels** (hardcoded as `MAX_PROPAGATION`)
3. If a parent's interest is LOWER than the child's, the parent receives a PROPAGATION event with `increment = child_interest - parent_interest`
4. A "decay correction" MANIPULATION event is also added if the parent would otherwise be uninteresting — this ensures parents stay visible when children are
5. Propagation crosses bridge boundaries (e.g., from Java method to resource file)

This is where Mylyn connects back to Furnas's structural intuition — parent containers gain interest from their children, approximating Furnas's API-based structural importance.

**Source:** `InteractionContextManager.java` lines ~1293-1420
- GitHub: https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContextManager.java

### 2.6 The Cold-Start Mechanism

From `InteractionContextManager.ensureIsInteresting()`:

```java
private float ensureIsInteresting(IInteractionContext interactionContext,
    String contentType, String handle, IInteractionElement previous,
    float previousInterest) {
    float decayOffset = 0;
    if (previousInterest < 0) { // reset interest if not interesting
        decayOffset = -1 * previous.getInterest().getValue();
        addInteractionEvent(interactionContext,
            new InteractionEvent(InteractionEvent.Kind.MANIPULATION,
                contentType, handle, SOURCE_ID_DECAY_CORRECTION, decayOffset));
    }
    return decayOffset;
}
```

**When a user interacts with an element that has decayed below zero, Mylyn injects a MANIPULATION event that resets its interest to zero before adding the new interaction event.** This means:

- Returning to a previously-used element is NOT penalized by accumulated decay
- The element gets a fresh start each time the user re-engages
- This is effectively a "re-engagement bonus" that prevents the context from becoming permanently stale

**Cold-start for new tasks:** When activating a task with NO context, the context is empty. The first interactions build interest from scratch. There is NO warm-start heuristic — Mylyn does not predict what might be relevant. The FAQ confirms this: context "works best after establishing usage patterns through interaction."

---

## 3. Context Persistence — Save/Restore Across Task Switches

### Data Format

Contexts are saved as **zipped XML files** (extension `.xml.zip`) in `workspace/.metadata/.mylyn/contexts/`.

Each context file contains a flat list of `InteractionEvent` elements with these attributes:
- `Kind` (selection, edit, command, etc.)
- `StructureKind` (content type — "java", "resource", etc.)
- `StructureHandle` (unique element ID, e.g., fully-qualified Java method name)
- `OriginId` (which UI affordance generated the event)
- `Navigation` (relation to previous element)
- `Delta` (extra data, XML-encoded)
- `Interest` (the event's interest contribution as a float)
- `StartDate` / `EndDate` (timestamps)
- `NumEvents` (for collapsed/aggregate events)
- `CreationCount` (global event count at creation — critical for decay reconstruction)

### Context Collapse for Storage

Before saving, Mylyn **collapses** the interaction history:
1. Per element, consecutive events of the same kind are merged into `AggregateInteractionEvent` objects
2. The aggregate stores: total interest contribution, event count, start/end dates, and `eventCountOnCreation`
3. This dramatically reduces file size (95%+ compression ratio per the integrator docs)
4. When loading, events are replayed through `parseEvent()` to reconstruct the full DOI state

### Task Switching Flow

1. **Deactivate current task:**
   - Save context to disk (collapsed XML, zipped)
   - Clear all context state from memory
   - Notify listeners (which close editors, unfocus views, etc.)
   - Record deactivation in activity meta-context

2. **Activate new task:**
   - Load context from disk (or create empty if none exists)
   - Replay all events through `parseEvent()` to reconstruct elementMap, landmarkMap, DOI values
   - Notify PRE_ACTIVATED listeners (bridges prepare)
   - Put context into active context map
   - Notify ACTIVATED listeners (which reopen editors, refocus views, restore perspective)
   - Record activation in activity meta-context

**Source:** `InteractionContextManager.java`, `LocalContextStore.java`, `SaxContextWriter.java`, `SaxContextContentHandler.java`

---

## 4. Production Lessons — 20 Years of Mylyn (2005-2025)

### What Worked

- **Interest-based filtering is the killer feature.** The FAQ states Mylyn's value is reducing "information overload" by showing only task-relevant elements. The focused Package Explorer and auto-managed editors are the most-used features.
- **Event-based decay** creates predictable behavior. The FAQ explicitly notes: "Elements disappear automatically through 'interest decay' based on the number of task-related selections you make, not elapsed time."
- **Context sharing** via task repositories (Bugzilla, JIRA) allows teammates to download a task's context and immediately focus on the same code.
- **Automatic editor management** — opening/closing editors based on context — was controversial but recommended by Mylyn's own FAQ as the proper way to use the tool.

### What Broke / Was Removed

- **Active Search** and **Active Hierarchy** views were experimental features that tried to proactively search for related elements. They were "moved to the Mylyn Sandbox" because they "required too much screen space and manual manipulation of scope as tasks progressed." This is a warning about proactive context expansion.
- **The `org.eclipse.mylyn.resources.ui.prefs` file** could grow very large and cause slow startup — a production scaling issue with the resource monitoring subsystem.
- **Editor management was the #1 complaint.** Users were confused when "all editor tabs disappeared" on task deactivation. The behavior is correct (context switch = close irrelevant editors) but violated expectations. Configurable via `Preferences > Mylyn > Context > Manage open editors to match task context`.
- **Closing an editor** was interpreted as "I'm not interested in this anymore," causing the element to lose interest. This was unintuitive and configurable but the default was intentional.
- **Multiple workspace support** was "currently limited" — a persistent architectural constraint from Eclipse itself.

### Features Added Over Time

- **Element Detail Slider** — UI control to adjust the minimum interest level for display, from "show all" to "show only landmarks"
- **Copy Context Between Tasks** — transfer context relationships to related work
- **Attach/Retrieve Context** — upload context to Bugzilla/JIRA for team sharing
- **Clear Context** — nuclear option to reset without deactivating task
- **Alt+Click Navigation** — temporarily reveal filtered children without breaking focus
- **Remove from Focus vs Remove from Context** — "Remove from Focus" temporarily hides; "Remove from Context" permanently deletes from interaction history (useful before sharing)

### Adoption Trajectory

- **Peak adoption:** Mylyn was bundled with Eclipse (part of standard distribution for years)
- **Current state:** ~100 installs/month from Eclipse Marketplace (as of 2025-2026). Clearly in maintenance mode.
- **Tasktop:** Mik Kersten founded Tasktop Technologies to commercialize Mylyn's ideas. Tasktop focused on ALM integration rather than DOI. Tasktop was eventually acquired by Planview.
- **IntelliJ IDEA:** Implemented task/context switching (save/restore open tabs, breakpoints, changelists per task) but WITHOUT DOI computation — no interest scoring, no decay, no filtering based on interaction history. Just bookmarking.

### Why Mylyn Declined

Based on the evidence: Mylyn was deeply coupled to Eclipse's extension architecture. As the industry moved to VS Code, JetBrains, and web IDEs, Mylyn couldn't follow. The DOI model itself was never the problem — the platform dependency was.

**Sources:**
- Eclipse Mylyn FAQ: https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/FAQ/Task-Focused-UI.html
- Mylyn User Guide: https://github.com/eclipse-mylyn/org.eclipse.mylyn/wiki/User-Guide
- Eclipse Marketplace: https://marketplace.eclipse.org/content/mylyn
- Wiki FAQ: https://wiki.eclipse.org/Mylyn/FAQ

---

## 5. Relationship Between Mylyn's DOI and Furnas's DOI

### Where They Align

| Concept | Furnas | Mylyn |
|---------|--------|-------|
| Filtering by interest | DOI threshold hides low-interest items | `isInteresting()` threshold hides elements with DOI <= 0 |
| Structural importance | API(x) = f(tree depth) | Propagation gives parents interest proportional to children |
| Distance from focus | D(x,y) = tree distance from focal point | Decay = distance in EVENT space from last interaction |
| Adjustable threshold | Threshold parameter | Element Detail Slider |

### Where They Diverge

| Dimension | Furnas | Mylyn |
|-----------|--------|-------|
| **Primary signal** | Structure (tree depth + position) | Interaction (selections + edits) |
| **What changes** | Focal point y moves; API and D are recomputed | Events accumulate; DOI grows and decays |
| **Decay model** | None — DOI is instantaneous | Linear event-based decay (0.017 per event) |
| **Learning** | None — purely structural | Implicitly learns from interaction patterns |
| **Hierarchy role** | Defines BOTH API and D | Only used for propagation (bottom-up only) |
| **A priori importance** | Explicit (node depth) | None — all elements start at 0 |
| **Cold start** | Full view available (DOI computed from structure) | Empty context; must interact to build |

### Kersten's Key Adaptation

Mylyn replaced Furnas's structural DOI with an **interaction-weighted accumulator plus linear decay**. The Furnas distance metric (tree distance from focal point) became the Mylyn decay metric (event distance from last touch). Furnas's API (structural importance) was partially preserved via parent propagation, but plays a much smaller role.

The deepest difference: Furnas's DOI is a **function** recomputed at each moment from position. Mylyn's DOI is a **state** that accumulates from history. Furnas is stateless. Mylyn is stateful.

---

## 6. Academic Evaluations and Extensions

### Kersten & Murphy, FSE 2006

"Using Task Context to Improve Programmer Productivity"
- The primary evaluation paper for Mylyn
- DOI: https://doi.org/10.1145/1181775.1181777
- DBLP: https://dblp.org/rec/conf/sigsoft/KerstenM06

### Kersten & Murphy, AI Magazine 2015

"Reducing Friction for Knowledge Workers with Task Context"
- A retrospective 10 years after the original work
- Published in AI Magazine, Vol. 36, Issue 2, pp. 33-41
- DOI: https://doi.org/10.1609/aimag.v36i2.2581
- DBLP: https://dblp.org/rec/journals/aim/KerstenM15

### Kersten & Murphy, AOSD 2005

"Mylar: a degree-of-interest model for IDEs"
- The original Mylar paper introducing the DOI model
- DOI: https://doi.org/10.1145/1052898.1052912

### Tang et al., Science of Computer Programming 2022

"Automated Evolution of Feature Logging Statement Levels Using Git Histories and Degree of Interest"
- Extended Mylyn's DOI model for log level management
- Built on JGit and Mylyn frameworks
- Evaluated on 18 Java projects, ~3M lines of code
- arXiv: https://arxiv.org/abs/2104.07736
- DOI: https://doi.org/10.1016/j.scico.2021.102724

### Gaps in the Literature

The search turned up **very few** independent replications or evaluations of Mylyn's DOI model outside of the original authors' work. The Tang et al. paper is notable for being one of the few that actually built on Mylyn's DOI implementation. The lack of independent evaluation is itself a finding — DOI for IDEs was influential conceptually but not widely replicated in academic studies.

---

## 7. Other Tools That Adopted the Model

### Full DOI adoption: None found

No other major IDE or development tool appears to have implemented Mylyn's interaction-based DOI model. IntelliJ IDEA has task context switching (save/restore tabs and changelists) but no interest scoring or decay.

### Partial adoption / influenced by

- **IntelliJ IDEA** — Task context switching, but no DOI computation
- **VS Code** — No equivalent feature. Extensions like "Project Manager" save workspace state but don't filter by interest.
- **Tasktop** (Kersten's company) — Commercialized ALM integration aspects of Mylyn, not the DOI model itself
- **IBM Rational Team Concert** — Integrated Mylyn's task-focused interface into their Eclipse-based IDE

---

## 8. Implications for Agent Context Scoping

### Direct Transfers

1. **Event-based decay is perfect for agents.** Count agent actions (tool invocations, file reads, LLM calls) instead of clock time. An element touched 50 actions ago is less relevant than one touched 5 actions ago.

2. **The dual threshold (interesting/landmark) maps cleanly.** "Interesting" = include in context window. "Landmark" = always include, pin to context. This gives agents a two-tier attention system.

3. **Propagation up the containment tree** is directly applicable. If an agent edits a function, the containing file and module should gain interest. This prevents the "can't see the forest for the trees" problem.

4. **The cold-start reset** (`ensureIsInteresting`) is critical. When an agent re-engages with a previously-decayed element, reset the penalty. Don't make the agent pay for having worked on something else.

5. **Context serialization as zipped event history** enables task switching for agents. Save the interaction log, not just the current DOI values, so you can replay and reconstruct.

### Necessary Adaptations

1. **Agent events are different from human events.** An agent doesn't "select" or "edit" in the IDE sense. Need to define agent-specific event kinds: FILE_READ, FILE_WRITE, TOOL_INVOKE, SEARCH_RESULT, LLM_RESPONSE, etc.

2. **The scaling factors need re-tuning.** Mylyn's 0.7 edit scaling and 0.017 decay rate were tuned for human interaction rates (~1 event per second). Agents can generate thousands of events per minute. The ratios may transfer but the absolute values won't.

3. **Furnas's API (structural importance) deserves rehabilitation.** Mylyn dropped it, but for agents, we know certain files are structurally important (package.json, CLAUDE.md, config files). A hybrid model — Furnas's structural API + Mylyn's interaction DOI — may outperform either alone.

4. **Predicted interest needs to be first-class.** Mylyn had `predictedBias` but the Active Search features that would have fed it were removed as too expensive. For agents, prediction is cheap (embeddings, co-change analysis, import graphs). This is the biggest opportunity.

5. **Multi-context composition needs work.** Mylyn's `CompositeDegreeOfInterest` simply sums DOI across contexts. For agents working on related tasks, a more sophisticated merge (shared landmarks, weighted combination) would be valuable.

### What Mylyn Got Wrong (and We Should Avoid)

1. **No structural priors.** Starting every element at DOI=0 means the agent must discover every relevant file through interaction. A warm-start with structural analysis (imports, co-change, semantic similarity) is essential.

2. **Linear decay is too simple.** Mylyn's linear decay means elements fall off at a constant rate regardless of how important they were. An exponential or logarithmic decay (fast initial decay, slow tail) might better match actual relevance patterns.

3. **Fixed coefficients.** Mylyn's scaling factors are global constants. Per-task or per-project tuning (learned from historical context patterns) could significantly improve accuracy.

---

## Sources

### Primary Papers
| Paper | URL | What It Contains |
|-------|-----|-----------------|
| Furnas 1986, CHI | https://dl.acm.org/doi/10.1145/22627.22342 | Original DOI formula: DOI = API - D |
| Kersten & Murphy 2005, AOSD | https://dl.acm.org/doi/10.1145/1052898.1052912 | Original Mylar paper, DOI for IDEs |
| Kersten & Murphy 2006, FSE | https://dl.acm.org/doi/10.1145/1181775.1181777 | Evaluation of task context on productivity |
| Kersten & Murphy 2015, AI Mag | https://doi.org/10.1609/aimag.v36i2.2581 | 10-year retrospective on task context |
| Tang et al. 2022, SCP | https://doi.org/10.1016/j.scico.2021.102724 | DOI for log level evolution |

### Source Code (Primary Evidence)
| File | URL | What It Contains |
|------|-----|-----------------|
| DegreeOfInterest.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/DegreeOfInterest.java | Core DOI computation: getValue(), getEncodedValue(), getDecayValue(), addEvent() |
| InteractionContextScaling.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContextScaling.java | All default coefficients: decay=0.017, edit=0.7, landmark=30, interesting=0 |
| InteractionContext.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContext.java | Context model: elementMap, landmarkMap, event processing, context collapse |
| InteractionEvent.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.commons/org.eclipse.mylyn.monitor.core/src/org/eclipse/mylyn/monitor/core/InteractionEvent.java | Event kinds: SELECTION, EDIT, COMMAND, PREDICTION, PROPAGATION, MANIPULATION, ATTENTION |
| InteractionContextManager.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContextManager.java | Task switching, propagation to parents (MAX_PROPAGATION=17), cold-start reset |
| SaxContextWriter.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/SaxContextWriter.java | XML serialization format for context files |
| SaxContextContentHandler.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/SaxContextContentHandler.java | XML deserialization, event reconstruction |
| LocalContextStore.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/LocalContextStore.java | File-based context persistence, save/load/merge |
| AggregateInteractionEvent.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/AggregateInteractionEvent.java | Collapsed events for storage efficiency |
| CompositeDegreeOfInterest.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/CompositeDegreeOfInterest.java | Multi-context DOI aggregation (simple sum) |
| InteractionContextElement.java | https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContextElement.java | Element with handle, edges, and DegreeOfInterest |

### Documentation
| Resource | URL | What It Contains |
|----------|-----|-----------------|
| Mylyn User Guide (Task-Focused Interface) | https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/User_Guide/Task-Focused-Interface.html | User-facing feature descriptions |
| Mylyn FAQ (Task-Focused UI) | https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/FAQ/Task-Focused-UI.html | Decay behavior, editor management, configuration |
| Mylyn Wiki FAQ | https://wiki.eclipse.org/Mylyn/FAQ | DOI description, timing mechanism, multi-workspace limitations |
| Mylyn Integrator Reference | https://wiki.eclipse.org/Mylyn/Integrator_Reference | API details, bridge architecture, event structure |
| Mylyn Architecture | https://wiki.eclipse.org/Mylyn/Architecture | Framework overview: Tasks, Context, Monitor |
| Mylyn GitHub User Guide | https://github.com/eclipse-mylyn/org.eclipse.mylyn/wiki/User-Guide | Context management, element detail slider, task switching |
| Eclipse Marketplace | https://marketplace.eclipse.org/content/mylyn | Usage stats (~100 installs/month in 2025) |
| Mylyn Dev Mailing List | https://www.eclipse.org/lists/mylyn-dev/ | Archives 2007-2025 |

### Additional References
| Resource | URL | What It Contains |
|----------|-----|-----------------|
| UBC SPL Mylar project page | https://www.cs.ubc.ca/labs/spl/projects/mylar/ | Original project page with publication links |
| Gail Murphy homepage | https://blogs.ubc.ca/gailcmurphy | Link to publications page |
| IntelliJ task/context docs | https://www.jetbrains.com/help/idea/managing-tasks-and-context.html | Comparison: task context without DOI |
| Tang et al. on arXiv | https://arxiv.org/abs/2104.07736 | DOI for log level evolution |
| Mylyn GitHub repository | https://github.com/eclipse-mylyn/org.eclipse.mylyn | Full source code |

---

## Raw Links (Every URL Encountered)

```
https://dl.acm.org/doi/10.1145/22627.22342
https://dl.acm.org/doi/10.1145/1181775.1181777
https://dl.acm.org/doi/10.1145/1052898.1052912
https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/User_Guide/Task-Focused-Interface.html
https://help.eclipse.org/latest/topic/org.eclipse.mylyn.help.ui/Mylyn/FAQ/Task-Focused-UI.html
https://www.cs.ubc.ca/labs/spl/projects/mylar/publications/2005-aosd-mylar.pdf
https://www.cs.ubc.ca/labs/spl/projects/mylar/publications/2006-fse-mylar.pdf
https://www.cs.columbia.edu/~blei/fogm/2018F/materials/Furnas1986.pdf
https://en.wikipedia.org/wiki/Mylyn
https://wiki.eclipse.org/Mylyn/Integrator_Reference
https://www.semanticscholar.org/paper/Mylar%3A-a-degree-of-interest-model-for-IDEs-Kersten-Murphy/e4d3c91e0c7c9e4dd33abe62c204e1d5f1b9a07a
https://www.semanticscholar.org/paper/Using-Task-Context-to-Improve-Programmer-Kersten-Murphy/dc3cde0a75e8ae4dc31b7dbf7ec1c9d57fe3b76e
https://github.com/eclipse-mylyn/org.eclipse.mylyn
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/DegreeOfInterest.java
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContextScaling.java
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContext.java
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContextManager.java
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/SaxContextWriter.java
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/SaxContextContentHandler.java
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/LocalContextStore.java
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/AggregateInteractionEvent.java
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/CompositeDegreeOfInterest.java
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.context/org.eclipse.mylyn.context.core/src/org/eclipse/mylyn/internal/context/core/InteractionContextElement.java
https://github.com/eclipse-mylyn/org.eclipse.mylyn/blob/main/mylyn.commons/org.eclipse.mylyn.monitor.core/src/org/eclipse/mylyn/monitor/core/InteractionEvent.java
https://kerstens.org/mik/publications/mylar-aosd2005.pdf
https://kerstens.org/mik/publications/
https://www.cs.ubc.ca/labs/spl/projects/mylar/
https://www.cs.ubc.ca/~murphy/papers/2006/kersten-murphy-fse06.pdf
https://www.cs.ubc.ca/~murphy/papers/2005/mylar-aosd-2005.pdf
https://open.library.ubc.ca/collections/ubctheses/24/items/1.0052083
https://open.library.ubc.ca/media/download/pdf/24/1.0052083/2
https://wiki.eclipse.org/Mylyn/Architecture
https://wiki.eclipse.org/Mylyn/FAQ
https://wiki.eclipse.org/Mylyn/User_Guide
https://github.com/eclipse-mylyn/org.eclipse.mylyn/wiki/User-Guide
https://eclipse.dev/mylyn/
https://www.eclipse.org/mylyn/
https://marketplace.eclipse.org/content/mylyn
https://www.eclipse.org/lists/mylyn-dev/
https://blogs.ubc.ca/gailcmurphy
https://blogs.ubc.ca/gailcmurphy/publications/
https://doi.org/10.1609/aimag.v36i2.2581
https://onlinelibrary.wiley.com/doi/10.1609/aimag.v36i2.2581
https://ojs.aaai.org/index.php/aimagazine/article/view/2581
https://ojs.aaai.org/index.php/aimagazine/article/view/2581/2470
https://dblp.org/rec/conf/sigsoft/KerstenM06
https://dblp.org/rec/journals/aim/KerstenM15
https://arxiv.org/abs/2104.07736
https://doi.org/10.1016/j.scico.2021.102724
https://www.researchgate.net/publication/221321129_Generalized_Fisheye_Views
https://www.researchgate.net/publication/221553791_Mylar_a_degree-of-interest_model_for_IDEs
https://www.researchgate.net/publication/220854076_Using_Task_Context_to_Improve_Programmer_Productivity
https://www.jetbrains.com/help/idea/managing-tasks-and-context.html
https://web.eecs.umich.edu/~aprakash/eecs589/pdfs/Furnas86.pdf
https://www.cs.mcgill.ca/~martin/teaching/comp766-winter-2007/fisheye.pdf
https://faculty.cc.gatech.edu/~stasko/7450/17/Notes/fisheye.pdf
https://www.cc.gatech.edu/~stasko/7450/17/Notes/fisheye.pdf
https://www.interaction-design.org/literature/book/the-encyclopedia-of-human-computer-interaction-2nd-ed/fisheye-views
https://ixdf.org/literature/book/the-encyclopedia-of-human-computer-interaction-2nd-ed/fisheye-views
https://infovis-wiki.net/wiki/Degree_of_Interest
https://en.wikipedia.org/wiki/Fisheye_view
https://en.wikipedia.org/wiki/Degree_of_interest
https://www.sciencedirect.com/topics/computer-science/fisheye-view
https://link.springer.com/referenceworkentry/10.1007/978-0-387-39940-9_175
https://link.springer.com/chapter/10.1007/978-3-540-70956-5_6
https://www.sciencedirect.com/science/article/pii/S0950584921001932
https://www.tasktop.com/blog/degree-of-interest
https://blog.planview.com/
https://bugs.eclipse.org/bugs/buglist.cgi?product=Mylyn&component=Context
https://github.com/eclipse-mylyn/org.eclipse.mylyn/issues
https://www.cs.toronto.edu/~sme/CSC2524/slides/11-FisheyeViews.pdf
https://www.cs.toronto.edu/~sme/papers/2006/Kersten-Murphy-FSE2006.pdf
https://www2.eecs.berkeley.edu/Pubs/TechRpts/2006/EECS-2006-21.pdf
https://www.jot.fm/issues/issue_2006_05/article3.pdf
https://citeseerx.ist.psu.edu/
https://www.informit.com/articles/article.aspx?p=1245785
https://www.ibm.com/docs/en/rational-team-concert/6.0.3?topic=mylyn-task-focused-interface
https://git.eclipse.org/c/mylyn/org.eclipse.mylyn.context.git/
https://www.cs.ubc.ca/labs/spl/projects/codetrails/
https://ieeexplore.ieee.org/abstract/document/7372030
```

---

## Open Questions

1. **What are the exact evaluation results from Kersten & Murphy FSE 2006?** The paper itself is paywalled. We need the specific productivity measurements — was it 10% faster? 50%? What tasks were used? How many participants?

2. **What does the 2015 AI Magazine retrospective say?** Also paywalled. This is the most important source for "what broke in production" insights over Mylyn's first decade.

3. **Kersten's PhD thesis from UBC** — Likely contains the most detailed technical description of the DOI model and its rationale. URL: https://open.library.ubc.ca/collections/ubctheses/24/items/1.0052083 but couldn't access the PDF.

4. **Has anyone tried non-linear decay?** Mylyn uses linear decay exclusively. Exponential, logarithmic, or step-function decay models have not been explored in the literature we found.

5. **What would Furnas API + Mylyn interaction hybrid look like?** Combining structural importance (package.json > utils/helpers.ts) with interaction history (recently-touched files) seems obviously correct but we found no implementation.

6. **Why 0.017 for decay?** The specific value appears to be hand-tuned. No published rationale for this number was found in any accessible source.

7. **How does the Eclipse JDT bridge compute structure handles?** The handle format determines what "element" means — is it a file, class, method, or line? The bridge architecture is well-documented but the actual handle granularity decisions deserve scrutiny.

8. **Has anyone applied DOI to LLM context window management specifically?** We found no academic work on this. This appears to be genuinely novel territory for the parent initiative.
