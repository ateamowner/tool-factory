import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeStockAverage, lotCost } from "./stock-average.ts";

describe("computeStockAverage", () => {
  it("computes weighted average cost including fees", () => {
    const result = computeStockAverage(
      [
        { shares: 10, price: 100, fee: 5 },
        { shares: 20, price: 80, fee: 0 },
      ],
      90,
    );

    assert.equal(result.totalShares, 30);
    assert.equal(result.costBasisWithoutFees, 2600);
    assert.equal(result.totalFees, 5);
    assert.equal(result.totalInvested, 2605);
    assert.ok(result.weightedAverageCost);
    assert.equal(Number(result.weightedAverageCost.toFixed(6)), 86.833333);
    assert.equal(result.averagePriceWithoutFees, 2600 / 30);
    assert.equal(result.breakEvenPrice, result.weightedAverageCost);
    assert.equal(result.marketValue, 2700);
    assert.equal(result.unrealizedPL, 95);
    assert.ok(result.unrealizedPLPercent);
    assert.equal(
      Number(result.unrealizedPLPercent.toFixed(6)),
      Number(((95 / 2605) * 100).toFixed(6)),
    );
  });

  it("returns empty totals when lots are invalid", () => {
    const result = computeStockAverage([{ shares: 0, price: 10, fee: 1 }]);
    assert.equal(result.totalShares, 0);
    assert.equal(result.weightedAverageCost, null);
    assert.equal(result.unrealizedPL, null);
  });

  it("computes a single lot cost", () => {
    assert.equal(lotCost({ shares: 5, price: 12.5, fee: 1 }), 63.5);
  });
});
