import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  computePercentOff,
  discountFromPercent,
  finalFromDiscount,
  formatPercent,
  formatUsd,
  percentFromDiscount,
  percentFromFinal,
  type PercentOffInput,
} from "./percent-off.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

function input(overrides: Partial<PercentOffInput> = {}) {
  return computePercentOff({
    mode: "price_percent",
    originalPrice: 80,
    percentOff: 25,
    finalPrice: 60,
    discountAmount: 20,
    ...overrides,
  });
}

describe("formatUsd", () => {
  it("formats USD with two decimals", () => {
    assert.equal(formatUsd(80), "$80.00");
    assert.equal(formatUsd(60), "$60.00");
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

describe("percent-off identities", () => {
  it("uses original × (percent / 100) for the discount dollars", () => {
    assert.equal(discountFromPercent(80, 25), 20);
    assert.equal(finalFromDiscount(80, 20), 60);
  });

  it("uses ((original − sale) / original) × 100 for percent off", () => {
    assert.equal(percentFromFinal(80, 60), 25);
    assert.equal(percentFromDiscount(80, 20), 25);
  });

  it("treats 100% off as a $0 sale price", () => {
    assert.equal(discountFromPercent(50, 100), 50);
    assert.equal(finalFromDiscount(50, 50), 0);
    assert.equal(percentFromFinal(50, 0), 100);
  });
});

describe("computePercentOff", () => {
  it("solves original + percent off for discount dollars and sale price", () => {
    const result = input();

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.mode, "price_percent");
    assert.equal(result.originalPrice, 80);
    assert.equal(result.percentOff, 25);
    assert.equal(result.discountAmount, 20);
    assert.equal(result.finalPrice, 60);
    assert.equal(result.youSavePercent, 25);
  });

  it("solves original + sale price for percent off and discount dollars", () => {
    const result = input({ mode: "price_final", originalPrice: 80, finalPrice: 60 });

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.percentOff, 25);
    assert.equal(result.discountAmount, 20);
    assert.equal(result.finalPrice, 60);
  });

  it("solves original + discount dollars for percent off and sale price", () => {
    const result = input({ mode: "price_discount", originalPrice: 80, discountAmount: 20 });

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.percentOff, 25);
    assert.equal(result.finalPrice, 60);
    assert.equal(result.discountAmount, 20);
  });

  it("handles a classic $100 at 20% off example", () => {
    const result = input({ originalPrice: 100, percentOff: 20 });

    assert.equal(result.valid, true);
    assert.equal(result.discountAmount, 20);
    assert.equal(result.finalPrice, 80);
    assert.equal(result.percentOff, 20);
  });

  it("allows 0% off (pay full price) and 100% off (free)", () => {
    const fullPrice = input({ percentOff: 0 });
    assert.equal(fullPrice.valid, true);
    assert.equal(fullPrice.discountAmount, 0);
    assert.equal(fullPrice.finalPrice, 80);
    assert.equal(fullPrice.percentOff, 0);

    const free = input({ percentOff: 100 });
    assert.equal(free.valid, true);
    assert.equal(free.discountAmount, 80);
    assert.equal(free.finalPrice, 0);
    assert.equal(free.percentOff, 100);

    const freeFromPrice = input({ mode: "price_final", finalPrice: 0 });
    assert.equal(freeFromPrice.valid, true);
    assert.equal(freeFromPrice.percentOff, 100);
    assert.equal(freeFromPrice.discountAmount, 80);
  });

  it("keeps fractional percents exact before display rounding", () => {
    const result = input({ originalPrice: 90, percentOff: 33.333333 });

    assert.equal(result.valid, true);
    assert.equal(cents(result.discountAmount), 30);
    assert.equal(cents(result.finalPrice), 60);
  });

  it("rejects non-finite or negative inputs and a zero original price", () => {
    assert.equal(input({ originalPrice: -1 }).valid, false);
    assert.equal(input({ originalPrice: -1 }).status, "invalid");
    assert.equal(input({ originalPrice: 0 }).status, "price_required");
    assert.match(input({ originalPrice: 0 }).error ?? "", /greater than 0/);

    assert.equal(input({ percentOff: -5 }).valid, false);
    assert.equal(input({ originalPrice: Number.NaN }).valid, false);
    assert.equal(input({ percentOff: Number.POSITIVE_INFINITY }).valid, false);

    assert.equal(input({ mode: "price_final", finalPrice: -1 }).valid, false);
    assert.equal(input({ mode: "price_final", finalPrice: Number.NaN }).valid, false);

    assert.equal(input({ mode: "price_discount", discountAmount: -10 }).valid, false);
    assert.equal(input({ mode: "price_discount", discountAmount: Number.NaN }).valid, false);
  });

  it("rejects more than 100% off, a sale above original, or a discount larger than price", () => {
    const overPercent = input({ percentOff: 120 });
    assert.equal(overPercent.valid, false);
    assert.equal(overPercent.status, "discount_over_price");
    assert.match(overPercent.error ?? "", /100%/);

    const saleAbove = input({ mode: "price_final", finalPrice: 90 });
    assert.equal(saleAbove.valid, false);
    assert.equal(saleAbove.status, "discount_over_price");
    assert.match(saleAbove.error ?? "", /markup/);

    const discountAbove = input({ mode: "price_discount", discountAmount: 90 });
    assert.equal(discountAbove.valid, false);
    assert.equal(discountAbove.status, "discount_over_price");
    assert.match(discountAbove.error ?? "", /larger than the original/);
  });

  it("does not throw on nonsense inputs", () => {
    assert.equal(
      input({
        originalPrice: Number.NaN,
        percentOff: Number.NaN,
        finalPrice: Number.NaN,
        discountAmount: Number.NaN,
      }).valid,
      false,
    );
    assert.equal(input({ mode: "not-a-mode" as PercentOffInput["mode"] }).valid, false);
  });
});

describe("FAQPage JSON-LD shape for percent off calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a percent off calculator work?",
        answer:
          "Discount $ = original price × (percent off / 100). Sale price = original − discount. The page also solves percent off from a sale price or from dollars off.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
