import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeRuleOf72,
  exactRateToDouble,
  exactYearsToDouble,
  fmt,
  formatPercent,
  formatYears,
  ruleEstimate,
} from "./rule-of-72.ts";

const close = (a: number | null | undefined, b: number, eps = 1e-9) => {
  assert.ok(a !== null && a !== undefined && Math.abs(a - b) < eps, `${a} !== ${b}`);
};

describe("rule of 72 formulas", () => {
  it("8% → 72/8 = 9 years estimate; exact ln(2)/ln(1.08) ≈ 9.006", () => {
    close(ruleEstimate(72, 8), 9);
    close(exactYearsToDouble(0.08), Math.log(2) / Math.log(1.08));
    close(exactYearsToDouble(0.08), 9.006468, 1e-5);
  });

  it("6% → 12 years estimate", () => {
    close(ruleEstimate(72, 6), 12);
    const r = computeRuleOf72({ mode: "years-from-rate", ratePercent: 6, years: 0 });
    assert.equal(r.valid, true);
    if (r.valid) {
      close(r.estimates.rule72, 12);
      close(r.estimates.rule70, 70 / 6);
      close(r.estimates.rule693, 69.3 / 6);
      close(r.estimates.exact, Math.log(2) / Math.log(1.06));
    }
  });

  it("want double in 10 years → 72/10 = 7.2% estimate; exact 2^0.1 − 1 ≈ 7.177%", () => {
    close(ruleEstimate(72, 10), 7.2);
    close(exactRateToDouble(10), Math.pow(2, 0.1) - 1);
    close(exactRateToDouble(10) * 100, 7.177346, 1e-5);
  });

  it("formats years and percents", () => {
    assert.equal(formatYears(9), "9 yr");
    assert.equal(formatPercent(7.2), "7.2%");
    assert.equal(fmt(9.006468), "9.0065");
  });
});

describe("computeRuleOf72", () => {
  it("years-from-rate at 8% returns 72/70/69.3 estimates and exact", () => {
    const r = computeRuleOf72({ mode: "years-from-rate", ratePercent: 8, years: 0 });
    assert.equal(r.valid, true);
    if (r.valid) {
      assert.equal(r.unit, "years");
      close(r.estimates.rule72, 9);
      close(r.estimates.rule70, 8.75);
      close(r.estimates.rule693, 8.6625);
      close(r.estimates.exact, Math.log(2) / Math.log(1.08));
      assert.equal(r.ratePercent, 8);
    }
  });

  it("rate-from-years for 10 years returns 72/70/69.3 estimates and exact", () => {
    const r = computeRuleOf72({ mode: "rate-from-years", ratePercent: 0, years: 10 });
    assert.equal(r.valid, true);
    if (r.valid) {
      assert.equal(r.unit, "percent");
      close(r.estimates.rule72, 7.2);
      close(r.estimates.rule70, 7);
      close(r.estimates.rule693, 6.93);
      close(r.estimates.exact, (Math.pow(2, 0.1) - 1) * 100);
      assert.equal(r.years, 10);
    }
  });

  it("rejects zero, negative, or non-finite inputs", () => {
    assert.equal(computeRuleOf72({ mode: "years-from-rate", ratePercent: 0, years: 0 }).valid, false);
    assert.equal(computeRuleOf72({ mode: "years-from-rate", ratePercent: -5, years: 0 }).valid, false);
    assert.equal(computeRuleOf72({ mode: "years-from-rate", ratePercent: Number.NaN, years: 0 }).valid, false);
    assert.equal(computeRuleOf72({ mode: "rate-from-years", ratePercent: 0, years: 0 }).valid, false);
    assert.equal(computeRuleOf72({ mode: "rate-from-years", ratePercent: 0, years: -1 }).valid, false);
    assert.equal(computeRuleOf72({ mode: "rate-from-years", ratePercent: 0, years: Infinity }).valid, false);
    assert.equal(
      computeRuleOf72({ mode: "other" as "years-from-rate", ratePercent: 8, years: 0 }).valid,
      false,
    );
  });
});
