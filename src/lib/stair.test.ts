import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeStairs, formatFeetInches, riserCount, stairAngleDeg } from "./stair.ts";

describe("stair formulas", () => {
  it("counts risers so none exceed the max", () => {
    assert.equal(riserCount(108, 7.75), 14);
    assert.equal(riserCount(105, 7.5), 14);
    assert.equal(riserCount(0, 7.75), 0);
  });
  it("computes a standard 9 ft flight", () => {
    const r = computeStairs({ totalRiseIn: "108", maxRiserIn: "7.75", treadDepthIn: "10" });
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.risers, 14);
    assert.equal(r.treads, 13);
    assert.ok(Math.abs(r.riserHeightIn - 7.714) < 0.001);
    assert.equal(r.totalRunIn, 130);
    assert.ok(Math.abs(r.stringerLengthIn - Math.hypot(108, 130)) < 1e-9);
    assert.ok(Math.abs(r.angleDeg - 37.65) < 0.05);
    assert.deepEqual(r.warnings, []);
  });
  it("flags values outside typical residential limits", () => {
    const r = computeStairs({ totalRiseIn: "100", maxRiserIn: "9", treadDepthIn: "9" });
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.ok(r.warnings.some((w) => w.includes("riser")));
    assert.ok(r.warnings.some((w) => w.includes("Tread")));
  });
  it("rejects bad input", () => {
    assert.equal(computeStairs({ totalRiseIn: "", maxRiserIn: "7.75", treadDepthIn: "10" }).valid, false);
    assert.equal(computeStairs({ totalRiseIn: "abc", maxRiserIn: "7.75", treadDepthIn: "10" }).valid, false);
    assert.equal(computeStairs({ totalRiseIn: "108", maxRiserIn: "0", treadDepthIn: "10" }).valid, false);
  });
  it("angle and formatting", () => {
    assert.ok(Math.abs(stairAngleDeg(7, 11) - 32.47) < 0.01);
    assert.equal(formatFeetInches(130), "10 ft 10 in");
    assert.equal(formatFeetInches(7.714), "7 11/16 in");
    assert.equal(formatFeetInches(0), "0 in");
  });
});
