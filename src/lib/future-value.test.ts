import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  annuityFutureValue,
  computeFutureValue,
  contributionPeriodRate,
  formatFutureValueSummary,
  formatPercent,
  formatUsd,
  futureValueAt,
  lumpSumFactor,
  type FutureValueInput,
} from "./future-value.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

function input(overrides: Partial<FutureValueInput> = {}) {
  return computeFutureValue({
    presentValue: 10_000,
    contribution: 0,
    contributionFrequency: "monthly",
    contributionTiming: "end",
    ratePercent: 5,
    compounding: "annual",
    years: 1,
    ...overrides,
  });
}

describe("lump sum and annuity identities", () => {
  it("grows a lump sum by (1 + r)^t with annual compounding", () => {
    assert.equal(lumpSumFactor(0.05, 1, 1), 1.05);
    assert.equal(cents(10_000 * lumpSumFactor(0.05, 1, 10)), cents(10_000 * 1.05 ** 10));
    assert.equal(cents(futureValueAt(1_000, 0, 0.05, 1, 1, 10, "end")), 1_628.89);
  });

  it("compounds a 5% nominal monthly rate to about $10,511.62 after one year", () => {
    assert.equal(cents(futureValueAt(10_000, 0, 0.05, 12, 12, 1, "end")), 10_511.62);
  });

  it("matches the ordinary-annuity formula for monthly deposits", () => {
    const i = 0.06 / 12;
    const expected = 100 * ((1.005 ** 12 - 1) / 0.005);
    assert.equal(cents(annuityFutureValue(100, i, 12, "end")), cents(expected));
    assert.equal(cents(futureValueAt(0, 100, 0.06, 12, 12, 1, "end")), 1_233.56);
  });

  it("applies one extra period of interest for beginning-of-period deposits", () => {
    const ordinary = annuityFutureValue(100, 0.06 / 12, 12, "end");
    const due = annuityFutureValue(100, 0.06 / 12, 12, "beginning");
    assert.equal(cents(due), cents(ordinary * (1 + 0.06 / 12)));
    assert.equal(cents(futureValueAt(0, 100, 0.06, 12, 12, 1, "beginning")), 1_239.72);
  });

  it("converts a daily rate into an effective monthly contribution rate", () => {
    const i = contributionPeriodRate(0.06, 365, 12);
    const expected = (1 + 0.06 / 365) ** (365 / 12) - 1;
    assert.equal(cents(i * 100), cents(expected * 100));
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

describe("computeFutureValue", () => {
  it("grows an initial investment with annual compounding and no contributions", () => {
    const result = input();

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.futureValue, 10_500);
    assert.equal(result.interestEarned, 500);
    assert.equal(result.totalContributions, 10_000);
    assert.equal(result.effectiveYieldPercent, 5);
  });

  it("compounds more frequently on the same nominal annual rate", () => {
    const annual = input({ compounding: "annual" });
    const monthly = input({ compounding: "monthly" });
    const daily = input({ compounding: "daily" });

    assert.equal(annual.futureValue, 10_500);
    assert.equal(cents(monthly.futureValue), 10_511.62);
    assert.equal(cents(daily.futureValue), 10_512.67);
  });

  it("adds optional monthly contributions on top of the initial investment", () => {
    const result = input({
      presentValue: 10_000,
      contribution: 200,
      contributionFrequency: "monthly",
      contributionTiming: "end",
      ratePercent: 7,
      compounding: "monthly",
      years: 10,
    });

    const r = 0.07 / 12;
    const expected = 10_000 * (1 + r) ** 120 + 200 * (((1 + r) ** 120 - 1) / r);

    assert.equal(result.valid, true);
    assert.equal(cents(result.futureValue), cents(expected));
    assert.equal(result.contributionCount, 120);
    assert.equal(result.totalContributions, 10_000 + 200 * 120);
    assert.equal(
      cents(result.interestEarned),
      cents((result.futureValue ?? 0) - (result.totalContributions ?? 0)),
    );
  });

  it("allows a 0% rate and returns principal plus deposits", () => {
    const result = input({
      presentValue: 1_000,
      contribution: 50,
      contributionFrequency: "monthly",
      ratePercent: 0,
      years: 2,
    });

    assert.equal(result.valid, true);
    assert.equal(result.futureValue, 1_000 + 50 * 24);
    assert.equal(result.interestEarned, 0);
  });

  it("allows a $0 initial investment when contributions are greater than 0", () => {
    const result = input({
      presentValue: 0,
      contribution: 100,
      contributionFrequency: "monthly",
      compounding: "monthly",
      ratePercent: 6,
      years: 1,
    });

    assert.equal(result.valid, true);
    assert.equal(cents(result.futureValue), 1_233.56);
    assert.equal(result.totalContributions, 1_200);
  });

  it("accepts a half year and builds a full year plus a stub", () => {
    const result = input({
      years: 1.5,
      ratePercent: 4.5,
      compounding: "annual",
    });

    assert.equal(result.valid, true);
    assert.equal(result.years, 1.5);
    assert.equal(cents(result.futureValue), cents(10_000 * 1.045 ** 1.5));
    assert.equal(result.schedule.length, 2);
    assert.equal(result.schedule[0]?.yearFraction, 1);
    assert.equal(result.schedule[1]?.year, 2);
    assert.equal(cents(result.schedule[1]?.yearFraction ?? null), 0.5);
    assert.equal(cents(result.schedule[1]?.endingBalance ?? null), cents(result.futureValue));
  });

  it("writes a year-by-year schedule that sums to interest earned", () => {
    const result = input({
      presentValue: 5_000,
      contribution: 100,
      contributionFrequency: "monthly",
      compounding: "monthly",
      ratePercent: 4,
      years: 3,
    });

    assert.equal(result.valid, true);
    assert.equal(result.schedule.length, 3);
    const scheduledInterest = result.schedule.reduce((sum, row) => sum + row.interest, 0);
    const scheduledContributions = result.schedule.reduce((sum, row) => sum + row.contributions, 0);
    assert.equal(cents(scheduledInterest), cents(result.interestEarned));
    assert.equal(cents(scheduledContributions), 100 * 36);
    assert.equal(result.schedule[0]?.beginningBalance, 5_000);
    assert.equal(cents(result.schedule[2]?.endingBalance ?? null), cents(result.futureValue));
  });

  it("rejects empty, negative, or nonsense inputs without throwing", () => {
    assert.equal(input({ presentValue: -1 }).valid, false);
    assert.equal(input({ presentValue: Number.NaN }).valid, false);
    assert.equal(input({ presentValue: 0, contribution: 0 }).valid, false);
    assert.equal(input({ contribution: -5 }).valid, false);
    assert.equal(input({ ratePercent: -1 }).valid, false);
    assert.equal(input({ ratePercent: 120 }).valid, false);
    assert.equal(input({ ratePercent: Number.POSITIVE_INFINITY }).valid, false);
    assert.equal(input({ years: 0 }).valid, false);
    assert.equal(input({ years: -2 }).valid, false);
    assert.equal(input({ years: 81 }).valid, false);
    assert.equal(input({ compounding: "weekly" as FutureValueInput["compounding"] }).valid, false);
    assert.equal(
      input({
        contributionFrequency: "weekly" as FutureValueInput["contributionFrequency"],
      }).valid,
      false,
    );
    assert.match(input({ presentValue: 0, contribution: 0 }).error ?? "", /greater than 0/);
  });
});

describe("formatFutureValueSummary", () => {
  it("builds the ending-balance sentence without contributions", () => {
    assert.equal(
      formatFutureValueSummary({
        presentValue: 10_000,
        contribution: 0,
        contributionFrequency: "monthly",
        contributionTiming: "end",
        ratePercent: 5,
        compounding: "annual",
        years: 1,
        futureValue: 10_500,
        interestEarned: 500,
      }),
      "$10,000.00 at 5% for 1 year (annual compounding) grows to $10,500.00 — $500.00 interest earned.",
    );
  });

  it("mentions periodic contributions when they are present", () => {
    assert.equal(
      formatFutureValueSummary({
        presentValue: 10_000,
        contribution: 200,
        contributionFrequency: "monthly",
        contributionTiming: "end",
        ratePercent: 7,
        compounding: "monthly",
        years: 10,
        futureValue: 54_713.77,
        interestEarned: 20_713.77,
      }),
      "$10,000.00 at 7% for 10 years (monthly compounding) plus $200.00 monthly (end-of-period) grows to $54,713.77 — $20,713.77 interest earned.",
    );
  });
});

describe("FAQPage JSON-LD shape for future value calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a future value calculator work?",
        answer:
          "It compounds an initial investment and optional periodic contributions at a stated annual rate so you can see future value and interest earned.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
