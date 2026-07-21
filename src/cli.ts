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
import { verifyChain } from "./audit/signed-log.js";

const VERSION = "0.1.0";

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
    } else {
      console.error(`Audit log INVALID at entry ${String(result.firstInvalidEntry ?? 0)}: ${result.reason ?? "unknown reason"}`);
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
