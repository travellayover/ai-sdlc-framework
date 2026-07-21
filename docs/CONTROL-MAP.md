# Control Map

The 18 compliance controls in v0.1, grouped by pillar and mapped to their regulatory anchor.

## Pillar 1: Identity & Access (4 controls)

| Control ID | Status | Description | Regulatory anchor |
|---|---|---|---|
| SOC 2 CC6.1 | IMPLEMENTED | No direct commits to master (lane protocol) | SOC 2 CC6.1 |
| SOC 2 CC6.2 | STUB | Prior authorization for access (audit log entries) | SOC 2 CC6.2 |
| SOC 2 CC6.3 | STUB | Access removal on termination (identity registry) | SOC 2 CC6.3 |
| ISO 42001 A.5.3 | STUB | Segregation of duties (distinct agents for write/review/deploy) | ISO 42001 A.5.3 |

## Pillar 2: Change Management (4 controls)

| Control ID | Status | Description | Regulatory anchor |
|---|---|---|---|
| ISO 42001 A.6.1.2 | IMPLEMENTED | AI system lifecycle documented (F0-F8 or similar) | ISO 42001 A.6.1.2 |
| SOC 2 CC8.1 | STUB | Change management process (PR template with risk fields) | SOC 2 CC8.1 |
| HIPAA §164.308(a)(1)(ii)(A) | STUB | Risk analysis (documented periodically) | HIPAA §164.308 |
| ISO 42001 A.5.2 | STUB | AI policy (documented and approved) | ISO 42001 A.5.2 |

## Pillar 3: Code Integrity (4 controls)

| Control ID | Status | Description | Regulatory anchor |
|---|---|---|---|
| HIPAA §164.312(a)(2)(i) | IMPLEMENTED | Unique user identification (per-agent identity on every commit) | HIPAA §164.312 |
| SOC 2 CC7.1 | STUB | System operations monitoring (logging, retention, integrity) | SOC 2 CC7.1 |
| HIPAA §164.312(c)(1) | STUB | Integrity (hash checksums on data) | HIPAA §164.312 |
| SOC 2 CC7.3 | STUB | Incident detection and response | SOC 2 CC7.3 |

## Pillar 4: Operational Trust (3 controls)

| Control ID | Status | Description | Regulatory anchor |
|---|---|---|---|
| SOC 2 CC7.2 | STUB | Anomaly detection (unusual agent activity) | SOC 2 CC7.2 |
| SOC 2 CC9.1 | STUB | Risk mitigation (risk register with mitigations) | SOC 2 CC9.1 |
| ISO 42001 A.7.1 | STUB | Operational planning (runbook exists) | ISO 42001 A.7.1 |

## Pillar 5: Audit Trail (3 controls)

| Control ID | Status | Description | Regulatory anchor |
|---|---|---|---|
| HIPAA §164.312(b) | STUB | Audit controls (audit log populated, signed, tamper-evident) | HIPAA §164.312 |
| ISO 42001 A.9.4 | STUB | Monitoring and review (TrustScore trends over time) | ISO 42001 A.9.4 |
| ISO 42001 A.9.5 | STUB | Record retention (>= 6 years, no force-push) | ISO 42001 A.9.5 |

## TrustScore

Each pillar is worth 20 points (5 pillars × 20 = 100). Within a pillar, points are split evenly among the controls. For Pillar 1 (4 controls), each control is worth 5 points. For Pillar 4 (3 controls), each is worth 6.67 points.

A control in `IMPLEMENTED` status contributes its full share of the points when passing, 0 when failing. A control in `STUB` status contributes 0 points regardless (per PHILOSOPHY §1, a stub control does not claim compliance).

**v0.1 max possible TrustScore:** 18/100 (only the 3 implemented controls can earn points).

## Adding new controls in v0.1.1

See [GATE-AUTHORING.md](./GATE-AUTHORING.md) for how to add a new implemented control. The pattern:

1. Add a `Control` definition in `src/gates/<framework>/<id>-<name>.ts`
2. Implement the gate function (signature: `(target: string, agent: string) => Promise<GateOutput>`)
3. Call `registerGate(control, gate)` to register
4. Import the gate in `src/index.ts` (side-effect import)
5. Add tests in `tests/gates/<framework>/<id>.test.ts`
6. Update CONTROL-MAP.md
