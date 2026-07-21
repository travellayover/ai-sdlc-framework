# GOVERNANCE — AI-SDLC Framework

The precedence ladder and decision-making model for the framework. Per the framework\'s own contract matrix, this is the precedence-9 doc (after PHILOSOPHY, PRODUCT, SCOPE, BACKLOG, AUDIT, ROADMAP, LANES, AGENTS).

## Precedence ladder (top wins)

| Rank | Doc | Decides | Why it wins |
|---|---|---|---|
| 1 | `PHILOSOPHY.md` | The framework\'s moat. "Every compliance assertion is real, signed, and traceable, or honestly absent." | The single sentence binds every other doc. |
| 2 | `PRODUCT.md` | What this is, who it\'s for, what v0.1 ships, what\'s deferred | When scope and product disagree, product wins. |
| 3 | `SCOPE.md` | What\'s in v0.1, what\'s out, the 12 acceptance criteria | The boundary. Anything not in SCOPE is out. |
| 4 | `BACKLOG.md` | The 18 controls with scores and status | The stable, ID-tracked list of work items. |
| 5 | `AUDIT-0.1-to-1.0.md` (planned, see ROADMAP §v0.2) | The ordering of v0.1 fill-in work | Orders, doesn\'t contract. |
| 6 | `ROADMAP.md` | The phase dependencies (v0.1.0 → v0.1.1 → v0.2 → v0.3 → v1.0) | Coarse. Use BACKLOG for ordering within a phase. |
| 7 | `LANES.md` (planned, see ROADMAP §v0.1.1) | The live state. What is claimed, in-progress, pr-open, merged, abandoned. | The coordination board. Not the contract. |
| 8 | `AGENTS.md` | The cheatsheet for AI coding agents. The 6 hard rules. | The pre-flight. Points at the deeper docs. |
| 9 | **This doc** (`GOVERNANCE.md`) | Process. Lane protocol, gate lane, review model, release cadence. | The "how we build" rules. |
| 10 | `docs/CONTROL-MAP.md`, `docs/AUDIT-LOG-FORMAT.md`, `docs/GATE-AUTHORING.md`, `docs/COMPLIANCE-REPORT-TEMPLATE.md` | Layer-level contracts. The controls, the log, the gate, the report. | The "what we ship" details. |

When two docs disagree, the higher rank wins. When the disagreement is about a contract that the higher doc does not speak to, the lower doc wins. When the disagreement is silent, the gate-lane reviewer decides and the conflict is logged in this doc as a NEW ENTRY.

## What each doc is responsible for (the do-not-bleed-across rule)

| Concern | Owns it | Do NOT put it in |
|---|---|---|
| The single sentence (real or honestly absent) | PHILOSOPHY.md | Anywhere else. Quote it, don\'t redefine it. |
| The 8 rules | PHILOSOPHY.md | AGENTS.md has the cheat sheet only. |
| The single moat sentence | PHILOSOPHY.md | README has the elevator pitch only. |
| The 4-5 version timeline | ROADMAP.md | BACKLOG inherits, doesn\'t redefine. |
| The 18 controls with scores | BACKLOG.md | CONTROL-MAP.md inherits, doesn\'t redefine. |
| The implementation status of each control | BACKLOG.md | CONTROL-MAP.md says "implemented" or "stub" only. |
| B-IDs (BF-001, BF-002, ...) | BACKLOG.md | The lane branch uses the BF-ID in the commit message. |
| Control IDs (SOC 2 CC6.1, etc.) | CONTROL-MAP.md | BACKLOG references, doesn\'t redefine. |
| Audit log format | AUDIT-LOG-FORMAT.md | Code in src/audit/signed-log.ts. Doc describes, code enforces. |
| How to add a gate | GATE-AUTHORING.md | Code in src/gates/. Doc teaches, code enforces. |
| Report format | COMPLIANCE-REPORT-TEMPLATE.md | Code in src/runner/report.ts. Doc describes, code enforces. |
| The forbidden list (TODO, any, etc.) | AGENTS.md | Each rule cites PHILOSOPHY\'s source. |
| Lane protocol, gate lane, review model | This doc (GOVERNANCE.md) | AGENTS.md cheatsheet only. |
| The product description | PRODUCT.md | README has the elevator pitch only. |

## When to update this doc

- A new doc is added → add a row.
- A doc\'s scope changes → update the "Decides" column.
- A conflict in PR review surfaces → add a NEW ENTRY at the bottom of this doc and update the precedence if the NEW ENTRY establishes a new rule.
- A new version is released → add a new "When X" entry.

## NEW ENTRIES (governance decisions)

(NONE YET. The framework is v0.1.0, single-user, single-agent. NEW ENTRIES are added when governance decisions are made.)

---

## Lane protocol (how work is built)

Per the framework\'s PHILOSOPHY and the layover.ing pattern:

1. **One agent, one worktree, one branch, one lane.** Every work item is built in a dedicated worktree on a `lane/<name>` branch. No exceptions.

2. **Never commit or push to `master` directly.** `master` only advances by merging a reviewed, CI-green lane. The framework\'s own CC6.1 sample gate enforces this.

3. **Claim a lane before building.** Update `LANES.md` (planned, v0.1.1) with the lane row before starting work. Duplicated work has happened before; respect the board.

4. **The gate lane reviews before merge.** A gate lane is a stronger model or a human that reviews each lane. No self-merge. The framework\'s own verify suite is the gate.

5. **Every commit cites a B-ID.** Commit messages include the BF-ID (e.g., "feat(gate): implement HIPAA §164.312(b) (BF-005)"). The audit log captures the commit.

6. **Re-sync safely.** If master moved under your lane, rebase your `lane/<name>` onto master. Never force-push master.

---

## Gate lane review (how a lane gets merged)

For each lane PR:

1. **The agent opens the PR.** PR body includes: what changed, why, the BF-ID, the test plan, the rollback plan.

2. **The CI workflow runs.** `npm run verify` must pass (typecheck + lint + test).

3. **The gate lane reviews.** In v0.1.0, the "gate lane" is the user reading the PR. In v0.1.1+, the gate lane is a stronger model or a CI workflow with a review step.

4. **The merge happens.** If the gate lane approves and CI is green, the lane is merged to master. The audit log records the merge.

5. **The post-deploy smoke runs.** (In v0.2+.) Vercel deploy hook runs `npx ai-sdlc run` and blocks on regression.

---

## Release cadence

Per `ROADMAP.md`:
- v0.1.0: shipped 2026-07-21
- v0.1.1: target 2026-08-04 (2 weeks)
- v0.2: target 2026-09-01 (4 weeks)
- v0.3: target 2026-10-01 (4 weeks)
- v1.0: target 2026-11-26 (8 weeks)

The cadence is aggressive (2-8 weeks per version) because the framework is a small codebase (~1,700 lines of TS, ~1,100 lines of docs) and the per-version scope is bounded. If a phase slips, the next phase starts after the slip is resolved, not on the calendar date.

---

## Open questions for the product owner

1. **Is the governance doc (this doc) the right precedence rank?** Currently #9. Could be #7 if governance is the primary contract. Per layover.ing\'s pattern, governance is a process doc, not a contract; #9 is right.
2. **When is the steering committee formed?** v1.0. Before or after certification? The user decides.
3. **Who is the "gate lane" in v0.1.0?** The user reads every PR. In v0.1.1, the user still reads every PR but with a stronger model helping. The user is the gate lane until v1.0.
4. **What\'s the commit message convention?** "feat|fix|chore|docs(scope): description (BF-XXX)" — standard conventional commits. The BF-XXX is the new addition.
5. **What\'s the rollback policy?** If a lane breaks production, revert the merge commit. The audit log records the revert.

These 5 questions block the governance process. The agent can pick defaults, but the user should confirm.

---

## Sources

- `PHILOSOPHY.md` — the 8 rules
- `PRODUCT.md` — what this is
- `SCOPE.md` — what\'s in v0.1
- `BACKLOG.md` — the 18 controls with scores
- `ROADMAP.md` — the 5 versions
- `AGENTS.md` — the 6 hard rules for agents
- layover.ing\'s `docs/CONTRACT-MATRIX.md` — the precedence pattern this doc follows

**End of GOVERNANCE.md.**
