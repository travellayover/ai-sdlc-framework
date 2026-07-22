/**
 * HIPAA §164.312(b) — Audit controls.
 * "Implement hardware, software, and/or procedural mechanisms that record
 *  and examine activity in information systems that contain or use
 *  electronic protected health information."
 *
 * For an AI coding agent pipeline, the framework\'s own audit log MUST be:
 * 1. Initialized (.ai-sdlc/ and audit/ directories exist)
 * 2. Populated (at least one entry written)
 * 3. Structured (each entry has the required fields)
 * 4. Signed (each entry has a valid HMAC signature)
 * 5. Chained (each entry\'s prevHash matches the previous entry\'s signature)
 * 6. Tamper-evident (verifyChain() returns valid)
 *
 * This gate is the framework\'s dogfooding: it uses the framework\'s own
 * audit log code (src/audit/signed-log.ts) to verify the framework\'s
 * own audit log. Per PHILOSOPHY §1, if the audit log is absent, the
 * gate reports "not-implemented" honestly, not as "tracked" or
 * "scheduled."
 *
 * Evidence: the audit log files in <target>/audit/*.log and the
 * verifyChain() result.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { registerGate } from "../index.js";
import { verifyChain } from "../../audit/signed-log.js";
import type { Control } from "../../types/control.js";
import type { Evidence, GateOutput } from "../../types/report.js";

const CONTROL: Control = {
  id: "HIPAA §164.312(b)",
  title: "Audit controls (sample: the framework\'s own audit log is in use, signed, and tamper-evident)",
  pillar: "audit-trail",
  status: "implemented",
  spec:
    "The framework\'s own audit log must be initialized, populated with " +
    "signed entries, and pass verifyChain() without tampering. Per the " +
    "framework\'s PHILOSOPHY, every agent action is recorded in the " +
    "audit log; this gate enforces that contract.",
  evidenceSource: "<target>/audit/*.log + verifyChain() result",
};

interface CheckResult {
  ok: boolean;
  reason?: string;
  entryCount: number;
  fileCount: number;
  chainValid: boolean;
}

function check(target: string): CheckResult {
  const auditDir = join(target, "audit");
  if (!existsSync(auditDir)) {
    return {
      ok: false,
      reason: "audit/ directory does not exist; run `npx ai-sdlc init` to initialize the framework",
      entryCount: 0,
      fileCount: 0,
      chainValid: false,
    };
  }

  const files = readdirSync(auditDir).filter((f) => f.endsWith(".log"));
  if (files.length === 0) {
    return {
      ok: false,
      reason: "audit/ directory exists but contains no .log files; the framework has not been run",
      entryCount: 0,
      fileCount: 0,
      chainValid: false,
    };
  }

  // Count entries across all log files
  let entryCount = 0;
  for (const file of files) {
    const content = readFileSync(join(auditDir, file), "utf-8");
    const lines = content.trim().split("\n").filter((l: string) => l.length > 0);
    entryCount += lines.length;
  }

  if (entryCount === 0) {
    return {
      ok: false,
      reason: "audit/ directory has log files but they are empty",
      entryCount: 0,
      fileCount: files.length,
      chainValid: false,
    };
  }

  // Verify the chain
  const result = verifyChain(auditDir);
  if (!result.valid) {
    return {
      ok: false,
      reason: `Audit log chain is INVALID: ${result.reason ?? "unknown reason"} at entry ${String(result.firstInvalidEntry ?? 0)}`,
      entryCount,
      fileCount: files.length,
      chainValid: false,
    };
  }

  return {
    ok: true,
    entryCount,
    fileCount: files.length,
    chainValid: true,
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
      summary: "Could not run the audit log check",
      evidence: [
        {
          location: "audit/ directory",
          content: err instanceof Error ? err.message : String(err),
          kind: "computed",
        },
      ],
      remediation:
        "Ensure the target is writable and the audit/ directory is " +
        "initialized. Run `npx ai-sdlc init --target <path>` if it\'s not.",
      ranAt,
      ranBy: agent,
    };
  }

  evidence.push({
    location: "audit/ directory",
    content: `${String(result.fileCount)} log file(s), ${String(result.entryCount)} total entry/entries`,
    kind: "file",
  });

  if (result.ok) {
    return {
      controlId: CONTROL.id,
      result: "pass",
      summary: `Audit log valid. ${String(result.entryCount)} entries across ${String(result.fileCount)} file(s). Chain verifies.`,
      evidence,
      ranAt,
      ranBy: agent,
    };
  }

  return {
    controlId: CONTROL.id,
    result: "fail",
    summary: result.reason ?? "Audit log check failed",
    evidence,
    remediation: result.reason ?? "Run `npx ai-sdlc init` and `npx ai-sdlc run` to populate the audit log.",
    ranAt,
    ranBy: agent,
  };
}

registerGate(CONTROL, run);
export { CONTROL, run };
