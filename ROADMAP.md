# ROADMAP — AI-SDLC Framework

The time-phased plan from v0.1.0 (shipped) to v1.0 (production-ready governance). Per the framework\'s own contract matrix, this is the precedence-6 doc. It sits after BACKLOG (precedence-4) and before LANES (precedence-7).

Each phase has: scope, lanes, exit criteria, risk, and a one-line summary.

---

## v0.1.0 (shipped 2026-07-21)

**One line:** 3 sample controls + 15 stubs + 30 tests + 9 docs + the 10,000x-deep bug fix. Read-only integration with layover.ing.

**Scope:**
- 5-pillar TrustScore model
- 18 controls: 3 implemented (SOC 2 CC6.1, HIPAA §164.312(a)(2)(i), ISO 42001 A.6.1.2) + 15 stubs
- Gate runner (`npx ai-sdlc run`) with JSON + markdown reports
- Signed audit log (HMAC-chained, tamper-evident, recursively canonicalized)
- CLI: `init`, `run`, `verify-audit`, `version`
- 30 vitest tests across 7 files
- 9 docs: PHILOSOPHY, PRODUCT, SCOPE, AGENTS, README, LICENSE, BACKLOG, IMPLEMENTATION-PLAN, CONTROL-MAP, AUDIT-LOG-FORMAT, GATE-AUTHORING, COMPLIANCE-REPORT-TEMPLATE
- Verified end-to-end against layover-fresh (10/100 TrustScore, correctly identified 1 violation)

**Exit criteria:** all 12 SCOPE acceptance criteria met. Verified.

**Risk:** none. Released.

---

## v0.1.1 (next, 2 weeks, target 2026-08-04)

**One line:** 4 more implemented controls, layover.ing integration (Layer 2: blocking-on-merge), npm publish, CI workflow.

**Scope:**

| Lane | What | Size | Critical |
|---|---|---|---|
| `lane/bf-005-audit-controls` | Implement HIPAA §164.312(b) — verify framework\'s own audit log is in use (dogfooding) | ~150 lines | YES |
| `lane/bf-006-change-management` | Implement SOC 2 CC8.1 — verify PR template + reviewer | ~150 lines | YES |
| `lane/bf-011-ai-policy` | Implement ISO 42001 A.5.2 — verify a signed AI policy exists | ~100 lines | no |
| `lane/bf-009-segregation-of-duties` | Implement ISO 42001 A.5.3 — verify distinct agents for write/review/deploy | ~100 lines | no |
| `lane/layover-integration` | Wire framework into layover.ing\'s CI: GitHub Action runs `ai-sdlc run` on every PR, blocks on TrustScore < 10 | ~80 lines | YES |
| `lane/npm-publish` | Publish to npm as `ai-sdlc-framework` v0.1.1 | ~20 lines | YES |
| `lane/ci-workflow` | CI workflow: typecheck + lint + test on every commit to master, blocks merge on fail | ~50 lines | YES |
| `lane/bf-005-doc-update` | Update CONTROL-MAP, BACKLOG, README to reflect v0.1.1 | ~50 lines | no |

**Total:** ~700 lines, 8 lanes, 2 weeks.

**Exit criteria:**
- TrustScore for layover-fresh ≥ 30/100 (was 10/100 in v0.1.0)
- npm package published, `npm install -g ai-sdlc-framework` works
- CI workflow green on the framework\'s own master
- GitHub Action green on a sample layover.ing PR
- 40+ vitest tests pass
- All 8 SCOPE v0.1.1 acceptance criteria met

**Risk:**
- Medium: GitHub Action integration touches layover.ing\'s CI. Could break the build if misconfigured.
- Low: npm publish is one-time; if it fails, fix and retry.
- Low: CI workflow is well-trodden (GitHub Actions docs are exhaustive).

**Out of scope (deferred to v0.2):**
- npm package usage tracking
- Multi-org support
- Real-time dashboard
- Custom control authoring
- Override / waiver mechanism

---

## v0.2 (4 weeks after v0.1.1, target 2026-09-01)

**One line:** 6 more implemented controls, layover.ing integration (Layer 3: blocking-on-deploy), first external user, GitHub issues enabled.

**Scope:**

| Lane | What | Size | Critical |
|---|---|---|---|
| `lane/bf-004-system-monitoring` | Implement SOC 2 CC7.1 — verify log infrastructure, retention, integrity | ~200 lines | YES |
| `lane/bf-010-risk-analysis` | Implement HIPAA §164.308(a)(1)(ii)(A) — verify periodic risk analysis | ~150 lines | YES |
| `lane/bf-007-prior-authorization` | Implement SOC 2 CC6.2 — audit log access-grant entries | ~150 lines | no |
| `lane/bf-008-access-removal` | Implement SOC 2 CC6.3 — identity registry | ~150 lines | no |
| `lane/bf-013-anomaly-detection` | Implement SOC 2 CC7.2 — CI rule for unusual agent activity | ~150 lines | no |
| `lane/bf-014-risk-mitigation` | Implement SOC 2 CC9.1 — risk register | ~150 lines | no |
| `lane/layover-deploy-hook` | Vercel deploy hook runs `ai-sdlc run`, blocks deploy on TrustScore < 50 | ~80 lines | YES |
| `lane/github-issues-enabled` | Enable GitHub issues, add issue templates, link to BACKLOG | ~30 lines | no |
| `lane/bf-005-doc-update-v0.2` | Update CONTROL-MAP, BACKLOG, README to reflect v0.2 | ~50 lines | no |

**Total:** ~1,100 lines, 9 lanes, 4 weeks.

**Exit criteria:**
- TrustScore for layover-fresh ≥ 50/100 (was 30/100 in v0.1.1)
- 9 of 18 controls implemented (50%)
- Vercel deploy hook active, blocks deploys that regress TrustScore
- GitHub issues enabled, first external issue filed
- 60+ vitest tests pass
- All 8 SCOPE v0.2 acceptance criteria met

**Risk:**
- Medium: 6 new control implementations; each has a real gate that must work end-to-end.
- Medium: Vercel deploy hook is irreversible; misconfiguration could break deploys.
- Low: GitHub issues are well-documented.

**Out of scope (deferred to v0.3):**
- Open PRs from external contributors
- Multi-org support
- Real-time dashboard
- Custom control authoring

---

## v0.3 (4 weeks after v0.2, target 2026-10-01)

**One line:** 6 more implemented controls (all 18 done), open PRs, first certification attempt.

**Scope:**

| Lane | What | Size | Critical |
|---|---|---|---|
| `lane/bf-012-integrity` | Implement HIPAA §164.312(c)(1) — SHA-256 checksums | ~150 lines | no |
| `lane/bf-015-operational-planning` | Implement ISO 42001 A.7.1 — operational runbook | ~100 lines | no |
| `lane/bf-016-monitoring-review` | Implement ISO 42001 A.9.4 — TrustScore trends over time | ~150 lines | YES |
| `lane/bf-017-record-retention` | Implement ISO 42001 A.9.5 — 6+ year retention | ~100 lines | no |
| `lane/bf-018-incident-detection` | Implement SOC 2 CC7.3 — incident response plan | ~150 lines | no |
| `lane/open-prs-enabled` | Enable GitHub PRs, add PR template, add CODEOWNERS, set up gate lane | ~80 lines | YES |
| `lane/first-certification` | Engage an external auditor for SOC 2 Type II readiness assessment | external | YES |
| `lane/v0.3-doc-update` | Update CONTROL-MAP, BACKLOG, README to reflect v0.3 | ~50 lines | no |

**Total:** ~780 lines, 8 lanes, 4 weeks.

**Exit criteria:**
- All 18 controls implemented (100%)
- TrustScore for layover-fresh = 100/100 (or honest absence for non-applicable controls)
- GitHub PRs enabled, first external PR reviewed
- SOC 2 Type II readiness assessment received (the auditor\'s report, even if not yet certified)
- 90+ vitest tests pass
- All 8 SCOPE v0.3 acceptance criteria met

**Risk:**
- Medium: First certification attempt is a real external engagement. The auditor will find things. The framework must be honest about gaps.
- Medium: Open PRs means external contributors. The gate lane must be reliable.

**Out of scope (deferred to v1.0):**
- Multi-org governance
- Steering committee
- Real-time dashboard
- Web UI

---

## v1.0 (8 weeks after v0.3, target 2026-11-26)

**One line:** full audit + governance + dashboard + certifiable.

**Scope:**

| Lane | What | Size | Critical |
|---|---|---|---|
| `lane/governance-doc` | Publish `GOVERNANCE.md` — the framework\'s own precedence ladder, the steering committee model | ~200 lines | YES |
| `lane/steering-committee` | Recruit 1-3 humans (the user + 1-2 outside reviewers) to the steering committee | external | YES |
| `lane/dashboard` | Real-time TrustScore dashboard (web UI) | ~500 lines | no |
| `lane/web-ui` | `npx ai-sdlc ui` — a local web UI for the report | ~500 lines | no |
| `lane/multi-org` | Support multiple orgs in one installation | ~300 lines | no |
| `lane/custom-controls` | User-defined controls (YAML) | ~400 lines | no |
| `lane/v1.0-release` | v1.0 release prep, full docs pass, security audit, governance review | ~200 lines | YES |
| `lane/v1.0-doc-update` | Update all docs to v1.0 | ~200 lines | no |

**Total:** ~2,300 lines, 8 lanes, 8 weeks.

**Exit criteria:**
- All 18 controls implemented + at least 6 user-defined controls
- Multi-org support
- Dashboard + web UI
- Steering committee in place
- SOC 2 Type II certification achieved (per the auditor)
- 120+ vitest tests pass
- All 8 SCOPE v1.0 acceptance criteria met
- Apache 2.0 license intact
- All 5 PHILOSOPHY rules followed (real or honestly absent, signed, append-only, chain-hashed, per-agent identity)

**Risk:**
- High: SOC 2 Type II certification is a 6-12 month audit. v1.0 can\'t be "certified" without it. The roadmap can\'t promise certification; only readiness.
- Medium: Steering committee requires humans. Recruiting takes time.
- Low: Web UI / dashboard are well-trodden patterns.

---

## Critical path summary

The 5 versions in sequence:
- v0.1.0 → v0.1.1: 2 weeks, 8 lanes, ~700 lines. Critical path: layover.ing integration.
- v0.1.1 → v0.2: 4 weeks, 9 lanes, ~1,100 lines. Critical path: 6 control implementations.
- v0.2 → v0.3: 4 weeks, 8 lanes, ~780 lines. Critical path: first certification engagement.
- v0.3 → v1.0: 8 weeks, 8 lanes, ~2,300 lines. Critical path: governance + certification.
- Total: 18 weeks (~4.5 months), 33 lanes, ~4,900 lines.

Plus all the time spent on the audit closure, the live-browse verification, the framework\'s own bug fixes.

---

## Open questions for the product owner

1. **v0.1.1 scope confirmation:** 4 more controls + layover.ing integration + npm + CI. OK, or trim/expand?
2. **v0.1.1 release date:** 2026-08-04 (2 weeks). OK, or different?
3. **First certification engagement:** the v0.3 phase has an "engage external auditor" lane. Who pays? When?
4. **npm package name:** `ai-sdlc-framework` (under travellayover) or different?
5. **Steering committee:** for v1.0. Who would the 1-2 outside reviewers be?
6. **Branding:** the framework is currently unbranded. Logo, tagline, website?

These 6 questions block the roadmap. The agent can pick defaults, but the user should confirm.

---

## Sources

- `BACKLOG.md` — the 18 controls with scores
- `IMPLEMENTATION-PLAN.md` — the 14-day build plan for v0.1.0
- `SCOPE.md` — the v0.1.0 acceptance criteria (replicated for each version)
- `PHILOSOPHY.md` — the 8 rules that bind every version
- `docs/CONTROL-MAP.md` — the 18-control map
- The user\'s profile (terse, action-oriented, "pick, document, ship")

**End of ROADMAP.md.**
