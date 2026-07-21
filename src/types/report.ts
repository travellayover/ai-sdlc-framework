/**
 * The compliance report. One per gate run.
 */

import type { Pillar } from "./pillar.js";

export type GateResult = "pass" | "fail" | "not-implemented";

export interface GateOutput {
  /** Control ID, e.g. "SOC 2 CC6.1" */
  controlId: string;
  /** Gate result */
  result: GateResult;
  /** Human-readable summary */
  summary: string;
  /** Evidence: file paths, line numbers, snippets */
  evidence: Evidence[];
  /** If the gate failed, what to do to fix it */
  remediation?: string;
  /** When the gate ran (ISO timestamp) */
  ranAt: string;
  /** Which agent ran the gate (per-agent identity) */
  ranBy: string;
}

export interface Evidence {
  /** Where the evidence was found (file path, git ref, etc.) */
  location: string;
  /** What the evidence says (snippet, line, etc.) */
  content: string;
  /** Type of evidence */
  kind: "file" | "git" | "env" | "computed";
}

export interface PillarScore {
  pillar: Pillar;
  score: number; // 0-20
  maxScore: number; // always 20
  controls: GateOutput[];
}

export interface ComplianceReport {
  /** ISO timestamp of when the report was generated */
  generatedAt: string;
  /** Target repository path */
  target: string;
  /** Framework version */
  frameworkVersion: string;
  /** Per-pillar scores */
  pillars: PillarScore[];
  /** Total TrustScore (0-100) */
  trustScore: number;
  /** Max possible score (always 100) */
  maxScore: number;
  /** Number of passing controls */
  passingControls: number;
  /** Number of failing controls */
  failingControls: number;
  /** Number of not-implemented controls */
  notImplementedControls: number;
  /** Total controls checked */
  totalControls: number;
}
