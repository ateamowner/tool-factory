import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  compoundPriceMultiplier,
  computePurchasingPower,
  formatPurchasingPowerSummary,
  formatUsd,
} from "./purchasing-power.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

function rateInput(overrides: Partial<Parameters<typeof computePurchasingPower>[0]> = {}) {
  return computePurchasingPower({
    amount: 100,
    mode: "rate",
    startYear: 2000,
    endYear: 2024,
    years: 24,
    useYearsSpan: false,
    inflationPercent: 3,
    startCpi: 172.2,
    endCpi: 314.4,
    ...overrides,
  });
}

describe("compoundPriceMultiplier", () => {
  it("compounds an average annual inflation rate", () => {
    assert.equal(compoundPriceMultiplier(0, 24), 1);
    assert.equal(cents(compoundPriceMultiplier(3, 24) * 100), 203.28);
    assert.equal(compoundPriceMultiplier(3, 0), 1);
  });
});

describe("formatUsd", () => {
  it("formats USD with two decimals", () => {
    assert.equal(formatUsd(100), "$100.00");
    assert.equal(formatUsd(203.2794109), "$203.28");
  });
});

describe("computePurchasingPower", () => {
  it("converts past dollars to later-year buying power at 3% inflation", () => {
    const result = rateInput();

    assert.equal(result.valid, true);
    assert.equal(result.years, 24);
    assert.equal(result.startYear, 2000);
    assert.equal(result.endYear, 2024);
    assert.equal(result.lookingForward, true);
    assert.equal(result.lookingBackward, false);
    assert.equal(cents(result.equivalentAmount), 203.28);
    assert.equal(cents(result.sameNominalBuys), 49.19);
    assert.equal(cents(result.percentChangePrices), 103.28);
    assert.equal(cents(result.percentChangePurchasingPower), -50.81);
    assert.equal(
      result.summary,
      "$100.00 in 2000 buys about $203.28 of goods in 2024 at 3% average annual inflation.",
    );
  });

  it("matches end-year mode when the same span is entered as years", () => {
    const byEndYear = rateInput({ useYearsSpan: false, endYear: 2024 });
    const byYears = rateInput({ useYearsSpan: true, years: 24, endYear: 1999 });

    assert.equal(byYears.valid, true);
    assert.equal(byYears.endYear, 2024);
    assert.equal(cents(byYears.equivalentAmount), cents(byEndYear.equivalentAmount));
    assert.equal(cents(byYears.percentChangePurchasingPower), cents(byEndYear.percentChangePurchasingPower));
  });

  it("works backward so today's dollars equal earlier-year buying power", () => {
    const result = rateInput({ startYear: 2024, endYear: 2000 });

    assert.equal(result.valid, true);
    assert.equal(result.years, -24);
    assert.equal(result.lookingBackward, true);
    assert.equal(result.lookingForward, false);
    assert.equal(cents(result.equivalentAmount), 49.19);
    assert.equal(cents(result.sameNominalBuys), 203.28);
    assert.equal(
      result.summary,
      "$100.00 in 2024 buys about $49.19 of goods in 2000 at 3% average annual inflation.",
    );
  });

  it("uses CPI indexes instead of an inflation rate", () => {
    const result = rateInput({
      mode: "cpi",
      inflationPercent: 99,
      startCpi: 100,
      endCpi: 200,
    });

    assert.equal(result.valid, true);
    assert.equal(result.equivalentAmount, 200);
    assert.equal(result.sameNominalBuys, 50);
    assert.equal(result.percentChangePrices, 100);
    assert.equal(result.percentChangePurchasingPower, -50);
    assert.equal(result.inflationPercent, null);
    assert.equal(
      result.summary,
      "$100.00 in 2000 buys about $200.00 of goods in 2024 based on the CPI change from 100 to 200.",
    );
  });

  it("scales a CPI pair the way a buying-power example would", () => {
    const result = rateInput({
      mode: "cpi",
      startCpi: 172.2,
      endCpi: 314.4,
    });

    assert.equal(result.valid, true);
    assert.equal(cents(result.equivalentAmount), 182.58);
    assert.ok((result.percentChangePurchasingPower ?? 0) < 0);
  });

  it("treats the same start and end year as unchanged prices", () => {
    const result = rateInput({ endYear: 2000, inflationPercent: 3 });

    assert.equal(result.valid, true);
    assert.equal(result.samePeriod, true);
    assert.equal(result.years, 0);
    assert.equal(result.equivalentAmount, 100);
    assert.equal(result.percentChangePurchasingPower, 0);
    assert.equal(result.percentChangePrices, 0);
    assert.equal(
      result.summary,
      "$100.00 in 2000 buys about $100.00 of goods in 2000 (same year, no inflation applied).",
    );
  });

  it("handles deflation as a gain in purchasing power", () => {
    const result = rateInput({
      startYear: 2010,
      endYear: 2020,
      inflationPercent: -2,
    });

    assert.equal(result.valid, true);
    assert.equal(cents(result.equivalentAmount), 81.71);
    assert.ok((result.percentChangePurchasingPower ?? 0) > 0);
    assert.ok((result.percentChangePrices ?? 0) < 0);
  });

  it("rejects empty, negative, or nonsense inputs without throwing", () => {
    assert.equal(rateInput({ amount: 0 }).valid, false);
    assert.equal(rateInput({ amount: -10 }).valid, false);
    assert.equal(rateInput({ amount: Number.NaN }).valid, false);
    assert.equal(rateInput({ startYear: 1700 }).valid, false);
    assert.equal(rateInput({ endYear: 3000 }).valid, false);
    assert.equal(rateInput({ inflationPercent: -100 }).valid, false);
    assert.equal(rateInput({ inflationPercent: 120 }).valid, false);
    assert.equal(rateInput({ inflationPercent: Number.NaN }).valid, false);
    assert.equal(rateInput({ useYearsSpan: true, years: 250 }).valid, false);
    assert.equal(rateInput({ mode: "cpi", startCpi: 0, endCpi: 200 }).valid, false);
    assert.equal(rateInput({ mode: "cpi", startCpi: 100, endCpi: -1 }).valid, false);
    assert.equal(rateInput({ startYear: Number.POSITIVE_INFINITY }).valid, false);
  });
});

describe("formatPurchasingPowerSummary", () => {
  it("builds the later-year buying-power sentence", () => {
    assert.equal(
      formatPurchasingPowerSummary({
        amount: 100,
        equivalentAmount: 203.2794109,
        startYear: 2000,
        endYear: 2024,
        years: 24,
        mode: "rate",
        inflationPercent: 3,
        startCpi: null,
        endCpi: null,
      }),
      "$100.00 in 2000 buys about $203.28 of goods in 2024 at 3% average annual inflation.",
    );
  });
});

describe("FAQPage JSON-LD shape for purchasing power calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a purchasing power calculator work?",
        answer:
          "It grows or shrinks a dollar amount by an average inflation rate or a CPI change so you can see equivalent buying power in another year.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
