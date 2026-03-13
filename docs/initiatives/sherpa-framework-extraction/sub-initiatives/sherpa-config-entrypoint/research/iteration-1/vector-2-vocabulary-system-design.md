# Vector 2: Vocabulary System Design

**Question:** How should a white-label framework implement vocabulary/terminology customization so that domain entities can be renamed per deployment?
**Agent dispatched:** 2026-03-12

## Findings

### 1. next-intl Namespace Override Mechanics

- **Messages are plain objects, merged manually.** next-intl does not perform deep merging. Messages from multiple files are combined using JavaScript spread (`...`) at load time inside `getRequestConfig()`. Framework defaults + consumer overrides = shallow merge. ([next-intl configuration docs](https://next-intl.dev/docs/usage/configuration))
- **`defaultTranslationValues` is for shared rich text tags** (e.g., `b: (chunks) => <b>{chunks}</b>`), NOT for default message strings. Being deprecated because functions are not serializable across RSC boundary. Not relevant for vocabulary. ([next-intl translations docs](https://next-intl.dev/docs/usage/translations))
- **The actual mechanism:** Spread at `getRequestConfig` time:
  ```ts
  import sherpaDefaults from '@sherpa/studio/messages/en.json'
  import consumerOverrides from './messages/en.json'
  export default getRequestConfig(async () => ({
    messages: { ...sherpaDefaults, ...consumerOverrides }
  }))
  ```
- **Messages do NOT need to be JSON files.** `getRequestConfig` can return any object as `messages`. Can construct programmatically from TypeScript config. Sherpa can compile `VocabularyConfig` into a messages object at request time without requiring JSON. ([Discussion #1607](https://github.com/amannn/next-intl/discussions/1607))
- **Namespace scoping:** `useTranslations('sherpa')` isolates vocabulary keys from consumer's own i18n. Dot notation for nested access: `t('entity.initiative')`. ([next-intl translations docs](https://next-intl.dev/docs/usage/translations))
- **Monorepo pattern is proven.** Shared package exports messages + `request.ts`. Consumer app re-exports. Type safety via `AppConfig` module augmentation. Working turborepo example at [sakib412/next-intl-turborepo](https://github.com/sakib412/next-intl-turborepo). ([Discussion #1688](https://github.com/amannn/next-intl/discussions/1688))

### 2. Alternative i18n-as-Vocabulary Approaches

- **Strapi uses i18n translation files for vocabulary customization within a single language.** Override specific keys like `"Users": "Team Members"` in admin config. Closest production precedent for Sherpa's exact need. ([Strapi docs](https://docs.strapi.io/cms/admin-panel-customization))
- **react-admin has the most structured pattern.** Resources have translation keys under `resources.[resourceName].name` with pipe-separated plural: `"Shoe |||| Shoes"`. Components never hardcode entity labels. ([react-admin Translation docs](https://marmelab.com/react-admin/Translation.html))
- **`i18n_multitenant` Ruby gem** uses locale variants for tenant-specific vocabulary: `en-LAW` overrides `en` for keys like `customer` → `client`. Clean fallback chain. ([GitHub: i18n_multitenant](https://github.com/ElMassimo/i18n_multitenant))
- **i18next has explicit namespace fallback** via `fallbackNS`. Resolution: `defaultNS` → `fallbackNS` → key as literal. More structured than next-intl's manual spread. ([i18next namespaces](https://www.i18next.com/principles/namespaces))

### 3. Entity Inventory

**User-facing entities (need vocabulary):**

| Entity | Default | Appears in |
|--------|---------|------------|
| Initiative | Initiative / Initiatives | UI, navigation, headings, toasts, CLI |
| Proposal | Proposal / Proposals | UI, lifecycle labels, CLI |
| Task | Task / Tasks | UI, MCP tool names, CLI |
| Agent | Agent / Agents | UI, dispatch UI, CLI |
| Role | Role / Roles | UI, catalog display |
| Session | Session / Sessions | UI, log display |
| Report | Report / Reports | UI, output references |
| Deliverable | Deliverable / Deliverables | UI, completion tracking |
| Research | Research | UI section label |
| Dashboard | Dashboard | Navigation label |
| Portfolio | Portfolio | Navigation label |
| Convention | Convention / Conventions | UI section label |

**Lifecycle/status vocabulary:**
Pending, Approved, In Progress, Integrated, Declined, Archived, Needs Work

**Internal-only (do NOT need vocabulary):**
`slug`, `frontmatter`, `lifecycle`, `process-node`, file paths

### 4. Path vs. Display Name — The Salesforce Lesson

- **Salesforce:** When you rename "Accounts" to "Clients", the API name stays `Account`. The label changes everywhere in UI. Reports use new label. SOQL/Apex use API name. Renaming API name breaks every integration. ([Salesforce rename docs](https://help.salesforce.com/s/articleView?id=platform.customize_rename.htm&language=en_US&type=5))
- **Jira:** Rename of "Issue" to "Work Item" is display-only. APIs still use `issue`. JQL still uses `issue`. "Technically nothing will change." ([Atlassian community](https://community.atlassian.com/forums/Jira-articles/It-s-here-Work-is-the-new-collective-term-for-all-items-you/ba-p/2954892))
- **Implication:** File paths MUST remain stable. `docs/initiatives/` stays regardless of UI vocabulary. `PathsConfig` is independent of `VocabularyConfig`. CLI: "Found 3 projects in docs/initiatives/" — vocabulary for display, slugs for paths.

### 5. Plural Forms and Context

- **ICU plural syntax** in next-intl:
  ```
  "initiativeCount": "You have {count, plural, =0 {no initiatives} =1 {one initiative} other {# initiatives}}."
  ```
- **For vocabulary config, simpler is better.** Explicit singular/plural pairs in config, compiled to ICU internally. Framework compiles `{ initiative: "Project", initiativePlural: "Projects" }` into ICU messages.
- **Salesforce requires three forms:** singular label, plural label, "starts with vowel sound" flag (for "a" vs "an"). Sherpa should include the article hint.

### 6. Type Safety

- **next-intl `AppConfig` augmentation** provides compile-time key checking:
  ```ts
  declare module 'next-intl' {
    interface AppConfig { Messages: typeof messages }
  }
  ```
- **`createMessagesDeclaration`** auto-generates `.d.json.ts` files for strict typing. Requires `allowArbitraryExtensions: true` in tsconfig.
- **`Record<EntitySlug, VocabularyEntry>`** with union type for `EntitySlug` provides exhaustiveness checking:
  ```ts
  type EntitySlug = 'initiative' | 'proposal' | 'task' | 'agent' | 'role'
  type VocabularyEntry = { singular: string; plural: string; article?: 'a' | 'an' }
  ```
- **Separate typed vocabulary from escape hatch.** Remove `[key: string]` index signature. Add `vocabularyExtensions?: Record<string, VocabularyEntry>` for plugins.

## Sources

### next-intl
- [next-intl configuration](https://next-intl.dev/docs/usage/configuration) — Message loading
- [next-intl translations](https://next-intl.dev/docs/usage/translations) — ICU syntax, pluralization
- [next-intl TypeScript](https://next-intl.dev/docs/workflows/typescript) — AppConfig augmentation
- [next-intl plugin](https://next-intl.dev/docs/usage/plugin) — createNextIntlPlugin
- [Discussion #357](https://github.com/amannn/next-intl/discussions/357) — Multiple message files
- [Discussion #1688](https://github.com/amannn/next-intl/discussions/1688) — Monorepo pattern
- [Discussion #1224](https://github.com/amannn/next-intl/discussions/1224) — Multiple IntlMessages types
- [Discussion #1607](https://github.com/amannn/next-intl/discussions/1607) — Programmatic messages
- [Discussion #1061](https://github.com/amannn/next-intl/discussions/1061) — Fallback translations
- [Discussion #123](https://github.com/amannn/next-intl/discussions/123) — getMessageFallback
- [Issue #1181](https://github.com/amannn/next-intl/issues/1181) — defaultTranslationValues deprecation
- [sakib412/next-intl-turborepo](https://github.com/sakib412/next-intl-turborepo) — Working monorepo example

### Multi-Tenant Vocabulary
- [Strapi admin customization](https://docs.strapi.io/cms/admin-panel-customization) — i18n for vocabulary
- [react-admin Translation](https://marmelab.com/react-admin/Translation.html) — Resource name translation
- [i18n_multitenant gem](https://github.com/ElMassimo/i18n_multitenant) — Tenant locale variants
- [i18n_multitenant blog](https://maximomussini.com/posts/i18n-multitenant) — Pattern explanation
- [i18next namespaces](https://www.i18next.com/principles/namespaces) — Namespace fallback
- [i18next fallback](https://www.i18next.com/principles/fallback) — Resolution chain

### Salesforce / Jira
- [Salesforce rename docs](https://help.salesforce.com/s/articleView?id=platform.customize_rename.htm&language=en_US&type=5) — Label vs API name
- [Salesforce rename considerations](https://help.salesforce.com/s/articleView?id=platform.customize_rename_considerations.htm&language=en_US&type=5) — What changes
- [Atlassian: Work is the new term](https://community.atlassian.com/forums/Jira-articles/It-s-here-Work-is-the-new-collective-term-for-all-items-you/ba-p/2954892) — Display-only rename
- [Jira configuring terminology](https://confluence.atlassian.com/adminjiraserver/configuring-terminology-1063561685.html) — Sprint/epic renaming

### ICU
- [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/) — Official spec
- [Phrase ICU guide](https://phrase.com/blog/posts/guide-to-the-icu-message-format/) — Practical examples

## Raw Links

- https://next-intl.dev/docs/usage/configuration
- https://next-intl.dev/docs/usage/translations
- https://next-intl.dev/docs/workflows/typescript
- https://next-intl.dev/docs/usage/plugin
- https://next-intl.dev/docs/environments/server-client-components
- https://next-intl.dev/blog/next-intl-3-22
- https://github.com/amannn/next-intl/discussions/357
- https://github.com/amannn/next-intl/discussions/1688
- https://github.com/amannn/next-intl/discussions/1224
- https://github.com/amannn/next-intl/discussions/405
- https://github.com/amannn/next-intl/discussions/1061
- https://github.com/amannn/next-intl/discussions/123
- https://github.com/amannn/next-intl/discussions/803
- https://github.com/amannn/next-intl/discussions/148
- https://github.com/amannn/next-intl/discussions/1607
- https://github.com/amannn/next-intl/issues/217
- https://github.com/amannn/next-intl/issues/1181
- https://github.com/amannn/next-intl/issues/611
- https://github.com/amannn/next-intl/issues/580
- https://github.com/amannn/next-intl/issues/1832
- https://github.com/amannn/next-intl/issues/483
- https://github.com/amannn/next-intl/issues/90
- https://github.com/sakib412/next-intl-turborepo
- https://www.i18next.com/principles/namespaces
- https://www.i18next.com/principles/fallback
- https://www.i18next.com/overview/configuration-options
- https://www.i18next.com/overview/typescript
- https://maximomussini.com/posts/i18n-multitenant
- https://github.com/ElMassimo/i18n_multitenant
- https://marmelab.com/react-admin/Translation.html
- https://simplelocalize.io/for-white-label-localization/
- https://help.salesforce.com/s/articleView?id=platform.customize_rename.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=platform.customize_rename_considerations.htm&language=en_US&type=5
- https://cloudmybiz.com/salesforce-standard-object-and-field/
- https://community.atlassian.com/forums/Jira-articles/It-s-here-Work-is-the-new-collective-term-for-all-items-you/ba-p/2954892
- https://confluence.atlassian.com/adminjiraserver/configuring-terminology-1063561685.html
- https://unicode-org.github.io/icu/userguide/format_parse/messages/
- https://phrase.com/blog/posts/guide-to-the-icu-message-format/
- https://docs.strapi.io/cms/admin-panel-customization

## Implications

1. **Existing `VocabularyConfig` design is architecturally sound.** Flat object in config, compiled to next-intl messages at request time. Validated by Strapi and react-admin patterns.
2. **Paths are immutable, vocabulary is cosmetic.** Salesforce lesson confirmed.
3. **Upgrade to structured entries:** `{ singular: string; plural: string; article?: 'a' | 'an' }` per entity.
4. **MCP tool naming is a real concern.** `list_initiatives` vs `list_projects` — vocabulary should influence tool names.
5. **Framework compiles config to ICU internally.** Consumers never see ICU syntax.
6. **`getVocabulary()` standalone function needed** for CLI and MCP contexts (no React context).

## Open Questions

1. Should vocabulary extend to frontmatter field names? (Almost certainly no — frontmatter is schema, not display.)
2. Should `sherpa init project` accept vocabulary aliases? (Path stays `docs/initiatives/`, command accepts the alias.)
3. How does vocabulary interact with behavioral agent definition prose? (Probably not auto-replaced — authored text, not generated.)
4. Compound terms: "Initiative proposal" → "Project recommendation". Explicit compound keys or compose from individual entries?
