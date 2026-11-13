import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { antilog, logarithm, parseNumber } from "./log.ts";

describe("parseNumber", () => {
  it("parses numbers, fractions and e", () => {
    assert.equal(parseNumber("100"), 100);
    assert.equal(parseNumber("-2.5"), -2.5);
    assert.equal(parseNumber("1/4"), 0.25);
    assert.equal(parseNumber("e"), Math.E);
    assert.equal(parseNumber("1e3"), 1000);
    assert.equal(parseNumber("abc"), null);
    assert.equal(parseNumber(""), null);
    assert.equal(parseNumber("1/0"), null);
  });
});

describe("logarithm", () => {
  it("computes common log", () => {
    const r = logarithm("1000", "10");
    assert.ok(r.valid);
    assert.equal(r.answer, "3");
  });
  it("computes natural log", () => {
    const r = logarithm("e", "e");
    assert.ok(r.valid);
    assert.equal(r.answer, "1");
    const r2 = logarithm("10", "e");
    assert.ok(r2.valid);
    assert.equal(r2.answer, "2.302585093");
  });
  it("uses change of base for custom bases", () => {
    const r = logarithm("8", "2");
    assert.ok(r.valid);
    assert.equal(r.answer, "3");
    assert.ok(r.steps[0].includes("Change of base"));
    const r2 = logarithm("20", "3");
    assert.ok(r2.valid);
    assert.equal(r2.answer, "2.726833028");
  });
  it("handles fractional results and numbers below 1", () => {
    const r = logarithm("0.01", "10");
    assert.ok(r.valid);
    assert.equal(r.answer, "−2");
  });
  it("rejects bad input", () => {
    assert.equal(logarithm("0", "10").valid, false);
    assert.equal(logarithm("-5", "10").valid, false);
    assert.equal(logarithm("5", "1").valid, false);
    assert.equal(logarithm("5", "-2").valid, false);
    assert.equal(logarithm("x", "10").valid, false);
    assert.equal(logarithm("5", "").valid, false);
  });
});

describe("antilog", () => {
  it("computes base 10, e and custom bases", () => {
    const a = antilog("3", "10");
    assert.ok(a.valid);
    assert.equal(a.answer, "1000");
    const b = antilog("1", "e");
    assert.ok(b.valid);
    assert.equal(b.answer, "2.718281828");
    const c = antilog("5", "2");
    assert.ok(c.valid);
    assert.equal(c.answer, "32");
    assert.ok(c.steps.join(" ").includes("e^("));
  });
  it("handles negative logs and rejects bad input", () => {
    const a = antilog("-2", "10");
    assert.ok(a.valid);
    assert.equal(a.answer, "0.01");
    assert.equal(antilog("", "10").valid, false);
    assert.equal(antilog("2", "1").valid, false);
    assert.equal(antilog("10000", "10").valid, false);
  });
});
