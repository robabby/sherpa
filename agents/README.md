# Behavioral Agent Catalog

Base catalog of ~20 behavioral agent definitions. Each agent is a single markdown file with YAML frontmatter following the [Behavioral Agent Schema Specification](../docs/initiatives/behavioral-agents/schema-spec.md).

**Validate:** `bun scripts/validate-agent.ts agents/`

**Categories:** See `taxonomy.yaml` in this directory.

**Extending:** Organizations add domain-specific agents and populate `context-packages`, `rules`, and `skills` fields with their own project files. See `docs/agents/roles/` for an example of organization-specific agent definitions.
