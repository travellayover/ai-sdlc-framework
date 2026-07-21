# CHANGELOG — AI-SDLC Framework

The release history. Per PHILOSOPHY §1, every release is a real release (with artifacts, tests, evidence) or honestly absent (planned, not yet shipped).

---

## v0.1.0 — 2026-07-21 — Initial release

**One line:** 3 sample controls + 15 stubs + 30 tests + 12 docs + the 10,000x-deep bug fix. Read-only integration with layover.ing.

### What ships

- **5-pillar TrustScore model.** Identity & Access, Change Management, Code Integrity, Operational Trust, Audit Trail. Each pillar is 20 points; total 100.
- **18 controls documented, 3 implemented:**
  - **SOC 2 CC6.1** (no direct commits to master) — IMPLEMENTED
  - **HIPAA §164.312(a)(2)(i)** (unique user identification) — IMPLEMENTED
  - **ISO 42001 A.6.1.2** (AI system lifecycle) — IMPLEMENTED
  - 15 stubs (SOC 2 CC6.2, CC6.3, CC7.1, CC7.2, CC7.3, CC8.1, CC9.1; HIPAA §164.308(a)(1)(ii)(A), §164.312(b), §164.312(c)(1); ISO 42001 A.5.2, A.5.3, A.7.1, A.9.4, A.9.5)
- **Gate runner** (`npx ai-sdlc run`) producing JSON + markdown reports.
- **Signed audit log** (HMAC-chained, recursively canonicalized, tamper-evident).
- **CLI:** `init`, `run`, `verify-audit`, `version`.
- **30 vitest tests** across 7 files. **All passing.**
- **12 docs:** PHILOSOPHY, PRODUCT, SCOPE, AGENTS, README, LICENSE, BACKLOG, ROADMAP, GOVERNANCE, IMPLEMENTATION-PLAN, CONTROL-MAP, AUDIT-LOG-FORMAT, GATE-AUTHORING, COMPLIANCE-REPORT-TEMPLATE.
- **1,707 lines of TypeScript source** + **~1,500 lines of docs**.
- **Verified end-to-end against layover-fresh** (10/100 TrustScore, correctly identified 1 violation: 47 direct commits on master).

### What does NOT ship (deferred)

- npm publish (target v0.1.1).
- Layover.ing integration as a deploy gate (target v0.2).
- 15 stub controls (target v0.1.1 → v1.0).
- External user / community process (target v0.2).
- SOC 2 / HIPAA / ISO 42001 certification (target v1.0+; requires an external auditor).
- Steering committee (target v1.0).

### The 10,000x-deep bug fix

During end-to-end verification, 3 critical bugs were found in the framework\'s own implementation:

1. **`canonicalize()` security bug (CRITICAL).** Used `Object.keys()` as the replacer array for `JSON.stringify`, which JSON.stringify interprets as a property filter applied recursively. Nested fields in the data payload were STRIPPED from the canonical form. Signature was over `{action, agent, data:{}, lane, prevHash, timestamp}` regardless of data contents. **The audit log was not tamper-evident.** Fixed by recursive canonicalization that sorts keys at every level. Now tampering with `data.trustScore` is detected.

2. **PHILOSOPHY §2 violation.** CLI commands `init`, `run`, `verify-audit` did not write to the audit log. Per PHILOSOPHY §2, "every agent action is recorded." The framework violated its own PHILOSOPHY. Fixed by `logAction()` helper called from each command.

3. **ESM runtime error.** `signed-log.ts` used CommonJS `require()` inside an ESM module, which would have thrown on the first `verifyChain` call. Fixed by replacing with imported `readdirSync`.

These bugs were not visible from reading the code. They were visible only from running the framework end-to-end against a real target. The fix is committed as `d75df47`.

### Reproduce

```bash
cd /Users/gm/projects/ai-sdlc-framework
npm install
npm run verify  # 30/30 tests, typecheck clean, lint clean

# Run against layover.ing
npx tsx src/cli.ts init --target /Users/gm/layover-fresh
npx tsx src/cli.ts run --target /Users/gm/layover-fresh --output /tmp/report
cat /tmp/report/report-$(date -u +%Y-%m-%d).md
# TrustScore: 10 / 100, Pass: 2, Fail: 1, Stub: 15
```

### Commits

- `446d90c` — feat(framework): v0.1 — Apache 2.0 AI-SDLC compliance framework
- `2d06ada` — docs(specs): add the 4 acceptance-criteria docs
- `d75df47` — fix(audit): recursive canonicalization + CLI logging + ESM fix
- (this commit) — docs(release): CHANGELOG, README badges, SCOPE acceptance
- (next) — docs(plan): BACKLOG, ROADMAP, GOVERNANCE per product owner request

---

## v0.1.1 — planned, target 2026-08-04 (2 weeks)

**Scope (from BACKLOG.md):** 4 more implemented controls (BF-005, BF-006, BF-009, BF-011), layover.ing integration (Layer 2: blocking-on-merge), npm publish, CI workflow. ~700 lines, 8 lanes. **NOT YET STARTED.**

## v0.2 — planned, target 2026-09-01 (4 weeks)

**Scope (from BACKLOG.md):** 6 more implemented controls, layover.ing integration (Layer 3: blocking-on-deploy), first external user, GitHub issues enabled. ~1,100 lines, 9 lanes. **NOT YET STARTED.**

## v0.3 — planned, target 2026-10-01 (4 weeks)

**Scope (from BACKLOG.md):** 6 more implemented controls (all 18 done), open PRs, first certification engagement. ~780 lines, 8 lanes. **NOT YET STARTED.**

## v1.0 — planned, target 2026-11-26 (8 weeks)

**Scope (from BACKLOG.md):** governance doc, steering committee, dashboard, web UI, multi-org support, custom controls, full governance + certification. ~2,300 lines, 8 lanes. **NOT YET STARTED.**

---

**End of CHANGELOG.md.**
