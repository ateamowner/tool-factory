import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeRoofPitch, pitchFromAngle, formatPitch } from "./roof-pitch.ts";

describe("computeRoofPitch", () => {
  it("computes a 6/12 roof", () => {
    const r = computeRoofPitch({ rise: 6, run: 12 });
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.pitchPer12, 6);
    assert.ok(Math.abs(r.angleDegrees - 26.565) < 0.001);
    assert.equal(r.slopePercent, 50);
    assert.ok(Math.abs(r.rafterMultiplier - 1.118) < 0.001);
    assert.ok(Math.abs(r.rafterLength - 13.416) < 0.001);
  });
  it("scales rise and run in any units", () => {
    const r = computeRoofPitch({ rise: 4, run: 10 });
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.ok(Math.abs(r.pitchPer12 - 4.8) < 1e-9);
    assert.equal(r.slopePercent, 40);
  });
  it("handles a flat roof", () => {
    const r = computeRoofPitch({ rise: 0, run: 12 });
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.angleDegrees, 0);
    assert.equal(r.rafterMultiplier, 1);
  });
  it("rejects bad input", () => {
    assert.equal(computeRoofPitch({ rise: 6, run: 0 }).valid, false);
    assert.equal(computeRoofPitch({ rise: -1, run: 12 }).valid, false);
    assert.equal(computeRoofPitch({ rise: NaN, run: 12 }).valid, false);
  });
});

describe("pitchFromAngle", () => {
  it("converts 45 degrees to 12/12", () => {
    assert.ok(Math.abs((pitchFromAngle(45) ?? 0) - 12) < 1e-9);
    assert.equal(pitchFromAngle(90), null);
    assert.equal(pitchFromAngle(-5), null);
  });
});

describe("formatPitch", () => {
  it("formats pitch per 12", () => {
    assert.equal(formatPitch(6), "6/12");
    assert.equal(formatPitch(4.8), "4.8/12");
  });
});
