/**
 * The gate runner. Runs all enabled gates against a target directory
 * and produces a compliance report.
 */

import { listGates } from "../gates/index.js";
import { detectAgentIdentity } from "../identity/detect.js";
import { PILLAR_WEIGHT } from "../types/pillar.js";
import type { Control } from "../types/control.js";
import type { Pillar } from "../types/pillar.js";
import type {
  ComplianceReport,
  GateOutput,
  PillarScore,
} from "../types/report.js";
import { writeJsonReport, writeMarkdownReport } from "./report.js";

export interface RunOptions {
  target: string;
  outputDir: string;
  pillar?: Pillar;
  frameworkVersion: string;
}

export async function run(opts: RunOptions): Promise<ComplianceReport> {
  const agent = detectAgentIdentity(opts.target);
  const gates = listGates(opts.pillar);
  const outputs: GateOutput[] = [];

  for (const { gate } of gates) {
    try {
      const out = await gate(opts.target, agent);
      outputs.push(out);
    } catch (err) {
      outputs.push({
        controlId: "unknown",
        result: "fail",
        summary: "Gate threw an exception",
        evidence: [
          {
            location: "gate execution",
            content: err instanceof Error ? err.message : String(err),
            kind: "computed",
          },
        ],
        remediation: "Check the gate implementation for runtime errors.",
        ranAt: new Date().toISOString(),
        ranBy: agent,
      });
    }
  }

  // Group by pillar (using the control's pillar directly, not the registry lookup)
  const controlMap = new Map<string, Control>();
  for (const g of listGates()) {
    controlMap.set(g.control.id, g.control);
  }
  const byPillar = new Map<Pillar, GateOutput[]>();
  for (const o of outputs) {
    const control = controlMap.get(o.controlId);
    if (!control) continue;
    const p = control.pillar;
    if (!byPillar.has(p)) byPillar.set(p, []);
    byPillar.get(p)!.push(o);
  }

  // Compute scores
  const pillars: PillarScore[] = [];
  let totalScore = 0;
  let passing = 0;
  let failing = 0;
  let notImpl = 0;

  for (const [p, outs] of byPillar) {
    const pointsPerControl = PILLAR_WEIGHT / outs.length;
    let pScore = 0;
    for (const o of outs) {
      if (o.result === "pass") {
        pScore += pointsPerControl;
        passing++;
      } else if (o.result === "fail") {
        failing++;
      } else {
        notImpl++;
      }
    }
    pillars.push({
      pillar: p,
      score: Math.round(pScore * 100) / 100,
      maxScore: PILLAR_WEIGHT,
      controls: outs,
    });
    totalScore += pScore;
  }

  const report: ComplianceReport = {
    generatedAt: new Date().toISOString(),
    target: opts.target,
    frameworkVersion: opts.frameworkVersion,
    pillars: pillars.sort((a, b) => a.pillar.localeCompare(b.pillar)),
    trustScore: Math.round(totalScore * 100) / 100,
    maxScore: 100,
    passingControls: passing,
    failingControls: failing,
    notImplementedControls: notImpl,
    totalControls: outputs.length,
  };

  // Write report files
  const stem = `report-${new Date().toISOString().slice(0, 10)}`;
  writeJsonReport(opts.outputDir, stem, report);
  writeMarkdownReport(opts.outputDir, stem, report);

  return report;
}
