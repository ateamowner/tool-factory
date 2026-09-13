import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  computeBalanceTransfer,
  monthlyInterestRate,
  simulateRevolvingPayoff,
  transferFeeAmount,
} from "./balance-transfer.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

describe("transferFeeAmount", () => {
  it("adds a percent of the transferred balance plus an optional flat fee", () => {
    assert.equal(transferFeeAmount(5000, 3, 0), 150);
    assert.equal(transferFeeAmount(5000, 5, 10), 260);
    assert.equal(transferFeeAmount(4000, 0, 0), 0);
  });
});

describe("monthlyInterestRate", () => {
  it("converts APR to a monthly rate", () => {
    assert.equal(monthlyInterestRate(24), 0.02);
    assert.equal(monthlyInterestRate(0), 0);
  });
});

describe("simulateRevolvingPayoff", () => {
  it("pays off a 0% balance in ceiling(balance / payment) months", () => {
    const result = simulateRevolvingPayoff(3090, 500, () => 0);
    assert.equal(result.neverPaysOff, false);
    assert.equal(result.monthsToPayoff, 7);
    assert.equal(result.totalInterest, 0);
  });

  it("flags a payment that never covers interest", () => {
    const result = simulateRevolvingPayoff(5000, 50, () => 24);
    assert.equal(result.neverPaysOff, true);
    assert.equal(result.monthsToPayoff, null);
    assert.ok(result.endingBalance > 5000);
  });
});

describe("computeBalanceTransfer", () => {
  it("compares stay-put vs a 0% promo that finishes during the intro window", () => {
    const result = computeBalanceTransfer({
      currentBalance: 3000,
      currentAprPercent: 20,
      monthlyPayment: 500,
      transferFeePercent: 3,
      transferFeeFlat: 0,
      promoAprPercent: 0,
      promoLengthMonths: 15,
      regularAprPercent: 20,
    });

    assert.equal(result.valid, true);
    assert.equal(result.transferFee, 90);
    assert.equal(result.startingBalanceAfterFee, 3090);
    assert.equal(result.transferMonthsToPayoff, 7);
    assert.equal(result.paidOffDuringPromo, true);
    assert.equal(result.willNotFinishInPromo, false);
    assert.equal(result.transferTotalInterest, 0);
    assert.equal(cents(result.transferTotalCost), 90);
    assert.equal(result.stayMonthsToPayoff, 7);
    assert.equal(cents(result.stayTotalInterest), 188.05);
    assert.equal(cents(result.estimatedSavings), 98.05);
    assert.equal(result.stayNeverPaysOff, false);
    assert.equal(result.transferNeverPaysOff, false);
    assert.equal(result.paymentTooLow, false);
  });

  it("adds a flat fee on top of the percent fee", () => {
    const result = computeBalanceTransfer({
      currentBalance: 5000,
      currentAprPercent: 22.99,
      monthlyPayment: 250,
      transferFeePercent: 5,
      transferFeeFlat: 10,
      promoAprPercent: 0,
      promoLengthMonths: 18,
      regularAprPercent: 19.99,
    });

    assert.equal(result.valid, true);
    assert.equal(result.transferFee, 260);
    assert.equal(result.startingBalanceAfterFee, 5260);
  });

  it("marks a transfer that still has a balance after the promo ends", () => {
    const result = computeBalanceTransfer({
      currentBalance: 5000,
      currentAprPercent: 22.99,
      monthlyPayment: 200,
      transferFeePercent: 3,
      transferFeeFlat: 0,
      promoAprPercent: 0,
      promoLengthMonths: 15,
      regularAprPercent: 19.99,
    });

    assert.equal(result.valid, true);
    assert.equal(result.transferFee, 150);
    assert.equal(result.startingBalanceAfterFee, 5150);
    assert.equal(result.paidOffDuringPromo, false);
    assert.equal(result.willNotFinishInPromo, true);
    assert.equal(result.transferNeverPaysOff, false);
    assert.ok((result.transferMonthsToPayoff ?? 0) > 15);
    assert.ok((result.transferTotalInterest ?? 0) > 0);
    assert.ok((result.stayTotalInterest ?? 0) > (result.transferTotalInterest ?? 0));
    assert.ok((result.estimatedSavings ?? 0) > 0);
  });

  it("says the payment is too low when stay-put interest is never covered", () => {
    const result = computeBalanceTransfer({
      currentBalance: 5000,
      currentAprPercent: 36,
      monthlyPayment: 150,
      transferFeePercent: 3,
      transferFeeFlat: 0,
      promoAprPercent: 0,
      promoLengthMonths: 36,
      regularAprPercent: 21.99,
    });

    assert.equal(result.valid, true);
    assert.equal(result.stayNeverPaysOff, true);
    assert.equal(result.stayMonthsToPayoff, null);
    assert.equal(result.stayTotalInterest, null);
    assert.equal(result.transferNeverPaysOff, false);
    assert.equal(result.paidOffDuringPromo, true);
    assert.equal(result.transferMonthsToPayoff, 35);
    assert.equal(result.transferTotalInterest, 0);
    assert.equal(result.estimatedSavings, null);
    assert.equal(result.paymentTooLow, true);
  });

  it("says both paths never pay off when the payment stays below interest", () => {
    const result = computeBalanceTransfer({
      currentBalance: 5000,
      currentAprPercent: 24,
      monthlyPayment: 50,
      transferFeePercent: 3,
      transferFeeFlat: 0,
      promoAprPercent: 0,
      promoLengthMonths: 12,
      regularAprPercent: 21.99,
    });

    assert.equal(result.valid, true);
    assert.equal(result.stayNeverPaysOff, true);
    assert.equal(result.transferNeverPaysOff, true);
    assert.equal(result.paymentTooLow, true);
    assert.equal(result.willNotFinishInPromo, true);
    assert.equal(result.estimatedSavings, null);
    assert.equal(result.transferTotalInterest, null);
    assert.equal(result.transferTotalCost, null);
  });

  it("treats a 0-month promo as the regular APR from month one", () => {
    const result = computeBalanceTransfer({
      currentBalance: 2000,
      currentAprPercent: 18,
      monthlyPayment: 200,
      transferFeePercent: 0,
      transferFeeFlat: 0,
      promoAprPercent: 0,
      promoLengthMonths: 0,
      regularAprPercent: 18,
    });

    assert.equal(result.valid, true);
    assert.equal(result.paidOffDuringPromo, false);
    assert.equal(result.willNotFinishInPromo, false);
    assert.equal(result.transferFee, 0);
    assert.equal(result.startingBalanceAfterFee, 2000);
    assert.equal(result.stayMonthsToPayoff, result.transferMonthsToPayoff);
    assert.equal(cents(result.stayTotalInterest), cents(result.transferTotalInterest));
    assert.equal(cents(result.estimatedSavings), 0);
  });

  it("rejects a missing balance, empty payment, negative rates or fees, or an oversized promo", () => {
    const base = {
      currentBalance: 4000,
      currentAprPercent: 22,
      monthlyPayment: 150,
      transferFeePercent: 3,
      transferFeeFlat: 0,
      promoAprPercent: 0,
      promoLengthMonths: 15,
      regularAprPercent: 20,
    };

    assert.equal(computeBalanceTransfer({ ...base, currentBalance: 0 }).valid, false);
    assert.equal(computeBalanceTransfer({ ...base, monthlyPayment: 0 }).valid, false);
    assert.equal(computeBalanceTransfer({ ...base, currentAprPercent: -1 }).valid, false);
    assert.equal(computeBalanceTransfer({ ...base, promoAprPercent: -0.5 }).valid, false);
    assert.equal(computeBalanceTransfer({ ...base, regularAprPercent: -1 }).valid, false);
    assert.equal(computeBalanceTransfer({ ...base, transferFeePercent: -3 }).valid, false);
    assert.equal(computeBalanceTransfer({ ...base, transferFeeFlat: -10 }).valid, false);
    assert.equal(computeBalanceTransfer({ ...base, promoLengthMonths: 121 }).valid, false);
    assert.equal(computeBalanceTransfer({ ...base, promoLengthMonths: -1 }).valid, false);
  });
});

describe("FAQPage JSON-LD shape for balance transfer calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a balance transfer calculator work?",
        answer:
          "It compares keeping your current card APR with transferring the balance to a promo APR card, including the transfer fee.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
