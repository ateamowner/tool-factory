import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gcd, parseAmount, simplifyRatio, solveRatio } from "./ratio.ts";

describe("simplifyRatio", () => {
  it("simplifies 16:9 style ratios", () => {
    const r = simplifyRatio(1920, 1080);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.left, 16);
      assert.equal(r.right, 9);
      assert.equal(r.factor, 120);
    }
  });
  it("handles decimals", () => {
    const r = simplifyRatio(1.5, 2.5);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.left, 3);
      assert.equal(r.right, 5);
      assert.ok(Math.abs(r.percentLeft - 37.5) < 1e-9);
    }
  });
  it("rejects zero and negatives", () => {
    assert.equal(simplifyRatio(0, 4).valid, false);
    assert.equal(simplifyRatio(-2, 4).valid, false);
    assert.equal(simplifyRatio(Number.NaN, 4).valid, false);
  });
});

describe("solveRatio", () => {
  it("solves for D", () => {
    const r = solveRatio(2, 3, 10, Number.NaN);
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.value, 15);
  });
  it("solves for A, B, and C", () => {
    const a = solveRatio(Number.NaN, 3, 10, 15);
    const b = solveRatio(2, Number.NaN, 10, 15);
    const c = solveRatio(2, 3, Number.NaN, 15);
    assert.ok(a.valid && a.value === 2);
    assert.ok(b.valid && b.value === 3);
    assert.ok(c.valid && c.value === 10);
  });
  it("requires exactly one blank", () => {
    assert.equal(solveRatio(1, 2, 3, 4).valid, false);
    assert.equal(solveRatio(Number.NaN, Number.NaN, 3, 4).valid, false);
  });
  it("guards division by zero", () => {
    assert.equal(solveRatio(0, 3, 10, Number.NaN).valid, false);
  });
});

describe("helpers", () => {
  it("gcd and parseAmount", () => {
    assert.equal(gcd(12, 18), 6);
    assert.equal(parseAmount("1,200"), 1200);
    assert.ok(Number.isNaN(parseAmount("")));
  });
});
