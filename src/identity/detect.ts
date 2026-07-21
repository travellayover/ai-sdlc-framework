/**
 * Detect the current agent identity from the environment.
 * Per HIPAA §164.312(a)(2)(i), every action must be attributable to
 * a named agent. The framework pulls the identity from:
 *   - AI_SDLC_AGENT_NAME env var (set by the agent runtime)
 *   - GIT_AUTHOR_NAME env var (set by git)
 *   - "unknown" if neither is set
 */

import { execFileSync } from "node:child_process";

export function detectAgentIdentity(target?: string): string {
  const fromEnv = process.env.AI_SDLC_AGENT_NAME;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim();

  if (target) {
    try {
      const name = execFileSync(
        "git",
        ["-C", target, "config", "user.name"],
        { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] },
      ).trim();
      if (name) return name;
    } catch {
      // ignore
    }
  }

  return "unknown";
}
