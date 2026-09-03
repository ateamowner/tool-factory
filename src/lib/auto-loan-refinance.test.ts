import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  amortizingMonthlyPayment,
  computeAutoLoanRefinance,
  payoffWithPayment,
  remainingTermMonths,
} from "./auto-loan-refinance.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

describe("remainingTermMonths", () => {
  it("accepts years plus extra months, or months only", () => {
    assert.equal(remainingTermMonths(3, 0), 36);
    assert.equal(remainingTermMonths(2, 6), 30);
    assert.equal(remainingTermMonths(0, 48), 48);
  });

  it("rejects empty or oversized remaining terms", () => {
    assert.equal(remainingTermMonths(0, 0), null);
    assert.equal(remainingTermMonths(-1, 6), null);
    assert.equal(remainingTermMonths(21, 0), null);
  });
});

describe("amortizingMonthlyPayment", () => {
  it("uses principal divided by months when the rate is zero", () => {
    assert.equal(amortizingMonthlyPayment(18000, 0, 36), 500);
  });

  it("returns a standard auto-loan payment at a positive rate", () => {
    assert.equal(cents(amortizingMonthlyPayment(18000, 8.5, 36)), 568.22);
  });
});

describe("payoffWithPayment", () => {
  it("shortens the term when extra principal is paid each month", () => {
    const scheduled = amortizingMonthlyPayment(18000, 5.9, 36);
    assert.ok(scheduled);
    const payoff = payoffWithPayment(18000, 5.9, scheduled + 100);
    assert.ok(payoff);
    assert.ok(payoff.months < 36);
    assert.ok(payoff.totalInterest < remainingInterestApprox(18000, scheduled, 36));
  });

  it("pays no interest at a 0% rate", () => {
    const payoff = payoffWithPayment(12000, 0, 1000);
    assert.deepEqual(payoff, { months: 12, totalPaid: 12000, totalInterest: 0 });
  });
});

function remainingInterestApprox(principal: number, payment: number, months: number): number {
  return payment * months - principal;
}

describe("computeAutoLoanRefinance", () => {
  it("compares current vs refinance payment, interest, cost, and break-even", () => {
    const result = computeAutoLoanRefinance({
      currentBalance: 18000,
      currentRatePercent: 8.5,
      remainingYears: 3,
      remainingExtraMonths: 0,
      newRatePercent: 5.9,
      newTermMonths: 36,
      fees: 399,
      extraMonthlyPayment: 0,
    });

    assert.equal(result.valid, true);
    assert.equal(result.remainingMonths, 36);
    assert.equal(result.newTermMonths, 36);
    assert.equal(cents(result.currentMonthlyPayment), 568.22);
    assert.equal(cents(result.newMonthlyPayment), 546.78);
    assert.equal(cents(result.monthlySavings), 21.44);
    assert.equal(cents(result.currentTotalInterest), 2455.76);
    assert.equal(cents(result.newTotalInterest), 1684.07);
    assert.equal(cents(result.interestSavings), 771.7);
    assert.equal(cents(result.currentTotalCost), 20455.76);
    assert.equal(cents(result.newTotalCost), 20083.07);
    assert.equal(cents(result.breakEvenMonths), 18.61);
    assert.equal(result.neverBreaksEven, false);
    assert.equal(result.newMonthsToPayoff, 36);
  });

  it("uses extra monthly payment to cut interest and months to pay off", () => {
    const base = computeAutoLoanRefinance({
      currentBalance: 18000,
      currentRatePercent: 8.5,
      remainingYears: 0,
      remainingExtraMonths: 36,
      newRatePercent: 5.9,
      newTermMonths: 36,
      fees: 0,
      extraMonthlyPayment: 0,
    });
    const extra = computeAutoLoanRefinance({
      currentBalance: 18000,
      currentRatePercent: 8.5,
      remainingYears: 0,
      remainingExtraMonths: 36,
      newRatePercent: 5.9,
      newTermMonths: 36,
      fees: 0,
      extraMonthlyPayment: 75,
    });

    assert.equal(base.valid, true);
    assert.equal(extra.valid, true);
    assert.equal(cents(extra.newPaymentWithExtra), cents((base.newMonthlyPayment ?? 0) + 75));
    assert.ok((extra.newMonthsToPayoff ?? 0) < (base.newMonthsToPayoff ?? 0));
    assert.ok((extra.newTotalInterest ?? 0) < (base.newTotalInterest ?? 0));
    assert.equal(extra.breakEvenMonths, null);
  });

  it("hides break-even when fees are zero and flags never-break-even when there is no monthly savings", () => {
    const noFees = computeAutoLoanRefinance({
      currentBalance: 15000,
      currentRatePercent: 6,
      remainingYears: 2,
      remainingExtraMonths: 0,
      newRatePercent: 5,
      newTermMonths: 24,
      fees: 0,
      extraMonthlyPayment: 0,
    });
    assert.equal(noFees.valid, true);
    assert.equal(noFees.breakEvenMonths, null);
    assert.equal(noFees.neverBreaksEven, false);

    const worseRate = computeAutoLoanRefinance({
      currentBalance: 15000,
      currentRatePercent: 5,
      remainingYears: 2,
      remainingExtraMonths: 0,
      newRatePercent: 8,
      newTermMonths: 24,
      fees: 250,
      extraMonthlyPayment: 0,
    });
    assert.equal(worseRate.valid, true);
    assert.ok((worseRate.monthlySavings ?? 0) < 0);
    assert.equal(worseRate.breakEvenMonths, null);
    assert.equal(worseRate.neverBreaksEven, true);
  });

  it("saves no interest when both rates are 0%", () => {
    const result = computeAutoLoanRefinance({
      currentBalance: 12000,
      currentRatePercent: 0,
      remainingYears: 2,
      remainingExtraMonths: 0,
      newRatePercent: 0,
      newTermMonths: 24,
      fees: 0,
      extraMonthlyPayment: 0,
    });

    assert.equal(result.valid, true);
    assert.equal(result.currentMonthlyPayment, 500);
    assert.equal(result.newMonthlyPayment, 500);
    assert.equal(result.currentTotalInterest, 0);
    assert.equal(result.newTotalInterest, 0);
    assert.equal(result.monthlySavings, 0);
  });

  it("rejects a missing balance, negative rates, empty terms, or negative fees", () => {
    assert.equal(
      computeAutoLoanRefinance({
        currentBalance: 0,
        currentRatePercent: 6,
        remainingYears: 3,
        remainingExtraMonths: 0,
        newRatePercent: 5,
        newTermMonths: 36,
        fees: 0,
        extraMonthlyPayment: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeAutoLoanRefinance({
        currentBalance: 10000,
        currentRatePercent: -1,
        remainingYears: 3,
        remainingExtraMonths: 0,
        newRatePercent: 5,
        newTermMonths: 36,
        fees: 0,
        extraMonthlyPayment: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeAutoLoanRefinance({
        currentBalance: 10000,
        currentRatePercent: 6,
        remainingYears: 0,
        remainingExtraMonths: 0,
        newRatePercent: 5,
        newTermMonths: 36,
        fees: 0,
        extraMonthlyPayment: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeAutoLoanRefinance({
        currentBalance: 10000,
        currentRatePercent: 6,
        remainingYears: 3,
        remainingExtraMonths: 0,
        newRatePercent: 5,
        newTermMonths: 0,
        fees: 0,
        extraMonthlyPayment: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeAutoLoanRefinance({
        currentBalance: 10000,
        currentRatePercent: 6,
        remainingYears: 3,
        remainingExtraMonths: 0,
        newRatePercent: 5,
        newTermMonths: 36,
        fees: -10,
        extraMonthlyPayment: 0,
      }).valid,
      false,
    );
  });
});

describe("FAQPage JSON-LD shape for refinance calculator auto loan", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a refinance calculator auto loan work?",
        answer:
          "It re-amortizes the current balance at the new rate and term, then compares payment, interest, and total cost with the current loan.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
