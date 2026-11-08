import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeCreditCardPayoff,
  formatDuration,
  formatMoney,
  monthsBetween,
  requiredPayment,
} from "./credit-card-payoff.ts";

const close = (a: number, b: number, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} !== ${b}`);
const base = { balance: 5000, apr: 22, monthlyPayment: 0, months: 0 };

describe("credit card payoff calculator", () => {
  it("$5,000 at 22% paying $200/month → 34 months, $1,749.88 interest", () => {
    const r = computeCreditCardPayoff({ ...base, mode: "payment", monthlyPayment: 200 });
    assert.equal(r.valid, true);
    if (r.valid) {
      assert.equal(r.months, 34);
      close(r.totalInterest, 1749.88);
      close(r.totalPaid, 5000 + r.totalInterest);
      assert.ok(r.lastPayment <= 200);
    }
  });

  it("payment needed for 24 months matches the amortization formula", () => {
    const r = computeCreditCardPayoff({ ...base, mode: "months", months: 24 });
    assert.equal(r.valid, true);
    if (r.valid) {
      close(r.monthlyPayment, 259.39);
      close(r.totalPaid, r.monthlyPayment * 24);
      // Paying that amount in fixed-payment mode finishes in 24 months.
      const check = computeCreditCardPayoff({ ...base, mode: "payment", monthlyPayment: r.monthlyPayment + 1e-6 });
      assert.equal(check.valid && check.months, 24);
    }
  });

  it("0% APR divides evenly", () => {
    close(requiredPayment(1200, 0, 12), 100);
    const r = computeCreditCardPayoff({ ...base, apr: 0, balance: 1000, mode: "payment", monthlyPayment: 300 });
    assert.equal(r.valid && r.months, 4);
    assert.equal(r.valid && r.totalInterest, 0);
  });

  it("warns when the payment doesn't cover monthly interest", () => {
    const r = computeCreditCardPayoff({ ...base, mode: "payment", monthlyPayment: 90 });
    assert.equal(r.valid, false);
    if (!r.valid) {
      assert.equal(r.paymentTooLow, true);
      close(r.firstMonthInterest ?? 0, 91.67);
    }
  });

  it("rejects bad input", () => {
    assert.equal(computeCreditCardPayoff({ ...base, mode: "payment", balance: 0, monthlyPayment: 100 }).valid, false);
    assert.equal(computeCreditCardPayoff({ ...base, mode: "payment", apr: -1, monthlyPayment: 100 }).valid, false);
    assert.equal(computeCreditCardPayoff({ ...base, mode: "months", months: 0 }).valid, false);
    assert.equal(computeCreditCardPayoff({ ...base, mode: "months", months: 2.5 }).valid, false);
  });

  it("formats and counts months", () => {
    assert.equal(formatMoney(1234.5), "$1,234.50");
    assert.equal(formatDuration(33), "2 years 9 months");
    assert.equal(formatDuration(12), "1 year");
    assert.equal(formatDuration(1), "1 month");
    assert.equal(monthsBetween("2026-11", "2028-11"), 24);
  });
});
