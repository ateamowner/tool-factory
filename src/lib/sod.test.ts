import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeSod, sodArea, unitsNeeded, type SodInput } from "./sod.ts";

const base: SodInput = {
  mode: "dimensions",
  areaSqFt: "",
  length: "50",
  width: "20",
  wastePercent: "0",
  rollSqFt: "10",
  palletSqFt: "450",
};

describe("sod formulas", () => {
  it("area is length × width", () => {
    assert.equal(sodArea(50, 20), 1000);
  });
  it("rounds units up", () => {
    assert.equal(unitsNeeded(1000, 10), 100);
    assert.equal(unitsNeeded(1001, 10), 101);
    assert.equal(unitsNeeded(0, 10), 0);
  });
});

describe("computeSod", () => {
  it("50 × 20 ft lawn needs 100 rolls and 3 pallets", () => {
    const r = computeSod(base);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.baseSqFt, 1000);
      assert.equal(r.rolls, 100);
      assert.equal(r.pallets, 3);
    }
  });
  it("adds waste", () => {
    const r = computeSod({ ...base, wastePercent: "10" });
    assert.ok(r.valid);
    if (r.valid) {
      assert.ok(Math.abs(r.sqFtWithWaste - 1100) < 1e-9);
      assert.equal(r.rolls, 110);
      assert.equal(r.pallets, 3);
    }
  });
  it("uses area mode and custom roll and pallet sizes", () => {
    const r = computeSod({ ...base, mode: "area", areaSqFt: "2,000", rollSqFt: "16", palletSqFt: "500" });
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.baseSqFt, 2000);
      assert.equal(r.rolls, 125);
      assert.equal(r.pallets, 4);
    }
  });
  it("rejects bad input", () => {
    assert.equal(computeSod({ ...base, length: "abc" }).valid, false);
    assert.equal(computeSod({ ...base, length: "0" }).valid, false);
    assert.equal(computeSod({ ...base, wastePercent: "-5" }).valid, false);
    assert.equal(computeSod({ ...base, rollSqFt: "0" }).valid, false);
  });
});
