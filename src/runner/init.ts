/**
 * Initialize the framework in a target project.
 * Creates .ai-sdlc/config.json and the audit/ directory.
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface InitOptions {
  target: string;
  frameworkVersion: string;
}

export function initProject(opts: InitOptions): void {
  const configDir = join(opts.target, ".ai-sdlc");
  const auditDir = join(opts.target, "audit");
  const configPath = join(configDir, "config.json");

  mkdirSync(configDir, { recursive: true });
  mkdirSync(auditDir, { recursive: true });

  if (!existsSync(configPath)) {
    const config = {
      frameworkVersion: opts.frameworkVersion,
      enabledControls: "all",
      auditDir: "./audit",
      agentName: null,
    };
    writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
  }
}
