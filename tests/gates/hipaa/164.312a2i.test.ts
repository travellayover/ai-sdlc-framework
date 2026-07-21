import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { run } from "../../../src/gates/hipaa/164.312a2i-unique-user.js";
import { listGates } from "../../../src/gates/index.js";

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function setupRepoWithIdentity(name: string, email: string): string {
  const dir = mkdtempSync(join(tmpdir(), "ai-sdlc-hipaa-"));
  git(dir, "init", "-q", "-b", "master");
  git(dir, "config", "user.email", email);
  git(dir, "config", "user.name", name);
  execFileSync("bash", ["-c", `echo hello > "${dir}/file.txt" && cd "${dir}" && git add file.txt && git commit -q -m "add"`]);
  return dir;
}

describe("HIPAA §164.312(a)(2)(i) gate", () => {
  let dir: string;

  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it("passes for a real agent identity", async () => {
    dir = setupRepoWithIdentity("cursor-agent-alice", "alice@org.com");
    const out = await run(dir, "cursor-agent-alice");
    expect(out.result).toBe("pass");
  });

  it("fails for an admin@ identity", async () => {
    dir = setupRepoWithIdentity("admin", "admin@example.com");
    const out = await run(dir, "admin");
    expect(out.result).toBe("fail");
    expect(out.summary).toContain("forbidden agent identities");
  });

  it("fails for a system@ identity", async () => {
    dir = setupRepoWithIdentity("system", "system@example.com");
    const out = await run(dir, "system");
    expect(out.result).toBe("fail");
  });

  it("is registered in the gate registry", () => {
    const gates = listGates("code-integrity");
    const hipaa = gates.find((g) => g.control.id === "HIPAA §164.312(a)(2)(i)");
    expect(hipaa).toBeTruthy();
    expect(hipaa!.control.status).toBe("implemented");
  });
});
