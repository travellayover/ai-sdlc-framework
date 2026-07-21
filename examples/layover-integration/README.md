# layover.ing integration example

This directory shows how [layover.ing](https://layover.ing) uses
the AI-SDLC Framework as a blocking-on-merge CI check.

## Files

- `ai-sdlc.yml` — the GitHub Actions workflow

## How it works

Every pull request to layover.ing triggers the workflow:

1. **Checkout** with full git history (so the audit log can be written)
2. **Setup Node.js 20** with npm cache
3. **Install dependencies** (`npm ci`)
4. **Run ai-sdlc-framework**:
   - `npx ai-sdlc init --target .` initializes the framework
   - `npx ai-sdlc run --target . --output .ai-sdlc --min-score 10` runs all gates
   - The `--min-score 10` flag makes the workflow fail if TrustScore drops below 10
5. **Upload report** as a workflow artifact (30-day retention)

The `min-score 10` is the v0.1.1 default. As the framework implements
more controls, layover.ing can raise the threshold to 30, 50, etc.

## Expected output

The first run will fail because layover.ing has real audit findings
(CC6.1: 47 direct commits on master; A.5.2: no AI policy; CC8.1:
no PR template). The workflow output will list each finding with
a remediation. Each fix raises the TrustScore.

## Target

The v0.1.1 integration target is `min-score: 10` (the current
layover.ing score). The v0.2 target is `min-score: 30` (after
the 6 additional controls in v0.2 ship). The v0.3 target is
`min-score: 50`. The v1.0 target is `min-score: 100` (or "honestly
absent" for non-applicable controls).

## Why integration matters

Per the framework's BACKLOG.md, the integration is one of 4 layers:

| Layer | Target | Description |
|---|---|---|
| 1 | v0.1.0 (shipped) | Read-only: `npx ai-sdlc run` produces a report |
| 2 | v0.1.1 (this lane) | Blocking-on-merge: PR fails if TrustScore < target |
| 3 | v0.2 | Blocking-on-deploy: Vercel deploy fails if TrustScore < target |
| 4 | v0.3+ | Full governance: every commit, every PR, every deploy audited |

Layer 2 is the first real governance step: every PR either passes
the framework or doesn't merge. This catches the 70+ P0 production
bugs that the framework can detect before they ship.
