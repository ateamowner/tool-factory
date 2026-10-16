import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeSlope, formatSlopeNumber } from "./slope.ts";

describe("computeSlope", () => {
  it("computes a positive slope with rise, run, angle, and intercept", () => {
    const r = computeSlope(1, 2, 3, 6);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.rise, 4);
      assert.equal(r.run, 2);
      assert.equal(r.slope, 2);
      assert.equal(r.vertical, false);
      assert.equal(r.horizontal, false);
      assert.ok(r.angleDegrees !== null && Math.abs(r.angleDegrees - (Math.atan(2) * 180) / Math.PI) < 1e-9);
      assert.equal(r.intercept, 0);
      assert.match(r.equation, /y/);
    }
  });

  it("computes a negative slope", () => {
    const r = computeSlope(0, 4, 2, 0);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.slope, -2);
      assert.equal(r.rise, -4);
      assert.equal(r.run, 2);
      assert.equal(r.intercept, 4);
      assert.ok(r.angleDegrees !== null && r.angleDegrees < 0);
    }
  });

  it("handles a horizontal line (slope 0)", () => {
    const r = computeSlope(-3, 5, 7, 5);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.slope, 0);
      assert.equal(r.horizontal, true);
      assert.equal(r.vertical, false);
      assert.equal(r.angleDegrees, 0);
      assert.equal(r.intercept, 5);
      assert.equal(r.equation, "y = 5");
    }
  });

  it("handles a vertical line (undefined slope)", () => {
    const r = computeSlope(4, 1, 4, 9);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.slope, null);
      assert.equal(r.vertical, true);
      assert.equal(r.horizontal, false);
      assert.equal(r.angleDegrees, null);
      assert.equal(r.intercept, null);
      assert.equal(r.equation, "x = 4");
      assert.equal(r.run, 0);
      assert.equal(r.rise, 8);
    }
  });

  it("accepts decimals and string input", () => {
    const r = computeSlope("0.5", "1.5", "2.5", "5.5");
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.slope, 2);
      assert.equal(r.rise, 4);
      assert.equal(r.run, 2);
    }
  });

  it("rejects identical points", () => {
    const r = computeSlope(3, 3, 3, 3);
    assert.equal(r.valid, false);
    if (!r.valid) assert.match(r.error, /same/i);
  });

  it("rejects empty, non-numeric, and non-finite values", () => {
    assert.equal(computeSlope("", 1, 2, 3).valid, false);
    assert.equal(computeSlope(1, "", 2, 3).valid, false);
    assert.equal(computeSlope(1, 2, "abc", 3).valid, false);
    assert.equal(computeSlope(1, 2, 3, Infinity).valid, false);
    assert.equal(computeSlope(NaN, 1, 2, 3).valid, false);
    assert.equal(computeSlope(null, 1, 2, 3).valid, false);
  });

  it("formats slope numbers without trailing zeros", () => {
    assert.equal(formatSlopeNumber(2), "2");
    assert.equal(formatSlopeNumber(0), "0");
    assert.equal(formatSlopeNumber(-0), "0");
    assert.equal(formatSlopeNumber(2.5), "2.5");
  });
});
