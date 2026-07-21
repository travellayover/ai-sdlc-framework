/**
 * HIPAA §164.312(a)(2)(i) — Unique user identification.
 * "Implement procedures to assign a unique name and/or number for
 *  identifying and tracking user identity."
 *
 * For an AI coding agent pipeline, every commit must be attributed
 * to a named agent. No "admin@" / "system@" / "root@" / empty.
 *
 * Evidence: `git log --format=%ae` on the working tree.
 */

import { execFileSync } from "node:child_process";
import { registerGate } from "../index.js";
import type { Control } from "../../types/control.js";
import type { Evidence, GateOutput } from "../../types/report.js";

const CONTROL: Control = {
  id: "HIPAA §164.312(a)(2)(i)",
  title: "Unique user identification (sample: every commit has a real agent identity)",
  pillar: "code-integrity",
  status: "implemented",
  spec:
    "Every commit in the repository must be attributed to a unique, named agent. " +
    "Generic or shared identities (admin, system, root, team) are not permitted.",
  evidenceSource: "git log on the repository",
};

const FORBIDDEN_EMAILS = [
  "admin@",
  "system@",
  "root@",
  "team@",
  "noreply@",
];

const FORBIDDEN_NAMES = [
  "admin",
  "system",
  "root",
  "team",
];

const SCAN_LIMIT = 200;

async function run(target: string, agent: string): Promise<GateOutput> {
  const evidence: Evidence[] = [];
  const ranAt = new Date().toISOString();

  let stdout: string;
  try {
    stdout = execFileSync(
      "git",
      [
        "-C", target,
        "log",
        "HEAD",
        `--max-count=${String(SCAN_LIMIT)}`,
        "--format=%H|%an|%ae",
      ],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (err) {
    return {
      controlId: CONTROL.id,
      result: "fail",
      summary: "Could not read git log",
      evidence: [
        {
          location: "git log HEAD",
          content: err instanceof Error ? err.message : String(err),
          kind: "git",
        },
      ],
      remediation: "Ensure the target is a git repository.",
      ranAt,
      ranBy: agent,
    };
  }

  const commits = stdout.trim().split("\n").filter(Boolean);
  const violations: string[] = [];

  for (const line of commits) {
    const [sha, name, email] = line.split("|");
    const nameLow = (name ?? "").toLowerCase();
    const emailLow = (email ?? "").toLowerCase();

    const isForbiddenEmail = FORBIDDEN_EMAILS.some((p) => emailLow.startsWith(p));
    const isForbiddenName = FORBIDDEN_NAMES.includes(nameLow);
    const isEmpty = !name || !email;

    if (isForbiddenEmail || isForbiddenName || isEmpty) {
      violations.push(`${sha ?? "?"} ${name ?? "?"} <${email ?? "?"}>`);
    }
  }

  if (violations.length === 0) {
    return {
      controlId: CONTROL.id,
      result: "pass",
      summary: `All ${String(commits.length)} scanned commits have unique, named agent identities.`,
      evidence: [
        {
          location: "git log HEAD --max-count=200",
          content: `${String(commits.length)} commits, 0 violations`,
          kind: "git",
        },
      ],
      ranAt,
      ranBy: agent,
    };
  }

  for (const v of violations.slice(0, 5)) {
    evidence.push({ location: "git log", content: v, kind: "git" });
  }

  return {
    controlId: CONTROL.id,
    result: "fail",
    summary: `Found ${String(violations.length)} commits with forbidden agent identities in the last ${String(SCAN_LIMIT)} commits.`,
    evidence,
    remediation:
      "Configure a per-agent identity before committing: " +
      "`git -c user.name='agent-name' -c user.email='agent@org.com' commit ...`. " +
      "Avoid admin / system / root / team identities.",
    ranAt,
    ranBy: agent,
  };
}

registerGate(CONTROL, run);
export { CONTROL, run };
