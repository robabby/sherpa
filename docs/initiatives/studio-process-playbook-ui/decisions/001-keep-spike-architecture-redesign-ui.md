---
decision: "Keep spike's data architecture (playbooks.ts, artifact detection, prompt builders), redesign UI through /shape → /design pipeline"
date: 2026-03-13
skill: /stake
alternatives-rejected:
  - "Persistent playbook state in frontmatter — adds migration burden, solves a perf problem we don't have yet"
  - "Interactive skill orchestration — depends on MCP infrastructure that doesn't exist"
confidence: high
kill-criteria: "If /design prototype isn't meaningfully better than spike output, question whether standalone page adds value"
---
