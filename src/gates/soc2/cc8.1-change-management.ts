/**
 * SOC 2 CC8.1 — Change management.
 * "Authorize, design, develop or acquire, configure, document, test,
 *  approve, and implement changes to infrastructure, data, software,
 *  and procedures."
 *
 * For an AI coding agent pipeline, the change-management process is
 * enforced by:
 * 1. A PR template with required risk/rollback/reviewer sections
 * 2. A CODEOWNERS file that names the gate-lane reviewer
 * 3. (CC6.1 separately enforces no direct-to-master commits)
 *
 * This gate verifies the artifacts exist and contain the required
 * sections. It does NOT verify the process is actually followed —
 * that\'s enforced by the CI workflow that runs the framework on
 * every PR.
 *
 * Evidence: `.github/PULL_REQUEST_TEMPLATE.md` and
 * `.github/CODEOWNERS` content.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { registerGate } from "../index.js";
import type { Control } from "../../types/control.js";
import type { Evidence, GateOutput } from "../../types/report.js";

const CONTROL: Control = {
  id: "SOC 2 CC8.1",
  title: "Change management (sample: PR template + CODEOWNERS enforce the change-management process)",
  pillar: "change-management",
  status: "implemented",
  spec:
    "The repository must have a PR template that includes Risk, " +
    "Rollback, and Reviewer sections, and a CODEOWNERS file that " +
    "names the gate-lane reviewer. These artifacts are evidence of " +
    "a documented change-management process.",
  evidenceSource: ".github/PULL_REQUEST_TEMPLATE.md and .github/CODEOWNERS",
};

const PR_TEMPLATE_PATHS = [
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/pull_request_template.md",
  "docs/PULL_REQUEST_TEMPLATE.md",
];

const CODEOWNERS_PATHS = [
  ".github/CODEOWNERS",
  "CODEOWNERS",
  "docs/CODEOWNERS",
];

const REQUIRED_SECTIONS = ["Risk", "Rollback", "Reviewer"];

interface CheckResult {
  hasTemplate: boolean;
  hasCodeowners: boolean;
  templatePath: string | null;
  codeownersPath: string | null;
  templateSections: string[];
  codeownersEntries: number;
  missingSections: string[];
}

function check(target: string): CheckResult {
  let templatePath: string | null = null;
  for (const p of PR_TEMPLATE_PATHS) {
    if (existsSync(join(target, p))) {
      templatePath = p;
      break;
    }
  }

  let codeownersPath: string | null = null;
  for (const p of CODEOWNERS_PATHS) {
    if (existsSync(join(target, p))) {
      codeownersPath = p;
      break;
    }
  }

  const templateSections: string[] = [];
  const missingSections: string[] = [];
  if (templatePath) {
    const content = readFileSync(join(target, templatePath), "utf-8");
    for (const section of REQUIRED_SECTIONS) {
      // Match `## Section` or `## Section:` (case-insensitive)
      const re = new RegExp(`^##\\s+${section}\\b`, "im");
      if (re.test(content)) {
        templateSections.push(section);
      } else {
        missingSections.push(section);
      }
    }
  }

  let codeownersEntries = 0;
  if (codeownersPath) {
    const content = readFileSync(join(target, codeownersPath), "utf-8");
    codeownersEntries = content
      .split("\n")
      .filter((line: string) => line.trim() && !line.trim().startsWith("#")).length;
  }

  return {
    hasTemplate: templatePath !== null,
    hasCodeowners: codeownersPath !== null,
    templatePath,
    codeownersPath,
    templateSections,
    codeownersEntries,
    missingSections,
  };
}

async function run(target: string, agent: string): Promise<GateOutput> {
  const evidence: Evidence[] = [];
  const ranAt = new Date().toISOString();

  let result: CheckResult;
  try {
    result = check(target);
  } catch (err) {
    return {
      controlId: CONTROL.id,
      result: "fail",
      summary: "Could not run the change-management check",
      evidence: [
        {
          location: ".github/ directory",
          content: err instanceof Error ? err.message : String(err),
          kind: "computed",
        },
      ],
      remediation:
        "Ensure the target is readable. The .github/ directory should be initialized.",
      ranAt,
      ranBy: agent,
    };
  }

  // Build evidence
  if (result.templatePath) {
    evidence.push({
      location: result.templatePath,
      content: `Sections present: ${result.templateSections.join(", ") || "none"}`,
      kind: "file",
    });
  }
  if (result.codeownersPath) {
    evidence.push({
      location: result.codeownersPath,
      content: `${String(result.codeownersEntries)} entries`,
      kind: "file",
    });
  }

  // Determine pass/fail
  const reasons: string[] = [];
  if (!result.hasTemplate) reasons.push("PR template not found at .github/PULL_REQUEST_TEMPLATE.md");
  if (!result.hasCodeowners) reasons.push("CODEOWNERS not found at .github/CODEOWNERS");
  if (result.missingSections.length > 0) {
    reasons.push(`PR template missing sections: ${result.missingSections.join(", ")}`);
  }
  if (result.hasCodeowners && result.codeownersEntries === 0) {
    reasons.push("CODEOWNERS file is empty (only comments)");
  }

  if (reasons.length === 0) {
    return {
      controlId: CONTROL.id,
      result: "pass",
      summary: `Change-management artifacts in place. PR template at ${result.templatePath}, CODEOWNERS at ${result.codeownersPath} (${String(result.codeownersEntries)} entries).`,
      evidence,
      ranAt,
      ranBy: agent,
    };
  }

  return {
    controlId: CONTROL.id,
    result: "fail",
    summary: reasons.join("; "),
    evidence,
    remediation:
      "Create .github/PULL_REQUEST_TEMPLATE.md with sections: ## Risk, ## Rollback, ## Reviewer. " +
      "Create .github/CODEOWNERS with at least one path/reviewer mapping.",
    ranAt,
    ranBy: agent,
  };
}

registerGate(CONTROL, run);
export { CONTROL, run };
