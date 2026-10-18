import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computePercentage,
  formatPercentNumber,
  parsePercentInput,
  percentChange,
  percentOf,
  whatPercent,
} from "./percentage.ts";

const close = (a: number | null, b: number, eps = 1e-9) => {
  assert.ok(a !== null && Math.abs(a - b) < eps, `${a} != ${b}`);
};

describe("parsePercentInput", () => {
  it("parses plain numbers, decimals, and negatives", () => {
    assert.equal(parsePercentInput("20"), 20);
    assert.equal(parsePercentInput("-3.5"), -3.5);
    assert.equal(parsePercentInput(" 12.5 "), 12.5);
  });

  it("strips thousands separators and a trailing percent sign", () => {
    assert.equal(parsePercentInput("1,250"), 1250);
    assert.equal(parsePercentInput("15%"), 15);
  });

  it("returns null for empty or invalid input", () => {
    assert.equal(parsePercentInput(""), null);
    assert.equal(parsePercentInput(undefined), null);
    assert.equal(parsePercentInput("abc"), null);
    assert.equal(parsePercentInput("-"), null);
  });
});

describe("formatPercentNumber", () => {
  it("hides floating point noise", () => {
    assert.equal(formatPercentNumber(0.1 + 0.2), "0.3");
    assert.equal(formatPercentNumber(33.333333333333336), "33.3333333333");
    assert.equal(formatPercentNumber(-0), "0");
    assert.equal(formatPercentNumber(40), "40");
  });
});

describe("percentOf", () => {
  it("computes X% of Y", () => {
    assert.equal(percentOf(20, 150), 30);
    assert.equal(percentOf(15, 80), 12);
    close(percentOf(12.5, 64), 8);
    assert.equal(percentOf(200, 50), 100);
    assert.equal(percentOf(-10, 50), -5);
  });
});

describe("whatPercent", () => {
  it("computes X as a percent of Y", () => {
    assert.equal(whatPercent(30, 150), 20);
    assert.equal(whatPercent(45, 60), 75);
    close(whatPercent(1, 3), 100 / 3);
    assert.equal(whatPercent(150, 100), 150);
  });

  it("returns null when Y is 0", () => {
    assert.equal(whatPercent(5, 0), null);
  });
});

describe("percentChange", () => {
  it("computes increases and decreases", () => {
    assert.equal(percentChange(50, 75), 50);
    assert.equal(percentChange(80, 60), -25);
    assert.equal(percentChange(100, 100), 0);
    assert.equal(percentChange(40, 100), 150);
  });

  it("uses the absolute starting value for negative starts", () => {
    assert.equal(percentChange(-50, -25), 50);
    assert.equal(percentChange(-50, -100), -100);
  });

  it("returns null when starting from 0", () => {
    assert.equal(percentChange(0, 10), null);
  });
});

describe("computePercentage", () => {
  it("handles percent-of mode", () => {
    const r = computePercentage("percent-of", "20", "150");
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.value, 30);
  });

  it("handles what-percent mode and rejects a zero whole", () => {
    const r = computePercentage("what-percent", "30", "150");
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.value, 20);
    assert.equal(computePercentage("what-percent", "3", "0").valid, false);
  });

  it("handles percent-change mode with direction and difference", () => {
    const up = computePercentage("percent-change", "50", "75");
    assert.ok(up.valid);
    if (up.valid) {
      assert.equal(up.value, 50);
      assert.equal(up.difference, 25);
      assert.equal(up.direction, "increase");
    }
    const down = computePercentage("percent-change", "80", "60");
    assert.ok(down.valid);
    if (down.valid) {
      assert.equal(down.value, -25);
      assert.equal(down.direction, "decrease");
    }
    const same = computePercentage("percent-change", "10", "10");
    assert.ok(same.valid);
    if (same.valid) assert.equal(same.direction, "no change");
    assert.equal(computePercentage("percent-change", "0", "10").valid, false);
  });

  it("rejects missing or invalid inputs", () => {
    assert.equal(computePercentage("percent-of", "", "10").valid, false);
    assert.equal(computePercentage("percent-of", "10", "x").valid, false);
  });
});
