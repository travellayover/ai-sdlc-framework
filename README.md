# AI-SDLC Framework

**An Apache 2.0 open-source framework for building regulatory compliance and quality gates directly into AI coding agent pipelines.**

> *Every compliance assertion is a real assertion, signed and traceable, or honestly absent.*

## What it is

A TypeScript framework that:

1. **Defines 15 compliance controls** mapped to SOC 2, HIPAA, and ISO 42001 across 5 pillars
2. **Runs gates** on any git repository to produce a compliance report
3. **Signs and chains** every agent action in an append-only audit log
4. **Integrates** with CI providers and AI coding agents
5. **Does not, by itself, constitute compliance.** Certification requires an external auditor.

## Status

**v0.1 (in development).** See IMPLEMENTATION-PLAN.md.

Reference implementation: layover.ing. The framework ships by governing layover.ing.

## Quick start (when v0.1 ships)

```bash
npm install -g ai-sdlc-framework
cd /path/to/your/project
ai-sdlc run
```

## License

Apache 2.0. See [LICENSE](./LICENSE).
