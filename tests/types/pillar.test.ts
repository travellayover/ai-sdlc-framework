import { describe, it, expect } from "vitest";
import { PILLARS, PILLAR_WEIGHT, PILLAR_LABELS, PILLAR_ANCHORS } from "../../src/types/pillar.js";

describe("Pillar", () => {
  it("has 5 pillars", () => {
    expect(PILLARS.length).toBe(5);
  });

  it("each pillar is 20 points", () => {
    expect(PILLAR_WEIGHT).toBe(20);
    expect(PILLAR_WEIGHT * PILLARS.length).toBe(100);
  });

  it("every pillar has a label", () => {
    for (const p of PILLARS) {
      expect(PILLAR_LABELS[p]).toBeTruthy();
    }
  });

  it("every pillar has at least one compliance anchor", () => {
    for (const p of PILLARS) {
      expect(PILLAR_ANCHORS[p].length).toBeGreaterThan(0);
    }
  });

  it("pillars cover SOC 2, HIPAA, and ISO 42001", () => {
    const allAnchors = Object.values(PILLAR_ANCHORS).flat().join(" ");
    expect(allAnchors).toContain("SOC 2");
    expect(allAnchors).toContain("HIPAA");
    expect(allAnchors).toContain("ISO 42001");
  });
});
