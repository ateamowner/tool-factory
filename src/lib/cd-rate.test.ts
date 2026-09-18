import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  apyFromNominal,
  computeCdRate,
  endingFromApy,
  formatCdSummary,
  formatPercent,
  formatUsd,
  nominalFromApy,
  yearsFromTerm,
  type CdRateInput,
} from "./cd-rate.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

function input(overrides: Partial<CdRateInput> = {}) {
  return computeCdRate({
    deposit: 10_000,
    ratePercent: 5,
    mode: "apy",
    term: 1,
    termUnit: "years",
    compounding: "monthly",
    ...overrides,
  });
}

describe("yearsFromTerm", () => {
  it("converts months to years and leaves years unchanged", () => {
    assert.equal(yearsFromTerm(18, "months"), 1.5);
    assert.equal(yearsFromTerm(12, "months"), 1);
    assert.equal(yearsFromTerm(2, "years"), 2);
  });
});

describe("APY and nominal identities", () => {
  it("treats annual compounding as APY equal to the nominal rate", () => {
    assert.equal(apyFromNominal(0.05, "annual"), 0.05);
    assert.equal(nominalFromApy(0.05, "annual"), 0.05);
    assert.equal(endingFromApy(10_000, 0.05, 1), 10_500);
  });

  it("compounds a 5% nominal monthly rate to about 5.12% APY", () => {
    assert.equal(cents(apyFromNominal(0.05, "monthly") * 100), 5.12);
    assert.equal(cents(10_000 * (1 + 0.05 / 12) ** 12), 10_511.62);
  });

  it("round-trips APY to a nominal rate and back", () => {
    const apy = 0.045;
    const nominal = nominalFromApy(apy, "monthly");
    assert.equal(cents(apyFromNominal(nominal, "monthly") * 100), 4.5);
  });
});

describe("formatUsd and formatPercent", () => {
  it("formats USD with two decimals", () => {
    assert.equal(formatUsd(10_000), "$10,000.00");
    assert.equal(formatUsd(10_511.618), "$10,511.62");
  });

  it("keeps whole percents without trailing zeros", () => {
    assert.equal(formatPercent(5), "5%");
    assert.equal(formatPercent(5.116189), "5.12%");
  });
});

describe("computeCdRate", () => {
  it("grows a deposit by APY regardless of compounding frequency", () => {
    const monthly = input();
    const daily = input({ compounding: "daily" });

    assert.equal(monthly.valid, true);
    assert.equal(monthly.status, "ok");
    assert.equal(monthly.endingBalance, 10_500);
    assert.equal(monthly.interestEarned, 500);
    assert.equal(monthly.apyPercent, 5);
    assert.equal(monthly.effectiveYieldPercent, 5);
    assert.equal(cents(monthly.nominalPercent), 4.89);
    assert.equal(daily.endingBalance, 10_500);
    assert.equal(daily.interestEarned, 500);
  });

  it("compounds a nominal interest rate by the selected frequency", () => {
    const monthly = input({ mode: "nominal", ratePercent: 5, compounding: "monthly" });
    const annual = input({ mode: "nominal", ratePercent: 5, compounding: "annual" });
    const daily = input({ mode: "nominal", ratePercent: 5, compounding: "daily" });
    const continuous = input({ mode: "nominal", ratePercent: 5, compounding: "continuous" });

    assert.equal(monthly.valid, true);
    assert.equal(cents(monthly.endingBalance), 10_511.62);
    assert.equal(cents(monthly.interestEarned), 511.62);
    assert.equal(cents(monthly.apyPercent), 5.12);
    assert.equal(monthly.nominalPercent, 5);
    assert.equal(annual.endingBalance, 10_500);
    assert.equal(annual.apyPercent, 5);
    assert.equal(cents(daily.endingBalance), 10_512.67);
    assert.equal(cents(continuous.endingBalance), cents(10_000 * Math.exp(0.05)));
  });

  it("accepts an 18-month term and builds a full year plus a stub", () => {
    const result = input({ term: 18, termUnit: "months", ratePercent: 4.5 });

    assert.equal(result.valid, true);
    assert.equal(result.years, 1.5);
    assert.equal(cents(result.endingBalance), cents(10_000 * 1.045 ** 1.5));
    assert.equal(result.schedule.length, 2);
    assert.equal(result.schedule[0]?.yearFraction, 1);
    assert.equal(result.schedule[1]?.year, 2);
    assert.equal(cents(result.schedule[1]?.yearFraction ?? null), 0.5);
    assert.equal(cents(result.schedule[1]?.endingBalance ?? null), cents(result.endingBalance));
  });

  it("treats a 12-month term as one year", () => {
    const byYear = input({ term: 1, termUnit: "years" });
    const byMonth = input({ term: 12, termUnit: "months" });

    assert.equal(byMonth.valid, true);
    assert.equal(byMonth.years, 1);
    assert.equal(byMonth.endingBalance, byYear.endingBalance);
    assert.equal(byMonth.schedule.length, 1);
  });

  it("allows a 0% CD and returns the deposit unchanged", () => {
    const result = input({ ratePercent: 0 });

    assert.equal(result.valid, true);
    assert.equal(result.endingBalance, 10_000);
    assert.equal(result.interestEarned, 0);
    assert.equal(result.apyPercent, 0);
    assert.equal(result.nominalPercent, 0);
    assert.equal(result.schedule[0]?.interest, 0);
  });

  it("writes a year-by-year schedule that sums to interest earned", () => {
    const result = input({ term: 3, termUnit: "years", ratePercent: 4 });

    assert.equal(result.valid, true);
    assert.equal(result.schedule.length, 3);
    const scheduledInterest = result.schedule.reduce((sum, row) => sum + row.interest, 0);
    assert.equal(cents(scheduledInterest), cents(result.interestEarned));
    assert.equal(result.schedule[0]?.beginningBalance, 10_000);
    assert.equal(cents(result.schedule[2]?.endingBalance ?? null), cents(result.endingBalance));
  });

  it("rejects empty, negative, or nonsense inputs without throwing", () => {
    assert.equal(input({ deposit: 0 }).valid, false);
    assert.equal(input({ deposit: -1 }).valid, false);
    assert.equal(input({ deposit: Number.NaN }).valid, false);
    assert.equal(input({ ratePercent: -1 }).valid, false);
    assert.equal(input({ ratePercent: 120 }).valid, false);
    assert.equal(input({ ratePercent: Number.POSITIVE_INFINITY }).valid, false);
    assert.equal(input({ term: 0 }).valid, false);
    assert.equal(input({ term: -2 }).valid, false);
    assert.equal(input({ term: 51, termUnit: "years" }).valid, false);
    assert.equal(input({ term: 601, termUnit: "months" }).valid, false);
    assert.equal(input({ mode: "not-a-mode" as CdRateInput["mode"] }).valid, false);
    assert.equal(input({ compounding: "weekly" as CdRateInput["compounding"] }).valid, false);
    assert.match(input({ deposit: 0 }).error ?? "", /greater than 0/);
  });
});

describe("formatCdSummary", () => {
  it("builds the ending-balance sentence", () => {
    assert.equal(
      formatCdSummary({
        deposit: 10_000,
        endingBalance: 10_500,
        interestEarned: 500,
        apyPercent: 5,
        years: 1,
        term: 1,
        termUnit: "years",
        compounding: "monthly",
      }),
      "$10,000.00 at 5% APY for 1 year (monthly compounding) grows to $10,500.00 — $500.00 interest earned.",
    );
  });
});

describe("FAQPage JSON-LD shape for CD rate calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a CD rate calculator work?",
        answer:
          "It compounds a deposit by APY or a nominal interest rate over the CD term so you can see ending balance and interest earned.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
