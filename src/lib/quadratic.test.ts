import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatRoot, solveQuadratic } from "./quadratic.ts";

describe("solveQuadratic", () => {
  it("finds two real roots", () => {
    const r = solveQuadratic("1", "-3", "2");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.discriminant, 1);
    assert.equal(r.rootKind, "two-real");
    assert.deepEqual(r.rootsText, ["1", "2"]);
    assert.deepEqual(r.vertex, { x: 1.5, y: -0.25 });
    assert.equal(r.opens, "up");
  });

  it("finds one repeated root", () => {
    const r = solveQuadratic("1", "2", "1");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.discriminant, 0);
    assert.equal(r.rootKind, "one-real");
    assert.deepEqual(r.rootsText, ["-1"]);
  });

  it("finds complex roots", () => {
    const r = solveQuadratic("1", "2", "5");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.discriminant, -16);
    assert.equal(r.rootKind, "complex");
    assert.deepEqual(r.rootsText, ["-1 + 2i", "-1 − 2i"]);
    assert.deepEqual(r.vertex, { x: -1, y: 4 });
  });

  it("handles a negative leading coefficient and decimals", () => {
    const r = solveQuadratic("-2", "4", "6");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.deepEqual(r.rootsText, ["-1", "3"]);
    assert.equal(r.opens, "down");
    assert.deepEqual(r.vertex, { x: 1, y: 8 });
  });

  it("rejects a = 0 and blanks", () => {
    assert.equal(solveQuadratic("0", "2", "1").valid, false);
    assert.equal(solveQuadratic("", "2", "1").valid, false);
    assert.equal(solveQuadratic("1", "abc", "1").valid, false);
  });

  it("formats pure imaginary roots", () => {
    assert.equal(formatRoot({ re: 0, im: 1 }), "i");
    assert.equal(formatRoot({ re: 0, im: -3 }), "−3i");
  });
});
