# SCOPE

## In scope for v0.1

### Core framework (must ship)

1. Foundation docs: PHILOSOPHY.md, PRODUCT.md, SCOPE.md, AGENTS.md, LICENSE, README.md
2. 5-pillar TrustScore
3. 15 compliance controls (3 per pillar, documented in controls/)
4. 3 sample controls fully implemented: SOC 2 CC6.1, HIPAA §164.312(a)(2)(i), ISO 42001 A.6.1.2
5. 12 stub controls returning "NOT YET IMPLEMENTED" honestly per PHILOSOPHY §1
6. Gate runner: `npx ai-sdlc run`
7. Audit log: append-only, HMAC-chained, per-agent signed
8. CI integration: GitHub Actions example
9. Reference implementation: layover.ing

### TypeScript

- Node 20+
- TypeScript 5.x
- vitest
- Dependencies: `commander`, `yaml`

### Docs (to write)

- [x] PHILOSOPHY, PRODUCT, SCOPE, AGENTS, README, LICENSE, IMPLEMENTATION-PLAN
- [ ] docs/CONTROL-MAP.md
- [ ] docs/AUDIT-LOG-FORMAT.md
- [ ] docs/GATE-AUTHORING.md
- [ ] docs/COMPLIANCE-REPORT-TEMPLATE.md
- [ ] examples/layover.ing/README.md

## Out of scope for v0.1

### v0.1.1 (next 2 weeks)

- 6 more SOC 2, 6 more HIPAA, 6 more ISO 42001 controls
- Layover.ing\'s full v1.0-rc1 build (35 lanes)

### v0.2 (next quarter)

- Multi-tenant, multi-CI, real-time dashboards, web UI, custom controls, override, multi-framework reports

### Permanently out of scope

- Compliance certification (requires external auditor)
- ML model governance (v0.1 is code agents only)
- GRC platform, real-time monitoring, vulnerability scanning, pentesting, GDPR/CCPA, PCI-DSS

## Anti-goals

- No "tracked" / "in progress" / "scheduled" gate output
- No shared credentials
- No silent failures
- No fake compliance claims
- No vendor lock-in
- No telemetry back to a central service

## Acceptance criteria for v0.1

1. All foundation docs written and reviewed
2. 3 sample controls fully implemented with passing tests
3. 12 stub controls documented with honest "NOT YET IMPLEMENTED"
4. Gate runner runs all 15 controls, produces JSON + markdown reports
5. Audit log is append-only, HMAC-chained, tamper-evident (test verified)
6. GitHub Actions example works
7. layover.ing runs under the framework with 1 lane shipped
8. The 4 docs (CONTROL-MAP, AUDIT-LOG-FORMAT, GATE-AUTHORING, COMPLIANCE-REPORT-TEMPLATE) written
9. Full vitest suite passes (target: 50+ tests)
10. Published to npm as `ai-sdlc-framework` v0.1.0
11. v0.1 build\'s own audit log preserved (framework eats its own dog food)
12. TrustScore reported for layover.ing
