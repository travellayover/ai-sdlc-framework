/**
 * The 5 pillars of the AI-SDLC Framework TrustScore.
 * Each pillar is 20 points. Total is 100.
 */

export const PILLAR_WEIGHT = 20;

export const PILLARS = [
  "identity-and-access",
  "change-management",
  "code-integrity",
  "operational-trust",
  "audit-trail",
] as const;

export type Pillar = typeof PILLARS[number];

export const PILLAR_LABELS: Record<Pillar, string> = {
  "identity-and-access": "Identity & Access",
  "change-management": "Change Management",
  "code-integrity": "Code Integrity",
  "operational-trust": "Operational Trust",
  "audit-trail": "Audit Trail",
};

/**
 * Compliance framework anchors per pillar.
 * Used to document the regulatory mapping.
 */
export const PILLAR_ANCHORS: Record<Pillar, string[]> = {
  "identity-and-access": ["SOC 2 CC6.x", "ISO 42001 A.5"],
  "change-management": ["SOC 2 CC8.x", "ISO 42001 A.6"],
  "code-integrity": ["SOC 2 CC7.x", "HIPAA §164.312(a)(2)(i)"],
  "operational-trust": ["SOC 2 CC9.x", "ISO 42001 A.7"],
  "audit-trail": ["HIPAA §164.312(b)", "ISO 42001 A.9"],
};
