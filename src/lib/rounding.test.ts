import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compareModes, formatDecimal, parseDecimal, placeLabel, roundNumber, type RoundingMode } from "./rounding.ts";

const r = (input: string, place: number, mode: RoundingMode = "half-up") => {
  const result = roundNumber(input, place, mode);
  assert.ok(result.valid, `expected valid for ${input}`);
  return result.answer;
};

describe("parseDecimal", () => {
  it("reads integers, decimals, commas, signs and e-notation", () => {
    assert.deepEqual(parseDecimal("1,234.5"), { negative: false, coefficient: 12345n, scale: 1 });
    assert.deepEqual(parseDecimal("−2.5"), { negative: true, coefficient: 25n, scale: 1 });
    assert.deepEqual(parseDecimal(".25"), { negative: false, coefficient: 25n, scale: 2 });
    assert.deepEqual(parseDecimal("1.5e3"), { negative: false, coefficient: 1500n, scale: 0 });
    assert.deepEqual(parseDecimal("2.5E-2"), { negative: false, coefficient: 25n, scale: 3 });
    assert.equal(parseDecimal("-0")?.negative, false);
  });
  it("rejects junk", () => {
    assert.equal(parseDecimal(""), null);
    assert.equal(parseDecimal("abc"), null);
    assert.equal(parseDecimal("1.2.3"), null);
    assert.equal(parseDecimal("."), null);
  });
});

describe("formatDecimal", () => {
  it("pads and groups", () => {
    assert.equal(formatDecimal(false, 5n, 3), "0.005");
    assert.equal(formatDecimal(true, 1234567n, 2, true), "-12,345.67");
    assert.equal(formatDecimal(true, 0n, 2), "0.00");
  });
});

describe("roundNumber half up", () => {
  it("rounds to decimal places", () => {
    assert.equal(r("3.14159", 2), "3.14");
    assert.equal(r("3.14159", 4), "3.1416");
    assert.equal(r("2.5", 0), "3");
    assert.equal(r("2.4999", 0), "2");
    assert.equal(r("9.995", 2), "10.00");
  });
  it("avoids floating-point errors", () => {
    assert.equal(r("1.005", 2), "1.01");
    assert.equal(r("1.255", 2), "1.26");
    assert.equal(r("0.615", 2), "0.62");
  });
  it("rounds negatives away from zero at the half", () => {
    assert.equal(r("-2.5", 0), "-3");
    assert.equal(r("-2.4", 0), "-2");
    assert.equal(r("-0.4", 0), "0");
  });
  it("pads short inputs", () => {
    assert.equal(r("2", 2), "2.00");
    assert.equal(r("1.5", 3), "1.500");
  });
  it("rounds to the nearest 10, 100 and 1,000", () => {
    assert.equal(r("1234.5", -1), "1230");
    assert.equal(r("1235", -1), "1240");
    assert.equal(r("1250", -2), "1300");
    assert.equal(r("1499", -3), "1000");
    assert.equal(r("1500", -3), "2000");
    assert.equal(r("-1500", -3), "-2000");
    assert.equal(r("45", -2), "0");
  });
});

describe("roundNumber half even", () => {
  it("rounds exact halves to the even neighbor", () => {
    assert.equal(r("2.5", 0, "half-even"), "2");
    assert.equal(r("3.5", 0, "half-even"), "4");
    assert.equal(r("-2.5", 0, "half-even"), "-2");
    assert.equal(r("2.675", 2, "half-even"), "2.68");
    assert.equal(r("2.665", 2, "half-even"), "2.66");
    assert.equal(r("250", -2, "half-even"), "200");
    assert.equal(r("350", -2, "half-even"), "400");
  });
  it("rounds normally when not exactly half", () => {
    assert.equal(r("2.501", 0, "half-even"), "3");
    assert.equal(r("2.49", 0, "half-even"), "2");
  });
});

describe("roundNumber ceiling and floor", () => {
  it("always up goes toward positive infinity", () => {
    assert.equal(r("2.01", 0, "ceiling"), "3");
    assert.equal(r("-2.99", 0, "ceiling"), "-2");
    assert.equal(r("1201", -2, "ceiling"), "1300");
    assert.equal(r("3", 0, "ceiling"), "3");
  });
  it("always down goes toward negative infinity", () => {
    assert.equal(r("2.99", 0, "floor"), "2");
    assert.equal(r("-2.01", 0, "floor"), "-3");
    assert.equal(r("1299", -2, "floor"), "1200");
    assert.equal(r("-0.001", 2, "floor"), "-0.01");
    assert.equal(r("-0.001", 2, "ceiling"), "0.00");
  });
});

describe("roundNumber output", () => {
  it("returns grouped output and steps", () => {
    const result = roundNumber("1234567.891", 1, "half-up");
    assert.ok(result.valid);
    assert.equal(result.formatted, "1,234,567.9");
    assert.equal(result.steps.at(-1), "Answer: 1,234,567.9");
    assert.ok(result.steps.some((s) => s.includes("more than half")));
  });
  it("flags exact inputs", () => {
    const result = roundNumber("2.5", 1, "half-up");
    assert.ok(result.valid && result.exact);
  });
  it("rejects bad input", () => {
    assert.equal(roundNumber("", 2, "half-up").valid, false);
    assert.equal(roundNumber("abc", 2, "half-up").valid, false);
    assert.equal(roundNumber("1.5", 25, "half-up").valid, false);
  });
  it("compares every mode", () => {
    assert.deepEqual(
      compareModes("-2.5", 0).map((m) => m.answer),
      ["-3", "-2", "-2", "-3"],
    );
  });
  it("labels places", () => {
    assert.equal(placeLabel(0), "the nearest whole number");
    assert.equal(placeLabel(1), "1 decimal place");
    assert.equal(placeLabel(3), "3 decimal places");
    assert.equal(placeLabel(-3), "the nearest 1,000");
  });
});
