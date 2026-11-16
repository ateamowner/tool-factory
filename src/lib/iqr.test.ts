import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { iqr, parseNumbers } from "./iqr.ts";

describe("iqr", () => {
  it("parses mixed separators", () => {
    assert.deepEqual(parseNumbers("1, 2;3\n4 5"), [1, 2, 3, 4, 5]);
    assert.equal(parseNumbers("1, x"), null);
  });
  it("exclusive method", () => {
    const r = iqr("1 2 3 4 5 6 7 8 9 10 11", "exclusive");
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.q1, 3);
      assert.equal(r.median, 6);
      assert.equal(r.q3, 9);
      assert.equal(r.iqr, 6);
    }
  });
  it("inclusive method matches QUARTILE.INC", () => {
    const r = iqr("1 2 3 4 5 6 7 8 9 10", "inclusive");
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.q1, 3.25);
      assert.equal(r.median, 5.5);
      assert.equal(r.q3, 7.75);
    }
  });
  it("exclusive on even count", () => {
    const r = iqr("1 2 3 4 5 6 7 8", "exclusive");
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.q1, 2.25);
      assert.equal(r.q3, 6.75);
    }
  });
  it("finds outliers with the 1.5 x IQR fences", () => {
    const r = iqr("1 2 3 4 5 6 7 8 9 50", "exclusive");
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.q1, 2.75);
      assert.equal(r.q3, 8.25);
      assert.deepEqual(r.outliers, [50]);
      assert.equal(r.max, 50);
      assert.equal(r.min, 1);
    }
  });
  it("rejects bad input", () => {
    assert.equal(iqr("5").valid, false);
    assert.equal(iqr("a b").valid, false);
  });
});
