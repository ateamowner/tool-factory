import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  applyStackedDiscounts,
  computeDiscount,
  discountFromPercent,
  effectiveStackedPercent,
  formatPercent,
  formatUsd,
  originalFromSalePercent,
  percentFromDiscount,
  percentFromSale,
  saleFromDiscount,
  saleFromPercent,
  type DiscountInput,
} from "./discount.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

function input(overrides: Partial<DiscountInput> = {}) {
  return computeDiscount({
    mode: "list_percent",
    originalPrice: 100,
    percentOff: 20,
    salePrice: 80,
    discountAmount: 20,
    firstPercent: 20,
    secondPercent: 10,
    ...overrides,
  });
}

describe("formatUsd", () => {
  it("formats USD with two decimals", () => {
    assert.equal(formatUsd(100), "$100.00");
    assert.equal(formatUsd(72), "$72.00");
    assert.equal(formatUsd(1234.5), "$1,234.50");
  });
});

describe("formatPercent", () => {
  it("keeps whole percents without trailing zeros", () => {
    assert.equal(formatPercent(20), "20%");
    assert.equal(formatPercent(28), "28%");
  });

  it("shows two decimals for fractional percents", () => {
    assert.equal(formatPercent(33.333333), "33.33%");
  });
});

describe("discount identities", () => {
  it("uses original × (percent / 100) for the discount dollars", () => {
    assert.equal(discountFromPercent(100, 20), 20);
    assert.equal(saleFromDiscount(100, 20), 80);
    assert.equal(saleFromPercent(100, 20), 80);
  });

  it("uses ((original − sale) / original) × 100 for discount percent", () => {
    assert.equal(percentFromSale(100, 80), 20);
    assert.equal(percentFromDiscount(100, 20), 20);
  });

  it("reverses sale price + discount percent back to the original", () => {
    assert.equal(originalFromSalePercent(80, 20), 100);
    assert.equal(originalFromSalePercent(72, 28), 100);
  });

  it("treats 100% off as a $0 sale price", () => {
    assert.equal(discountFromPercent(50, 100), 50);
    assert.equal(saleFromDiscount(50, 50), 0);
    assert.equal(percentFromSale(50, 0), 100);
  });
});

describe("stacked / successive discounts", () => {
  it("combines 20% then 10% into a 28% effective discount, not 30%", () => {
    assert.equal(effectiveStackedPercent(20, 10), 28);
    const stacked = applyStackedDiscounts(100, 20, 10);
    assert.equal(stacked.afterFirstPrice, 80);
    assert.equal(stacked.salePrice, 72);
    assert.equal(stacked.discountAmount, 28);
    assert.equal(stacked.effectivePercent, 28);
  });

  it("treats order as sequential percents of the remaining price", () => {
    const twentyThenTen = applyStackedDiscounts(200, 20, 10);
    const tenThenTwenty = applyStackedDiscounts(200, 10, 20);
    assert.equal(cents(twentyThenTen.salePrice), 144);
    assert.equal(cents(tenThenTwenty.salePrice), 144);
    assert.equal(cents(twentyThenTen.effectivePercent), 28);
    assert.equal(cents(tenThenTwenty.effectivePercent), 28);
  });

  it("treats a 0% second discount as a single discount", () => {
    const stacked = applyStackedDiscounts(80, 25, 0);
    assert.equal(stacked.afterFirstPrice, 60);
    assert.equal(stacked.salePrice, 60);
    assert.equal(stacked.effectivePercent, 25);
  });
});

describe("computeDiscount", () => {
  it("solves list price + discount percent for dollars off and sale price", () => {
    const result = input();

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.mode, "list_percent");
    assert.equal(result.originalPrice, 100);
    assert.equal(result.percentOff, 20);
    assert.equal(result.discountAmount, 20);
    assert.equal(result.salePrice, 80);
    assert.equal(result.youSavePercent, 20);
  });

  it("solves list price + discount dollars for percent off and sale price", () => {
    const result = input({ mode: "list_dollars", originalPrice: 100, discountAmount: 20 });

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.percentOff, 20);
    assert.equal(result.salePrice, 80);
    assert.equal(result.discountAmount, 20);
  });

  it("solves sale price + discount percent for the original list price", () => {
    const result = input({ mode: "sale_percent", salePrice: 80, percentOff: 20 });

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.originalPrice, 100);
    assert.equal(result.discountAmount, 20);
    assert.equal(result.salePrice, 80);
    assert.equal(result.percentOff, 20);
  });

  it("solves list price + sale price for discount percent and dollars", () => {
    const result = input({ mode: "list_sale", originalPrice: 100, salePrice: 80 });

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.percentOff, 20);
    assert.equal(result.discountAmount, 20);
    assert.equal(result.salePrice, 80);
  });

  it("solves two successive percent discounts for sale price and combined effective %", () => {
    const result = input({
      mode: "stacked",
      originalPrice: 100,
      firstPercent: 20,
      secondPercent: 10,
    });

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.mode, "stacked");
    assert.equal(result.afterFirstPrice, 80);
    assert.equal(result.salePrice, 72);
    assert.equal(result.discountAmount, 28);
    assert.equal(result.percentOff, 28);
    assert.equal(result.effectivePercent, 28);
    assert.equal(result.youSavePercent, 28);
    assert.equal(result.firstPercent, 20);
    assert.equal(result.secondPercent, 10);
  });

  it("handles a classic $80 at 25% off example", () => {
    const result = input({ originalPrice: 80, percentOff: 25 });

    assert.equal(result.valid, true);
    assert.equal(result.discountAmount, 20);
    assert.equal(result.salePrice, 60);
    assert.equal(result.percentOff, 25);
  });

  it("allows 0% off (pay full price) and 100% off (free) on list-price modes", () => {
    const fullPrice = input({ percentOff: 0 });
    assert.equal(fullPrice.valid, true);
    assert.equal(fullPrice.discountAmount, 0);
    assert.equal(fullPrice.salePrice, 100);
    assert.equal(fullPrice.percentOff, 0);

    const free = input({ percentOff: 100 });
    assert.equal(free.valid, true);
    assert.equal(free.discountAmount, 100);
    assert.equal(free.salePrice, 0);
    assert.equal(free.percentOff, 100);

    const freeFromPrice = input({ mode: "list_sale", salePrice: 0 });
    assert.equal(freeFromPrice.valid, true);
    assert.equal(freeFromPrice.percentOff, 100);
    assert.equal(freeFromPrice.discountAmount, 100);
  });

  it("keeps fractional percents exact before display rounding", () => {
    const result = input({ originalPrice: 90, percentOff: 33.333333 });

    assert.equal(result.valid, true);
    assert.equal(cents(result.discountAmount), 30);
    assert.equal(cents(result.salePrice), 60);
  });

  it("rejects non-finite or negative inputs and a zero original price", () => {
    assert.equal(input({ originalPrice: -1 }).valid, false);
    assert.equal(input({ originalPrice: -1 }).status, "invalid");
    assert.equal(input({ originalPrice: 0 }).status, "price_required");
    assert.match(input({ originalPrice: 0 }).error ?? "", /greater than 0/);

    assert.equal(input({ percentOff: -5 }).valid, false);
    assert.equal(input({ originalPrice: Number.NaN }).valid, false);
    assert.equal(input({ percentOff: Number.POSITIVE_INFINITY }).valid, false);

    assert.equal(input({ mode: "list_sale", salePrice: -1 }).valid, false);
    assert.equal(input({ mode: "list_sale", salePrice: Number.NaN }).valid, false);

    assert.equal(input({ mode: "list_dollars", discountAmount: -10 }).valid, false);
    assert.equal(input({ mode: "list_dollars", discountAmount: Number.NaN }).valid, false);

    assert.equal(input({ mode: "sale_percent", salePrice: 0 }).status, "price_required");
    assert.equal(input({ mode: "sale_percent", salePrice: -8 }).valid, false);
    assert.equal(input({ mode: "stacked", firstPercent: -1 }).valid, false);
    assert.equal(input({ mode: "stacked", secondPercent: Number.NaN }).valid, false);
  });

  it("rejects more than 100% off, a sale above original, or a discount larger than price", () => {
    const overPercent = input({ percentOff: 120 });
    assert.equal(overPercent.valid, false);
    assert.equal(overPercent.status, "discount_over_price");
    assert.match(overPercent.error ?? "", /100%/);

    const saleAbove = input({ mode: "list_sale", salePrice: 110 });
    assert.equal(saleAbove.valid, false);
    assert.equal(saleAbove.status, "discount_over_price");
    assert.match(saleAbove.error ?? "", /markup/);

    const discountAbove = input({ mode: "list_dollars", discountAmount: 110 });
    assert.equal(discountAbove.valid, false);
    assert.equal(discountAbove.status, "discount_over_price");
    assert.match(discountAbove.error ?? "", /larger than the original/);

    const stackedOver = input({ mode: "stacked", firstPercent: 150 });
    assert.equal(stackedOver.valid, false);
    assert.equal(stackedOver.status, "discount_over_price");
  });

  it("rejects reversing a 100% discount to an original price", () => {
    const unreachable = input({ mode: "sale_percent", salePrice: 80, percentOff: 100 });
    assert.equal(unreachable.valid, false);
    assert.equal(unreachable.status, "percent_unreachable");
    assert.match(unreachable.error ?? "", /less than 100%/);
  });

  it("does not throw on nonsense inputs", () => {
    assert.equal(
      input({
        originalPrice: Number.NaN,
        percentOff: Number.NaN,
        salePrice: Number.NaN,
        discountAmount: Number.NaN,
        firstPercent: Number.NaN,
        secondPercent: Number.NaN,
      }).valid,
      false,
    );
    assert.equal(input({ mode: "not-a-mode" as DiscountInput["mode"] }).valid, false);
  });
});

describe("FAQPage JSON-LD shape for discount calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a discount calculator work?",
        answer:
          "Discount $ = original (list) price × (discount % / 100). Sale price = original − discount. Reverse from a sale price and discount % to the original, or stack two sequential percent discounts for the combined effective %.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
