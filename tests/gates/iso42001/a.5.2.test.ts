import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../../../src/gates/iso42001/a.5.2-ai-policy.js";
import { listGates } from "../../../src/gates/index.js";

describe("ISO 42001 A.5.2 gate", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ai-sdlc-a52-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails when no AI policy file exists", async () => {
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toContain("AI policy not found");
    expect(out.remediation).toContain("Create docs/AI-POLICY.md");
  });

  it("fails when policy exists but has no approval line", async () => {
    mkdirSync(join(dir, "docs"), { recursive: true });
    writeFileSync(join(dir, "docs", "AI-POLICY.md"), "# AI Policy\n\nWe use AI responsibly.\n");
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toMatch(/approval line not found/);
  });

  it("fails when policy has approval but no date", async () => {
    mkdirSync(join(dir, "docs"), { recursive: true });
    writeFileSync(join(dir, "docs", "AI-POLICY.md"), "Approved by: Alice\n\nSome policy text.\n");
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toMatch(/approval date not found/);
  });

  it("passes when policy has approval line and recent date", async () => {
    mkdirSync(join(dir, "docs"), { recursive: true });
    const today = new Date().toISOString().slice(0, 10);
    writeFileSync(
      join(dir, "docs", "AI-POLICY.md"),
      `# AI Policy\n\nWe use AI to write code.\n\nApproved by: Alice <alice@example.com> ${today}\n`,
    );
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
    expect(out.summary).toContain("AI policy in place");
    expect(out.summary).toContain("Approver: Alice");
  });

  it("fails when policy date is too old (>365 days)", async () => {
    mkdirSync(join(dir, "docs"), { recursive: true });
    const oldDate = new Date(Date.now() - 400 * 86_400_000).toISOString().slice(0, 10);
    writeFileSync(
      join(dir, "docs", "AI-POLICY.md"),
      `# AI Policy\n\nApproved by: Alice ${oldDate}\n`,
    );
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toMatch(/days old/);
  });

  it("accepts alternate policy locations", async () => {
    writeFileSync(
      join(dir, "AI-POLICY.md"),
      `Approved by: Bob ${new Date().toISOString().slice(0, 10)}\n`,
    );
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
    expect(out.evidence[0]?.location).toBe("AI-POLICY.md");
  });

  it("accepts 'Signed:' prefix in addition to 'Approved by:'", async () => {
    mkdirSync(join(dir, "docs"), { recursive: true });
    writeFileSync(
      join(dir, "docs", "AI-POLICY.md"),
      `Signed: Carol ${new Date().toISOString().slice(0, 10)}\n`,
    );
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
  });

  it("is registered in the gate registry as implemented", () => {
    const gates = listGates("change-management");
    const gate = gates.find((g) => g.control.id === "ISO 42001 A.5.2");
    expect(gate).toBeTruthy();
    expect(gate!.control.status).toBe("implemented");
  });
});
