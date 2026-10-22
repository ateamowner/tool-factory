import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeLcm, formatHighestPowers, parseIntegerList } from "./lcm.ts";

describe("computeLcm", () => {
  it("finds the LCM of two numbers", () => {
    const r = computeLcm([12, 18]);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.lcm, 36);
      assert.equal(r.gcf, 6);
      assert.deepEqual(r.steps, [{ a: 12, b: 18, gcf: 6, lcm: 36 }]);
    }
  });
  it("handles three or more numbers", () => {
    const r = computeLcm([4, 6, 10]);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.lcm, 60);
      assert.equal(r.steps.length, 2);
      assert.equal(r.steps.at(-1)?.lcm, 60);
    }
    const s = computeLcm([2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.ok(s.valid && s.lcm === 2520);
  });
  it("shows prime factorization and highest powers", () => {
    const r = computeLcm([8, 12, 18]);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.lcm, 72);
      assert.deepEqual(r.factorizations[0].primes, [[2, 3]]);
      assert.deepEqual(r.highestPowers, [[2, 3], [3, 2]]);
      assert.equal(formatHighestPowers(r.highestPowers), "2^3 × 3^2");
    }
  });
  it("lists multiples for small LCMs", () => {
    const r = computeLcm([4, 6]);
    assert.ok(r.valid);
    if (r.valid) {
      assert.deepEqual(r.multiples[0], { n: 4, list: [4, 8, 12] });
      assert.deepEqual(r.multiples[1], { n: 6, list: [6, 12] });
    }
  });
  it("handles coprime numbers, ones, and negatives", () => {
    const c = computeLcm([8, 15]);
    const one = computeLcm([1, 7]);
    const neg = computeLcm([-4, 6]);
    assert.ok(c.valid && one.valid && neg.valid);
    if (c.valid && one.valid && neg.valid) {
      assert.equal(c.lcm, 120);
      assert.equal(one.lcm, 7);
      assert.equal(neg.lcm, 12);
    }
  });
  it("rejects bad input", () => {
    assert.equal(computeLcm([5]).valid, false);
    assert.equal(computeLcm([]).valid, false);
    assert.equal(computeLcm([1.5, 3]).valid, false);
    assert.equal(computeLcm([0, 4]).valid, false);
    assert.equal(computeLcm(Array.from({ length: 21 }, (_, i) => i + 1)).valid, false);
    assert.equal(computeLcm([2_000_000_000, 3]).valid, false);
    assert.equal(computeLcm([999_999_937, 999_999_929, 999_999_893]).valid, false);
    assert.equal(parseIntegerList("4, abc"), null);
  });
});
