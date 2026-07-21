/**
 * SOC 2 CC6.1 — Logical and physical access controls.
 * Sample gate: verifies that all commits to master are merges from PRs,
 * not direct commits. Per the SOC 2 control: "The entity restricts
 * logical access to information assets..."
 *
 * For an AI coding agent pipeline, "logical access" means: only authorized
 * agents (the merge bot, the human reviewer) can land code on master.
 * Direct-to-master bypasses review.
 *
 * Evidence: `git log origin/master` should only show merge commits, never
 * direct commits. The gate scans the last N commits on master.
 */

import { execFileSync } from "node:child_process";
import { registerGate } from "../index.js";
import type { Control } from "../../types/control.js";
import type { Evidence, GateOutput } from "../../types/report.js";

const CONTROL: Control = {
  id: "SOC 2 CC6.1",
  title: "Logical and physical access controls (sample: no direct-to-master)",
  pillar: "identity-and-access",
  status: "implemented",
  spec:
    "All commits to the protected branch (e.g. master) must be merges from reviewed PRs. " +
    "Direct commits to the protected branch are not permitted.",
  evidenceSource: "git log on the protected branch",
};

const SCAN_LIMIT = 100;

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
        "master",
        "--no-merges",
        `--max-count=${String(SCAN_LIMIT)}`,
        "--format=%H %ae %s",
      ],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (err) {
    return {
      controlId: CONTROL.id,
      result: "fail",
      summary: "Could not read git log on master",
      evidence: [
        {
          location: "git log master",
          content: err instanceof Error ? err.message : String(err),
          kind: "git",
        },
      ],
      remediation: "Ensure the target is a git repository with a master branch.",
      ranAt,
      ranBy: agent,
    };
  }

  const directCommits = stdout.trim().split("\n").filter(Boolean);

  if (directCommits.length === 0) {
    return {
      controlId: CONTROL.id,
      result: "pass",
      summary: `Last ${String(SCAN_LIMIT)} commits on master are all merges. No direct commits detected.`,
      evidence: [
        {
          location: "git log master --no-merges --max-count=100",
          content: "0 direct commits in last 100 commits",
          kind: "git",
        },
      ],
      ranAt,
      ranBy: agent,
    };
  }

  for (const line of directCommits.slice(0, 5)) {
    const [sha, email, ...rest] = line.split(" ");
    evidence.push({
      location: `master ${sha ?? "?"}`,
      content: `${email ?? "?"}: ${rest.join(" ").slice(0, 80)}`,
      kind: "git",
    });
  }

  return {
    controlId: CONTROL.id,
    result: "fail",
    summary: `Found ${String(directCommits.length)} direct commits on master in the last ${String(SCAN_LIMIT)} commits.`,
    evidence,
    remediation:
      "Direct commits to master are not permitted. Use a PR + merge flow. " +
      "If this is an emergency hotfix, document the reason in the commit message and add a follow-up PR.",
    ranAt,
    ranBy: agent,
  };
}

registerGate(CONTROL, run);
export { CONTROL, run };
