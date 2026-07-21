# Compliance Report Template

The report produced by `npx ai-sdlc run`. Two formats: JSON and Markdown.

## JSON format

```json
{
  "generatedAt": "2026-07-21T15:35:39.646Z",
  "target": "/path/to/project",
  "frameworkVersion": "0.1.0",
  "trustScore": 0,
  "maxScore": 100,
  "passingControls": 0,
  "failingControls": 3,
  "notImplementedControls": 15,
  "totalControls": 18,
  "pillars": [
    {
      "pillar": "audit-trail",
      "score": 0,
      "maxScore": 20,
      "controls": [
        {
          "controlId": "HIPAA §164.312(b)",
          "result": "not-implemented",
          "summary": "Audit controls is documented but not yet implemented in v0.1.",
          "evidence": [...],
          "remediation": "...",
          "ranAt": "...",
          "ranBy": "layover-bot"
        },
        ...
      ]
    },
    ...
  ]
}
```

## Markdown format

```markdown
# AI-SDLC Compliance Report

- **Generated:** 2026-07-21T15:35:39.646Z
- **Target:** /path/to/project
- **Framework version:** 0.1.0
- **TrustScore:** 0 / 100
- **Passing:** 0 · **Failing:** 3 · **Not implemented:** 15 · **Total:** 18

## Pillar: audit-trail (0 / 20)

### STUB HIPAA §164.312(b) — Audit controls is documented but not yet implemented in v0.1.

**Evidence:**
- `controls/HIPAA §164.312(b).json`: Would verify audit/ is populated, signed, and tamper-evident.

**Remediation:** This control is on the v0.1.1 roadmap. Per PHILOSOPHY §1, this is reported honestly as not implemented, not as 'in progress' or 'tracked'.

### STUB ISO 42001 A.9.4 — Monitoring and review is documented but not yet implemented in v0.1.
...

## Pillar: change-management (0 / 20)
...
```

## Per-gate output

```json
{
  "controlId": "SOC 2 CC6.1",
  "result": "pass" | "fail" | "not-implemented",
  "summary": "Human-readable 1-line summary",
  "evidence": [
    {
      "location": "git log master --no-merges --max-count=100",
      "content": "0 direct commits in last 100 commits",
      "kind": "git" | "file" | "env" | "computed"
    }
  ],
  "remediation": "What to do to fix (only for 'fail' or 'not-implemented')",
  "ranAt": "ISO 8601 timestamp",
  "ranBy": "agent identity"
}
```

## TrustScore

`trustScore` is the sum of the pillar scores, 0-100. The formula is:

- For each pillar (worth 20 points), the points are split evenly among the controls.
- A control with `result: "pass"` contributes its full share.
- A control with `result: "fail"` contributes 0.
- A control with `result: "not-implemented"` contributes 0 (per PHILOSOPHY §1).

Example: Pillar 1 has 4 controls, each worth 5 points. If 1 passes and 3 are stubs, the pillar score is 5/20. TrustScore is the sum across all 5 pillars.

## Output filenames

- `<outputDir>/report-YYYY-MM-DD.json` — the JSON report
- `<outputDir>/report-YYYY-MM-DD.md` — the Markdown report

Default `<outputDir>` is `./.ai-sdlc` (relative to the target).

## How to use the report

### For a deploy gate

```bash
npx ai-sdlc run
# Check the JSON's trustScore and failingControls
# Block deploy if failingControls > 0
```

### For a periodic audit

```bash
npx ai-sdlc run
# Save the markdown report
# Attach to the quarterly compliance review
```

### For tracking progress

```bash
# Run daily, save the reports
mkdir -p .ai-sdlc/reports
npx ai-sdlc run --output .ai-sdlc/reports
# Track trustScore over time
```

## What the report does NOT include

- The user\'s name (per privacy)
- The project\'s contents (only metadata about the project)
- The audit log contents (use `npx ai-sdlc verify-audit` for that)
- Build artifacts
- Network requests
