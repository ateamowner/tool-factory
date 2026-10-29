import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { convertNumber, operate, parseScientific, toStandard } from "./scientificNotation.ts";

describe("parseScientific", () => {
  it("reads standard, e-notation and × 10^ forms", () => {
    assert.equal(parseScientific("123,000"), 123000);
    assert.equal(parseScientific("1.23e5"), 123000);
    assert.equal(parseScientific("1.23E-5"), 0.0000123);
    assert.equal(parseScientific("1.23 x 10^5"), 123000);
    assert.equal(parseScientific("6.02×10^23"), 6.02e23);
    assert.equal(parseScientific("2.5 * 10^(-3)"), 0.0025);
    assert.equal(parseScientific("10^-3"), 0.001);
    assert.equal(parseScientific("−4.1e2"), -410);
  });

  it("rejects junk", () => {
    assert.equal(parseScientific(""), null);
    assert.equal(parseScientific("abc"), null);
    assert.equal(parseScientific("1.2.3"), null);
  });
});

describe("convertNumber", () => {
  it("converts a large number to scientific and E notation", () => {
    const r = convertNumber("123000");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.scientific, "1.23 × 10⁵");
    assert.equal(r.eNotation, "1.23E+5");
    assert.equal(r.engineering, "123 × 10³");
    assert.equal(r.exponent, 5);
    assert.equal(r.significantFigures, 3);
  });

  it("converts a small number with a negative exponent", () => {
    const r = convertNumber("0.00045");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.scientific, "4.5 × 10⁻⁴");
    assert.equal(r.eNotation, "4.5E−4");
    assert.equal(r.exponent, -4);
  });

  it("converts scientific notation back to standard form", () => {
    const r = convertNumber("6.02 x 10^23");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.standard, "602,000,000,000,000,000,000,000");
    const s = convertNumber("1.5e-7");
    assert.ok(s.valid);
    if (!s.valid) return;
    assert.equal(s.standard, "0.00000015");
  });

  it("handles negatives, zero and rounding to significant figures", () => {
    const n = convertNumber("-0.0000123");
    assert.ok(n.valid);
    if (!n.valid) return;
    assert.equal(n.scientific, "−1.23 × 10⁻⁵");
    const z = convertNumber("0");
    assert.ok(z.valid);
    if (!z.valid) return;
    assert.equal(z.scientific, "0 × 10⁰");
    const r = convertNumber("123456", 3);
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.scientific, "1.23 × 10⁵");
  });

  it("returns an error for invalid input", () => {
    assert.equal(convertNumber("hello").valid, false);
  });
});

describe("toStandard", () => {
  it("never uses e-notation", () => {
    assert.equal(toStandard(1e21), "1000000000000000000000");
    assert.equal(toStandard(1.2e-7), "0.00000012");
    assert.equal(toStandard(-42), "-42");
  });
});

describe("operate", () => {
  it("multiplies coefficients and adds exponents", () => {
    const r = operate("6e5", "4e5", "multiply");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.scientific, "2.4 × 10¹¹");
  });

  it("divides coefficients and subtracts exponents", () => {
    const r = operate("8 x 10^6", "2 x 10^2", "divide");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.scientific, "4 × 10⁴");
  });

  it("adds and subtracts after matching exponents", () => {
    const a = operate("3.2e4", "1.5e3", "add");
    assert.ok(a.valid);
    if (!a.valid) return;
    assert.equal(a.scientific, "3.35 × 10⁴");
    const s = operate("3.2e4", "1.5e3", "subtract");
    assert.ok(s.valid);
    if (!s.valid) return;
    assert.equal(s.scientific, "3.05 × 10⁴");
  });

  it("rejects division by zero", () => {
    assert.equal(operate("5", "0", "divide").valid, false);
  });
});
