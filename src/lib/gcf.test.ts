import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeGcf, divisors, formatFactorization, parseIntegerList, primeFactorize } from "./gcf.ts";

describe("computeGcf", () => {
  it("finds the GCF of two numbers", () => {
    const r = computeGcf([12, 18]);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.gcf, 6);
      assert.equal(r.lcm, 36);
      assert.deepEqual(r.commonFactors, [1, 2, 3, 6]);
      assert.equal(r.coprime, false);
    }
  });
  it("handles three or more numbers", () => {
    const r = computeGcf([24, 36, 60]);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.gcf, 12);
      assert.equal(r.lcm, 360);
    }
  });
  it("detects coprime numbers", () => {
    const r = computeGcf([8, 15]);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.gcf, 1);
      assert.equal(r.coprime, true);
    }
  });
  it("records Euclidean steps", () => {
    const r = computeGcf([48, 18]);
    assert.ok(r.valid);
    if (r.valid) {
      assert.deepEqual(r.steps[0], { a: 48, b: 18, q: 2, r: 12 });
      assert.equal(r.steps.at(-1)?.r, 0);
      assert.equal(r.gcf, 6);
    }
  });
  it("treats negatives by absolute value and zero correctly", () => {
    const n = computeGcf([-12, 18]);
    const z = computeGcf([0, 9]);
    assert.ok(n.valid && z.valid);
    if (n.valid && z.valid) {
      assert.equal(n.gcf, 6);
      assert.equal(z.gcf, 9);
      assert.equal(z.lcm, 0);
    }
  });
  it("rejects bad input", () => {
    assert.equal(computeGcf([5]).valid, false);
    assert.equal(computeGcf([1.5, 3]).valid, false);
    assert.equal(computeGcf([0, 0]).valid, false);
  });
});

describe("helpers", () => {
  it("parses lists with commas and spaces", () => {
    assert.deepEqual(parseIntegerList("12, 18 24"), [12, 18, 24]);
    assert.equal(parseIntegerList("12, x"), null);
  });
  it("factorizes primes", () => {
    assert.deepEqual(primeFactorize(360), [[2, 3], [3, 2], [5, 1]]);
    assert.equal(formatFactorization(primeFactorize(360)), "2^3 × 3^2 × 5");
    assert.deepEqual(primeFactorize(97), [[97, 1]]);
  });
  it("lists divisors", () => {
    assert.deepEqual(divisors(12), [1, 2, 3, 4, 6, 12]);
    assert.deepEqual(divisors(1), [1]);
  });
});
