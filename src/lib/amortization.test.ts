import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeAmortization, monthlyPayment } from "./amortization.ts";

describe("computeAmortization", () => {
  it("computes the standard 30-year payment", () => {
    const r = computeAmortization({ loanAmount: 300000, annualRatePercent: 6.5, termYears: 30, extraMonthly: 0 });
    assert.equal(r.valid, true);
    assert.equal(r.monthlyPayment, 1896.2);
    assert.equal(r.payoffMonths, 360);
    assert.equal(r.schedule[0].interest, 1625);
    assert.equal(r.schedule[0].principal, 271.2);
    assert.equal(r.schedule.at(-1)?.balance, 0);
    assert.ok(Math.abs((r.totalInterest ?? 0) - 382633) < 50);
  });
  it("handles 0% interest", () => {
    const r = computeAmortization({ loanAmount: 12000, annualRatePercent: 0, termYears: 1, extraMonthly: 0 });
    assert.equal(r.monthlyPayment, 1000);
    assert.equal(r.totalInterest, 0);
    assert.equal(r.schedule.length, 12);
  });
  it("extra payments shorten payoff and cut interest", () => {
    const base = computeAmortization({ loanAmount: 200000, annualRatePercent: 6, termYears: 30, extraMonthly: 0 });
    const extra = computeAmortization({ loanAmount: 200000, annualRatePercent: 6, termYears: 30, extraMonthly: 200 });
    assert.ok((extra.payoffMonths ?? 999) < 300);
    assert.ok((extra.totalInterest ?? 0) < (base.totalInterest ?? 0));
    assert.equal(extra.schedule.at(-1)?.balance, 0);
  });
  it("rejects invalid input", () => {
    assert.equal(computeAmortization({ loanAmount: -1, annualRatePercent: 5, termYears: 30, extraMonthly: 0 }).valid, false);
    assert.equal(computeAmortization({ loanAmount: 1000, annualRatePercent: 5, termYears: 0, extraMonthly: 0 }).valid, false);
    assert.equal(computeAmortization({ loanAmount: Number.NaN, annualRatePercent: 5, termYears: 5, extraMonthly: 0 }).valid, false);
  });
  it("monthlyPayment formula", () => {
    assert.ok(Math.abs(monthlyPayment(10000, 12, 12) - 888.49) < 0.01);
  });
});
