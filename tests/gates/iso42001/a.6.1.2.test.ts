import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../../../src/gates/iso42001/a.6.1.2-lifecycle.js";
import { listGates } from "../../../src/gates/index.js";

describe("ISO 42001 A.6.1.2 gate", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ai-sdlc-iso-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("fails when no lifecycle doc exists", async () => {
    const out = await run(dir, "test");
    expect(out.result).toBe("fail");
    expect(out.summary).toContain("lifecycle");
  });

  it("passes when docs/0.1-ROADMAP.md has F0-F8", async () => {
    mkdirSync(join(dir, "docs"), { recursive: true });
    writeFileSync(
      join(dir, "docs/0.1-ROADMAP.md"),
      "# Roadmap\n\nF0 foundation, F1 design, F2 develop, F3 test, F4 deploy, F5 monitor, F6, F7, F8\n",
      "utf-8",
    );
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
  });

  it("passes when PHASES.md has design/develop/test/deploy/monitor", async () => {
    writeFileSync(
      join(dir, "PHASES.md"),
      "# Lifecycle\n\nPhase 0: design\nPhase 1: develop\nPhase 2: test\nPhase 3: deploy\nPhase 4: monitor\n",
      "utf-8",
    );
    const out = await run(dir, "test");
    expect(out.result).toBe("pass");
  });

  it("is registered in the gate registry", () => {
    const gates = listGates("change-management");
    const iso = gates.find((g) => g.control.id === "ISO 42001 A.6.1.2");
    expect(iso).toBeTruthy();
    expect(iso!.control.status).toBe("implemented");
  });
});
