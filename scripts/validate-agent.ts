#!/usr/bin/env bun
/**
 * validate-agent.ts — Behavioral agent markdown validator
 *
 * Parses agent markdown files with gray-matter, validates frontmatter against
 * the behavioralAgentFrontmatterSchema, and runs content-level checks for
 * identity language, missing behavioral fields, and structural issues.
 *
 * Usage:
 *   bun scripts/validate-agent.ts <path> [--json] [--strict] [--verbose]
 *
 * <path> can be a file or directory (validates all .md files in directory).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import matter from "gray-matter";
import { behavioralAgentFrontmatterSchema } from "../packages/studio-core/src/schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Severity = "error" | "warning" | "info";

interface Diagnostic {
  file: string;
  severity: Severity;
  rule: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Identity language patterns
// ---------------------------------------------------------------------------

const IDENTITY_ERROR_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\byou are\b/i, label: '"you are"' },
  { re: /\byou're\b/i, label: '"you\'re"' },
  { re: /\bi am\b/i, label: '"I am"' },
  { re: /\bi'm\b/i, label: '"I\'m"' },
  { re: /\bpersonality:/i, label: '"personality:"' },
  { re: /\byears of experience\b/i, label: '"years of experience"' },
];

const IDENTITY_WARNING_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\bexpert\b/i, label: '"expert"' },
  { re: /\bsenior\b/i, label: '"senior"' },
  { re: /\bjunior\b/i, label: '"junior"' },
  { re: /\bexperienced\b/i, label: '"experienced"' },
  { re: /\bpassionate\b/i, label: '"passionate"' },
  { re: /\btalented\b/i, label: '"talented"' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectFiles(inputPath: string): string[] {
  const abs = resolve(inputPath);
  const stat = statSync(abs, { throwIfNoEntry: false });
  if (!stat) {
    console.error(`Path not found: ${abs}`);
    process.exit(2);
  }
  if (stat.isFile()) {
    if (!abs.endsWith(".md")) {
      console.error(`Not a markdown file: ${abs}`);
      process.exit(2);
    }
    return [abs];
  }
  if (stat.isDirectory()) {
    return readdirSync(abs)
      .filter((f) => f.endsWith(".md") && f !== "README.md")
      .map((f) => join(abs, f))
      .sort();
  }
  return [];
}

function isQualityGateAgent(
  fm: Record<string, unknown>,
  name: string,
): boolean {
  if (fm.category === "quality") return true;
  const lowerName = name.toLowerCase();
  return (
    lowerName.includes("judge") ||
    lowerName.includes("reviewer") ||
    lowerName.includes("auditor")
  );
}

function filenameSlug(filePath: string): string {
  return basename(filePath, ".md");
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateFile(filePath: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const relPath = basename(filePath);
  const raw = readFileSync(filePath, "utf-8");

  function add(severity: Severity, rule: string, message: string) {
    diagnostics.push({ file: relPath, severity, rule, message });
  }

  // Parse frontmatter
  let fm: Record<string, unknown>;
  let body: string;
  try {
    const parsed = matter(raw);
    fm = parsed.data as Record<string, unknown>;
    body = parsed.content.trim();
  } catch {
    add("error", "parse", "Failed to parse YAML frontmatter");
    return diagnostics;
  }

  // --- Zod schema validation ---
  const result = behavioralAgentFrontmatterSchema.safeParse(fm);
  if (!result.success) {
    for (const issue of result.error.issues) {
      add(
        "error",
        "schema",
        `${issue.path.join(".")}: ${issue.message}`,
      );
    }
  }

  // Resolve the agent name (name or role)
  const agentName =
    typeof fm.name === "string"
      ? fm.name
      : typeof fm.role === "string"
        ? fm.role
        : "";

  // --- Name doesn't match filename ---
  const slug = filenameSlug(filePath);
  if (agentName && agentName !== slug) {
    add(
      "error",
      "name-filename-mismatch",
      `name "${agentName}" does not match filename "${slug}.md"`,
    );
  }

  // --- Legacy role: field without name: ---
  if (fm.role !== undefined && fm.name === undefined) {
    add(
      "warning",
      "legacy-role-field",
      `Uses legacy "role:" field — migrate to "name:" for behavioral agent format`,
    );
  }

  // --- Empty body ---
  if (!body || body.length === 0) {
    add("error", "empty-body", "No body content — agent needs a description");
    return diagnostics; // Nothing else to check in body
  }

  // --- Disposition checks ---
  const disposition =
    typeof fm.disposition === "string" ? fm.disposition : "";

  if (disposition) {
    // Identity language ERRORS in disposition
    for (const { re, label } of IDENTITY_ERROR_PATTERNS) {
      if (re.test(disposition)) {
        add(
          "error",
          "identity-language-disposition",
          `Identity language ${label} in disposition — use behavioral constraints instead`,
        );
      }
    }
    // Identity language WARNINGS in disposition
    for (const { re, label } of IDENTITY_WARNING_PATTERNS) {
      if (re.test(disposition)) {
        add(
          "warning",
          "identity-language-disposition",
          `Potential identity language ${label} in disposition — consider rephrasing as behavior`,
        );
      }
    }
    // Disposition length
    if (disposition.length > 120) {
      add(
        "warning",
        "disposition-length",
        `Disposition is ${disposition.length} chars (> 120) — keep it concise`,
      );
    }
  }

  // --- Missing behavioral-constraints ---
  const hasFmConstraints =
    Array.isArray(fm["behavioral-constraints"]) &&
    (fm["behavioral-constraints"] as unknown[]).length > 0;
  const hasBodyConstraints = /^##\s+behavioral\s+constraints/im.test(body);
  if (!hasFmConstraints && !hasBodyConstraints) {
    add(
      "warning",
      "missing-behavioral-constraints",
      "No behavioral-constraints in frontmatter or body — behavioral agents should define constraints",
    );
  }

  // --- Missing quality-bar ---
  const hasQualityBar =
    Array.isArray(fm["quality-bar"]) &&
    (fm["quality-bar"] as unknown[]).length > 0;
  if (!hasQualityBar) {
    add(
      "warning",
      "missing-quality-bar",
      "No quality-bar defined — consider adding measurable quality criteria",
    );
  }

  // --- Missing fail-triggers on quality-gate agents ---
  if (isQualityGateAgent(fm, agentName)) {
    const hasFailTriggers =
      Array.isArray(fm["fail-triggers"]) &&
      (fm["fail-triggers"] as unknown[]).length > 0;
    const hasBodyFailTriggers = /^##\s+fail\s+triggers/im.test(body);
    if (!hasFailTriggers && !hasBodyFailTriggers) {
      add(
        "warning",
        "missing-fail-triggers",
        "Quality-gate agent (category=quality or name contains judge/reviewer/auditor) should define fail-triggers",
      );
    }
  }

  // --- Identity language in body ---
  for (const { re, label } of IDENTITY_ERROR_PATTERNS) {
    if (re.test(body)) {
      add(
        "warning",
        "identity-language-body",
        `Identity language ${label} found in body — consider rephrasing as behavioral constraint`,
      );
    }
  }
  for (const { re, label } of IDENTITY_WARNING_PATTERNS) {
    if (re.test(body)) {
      add(
        "warning",
        "identity-language-body",
        `Potential identity language ${label} in body — consider rephrasing`,
      );
    }
  }

  // --- Missing tags ---
  const hasTags =
    Array.isArray(fm.tags) && (fm.tags as unknown[]).length > 0;
  if (!hasTags) {
    add("info", "missing-tags", "No tags defined — tags help with discovery");
  }

  return diagnostics;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const positional = args.filter((a) => !a.startsWith("--"));

  const jsonOutput = flags.has("--json");
  const strict = flags.has("--strict");
  const verbose = flags.has("--verbose");

  if (positional.length === 0) {
    console.error(
      "Usage: bun scripts/validate-agent.ts <path> [--json] [--strict] [--verbose]",
    );
    process.exit(2);
  }

  const files = collectFiles(positional[0]);
  if (files.length === 0) {
    console.error("No .md files found");
    process.exit(2);
  }

  const allDiagnostics: Diagnostic[] = [];
  for (const file of files) {
    allDiagnostics.push(...validateFile(file));
  }

  // Count by severity
  let errors = 0;
  let warnings = 0;
  let infos = 0;
  for (const d of allDiagnostics) {
    if (d.severity === "error") errors++;
    else if (d.severity === "warning") warnings++;
    else infos++;
  }

  // Output
  if (jsonOutput) {
    const filtered = verbose
      ? allDiagnostics
      : allDiagnostics.filter((d) => d.severity !== "info");
    console.log(JSON.stringify(filtered, null, 2));
  } else {
    const ICONS: Record<Severity, string> = {
      error: "\u2717",    // ✗
      warning: "\u26A0",  // ⚠
      info: "\u2139",     // ℹ
    };

    for (const d of allDiagnostics) {
      if (d.severity === "info" && !verbose) continue;
      console.log(
        `${ICONS[d.severity]} ${d.file}: [${d.rule}] ${d.message}`,
      );
    }

    console.log("");
    console.log(`${errors} errors, ${warnings} warnings, ${infos} info`);
  }

  // Exit code
  if (strict) {
    process.exit(errors + warnings > 0 ? 1 : 0);
  } else {
    process.exit(errors > 0 ? 1 : 0);
  }
}

main();
