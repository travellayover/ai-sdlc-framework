import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendEntry, verifyChain, generateKey } from "../../src/audit/signed-log.js";

describe("Signed audit log", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ai-sdlc-audit-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("appends an entry with a valid signature", () => {
    const entry = appendEntry(
      { auditDir: dir },
      { lane: "test", agent: "test-agent", action: "commit", data: { sha: "abc123" } },
    );
    expect(entry.signature).toMatch(/^[a-f0-9]{64}$/);
    expect(entry.prevHash).toBe("0".repeat(64));
  });

  it("chains entries via prevHash", () => {
    const e1 = appendEntry(
      { auditDir: dir },
      { lane: "test", agent: "a1", action: "commit", data: {} },
    );
    const e2 = appendEntry(
      { auditDir: dir },
      { lane: "test", agent: "a1", action: "commit", data: {} },
    );
    expect(e2.prevHash).toBe(e1.signature);
  });

  it("verifies a valid chain", () => {
    appendEntry({ auditDir: dir }, { lane: "l1", agent: "a", action: "commit", data: {} });
    appendEntry({ auditDir: dir }, { lane: "l2", agent: "a", action: "commit", data: {} });
    appendEntry({ auditDir: dir }, { lane: "l3", agent: "a", action: "commit", data: {} });
    const result = verifyChain(dir);
    expect(result.valid).toBe(true);
    expect(result.entriesChecked).toBe(3);
  });

  it("detects tampering with an entry", () => {
    appendEntry({ auditDir: dir }, { lane: "l1", agent: "a", action: "commit", data: {} });
    const e2 = appendEntry({ auditDir: dir }, { lane: "l2", agent: "a", action: "commit", data: {} });
    appendEntry({ auditDir: dir }, { lane: "l3", agent: "a", action: "commit", data: {} });

    // Tamper: rewrite e2\'s action
    const today = new Date().toISOString().slice(0, 10);
    const logPath = join(dir, `${today}.log`);
    const content = readFileSync(logPath, "utf-8");
    const lines = content.trim().split("\n");
    const parsed = JSON.parse(lines[1]!);
    parsed.action = "tampered-action";
    lines[1] = JSON.stringify(parsed);
    require("node:fs").writeFileSync(logPath, lines.join("\n") + "\n", "utf-8");

    const result = verifyChain(dir);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Signature");
  });

  it("detects tampering with NESTED data fields", () => {
    appendEntry(
      { auditDir: dir },
      { lane: "l1", agent: "a", action: "commit", data: { sha: "original", value: 10 } },
    );
    appendEntry(
      { auditDir: dir },
      { lane: "l2", agent: "a", action: "commit", data: { sha: "tampered", value: 99 } },
    );

    // Tamper: rewrite the nested data.value field
    const today = new Date().toISOString().slice(0, 10);
    const logPath = join(dir, `${today}.log`);
    const content = readFileSync(logPath, "utf-8");
    const lines = content.trim().split("\n");
    const parsed = JSON.parse(lines[0]!);
    parsed.data.value = 99;  // change nested field
    lines[0] = JSON.stringify(parsed);
    require("node:fs").writeFileSync(logPath, lines.join("\n") + "\n", "utf-8");

    const result = verifyChain(dir);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Signature");
  });

  it("detects broken chain (modifying prevHash)", () => {
    const e1 = appendEntry({ auditDir: dir }, { lane: "l1", agent: "a", action: "commit", data: {} });
    appendEntry({ auditDir: dir }, { lane: "l2", agent: "a", action: "commit", data: {} });

    // Tamper: rewrite e1\'s signature
    const today = new Date().toISOString().slice(0, 10);
    const logPath = join(dir, `${today}.log`);
    const content = readFileSync(logPath, "utf-8");
    const lines = content.trim().split("\n");
    const parsed = JSON.parse(lines[0]!);
    parsed.signature = "f".repeat(64);
    lines[0] = JSON.stringify(parsed);
    require("node:fs").writeFileSync(logPath, lines.join("\n") + "\n", "utf-8");

    const result = verifyChain(dir);
    expect(result.valid).toBe(false);
    expect(result.entriesChecked).toBe(0);
    expect(result.reason).toContain("Signature");
  });

  it("generateKey produces a 64-char hex string", () => {
    const key = generateKey();
    expect(key).toMatch(/^[a-f0-9]{64}$/);
  });
});
