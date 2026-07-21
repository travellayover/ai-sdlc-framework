/**
 * An audit log entry. Per PHILOSOPHY §2-4, every entry is signed,
 * append-only, and chain-hashed.
 */

export interface AuditEntry {
  /** ISO timestamp */
  timestamp: string;
  /** Which lane / PR / action this entry represents */
  lane: string;
  /** Per-agent identity (per HIPAA §164.312(a)(2)(i)) */
  agent: string;
  /** Type of action: commit, pr, deploy, gate-run, config-change */
  action: string;
  /** Action-specific data (commit SHA, PR number, gate ID, etc.) */
  data: Record<string, string | number | boolean | null>;
  /** Hash of the previous entry (chain) */
  prevHash: string;
  /** HMAC of this entry\'s canonical form */
  signature: string;
}
