# Behavioral Lint Tool Research

Research supporting the behavioral-lint-tool sub-initiative — packaging and distribution strategy for the first agent definition linter that enforces behavioral engineering.

## Iterations

| # | Date | Vectors | Key Finding |
|---|------|---------|-------------|
| 1 | 2026-03-11 | CLI packaging, multi-format linting, GitHub Action marketplace, Joblint deep dive | Implementation-ready spec: single npm package, 7-format adapter system, 10 rule categories, zero marketplace competition. |

## Open Questions

1. **How should "You are" be handled contextually?** + trait/role = ERROR vs + tool/assistant + scope = OK. Needs curated exception list or NLP beyond regex.
2. **Should behavioral-lint also publish as a Vale style package?** Complementary distribution, but Vale can't validate YAML schemas.
3. **What scoring model?** 4-dimension counters vs single 0-100 score vs multi-dimensional grade.
4. **Should the linter suggest behavioral rewrites?** Template-based for common patterns? LLM-assisted for custom?
5. **Token list governance.** Externalize for community contribution or inline for simplicity?

## Cross-References

- Parent initiative: `docs/initiatives/behavioral-agents/` (schema spec, catalog migration)
- Seed file: `docs/initiatives/behavioral-agents/branches/behavioral-lint-tool.md`
- Behavioral engineering rule: `.claude/rules/behavioral-engineering.md`
- Parent validation tooling research: `docs/initiatives/behavioral-agents/research/iteration-1/vector-3-validation-tooling.md`
- Competing agent formats: `docs/initiatives/behavioral-agents/research/iteration-1/vector-1-competing-agent-formats.md`
