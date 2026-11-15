import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chiUpper, normalUpper, pValue, tUpper } from "./pvalue.ts";

function close(a: number, b: number, tol = 1e-4) {
  assert.ok(Math.abs(a - b) < tol, `${a} vs ${b}`);
}

describe("distribution tails", () => {
  it("normal", () => {
    close(normalUpper(0), 0.5);
    close(normalUpper(1.96), 0.024998);
    close(normalUpper(-1.96), 0.975002);
    close(normalUpper(1.645), 0.049985);
    close(normalUpper(3), 0.0013499);
  });
  it("student t", () => {
    close(tUpper(0, 10), 0.5);
    close(tUpper(2.228, 10), 0.025, 1e-4);
    close(tUpper(2.0, 20), 0.029636, 1e-4);
    close(tUpper(-2.0, 20), 0.970364, 1e-4);
  });
  it("chi-square", () => {
    close(chiUpper(3.841, 1), 0.05, 1e-4);
    close(chiUpper(5.991, 2), 0.05, 1e-4);
    close(chiUpper(18.307, 10), 0.05, 1e-4);
    assert.equal(chiUpper(0, 4), 1);
  });
});

describe("pValue", () => {
  it("z two-tailed 1.96 is about 0.05", () => {
    const r = pValue("z", "1.96", "", "two", "0.05");
    assert.ok(r.valid);
    close(r.p, 0.049996, 1e-5);
    assert.equal(r.significant, true);
    assert.ok(r.critical.includes("1.96"));
  });
  it("z one-tailed left", () => {
    const r = pValue("z", "-1.645", "", "left", "0.05");
    assert.ok(r.valid);
    close(r.p, 0.049985, 1e-5);
  });
  it("t right-tailed", () => {
    const r = pValue("t", "2", "20", "right", "0.05");
    assert.ok(r.valid);
    close(r.p, 0.029636, 1e-4);
    assert.equal(r.significant, true);
  });
  it("t two-tailed not significant", () => {
    const r = pValue("t", "1.5", "12", "two", "0.05");
    assert.ok(r.valid);
    close(r.p, 0.1594, 1e-3);
    assert.equal(r.significant, false);
  });
  it("chi-square right-tailed", () => {
    const r = pValue("chi", "3.841", "1", "right", "0.05");
    assert.ok(r.valid);
    close(r.p, 0.05, 1e-4);
  });
  it("rejects bad input", () => {
    assert.equal(pValue("z", "abc", "", "two", "0.05").valid, false);
    assert.equal(pValue("t", "1", "0", "two", "0.05").valid, false);
    assert.equal(pValue("chi", "-1", "3", "right", "0.05").valid, false);
    assert.equal(pValue("z", "1", "", "two", "1.5").valid, false);
  });
});
