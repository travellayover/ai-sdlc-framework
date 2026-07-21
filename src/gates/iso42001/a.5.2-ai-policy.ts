/**
 * ISO 42001 A.5.2 — AI policy.
 * "The policies for AI systems are documented and approved by
 *  leadership."
 *
 * For an AI coding agent pipeline, the AI policy is the document
 * that says: "this is how we use AI to write code." The gate
 * verifies the policy is:
 * 1. Documented (docs/AI-POLICY.md or similar exists)
 * 2. Approved (contains an approval signature with name + date)
 * 3. Current (within 365 days of the most recent approval date)
 *
 * Evidence: file content, approval line, approval date.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { registerGate } from "../index.js";
import type { Control } from "../../types/control.js";
import type { Evidence, GateOutput } from "../../types/report.js";

const CONTROL: Control = {
  id: "ISO 42001 A.5.2",
  title: "AI policy (sample: docs/AI-POLICY.md is documented, approved, and current)",
  pillar: "change-management",
  status: "implemented",
  spec:
    "An AI policy document must exist at docs/AI-POLICY.md (or " +
    "alternate location) and contain an approval line with a named " +
    "approver and a date within the last 365 days.",
  evidenceSource: "docs/AI-POLICY.md content (approval line, date)",
};

const POLICY_PATHS = [
  "docs/AI-POLICY.md",
  "AI-POLICY.md",
  "docs/AI_POLICY.md",
  "AI_POLICY.md",
  ".ai-sdlc/AI-POLICY.md",
];

// Match `Approved by: <name>` or `Signed: <name>` or `## Approval: <name>`
const APPROVAL_LINE = /^(Approved\s+by|Signed|Approved|Approval):?\s+(.+)$/im;
const DATE_RE = /(\d{4})-(\d{2})-(\d{2})/;

const MAX_AGE_DAYS = 365;

interface CheckResult {
  hasPolicy: boolean;
  policyPath: string | null;
  approver: string | null;
  approvalDate: string | null;
  daysSinceApproval: number | null;
  tooOld: boolean;
}

function check(target: string): CheckResult {
  let policyPath: string | null = null;
  for (const p of POLICY_PATHS) {
    if (existsSync(join(target, p))) {
      policyPath = p;
      break;
    }
  }

  if (!policyPath) {
    return {
      hasPolicy: false,
      policyPath: null,
      approver: null,
      approvalDate: null,
      daysSinceApproval: null,
      tooOld: false,
    };
  }

  const content = readFileSync(join(target, policyPath), "utf-8");
  const lines = content.split("\n");
  let approver: string | null = null;
  let approvalDate: string | null = null;
  for (const line of lines) {
    if (!approver) {
      const m = line.match(APPROVAL_LINE);
      if (m) {
        approver = m[2]?.trim() ?? null;
      }
    }
    if (!approvalDate) {
      const m = line.match(DATE_RE);
      if (m) {
        approvalDate = `${m[1]}-${m[2]}-${m[3]}`;
      }
    }
    if (approver && approvalDate) break;
  }

  let daysSinceApproval: number | null = null;
  let tooOld = false;
  if (approvalDate) {
    const d = new Date(approvalDate);
    const now = new Date();
    daysSinceApproval = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    tooOld = daysSinceApproval > MAX_AGE_DAYS || daysSinceApproval < 0;
  }

  return {
    hasPolicy: true,
    policyPath,
    approver,
    approvalDate,
    daysSinceApproval,
    tooOld,
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
      summary: "Could not run the AI policy check",
      evidence: [
        {
          location: "AI policy file",
          content: err instanceof Error ? err.message : String(err),
          kind: "computed",
        },
      ],
      remediation: "Ensure the target is readable. The AI policy file should be in docs/.",
      ranAt,
      ranBy: agent,
    };
  }

  if (!result.hasPolicy) {
    return {
      controlId: CONTROL.id,
      result: "fail",
      summary: "AI policy not found at docs/AI-POLICY.md (or alternate location)",
      evidence,
      remediation:
        "Create docs/AI-POLICY.md with an approval line: " +
        "`Approved by: <name> <date>` or `Signed: <name> <date>`. " +
        "The policy should describe how AI is used in this project.",
      ranAt,
      ranBy: agent,
    };
  }

  evidence.push({
    location: result.policyPath ?? "docs/AI-POLICY.md",
    content: `Approver: ${result.approver ?? "not found"}, Date: ${result.approvalDate ?? "not found"}`,
    kind: "file",
  });

  const reasons: string[] = [];
  if (!result.approver) reasons.push("approval line not found (expected `Approved by: <name>` or `Signed: <name>`)");
  if (!result.approvalDate) reasons.push("approval date not found (expected YYYY-MM-DD format)");
  if (result.tooOld) reasons.push(`policy is ${String(result.daysSinceApproval)} days old (>${String(MAX_AGE_DAYS)} day limit)`);

  if (reasons.length === 0) {
    return {
      controlId: CONTROL.id,
      result: "pass",
      summary: `AI policy in place. Approver: ${result.approver}, dated ${result.approvalDate} (${String(result.daysSinceApproval)} days ago).`,
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
      "Add an approval line `Approved by: <name>` and a date `YYYY-MM-DD` " +
      "to docs/AI-POLICY.md. The date must be within the last 365 days.",
    ranAt,
    ranBy: agent,
  };
}

registerGate(CONTROL, run);
export { CONTROL, run };
