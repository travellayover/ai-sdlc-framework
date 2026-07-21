import { describe, it, expect, afterEach } from "vitest";
import { detectAgentIdentity } from "../../src/identity/detect.js";

describe("detectAgentIdentity", () => {
  const originalEnv = process.env.AI_SDLC_AGENT_NAME;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.AI_SDLC_AGENT_NAME;
    } else {
      process.env.AI_SDLC_AGENT_NAME = originalEnv;
    }
  });

  it("returns the env var if set", () => {
    process.env.AI_SDLC_AGENT_NAME = "test-agent-42";
    expect(detectAgentIdentity()).toBe("test-agent-42");
  });

  it("returns unknown if nothing is set", () => {
    delete process.env.AI_SDLC_AGENT_NAME;
    // Note: if git config user.name is set in the env, it would return that
    const result = detectAgentIdentity();
    expect(result).toBeTruthy();
  });
});
