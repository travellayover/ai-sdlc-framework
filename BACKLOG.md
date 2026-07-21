# BACKLOG — AI-SDLC Framework

The source of truth for **what gets built, in what order, by whom, with what evidence**. Per the framework\'s own PHILOSOPHY §1 (real or honestly absent), every backlog item is either a real implementation (with a lane branch, a commit, a passing test) or honestly absent (not started, with a clear spec).

This doc is the precedence-4 doc in the framework\'s own contract matrix (after PHILOSOPHY, PRODUCT, SCOPE). When two backlog items conflict, the higher-ranked doc wins.

## Backlog ID convention

Every item is `BF-NNN` (Backlog Framework). NN is the priority order. Lower = higher priority. Gaps are allowed (BF-001, BF-002, BF-005 — BF-003 and BF-004 retired).

## Priority axes

Every item is scored on 3 axes (1-5 each, total /15):

- **R** (Regulatory risk): how much does this control reduce regulatory risk for a typical deploying org? (5 = critical SOC 2/HIPAA/ISO 42001 ask)
- **D** (Demand): how many deploying orgs asked for this control? (5 = commonly requested)
- **C** (Cost): how hard is this to implement well? (5 = very hard, 1 = trivial). Lower cost = higher priority for the same regulatory value.

Total score = R + D + (6 − C). Higher = higher priority. R and D matter most; cost is a tiebreaker.

## Backlog status

Every item is one of:
- **NOT STARTED**: spec exists in CONTROL-MAP, no lane branch, no implementation
- **IN PROGRESS**: lane branch exists, code in progress, no passing test
- **DONE**: lane merged, test passing, control implemented
- **DEFERRED**: explicitly out of v1.0 scope (with rationale)

Per PHILOSOPHY §1, no "tracked" / "in progress" / "scheduled" — the framework\'s own backlog follows its own rules.

---

## The backlog (15 items, 3 implemented)

### Tier 1: Critical (R ≥ 4) — Implement first

| ID | Control | R | D | C | Score | Status | Lane | Notes |
|---|---|---|---|---|---|---|---|---|
| BF-001 | SOC 2 CC6.1 (no direct-to-master) | 5 | 5 | 1 | 9 | **DONE** | done | First sample gate. Verified end-to-end against layover.ing. |
| BF-002 | HIPAA §164.312(a)(2)(i) (unique user) | 5 | 5 | 1 | 9 | **DONE** | done | First sample gate. Verified end-to-end. |
| BF-003 | ISO 42001 A.6.1.2 (AI lifecycle) | 5 | 5 | 1 | 9 | **DONE** | done | First sample gate. Verified end-to-end. |
| BF-004 | SOC 2 CC7.1 (system monitoring) | 4 | 4 | 2 | 8 | **NOT STARTED** | — | Stub. Detects log infrastructure, retention, integrity. Blocks most SOC 2 audits. |
| BF-005 | HIPAA §164.312(b) (audit controls) | 5 | 4 | 3 | 7 | **DONE** | lane/bf-005-audit-controls | Stub → IMPLEMENTED. Dogfoods the framework's own audit log: verifies audit/ exists, has entries, signs them, chain verifies. |
| BF-006 | SOC 2 CC8.1 (change management) | 5 | 4 | 3 | 7 | **NOT STARTED** | — | Stub. PR template verification. Common ask from SOC 2 auditors. |

### Tier 2: High (R = 3-4) — Implement in v0.1.1

| ID | Control | R | D | C | Score | Status | Lane | Notes |
|---|---|---|---|---|---|---|---|---|
| BF-007 | SOC 2 CC6.2 (prior authorization) | 4 | 3 | 3 | 6 | **NOT STARTED** | — | Stub. Audit log access-grant entries. |
| BF-008 | SOC 2 CC6.3 (access removal) | 4 | 3 | 3 | 6 | **NOT STARTED** | — | Stub. Identity registry. |
| BF-009 | ISO 42001 A.5.3 (segregation of duties) | 4 | 3 | 3 | 6 | **NOT STARTED** | — | Stub. Distinct agents for write/review/deploy. |
| BF-010 | HIPAA §164.308(a)(1)(ii)(A) (risk analysis) | 4 | 3 | 3 | 6 | **NOT STARTED** | — | Stub. Periodic risk analysis. |
| BF-011 | ISO 42001 A.5.2 (AI policy) | 4 | 3 | 2 | 7 | **NOT STARTED** | — | Stub. Signed AI policy. |
| BF-012 | HIPAA §164.312(c)(1) (integrity) | 4 | 2 | 3 | 5 | **NOT STARTED** | — | Stub. SHA-256 checksums. |
| BF-013 | SOC 2 CC7.2 (anomaly detection) | 3 | 3 | 4 | 4 | **NOT STARTED** | — | Stub. CI rule for unusual agent activity. |
| BF-014 | SOC 2 CC9.1 (risk mitigation) | 3 | 3 | 3 | 5 | **NOT STARTED** | — | Stub. Risk register. |
| BF-015 | ISO 42001 A.7.1 (operational planning) | 3 | 2 | 3 | 4 | **NOT STARTED** | — | Stub. Operational runbook. |
| BF-016 | ISO 42001 A.9.4 (monitoring and review) | 3 | 2 | 3 | 4 | **NOT STARTED** | — | Stub. TrustScore trends. |
| BF-017 | ISO 42001 A.9.5 (record retention) | 4 | 2 | 2 | 6 | **NOT STARTED** | — | Stub. 6+ year retention. |
| BF-018 | SOC 2 CC7.3 (incident detection) | 4 | 2 | 4 | 4 | **NOT STARTED** | — | Stub. Incident response plan. |

### Tier 3: Out of v1.0 scope (DEFERRED)

None yet. Add as the backlog grows.

---

## The product owner role

There is no "product owner" in the traditional sense (a person, a team, a role). The framework follows layover.ing\'s existing pattern: the user is the implicit product owner, and the agent makes calls within the user\'s profile (terse, action-oriented, "pick, document, ship").

**The product owner\'s responsibilities:**

1. **Prioritize the backlog.** When two controls are tied on score, the product owner picks the one to ship first. The pick is documented in the lane\'s PR body.

2. **Accept or reject scope changes.** When a control is "in scope" for a version, the product owner can defer it (move to Tier 3) or accept it (keep in Tier 1/2). The decision is documented in this file.

3. **Approve non-trivial agent decisions.** When the agent offers a fork (e.g., "build a mock vs wait for the real audit log"), the product owner picks. The agent never silently picks non-trivial forks; it surfaces the choice.

4. **Sign off on releases.** Each version (v0.1.0, v0.1.1, v1.0) gets the product owner\'s sign-off in a CHANGELOG entry. Without sign-off, the release is not official.

**Per the user profile:** the user is "pick" by default. The agent picks non-trivial forks unless the user has explicitly said "ask me." The agent documents the pick in the deliverable.

---

## The grooming process

The backlog is reviewed and re-prioritized at each version bump:

- **v0.1.0** (shipped 2026-07-21): 3 sample controls implemented, 15 stubs documented.
- **v0.1.1** (next): 3-5 more controls implemented, framework wired to layover.ing, npm publish.
- **v0.2** (after): 6-8 more controls, the framework ships on its own audit log, first external user.
- **v1.0** (later): all 18 implemented, all 30+ tests, npm + GitHub release, governance doc.

**Grooming trigger:** any time a new regulatory ask comes in (e.g., "we need PCI-DSS support") or a deploying org requests a specific control. The agent adds the item, scores it, and bumps the priority if it\'s high.

---

## The integration with layover.ing

The framework is the reference implementation for layover.ing\'s v0.1.1 → v1.0-rc1 build. The integration has 3 layers:

### Layer 1: Read-only (current state)
- The framework is initialized in layover.ing (`.ai-sdlc/` + `audit/`).
- `npx ai-sdlc run` produces a compliance report.
- The report is read but not blocking.

### Layer 2: Blocking-on-merge (target v0.1.1)
- A GitHub Action runs `npx ai-sdlc run` on every PR.
- If TrustScore < target, the PR is blocked.
- The first target is **TrustScore ≥ 10/100** (matches the v0.1.0 baseline).
- The target grows as the framework implements more controls.

### Layer 3: Blocking-on-deploy (target v0.2)
- A Vercel deploy hook runs `npx ai-sdlc run` before deploy.
- If TrustScore < target, the deploy is blocked.
- The target is **TrustScore ≥ 50/100** (the 3 sample controls + 9-12 more implemented).

### Layer 4: Full-governance (target v1.0)
- The framework governs every commit, every PR, every deploy.
- The audit log is the source of truth for "what did the agents do."
- The compliance report is shipped to a dashboard.

---

## The release process

Per the framework\'s Apache 2.0 license and the user\'s strict-foundations profile:

1. **Build the version.** Bump `package.json` to the target version. Update `CHANGELOG.md` with the version\'s changes. Sign off by the product owner (the user).

2. **Run the full verify suite.** `npm run verify` must pass (typecheck + lint + 30+ tests). The verify output is the release artifact.

3. **Tag the release.** `git tag vX.Y.Z` on the release commit. The tag is the canonical version pointer.

4. **Publish to npm.** `npm publish` (with `--access public`). The published package is the consumable artifact.

5. **Push to GitHub.** `git push --tags` to the remote. The remote has the canonical source.

6. **Announce.** Update README with the new version. Update SCOPE\'s acceptance criteria to reflect what shipped.

The release process is enforced by a CI workflow (in v0.1.1) that runs the verify suite on every commit to master and blocks the release if it fails.

---

## The community / governance process

The framework is open-source (Apache 2.0). The community process has 3 phases:

### Phase 0: Solo (current)
- Only the user + the agent.
- Backlog grooming is implicit.
- Releases are made by the user.
- No external contributions.

### Phase 1: Open issues (target v0.2)
- GitHub issues enabled.
- The framework accepts bug reports and feature requests.
- The backlog grows from external input.
- The product owner (user) still picks.

### Phase 2: Open PRs (target v0.2.1)
- GitHub PRs enabled.
- External contributors can submit control implementations.
- The gate lane (a stronger model or a human reviewer) reviews each PR.
- The PR must add a new test, add to CONTROL-MAP, and pass the verify suite.

### Phase 3: Multi-org governance (target v1.0)
- A governance doc (similar to layover.ing\'s `docs/CONTRACT-MATRIX.md`).
- A steering committee (1-3 humans) reviews significant changes.
- The framework is certifiable (per the deploying org\'s auditor, not by itself).

---

## The dogfooding (framework governs itself)

The framework\'s own development follows the framework\'s rules:

1. **Every commit has a per-agent identity** (per HIPAA §164.312(a)(2)(i)). The current bot is `ai-sdlc-bot <bot@ai-sdlc.org>`.

2. **Every commit is signed** (per the audit log). The framework\'s own `audit/` is the source of truth for what commits happened.

3. **Every PR goes through a review** (per SOC 2 CC8.1 change management). In v0.1.0, the "review" is the user reading the PR body. In v0.1.1+, the gate lane is a stronger model or a CI workflow.

4. **No "tracked" / "in progress" / "scheduled"** (per PHILOSOPHY §1). Every commit message is either a real implementation (with evidence) or an honest absence (not started).

5. **No force-push to master** (per the framework\'s CC6.1 sample gate). Master is force-push-protected.

6. **The framework\'s own verify suite is the gate.** `npm run verify` must pass before any merge. CI enforces this.

The dogfooding is checked by `npx ai-sdlc run --target /Users/gm/projects/ai-sdlc-framework` itself. The framework\'s own TrustScore is reported in the README badge (in v0.1.1).

---

## Open questions for the product owner (the user)

1. **Is the user the product owner, or is there a real one?** Per the user profile ("pick, document, ship"), the user is the implicit PO. The agent makes calls and documents them. Confirm?

2. **Is the framework intended for public release (npm + GitHub), or internal use only?** If public, the community process (Phase 1-3) needs to be set up. If internal, just the layover.ing integration matters.

3. **What\'s the v0.1.1 release target?** The 6-phase plan in `IMPLEMENTATION-PLAN.md` says v0.1.1 is 2 weeks of work. Confirm scope (4-5 more controls + layover.ing integration + npm publish)?

4. **Who pays for the npm package?** The user has travellayover GitHub account. Is the framework under travellayover/ai-sdlc-framework or ai-sdlc/framework? Different orgs have different governance.

5. **What\'s the relationship to layover.ing?** Is the framework a side-project that happens to govern layover.ing, or is layover.ing the primary consumer and the framework is a side-effect?

6. **What\'s the release cadence?** v0.1.0 → v0.1.1 in 2 weeks → v0.2 in 4-6 weeks → v1.0 in 8-12 weeks? Or different?

These 6 questions block the grooming and release processes. The agent can pick defaults (per the user profile), but the user should confirm.

---

## Sources

- `PHILOSOPHY.md` — the single moat sentence, the 8 rules
- `PRODUCT.md` — what this is, who it\'s for
- `SCOPE.md` — what\'s in v0.1, what\'s out
- `AGENTS.md` — the cheatsheet for AI agents
- `CONTROL-MAP.md` — the 18 controls
- `docs/AUDIT-LOG-FORMAT.md` — the signed log spec
- `docs/GATE-AUTHORING.md` — how to add a new gate
- `docs/COMPLIANCE-REPORT-TEMPLATE.md` — the report format
- `IMPLEMENTATION-PLAN.md` — the 14-day build plan
- The user\'s profile (terse, action-oriented, "pick, document, ship")
- layover.ing\'s `docs/CONTRACT-MATRIX.md` — the precedence pattern this file follows

**End of BACKLOG.md.**
