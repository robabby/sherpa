---
status: launched
source-iteration: 1
spawned-from: sherpa-framework-extraction
created: 2026-03-11
priority: medium
sub-initiative: sub-initiatives/sherpa-config-entrypoint
---

# Sherpa Config Entrypoint

## Context

Multiple vectors converged on "config-as-code" as the extension mechanism: Payload CMS uses `payload.config.ts`, shadcn uses `components.json`, Backstage uses `app-config.yaml`. Sherpa needs a `sherpa.config.ts` that unifies vocabulary customization, theming, agent catalog configuration, task directory location, and MCP server options — without becoming a God Object.

## Question

What should `sherpa.config.ts` look like? What's the right balance between configurable and opinionated? How does it compose with Next.js config, Turborepo config, and Claude Code's `.mcp.json`?

## Suggested Vectors

1. **Config-as-code survey** — Deep comparison of Payload config, Backstage app-config, Sanity config, Keystatic config. What's the type-safe pattern? How do plugins hook into config?
2. **Vocabulary system design** — Design the i18n-based vocabulary override. How does next-intl namespace override work in practice? What entities need renaming (initiatives, proposals, tasks, workstreams, roles)?
3. **Theme distribution** — How does a Sherpa theme (CSS variables + font choices + color palette) get packaged and applied? shadcn registry:base as the distribution mechanism.
4. **Config composition** — How does `sherpa.config.ts` interact with `next.config.ts`? Does it wrap it (Payload pattern) or sit alongside it? How does it export values for the MCP server and CLI to consume?

## Links

- [Payload config docs](https://payloadcms.com/docs/getting-started/what-is-payload)
- [shadcn registry:base](https://ui.shadcn.com/docs/registry)
- [next-intl namespace docs](https://next-intl.dev/docs/usage/messages)
- [Backstage app-config](https://backstage.io/docs/conf/)
