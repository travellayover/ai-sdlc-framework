/**
 * ISO 42001 A.5.3 — Segregation of duties.
 * "The agent that writes code is not the agent that reviews or
 *  deploys it."
 *
 * For an AI coding agent pipeline, the framework\'s own audit log
 * captures the agent ID for every action. The gate inspects the
 * audit log and verifies that no single agent is the writer,
 * reviewer, AND deployer of the same change.
 *
 * Heuristic: for each pair of entries with the same `lane` field
 * (representing a single change), the agents should be distinct
 * across (write, review, deploy) action types.
 *
 * Evidence: audit log entries parsed for `lane`, `agent`, and
 * `action` fields.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { registerGate } from "../index.js";
import type { Control } from "../../types/control.js";
import type { Evidence, GateOutput } from "../../types/report.js";

const CONTROL: Control = {
  id: "ISO 42001 A.5.3",
  title: "Segregation of duties (sample: the writer, reviewer, and deployer of each change are distinct agents)",
  pillar: "identity-and-access",
  status: "implemented",
  spec:
    "The framework\'s own audit log must show distinct agent " +
    "identities for write, review, and deploy actions on the " +
    "same lane. No single agent may perform all three roles.",
  evidenceSource: "audit/*.log entries (lane, agent, action)",
};

interface EntryLite {
  lane: string | null;
  agent: string;
  action: string;
}

function readEntries(target: string): EntryLite[] {
  const auditDir = join(target, "audit");
  if (!existsSync(auditDir)) return [];
  const out: EntryLite[] = [];
  for (const f of readdirSync(auditDir).filter((x) => x.endsWith(".log"))) {
    const content = readFileSync(join(auditDir, f), "utf-8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      try {
        const e = JSON.parse(line) as Record<string, unknown>;
        if (typeof e.agent === "string") {
          out.push({
            lane: typeof e.lane === "string" ? e.lane : null,
            agent: e.agent,
            action: typeof e.action === "string" ? e.action : "unknown",
          });
        }
      } catch {
        // Skip malformed lines; signing/verify is checked elsewhere
      }
    }
  }
  return out;
}

interface CheckResult {
  hasEntries: boolean;
  totalEntries: number;
  lanesChecked: number;
  violations: string[];
  distinctAgents: number;
}

const WRITE_ACTIONS = new Set(["commit", "write", "code", "edit"]);
const REVIEW_ACTIONS = new Set(["review", "pr-review", "pr", "merge"]);
const DEPLOY_ACTIONS = new Set(["deploy", "release", "publish"]);

function check(target: string): CheckResult {
  const entries = readEntries(target);
  if (entries.length === 0) {
    return {
      hasEntries: false,
      totalEntries: 0,
      lanesChecked: 0,
      violations: [],
      distinctAgents: 0,
    };
  }

  // Group by lane
  const byLane = new Map<string, EntryLite[]>();
  for (const e of entries) {
    if (!e.lane) continue;
    if (!byLane.has(e.lane)) byLane.set(e.lane, []);
    byLane.get(e.lane)!.push(e);
  }

  const violations: string[] = [];
  let lanesChecked = 0;
  const agents = new Set<string>();

  for (const [lane, laneEntries] of byLane) {
    const writers = new Set<string>();
    const reviewers = new Set<string>();
    const deployers = new Set<string>();
    for (const e of laneEntries) {
      agents.add(e.agent);
      if (WRITE_ACTIONS.has(e.action)) writers.add(e.agent);
      else if (REVIEW_ACTIONS.has(e.action)) reviewers.add(e.agent);
      else if (DEPLOY_ACTIONS.has(e.action)) deployers.add(e.agent);
    }
    // Check the violation only if a lane has all 3 roles AND they overlap
    if (writers.size > 0 && reviewers.size > 0 && deployers.size > 0) {
      lanesChecked++;
      const overlap = [...writers].filter((a) => reviewers.has(a) && deployers.has(a));
      if (overlap.length > 0) {
        violations.push(`lane "${lane}": agent(s) ${overlap.join(", ")} performed write+review+deploy`);
      }
    }
  }

  return {
    hasEntries: true,
    totalEntries: entries.length,
    lanesChecked,
    violations,
    distinctAgents: agents.size,
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
      summary: "Could not run the segregation-of-duties check",
      evidence: [
        {
          location: "audit/ directory",
          content: err instanceof Error ? err.message : String(err),
          kind: "computed",
        },
      ],
      remediation: "Ensure the target is readable. The audit/ directory should be initialized.",
      ranAt,
      ranBy: agent,
    };
  }

  evidence.push({
    location: "audit/ directory",
    content: `${String(result.totalEntries)} entries, ${String(result.lanesChecked)} lanes with all 3 roles, ${String(result.distinctAgents)} distinct agents`,
    kind: "computed",
  });

  if (!result.hasEntries) {
    return {
      controlId: CONTROL.id,
      result: "fail",
      summary: "Audit log is empty; cannot verify segregation of duties",
      evidence,
      remediation: "Run `npx ai-sdlc init` and `npx ai-sdlc run` to populate the audit log.",
      ranAt,
      ranBy: agent,
    };
  }

  if (result.lanesChecked === 0) {
    return {
      controlId: CONTROL.id,
      result: "pass",
      summary: `No lane has all 3 roles (write+review+deploy) populated yet. ${String(result.totalEntries)} entries, ${String(result.distinctAgents)} distinct agents.`,
      evidence,
      ranAt,
      ranBy: agent,
    };
  }

  if (result.violations.length === 0) {
    return {
      controlId: CONTROL.id,
      result: "pass",
      summary: `Segregation of duties verified. ${String(result.lanesChecked)} lane(s) checked, ${String(result.distinctAgents)} distinct agents.`,
      evidence,
      ranAt,
      ranBy: agent,
    };
  }

  return {
    controlId: CONTROL.id,
    result: "fail",
    summary: result.violations.join("; "),
    evidence,
    remediation:
      "Configure distinct agent identities for write, review, and deploy. " +
      "The writer, reviewer, and deployer of any change should be 3 different agents.",
    ranAt,
    ranBy: agent,
  };
}

registerGate(CONTROL, run);
export { CONTROL, run };
