# AI-SDLC Framework — Implementation Plan

**Status:** v0.1 implementation plan · **Date:** 2026-07-21 · **Reference implementation:** layover.ing

**This document explains how the AI-SDLC Framework is built AND how it governs layover.ing's v0.1 → v1.0-rc1 build.** The framework and the product ship together. The framework is validated by being the tool that produces layover.ing.

**The single sentence (PHILOSOPHY):** *Every compliance assertion is a real assertion, signed and traceable, or honestly absent.* The trust contract.

---

## 1. The thesis

Layover.ing already has 80% of what the AI-SDLC Framework describes:

| Framework requirement | Layover.ing has it? | Where |
|---|---|---|
| Single governing philosophy | ✓ | `PHILOSOPHY.md` ("real or honestly absent") |
| Component rules enforced by agents | ✓ | `AGENTS.md` (10 rules) |
| Gate scripts that enforce the rules | ✓ (partial) | `scripts/check-*.mjs` (15 scripts, 4-5 enforce 4-5 of 10 rules) |
| Lane protocol (one worktree per change) | ✓ | `docs/LANES.md` + `docs/GOVERNANCE.md` |
| Document precedence (which doc wins) | ✓ | `docs/CONTRACT-MATRIX.md` |
| Single source of truth IDs (B-IDs, audit batches) | ✓ | `docs/BACKLOG.md`, `docs/AUDIT-0.1-to-1.0.md` |
| Audit trail of decisions | partial | `git log` + `docs/LANES.md`, but not signed |
| Explicit mapping to SOC 2 / HIPAA / ISO 42001 | ✗ | missing |
| Signed agent actions | ✗ | missing |
| Append-only audit log | ✗ | missing |
| Per-control evidence collection | ✗ | missing |
| External-auditor-friendly reports | ✗ | missing |

**The framework is the 20% that lays on top of the existing 80%.** It doesn't replace layover.ing's conventions — it documents them, signs them, maps them to compliance controls, and produces the audit artifacts.

---

## 2. The 5-pillar model (the framework's "score")

Just as layover.ing has a 4-pillar LayoverScore, the AI-SDLC Framework has a 5-pillar TrustScore. Each pillar maps to a regulatory domain:

| Pillar | Weight | Regulatory anchor | Layover.ing artifact |
|---|---|---|---|
| 1. Identity & Access | 20% | SOC 2 CC6.x, ISO 42001 A.5 | Bot identity `git -c user.name=layover-bot`, no direct master commits, lane protocol |
| 2. Change Management | 20% | SOC 2 CC8.x, ISO 42001 A.6 | `docs/SDLC.md`, lane protocol, PR review by gate lane |
| 3. Code Integrity | 20% | SOC 2 CC7.x, ISO 42001 A.8 | `scripts/check-v11-rules.mjs`, `scripts/check-no-monolith.mjs`, `scripts/check-v11-icons.mjs` |
| 4. Operational Trust | 20% | SOC 2 CC9.x, ISO 42001 A.7 | `scripts/check-secrets.mjs`, env-var handling, `vercel.json` deploy budget |
| 5. Audit Trail | 20% | HIPAA §164.312(b), ISO 42001 A.9 | `git log`, `docs/LANES.md`, `docs/BACKLOG.md` (no signing yet) |

Each pillar has 3-5 sub-controls. The framework ships 3 sample sub-controls per pillar in v0.1 (15 total). The full set is added incrementally.

---

## 3. v0.1 scope (what ships in 2 weeks)

Per SCOPE-first philosophy (mirroring layover.ing):

**In v0.1 (MUST ship):**
1. The framework core: 5-pillar score + control map + gate runner
2. **3 sample controls** fully implemented: 1 SOC 2 (CC6.1 logical access), 1 HIPAA (§164.312(a)(2)(i) unique user identification), 1 ISO 42001 (A.6.1.2 AI system lifecycle)
3. **Audit log spec + signed entry** — every agent action gets a signed log entry
4. **Gate runner** — runs all enabled gates, produces a compliance report (JSON + markdown)
5. **Reference implementation on layover.ing** — the framework's first 3 controls are wired to layover.ing's existing gate scripts (`check-v11-rules.mjs`, `check-secrets.mjs`, `check-no-monolith.mjs`) as the evidence source

**In v0.1.1 (next 2 weeks):**
6. Add 3 more SOC 2 controls (CC7.1, CC8.1, CC9.2)
7. Add 3 more HIPAA controls (§164.308(a)(1)(ii)(A), §164.308(a)(5)(ii)(D), §164.312(c)(1))
8. Add 3 more ISO 42001 controls (A.5.2, A.8.1, A.9.4)
9. Layover.ing's full v1.0-rc1 build under framework governance (the 35 lanes in the 10000X plan)

**OUT of scope for v0.1:**
- Full SOC 2 / HIPAA / ISO 42001 certification (requires external auditor)
- Integration with all CI providers (GitHub Actions only in v0.1; GitLab, Jenkins, etc. later)
- Non-AI-coding-agent compliance (the framework targets AI coding agents specifically)
- Multi-tenant governance (v0.1 is single-team, single-product)
- Real-time compliance dashboard (v0.1 produces reports, not dashboards)
- ML model governance (ISO 42001 also covers ML models; v0.1 covers code agents only)

---

## 4. The 15 sample controls (5 per pillar, 3 fully implemented in v0.1)

### Pillar 1: Identity & Access (SOC 2 CC6.x, ISO 42001 A.5)

| # | Control | Spec | Implementation | Layover.ing evidence |
|---|---|---|---|---|
| 1.1 | Unique agent identity | Every agent action attributed to a named identity (not "admin" or "system") | `src/identity/agent.ts` (signs every action with a per-agent key) | `git log --format='%an <%ae>'` — should be 1-3 named agents, not "system" |
| 1.2 | No shared credentials | No "service account" or "team token" usage | `src/identity/no-shared-creds.ts` (scans for known shared-cred patterns in .env*, .github/) | `.env*` is gitignored; `secrets.mjs` scans for AWS_*, GH_TOKEN, etc. |
| 1.3 | **SOC 2 CC6.1 (sample 1)** | Logical access restricted to authorized agents | gate scans for direct-to-master commits, lane protocol violations | `git log origin/master` should only show merges from PRs, never direct pushes |
| 1.4 | Agent key rotation | Agent identity keys rotated every 90 days | `src/identity/rotation.ts` (checks key age, fails gate if >90d) | not yet implemented in layover.ing |
| 1.5 | Privilege escalation logging | Any "elevated" agent action (e.g., merge to master) is logged with reason | `src/identity/elevation.ts` (requires an elevation reason field on merge commits) | not yet implemented in layover.ing |

### Pillar 2: Change Management (SOC 2 CC8.x, ISO 42001 A.6)

| # | Control | Spec | Implementation | Layover.ing evidence |
|---|---|---|---|---|
| 2.1 | All changes via PR | No direct-to-master, all changes go through a PR | `src/cm/pr-only.ts` (git log scan) | `docs/GOVERNANCE.md` + lane protocol |
| 2.2 | PR review required | Every PR reviewed before merge (no self-merge) | `src/cm/review.ts` (checks PR has at least 1 review approval) | gate lane review (per multi-agent workflow) |
| 2.3 | Change traceability | Every change is linked to a B-ID / audit-batch / issue | `src/cm/traceability.ts` (parses PR body for ID) | `check-backlog.mjs` enforces |
| 2.4 | **ISO 42001 A.6.1.2 (sample 2)** | AI system lifecycle documented (design → dev → test → deploy → monitor) | `src/cm/lifecycle.ts` (checks for design doc, test plan, deploy script) | `docs/0.1-ROADMAP.md` (F0-F8) |
| 2.5 | Rollback plan | Every change has a documented rollback | `src/cm/rollback.ts` (checks PR body for rollback section) | not yet implemented in layover.ing |

### Pillar 3: Code Integrity (SOC 2 CC7.x, ISO 42001 A.8)

| # | Control | Spec | Implementation | Layover.ing evidence |
|---|---|---|---|---|
| 3.1 | Lint passes on every commit | No commits that fail lint | `src/ci/lint.ts` (runs the project's lint command) | `scripts/check-v11-rules.mjs` |
| 3.2 | Type check passes on every commit | No commits that fail tsc | `src/ci/typecheck.ts` (runs tsc) | `tsconfig.json` strict mode |
| 3.3 | No secrets in code | No AWS keys, API tokens, etc. committed | `src/ci/secrets.ts` (gitleaks-style scan) | `scripts/check-secrets.mjs` |
| 3.4 | **HIPAA §164.312(a)(2)(i) (sample 3)** | Unique user identification | every commit has a real user/email, no "admin@" or "root@" | gate scans `git log --format='%ae'` |
| 3.5 | Dependencies pinned | package-lock.json committed, no floating versions | `src/ci/dependencies.ts` (npm ci runs cleanly) | `package-lock.json` present |

### Pillar 4: Operational Trust (SOC 2 CC9.x, ISO 42001 A.7)

| # | Control | Spec | Implementation | Layover.ing evidence |
|---|---|---|---|---|
| 4.1 | Secrets via env, not code | No .env in git, all secrets in env vars | `src/ops/env.ts` (verifies .env* is gitignored) | `.gitignore` |
| 4.2 | Deploy budget respected | No `npm run deploy` style manual deploys | `src/ops/deploy.ts` (verifies `[deploy]` tag on commits) | `scripts/vercel-should-build.mjs` |
| 4.3 | Error monitoring | All API routes log errors, no silent failures | `src/ops/errors.ts` (scans for empty catch blocks) | partial — `app/api/*/route.ts` |
| 4.4 | Rate limiting | All public APIs rate-limited | `src/ops/rate-limit.ts` (verifies rate-limit middleware) | `lib/rate-limit/upstash.ts` |
| 4.5 | Data backup | Production data backed up | out of scope for layover.ing (no prod data) | n/a |

### Pillar 5: Audit Trail (HIPAA §164.312(b), ISO 42001 A.9)

| # | Control | Spec | Implementation | Layover.ing evidence |
|---|---|---|---|---|
| 5.1 | All agent actions logged | Every commit, PR, review, deploy logged | `src/audit/agent-actions.ts` (uses git log + PR API) | `git log` is the de facto log |
| 5.2 | Log integrity | Logs are append-only, signed | `src/audit/signed-log.ts` (HMAC chain, detects tampering) | not yet implemented |
| 5.3 | Log retention | Logs retained for 6+ years (HIPAA requirement) | `src/audit/retention.ts` (verifies git history not force-pushed) | `master` is force-push-protected |
| 5.4 | Reviewer attribution | Every review is attributed to a real person | `src/audit/reviewer.ts` (parses PR review metadata) | not yet implemented |
| 5.5 | Decision rationale | Every merge includes a "why" | `src/audit/rationale.ts` (parses PR body for rationale section) | not yet implemented |

**In v0.1, the 3 sample controls (1.3, 2.4, 3.4) are fully implemented.** The other 12 are documented in the control map and stub-implemented (returns "not yet implemented" honestly per PHILOSOPHY §1).

---

## 5. The audit log spec

The framework introduces a new artifact: the **signed audit log**. Every layover.ing agent action produces a signed log entry. The log is append-only, chain-hashed, and tamper-evident.

**Format (one line per action):**

```
2026-07-21T15:20:00Z | lane=feat-verify-pipeline | agent=layover-bot | action=commit | sha=b3bc091 | message="feat(verify): add next build to verify pipeline" | signed=hmac-sha256:abc123
```

**Chain hash:** each entry's `signed` field includes the previous entry's `signed` field. Tampering with any entry invalidates the chain.

**Storage:** in `audit/YYYY-MM-DD.log` (one file per day, immutable after 24h).

**Verification:** the framework provides a `verify-audit-log` command that walks the chain and reports the first tampered entry (if any).

**In v0.1, the audit log is added to layover.ing via a post-commit hook.** Every commit, every lane claim, every [deploy] tag gets a signed entry.

---

## 6. The gate runner

A single command runs all enabled gates and produces a compliance report:

```
$ npx ai-sdlc run --target /Users/gm/layover-fresh
```

Output:
- Console: pass/fail per gate, with the evidence (file path, line number, etc.)
- JSON: `.ai-sdlc/report-YYYY-MM-DD.json` (machine-readable for CI)
- Markdown: `.ai-sdlc/report-YYYY-MM-DD.md` (human-readable for review)

The report has 3 sections per gate:
1. **What it checks** (the spec)
2. **What it found** (the evidence)
3. **What to do if it failed** (the remediation)

A failed gate blocks the action. The framework's gate runner is integrated into layover.ing's `npm run verify` so the same command runs the project's gates and the framework's gates.

---

## 7. How this implements layover.ing as a product (the 35-lane plan)

The 10000X master plan has 35 lanes across 6 phases. The AI-SDLC Framework adds:

**Phase 0 (4 lanes, the critical P0 fixes):**
- Each of the 4 lanes is run through the framework's gate runner before merge
- The audit log captures the commit, the rationale, the reviewer
- The 3 sample controls (1.3, 2.4, 3.4) are enforced on each lane

**Phase 1-3 (20 lanes, the per-surface fixes):**
- Each lane is run through the framework
- The 3 sample controls plus the 12 stub controls report "not yet implemented" honestly
- The framework's TrustScore is computed per phase; layover.ing's v0.1.1 should score 60-70% (3 of 15 controls fully implemented)

**Phase 4 (5 WIP cleanup sub-lanes):**
- Each sub-lane runs through the framework
- The 36 WIP issues are categorized: which ones are framework violations (e.g., untracked commit = Audit Trail 5.1 violation), which are project-specific (e.g., fabricated "12,000+" = PHILOSOPHY §1 violation)

**Phase 5 (4 hygiene lanes):**
- The framework's gate runner becomes a permanent part of layover.ing's `npm run verify`
- The 12 stub controls are activated incrementally
- The audit log is wired to a Vercel function for production monitoring

**Phase 6 (1 adapter fix, gated on KIWI_API_KEY):**
- The framework's Pillar 4 (Operational Trust) gates the API key set
- The audit log captures the key set + the deploy + the first search result

**By the end of Phase 6, layover.ing ships v1.0-rc1 with:**
- The framework's TrustScore at ~85% (12 of 15 controls fully implemented)
- A signed audit log covering 100% of agent actions since the framework was added
- A compliance report that an external auditor can read

**The framework is the artifact that makes layover.ing certifiable.** It doesn't replace SOC 2 certification; it produces the artifacts a certifier would review.

---

## 8. The file layout

```
ai-sdlc-framework/
├── LICENSE                              # Apache 2.0
├── README.md
├── PHILOSOPHY.md                        # "Every compliance assertion is real, signed, and traceable, or honestly absent."
├── PRODUCT.md                           # What this is, who it's for
├── SCOPE.md                             # What's in v0.1, what's out
├── AGENTS.md                            # The cheatsheet for AI agents
├── package.json
├── tsconfig.json
├── src/
│   ├── runner/
│   │   ├── index.ts                     # Main entry: `npx ai-sdlc run`
│   │   ├── report.ts                    # JSON + markdown report writers
│   │   └── config.ts                    # Loads .ai-sdlc/config.json
│   ├── gates/
│   │   ├── index.ts                     # Gate registry
│   │   ├── soc2/
│   │   │   └── cc6.1-logical-access.ts  # Sample 1: no direct-to-master
│   │   ├── hipaa/
│   │   │   └── 164.312a2i-unique-user.ts  # Sample 3: every commit has a real user
│   │   └── iso42001/
│   │       └── a.6.1.2-lifecycle.ts     # Sample 2: AI lifecycle documented
│   ├── audit/
│   │   ├── signed-log.ts                # HMAC-chained append-only log
│   │   ├── entry.ts                     # AuditEntry type
│   │   └── verify.ts                    # `npx ai-sdlc verify-audit`
│   ├── identity/
│   │   ├── agent.ts                     # Per-agent identity + key
│   │   └── detect.ts                    # Detect agent identity from env
│   └── types/
│       ├── control.ts                   # Control definition
│       ├── pillar.ts                    # 5 pillars
│       └── report.ts                    # Report types
├── controls/
│   ├── soc2/CC6.1-logical-access.json   # The 15 controls
│   ├── soc2/CC7.1-*.json
│   ├── hipaa/164.312a2i-*.json
│   ├── iso42001/A.6.1.2-*.json
│   └── (12 stub controls in v0.1)
├── tests/
│   ├── runner.test.ts
│   ├── audit.test.ts
│   ├── gates/soc2/cc6.1.test.ts
│   ├── gates/hipaa/164.312a2i.test.ts
│   └── gates/iso42001/a.6.1.2.test.ts
├── examples/
│   └── layover.ing/                     # Reference implementation: layover.ing
│       ├── .ai-sdlc/config.json         # The framework config for layover.ing
│       ├── audit/                       # The audit log destination
│       └── README.md                    # How layover.ing uses the framework
└── docs/
    ├── CONTROL-MAP.md                   # The 15-control map
    ├── AUDIT-LOG-FORMAT.md              # The signed log spec
    ├── GATE-AUTHORING.md                # How to write a new gate
    └── COMPLIANCE-REPORT-TEMPLATE.md    # The report format
```

---

## 9. The build order (2 weeks)

**Day 1-2: Foundation**
- LICENSE, README, PHILOSOPHY, PRODUCT, SCOPE, AGENTS
- package.json, tsconfig.json, vitest config
- src/types (Pillar, Control, Report)
- src/runner/index.ts (skeleton)

**Day 3-4: Audit log + identity**
- src/audit/signed-log.ts (HMAC chain)
- src/audit/entry.ts, verify.ts
- src/identity/agent.ts, detect.ts
- Tests for audit log

**Day 5-6: Gates (3 sample + 12 stubs)**
- src/gates/soc2/cc6.1-logical-access.ts (real)
- src/gates/hipaa/164.312a2i-unique-user.ts (real)
- src/gates/iso42001/a.6.1.2-lifecycle.ts (real)
- 12 stub controls returning "not yet implemented" honestly
- Tests for each gate

**Day 7-8: Gate runner + report**
- src/runner/index.ts (full implementation)
- src/runner/report.ts (JSON + markdown)
- src/runner/config.ts
- Tests for runner

**Day 9-10: Reference implementation (layover.ing)**
- examples/layover.ing/.ai-sdlc/config.json
- examples/layover.ing/README.md (how layover.ing uses the framework)
- The 3 sample gates wired to layover.ing's existing artifacts
- End-to-end test: `npx ai-sdlc run --target /Users/gm/layover-fresh`

**Day 11-12: Audit log integration + docs**
- examples/layover.ing/audit/ wired to a post-commit hook
- docs/CONTROL-MAP.md, AUDIT-LOG-FORMAT.md, GATE-AUTHORING.md, COMPLIANCE-REPORT-TEMPLATE.md
- v0.1 release prep: tag, changelog, npm publish

**Day 13-14: v0.1 release + first layover.ing v0.1.1 lane**
- v0.1 of the framework ships
- First layover.ing v0.1.1 lane (the `lane/fix-verify-pipeline` from the 10000X plan) runs under the framework
- v0.1.1 ships layover.ing with 1 of 35 lanes complete, with the framework as the governance tool

---

## 10. What you get at the end of v0.1

**Code:** an Apache 2.0 framework, ~1,500-2,000 lines of TypeScript, 5-pillar score, 3 sample gates, 12 stub gates, gate runner, signed audit log, vitest suite.

**Docs:** PHILOSOPHY, PRODUCT, SCOPE, AGENTS, CONTROL-MAP, AUDIT-LOG-FORMAT, GATE-AUTHORING, COMPLIANCE-REPORT-TEMPLATE.

**Reference implementation:** layover.ing v0.1.1 ships with 1 of 35 lanes under framework governance. The framework's TrustScore is reported for layover.ing.

**Audit artifact:** the signed audit log covers 100% of agent actions since the framework was added. An external auditor can read it.

**Certifiability:** layover.ing is NOT yet SOC 2 / HIPAA / ISO 42001 certified (requires external auditor). But the artifacts are in place to start that process.

---

## 11. Open questions for you

1. **The framework name** — "AI-SDLC Framework" is what you said. I'll use that as the project name. OK?

2. **License** — Apache 2.0, per your description. OK?

3. **Reference implementation** — layover.ing, per this plan. OK, or do you want a different reference implementation?

4. **v0.1 sample controls** — 1 SOC 2 + 1 HIPAA + 1 ISO 42001, as proposed. OK, or do you want all 3 from one framework (e.g., all 3 SOC 2)?

5. **The audit log destination** — `audit/YYYY-MM-DD.log` in the project, proposed. Or do you want a remote service (S3, GitHub Gist, etc.) for tamper-evidence?

6. **The first layover.ing lane to run under the framework** — `lane/fix-verify-pipeline` (Phase 0 #1) is the highest-leverage. OK, or different?

7. **The 12 stub controls** — return "not yet implemented" honestly per PHILOSOPHY §1, as proposed. Or do you want them all stubbed-but-active (so the report shows "fails" not "not implemented")?

These 7 questions block the build. My recommendations: yes/yes/yes/yes/yes/yes/yes (i.e., build it as described).

---

**End of implementation plan v0.1.**
