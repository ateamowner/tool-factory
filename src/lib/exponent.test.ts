import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseExpNumber, power, solveBase, solveExponent } from "./exponent.ts";

describe("parseExpNumber", () => {
  it("reads integers, decimals, fractions and e-notation", () => {
    assert.deepEqual(parseExpNumber("1/2"), { value: 0.5, num: 1, den: 2, text: "1/2" });
    assert.equal(parseExpNumber("-2/3")?.den, 3);
    assert.equal(parseExpNumber("−2/3")?.num, -2);
    assert.equal(parseExpNumber("0.25")?.den, 4);
    assert.equal(parseExpNumber("1.5e3")?.value, 1500);
    assert.equal(parseExpNumber("1,024")?.value, 1024);
  });
  it("rejects junk", () => {
    assert.equal(parseExpNumber(""), null);
    assert.equal(parseExpNumber("abc"), null);
    assert.equal(parseExpNumber("1/0"), null);
  });
});

describe("power", () => {
  it("handles positive integer exponents", () => {
    const r = power("2", "10");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.value, 1024);
    assert.equal(r.answer, "1,024");
    assert.equal(r.scientific, "1.024 × 10³");
    assert.equal(r.eNotation, "1.024E+3");
  });
  it("handles negative exponents", () => {
    const r = power("2", "-3");
    assert.ok(r.valid && r.value === 0.125);
  });
  it("handles fractional exponents", () => {
    const r = power("8", "2/3");
    assert.ok(r.valid && r.value === 4);
    const s = power("16", "0.5");
    assert.ok(s.valid && s.value === 4);
    const t = power("27", "-1/3");
    assert.ok(t.valid && Math.abs((t.value ?? 0) - 1 / 3) < 1e-9);
  });
  it("handles negative bases", () => {
    const a = power("-2", "3");
    assert.ok(a.valid && a.value === -8);
    const b = power("-2", "4");
    assert.ok(b.valid && b.value === 16);
    const c = power("-8", "1/3");
    assert.ok(c.valid && c.value === -2);
    const d = power("-4", "1/2");
    assert.equal(d.valid, false);
    const e = power("-4", "0.5");
    assert.equal(e.valid, false);
  });
  it("handles zero cases", () => {
    const a = power("0", "0");
    assert.ok(a.valid && a.value === 1);
    assert.equal(power("0", "-1").valid, false);
    const c = power("5", "0");
    assert.ok(c.valid && c.value === 1);
  });
  it("uses scientific notation for very large exact integer powers", () => {
    const r = power("2", "100");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.scientific, "1.267650600 × 10³⁰".replace("600 ×", "6 ×"));
    assert.equal(r.answer, r.scientific);
    assert.equal(r.standard, "1,267,650,600,228,229,401,496,703,205,376");
  });
  it("goes beyond double precision with logarithms", () => {
    const r = power("10", "500.5");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.value, null);
    assert.equal(r.scientific, "3.16227766 × 10⁵⁰⁰");
    const s = power("2", "-2000");
    assert.ok(s.valid && s.value === null && s.eNotation.endsWith("E−603"));
  });
  it("shows tiny results in scientific notation", () => {
    const r = power("10", "-9");
    assert.ok(r.valid && r.answer === "1 × 10⁻⁹");
  });
  it("rejects bad input", () => {
    assert.equal(power("x", "2").valid, false);
    assert.equal(power("2", "").valid, false);
  });
});

describe("solveExponent", () => {
  it("solves for the exponent", () => {
    const r = solveExponent("2", "1024");
    assert.ok(r.valid && r.value === 10);
    const s = solveExponent("10", "0.001");
    assert.ok(s.valid && s.value === -3);
    const t = solveExponent("2", "10");
    assert.ok(t.valid && Math.abs((t.value ?? 0) - 3.321928095) < 1e-8);
  });
  it("rejects impossible cases", () => {
    assert.equal(solveExponent("1", "5").valid, false);
    assert.equal(solveExponent("-2", "8").valid, false);
    assert.equal(solveExponent("2", "-8").valid, false);
  });
});

describe("solveBase", () => {
  it("solves for the base", () => {
    const r = solveBase("81", "4");
    assert.ok(r.valid && r.value === 3 && r.note?.includes("±"));
    const s = solveBase("-27", "3");
    assert.ok(s.valid && s.value === -3);
    const t = solveBase("4", "1/2");
    assert.ok(t.valid && t.value === 16);
    const u = solveBase("0.25", "-2");
    assert.ok(u.valid && u.value === 2);
  });
  it("rejects impossible cases", () => {
    assert.equal(solveBase("-16", "4").valid, false);
    assert.equal(solveBase("5", "0").valid, false);
  });
});
