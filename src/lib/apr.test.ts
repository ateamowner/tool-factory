import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  amortizingMonthlyPayment,
  annuityPresentValue,
  computeApr,
  formatAprSummary,
  formatPercent,
  formatUsd,
  parseAprNumber,
  solveMonthlyRate,
  termMonthsFromParts,
  type AprInput,
} from "./apr.ts";

function input(overrides: Partial<AprInput> = {}): AprInput {
  return {
    loanAmount: 20_000,
    nominalRatePercent: 6,
    termYears: 5,
    termExtraMonths: 0,
    fees: 0,
    ...overrides,
  };
}

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

function approx(actual: number | null, expected: number, tol = 0.02): void {
  assert.ok(actual !== null, "expected a number");
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${expected} ± ${tol}, got ${actual}`,
  );
}

describe("parseAprNumber", () => {
  it("strips commas and rejects empty", () => {
    assert.equal(parseAprNumber("20,000.50"), 20000.5);
    assert.ok(Number.isNaN(parseAprNumber("")));
    assert.ok(Number.isNaN(parseAprNumber("   ")));
  });
});

describe("formatUsd / formatPercent", () => {
  it("formats money and percents", () => {
    assert.equal(formatUsd(386.66), "$386.66");
    assert.equal(formatUsd(20000), "$20,000.00");
    assert.equal(formatPercent(6.543, 3), "6.543%");
    assert.equal(formatPercent(6, 2), "6.00%");
  });
});

describe("termMonthsFromParts", () => {
  it("combines years and months", () => {
    assert.equal(termMonthsFromParts(5, 0), 60);
    assert.equal(termMonthsFromParts(0, 36), 36);
    assert.equal(termMonthsFromParts(3, 6), 42);
    assert.equal(termMonthsFromParts(0, 0), null);
    assert.equal(termMonthsFromParts(-1, 0), null);
  });
});

describe("amortizingMonthlyPayment", () => {
  it("matches a known 6% / 60-month payment", () => {
    const payment = amortizingMonthlyPayment(20_000, 6, 60);
    approx(payment, 386.66, 0.02);
  });

  it("handles zero interest", () => {
    const payment = amortizingMonthlyPayment(12_000, 0, 12);
    assert.equal(cents(payment), 1000);
  });
});

describe("solveMonthlyRate / annuityPresentValue", () => {
  it("recovers the nominal monthly rate when fees are zero", () => {
    const payment = amortizingMonthlyPayment(20_000, 6, 60)!;
    const monthly = solveMonthlyRate(20_000, payment, 60);
    assert.ok(monthly !== null);
    approx(monthly! * 12 * 100, 6, 0.01);
  });

  it("annuity PV at the solved rate equals present value", () => {
    const payment = 400;
    const pv = 10_000;
    const months = 30;
    const r = solveMonthlyRate(pv, payment, months)!;
    approx(annuityPresentValue(payment, r, months), pv, 0.01);
  });
});

describe("computeApr", () => {
  it("equals the nominal rate when fees are zero", () => {
    const result = computeApr(input());
    assert.equal(result.valid, true);
    assert.equal(result.termMonths, 60);
    approx(result.monthlyPayment, 386.66, 0.02);
    approx(result.aprPercent, 6, 0.02);
    assert.equal(cents(result.fees), 0);
    assert.equal(cents(result.netProceeds), 20_000);
    assert.ok((result.totalPayments ?? 0) > 20_000);
    assert.ok((result.totalInterest ?? 0) > 0);
    assert.match(result.summary ?? "", /APR/i);
  });

  it("raises APR above the nominal rate when fees reduce net proceeds", () => {
    const result = computeApr(input({ fees: 500 }));
    assert.equal(result.valid, true);
    assert.equal(cents(result.netProceeds), 19_500);
    assert.ok((result.aprPercent ?? 0) > 6);
    // Rough band: modest fee on a 5-year loan should land a bit over 6%
    assert.ok((result.aprPercent ?? 0) < 8);
    assert.equal(cents(result.totalCost), cents((result.totalPayments ?? 0) + 500));
  });

  it("supports months-only term via extra months", () => {
    const result = computeApr(
      input({
        loanAmount: 10_000,
        nominalRatePercent: 9,
        termYears: 0,
        termExtraMonths: 36,
        fees: 200,
      }),
    );
    assert.equal(result.valid, true);
    assert.equal(result.termMonths, 36);
    assert.ok((result.aprPercent ?? 0) > 9);
  });

  it("handles zero nominal rate with fees", () => {
    const result = computeApr(
      input({
        loanAmount: 12_000,
        nominalRatePercent: 0,
        termYears: 1,
        termExtraMonths: 0,
        fees: 240,
      }),
    );
    assert.equal(result.valid, true);
    assert.equal(cents(result.monthlyPayment), 1000);
    assert.ok((result.aprPercent ?? 0) > 0);
  });

  it("rejects invalid amount, rate, term, and fees", () => {
    assert.equal(computeApr(input({ loanAmount: 0 })).valid, false);
    assert.equal(computeApr(input({ loanAmount: -1 })).valid, false);
    assert.equal(computeApr(input({ nominalRatePercent: -1 })).valid, false);
    assert.equal(computeApr(input({ nominalRatePercent: 101 })).valid, false);
    assert.equal(
      computeApr(input({ termYears: 0, termExtraMonths: 0 })).valid,
      false,
    );
    assert.equal(computeApr(input({ fees: -10 })).valid, false);
    assert.equal(computeApr(input({ fees: 20_000 })).valid, false);
    assert.equal(computeApr(input({ fees: 20_001 })).valid, false);
  });
});

describe("formatAprSummary", () => {
  it("mentions fees and APR", () => {
    const text = formatAprSummary({
      loanAmount: 20_000,
      fees: 500,
      netProceeds: 19_500,
      monthlyPayment: 386.66,
      termMonths: 60,
      nominalRatePercent: 6,
      aprPercent: 6.55,
    });
    assert.match(text, /\$20,000\.00/);
    assert.match(text, /\$500\.00/);
    assert.match(text, /6\.550%/);
  });
});

describe("apr FAQ schema", () => {
  it("builds FAQPage JSON-LD with several questions", () => {
    const faqs = [
      {
        question: "What is APR?",
        answer: "Annual percentage rate reflecting interest and certain fees.",
      },
      {
        question: "How is APR different from the interest rate?",
        answer: "APR annualizes the cost including upfront fees.",
      },
      {
        question: "Is this legal advice?",
        answer: "No. Results are educational estimates only.",
      },
    ];
    const ld = faqPageJsonLd(faqs);
    assert.equal(ld["@type"], "FAQPage");
    assert.equal(ld.mainEntity.length, 3);
    assert.equal(ld.mainEntity[0]?.["@type"], "Question");
  });
});
