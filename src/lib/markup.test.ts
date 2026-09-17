import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  computeMarkup,
  formatPercent,
  formatUsd,
  marginPercentFromPrice,
  markupPercentFromPrice,
  sellingFromMargin,
  sellingFromMarkup,
  type MarkupInput,
} from "./markup.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

function input(overrides: Partial<MarkupInput> = {}) {
  return computeMarkup({
    mode: "cost_markup",
    cost: 80,
    markupPercent: 25,
    sellingPrice: 100,
    marginPercent: 20,
    ...overrides,
  });
}

describe("formatUsd", () => {
  it("formats USD with two decimals", () => {
    assert.equal(formatUsd(80), "$80.00");
    assert.equal(formatUsd(100), "$100.00");
    assert.equal(formatUsd(1234.5), "$1,234.50");
  });
});

describe("formatPercent", () => {
  it("keeps whole percents without trailing zeros", () => {
    assert.equal(formatPercent(25), "25%");
    assert.equal(formatPercent(20), "20%");
  });

  it("shows two decimals for fractional percents", () => {
    assert.equal(formatPercent(33.333333), "33.33%");
  });
});

describe("markup and margin identities", () => {
  it("uses ((selling − cost) / cost) × 100 for markup", () => {
    assert.equal(markupPercentFromPrice(80, 100), 25);
    assert.equal(sellingFromMarkup(80, 25), 100);
  });

  it("uses ((selling − cost) / selling) × 100 for margin", () => {
    assert.equal(marginPercentFromPrice(80, 100), 20);
    assert.equal(sellingFromMargin(80, 20), 100);
  });

  it("treats a 50% margin as a 100% markup", () => {
    assert.equal(sellingFromMargin(50, 50), 100);
    assert.equal(markupPercentFromPrice(50, 100), 100);
    assert.equal(marginPercentFromPrice(50, 100), 50);
  });
});

describe("computeMarkup", () => {
  it("solves cost + markup % for selling price, profit, and implied margin", () => {
    const result = input();

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.mode, "cost_markup");
    assert.equal(result.cost, 80);
    assert.equal(result.sellingPrice, 100);
    assert.equal(result.profit, 20);
    assert.equal(result.markupPercent, 25);
    assert.equal(result.marginPercent, 20);
  });

  it("solves cost + selling price for markup % and margin %", () => {
    const result = input({ mode: "cost_price", cost: 80, sellingPrice: 100 });

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.markupPercent, 25);
    assert.equal(result.marginPercent, 20);
    assert.equal(result.profit, 20);
    assert.equal(result.sellingPrice, 100);
  });

  it("solves cost + desired margin % for selling price and equivalent markup", () => {
    const result = input({ mode: "cost_margin", cost: 80, marginPercent: 20 });

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.sellingPrice, 100);
    assert.equal(result.profit, 20);
    assert.equal(result.markupPercent, 25);
    assert.equal(result.marginPercent, 20);
  });

  it("keeps markup and margin distinct on a 50% margin example", () => {
    const result = input({ mode: "cost_margin", cost: 40, marginPercent: 50 });

    assert.equal(result.valid, true);
    assert.equal(result.sellingPrice, 80);
    assert.equal(result.profit, 40);
    assert.equal(result.markupPercent, 100);
    assert.equal(result.marginPercent, 50);
  });

  it("allows a zero markup (sell at cost) and a zero selling price", () => {
    const atCost = input({ mode: "cost_markup", markupPercent: 0 });
    assert.equal(atCost.valid, true);
    assert.equal(atCost.sellingPrice, 80);
    assert.equal(atCost.profit, 0);
    assert.equal(atCost.marginPercent, 0);

    const free = input({ mode: "cost_price", sellingPrice: 0 });
    assert.equal(free.valid, true);
    assert.equal(free.profit, -80);
    assert.equal(free.markupPercent, -100);
    assert.equal(free.marginPercent, null);
  });

  it("allows selling below cost so markup and margin can be negative", () => {
    const result = input({ mode: "cost_price", sellingPrice: 60 });

    assert.equal(result.valid, true);
    assert.equal(result.profit, -20);
    assert.equal(result.markupPercent, -25);
    assert.equal(cents(result.marginPercent), cents((-20 / 60) * 100));
  });

  it("rejects non-finite or negative inputs and a zero cost", () => {
    assert.equal(input({ cost: -1 }).valid, false);
    assert.equal(input({ cost: -1 }).status, "invalid");
    assert.equal(input({ cost: 0 }).status, "cost_required");
    assert.match(input({ cost: 0 }).error ?? "", /greater than 0/);

    assert.equal(input({ markupPercent: -5 }).valid, false);
    assert.equal(input({ cost: Number.NaN }).valid, false);
    assert.equal(input({ markupPercent: Number.POSITIVE_INFINITY }).valid, false);

    assert.equal(input({ mode: "cost_price", sellingPrice: -1 }).valid, false);
    assert.equal(input({ mode: "cost_price", sellingPrice: Number.NaN }).valid, false);

    assert.equal(input({ mode: "cost_margin", marginPercent: -10 }).valid, false);
    assert.equal(input({ mode: "cost_margin", marginPercent: Number.NaN }).valid, false);
  });

  it("rejects a desired margin of 100% or more", () => {
    const atHundred = input({ mode: "cost_margin", marginPercent: 100 });
    assert.equal(atHundred.valid, false);
    assert.equal(atHundred.status, "margin_unreachable");
    assert.match(atHundred.error ?? "", /less than 100%/);

    assert.equal(input({ mode: "cost_margin", marginPercent: 120 }).status, "margin_unreachable");
  });

  it("does not throw on nonsense inputs", () => {
    assert.equal(
      input({
        cost: Number.NaN,
        markupPercent: Number.NaN,
        sellingPrice: Number.NaN,
        marginPercent: Number.NaN,
      }).valid,
      false,
    );
    assert.equal(input({ mode: "not-a-mode" as MarkupInput["mode"] }).valid, false);
  });
});

describe("FAQPage JSON-LD shape for markup calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a markup calculator work?",
        answer:
          "Markup % is ((selling price − cost) / cost) × 100. The page also shows profit dollars and the implied margin on selling price.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
