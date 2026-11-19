import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { meanConfidenceInterval, proportionConfidenceInterval, tCritical, zCritical } from "./confidence-interval.ts";

function close(a: number, b: number, tol = 1e-3) {
  assert.ok(Math.abs(a - b) < tol, `${a} vs ${b}`);
}

describe("critical values", () => {
  it("z presets", () => {
    close(zCritical(0.9), 1.6449);
    close(zCritical(0.95), 1.96);
    close(zCritical(0.99), 2.5758);
  });
  it("t table values", () => {
    close(tCritical(0.95, 9), 2.2622);
    close(tCritical(0.99, 14), 2.9768);
    close(tCritical(0.9, 29), 1.6991);
  });
});

describe("mean interval", () => {
  it("t interval", () => {
    const r = meanConfidenceInterval({ mean: 50, sd: 10, n: 25, levelPercent: 95, method: "t" });
    assert.ok(r.valid);
    if (r.valid) {
      close(r.margin, 4.1277, 1e-2);
      close(r.lower, 45.872, 1e-2);
      assert.equal(r.df, 24);
    }
  });
  it("z interval", () => {
    const r = meanConfidenceInterval({ mean: 100, sd: 15, n: 36, levelPercent: 95, method: "z" });
    assert.ok(r.valid);
    if (r.valid) close(r.margin, 4.9, 1e-2);
  });
  it("rejects bad input", () => {
    assert.equal(meanConfidenceInterval({ mean: 1, sd: -1, n: 5, levelPercent: 95, method: "t" }).valid, false);
    assert.equal(meanConfidenceInterval({ mean: 1, sd: 1, n: 1, levelPercent: 95, method: "t" }).valid, false);
    assert.equal(meanConfidenceInterval({ mean: 1, sd: 1, n: 5, levelPercent: 100, method: "z" }).valid, false);
  });
});

describe("proportion interval", () => {
  it("normal approximation", () => {
    const r = proportionConfidenceInterval({ successes: 60, n: 100, levelPercent: 95 });
    assert.ok(r.valid);
    if (r.valid) {
      close(r.margin, 0.096, 1e-3);
      close(r.wilsonLower, 0.5020, 1e-3);
      close(r.wilsonUpper, 0.6906, 1e-3);
    }
  });
  it("rejects bad input", () => {
    assert.equal(proportionConfidenceInterval({ successes: 11, n: 10, levelPercent: 95 }).valid, false);
  });
});
