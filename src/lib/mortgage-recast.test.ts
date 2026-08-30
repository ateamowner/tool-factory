import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  amortizingMonthlyPayment,
  computeMortgageRecast,
  remainingTermMonths,
} from "./mortgage-recast.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

describe("remainingTermMonths", () => {
  it("converts years and extra months into a remaining term", () => {
    assert.equal(remainingTermMonths(25, 0), 300);
    assert.equal(remainingTermMonths(24, 6), 294);
    assert.equal(remainingTermMonths(0, 1), 1);
  });

  it("rejects empty or oversized remaining terms", () => {
    assert.equal(remainingTermMonths(0, 0), null);
    assert.equal(remainingTermMonths(-1, 6), null);
    assert.equal(remainingTermMonths(51, 0), null);
  });
});

describe("amortizingMonthlyPayment", () => {
  it("uses principal divided by months when the rate is zero", () => {
    assert.equal(amortizingMonthlyPayment(120000, 0, 120), 1000);
  });

  it("returns zero when the balance is already paid off", () => {
    assert.equal(amortizingMonthlyPayment(0, 6, 240), 0);
  });
});

describe("computeMortgageRecast", () => {
  it("lowers the payment over the same remaining term after a lump-sum recast", () => {
    const result = computeMortgageRecast({
      remainingBalance: 250000,
      annualRatePercent: 6,
      remainingYears: 25,
      remainingExtraMonths: 0,
      lumpSum: 50000,
    });

    assert.equal(result.valid, true);
    assert.equal(result.remainingMonths, 300);
    assert.equal(result.newBalance, 200000);
    assert.equal(result.paidOff, false);
    assert.equal(cents(result.currentMonthlyPayment), 1610.75);
    assert.equal(cents(result.newMonthlyPayment), 1288.6);
    assert.equal(cents(result.paymentDrop), 322.15);
    assert.equal(cents(result.interestSavings), 46645.21);
    assert.ok((result.currentMonthlyPayment ?? 0) > (result.newMonthlyPayment ?? 0));
    assert.equal(
      cents(result.interestSavings),
      cents(
        (result.currentMonthlyPayment ?? 0) * 300 -
          250000 -
          ((result.newMonthlyPayment ?? 0) * 300 - 200000),
      ),
    );
  });

  it("saves no interest at a 0% rate because a recast only changes the payment size", () => {
    const result = computeMortgageRecast({
      remainingBalance: 120000,
      annualRatePercent: 0,
      remainingYears: 10,
      remainingExtraMonths: 0,
      lumpSum: 20000,
    });

    assert.equal(result.valid, true);
    assert.equal(result.currentMonthlyPayment, 1000);
    assert.equal(result.newMonthlyPayment, 100000 / 120);
    assert.equal(result.paymentDrop, 1000 - 100000 / 120);
    assert.equal(result.interestSavings, 0);
    assert.equal(result.remainingMonths, 120);
  });

  it("treats a lump sum equal to the balance as a payoff", () => {
    const result = computeMortgageRecast({
      remainingBalance: 80000,
      annualRatePercent: 5,
      remainingYears: 10,
      remainingExtraMonths: 0,
      lumpSum: 80000,
    });

    assert.equal(result.valid, true);
    assert.equal(result.paidOff, true);
    assert.equal(result.newBalance, 0);
    assert.equal(result.newMonthlyPayment, 0);
    assert.equal(result.paymentDrop, result.currentMonthlyPayment);
    assert.equal(result.interestWithRecast, 0);
    assert.equal(result.interestSavings, result.interestWithoutRecast);
  });

  it("rejects a lump sum larger than the remaining balance", () => {
    assert.equal(
      computeMortgageRecast({
        remainingBalance: 100000,
        annualRatePercent: 4,
        remainingYears: 15,
        remainingExtraMonths: 0,
        lumpSum: 100000.01,
      }).valid,
      false,
    );
  });

  it("rejects missing balance, negative rate, or an empty remaining term", () => {
    assert.equal(
      computeMortgageRecast({
        remainingBalance: 0,
        annualRatePercent: 4,
        remainingYears: 20,
        remainingExtraMonths: 0,
        lumpSum: 1000,
      }).valid,
      false,
    );
    assert.equal(
      computeMortgageRecast({
        remainingBalance: 100000,
        annualRatePercent: -1,
        remainingYears: 20,
        remainingExtraMonths: 0,
        lumpSum: 1000,
      }).valid,
      false,
    );
    assert.equal(
      computeMortgageRecast({
        remainingBalance: 100000,
        annualRatePercent: 4,
        remainingYears: 0,
        remainingExtraMonths: 0,
        lumpSum: 1000,
      }).valid,
      false,
    );
  });

  it("allows a zero lump sum so the current payment is visible before recasting", () => {
    const result = computeMortgageRecast({
      remainingBalance: 180000,
      annualRatePercent: 4.5,
      remainingYears: 20,
      remainingExtraMonths: 0,
      lumpSum: 0,
    });

    assert.equal(result.valid, true);
    assert.equal(result.newBalance, 180000);
    assert.equal(result.newMonthlyPayment, result.currentMonthlyPayment);
    assert.equal(result.paymentDrop, 0);
    assert.equal(result.interestSavings, 0);
  });
});

describe("FAQPage JSON-LD shape for mortgage recast calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a mortgage recast calculator work?",
        answer:
          "It re-amortizes the remaining balance minus a lump-sum principal payment over the same remaining term.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
