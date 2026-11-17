import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fromPointSlope, fromSlopeIntercept, numberToStandardForm, parseRational } from "./standard-form.ts";

describe("standard form", () => {
  it("parses decimals and fractions", () => {
    assert.deepEqual(parseRational("0.75"), { n: 3, d: 4 });
    assert.deepEqual(parseRational("-2/4"), { n: -1, d: 2 });
    assert.equal(parseRational("abc"), null);
    assert.equal(parseRational("1/0"), null);
  });
  it("slope-intercept to standard form", () => {
    const r = fromSlopeIntercept("2", "3");
    assert.ok(r.valid);
    if (r.valid) assert.deepEqual([r.a, r.b, r.c], [2, -1, -3]);
  });
  it("clears fractions", () => {
    const r = fromSlopeIntercept("2/3", "4");
    assert.ok(r.valid);
    if (r.valid) {
      assert.deepEqual([r.a, r.b, r.c], [2, -3, -12]);
      assert.equal(r.equation, "2x − 3y = −12");
    }
  });
  it("negative slope keeps A positive", () => {
    const r = fromSlopeIntercept("-3", "5");
    assert.ok(r.valid);
    if (r.valid) assert.deepEqual([r.a, r.b, r.c], [3, 1, 5]);
  });
  it("point-slope to standard form", () => {
    const r = fromPointSlope("2", "1", "2");
    assert.ok(r.valid);
    if (r.valid) assert.deepEqual([r.a, r.b, r.c], [2, -1, 0]);
    const r2 = fromPointSlope("-1/2", "4", "1");
    assert.ok(r2.valid);
    if (r2.valid) assert.deepEqual([r2.a, r2.b, r2.c], [1, 2, 6]);
  });
  it("horizontal line", () => {
    const r = fromSlopeIntercept("0", "5");
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.equation, "y = 5");
  });
  it("rejects bad input", () => {
    assert.equal(fromSlopeIntercept("x", "1").valid, false);
  });
  it("number to standard form", () => {
    const r = numberToStandardForm("45,000");
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.text, "4.5 × 10⁴");
    const s = numberToStandardForm("0.00032");
    assert.ok(s.valid);
    if (s.valid) assert.equal(s.text, "3.2 × 10⁻⁴");
    assert.equal(numberToStandardForm("abc").valid, false);
  });
});
