import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { countSigFigs, parseNumber, roundToSigFigs } from "./significant-figures.ts";

const count = (input: string) => {
  const result = countSigFigs(input);
  assert.ok(result.valid, `expected valid for ${input}`);
  return result;
};
const round = (input: string, n: number) => {
  const result = roundToSigFigs(input, n);
  assert.ok(result.valid, `expected valid for ${input}`);
  return result;
};

describe("parseNumber", () => {
  it("reads decimals, commas, signs and scientific notation", () => {
    assert.equal(parseNumber("1,234.50")?.fracPart, "50");
    assert.equal(parseNumber("-0.5")?.negative, true);
    assert.equal(parseNumber("6.02 × 10^23")?.exponent, 23);
    assert.equal(parseNumber("6.02x10^-3")?.exponent, -3);
    assert.equal(parseNumber("3.0E8")?.exponent, 8);
    assert.equal(parseNumber("abc"), null);
    assert.equal(parseNumber(""), null);
    assert.equal(parseNumber("."), null);
  });
});

describe("countSigFigs", () => {
  it("skips leading zeros and keeps sandwiched zeros", () => {
    assert.equal(count("0.00450").sigFigs, 3);
    assert.equal(count("-305").sigFigs, 3);
    assert.equal(count("1002").sigFigs, 4);
  });
  it("counts trailing zeros only with a decimal point", () => {
    assert.equal(count("100.0").sigFigs, 4);
    assert.equal(count("1200.").sigFigs, 4);
    const plain = count("1200");
    assert.equal(plain.sigFigs, 2);
    assert.equal(plain.maxSigFigs, 4);
    assert.equal(plain.ambiguous, true);
  });
  it("counts only the mantissa in scientific notation", () => {
    assert.equal(count("1.20e3").sigFigs, 3);
    assert.equal(count("6.02 × 10^23").sigFigs, 3);
    assert.equal(count("1.20e3").scientific, "1.20 × 10³");
  });
  it("handles zero", () => {
    assert.equal(count("0").sigFigs, 1);
    assert.equal(count("0.00").sigFigs, 2);
  });
  it("rejects junk", () => {
    assert.equal(countSigFigs("12a").valid, false);
  });
});

describe("roundToSigFigs", () => {
  it("rounds half up on the exact digits", () => {
    assert.equal(round("3.14159", 3).standard, "3.14");
    assert.equal(round("0.004567", 2).standard, "0.0046");
    assert.equal(round("1.005", 3).standard, "1.01");
    assert.equal(round("-0.0005", 1).standard, "-0.0005");
  });
  it("carries into a new place", () => {
    assert.equal(round("9.99", 2).standard, "10.");
    assert.equal(round("999", 2).scientific, "1.0 × 10³");
  });
  it("pads with zeros and flags placeholder zeros", () => {
    assert.equal(round("2", 3).standard, "2.00");
    const big = round("123456", 3);
    assert.equal(big.standard, "123,000");
    assert.equal(big.ambiguousZeros, true);
    assert.equal(big.eNotation, "1.23e+5");
    assert.equal(round("1499.9", 4).standard, "1,500.");
  });
  it("falls back to scientific notation for huge exponents", () => {
    assert.equal(round("6.022e23", 3).standard, "6.02 × 10²³");
  });
  it("validates the sig fig count", () => {
    assert.equal(roundToSigFigs("12", 0).valid, false);
    assert.equal(roundToSigFigs("12", 31).valid, false);
  });
});
