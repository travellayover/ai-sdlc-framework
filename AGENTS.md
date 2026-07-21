# AGENTS.md

> *The cheatsheet for AI agents using the AI-SDLC Framework.*

## Before you do anything

1. Check the framework is initialized (`.ai-sdlc/config.json`).
2. Identify yourself (per-agent identity configured).
3. Read PHILOSOPHY.md.

## The 6 hard rules for AI agents

### Rule 1: Never commit without an agent identity

```
# GOOD
git -c user.name="cursor-agent-alice" -c user.email="alice@org.com" commit -m "..."

# BAD
git commit -m "..."  # uses whatever is in git config
```

### Rule 2: Never commit secrets

Use env vars. Never hardcode keys.

### Rule 3: Never commit broken or unverified code

Run `npm run verify` before committing.

### Rule 4: Never commit fabricated data

Every user-facing value is real or honestly absent. No placeholder numbers.

### Rule 5: Never bypass a gate

No `--no-verify`. No `[skip ci]`. Fix the issue and re-run.

### Rule 6: Sign your actions

Every commit, PR, deploy, or config change is attributable to you and recorded in the audit log.

## What to do if a gate fails

1. Read the gate output (file:line, remediation).
2. Fix the underlying issue. Don\'t bypass.
3. Re-run the gate.
4. Commit the fix. Cite the original failure.
5. If you can\'t fix it, say so honestly. "NOT YET IMPLEMENTED" or "BLOCKED: needs [specific]."

## The 8 forbidden patterns

1. `// TODO` / `// FIXME` as substitutes for fixing
2. `console.log("test")` in production
3. Empty `catch {}` blocks
4. `any` types (use `unknown` and narrow)
5. Hardcoded user-facing strings (use i18n)
6. Inline `style={{...}}` in JSX (use tokens)
7. Direct to master commits (use PR + lane)
8. `--no-verify` / `[skip ci]`

## How to know if you are doing the right thing

Ask yourself:
1. Is my action attributable to a named agent?
2. Is my action signed in the audit log?
3. Did I run the gate suite and pass?
4. Did I introduce any fabricated data?
5. Did I bypass any gate?
6. Did I commit any secrets?

If all 6 are yes, ship it. If any is no, fix it.
