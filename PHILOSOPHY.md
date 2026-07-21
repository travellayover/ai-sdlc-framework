# PHILOSOPHY

> *Every compliance assertion is a real assertion, signed and traceable, or honestly absent.*

## The moat

A compliance framework\'s value is its **trust**. If the framework reports "SOC 2 CC6.1: PASS" when the control is not actually in effect, every audit built on that report is corrupted. If the framework reports "SOC 2 CC6.1: NOT YET IMPLEMENTED," the deploying organization can choose to implement it, ignore it, or document why it\'s out of scope — but cannot be deceived by their own tooling.

The framework\'s moat is **honest absence**.

## The 8 rules

1. **Real or honestly absent.** Every compliance assertion is real (with evidence) or absent. No "tracked" / "in progress" / "scheduled" euphemisms.
2. **Signed, or not recorded.** Every audit log entry is signed.
3. **Append-only, or not a log.** The log is never modified.
4. **Chain-hashed, or not tamper-evident.** Each entry includes the previous\'s signature.
5. **Per-agent identity, or no action.** No "system" / "team" / "admin" accounts.
6. **Real control, or stub with honest absence.** A gate is real or a stub returning "NOT YET IMPLEMENTED."
7. **Certifiable is the deploying org\'s job, not ours.** We produce artifacts; auditors certify.
8. **Open-source, not open-washing.** Apache 2.0; the source is the documentation.

## The forbidden list

- No "tracked" / "in progress" / "scheduled" in gate output
- No fake compliance claims
- No shared credentials in the audit log
- No silent failures in the gate runner
- No "admin" / "system" / "team" / "root" agent identity
- No vendor lock-in

See PRODUCT.md, SCOPE.md, AGENTS.md for details.
