import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeNetWorth, type NetWorthInput } from "./net-worth.ts";

const zero: NetWorthInput = {
  cash: 0, investments: 0, retirement: 0, home: 0, vehicles: 0, otherAssets: 0,
  mortgage: 0, loans: 0, creditCards: 0, otherDebts: 0,
};

describe("computeNetWorth", () => {
  it("sums assets and debts", () => {
    const r = computeNetWorth({
      ...zero, cash: 10000, investments: 20000, retirement: 50000, home: 300000, vehicles: 15000,
      mortgage: 200000, loans: 10000, creditCards: 5000,
    });
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.totalAssets, 395000);
    assert.equal(r.totalDebts, 215000);
    assert.equal(r.netWorth, 180000);
    assert.equal(r.assetToDebtRatio, 1.84);
    assert.equal(r.debtToAssetRatio, 0.5443);
  });

  it("returns negative net worth when debts exceed assets", () => {
    const r = computeNetWorth({ ...zero, cash: 1000, creditCards: 4000 });
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.netWorth, -3000);
    assert.equal(r.assetToDebtRatio, 0.25);
  });

  it("has no ratio when there are no debts", () => {
    const r = computeNetWorth({ ...zero, cash: 500 });
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.assetToDebtRatio, null);
    assert.equal(r.debtToAssetRatio, 0);
  });

  it("has no debt-to-asset ratio when there are no assets", () => {
    const r = computeNetWorth({ ...zero, loans: 500 });
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.debtToAssetRatio, null);
    assert.equal(r.assetToDebtRatio, 0);
  });

  it("handles all zeros", () => {
    const r = computeNetWorth(zero);
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.netWorth, 0);
    assert.equal(r.assetToDebtRatio, null);
  });

  it("rejects negative or non-numeric input", () => {
    assert.equal(computeNetWorth({ ...zero, cash: -1 }).valid, false);
    assert.equal(computeNetWorth({ ...zero, home: Number.NaN }).valid, false);
  });
});
