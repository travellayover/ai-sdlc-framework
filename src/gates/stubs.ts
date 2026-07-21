/**
 * The 12 stub controls for v0.1. Each returns "not-implemented" with
 * an honest description of what "implemented" would look like.
 *
 * Per PHILOSOPHY §1 and §6: a gate is either a real gate that runs
 * against real evidence, or a stub that returns NOT YET IMPLEMENTED
 * with the spec. There is no middle ground.
 */

import { registerGate } from "./index.js";
import type { Control } from "../types/control.js";
import type { GateOutput } from "../types/report.js";

interface StubDef {
  control: Control;
}

const STUBS: StubDef[] = [
  {
    control: {
      id: "SOC 2 CC6.2",
      title: "Prior authorization for access",
      pillar: "identity-and-access",
      status: "stub",
      spec: "Access to sensitive resources requires prior authorization recorded in the audit log.",
      evidenceSource: "audit log entries with type=access-grant and approvedBy",
      stubSpec: "Would scan audit/ for access-grant entries; verify each has an approver.",
    },
  },
  {
    control: {
      id: "SOC 2 CC6.3",
      title: "Access removal on termination",
      pillar: "identity-and-access",
      status: "stub",
      spec: "Agent identity keys are revoked within 24h of agent retirement.",
      evidenceSource: "identity registry with retiredAt timestamp",
      stubSpec: "Would scan identity registry for retired agents without retiredAt.",
    },
  },
  {
    control: {
      id: "ISO 42001 A.5.3",
      title: "Segregation of duties",
      pillar: "identity-and-access",
      status: "stub",
      spec: "The agent that writes code is not the agent that reviews or deploys it.",
      evidenceSource: "audit log showing distinct agents for write, review, deploy",
      stubSpec: "Would scan audit/ for the same agent ID across write+review+deploy.",
    },
  },
  {
    control: {
      id: "SOC 2 CC7.1",
      title: "System operations monitoring",
      pillar: "code-integrity",
      status: "stub",
      spec: "The project has structured logging, log retention >= 90 days, and log integrity checks.",
      evidenceSource: "logging configuration in target project",
      stubSpec: "Would verify log infrastructure, retention policy, and integrity checks.",
    },
  },
  {
    control: {
      id: "SOC 2 CC7.2",
      title: "Anomaly detection",
      pillar: "operational-trust",
      status: "stub",
      spec: "The audit log is monitored for anomalies (unusual agents, unusual commands).",
      evidenceSource: "anomaly detection config in CI",
      stubSpec: "Would verify a CI rule that flags high-volume or unusual agent actions.",
    },
  },
  {
    control: {
      id: "SOC 2 CC8.1",
      title: "Change management process",
      pillar: "change-management",
      status: "stub",
      spec: "All changes follow a documented change management process with risk assessment.",
      evidenceSource: "PR template requiring risk assessment fields",
      stubSpec: "Would verify PR template includes risk fields, rollback plan, and reviewer.",
    },
  },
  {
    control: {
      id: "SOC 2 CC9.1",
      title: "Risk mitigation",
      pillar: "operational-trust",
      status: "stub",
      spec: "Identified risks have documented mitigations.",
      evidenceSource: "risk register in the project",
      stubSpec: "Would verify a docs/RISKS.md or similar exists with mitigations.",
    },
  },
  {
    control: {
      id: "HIPAA §164.308(a)(1)(ii)(A)",
      title: "Risk analysis",
      pillar: "change-management",
      status: "stub",
      spec: "A documented risk analysis of AI agent activity is performed periodically.",
      evidenceSource: "docs/RISK-ANALYSIS.md or similar",
      stubSpec: "Would verify a risk analysis document with date and author.",
    },
  },
  {
    control: {
      id: "HIPAA §164.312(c)(1)",
      title: "Integrity",
      pillar: "code-integrity",
      status: "stub",
      spec: "Mechanisms to verify that data has not been altered or destroyed.",
      evidenceSource: "hash checksums on data files",
      stubSpec: "Would compute and store SHA-256 checksums of key files.",
    },
  },
  {
    control: {
      id: "SOC 2 CC7.3",
      title: "Incident detection and response",
      pillar: "code-integrity",
      status: "stub",
      spec: "Security incidents are detected, reported, and responded to within defined SLAs.",
      evidenceSource: "incident response plan and recent incident logs",
      stubSpec: "Would verify an incident response plan exists and recent incidents have postmortems.",
    },
  },
  {
    control: {
      id: "ISO 42001 A.5.2",
      title: "AI policy",
      pillar: "change-management",
      status: "stub",
      spec: "An AI policy is documented and approved by leadership.",
      evidenceSource: "docs/AI-POLICY.md with approver signature",
      stubSpec: "Would verify a signed AI policy exists and is current.",
    },
  },
  {
    control: {
      id: "ISO 42001 A.7.1",
      title: "Operational planning",
      pillar: "operational-trust",
      status: "stub",
      spec: "Operational plans for AI systems are documented.",
      evidenceSource: "docs/OPERATIONS.md or similar",
      stubSpec: "Would verify operational runbook exists.",
    },
  },
  {
    control: {
      id: "ISO 42001 A.9.4",
      title: "Monitoring and review",
      pillar: "audit-trail",
      status: "stub",
      spec: "AI systems are continuously monitored and reviewed for performance and impact.",
      evidenceSource: "monitoring configuration in CI",
      stubSpec: "Would verify a CI monitor reports TrustScore trends over time.",
    },
  },
  {
    control: {
      id: "ISO 42001 A.9.5",
      title: "Record retention",
      pillar: "audit-trail",
      status: "stub",
      spec: "Audit records are retained for the period required by applicable regulations.",
      evidenceSource: "retention policy in the audit log config",
      stubSpec: "Would verify audit logs are retained for >= 6 years (HIPAA) and not force-pushed.",
    },
  },
];

async function makeStubRun(control: Control) {
  return async (_target: string, agent: string): Promise<GateOutput> => {
    return {
      controlId: control.id,
      result: "not-implemented",
      summary: `${control.title} is documented but not yet implemented in v0.1.`,
      evidence: [
        {
          location: `controls/${control.id}.json`,
          content: control.stubSpec ?? control.spec,
          kind: "file",
        },
      ],
      remediation:
        "This control is on the v0.1.1 roadmap. " +
        "Per PHILOSOPHY §1, this is reported honestly as not implemented, " +
        "not as 'in progress' or 'tracked'.",
      ranAt: new Date().toISOString(),
      ranBy: agent,
    };
  };
}

for (const stub of STUBS) {
  registerGate(stub.control, await makeStubRun(stub.control));
}

export { STUBS };
