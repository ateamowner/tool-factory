import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  computeRealEstateCommission,
  splitSumsToHundred,
} from "./real-estate-commission.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

describe("splitSumsToHundred", () => {
  it("accepts splits that add to 100", () => {
    assert.equal(splitSumsToHundred(50, 50), true);
    assert.equal(splitSumsToHundred(60, 40), true);
    assert.equal(splitSumsToHundred(100, 0), true);
    assert.equal(splitSumsToHundred(33.33, 66.67), true);
  });

  it("rejects splits that miss 100", () => {
    assert.equal(splitSumsToHundred(50, 40), false);
    assert.equal(splitSumsToHundred(0, 0), false);
    assert.equal(splitSumsToHundred(Number.NaN, 50), false);
  });
});

describe("computeRealEstateCommission", () => {
  it("computes total commission, 50/50 split, and seller net on a typical sale", () => {
    const result = computeRealEstateCommission({
      salePrice: 400000,
      commissionRatePercent: 5.5,
      listingSplitPercent: 50,
      buyerSplitPercent: 50,
      additionalFees: 0,
    });

    assert.equal(result.valid, true);
    assert.equal(result.salePrice, 400000);
    assert.equal(cents(result.totalCommission), 22000);
    assert.equal(cents(result.listingSide), 11000);
    assert.equal(cents(result.buyerSide), 11000);
    assert.equal(cents(result.listingRateOfPrice), 2.75);
    assert.equal(cents(result.buyerRateOfPrice), 2.75);
    assert.equal(result.additionalFees, 0);
    assert.equal(cents(result.commissionPlusFees), 22000);
    assert.equal(cents(result.sellerNetProceeds), 378000);
  });

  it("applies a 60/40 listing-buyer split and optional fees to seller net", () => {
    const result = computeRealEstateCommission({
      salePrice: 500000,
      commissionRatePercent: 6,
      listingSplitPercent: 60,
      buyerSplitPercent: 40,
      additionalFees: 3500,
    });

    assert.equal(result.valid, true);
    assert.equal(cents(result.totalCommission), 30000);
    assert.equal(cents(result.listingSide), 18000);
    assert.equal(cents(result.buyerSide), 12000);
    assert.equal(cents(result.listingRateOfPrice), 3.6);
    assert.equal(cents(result.buyerRateOfPrice), 2.4);
    assert.equal(result.additionalFees, 3500);
    assert.equal(cents(result.commissionPlusFees), 33500);
    assert.equal(cents(result.sellerNetProceeds), 466500);
  });

  it("allows a 0% commission and still subtracts additional fees", () => {
    const result = computeRealEstateCommission({
      salePrice: 250000,
      commissionRatePercent: 0,
      listingSplitPercent: 50,
      buyerSplitPercent: 50,
      additionalFees: 1200,
    });

    assert.equal(result.valid, true);
    assert.equal(result.totalCommission, 0);
    assert.equal(result.listingSide, 0);
    assert.equal(result.buyerSide, 0);
    assert.equal(result.sellerNetProceeds, 248800);
  });

  it("lets one side take the full commission", () => {
    const result = computeRealEstateCommission({
      salePrice: 300000,
      commissionRatePercent: 5,
      listingSplitPercent: 100,
      buyerSplitPercent: 0,
      additionalFees: 0,
    });

    assert.equal(result.valid, true);
    assert.equal(result.totalCommission, 15000);
    assert.equal(result.listingSide, 15000);
    assert.equal(result.buyerSide, 0);
    assert.equal(result.sellerNetProceeds, 285000);
  });

  it("can show a negative seller net when fees plus commission exceed the price", () => {
    const result = computeRealEstateCommission({
      salePrice: 10000,
      commissionRatePercent: 6,
      listingSplitPercent: 50,
      buyerSplitPercent: 50,
      additionalFees: 12000,
    });

    assert.equal(result.valid, true);
    assert.equal(result.totalCommission, 600);
    assert.equal(result.sellerNetProceeds, -2600);
  });

  it("rejects a missing sale price, out-of-range rate, negative fees, or a split that is not 100", () => {
    assert.equal(
      computeRealEstateCommission({
        salePrice: 0,
        commissionRatePercent: 5.5,
        listingSplitPercent: 50,
        buyerSplitPercent: 50,
        additionalFees: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeRealEstateCommission({
        salePrice: 200000,
        commissionRatePercent: -1,
        listingSplitPercent: 50,
        buyerSplitPercent: 50,
        additionalFees: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeRealEstateCommission({
        salePrice: 200000,
        commissionRatePercent: 101,
        listingSplitPercent: 50,
        buyerSplitPercent: 50,
        additionalFees: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeRealEstateCommission({
        salePrice: 200000,
        commissionRatePercent: 5,
        listingSplitPercent: 50,
        buyerSplitPercent: 50,
        additionalFees: -1,
      }).valid,
      false,
    );
    assert.equal(
      computeRealEstateCommission({
        salePrice: 200000,
        commissionRatePercent: 5,
        listingSplitPercent: 70,
        buyerSplitPercent: 20,
        additionalFees: 0,
      }).valid,
      false,
    );
    assert.equal(
      computeRealEstateCommission({
        salePrice: 200000,
        commissionRatePercent: 5,
        listingSplitPercent: -10,
        buyerSplitPercent: 110,
        additionalFees: 0,
      }).valid,
      false,
    );
  });
});

describe("FAQPage JSON-LD shape for real estate commission calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a real estate commission calculator work?",
        answer:
          "It multiplies the home sale price by the commission rate, optionally splits that total between listing and buyer agents, then subtracts commission and extra fees from the price for seller net proceeds.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
