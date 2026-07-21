import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../../src/runner/index.js";
import { initProject } from "../../src/runner/init.js";
import { listGates } from "../../src/gates/index.js";
// Side-effect imports to register all gates
import "../../src/index.js";

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

describe("Gate runner", () => {
  let dir: string;
  let outputDir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ai-sdlc-runner-"));
    outputDir = join(dir, ".ai-sdlc");

    git(dir, "init", "-q", "-b", "master");
    git(dir, "config", "user.email", "test-agent@example.com");
    git(dir, "config", "user.name", "test-agent");
    execFileSync("bash", ["-c", `echo hello > "${dir}/file.txt" && cd "${dir}" && git add file.txt && git commit -q -m "init"`]);

    // Add a lifecycle doc for ISO 42001 gate
    mkdirSync(join(dir, "docs"), { recursive: true });
    writeFileSync(
      join(dir, "docs/0.1-ROADMAP.md"),
      "# Roadmap\nF0 design, F1 develop, F2 test, F3 deploy, F4 monitor\n",
      "utf-8",
    );
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("runs all 18 gates (4 implemented + 14 stubs)", async () => {
    const report = await run({
      target: dir,
      outputDir,
      frameworkVersion: "0.1.0",
    });
    expect(report.totalControls).toBe(18);
    expect(report.notImplementedControls).toBe(14);
    expect(report.passingControls + report.failingControls).toBe(4);
  });

  it("produces JSON and markdown reports", async () => {
    const report = await run({
      target: dir,
      outputDir,
      frameworkVersion: "0.1.0",
    });
    const today = new Date().toISOString().slice(0, 10);
    expect(existsSync(join(outputDir, `report-${today}.json`))).toBe(true);
    expect(existsSync(join(outputDir, `report-${today}.md`))).toBe(true);

    const json = JSON.parse(readFileSync(join(outputDir, `report-${today}.json`), "utf-8"));
    expect(json.trustScore).toBe(report.trustScore);
  });

  it("computes a TrustScore between 0 and 100", async () => {
    const report = await run({
      target: dir,
      outputDir,
      frameworkVersion: "0.1.0",
    });
    expect(report.trustScore).toBeGreaterThanOrEqual(0);
    expect(report.trustScore).toBeLessThanOrEqual(100);
  });

  it("groups results by pillar", async () => {
    const report = await run({
      target: dir,
      outputDir,
      frameworkVersion: "0.1.0",
    });
    expect(report.pillars.length).toBe(5);
    // Pillar distribution:
    //   identity-and-access: 1 implemented (CC6.1) + 3 stubs (CC6.2, CC6.3, A.5.3) = 4
    //   change-management:   1 implemented (A.6.1.2) + 3 stubs (CC8.1, 164.308a1, A.5.2) = 4
    //   code-integrity:      1 implemented (164.312a2i) + 3 stubs (CC7.1, 164.312c, CC7.3) = 4
    //   operational-trust:   0 implemented + 3 stubs (CC7.2, CC9.1, A.7.1) = 3
    //   audit-trail:         1 implemented (164.312b) + 2 stubs (A.9.4, A.9.5) = 3
    //   Total: 18 controls
    const counts: Record<string, number> = {};
    for (const p of report.pillars) {
      counts[p.pillar] = p.controls.length;
    }
    expect(counts["identity-and-access"]).toBe(4);
    expect(counts["change-management"]).toBe(4);
    expect(counts["code-integrity"]).toBe(4);
    expect(counts["operational-trust"]).toBe(3);
    expect(counts["audit-trail"]).toBe(3);
  });

  it("initProject creates .ai-sdlc and audit directories", () => {
    initProject({ target: dir, frameworkVersion: "0.1.0" });
    expect(existsSync(join(dir, ".ai-sdlc/config.json"))).toBe(true);
    expect(existsSync(join(dir, "audit"))).toBe(true);
  });
});
