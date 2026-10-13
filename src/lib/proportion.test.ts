import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkProportion, solveProportion } from "./proportion.ts";

describe("solveProportion", () => {
  it("solves for D", () => {
    const r = solveProportion(2, 3, 10, Number.NaN);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.missing, "d");
      assert.equal(r.value, 15);
      assert.equal(r.scale, 5);
    }
  });
  it("solves for A, B, and C", () => {
    const a = solveProportion(Number.NaN, 3, 10, 15);
    const b = solveProportion(2, Number.NaN, 10, 15);
    const c = solveProportion(2, 3, Number.NaN, 15);
    assert.ok(a.valid && b.valid && c.valid);
    if (a.valid && b.valid && c.valid) {
      assert.equal(a.value, 2);
      assert.equal(b.value, 3);
      assert.equal(c.value, 10);
    }
  });
  it("handles decimals", () => {
    const r = solveProportion(1.5, 4, Number.NaN, 12);
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.value, 4.5);
  });
  it("requires exactly one blank", () => {
    assert.equal(solveProportion(1, 2, 3, 4).valid, false);
    assert.equal(solveProportion(1, Number.NaN, Number.NaN, 4).valid, false);
  });
  it("guards against dividing by zero", () => {
    assert.equal(solveProportion(0, 3, 10, Number.NaN).valid, false);
    assert.equal(solveProportion(2, 0, Number.NaN, 15).valid, false);
    assert.equal(solveProportion(Number.NaN, 3, 10, 0).valid, false);
  });
});

describe("checkProportion", () => {
  it("confirms equal ratios", () => {
    const r = checkProportion(2, 3, 10, 15);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.proportional, true);
      assert.equal(r.leftProduct, 30);
      assert.equal(r.rightProduct, 30);
      assert.equal(r.scale, 5);
    }
  });
  it("tolerates floating point noise", () => {
    const r = checkProportion(0.1, 0.3, 1, 3);
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.proportional, true);
  });
  it("reports unequal ratios", () => {
    const r = checkProportion(2, 3, 10, 14);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.proportional, false);
      assert.equal(r.leftProduct, 28);
      assert.equal(r.rightProduct, 30);
    }
  });
  it("guards zero denominators and blanks", () => {
    assert.equal(checkProportion(2, 0, 10, 15).valid, false);
    assert.equal(checkProportion(2, 3, 10, 0).valid, false);
    assert.equal(checkProportion(2, 3, Number.NaN, 15).valid, false);
  });
  it("uses D / B as the scale when A is zero", () => {
    const r = checkProportion(0, 4, 0, 8);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.proportional, true);
      assert.equal(r.scale, 2);
    }
  });
});
