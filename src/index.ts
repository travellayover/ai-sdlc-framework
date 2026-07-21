/**
 * The framework\'s public API. Importing this module registers all
 * gates and exposes the runner, audit log, and identity helpers.
 */

// Register all gates (side effects)
import "./gates/soc2/cc6.1-logical-access.js";
import "./gates/soc2/cc8.1-change-management.js";
import "./gates/hipaa/164.312a2i-unique-user.js";
import "./gates/hipaa/164.312b-audit-controls.js";
import "./gates/iso42001/a.5.2-ai-policy.js";
import "./gates/iso42001/a.6.1.2-lifecycle.js";
import "./gates/stubs.js";

export { run } from "./runner/index.js";
export { initProject } from "./runner/init.js";
export { appendEntry, verifyChain, generateKey } from "./audit/signed-log.js";
export { detectAgentIdentity } from "./identity/detect.js";
export { registerGate, getGate, listGates, listControls } from "./gates/index.js";
export { PILLARS, PILLAR_WEIGHT, PILLAR_LABELS, PILLAR_ANCHORS } from "./types/pillar.js";
export type { Pillar } from "./types/pillar.js";
export type { Control, ControlStatus } from "./types/control.js";
export type { ComplianceReport, GateOutput, GateResult, Evidence, PillarScore } from "./types/report.js";
export type { AuditEntry } from "./audit/entry.js";
