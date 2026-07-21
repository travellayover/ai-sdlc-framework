/**
 * The CLI entry point. Per package.json `bin`, this is `ai-sdlc`.
 *
 * Usage:
 *   ai-sdlc init [--target <path>]
 *   ai-sdlc run [--target <path>] [--pillar <pillar>] [--output <path>]
 *   ai-sdlc verify-audit [--target <path>]
 *   ai-sdlc version
 */

import { Command } from "commander";
import { join } from "node:path";
import { run } from "./runner/index.js";
import { initProject } from "./runner/init.js";
import { verifyChain, appendEntry } from "./audit/signed-log.js";
import { detectAgentIdentity } from "./identity/detect.js";

const VERSION = "0.1.0";

function logAction(opts: { target: string; action: string; data: Record<string, string | number | boolean | null>; lane?: string; }): void {
  try {
    const auditDir = `${opts.target}/audit`;
    const agent = detectAgentIdentity(opts.target);
    const entry = appendEntry(
      { auditDir },
      {
        lane: opts.lane ?? "ai-sdlc-cli",
        agent,
        action: opts.action,
        data: opts.data,
      },
    );
    process.stderr.write(`[audit] wrote entry ${entry.signature.slice(0, 12)}... to ${auditDir}\n`);
  } catch (err) {
    process.stderr.write(`[audit] FAILED: ${err instanceof Error ? err.message : String(err)}\n`);
  }
}

const program = new Command();

program
  .name("ai-sdlc")
  .description(
    "Apache 2.0 framework for regulatory compliance (SOC 2, HIPAA, ISO 42001) and quality gates in AI coding agent pipelines.",
  )
  .version(VERSION);

program
  .command("init")
  .description("Initialize the framework in a target project")
  .option("-t, --target <path>", "target directory", ".")
  .action((opts) => {
    initProject({ target: opts.target, frameworkVersion: VERSION });
    console.log(`Initialized AI-SDLC framework in ${opts.target}`);
    console.log(`Created ${join(opts.target, ".ai-sdlc")} and ${join(opts.target, "audit")}`);
    logAction({ target: opts.target, action: "init", data: { frameworkVersion: VERSION } });
  });

program
  .command("run")
  .description("Run all enabled gates and produce a compliance report")
  .option("-t, --target <path>", "target directory", ".")
  .option("-p, --pillar <pillar>", "run only one pillar")
  .option("-o, --output <path>", "output directory", "./.ai-sdlc")
  .action(async (opts) => {
    const report = await run({
      target: opts.target,
      outputDir: opts.output,
      pillar: opts.pillar,
      frameworkVersion: VERSION,
    });
    console.log(`TrustScore: ${String(report.trustScore)} / 100`);
    console.log(
      `Pass: ${String(report.passingControls)} · Fail: ${String(report.failingControls)} · Stub: ${String(report.notImplementedControls)} · Total: ${String(report.totalControls)}`,
    );
    console.log(`Report: ${join(opts.output, `report-${new Date().toISOString().slice(0, 10)}.md`)}`);
    logAction({
      target: opts.target,
      action: "run",
      data: {
        trustScore: report.trustScore,
        passing: report.passingControls,
        failing: report.failingControls,
        notImplemented: report.notImplementedControls,
        total: report.totalControls,
      },
    });
  });

program
  .command("verify-audit")
  .description("Verify the signed audit log chain")
  .option("-t, --target <path>", "target directory", ".")
  .option("-k, --key <key>", "HMAC key (defaults to dev key)")
  .action((opts) => {
    const auditDir = join(opts.target, "audit");
    const result = verifyChain(auditDir, opts.key);
    if (result.valid) {
      console.log(`Audit log valid. ${String(result.entriesChecked)} entries checked.`);
      logAction({
        target: opts.target,
        action: "verify-audit",
        data: { valid: true, entriesChecked: result.entriesChecked },
      });
    } else {
      console.error(`Audit log INVALID at entry ${String(result.firstInvalidEntry ?? 0)}: ${result.reason ?? "unknown reason"}`);
      logAction({
        target: opts.target,
        action: "verify-audit",
        data: { valid: false, firstInvalidEntry: result.firstInvalidEntry ?? 0, reason: result.reason ?? "unknown" },
      });
      process.exit(1);
    }
  });

program
  .command("version")
  .description("Print the framework version")
  .action(() => {
    console.log(VERSION);
  });

// Side-effect: import gates to register them
import "./gates/soc2/cc6.1-logical-access.js";
import "./gates/hipaa/164.312a2i-unique-user.js";
import "./gates/iso42001/a.6.1.2-lifecycle.js";
import "./gates/stubs.js";

program.parse(process.argv);
