# Gate Authoring Guide

How to add a new gate to the AI-SDLC Framework.

## The pattern

A gate is a TypeScript function that:
1. Takes a `target` (path to a git repo) and an `agent` (per-agent identity)
2. Runs a check against the target
3. Returns a `GateOutput` with the result, evidence, and remediation

Gates are registered via `registerGate(control, gate)`. The runner discovers them via the registry.

## File structure

```
src/gates/
├── index.ts                              # Gate registry (do not modify unless adding the registry itself)
├── stubs.ts                              # All stub controls in one file
├── soc2/
│   ├── cc6.1-logical-access.ts          # IMPLEMENTED
│   └── ...                                # Future SOC 2 controls
├── hipaa/
│   ├── 164.312a2i-unique-user.ts        # IMPLEMENTED
│   └── ...                                # Future HIPAA controls
└── iso42001/
    ├── a.6.1.2-lifecycle.ts             # IMPLEMENTED
    └── ...                                # Future ISO 42001 controls
```

Each control lives in its own file. The file name is `<control-id>-<short-name>.ts`. The control ID matches the regulatory ID exactly (e.g., `SOC 2 CC6.1`).

## Skeleton

```ts
import { execFileSync } from "node:child_process";
import { registerGate } from "../index.js";
import type { Control } from "../../types/control.js";
import type { Evidence, GateOutput } from "../../types/report.js";

const CONTROL: Control = {
  id: "SOC 2 CC6.X",                      // Must match the regulatory ID
  title: "Short human-readable title",     // Shown in the report
  pillar: "identity-and-access",          // One of the 5 pillars
  status: "implemented",                  // "implemented" or "stub"
  spec: "What the control verifies, in 1-2 sentences.",
  evidenceSource: "Where the evidence comes from (file, git, env, etc.)",
};

async function run(target: string, agent: string): Promise<GateOutput> {
  const evidence: Evidence[] = [];
  const ranAt = new Date().toISOString();

  // 1. Run the check. Use try/catch to handle errors gracefully.
  let stdout: string;
  try {
    stdout = execFileSync("git", ["-C", target, "log", "--format=%H"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (err) {
    return {
      controlId: CONTROL.id,
      result: "fail",
      summary: "Could not run the check",
      evidence: [{
        location: "git log",
        content: err instanceof Error ? err.message : String(err),
        kind: "git",
      }],
      remediation: "Ensure the target is a git repository.",
      ranAt,
      ranBy: agent,
    };
  }

  // 2. Analyze the result.
  const violations: string[] = [];
  // ... your check logic here ...

  // 3. Return the result.
  if (violations.length === 0) {
    return {
      controlId: CONTROL.id,
      result: "pass",
      summary: "All checks passed.",
      evidence: [{ location: "...", content: "...", kind: "computed" }],
      ranAt,
      ranBy: agent,
    };
  }

  return {
    controlId: CONTROL.id,
    result: "fail",
    summary: `Found ${String(violations.length)} violations.`,
    evidence: violations.map((v) => ({ location: "...", content: v, kind: "computed" })),
    remediation: "What to do to fix the violation.",
    ranAt,
    ranBy: agent,
  };
}

registerGate(CONTROL, run);
export { CONTROL, run };
```

## Registering

The `registerGate(CONTROL, run)` call at the bottom of the file is the side-effect import. When the file is imported, the gate is added to the registry.

To make the gate available to the runner, add an import in `src/index.ts`:

```ts
import "./gates/soc2/cc6.X-logical-access.js";
```

## Testing

Each gate gets a test file in `tests/gates/<framework>/<id>.test.ts`. The pattern:

```ts
import { describe, it, expect } from "vitest";
import { run } from "../../../src/gates/soc2/cc6.X.js";
import { listGates } from "../../../src/gates/index.js";

describe("SOC 2 CC6.X gate", () => {
  it("passes when the check passes", async () => {
    // setup a fixture
    // run the gate
    // assert result === "pass"
  });

  it("fails when the check fails", async () => {
    // setup a fixture
    // run the gate
    // assert result === "fail"
  });

  it("is registered in the gate registry", () => {
    const gates = listGates("<pillar>");
    const gate = gates.find((g) => g.control.id === "SOC 2 CC6.X");
    expect(gate).toBeTruthy();
    expect(gate!.control.status).toBe("implemented");
  });
});
```

## Stub controls

If a control is documented but not yet implemented, it goes in `src/gates/stubs.ts` as a `STUBS` entry. The stub returns `result: "not-implemented"` with the spec for what "implemented" would look like. Per PHILOSOPHY §1, stubs are honest about their state.

```ts
{
  control: {
    id: "SOC 2 CCX.Y",
    title: "...",
    pillar: "...",
    status: "stub",
    spec: "...",
    evidenceSource: "...",
    stubSpec: "What the real gate would do.",
  },
},
```

The framework auto-registers all stubs at import time. No additional plumbing needed.

## What NOT to do

- ❌ Don\'t add raw values. Use env vars or config.
- ❌ Don\'t add secrets. The framework is open-source; secrets don\'t belong.
- ❌ Don\'t add "tracked" / "in progress" / "scheduled" output. Per PHILOSOPHY §1, only "pass" / "fail" / "not-implemented".
- ❌ Don\'t add console.log. Use the audit log.
- ❌ Don\'t add shared credentials. The framework runs as the agent\'s identity.

## Review checklist

Before opening a PR for a new gate:

- [ ] The gate function is `async (target, agent) => Promise<GateOutput>`
- [ ] The control is registered via `registerGate(CONTROL, run)`
- [ ] The control ID matches the regulatory anchor
- [ ] The pillar is correct (one of the 5)
- [ ] The status is correct (`implemented` for real gates, `stub` for documented-but-not-built)
- [ ] The spec describes what the control verifies
- [ ] The evidence is real (file paths, git refs, env vars)
- [ ] The remediation is actionable
- [ ] The test file has 3+ cases: pass, fail, registered
- [ ] The gate passes `npm run verify` (typecheck + lint + test)
- [ ] CONTROL-MAP.md is updated
