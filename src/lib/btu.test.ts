import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { baseCoolingBtu, ceilingFactor, computeBtu, suggestUnit, type BtuInput } from "./btu.ts";

const base: BtuInput = {
  mode: "dimensions",
  length: "12",
  width: "15",
  areaSqFt: "",
  ceilingFt: "8",
  sun: "normal",
  people: "2",
  kitchen: false,
  climate: "moderate",
};

describe("btu formulas", () => {
  it("follows the ENERGY STAR chart", () => {
    assert.equal(baseCoolingBtu(150), 5000);
    assert.equal(baseCoolingBtu(180), 6000);
    assert.equal(baseCoolingBtu(500), 12000);
    assert.equal(baseCoolingBtu(2500), 34000);
    assert.equal(baseCoolingBtu(3000), 60000);
    assert.equal(baseCoolingBtu(0), 0);
  });
  it("scales for tall ceilings only", () => {
    assert.equal(ceilingFactor(8), 1);
    assert.equal(ceilingFactor(7), 1);
    assert.equal(ceilingFactor(10), 1.25);
  });
  it("suggests the next standard unit", () => {
    assert.equal(suggestUnit(6000), 6000);
    assert.equal(suggestUnit(6100), 8000);
    assert.equal(suggestUnit(70000), null);
  });
});

describe("computeBtu", () => {
  it("12 × 15 ft room needs 6,000 BTU", () => {
    const r = computeBtu(base);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.areaSqFt, 180);
      assert.equal(r.coolingBtu, 6000);
      assert.equal(r.suggestedUnitBtu, 6000);
      assert.equal(r.heatingBtu, 7200);
      assert.equal(r.tons, 0.5);
    }
  });
  it("applies sun, people, kitchen and ceiling", () => {
    const r = computeBtu({ ...base, sun: "sunny", people: "4", kitchen: true, ceilingFt: "10" });
    assert.ok(r.valid);
    if (r.valid) {
      // 6000 × 1.25 × 1.1 = 8250, + 1200 people + 4000 kitchen = 13450
      assert.equal(r.coolingBtu, 13500);
      assert.equal(r.suggestedUnitBtu, 14000);
    }
  });
  it("shade reduces cooling by 10%", () => {
    const r = computeBtu({ ...base, sun: "shaded" });
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.coolingBtu, 5400);
  });
  it("accepts total area", () => {
    const r = computeBtu({ ...base, mode: "area", areaSqFt: "1,000" });
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.coolingBtu, 18000);
  });
  it("rejects empty or bad input", () => {
    assert.equal(computeBtu({ ...base, length: "" }).valid, false);
    assert.equal(computeBtu({ ...base, people: "2.5" }).valid, false);
    assert.equal(computeBtu({ ...base, ceilingFt: "0" }).valid, false);
  });
});
