import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeDrywall, sheetsNeeded, wallArea, type DrywallInput } from "./drywall.ts";

const base: DrywallInput = {
  length: "12",
  width: "12",
  height: "8",
  includeCeiling: false,
  doors: "0",
  windows: "0",
  sheet: "4x8",
  wastePercent: "0",
};

describe("drywall formulas", () => {
  it("wall area is perimeter × height", () => {
    assert.equal(wallArea(12, 12, 8), 384);
    assert.equal(wallArea(12, 10, 8), 352);
  });
  it("rounds sheets up", () => {
    assert.equal(sheetsNeeded(384, 32), 12);
    assert.equal(sheetsNeeded(385, 32), 13);
    assert.equal(sheetsNeeded(0, 32), 0);
  });
});

describe("computeDrywall", () => {
  it("12 × 12 × 8 walls need 12 sheets of 4 × 8", () => {
    const r = computeDrywall(base);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.netSqFt, 384);
      assert.equal(r.sheets, 12);
      assert.equal(r.screws, 384);
    }
  });
  it("adds the ceiling and waste", () => {
    const r = computeDrywall({ ...base, includeCeiling: true, wastePercent: "10" });
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.ceilingSqFt, 144);
      assert.equal(r.netSqFt, 528);
      assert.ok(Math.abs(r.sqFtWithWaste - 580.8) < 1e-9);
      assert.equal(r.sheets, 19);
    }
  });
  it("uses larger sheets and subtracts doors and windows", () => {
    const r = computeDrywall({ ...base, doors: "1", windows: "2", sheet: "4x12" });
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.openingsSqFt, 51);
      assert.equal(r.netSqFt, 333);
      assert.equal(r.sheets, 7);
    }
  });
  it("estimates compound and tape", () => {
    const r = computeDrywall({ ...base, length: "", width: "", height: "", extraSqFt: "1000" });
    assert.ok(r.valid);
    if (r.valid) {
      assert.ok(Math.abs(r.mudLb - 138) < 1e-9);
      assert.equal(r.mudPails, 3);
      assert.ok(Math.abs(r.tapeFt - 370) < 1e-9);
      assert.equal(r.tapeRolls, 1);
    }
  });
  it("rejects bad input", () => {
    assert.equal(computeDrywall({ ...base, length: "abc" }).valid, false);
    assert.equal(computeDrywall({ ...base, length: "0", width: "0" }).valid, false);
    assert.equal(computeDrywall({ ...base, wastePercent: "-5" }).valid, false);
  });
});
