import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../../../src/gates/soc2/cc8.1-change-management.js";
import { listGates } from "../../../src/gates/index.js";

describe("SOC 2 CC8.1 gate", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ai-sdlc-cc81-"));
    mkdirSync(join(dir, ".github"), { recursive: true });
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails when no PR template and no CODEOWNERS exist", async () => {
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toContain("PR template not found");
    expect(out.summary).toContain("CODEOWNERS not found");
    expect(out.remediation).toContain("Create .github/PULL_REQUEST_TEMPLATE.md");
  });

  it("fails when PR template is missing required sections", async () => {
    writeFileSync(join(dir, ".github", "PULL_REQUEST_TEMPLATE.md"), "# PR\n\n## What\n\nDescribe.\n");
    writeFileSync(join(dir, ".github", "CODEOWNERS"), "* @reviewer\n");
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toMatch(/missing sections: .*Risk/);
  });

  it("passes when PR template has all required sections and CODEOWNERS has entries", async () => {
    const template = [
      "# PR",
      "",
      "## What",
      "",
      "## Why",
      "",
      "## Risk",
      "",
      "low",
      "",
      "## Rollback",
      "",
      "Revert the merge.",
      "",
      "## Reviewer",
      "",
      "@gate-lane",
      "",
    ].join("\n");
    writeFileSync(join(dir, ".github", "PULL_REQUEST_TEMPLATE.md"), template);
    writeFileSync(join(dir, ".github", "CODEOWNERS"), "* @gate-lane\n/scripts/  @gate-lane\n");
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
    expect(out.summary).toContain("Change-management artifacts in place");
    expect(out.summary).toContain("2 entries");
  });

  it("fails when CODEOWNERS has only comments (no real entries)", async () => {
    const template = "## Risk\n## Rollback\n## Reviewer\n";
    writeFileSync(join(dir, ".github", "PULL_REQUEST_TEMPLATE.md"), template);
    writeFileSync(join(dir, ".github", "CODEOWNERS"), "# only comments here\n# nothing else\n");
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toMatch(/CODEOWNERS file is empty/);
  });

  it("accepts lowercase section names (case-insensitive)", async () => {
    const template = "## risk\n## rollback\n## reviewer\n";
    writeFileSync(join(dir, ".github", "PULL_REQUEST_TEMPLATE.md"), template);
    writeFileSync(join(dir, ".github", "CODEOWNERS"), "* @reviewer\n");
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
  });

  it("looks for PR template in alternate locations", async () => {
    mkdirSync(join(dir, "docs"), { recursive: true });
    const template = "## Risk\n## Rollback\n## Reviewer\n";
    writeFileSync(join(dir, "docs", "PULL_REQUEST_TEMPLATE.md"), template);
    writeFileSync(join(dir, ".github", "CODEOWNERS"), "* @reviewer\n");
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
    expect(out.summary).toContain("docs/PULL_REQUEST_TEMPLATE.md");
  });

  it("is registered in the gate registry as implemented", () => {
    const gates = listGates("change-management");
    const gate = gates.find((g) => g.control.id === "SOC 2 CC8.1");
    expect(gate).toBeTruthy();
    expect(gate!.control.status).toBe("implemented");
  });
});
