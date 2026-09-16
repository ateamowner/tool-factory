import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  computeStraightLineDepreciation,
  formatUsd,
  yearFractionFromPlacedInService,
} from "./straight-line-depreciation.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

function input(
  overrides: Partial<Parameters<typeof computeStraightLineDepreciation>[0]> = {},
) {
  return computeStraightLineDepreciation({
    cost: 25000,
    salvage: 2500,
    usefulLifeYears: 5,
    firstYearFraction: 1,
    ...overrides,
  });
}

describe("formatUsd", () => {
  it("formats USD with two decimals", () => {
    assert.equal(formatUsd(25000), "$25,000.00");
    assert.equal(formatUsd(4500), "$4,500.00");
  });
});

describe("yearFractionFromPlacedInService", () => {
  it("treats January 1 as a full remaining year", () => {
    assert.equal(yearFractionFromPlacedInService("2023-01-01"), 1);
  });

  it("counts remaining days including the placed-in-service date", () => {
    assert.equal(yearFractionFromPlacedInService("2023-12-31"), 1 / 365);
    assert.equal(cents(yearFractionFromPlacedInService("2024-07-01")! * 100), cents((184 / 366) * 100));
  });

  it("rejects invalid calendar dates and junk strings", () => {
    assert.equal(yearFractionFromPlacedInService("2023-02-30"), null);
    assert.equal(yearFractionFromPlacedInService("July 1, 2024"), null);
    assert.equal(yearFractionFromPlacedInService(""), null);
    assert.equal(yearFractionFromPlacedInService("2024-13-01"), null);
  });
});

describe("computeStraightLineDepreciation", () => {
  it("uses (cost − salvage) ÷ life for annual expense and a five-year book schedule", () => {
    const result = input();

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.depreciableBasis, 22500);
    assert.equal(result.annualDepreciation, 4500);
    assert.equal(result.monthlyDepreciation, 375);
    assert.equal(result.schedule.length, 5);
    assert.equal(result.schedule[0]?.beginningBookValue, 25000);
    assert.equal(result.schedule[0]?.depreciation, 4500);
    assert.equal(result.schedule[0]?.endingBookValue, 20500);
    assert.equal(result.schedule[4]?.beginningBookValue, 7000);
    assert.equal(result.schedule[4]?.depreciation, 4500);
    assert.equal(result.schedule[4]?.endingBookValue, 2500);
    assert.equal(cents(result.totalDepreciation), 22500);
  });

  it("puts leftover basis in a stub year when the first year is a half year", () => {
    const result = input({ firstYearFraction: 0.5 });

    assert.equal(result.valid, true);
    assert.equal(result.schedule.length, 6);
    assert.equal(result.schedule[0]?.depreciation, 2250);
    assert.equal(result.schedule[0]?.endingBookValue, 22750);
    assert.equal(result.schedule[0]?.yearFraction, 0.5);
    assert.equal(result.schedule[1]?.depreciation, 4500);
    assert.equal(result.schedule[5]?.depreciation, 2250);
    assert.equal(result.schedule[5]?.endingBookValue, 2500);
    assert.equal(cents(result.totalDepreciation), 22500);
  });

  it("supports a fractional useful life without a partial first-year convention", () => {
    const result = input({
      cost: 10000,
      salvage: 0,
      usefulLifeYears: 2.5,
      firstYearFraction: 1,
    });

    assert.equal(result.valid, true);
    assert.equal(result.annualDepreciation, 4000);
    assert.equal(result.schedule.length, 3);
    assert.equal(result.schedule[0]?.depreciation, 4000);
    assert.equal(result.schedule[1]?.depreciation, 4000);
    assert.equal(result.schedule[2]?.depreciation, 2000);
    assert.equal(result.schedule[2]?.yearFraction, 0.5);
    assert.equal(result.schedule[2]?.endingBookValue, 0);
  });

  it("keeps book value at cost when salvage equals cost", () => {
    const result = input({ cost: 8000, salvage: 8000, usefulLifeYears: 4 });

    assert.equal(result.valid, true);
    assert.equal(result.depreciableBasis, 0);
    assert.equal(result.annualDepreciation, 0);
    assert.equal(result.monthlyDepreciation, 0);
    assert.equal(result.schedule.length, 4);
    assert.ok(result.schedule.every((row) => row.depreciation === 0));
    assert.ok(result.schedule.every((row) => row.endingBookValue === 8000));
  });

  it("lands exactly on salvage after a date-derived first-year fraction", () => {
    const fraction = yearFractionFromPlacedInService("2024-07-01");
    assert.ok(fraction !== null);
    const result = input({ firstYearFraction: fraction });

    assert.equal(result.valid, true);
    assert.equal(cents(result.schedule[0]?.depreciation ?? null), cents(4500 * fraction));
    const last = result.schedule[result.schedule.length - 1];
    assert.equal(cents(last?.endingBookValue ?? null), 2500);
    assert.equal(cents(result.totalDepreciation), 22500);
  });

  it("rejects salvage above cost, empty life, and a first-year fraction outside (0, 1]", () => {
    assert.equal(input({ salvage: 30000 }).valid, false);
    assert.equal(input({ salvage: 30000 }).status, "salvage_exceeds_cost");
    assert.match(input({ salvage: 30000 }).error ?? "", /cannot be greater than asset cost/);

    assert.equal(input({ cost: -1 }).valid, false);
    assert.equal(input({ salvage: -1 }).valid, false);
    assert.equal(input({ usefulLifeYears: 0 }).valid, false);
    assert.equal(input({ usefulLifeYears: -5 }).valid, false);
    assert.equal(input({ cost: Number.NaN }).valid, false);
    assert.equal(input({ usefulLifeYears: Number.POSITIVE_INFINITY }).valid, false);

    assert.equal(input({ firstYearFraction: 0 }).status, "invalid_fraction");
    assert.equal(input({ firstYearFraction: 1.2 }).status, "invalid_fraction");
    assert.equal(input({ usefulLifeYears: 101 }).status, "life_too_long");
  });

  it("does not throw on nonsense inputs", () => {
    assert.equal(input({ cost: Number.NaN, salvage: Number.NaN, usefulLifeYears: Number.NaN }).valid, false);
    assert.equal(input({ firstYearFraction: Number.NaN }).valid, false);
  });
});

describe("FAQPage JSON-LD shape for straight line depreciation calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a straight line depreciation calculator work?",
        answer:
          "It divides cost minus salvage by useful life to get annual expense, then walks book value down year by year.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
