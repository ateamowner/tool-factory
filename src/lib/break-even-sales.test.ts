import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import { ceilUnits, computeBreakEvenSales } from "./break-even-sales.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

describe("ceilUnits", () => {
  it("returns 0 for non-positive or non-finite values", () => {
    assert.equal(ceilUnits(0), 0);
    assert.equal(ceilUnits(-4), 0);
    assert.equal(ceilUnits(Number.NaN), 0);
  });

  it("ceils fractional units and keeps exact integers", () => {
    assert.equal(ceilUnits(1000), 1000);
    assert.equal(ceilUnits(952.380952), 953);
    assert.equal(ceilUnits(1.00000000001), 1);
  });
});

describe("computeBreakEvenSales", () => {
  it("computes contribution margin, units, and sales on a typical product", () => {
    const result = computeBreakEvenSales({
      fixedCosts: 10000,
      variableCostPerUnit: 12,
      sellingPricePerUnit: 20,
      targetProfit: null,
    });

    assert.equal(result.status, "ok");
    assert.equal(result.valid, true);
    assert.equal(result.contributionMargin, 8);
    assert.equal(result.contributionMarginPercent, 40);
    assert.equal(result.breakEvenUnitsExact, 1250);
    assert.equal(result.breakEvenUnits, 1250);
    assert.equal(cents(result.breakEvenSalesFromRatio), 25000);
    assert.equal(cents(result.breakEvenSales), 25000);
    assert.equal(result.hasTargetProfit, false);
    assert.equal(result.targetUnits, null);
  });

  it("ceils break-even units and shows exact plus whole-unit sales", () => {
    const result = computeBreakEvenSales({
      fixedCosts: 10000,
      variableCostPerUnit: 15,
      sellingPricePerUnit: 25.5,
      targetProfit: null,
    });

    assert.equal(result.valid, true);
    assert.equal(cents(result.contributionMargin), 10.5);
    assert.ok(result.breakEvenUnitsExact !== null);
    assert.ok(Math.abs(result.breakEvenUnitsExact! - 10000 / 10.5) < 1e-9);
    assert.equal(result.breakEvenUnits, 953);
    assert.equal(cents(result.breakEvenSalesFromRatio), cents(10000 / (10.5 / 25.5)));
    assert.equal(cents(result.breakEvenSales), 24301.5);
  });

  it("adds optional target profit to units and revenue", () => {
    const result = computeBreakEvenSales({
      fixedCosts: 10000,
      variableCostPerUnit: 12,
      sellingPricePerUnit: 20,
      targetProfit: 4000,
    });

    assert.equal(result.valid, true);
    assert.equal(result.hasTargetProfit, true);
    assert.equal(result.targetProfit, 4000);
    assert.equal(result.targetUnitsExact, 1750);
    assert.equal(result.targetUnits, 1750);
    assert.equal(cents(result.targetSales), 35000);
    assert.equal(result.breakEvenUnits, 1250);
  });

  it("treats zero fixed costs as already at break-even when margin is positive", () => {
    const result = computeBreakEvenSales({
      fixedCosts: 0,
      variableCostPerUnit: 5,
      sellingPricePerUnit: 10,
      targetProfit: 100,
    });

    assert.equal(result.valid, true);
    assert.equal(result.breakEvenUnitsExact, 0);
    assert.equal(result.breakEvenUnits, 0);
    assert.equal(result.breakEvenSales, 0);
    assert.equal(result.targetUnitsExact, 20);
    assert.equal(result.targetUnits, 20);
    assert.equal(result.targetSales, 200);
  });

  it("marks price at or below variable cost as unreachable (no break-even)", () => {
    const equal = computeBreakEvenSales({
      fixedCosts: 5000,
      variableCostPerUnit: 20,
      sellingPricePerUnit: 20,
      targetProfit: null,
    });
    assert.equal(equal.status, "unreachable");
    assert.equal(equal.valid, false);
    assert.equal(equal.contributionMargin, 0);
    assert.equal(equal.breakEvenUnits, null);
    assert.equal(equal.breakEvenSales, null);

    const below = computeBreakEvenSales({
      fixedCosts: 5000,
      variableCostPerUnit: 25,
      sellingPricePerUnit: 20,
      targetProfit: 1000,
    });
    assert.equal(below.status, "unreachable");
    assert.equal(below.contributionMargin, -5);
    assert.equal(below.hasTargetProfit, true);
    assert.equal(below.targetUnits, null);
  });

  it("rejects missing, negative, or non-finite inputs", () => {
    assert.equal(
      computeBreakEvenSales({
        fixedCosts: -1,
        variableCostPerUnit: 5,
        sellingPricePerUnit: 10,
        targetProfit: null,
      }).status,
      "invalid",
    );
    assert.equal(
      computeBreakEvenSales({
        fixedCosts: 1000,
        variableCostPerUnit: -1,
        sellingPricePerUnit: 10,
        targetProfit: null,
      }).status,
      "invalid",
    );
    assert.equal(
      computeBreakEvenSales({
        fixedCosts: 1000,
        variableCostPerUnit: 5,
        sellingPricePerUnit: 0,
        targetProfit: null,
      }).status,
      "invalid",
    );
    assert.equal(
      computeBreakEvenSales({
        fixedCosts: 1000,
        variableCostPerUnit: 5,
        sellingPricePerUnit: 10,
        targetProfit: -50,
      }).status,
      "invalid",
    );
    assert.equal(
      computeBreakEvenSales({
        fixedCosts: Number.NaN,
        variableCostPerUnit: 5,
        sellingPricePerUnit: 10,
        targetProfit: null,
      }).status,
      "invalid",
    );
  });
});

describe("FAQPage JSON-LD shape for break even sales calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "What does break-even sales mean?",
        answer:
          "Break-even sales is the revenue where contribution margin covers fixed costs and profit is zero.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
