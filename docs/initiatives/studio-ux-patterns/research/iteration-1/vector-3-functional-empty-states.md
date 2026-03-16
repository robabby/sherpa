# Vector 3: Functional Empty States in Developer Tools

**Question:** What copy and action patterns work for empty states in developer tools?
**Agent dispatched:** 2026-03-15

## Findings

### Vercel Geist Empty State

Four variants ([vercel.com/geist/empty-state](https://vercel.com/geist/empty-state)):
- **Blank Slate** — basic empty state for initial experience
- **Informational** — first-use with inline CTAs and doc links
- **Educational** — contextual onboarding
- **Guide** — starter content enabling interaction

Compositional API: `<EmptyState.Root description="..." icon={...} title="..." />`

Vercel's CLI docs show commands in tabbed `<CodeBlock>` with package-manager variants — the pattern for displaying CLI commands in empty states.

### GitHub Primer Blankslate

Three scenario types ([primer.style/components/blankslate](https://primer.style/components/blankslate)):
- **First-time use** — welcome with playful illustration, simpler language
- **Temporary emptiness** — feature empty by nature (e.g., no notifications)
- **Error states** — concise summary + recovery paths

Compound component API with `<Blankslate.Visual>`, `.Heading`, `.Description`, `.PrimaryAction`, `.SecondaryAction`. Props: `border`, `narrow`, `spacious`.

Copy rules: "brief and descriptive" actions, educational secondary text, never vague ("There was a problem").

### Shopify Polaris

Most prescriptive copy rules ([polaris.shopify.com](https://polaris.shopify.com/components/layout-and-structure/empty-state)):
- Titles **must be action-oriented**: "Create orders" not "Orders"
- Buttons **must follow verb+noun**: "Add transfer" not "New transfer"
- **No articles in buttons**: "Add menu item" not "Add a menu item"
- Subtitles conversational, include articles naturally
- "Positive and encouraging, never guilt-inducing"
- Only one primary CTA

### NNGroup Research

Three core functions ([nngroup.com/articles/empty-state-interface-design](https://www.nngroup.com/articles/empty-state-interface-design/)):
1. **Communicate system status** — distinguish loading vs. absent vs. errored
2. **Provide learning cues** — contextual help on interaction ("pull revelations")
3. **Enable task pathways** — direct users toward populating actions

Examples: DataDog's "Star your favorites to list them here" (8 words, complete). Loggly's dual pathways — "add external sources" OR "explore with demo data".

**Common mistakes**: totally blank spaces, misleading feedback (saying "no content" when loading), vague instructions.

### Copy Pattern Convergence

| Pattern | Example | When |
|---------|---------|------|
| Command-first | `pnpm dev` in monospace | Next step is CLI |
| Verb+noun title | "Create your first task" | Next step is UI action |
| State explanation | "No missions in the pipeline" | Expected/normal empty |
| Dual pathway | Button + "Learn more" link | Multiple entry points |
| How-it-works | "Star favorites to list them here" | Feature needs explanation |

Developer-specific: terse over friendly, CLI commands in monospace, "Learn more" links valued, multiple entry points reduce friction.

### Component API Convergence

Consensus across Geist, Primer, Polaris:

| Prop | Type | Precedent |
|------|------|-----------|
| `icon` | ReactNode | Geist, Primer |
| `title` | string | All (action-oriented, <10 words) |
| `description` | ReactNode | All |
| `action` | `{ label, href?, onClick? }` | Polaris, Primer |
| `secondaryAction` | `{ label, href }` | Primer, Polaris |
| `variant` | `default \| compact \| bordered` | Primer |
| `children` | ReactNode | Escape hatch for code blocks |

## Sources

- [Vercel Geist Empty State](https://vercel.com/geist/empty-state)
- [GitHub Primer Blankslate](https://primer.style/components/blankslate)
- [GitHub Primer Empty States](https://primer.style/ui-patterns/empty-states)
- [Shopify Polaris EmptyState](https://polaris.shopify.com/components/layout-and-structure/empty-state)
- [NNGroup: Empty State Interface Design](https://www.nngroup.com/articles/empty-state-interface-design/)
- [Appcues: Empty States](https://www.appcues.com/blog/empty-states)

## Implications

1. **Compound component pattern** matches shadcn/ui's Card convention already in Studio.
2. **Verb+noun titles, <10 words** is the strongest convergent recommendation.
3. **CLI command slot** is Studio-specific and high-value — bridges dashboard and terminal.
4. **One primary action always** — never leave an empty state without a pathway.
5. **Under 15 words** for primary message. Dense, not padded.

## Open Questions

1. Should we support a dedicated `command` prop for CLI snippets with copy button?
2. Icons (Lucide) vs. illustrations? Icons fit the dark/monospace aesthetic better.
3. Where does the "all clear" positive empty state fit — same component or separate pattern?
