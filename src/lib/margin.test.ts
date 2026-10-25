import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeMargin,
  formatPercent,
  grossMarginPercent,
  markupFromMargin,
  priceFromMargin,
  type MarginInput,
} from "./margin.ts";

const base: MarginInput = { mode: "cost_price", cost: 80, sellingPrice: 100, marginPercent: 20 };

const close = (a: number | null, b: number) => {
  assert.ok(a !== null && Math.abs(a - b) < 1e-9, `${a} !== ${b}`);
};

describe("margin formulas", () => {
  it("$80 cost and $100 price is a 20% margin", () => {
    close(grossMarginPercent(80, 100), 20);
  });
  it("40% margin on $60 cost is a $100 price", () => {
    close(priceFromMargin(60, 40), 100);
  });
  it("50% margin equals 100% markup", () => {
    close(markupFromMargin(50), 100);
  });
  it("formats percents", () => {
    assert.equal(formatPercent(20), "20%");
    assert.equal(formatPercent(33.3333), "33.33%");
  });
});

describe("computeMargin", () => {
  it("cost + price returns profit, margin, and markup", () => {
    const r = computeMargin(base);
    assert.equal(r.valid, true);
    close(r.profit, 20);
    close(r.marginPercent, 20);
    close(r.markupPercent, 25);
  });
  it("price below cost gives negative margin", () => {
    const r = computeMargin({ ...base, sellingPrice: 50 });
    close(r.marginPercent, -60);
    close(r.profit, -30);
  });
  it("zero cost gives 100% margin and no markup", () => {
    const r = computeMargin({ ...base, cost: 0 });
    close(r.marginPercent, 100);
    assert.equal(r.markupPercent, null);
  });
  it("zero price is rejected", () => {
    assert.equal(computeMargin({ ...base, sellingPrice: 0 }).status, "price_required");
  });
  it("cost + target margin solves price", () => {
    const r = computeMargin({ ...base, mode: "cost_margin", cost: 80, marginPercent: 20 });
    close(r.sellingPrice, 100);
    close(r.profit, 20);
    close(r.markupPercent, 25);
  });
  it("100% target margin is unreachable", () => {
    assert.equal(
      computeMargin({ ...base, mode: "cost_margin", marginPercent: 100 }).status,
      "margin_unreachable",
    );
  });
  it("rejects negative and non-finite input", () => {
    assert.equal(computeMargin({ ...base, cost: -1 }).status, "invalid");
    assert.equal(computeMargin({ ...base, sellingPrice: Number.NaN }).status, "invalid");
    assert.equal(computeMargin({ ...base, mode: "cost_margin", marginPercent: -5 }).status, "invalid");
    assert.equal(computeMargin({ ...base, mode: "cost_margin", cost: 0 }).status, "cost_required");
  });
});
