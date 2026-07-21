# Audit Log Format

The framework\'s audit log is **append-only**, **HMAC-chained**, and **tamper-evident**. Per PHILOSOPHY §2-4.

## Storage

- Default location: `<project>/audit/`
- One file per day: `audit/YYYY-MM-DD.log`
- One JSON object per line (newline-delimited JSON)
- 24h after a file is written, it is treated as immutable

## Entry format

```json
{
  "timestamp": "2026-07-21T15:35:39.646Z",
  "lane": "feat-verify-pipeline",
  "agent": "layover-bot",
  "action": "commit",
  "data": { "sha": "b3bc091", "message": "feat(verify): add next build" },
  "prevHash": "f8a3b2c1...",
  "signature": "e7d4c2a1..."
}
```

| Field | Type | Description |
|---|---|---|
| `timestamp` | ISO 8601 | When the action occurred |
| `lane` | string | Which lane / PR / context the action belongs to |
| `agent` | string | Per-agent identity (per HIPAA §164.312(a)(2)(i)) |
| `action` | string | Type: `commit`, `pr`, `deploy`, `gate-run`, `config-change`, `access-grant` |
| `data` | object | Action-specific payload |
| `prevHash` | hex (64 chars) | SHA-256 HMAC of the previous entry\'s canonical form |
| `signature` | hex (64 chars) | SHA-256 HMAC of this entry\'s canonical form |

## Chain

Each entry\'s `signature` is computed over a deterministic JSON serialization of the entry (with the `signature` field excluded), HMAC-SHA-256 with a per-agent key. The `prevHash` field is the previous entry\'s `signature`. The first entry\'s `prevHash` is `0` × 64 (64 zeros).

Tampering with any entry invalidates the chain at the point of tampering, because the modified entry\'s `signature` no longer matches the recomputed HMAC, and the next entry\'s `prevHash` no longer matches the modified entry\'s new `signature`.

## Canonical form

```ts
function canonicalize(entry: Omit<AuditEntry, "signature">): string {
  return JSON.stringify(entry, Object.keys(entry).sort());
}
```

Keys are sorted alphabetically. No whitespace. This is deterministic regardless of property insertion order.

## HMAC key

The HMAC key is per-agent. In v0.1, the framework uses a dev key (`dev-key-not-for-production-use`) by default. In v0.1.1, the key will be derived from the agent\'s identity (e.g., a per-agent key in the agent\'s config).

To generate a new key:

```bash
node -e "console.log(require(\"crypto\").randomBytes(32).toString(\"hex\"))"
```

## Verification

```bash
npx ai-sdlc verify-audit [--target <path>] [--key <key>]
```

The verify command walks the chain, recomputes each signature, and reports the first tampered entry.

## Reference implementation

In `src/audit/signed-log.ts`:
- `appendEntry()` — writes a new entry, returns the entry
- `verifyChain()` — walks the chain, returns `{ valid, entriesChecked, firstInvalidEntry?, reason? }`
- `generateKey()` — generates a new 32-byte hex key

## What goes in the log

Per the framework\'s PHILOSOPHY, the audit log is the source of truth for "what did the agents do." Every action an agent takes should be logged:

- Every commit (via a post-commit hook)
- Every PR opened / merged (via a GitHub Action)
- Every deploy (via a deploy hook)
- Every gate run (via the framework itself)
- Every config change (via a config-change entry)

## What does NOT go in the log

- Code (the git history is the source of truth for code)
- Build artifacts (the build output is the source of truth)
- User data (the log is for agent actions, not user actions)
- Secrets (never log secrets, ever)
