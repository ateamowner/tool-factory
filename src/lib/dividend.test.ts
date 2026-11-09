import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeDividend, formatMoney, type DividendInput } from "./dividend.ts";

const close = (a: number, b: number, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} !== ${b}`);
const base: DividendInput = {
  holdingMode: "shares",
  holding: 100,
  price: 50,
  dividendMode: "perShare",
  dividend: 2,
  frequency: 4,
  years: 0,
  dividendGrowth: 0,
  priceGrowth: 0,
};

describe("dividend calculator", () => {
  it("100 shares at $2/yr paid quarterly → $200 a year, $50 a payout, 4% yield", () => {
    const r = computeDividend(base);
    assert.equal(r.valid, true);
    if (r.valid) {
      close(r.annualIncome, 200);
      close(r.perPayout, 50);
      close(r.yieldPercent, 4);
      close(r.monthlyIncome, 200 / 12);
      assert.equal(r.rows.length, 0);
    }
  });

  it("amount invested converts to shares", () => {
    const r = computeDividend({ ...base, holdingMode: "amount", holding: 10000 });
    assert.equal(r.valid, true);
    if (r.valid) {
      close(r.shares, 200);
      close(r.annualIncome, 400);
    }
  });

  it("yield mode derives dividend per share", () => {
    const r = computeDividend({ ...base, dividendMode: "yield", dividend: 3 });
    assert.equal(r.valid, true);
    if (r.valid) {
      close(r.annualDividendPerShare, 1.5);
      close(r.annualIncome, 150);
    }
  });

  it("annual payout with DRIP compounds shares by yield each year at flat price", () => {
    const r = computeDividend({ ...base, frequency: 1, years: 3 });
    assert.equal(r.valid, true);
    if (r.valid) {
      // 4% yield, price flat: shares grow 4% a year.
      close(r.dripFinalShares, 100 * 1.04 ** 3, 1e-6);
      close(r.dripFinalValue, 100 * 1.04 ** 3 * 50, 1e-6);
      close(r.noDripTotalDividends, 600);
      assert.ok(r.dripTotalDividends > r.noDripTotalDividends);
      assert.equal(r.rows.length, 3);
    }
  });

  it("dividend growth raises later income", () => {
    const flat = computeDividend({ ...base, years: 10 });
    const grow = computeDividend({ ...base, years: 10, dividendGrowth: 6 });
    assert.ok(flat.valid && grow.valid);
    if (flat.valid && grow.valid) {
      assert.ok(grow.dripTotalDividends > flat.dripTotalDividends);
      assert.ok(grow.rows[9].annualIncomeRunRate > flat.rows[9].annualIncomeRunRate);
    }
  });

  it("more frequent payouts compound slightly faster", () => {
    const annual = computeDividend({ ...base, frequency: 1, years: 20 });
    const monthly = computeDividend({ ...base, frequency: 12, years: 20 });
    assert.ok(annual.valid && monthly.valid);
    if (annual.valid && monthly.valid) assert.ok(monthly.dripFinalShares > annual.dripFinalShares);
  });

  it("rejects bad input", () => {
    assert.equal(computeDividend({ ...base, price: 0 }).valid, false);
    assert.equal(computeDividend({ ...base, holding: -1 }).valid, false);
    assert.equal(computeDividend({ ...base, dividend: Number.NaN }).valid, false);
    assert.equal(computeDividend({ ...base, frequency: 3 }).valid, false);
    assert.equal(computeDividend({ ...base, years: 61 }).valid, false);
    assert.equal(computeDividend({ ...base, dividendGrowth: -100 }).valid, false);
  });

  it("formats money", () => {
    assert.equal(formatMoney(1234.5), "$1,234.50");
  });
});
