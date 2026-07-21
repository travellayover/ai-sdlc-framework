/**
 * ISO 42001 A.6.1.2 — AI system lifecycle.
 * "Define and document the AI system lifecycle stages..."
 *
 * For an AI coding agent pipeline, the lifecycle is:
 *   design -> develop -> test -> deploy -> monitor -> retire
 *
 * Evidence: the project must have a documented lifecycle (e.g. PHASES.md,
 * ROADMAP.md, or lifecycle section in AGENTS.md / GOVERNANCE.md).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { registerGate } from "../index.js";
import type { Control } from "../../types/control.js";
import type { Evidence, GateOutput } from "../../types/report.js";

const CONTROL: Control = {
  id: "ISO 42001 A.6.1.2",
  title: "AI system lifecycle documentation (sample: a documented lifecycle exists)",
  pillar: "change-management",
  status: "implemented",
  spec:
    "The project must have a documented AI system lifecycle that covers at least: " +
    "design, development, testing, deployment, monitoring. " +
    "A common pattern is a PHASES.md or ROADMAP.md with F0-F8 (or similar) numbered stages.",
  evidenceSource: "presence of a lifecycle doc in the project root",
};

const LIFECYCLE_DOCS = [
  "docs/0.1-ROADMAP.md",
  "docs/ROADMAP.md",
  "PHASES.md",
  "LIFECYCLE.md",
  "docs/PHASES.md",
  "docs/LIFECYCLE.md",
  "docs/SDLC.md",
];

const LIFECYCLE_KEYWORDS = [
  "design",
  "develop",
  "test",
  "deploy",
  "monitor",
  "F0", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8",
  "phase 0", "phase 1", "phase 2", "phase 3", "phase 4", "phase 5",
  "stage a", "stage b", "stage c",
];

async function run(target: string, agent: string): Promise<GateOutput> {
  const evidence: Evidence[] = [];
  const ranAt = new Date().toISOString();

  for (const rel of LIFECYCLE_DOCS) {
    const abs = join(target, rel);
    if (existsSync(abs)) {
      const content = readFileSync(abs, "utf-8").toLowerCase();
      const matched = LIFECYCLE_KEYWORDS.filter((kw) => content.includes(kw.toLowerCase()));
      if (matched.length >= 3) {
        return {
          controlId: CONTROL.id,
          result: "pass",
          summary: `Lifecycle documented in ${rel} (matched ${String(matched.length)} lifecycle keywords).`,
          evidence: [
            {
              location: rel,
              content: `Keywords found: ${matched.slice(0, 5).join(", ")}`,
              kind: "file",
            },
          ],
          ranAt,
          ranBy: agent,
        };
      }
      evidence.push({
        location: rel,
        content: `Exists but only ${String(matched.length)} keywords matched (need 3+)`,
        kind: "file",
      });
    }
  }

  return {
    controlId: CONTROL.id,
    result: "fail",
    summary: "No documented AI system lifecycle found.",
    evidence,
    remediation:
      "Add a lifecycle doc (e.g. docs/0.1-ROADMAP.md with F0-F8 phases, or PHASES.md) " +
      "that covers design, development, testing, deployment, and monitoring.",
    ranAt,
    ranBy: agent,
  };
}

registerGate(CONTROL, run);
export { CONTROL, run };
