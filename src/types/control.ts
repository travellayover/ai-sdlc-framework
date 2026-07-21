/**
 * A compliance control. A gate runs against a control, finds evidence,
 * and produces a result. Per PHILOSOPHY §1, the result is real (with
 * evidence) or honestly absent (NOT YET IMPLEMENTED).
 */

import type { Pillar } from "./pillar.js";

export type ControlStatus = "implemented" | "stub";

export interface Control {
  /** Unique control ID, e.g. "SOC 2 CC6.1" */
  id: string;
  /** Human-readable title */
  title: string;
  /** Which pillar this control belongs to */
  pillar: Pillar;
  /** Is this a real gate or a stub? */
  status: ControlStatus;
  /** What the control verifies */
  spec: string;
  /** What evidence the gate looks for */
  evidenceSource: string;
  /** When status is "stub", what "implemented" would look like */
  stubSpec?: string;
}
