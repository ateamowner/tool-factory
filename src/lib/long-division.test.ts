import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { longDivide, parseDecimalInput } from "./long-division.ts";

const ok = (r: ReturnType<typeof longDivide>) => {
  assert.ok(r.valid, "expected a valid result");
  return r;
};

describe("parseDecimalInput", () => {
  it("parses integers, decimals, negatives, and commas", () => {
    assert.deepEqual(parseDecimalInput("1,234"), { negative: false, digits: "1234", fractionLength: 0 });
    assert.deepEqual(parseDecimalInput("-7.25"), { negative: true, digits: "725", fractionLength: 2 });
    assert.deepEqual(parseDecimalInput(".5"), { negative: false, digits: "5", fractionLength: 1 });
  });

  it("rejects empty and invalid input", () => {
    assert.equal(parseDecimalInput(""), null);
    assert.equal(parseDecimalInput("abc"), null);
    assert.equal(parseDecimalInput("1.2.3"), null);
    assert.equal(parseDecimalInput("."), null);
  });
});

describe("longDivide", () => {
  it("gives quotient and remainder with steps", () => {
    const r = ok(longDivide("435", "25", 0));
    assert.equal(r.quotient, "17");
    assert.equal(r.remainder, "10");
    assert.equal(r.decimal, "17");
    assert.equal(r.steps.length, 3);
    assert.deepEqual(r.steps[1], {
      phase: "integer",
      broughtDown: "3",
      current: "43",
      quotientDigit: "1",
      product: "25",
      remainder: "18",
    });
  });

  it("continues into decimals and terminates", () => {
    const r = ok(longDivide("435", "25", 4));
    assert.equal(r.decimal, "17.4");
    assert.equal(r.terminates, true);
    assert.equal(r.repeatStart, null);
  });

  it("detects repeating decimals", () => {
    const r = ok(longDivide("1", "3", 6));
    assert.equal(r.quotient, "0");
    assert.equal(r.remainder, "1");
    assert.equal(r.decimal, "0.333333");
    assert.equal(r.terminates, false);
    assert.equal(r.repeatStart, 0);

    const s = ok(longDivide("22", "7", 12));
    assert.equal(s.decimal, "3.142857142857");
    assert.equal(s.repeatStart, 0);

    const t = ok(longDivide("1", "6", 5));
    assert.equal(t.decimal, "0.16666");
    assert.equal(t.repeatStart, 1);
  });

  it("clears decimals by scaling both numbers", () => {
    const r = ok(longDivide("7.5", "2.5", 4));
    assert.equal(r.scale, "10");
    assert.equal(r.scaledDividend, "75");
    assert.equal(r.scaledDivisor, "25");
    assert.equal(r.decimal, "3");

    const s = ok(longDivide("12.6", "4", 4));
    assert.equal(s.decimal, "3.15");
  });

  it("handles signs", () => {
    assert.equal(ok(longDivide("-84", "4", 2)).decimal, "-21");
    assert.equal(ok(longDivide("-84", "-4", 2)).decimal, "21");
    assert.equal(ok(longDivide("0", "-4", 2)).decimal, "0");
  });

  it("handles large numbers exactly", () => {
    const r = ok(longDivide("123456789012345678901234567890", "9", 0));
    assert.equal(r.quotient, "13717421001371742100137174210");
    assert.equal(r.remainder, "0");
  });

  it("guards division by zero and bad input", () => {
    assert.equal(longDivide("5", "0").valid, false);
    assert.equal(longDivide("5", "0.00").valid, false);
    assert.equal(longDivide("", "3").valid, false);
  });

  it("clamps decimal places", () => {
    const r = ok(longDivide("1", "7", 99));
    assert.equal(r.decimalDigits.length, 12);
    assert.equal(ok(longDivide("1", "7", -3)).decimalDigits, "");
  });
});
