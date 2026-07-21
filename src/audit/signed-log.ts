/**
 * The signed audit log. Append-only, HMAC-chained, tamper-evident.
 *
 * Per PHILOSOPHY §2-4:
 *   §2: every entry is signed
 *   §3: append-only
 *   §4: chain-hashed (each entry\'s signature includes the prev hash)
 *
 * The chain is verifiable: tampering with any entry invalidates the
 * chain at the point of tampering.
 */

import { createHmac, randomBytes } from "node:crypto";
import { appendFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { AuditEntry } from "./entry.js";

export interface SignOptions {
  /** Path to the audit log directory (e.g. /path/to/project/audit) */
  auditDir: string;
  /** HMAC key (per-agent). If not provided, a dev key is used. */
  key?: string;
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map((v) => canonicalize(v)).join(",") + "]";
  }
  // Object: sort keys recursively
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const pairs = keys.map((k) => JSON.stringify(k) + ":" + canonicalize((value as Record<string, unknown>)[k]));
  return "{" + pairs.join(",") + "}";
}

function sign(canonical: string, key: string): string {
  return createHmac("sha256", key).update(canonical).digest("hex");
}

function todayPath(auditDir: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return join(auditDir, `${today}.log`);
}

function getLastHash(auditDir: string): string {
  // Walk back through daily logs to find the most recent entry\'s signature
  if (!existsSync(auditDir)) return "0".repeat(64);

  const files = readdirSync(auditDir)
    .filter((f) => f.endsWith(".log"))
    .sort()
    .reverse();

  for (const f of files) {
    const content = readFileSync(join(auditDir, f), "utf-8").trim();
    if (!content) continue;
    const lines = content.split("\n");
    const last = lines[lines.length - 1];
    if (!last) continue;
    try {
      const entry = JSON.parse(last) as AuditEntry;
      return entry.signature;
    } catch {
      continue;
    }
  }
  return "0".repeat(64);
}

export function appendEntry(
  opts: SignOptions,
  partial: Omit<AuditEntry, "timestamp" | "prevHash" | "signature">,
): AuditEntry {
  const key = opts.key ?? "dev-key-not-for-production-use";
  const auditDir = opts.auditDir;
  mkdirSync(auditDir, { recursive: true });

  const prevHash = getLastHash(auditDir);
  const timestamp = new Date().toISOString();

  const toSign = { ...partial, timestamp, prevHash };
  const canonical = canonicalize(toSign);
  const signature = sign(canonical, key);

  const entry: AuditEntry = { ...toSign, signature };

  const line = JSON.stringify(entry) + "\n";
  appendFileSync(todayPath(auditDir), line, "utf-8");

  return entry;
}

export function verifyChain(auditDir: string, key?: string): {
  valid: boolean;
  entriesChecked: number;
  firstInvalidEntry?: number;
  reason?: string;
} {
  if (!existsSync(auditDir)) {
    return { valid: true, entriesChecked: 0 };
  }

  // (replaced with imports below)
  const files = readdirSync(auditDir)
    .filter((f) => f.endsWith(".log"))
    .sort();

  let expectedPrev = "0".repeat(64);
  let entriesChecked = 0;
  const useKey = key ?? "dev-key-not-for-production-use";

  for (const f of files) {
    const content = readFileSync(join(auditDir, f), "utf-8").trim();
    if (!content) continue;
    const lines = content.split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      let entry: AuditEntry;
      try {
        entry = JSON.parse(line) as AuditEntry;
      } catch (err) {
        return {
          valid: false,
          entriesChecked,
          firstInvalidEntry: entriesChecked,
          reason: `Failed to parse entry: ${err instanceof Error ? err.message : String(err)}`,
        };
      }

      if (entry.prevHash !== expectedPrev) {
        return {
          valid: false,
          entriesChecked,
          firstInvalidEntry: entriesChecked,
          reason: `Chain broken at entry ${String(entriesChecked)}: prevHash mismatch`,
        };
      }

      const { signature, ...rest } = entry;
      const canonical = canonicalize(rest as Omit<AuditEntry, "signature">);
      const expectedSignature = sign(canonical, useKey);

      if (signature !== expectedSignature) {
        return {
          valid: false,
          entriesChecked,
          firstInvalidEntry: entriesChecked,
          reason: `Signature mismatch at entry ${String(entriesChecked)}`,
        };
      }

      expectedPrev = entry.signature;
      entriesChecked++;
    }
  }

  return { valid: true, entriesChecked };
}

export function generateKey(): string {
  return randomBytes(32).toString("hex");
}
