import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  clampTargetMonths,
  computeEmergencyFund,
  sumExpenseLines,
} from "./emergency-fund.ts";

describe("computeEmergencyFund", () => {
  it("computes a 6-month target, gap, and months to fund", () => {
    const result = computeEmergencyFund({
      monthlyExpenses: 3000,
      targetMonths: 6,
      currentSavings: 4500,
      monthlyContribution: 500,
    });

    assert.equal(result.valid, true);
    assert.equal(result.targetFund, 18000);
    assert.equal(result.gap, 13500);
    assert.equal(result.surplus, 0);
    assert.equal(result.funded, false);
    assert.equal(result.monthsToFundExact, 27);
    assert.equal(result.monthsToFund, 27);
    assert.equal(result.threeMonthTarget, 9000);
    assert.equal(result.sixMonthTarget, 18000);
    assert.equal(result.threeMonthGap, 4500);
    assert.equal(result.sixMonthGap, 13500);
  });

  it("rounds months to fund up when the last contribution is partial", () => {
    const result = computeEmergencyFund({
      monthlyExpenses: 2000,
      targetMonths: 3,
      currentSavings: 1000,
      monthlyContribution: 400,
    });

    assert.equal(result.targetFund, 6000);
    assert.equal(result.gap, 5000);
    assert.equal(result.monthsToFundExact, 12.5);
    assert.equal(result.monthsToFund, 13);
  });

  it("marks the fund as complete and reports a surplus", () => {
    const result = computeEmergencyFund({
      monthlyExpenses: 2500,
      targetMonths: 6,
      currentSavings: 20000,
      monthlyContribution: 200,
    });

    assert.equal(result.funded, true);
    assert.equal(result.gap, 0);
    assert.equal(result.surplus, 5000);
    assert.equal(result.monthsToFund, 0);
    assert.equal(result.sixMonthGap, 0);
    assert.equal(result.threeMonthGap, 0);
  });

  it("omits months to fund when no contribution is entered", () => {
    const result = computeEmergencyFund({
      monthlyExpenses: 4000,
      targetMonths: 6,
      currentSavings: 1000,
      monthlyContribution: 0,
    });

    assert.equal(result.valid, true);
    assert.equal(result.gap, 23000);
    assert.equal(result.monthsToFund, null);
    assert.equal(result.monthsToFundExact, null);
  });

  it("rejects expenses at or below zero and months outside 3–12", () => {
    assert.equal(
      computeEmergencyFund({
        monthlyExpenses: 0,
        targetMonths: 6,
        currentSavings: 0,
        monthlyContribution: 100,
      }).valid,
      false,
    );
    assert.equal(
      computeEmergencyFund({
        monthlyExpenses: 2000,
        targetMonths: 2,
        currentSavings: 0,
        monthlyContribution: 100,
      }).valid,
      false,
    );
    assert.equal(
      computeEmergencyFund({
        monthlyExpenses: 2000,
        targetMonths: 13,
        currentSavings: 0,
        monthlyContribution: 100,
      }).valid,
      false,
    );
    assert.equal(clampTargetMonths(6), 6);
    assert.equal(clampTargetMonths(2), null);
  });

  it("sums optional expense line items and ignores invalid rows", () => {
    assert.equal(
      sumExpenseLines({
        housing: 1400,
        food: 600,
        utilities: 200,
        insurance: 150,
        transport: 250,
        debt: 300,
      }),
      2900,
    );
    assert.equal(sumExpenseLines({ housing: 1000, food: Number.NaN, debt: -20 }), 1000);
  });
});

describe("FAQPage JSON-LD shape for emergency fund calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does an emergency fund calculator work?",
        answer:
          "It multiplies monthly essential expenses by a target number of months.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
