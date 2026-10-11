import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateConcrete, parseAmount } from "./concrete.ts";

const base = { shape: "slab" as const, lengthFt: 10, widthFt: 10, thicknessIn: 4, diameterIn: 0, heightFt: 0, quantity: 1, wastePercent: 0 };

describe("calculateConcrete", () => {
  it("computes a 10x10x4in slab", () => {
    const r = calculateConcrete(base);
    assert.ok(r.valid);
    assert.ok(Math.abs((r.cubicFeet ?? 0) - 33.3333) < 0.001);
    assert.ok(Math.abs((r.cubicYards ?? 0) - 1.2346) < 0.001);
    assert.equal(r.bags.find((b) => b.id === "80")?.count, 56);
  });
  it("applies waste", () => {
    const r = calculateConcrete({ ...base, wastePercent: 10 });
    assert.ok(Math.abs((r.adjustedCubicFeet ?? 0) - 36.6667) < 0.001);
  });
  it("computes round columns times quantity", () => {
    const r = calculateConcrete({ ...base, shape: "column", diameterIn: 12, heightFt: 4, quantity: 2 });
    assert.ok(Math.abs((r.cubicFeet ?? 0) - Math.PI * 0.25 * 8) < 1e-9);
  });
  it("rejects bad input", () => {
    assert.equal(calculateConcrete({ ...base, lengthFt: 0 }).valid, false);
    assert.equal(calculateConcrete({ ...base, quantity: 0 }).valid, false);
    assert.equal(calculateConcrete({ ...base, wastePercent: 120 }).valid, false);
    assert.ok(Number.isNaN(parseAmount("")));
    assert.equal(parseAmount("1,200"), 1200);
  });
});
