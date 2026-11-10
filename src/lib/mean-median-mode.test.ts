import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeMeanMedianMode } from "./mean-median-mode.ts";

describe("computeMeanMedianMode", () => {
  it("computes the basics for an odd-sized list", () => {
    const r = computeMeanMedianMode("3, 1, 2, 2, 7");
    assert.ok(r.valid);
    assert.equal(r.count, 5);
    assert.equal(r.sum, 15);
    assert.equal(r.mean, 3);
    assert.equal(r.median, 2);
    assert.deepEqual(r.modes, [2]);
    assert.equal(r.range, 6);
    assert.equal(r.midrange, 4);
  });
  it("averages the middle two for an even-sized list", () => {
    const r = computeMeanMedianMode("1 2 3 4");
    assert.ok(r.valid);
    assert.equal(r.median, 2.5);
  });
  it("reports no mode when all values are unique", () => {
    const r = computeMeanMedianMode("1\n2\n3");
    assert.ok(r.valid);
    assert.deepEqual(r.modes, []);
  });
  it("reports multiple modes", () => {
    const r = computeMeanMedianMode("1, 1, 2, 2, 3");
    assert.ok(r.valid);
    assert.deepEqual(r.modes, [1, 2]);
    assert.equal(r.modeCount, 2);
  });
  it("handles a single value and negatives", () => {
    const r = computeMeanMedianMode("-4");
    assert.ok(r.valid);
    assert.equal(r.mean, -4);
    assert.equal(r.range, 0);
    assert.deepEqual(r.modes, []);
  });
  it("rejects bad or empty input", () => {
    assert.equal(computeMeanMedianMode("1, x").valid, false);
    assert.equal(computeMeanMedianMode("  ").valid, false);
    assert.equal(computeMeanMedianMode(null).valid, false);
  });
});
