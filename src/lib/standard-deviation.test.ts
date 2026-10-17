import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeStandardDeviation, formatStatNumber, parseNumberList } from "./standard-deviation.ts";

const close = (a: number | null, b: number, eps = 1e-9) => {
  assert.ok(a !== null && Math.abs(a - b) < eps, `${a} != ${b}`);
};

describe("parseNumberList", () => {
  it("splits on commas, spaces, and newlines", () => {
    assert.deepEqual(parseNumberList("1, 2 3\n4\t5;6").values, [1, 2, 3, 4, 5, 6]);
  });

  it("accepts negatives and decimals", () => {
    assert.deepEqual(parseNumberList("-1.5, 2.25, -3").values, [-1.5, 2.25, -3]);
  });

  it("collects invalid tokens", () => {
    assert.deepEqual(parseNumberList("1, abc, 3").invalid, ["abc"]);
  });

  it("handles empty input", () => {
    assert.deepEqual(parseNumberList("").values, []);
    assert.deepEqual(parseNumberList(undefined).values, []);
  });
});

describe("computeStandardDeviation", () => {
  it("computes the classic 2,4,4,4,5,5,7,9 example", () => {
    const r = computeStandardDeviation("2, 4, 4, 4, 5, 5, 7, 9");
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.count, 8);
      assert.equal(r.sum, 40);
      assert.equal(r.mean, 5);
      assert.equal(r.sumSquares, 32);
      assert.equal(r.populationVariance, 4);
      assert.equal(r.populationStdDev, 2);
      close(r.sampleVariance, 32 / 7);
      close(r.sampleStdDev, Math.sqrt(32 / 7));
      assert.deepEqual(r.squaredDeviations, [9, 1, 1, 1, 0, 0, 4, 16]);
    }
  });

  it("returns zero spread for identical values", () => {
    const r = computeStandardDeviation("3 3 3");
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.populationStdDev, 0);
      assert.equal(r.sampleStdDev, 0);
    }
  });

  it("leaves sample values null for a single number", () => {
    const r = computeStandardDeviation("42");
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.count, 1);
      assert.equal(r.mean, 42);
      assert.equal(r.populationStdDev, 0);
      assert.equal(r.sampleVariance, null);
      assert.equal(r.sampleStdDev, null);
    }
  });

  it("handles negatives and decimals", () => {
    const r = computeStandardDeviation("-1.5\n2.5\n4");
    assert.ok(r.valid);
    if (r.valid) {
      close(r.mean, 5 / 3);
      const ss = (-1.5 - 5 / 3) ** 2 + (2.5 - 5 / 3) ** 2 + (4 - 5 / 3) ** 2;
      close(r.populationVariance, ss / 3);
      close(r.sampleVariance, ss / 2);
    }
  });

  it("rejects empty and non-numeric input", () => {
    const empty = computeStandardDeviation("  ");
    assert.equal(empty.valid, false);
    const bad = computeStandardDeviation("1, two, 3");
    assert.equal(bad.valid, false);
    if (!bad.valid) assert.match(bad.error, /two/);
  });
});

describe("formatStatNumber", () => {
  it("trims trailing zeros and rounds float noise", () => {
    assert.equal(formatStatNumber(2), "2");
    assert.equal(formatStatNumber(0.1 + 0.2), "0.3");
    assert.equal(formatStatNumber(-0), "0");
    assert.equal(formatStatNumber(2.138089935299395), "2.1380899353");
  });
});
