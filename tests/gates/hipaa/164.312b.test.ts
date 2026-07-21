import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../../../src/gates/hipaa/164.312b-audit-controls.js";
import { listGates } from "../../../src/gates/index.js";
import { appendEntry, generateKey } from "../../../src/audit/signed-log.js";
import { createHmac, randomBytes } from "node:crypto";

describe("HIPAA §164.312(b) gate", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ai-sdlc-hipaa-b-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails when the audit/ directory does not exist", async () => {
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toContain("audit/ directory does not exist");
    expect(out.remediation).toContain("npx ai-sdlc init");
  });

  it("fails when the audit/ directory is empty", async () => {
    mkdirSync(join(dir, "audit"), { recursive: true });
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toContain("contains no .log files");
  });

  it("fails when the log file is empty", async () => {
    mkdirSync(join(dir, "audit"), { recursive: true });
    writeFileSync(join(dir, "audit", "2026-07-21.log"), "");
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toContain("log files but they are empty");
  });

  it("passes when the audit log has valid signed entries", async () => {
    const auditDir = join(dir, "audit");
    appendEntry({ auditDir }, { lane: "l1", agent: "test-agent", action: "init", data: { v: "0.1.0" } });
    appendEntry({ auditDir }, { lane: "l1", agent: "test-agent", action: "run", data: { trustScore: 10 } });
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
    expect(out.summary).toContain("2 entries");
    expect(out.summary).toContain("Chain verifies");
  });

  it("fails when the audit log has been tampered with (nested data field)", async () => {
    const auditDir = join(dir, "audit");
    appendEntry({ auditDir }, { lane: "l1", agent: "test-agent", action: "init", data: { trustScore: 10 } });
    appendEntry({ auditDir }, { lane: "l1", agent: "test-agent", action: "run", data: { trustScore: 10 } });
    // Tamper with the nested data
    const today = new Date().toISOString().slice(0, 10);
    const logPath = join(auditDir, `${today}.log`);
    const content = require("node:fs").readFileSync(logPath, "utf-8");
    const lines = content.trim().split("\n");
    const parsed = JSON.parse(lines[0]!);
    parsed.data.trustScore = 99;
    lines[0] = JSON.stringify(parsed);
    writeFileSync(logPath, lines.join("\n") + "\n", "utf-8");

    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toMatch(/INVALID/);
  });

  it("fails when the chain is broken (prevHash mismatch)", async () => {
    const auditDir = join(dir, "audit");
    appendEntry({ auditDir }, { lane: "l1", agent: "test-agent", action: "init", data: {} });
    appendEntry({ auditDir }, { lane: "l2", agent: "test-agent", action: "run", data: {} });
    // Break the chain by appending a non-signed entry
    appendFileSync(join(auditDir, `${new Date().toISOString().slice(0, 10)}.log`), '{"lane":"x","action":"bad"}\n');

    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
  });

  it("is registered in the gate registry as implemented", () => {
    const gates = listGates("audit-trail");
    const gate = gates.find((g) => g.control.id === "HIPAA §164.312(b)");
    expect(gate).toBeTruthy();
    expect(gate!.control.status).toBe("implemented");
  });
});
