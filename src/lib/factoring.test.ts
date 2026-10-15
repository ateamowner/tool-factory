import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeFactoring } from "./factoring.ts";

describe("computeFactoring", () => {
  it("factorizes a composite number", () => {
    const r = computeFactoring(360);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.n, 360);
      assert.equal(r.factorization, "2^3 × 3^2 × 5");
      assert.deepEqual(r.primes, [[2, 3], [3, 2], [5, 1]]);
      assert.deepEqual(r.factors, [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120, 180, 360]);
      assert.equal(r.factorCount, 24);
      assert.equal(r.kind, "composite");
    }
  });

  it("detects a prime", () => {
    const r = computeFactoring(97);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.factorization, "97");
      assert.deepEqual(r.factors, [1, 97]);
      assert.equal(r.factorCount, 2);
      assert.equal(r.kind, "prime");
    }
  });

  it("treats 1 as neither prime nor composite", () => {
    const r = computeFactoring(1);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.factorization, "1");
      assert.deepEqual(r.factors, [1]);
      assert.equal(r.factorCount, 1);
      assert.equal(r.kind, "one");
    }
  });

  it("accepts string input", () => {
    const r = computeFactoring(" 12 ");
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.n, 12);
      assert.equal(r.factorization, "2^2 × 3");
      assert.deepEqual(r.factors, [1, 2, 3, 4, 6, 12]);
      assert.equal(r.kind, "composite");
    }
  });

  it("rejects empty, non-integer, zero, negative, and oversized values", () => {
    assert.equal(computeFactoring("").valid, false);
    assert.equal(computeFactoring("  ").valid, false);
    assert.equal(computeFactoring(1.5).valid, false);
    assert.equal(computeFactoring("12.3").valid, false);
    assert.equal(computeFactoring(0).valid, false);
    assert.equal(computeFactoring(-12).valid, false);
    assert.equal(computeFactoring("abc").valid, false);
    assert.equal(computeFactoring(1_000_000_000_001).valid, false);
  });

  it("handles a perfect square", () => {
    const r = computeFactoring(36);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.factorization, "2^2 × 3^2");
      assert.deepEqual(r.factors, [1, 2, 3, 4, 6, 9, 12, 18, 36]);
      assert.equal(r.factorCount, 9);
    }
  });
});
