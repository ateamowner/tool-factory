import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  amortizingMonthlyPayment,
  computeStudentLoanRefinance,
  remainingTermMonths,
} from "./student-loan-refinance.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

describe("remainingTermMonths", () => {
  it("accepts years plus extra months, or months only", () => {
    assert.equal(remainingTermMonths(10, 0), 120);
    assert.equal(remainingTermMonths(9, 6), 114);
    assert.equal(remainingTermMonths(0, 180), 180);
  });

  it("rejects empty or oversized remaining terms", () => {
    assert.equal(remainingTermMonths(0, 0), null);
    assert.equal(remainingTermMonths(-1, 6), null);
    assert.equal(remainingTermMonths(31, 0), null);
  });
});

describe("amortizingMonthlyPayment", () => {
  it("uses principal divided by months when the rate is zero", () => {
    assert.equal(amortizingMonthlyPayment(35000, 0, 120), 35000 / 120);
  });

  it("returns a standard student-loan payment at a positive rate", () => {
    assert.equal(cents(amortizingMonthlyPayment(35000, 6.8, 120)), 402.78);
  });
});

describe("computeStudentLoanRefinance", () => {
  it("compares current vs refinance payment, interest, savings, and break-even", () => {
    const result = computeStudentLoanRefinance({
      currentBalance: 35000,
      currentRatePercent: 6.8,
      remainingYears: 10,
      remainingExtraMonths: 0,
      newRatePercent: 4.5,
      newTermMonths: 120,
      fees: 500,
    });

    assert.equal(result.valid, true);
    assert.equal(result.remainingMonths, 120);
    assert.equal(result.newTermMonths, 120);
    assert.equal(cents(result.currentMonthlyPayment), 402.78);
    assert.equal(cents(result.newMonthlyPayment), 362.73);
    assert.equal(cents(result.monthlySavings), 40.05);
    assert.equal(cents(result.currentTotalInterest), 13333.74);
    assert.equal(cents(result.newTotalInterest), 8528.13);
    assert.equal(cents(result.interestSavings), 4805.61);
    assert.equal(cents(result.currentTotalCost), 48333.74);
    assert.equal(cents(result.newTotalCost), 44028.13);
    assert.equal(cents(result.totalCostSavings), 4305.61);
    assert.equal(cents(result.breakEvenMonths), 12.49);
    assert.equal(result.neverBreaksEven, false);
  });

  it("hides break-even when fees are zero and flags never-break-even when there is no monthly savings", () => {
    const noFees = computeStudentLoanRefinance({
      currentBalance: 25000,
      currentRatePercent: 6,
      remainingYears: 8,
      remainingExtraMonths: 0,
      newRatePercent: 5,
      newTermMonths: 96,
      fees: 0,
    });
    assert.equal(noFees.valid, true);
    assert.equal(noFees.breakEvenMonths, null);
    assert.equal(noFees.neverBreaksEven, false);

    const worseRate = computeStudentLoanRefinance({
      currentBalance: 25000,
      currentRatePercent: 5,
      remainingYears: 8,
      remainingExtraMonths: 0,
      newRatePercent: 8,
      newTermMonths: 96,
      fees: 250,
    });
    assert.equal(worseRate.valid, true);
    assert.ok((worseRate.monthlySavings ?? 0) < 0);
    assert.equal(worseRate.breakEvenMonths, null);
    assert.equal(worseRate.neverBreaksEven, true);
  });

  it("can raise total interest when a longer term cuts the monthly payment", () => {
    const result = computeStudentLoanRefinance({
      currentBalance: 35000,
      currentRatePercent: 6.8,
      remainingYears: 10,
      remainingExtraMonths: 0,
      newRatePercent: 6,
      newTermMonths: 240,
      fees: 0,
    });

    assert.equal(result.valid, true);
    assert.ok((result.newMonthlyPayment ?? 0) < (result.currentMonthlyPayment ?? 0));
    assert.ok((result.newTotalInterest ?? 0) > (result.currentTotalInterest ?? 0));
    assert.ok((result.totalCostSavings ?? 0) < 0);
  });

  it("saves no interest when both rates are 0%", () => {
    const result = computeStudentLoanRefinance({
      currentBalance: 24000,
      currentRatePercent: 0,
      remainingYears: 0,
      remainingExtraMonths: 120,
      newRatePercent: 0,
      newTermMonths: 120,
      fees: 0,
    });

    assert.equal(result.valid, true);
    assert.equal(result.currentMonthlyPayment, 200);
    assert.equal(result.newMonthlyPayment, 200);
    assert.equal(result.currentTotalInterest, 0);
    assert.equal(result.newTotalInterest, 0);
    assert.equal(result.monthlySavings, 0);
  });

  it("rejects a missing balance, negative rates, empty terms, or negative fees", () => {
    assert.equal(
      computeStudentLoanRefinance({
        currentBalance: 0,
        currentRatePercent: 6,
        remainingYears: 10,
        remainingExtraMonths: 0,
        newRatePercent: 5,
        newTermMonths: 120,
        fees: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeStudentLoanRefinance({
        currentBalance: 10000,
        currentRatePercent: -1,
        remainingYears: 10,
        remainingExtraMonths: 0,
        newRatePercent: 5,
        newTermMonths: 120,
        fees: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeStudentLoanRefinance({
        currentBalance: 10000,
        currentRatePercent: 6,
        remainingYears: 0,
        remainingExtraMonths: 0,
        newRatePercent: 5,
        newTermMonths: 120,
        fees: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeStudentLoanRefinance({
        currentBalance: 10000,
        currentRatePercent: 6,
        remainingYears: 10,
        remainingExtraMonths: 0,
        newRatePercent: 5,
        newTermMonths: 0,
        fees: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeStudentLoanRefinance({
        currentBalance: 10000,
        currentRatePercent: 6,
        remainingYears: 10,
        remainingExtraMonths: 0,
        newRatePercent: 5,
        newTermMonths: 120,
        fees: -10,
      }).valid,
      false,
    );
  });
});

describe("FAQPage JSON-LD shape for student loan refinance calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a student loan refinance calculator work?",
        answer:
          "It re-amortizes the current balance at the new rate and term, then compares payment, interest, and estimated savings with the current loan.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
