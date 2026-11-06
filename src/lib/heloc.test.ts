import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  amortizingPayment,
  computeHeloc,
  interestOnlyPayment,
  type HelocInput,
} from "./heloc.ts";

const base: HelocInput = {
  homeValue: 400000,
  firstMortgageBalance: 200000,
  helocCreditLimit: 80000,
  amountDrawn: 50000,
  drawAprPercent: 8.5,
  drawYears: 10,
  repaymentYears: 20,
  extraMonthly: 0,
  maxCltvPercent: 85,
};

describe("interestOnlyPayment / amortizingPayment", () => {
  it("interest-only is balance × monthly rate", () => {
    // 50000 * 0.085 / 12 = 354.166...
    assert.ok(Math.abs(interestOnlyPayment(50000, 8.5) - 354.166666) < 0.0001);
  });
  it("amortizing matches standard formula", () => {
    assert.ok(Math.abs(amortizingPayment(10000, 12, 12) - 888.49) < 0.01);
    assert.equal(amortizingPayment(12000, 0, 12), 1000);
  });
});

describe("computeHeloc", () => {
  it("computes LTV, CLTV, IO draw payment, and amortizing repayment", () => {
    const r = computeHeloc(base);
    assert.equal(r.valid, true);
    assert.equal(r.ltvPercent, 50); // 200k / 400k
    assert.equal(r.cltvOnLimitPercent, 70); // (200k+80k)/400k
    assert.equal(r.cltvOnDrawnPercent, 62.5); // (200k+50k)/400k
    assert.equal(r.maxHelocFromCltv, 140000); // 400k*0.85 - 200k
    assert.equal(r.availableCredit, 30000);
    assert.equal(r.drawMonthlyPayment, 354.17);
    // 50k @ 8.5% / 240 months
    assert.ok(Math.abs((r.repaymentMonthlyPayment ?? 0) - 433.91) < 0.02);
    assert.ok((r.paymentJump ?? 0) > 0);
    assert.ok(Math.abs((r.paymentJump ?? 0) - ((r.repaymentMonthlyPayment ?? 0) - (r.drawMonthlyPayment ?? 0))) < 0.01);
    assert.equal(r.schedule.filter((row) => row.phase === "draw").length, 120);
    assert.equal(r.schedule.filter((row) => row.phase === "draw")[0].principal, 0);
    assert.equal(r.schedule.at(-1)?.balance, 0);
    assert.ok((r.drawPeriodInterest ?? 0) > 40000);
    assert.ok((r.totalInterest ?? 0) > (r.drawPeriodInterest ?? 0));
  });

  it("extra payments shorten repayment and cut interest", () => {
    const baseRun = computeHeloc(base);
    const extra = computeHeloc({ ...base, extraMonthly: 200 });
    assert.ok((extra.repaymentPayoffMonths ?? 999) < (baseRun.repaymentPayoffMonths ?? 0));
    assert.ok((extra.repaymentInterest ?? 0) < (baseRun.repaymentInterest ?? 0));
    assert.equal(extra.schedule.at(-1)?.balance, 0);
  });

  it("zero draw years skips draw phase", () => {
    const r = computeHeloc({ ...base, drawYears: 0 });
    assert.equal(r.valid, true);
    assert.equal(r.schedule.filter((row) => row.phase === "draw").length, 0);
    assert.equal(r.drawPeriodInterest, 0);
    assert.ok((r.repaymentPayoffMonths ?? 0) > 0);
  });

  it("0% APR has zero interest-only payment", () => {
    const r = computeHeloc({ ...base, drawAprPercent: 0 });
    assert.equal(r.drawMonthlyPayment, 0);
    assert.equal(r.repaymentMonthlyPayment, roundish(50000 / 240));
    assert.equal(r.totalInterest, 0);
  });

  it("rejects drawn above credit limit", () => {
    const r = computeHeloc({ ...base, amountDrawn: 90000 });
    assert.equal(r.valid, false);
    assert.ok(r.error);
  });

  it("rejects invalid home value and rates", () => {
    assert.equal(computeHeloc({ ...base, homeValue: 0 }).valid, false);
    assert.equal(computeHeloc({ ...base, drawAprPercent: -1 }).valid, false);
    assert.equal(computeHeloc({ ...base, repaymentYears: 0 }).valid, false);
    assert.equal(computeHeloc({ ...base, homeValue: Number.NaN }).valid, false);
  });
});

function roundish(n: number): number {
  return Math.round(n * 100) / 100;
}
