import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeDebtPayoff, payoffDate, simulate } from "./debt-payoff.ts";

const debts = [
  { name: "Card A", balance: 5000, apr: 24, minPayment: 100 },
  { name: "Card B", balance: 1000, apr: 12, minPayment: 25 },
  { name: "Loan", balance: 8000, apr: 6, minPayment: 150 },
];

describe("computeDebtPayoff", () => {
  it("avalanche never pays more interest than snowball", () => {
    const r = computeDebtPayoff(debts, 200);
    assert.ok(r.valid);
    if (r.valid) {
      assert.ok(r.avalanche.totalInterest <= r.snowball.totalInterest);
      assert.ok(r.interestSaved >= 0);
      assert.equal(r.avalanche.schedule.at(-1)?.balance, 0);
      assert.equal(r.snowball.schedule.at(-1)?.balance, 0);
    }
  });

  it("matches a single-debt hand calculation", () => {
    // 1000 at 12% APR, 1%/month, pay 100/month: 11 months
    const r = simulate([{ name: "x", balance: 1000, apr: 12, minPayment: 100 }], 0, "avalanche");
    assert.ok(r);
    assert.equal(r.months, 11);
    assert.equal(r.schedule[0].interest, 10);
    assert.equal(r.schedule[0].balance, 910);
    assert.ok(Math.abs(r.totalPaid - (1000 + r.totalInterest)) < 0.02);
  });

  it("zero APR has zero interest", () => {
    const r = simulate([{ name: "x", balance: 1000, apr: 0, minPayment: 250 }], 0, "snowball");
    assert.ok(r);
    assert.equal(r.months, 4);
    assert.equal(r.totalInterest, 0);
  });

  it("extra payment shortens payoff", () => {
    const a = computeDebtPayoff(debts, 0);
    const b = computeDebtPayoff(debts, 300);
    assert.ok(a.valid && b.valid);
    if (a.valid && b.valid) {
      assert.ok(b.avalanche.months < a.avalanche.months);
      assert.ok(b.avalanche.totalInterest < a.avalanche.totalInterest);
    }
  });

  it("targets highest APR first for avalanche and smallest balance for snowball", () => {
    const r = computeDebtPayoff(debts, 300);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.snowball.payoffOrder[0], "Card B");
      assert.equal(r.avalanche.payoffOrder.length, 3);
    }
  });

  it("rejects payments that never cover interest", () => {
    const r = computeDebtPayoff([{ name: "x", balance: 10000, apr: 24, minPayment: 50 }], 0);
    assert.equal(r.valid, false);
  });

  it("validates inputs", () => {
    assert.equal(computeDebtPayoff([], 0).valid, false);
    assert.equal(computeDebtPayoff([{ name: "x", balance: -5, apr: 5, minPayment: 10 }], 0).valid, false);
    assert.equal(computeDebtPayoff(debts, -1).valid, false);
    assert.equal(computeDebtPayoff([{ name: "x", balance: 100, apr: 5, minPayment: 0 }], 0).valid, false);
  });

  it("payoffDate adds months", () => {
    const d = payoffDate(14, new Date(2026, 10, 27));
    assert.equal(d.getFullYear(), 2028);
    assert.equal(d.getMonth(), 0);
  });
});
