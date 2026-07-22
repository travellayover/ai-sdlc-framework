import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../../../src/gates/iso42001/a.5.3-segregation-of-duties.js";
import { listGates } from "../../../src/gates/index.js";
import { appendEntry } from "../../../src/audit/signed-log.js";

describe("ISO 42001 A.5.3 gate", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ai-sdlc-a53-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails when no audit log exists", async () => {
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toContain("Audit log is empty");
  });

  it("passes when audit log has only run actions (no lane with all 3 roles)", async () => {
    const auditDir = join(dir, "audit");
    appendEntry({ auditDir }, { lane: "l1", agent: "alice", action: "run", data: {} });
    appendEntry({ auditDir }, { lane: "l1", agent: "bob", action: "run", data: {} });
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
    expect(out.summary).toContain("No lane has all 3 roles");
  });

  it("passes when 3 distinct agents handle write, review, deploy of the same lane", async () => {
    const auditDir = join(dir, "audit");
    appendEntry({ auditDir }, { lane: "feat-x", agent: "alice-writer", action: "commit", data: {} });
    appendEntry({ auditDir }, { lane: "feat-x", agent: "bob-reviewer", action: "review", data: {} });
    appendEntry({ auditDir }, { lane: "feat-x", agent: "carol-deployer", action: "deploy", data: {} });
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
    expect(out.summary).toContain("Segregation of duties verified");
  });

  it("fails when the same agent is the writer, reviewer, AND deployer", async () => {
    const auditDir = join(dir, "audit");
    appendEntry({ auditDir }, { lane: "feat-y", agent: "alice", action: "commit", data: {} });
    appendEntry({ auditDir }, { lane: "feat-y", agent: "alice", action: "review", data: {} });
    appendEntry({ auditDir }, { lane: "feat-y", agent: "alice", action: "deploy", data: {} });
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toContain("alice");
    expect(out.summary).toContain("write+review+deploy");
  });

  it("passes when 2 agents share one role but a 3rd distinct agent covers another role", async () => {
    const auditDir = join(dir, "audit");
    appendEntry({ auditDir }, { lane: "feat-z", agent: "alice", action: "commit", data: {} });
    appendEntry({ auditDir }, { lane: "feat-z", agent: "alice", action: "review", data: {} });
    appendEntry({ auditDir }, { lane: "feat-z", agent: "bob", action: "deploy", data: {} });
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
  });

  it("ignores entries with no lane field", async () => {
    const auditDir = join(dir, "audit");
    appendEntry({ auditDir }, { lane: "l1", agent: "alice", action: "commit", data: {} });
    appendEntry({ auditDir }, { agent: "alice", action: "review", data: {} });
    appendEntry({ auditDir }, { agent: "alice", action: "deploy", data: {} });
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
  });

  it("is registered in the gate registry as implemented", () => {
    const gates = listGates("identity-and-access");
    const gate = gates.find((g) => g.control.id === "ISO 42001 A.5.3");
    expect(gate).toBeTruthy();
    expect(gate!.control.status).toBe("implemented");
  });
});
