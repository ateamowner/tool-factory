import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  computeRoi,
  finalValueFromGain,
  formatPercent,
  formatUsd,
  netProfitFromValues,
  roiPercentFromValues,
  type RoiInput,
} from "./roi.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

function input(overrides: Partial<RoiInput> = {}) {
  return computeRoi({
    mode: "cost_final",
    initialInvestment: 1000,
    finalValue: 1500,
    netProfit: 500,
    ...overrides,
  });
}

describe("formatUsd", () => {
  it("formats USD with two decimals", () => {
    assert.equal(formatUsd(1000), "$1,000.00");
    assert.equal(formatUsd(1500), "$1,500.00");
    assert.equal(formatUsd(1234.5), "$1,234.50");
  });
});

describe("formatPercent", () => {
  it("keeps whole percents without trailing zeros", () => {
    assert.equal(formatPercent(50), "50%");
    assert.equal(formatPercent(-100), "-100%");
  });

  it("shows two decimals for fractional percents", () => {
    assert.equal(formatPercent(33.333333), "33.33%");
  });
});

describe("ROI identities", () => {
  it("uses ((final − initial) / initial) × 100 for ROI %", () => {
    assert.equal(roiPercentFromValues(1000, 1500), 50);
    assert.equal(netProfitFromValues(1000, 1500), 500);
    assert.equal(finalValueFromGain(1000, 500), 1500);
  });

  it("treats a total loss as −100% ROI", () => {
    assert.equal(roiPercentFromValues(1000, 0), -100);
    assert.equal(netProfitFromValues(1000, 0), -1000);
  });
});

describe("computeRoi", () => {
  it("solves initial + final value for ROI % and net profit", () => {
    const result = input();

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.mode, "cost_final");
    assert.equal(result.initialInvestment, 1000);
    assert.equal(result.finalValue, 1500);
    assert.equal(result.netProfit, 500);
    assert.equal(result.roiPercent, 50);
  });

  it("solves initial + net profit for ROI % and final value", () => {
    const result = input({ mode: "cost_gain", netProfit: 500 });

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.finalValue, 1500);
    assert.equal(result.netProfit, 500);
    assert.equal(result.roiPercent, 50);
  });

  it("allows a break-even (0% ROI) and a total loss (−100%)", () => {
    const even = input({ finalValue: 1000 });
    assert.equal(even.valid, true);
    assert.equal(even.netProfit, 0);
    assert.equal(even.roiPercent, 0);

    const loss = input({ finalValue: 0 });
    assert.equal(loss.valid, true);
    assert.equal(loss.netProfit, -1000);
    assert.equal(loss.roiPercent, -100);
  });

  it("allows a negative net profit that still leaves final value >= 0", () => {
    const result = input({ mode: "cost_gain", netProfit: -250 });

    assert.equal(result.valid, true);
    assert.equal(result.finalValue, 750);
    assert.equal(result.netProfit, -250);
    assert.equal(result.roiPercent, -25);
  });

  it("rejects non-finite or negative initial investment and a zero cost", () => {
    assert.equal(input({ initialInvestment: -1 }).valid, false);
    assert.equal(input({ initialInvestment: -1 }).status, "invalid");
    assert.equal(input({ initialInvestment: 0 }).status, "cost_required");
    assert.match(input({ initialInvestment: 0 }).error ?? "", /greater than 0/);

    assert.equal(input({ initialInvestment: Number.NaN }).valid, false);
    assert.equal(input({ finalValue: Number.POSITIVE_INFINITY }).valid, false);
  });

  it("rejects a non-finite final value or a gain that drives final below 0", () => {
    assert.equal(input({ finalValue: -1 }).valid, false);
    assert.equal(input({ finalValue: Number.NaN }).valid, false);

    assert.equal(input({ mode: "cost_gain", netProfit: Number.NaN }).valid, false);
    const belowZero = input({ mode: "cost_gain", netProfit: -1001 });
    assert.equal(belowZero.valid, false);
    assert.match(belowZero.error ?? "", /negative final value/);
  });

  it("does not throw on nonsense inputs", () => {
    assert.equal(
      input({
        initialInvestment: Number.NaN,
        finalValue: Number.NaN,
        netProfit: Number.NaN,
      }).valid,
      false,
    );
    assert.equal(input({ mode: "not-a-mode" as RoiInput["mode"] }).valid, false);
  });

  it("keeps fractional ROI stable to cents", () => {
    const result = input({ initialInvestment: 300, finalValue: 400 });
    assert.equal(result.valid, true);
    assert.equal(cents(result.roiPercent), cents((100 / 300) * 100));
    assert.equal(result.netProfit, 100);
  });
});

describe("FAQPage JSON-LD shape for ROI calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does an ROI calculator work?",
        answer:
          "ROI % is ((final value − initial investment) / initial investment) × 100. The page also shows net profit.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
