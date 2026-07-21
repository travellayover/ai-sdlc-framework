/**
 * Gate registry. Each gate is registered here.
 * The gate runner (src/runner/index.ts) iterates over this registry.
 */

import type { Control } from "../types/control.js";
import type { GateOutput } from "../types/report.js";
import type { Pillar } from "../types/pillar.js";

export type Gate = (
  target: string,
  agent: string,
) => Promise<GateOutput>;

interface RegisteredGate {
  control: Control;
  gate: Gate;
}

const registry: Map<string, RegisteredGate> = new Map();

export function registerGate(control: Control, gate: Gate): void {
  if (registry.has(control.id)) {
    throw new Error(`Gate already registered: ${control.id}`);
  }
  registry.set(control.id, { control, gate });
}

export function getGate(controlId: string): RegisteredGate | undefined {
  return registry.get(controlId);
}

export function listGates(pillar?: Pillar): RegisteredGate[] {
  const all = Array.from(registry.values());
  return pillar ? all.filter((g) => g.control.pillar === pillar) : all;
}

export function listControls(pillar?: Pillar): Control[] {
  return listGates(pillar).map((g) => g.control);
}
