/**
 * Report writers: JSON and Markdown.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ComplianceReport } from "../types/report.js";

export function writeJsonReport(
  outputDir: string,
  stem: string,
  report: ComplianceReport,
): void {
  mkdirSync(outputDir, { recursive: true });
  const path = join(outputDir, `${stem}.json`);
  writeFileSync(path, JSON.stringify(report, null, 2), "utf-8");
}

export function writeMarkdownReport(
  outputDir: string,
  stem: string,
  report: ComplianceReport,
): void {
  mkdirSync(outputDir, { recursive: true });
  const path = join(outputDir, `${stem}.md`);

  const lines: string[] = [];
  lines.push(`# AI-SDLC Compliance Report`);
  lines.push("");
  lines.push(`- **Generated:** ${report.generatedAt}`);
  lines.push(`- **Target:** ${report.target}`);
  lines.push(`- **Framework version:** ${report.frameworkVersion}`);
  lines.push(`- **TrustScore:** **${String(report.trustScore)} / 100**`);
  lines.push(
    `- **Passing:** ${String(report.passingControls)} · **Failing:** ${String(report.failingControls)} · **Not implemented:** ${String(report.notImplementedControls)} · **Total:** ${String(report.totalControls)}`,
  );
  lines.push("");

  for (const pillar of report.pillars) {
    lines.push(`## Pillar: ${pillar.pillar} (${String(pillar.score)} / ${String(pillar.maxScore)})`);
    lines.push("");
    for (const c of pillar.controls) {
      const icon = c.result === "pass" ? "PASS" : c.result === "fail" ? "FAIL" : "STUB";
      lines.push(`### ${icon} ${c.controlId} — ${c.summary}`);
      lines.push("");
      if (c.evidence.length > 0) {
        lines.push("**Evidence:**");
        for (const e of c.evidence) {
          lines.push(`- \`${e.location}\`: ${e.content}`);
        }
        lines.push("");
      }
      if (c.remediation) {
        lines.push(`**Remediation:** ${c.remediation}`);
        lines.push("");
      }
    }
  }

  writeFileSync(path, lines.join("\n"), "utf-8");
}
