import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

describe("ai-sdlc run --min-score", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ai-sdlc-minscore-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("does not crash with --min-score 0", () => {
    // Init first so audit/ exists
    const init = spawnSync("npx", ["tsx", "src/cli.ts", "init", "--target", dir], {
      cwd: process.cwd(),
      encoding: "utf-8",
      timeout: 30_000,
    });
    expect(init.status).toBe(0);
    const result = spawnSync("npx", ["tsx", "src/cli.ts", "run", "--target", dir, "--output", join(dir, ".ai-sdlc"), "--min-score", "0"], {
      cwd: process.cwd(),
      encoding: "utf-8",
      timeout: 30_000,
    });
    // Exit 0 because min-score 0 is satisfied by any score
    expect(result.status).toBe(0);
  });

  it("exits non-zero when TrustScore is < min-score", () => {
    const init = spawnSync("npx", ["tsx", "src/cli.ts", "init", "--target", dir], {
      cwd: process.cwd(),
      encoding: "utf-8",
      timeout: 30_000,
    });
    expect(init.status).toBe(0);
    const result = spawnSync("npx", ["tsx", "src/cli.ts", "run", "--target", dir, "--output", join(dir, ".ai-sdlc"), "--min-score", "100"], {
      cwd: process.cwd(),
      encoding: "utf-8",
      timeout: 30_000,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/below the minimum/);
  });
});
