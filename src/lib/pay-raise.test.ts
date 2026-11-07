import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { breakdown, computePayRaise, formatMoney, formatPct, percentChange } from "./pay-raise.ts";

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !== ${b}`);
const base = { raisePercent: 0, raiseAmount: 0, newPay: 0, hoursPerWeek: 40 };

describe("pay raise calculator", () => {
  it("salary $60,000 with a 5% raise → $63,000, +$3,000/yr", () => {
    const r = computePayRaise({ ...base, mode: "percent", basis: "salary", currentPay: 60000, raisePercent: 5 });
    assert.equal(r.valid, true);
    if (r.valid) {
      close(r.newPay.annual, 63000);
      close(r.difference.annual, 3000);
      close(r.difference.monthly, 250);
      close(r.newPay.hourly, 63000 / 2080);
      close(r.raisePercent, 5);
    }
  });

  it("hourly $20 plus $1.50 → $21.50, 7.5%, $3,120/yr at 40h", () => {
    const r = computePayRaise({ ...base, mode: "amount", basis: "hourly", currentPay: 20, raiseAmount: 1.5 });
    assert.equal(r.valid, true);
    if (r.valid) {
      close(r.newPay.hourly, 21.5);
      close(r.raisePercent, 7.5);
      close(r.difference.annual, 3120);
      close(r.difference.weekly, 60);
    }
  });

  it("reverse: $50,000 to $54,000 is an 8% raise", () => {
    const r = computePayRaise({ ...base, mode: "reverse", basis: "salary", currentPay: 50000, newPay: 54000 });
    assert.equal(r.valid, true);
    if (r.valid) close(r.raisePercent, 8);
    close(percentChange(25, 24), -4);
  });

  it("breakdown hourly at 40h/week", () => {
    const b = breakdown(25, "hourly", 40);
    close(b.annual, 52000);
    close(b.weekly, 1000);
    close(b.monthly, 52000 / 12);
  });

  it("rejects bad input", () => {
    assert.equal(computePayRaise({ ...base, mode: "percent", basis: "salary", currentPay: 0, raisePercent: 5 }).valid, false);
    assert.equal(computePayRaise({ ...base, mode: "percent", basis: "hourly", currentPay: 20, raisePercent: 5, hoursPerWeek: 0 }).valid, false);
    assert.equal(computePayRaise({ ...base, mode: "reverse", basis: "salary", currentPay: 50000, newPay: Number.NaN }).valid, false);
    assert.equal(computePayRaise({ ...base, mode: "percent", basis: "salary", currentPay: 50000, raisePercent: -150 }).valid, false);
  });

  it("formats", () => {
    assert.equal(formatMoney(3000), "$3,000.00");
    assert.equal(formatMoney(-12.5), "−$12.50");
    assert.equal(formatPct(7.5), "7.5%");
  });
});
