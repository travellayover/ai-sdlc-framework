# PRODUCT

## What this is

**AI-SDLC Framework** is an Apache 2.0 open-source framework that builds regulatory compliance and quality gates directly into AI coding agent pipelines.

It targets three compliance frameworks in v0.1:
- **SOC 2** (Type II, security/confidentiality/availability)
- **HIPAA** (§164.308 administrative safeguards, §164.312 technical safeguards)
- **ISO 42001** (AI management system, controls A.5-A.9)

It targets one use case:
- **AI coding agents** that write, review, merge, and deploy code on behalf of humans

## Who it is for

**Primary:** engineering teams using AI coding agents (Cursor, Copilot, Claude Code, Hermes) in production codebases that need to meet SOC 2 / HIPAA / ISO 42001.

**Secondary:** compliance officers, auditors, OSS maintainers.

**Reference implementation:** [layover.ing](https://layover.ing) — a consumer travel app built entirely by AI agents under this framework.

## What it does

1. Defines 15 compliance controls across 5 pillars
2. Runs gates on any git repo to produce a compliance report
3. Signs and chains every agent action in an append-only audit log
4. Integrates with CI providers and AI coding agents
5. Computes a TrustScore (0-100) from the 15 controls

## What it does NOT do

- Not a SOC 2 / HIPAA / ISO 42001 certification (requires external auditor)
- Not a security tool (it documents controls, not prevents breaches)
- Not a CI/CD tool (integrates with CI, not replaces it)
- Not an AI agent runtime (governs agents, not runs them)

## Why it exists

Compliance frameworks were written for human-engineered systems. AI coding agents break the assumptions:
- Commits are by named humans (agent commits on behalf of whom?)
- PRs are reviewed by humans (is agent review a review?)
- Deploys are by humans (auditable?)
- Audit trails are human actions (90% agent actions still count?)

The framework adapts compliance to the AI era with new primitives: per-agent identity, per-agent key, per-agent signed action. Maps to existing SOC 2 / HIPAA / ISO 42001 controls.

## The 5-pillar model

| Pillar | What it covers | Compliance anchor |
|---|---|---|
| Identity & Access | Who is the agent, can it do this | SOC 2 CC6.x, ISO 42001 A.5 |
| Change Management | How changes happen, who reviews | SOC 2 CC8.x, ISO 42001 A.6 |
| Code Integrity | Is the code real, is it scanned | SOC 2 CC7.x, HIPAA §164.312(a)(2)(i) |
| Operational Trust | Are secrets safe, are deploys budgeted | SOC 2 CC9.x, ISO 42001 A.7 |
| Audit Trail | Is every action recorded, signed | HIPAA §164.312(b), ISO 42001 A.9 |

Each pillar is 20 points. TrustScore = sum (0-100). 3 controls per pillar, ~6.67 points each.

## Reference implementation: layover.ing

First 3 sample controls wired to layover.ing:
- **SOC 2 CC6.1** (no direct-to-master): layover.ing\'s `docs/GOVERNANCE.md` enforces lane protocol
- **HIPAA §164.312(a)(2)(i)** (unique user ID): layover.ing uses `git -c user.name=layover-bot -c user.email=bot@layover.ing`
- **ISO 42001 A.6.1.2** (AI lifecycle): layover.ing has `docs/0.1-ROADMAP.md` with F0-F8 phases

By end of v0.1, layover.ing\'s v0.1.1 ships under the framework. TrustScore reported for layover.ing. Audit log is source of truth.

## How to use it (when v0.1 ships)

```bash
npm install -g ai-sdlc-framework
cd /path/to/your/project
ai-sdlc init   # creates .ai-sdlc/config.json
ai-sdlc run    # runs all gates, produces report
ai-sdlc verify-audit  # checks the signed log chain
```
