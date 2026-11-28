import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeVoltageDrop, sizesFor, TABLE_8_OHMS_PER_KFT } from "./voltage-drop.ts";

describe("computeVoltageDrop", () => {
  it("single phase copper 12 AWG, 100 ft, 20 A, 120 V", () => {
    const r = computeVoltageDrop({ material: "copper", awg: "12", lengthFt: 100, amps: 20, volts: 120, phase: "single" });
    assert.ok(r.valid);
    if (r.valid) {
      assert.ok(Math.abs(r.voltsDropped - 7.92) < 1e-9);
      assert.ok(Math.abs(r.percentDrop - 6.6) < 1e-9);
      assert.ok(Math.abs(r.voltageAtLoad - 112.08) < 1e-9);
      assert.equal(r.withinGuideline, false);
      assert.equal(r.smallestAwg, "8");
    }
  });
  it("three phase uses sqrt(3)", () => {
    const r = computeVoltageDrop({ material: "copper", awg: "10", lengthFt: 200, amps: 30, volts: 480, phase: "three" });
    assert.ok(r.valid);
    if (r.valid) assert.ok(Math.abs(r.voltsDropped - (Math.sqrt(3) * 1.24 * 200 * 30) / 1000) < 1e-9);
  });
  it("aluminum is higher resistance than copper at the same size", () => {
    for (const s of sizesFor("aluminum")) {
      assert.ok((TABLE_8_OHMS_PER_KFT.aluminum[s] as number) > (TABLE_8_OHMS_PER_KFT.copper[s] as number));
    }
  });
  it("aluminum 14 AWG is not in Table 8", () => {
    const r = computeVoltageDrop({ material: "aluminum", awg: "14", lengthFt: 50, amps: 10, volts: 120, phase: "single" });
    assert.equal(r.valid, false);
  });
  it("rejects bad input", () => {
    assert.equal(computeVoltageDrop({ material: "copper", awg: "12", lengthFt: 0, amps: 10, volts: 120, phase: "single" }).valid, false);
    assert.equal(computeVoltageDrop({ material: "copper", awg: "12", lengthFt: 10, amps: NaN, volts: 120, phase: "single" }).valid, false);
  });
  it("returns null when no listed size is under 3%", () => {
    const r = computeVoltageDrop({ material: "copper", awg: "4/0", lengthFt: 5000, amps: 200, volts: 120, phase: "single" });
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.smallestAwg, null);
  });
});
