import { describe, it, expect } from "vitest";
import { behavioralAgentFrontmatterSchema } from "../schemas";
import { AGENT_ROLE_CATEGORIES } from "../types";

describe("behavioralAgentFrontmatterSchema", () => {
  it("validates a minimal agent (name, display-name, category, disposition)", () => {
    const result = behavioralAgentFrontmatterSchema.safeParse({
      name: "code-reviewer",
      "display-name": "Code Reviewer",
      category: "engineering",
      disposition: "defaults to NEEDS WORK, requires evidence for approval",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("code-reviewer");
      expect(result.data["display-name"]).toBe("Code Reviewer");
      expect(result.data.category).toBe("engineering");
      expect(result.data.disposition).toBe(
        "defaults to NEEDS WORK, requires evidence for approval"
      );
    }
  });

  it("validates a full agent with all behavioral fields", () => {
    const result = behavioralAgentFrontmatterSchema.safeParse({
      name: "security-auditor",
      "display-name": "Security Auditor",
      category: "security",
      disposition: "assumes all inputs are hostile until proven safe",
      "domain-scope": ["authentication", "authorization", "cryptography"],
      "behavioral-constraints": [
        "never approve code with known CVE patterns",
        "flag any use of eval() or dynamic code execution",
      ],
      "quality-bar": [
        "all auth flows require integration tests",
        "no secrets in source code",
      ],
      "fail-triggers": [
        "claim of 'no security issues' without evidence",
        "approval of code with SQL injection vectors",
      ],
      "output-style": "structured vulnerability report with severity ratings",
      "model-tier": "high",
      "tool-permissions": ["Read", "Grep", "Glob", "Bash"],
      escalation: ["human review for critical vulnerabilities"],
      "context-packages": ["owasp-top-10", "cve-database"],
      rules: ["security-review.md"],
      skills: ["/security-scan"],
      patterns: ["tool-use", "reflection"],
      structure: "producer-critic",
      vibe: "paranoid but thorough",
      tags: ["security", "audit", "compliance"],
      emoji: "🔒",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("security-auditor");
      expect(result.data["domain-scope"]).toEqual([
        "authentication",
        "authorization",
        "cryptography",
      ]);
      expect(result.data["behavioral-constraints"]).toHaveLength(2);
      expect(result.data["quality-bar"]).toHaveLength(2);
      expect(result.data["fail-triggers"]).toHaveLength(2);
      expect(result.data["output-style"]).toBe(
        "structured vulnerability report with severity ratings"
      );
      expect(result.data["model-tier"]).toBe("high");
      expect(result.data.patterns).toEqual(["tool-use", "reflection"]);
      expect(result.data.structure).toBe("producer-critic");
      expect(result.data.vibe).toBe("paranoid but thorough");
      expect(result.data.tags).toEqual(["security", "audit", "compliance"]);
      expect(result.data.emoji).toBe("🔒");
    }
  });

  it("rejects when required name field is missing (no name or role)", () => {
    const result = behavioralAgentFrontmatterSchema.safeParse({
      "display-name": "Unnamed Agent",
      category: "engineering",
      disposition: "neutral",
    });
    expect(result.success).toBe(false);
  });

  it("accepts legacy role: field and maps it to name", () => {
    const result = behavioralAgentFrontmatterSchema.safeParse({
      role: "legacy-reviewer",
      "display-name": "Legacy Reviewer",
      category: "engineering",
      disposition: "thorough review of all changes",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("legacy-reviewer");
    }
  });

  it("prefers name over role when both are provided", () => {
    const result = behavioralAgentFrontmatterSchema.safeParse({
      name: "preferred-name",
      role: "legacy-name",
      "display-name": "Test Agent",
      category: "engineering",
      disposition: "neutral",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("preferred-name");
    }
  });

  describe("taxonomy categories", () => {
    const NEW_CATEGORIES = [
      "engineering",
      "product",
      "design",
      "research",
      "quality",
      "operations",
      "marketing",
      "security",
      "data",
      "governance",
    ] as const;

    for (const category of NEW_CATEGORIES) {
      it(`accepts new category: ${category}`, () => {
        const result = behavioralAgentFrontmatterSchema.safeParse({
          name: `test-${category}`,
          "display-name": `Test ${category}`,
          category,
          disposition: "neutral",
        });
        expect(result.success).toBe(true);
      });
    }

    const LEGACY_CATEGORIES = ["strategy", "domain"] as const;

    for (const category of LEGACY_CATEGORIES) {
      it(`accepts legacy category: ${category}`, () => {
        const result = behavioralAgentFrontmatterSchema.safeParse({
          name: `test-${category}`,
          "display-name": `Test ${category}`,
          category,
          disposition: "neutral",
        });
        expect(result.success).toBe(true);
      });
    }

    it("rejects invalid category", () => {
      const result = behavioralAgentFrontmatterSchema.safeParse({
        name: "test-invalid",
        "display-name": "Test Invalid",
        category: "invalid-category",
        disposition: "neutral",
      });
      expect(result.success).toBe(false);
    });
  });

  it("provides sensible defaults for optional fields", () => {
    const result = behavioralAgentFrontmatterSchema.safeParse({
      name: "minimal-agent",
      "display-name": "Minimal Agent",
      category: "engineering",
      disposition: "neutral",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["domain-scope"]).toEqual([]);
      expect(result.data["behavioral-constraints"]).toEqual([]);
      expect(result.data["quality-bar"]).toEqual([]);
      expect(result.data["fail-triggers"]).toEqual([]);
      expect(result.data["model-tier"]).toBe("medium");
      expect(result.data["tool-permissions"]).toEqual([]);
      expect(result.data.escalation).toEqual([]);
      expect(result.data["context-packages"]).toEqual([]);
      expect(result.data.rules).toEqual([]);
      expect(result.data.skills).toEqual([]);
      expect(result.data.patterns).toEqual([]);
      expect(result.data.structure).toBeNull();
      expect(result.data.tags).toEqual([]);
    }
  });

  it("AGENT_ROLE_CATEGORIES contains all 12 entries (10 new + 2 legacy)", () => {
    expect(AGENT_ROLE_CATEGORIES).toHaveLength(12);
    expect(AGENT_ROLE_CATEGORIES).toContain("engineering");
    expect(AGENT_ROLE_CATEGORIES).toContain("product");
    expect(AGENT_ROLE_CATEGORIES).toContain("design");
    expect(AGENT_ROLE_CATEGORIES).toContain("research");
    expect(AGENT_ROLE_CATEGORIES).toContain("quality");
    expect(AGENT_ROLE_CATEGORIES).toContain("operations");
    expect(AGENT_ROLE_CATEGORIES).toContain("marketing");
    expect(AGENT_ROLE_CATEGORIES).toContain("security");
    expect(AGENT_ROLE_CATEGORIES).toContain("data");
    expect(AGENT_ROLE_CATEGORIES).toContain("governance");
    // Legacy
    expect(AGENT_ROLE_CATEGORIES).toContain("strategy");
    expect(AGENT_ROLE_CATEGORIES).toContain("domain");
  });
});
