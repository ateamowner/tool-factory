import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  amountToReachTarget,
  availableCredit,
  computeCreditUtilization,
  utilizationPercent,
  validCards,
} from "./credit-utilization.ts";

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

describe("utilizationPercent", () => {
  it("is balances divided by limits times 100", () => {
    assert.equal(utilizationPercent(3000, 10000), 30);
    assert.equal(utilizationPercent(0, 5000), 0);
    assert.equal(utilizationPercent(1200, 1000), 120);
  });

  it("rejects a missing or non-positive limit and a negative balance", () => {
    assert.equal(utilizationPercent(100, 0), null);
    assert.equal(utilizationPercent(-1, 1000), null);
    assert.equal(utilizationPercent(100, Number.NaN), null);
  });
});

describe("availableCredit", () => {
  it("is remaining limit, floored at zero when over the limit", () => {
    assert.equal(availableCredit(10000, 3000), 7000);
    assert.equal(availableCredit(1000, 1200), 0);
    assert.equal(availableCredit(2500, 2500), 0);
  });
});

describe("amountToReachTarget", () => {
  it("is the paydown needed to hit the target utilization of the limit", () => {
    assert.equal(amountToReachTarget(4000, 10000, 30), 1000);
    assert.equal(amountToReachTarget(3000, 10000, 30), 0);
    assert.equal(amountToReachTarget(2500, 10000, 30), 0);
    assert.equal(amountToReachTarget(800, 1000, 0), 800);
    assert.equal(cents(amountToReachTarget(1200, 1000, 100)), 200);
  });

  it("rejects an out-of-range target or invalid limit", () => {
    assert.equal(amountToReachTarget(4000, 10000, -1), null);
    assert.equal(amountToReachTarget(4000, 10000, 101), null);
    assert.equal(amountToReachTarget(4000, 0, 30), null);
  });
});

describe("validCards", () => {
  it("keeps cards with a positive limit and a non-negative balance", () => {
    assert.equal(
      validCards([
        { limit: 5000, balance: 1000 },
        { limit: 0, balance: 100 },
        { limit: 2000, balance: -5 },
        { limit: Number.NaN, balance: 10 },
      ]).length,
      1,
    );
  });
});

describe("computeCreditUtilization", () => {
  it("computes overall utilization, available credit, and paydown on a typical total", () => {
    const result = computeCreditUtilization({
      cards: [{ limit: 10000, balance: 4000 }],
      targetUtilizationPercent: 30,
    });

    assert.equal(result.valid, true);
    assert.equal(result.totalLimit, 10000);
    assert.equal(result.totalBalance, 4000);
    assert.equal(result.utilizationPercent, 40);
    assert.equal(result.availableCredit, 6000);
    assert.equal(result.overLimitAmount, 0);
    assert.equal(result.targetBalance, 3000);
    assert.equal(result.amountToPayForTarget, 1000);
    assert.equal(result.alreadyAtOrBelowTarget, false);
    assert.equal(result.cards.length, 1);
    assert.equal(result.cards[0]?.utilizationPercent, 40);
    assert.equal(result.cards[0]?.amountToPayForTarget, 1000);
  });

  it("sums per-card limits and balances and reports each card's utilization", () => {
    const result = computeCreditUtilization({
      cards: [
        { label: "Visa", limit: 5000, balance: 2000 },
        { label: "Amex", limit: 5000, balance: 500 },
      ],
      targetUtilizationPercent: 30,
    });

    assert.equal(result.valid, true);
    assert.equal(result.totalLimit, 10000);
    assert.equal(result.totalBalance, 2500);
    assert.equal(result.utilizationPercent, 25);
    assert.equal(result.availableCredit, 7500);
    assert.equal(result.amountToPayForTarget, 0);
    assert.equal(result.alreadyAtOrBelowTarget, true);
    assert.equal(result.cards[0]?.label, "Visa");
    assert.equal(result.cards[0]?.utilizationPercent, 40);
    assert.equal(result.cards[0]?.amountToPayForTarget, 500);
    assert.equal(result.cards[1]?.label, "Amex");
    assert.equal(result.cards[1]?.utilizationPercent, 10);
    assert.equal(result.cards[1]?.amountToPayForTarget, 0);
  });

  it("labels unnamed cards in order and ignores incomplete rows", () => {
    const result = computeCreditUtilization({
      cards: [
        { limit: 2000, balance: 200 },
        { limit: Number.NaN, balance: 50 },
        { label: "  ", limit: 3000, balance: 900 },
      ],
      targetUtilizationPercent: 30,
    });

    assert.equal(result.valid, true);
    assert.equal(result.totalLimit, 5000);
    assert.equal(result.totalBalance, 1100);
    assert.equal(result.utilizationPercent, 22);
    assert.equal(result.cards[0]?.label, "Card 1");
    assert.equal(result.cards[1]?.label, "Card 2");
  });

  it("handles an over-limit balance with utilization above 100%", () => {
    const result = computeCreditUtilization({
      cards: [{ limit: 1000, balance: 1200 }],
      targetUtilizationPercent: 30,
    });

    assert.equal(result.valid, true);
    assert.equal(result.utilizationPercent, 120);
    assert.equal(result.availableCredit, 0);
    assert.equal(result.overLimitAmount, 200);
    assert.equal(result.amountToPayForTarget, 900);
  });

  it("treats a missing or out-of-range target as optional and still returns utilization", () => {
    const missing = computeCreditUtilization({
      cards: [{ limit: 8000, balance: 1600 }],
      targetUtilizationPercent: Number.NaN,
    });
    assert.equal(missing.valid, true);
    assert.equal(missing.utilizationPercent, 20);
    assert.equal(missing.amountToPayForTarget, null);
    assert.equal(missing.targetBalance, null);
    assert.equal(missing.alreadyAtOrBelowTarget, false);

    const outOfRange = computeCreditUtilization({
      cards: [{ limit: 8000, balance: 1600 }],
      targetUtilizationPercent: 150,
    });
    assert.equal(outOfRange.valid, true);
    assert.equal(outOfRange.amountToPayForTarget, null);
  });

  it("pays the full balance when the target utilization is 0%", () => {
    const result = computeCreditUtilization({
      cards: [{ limit: 4000, balance: 1250 }],
      targetUtilizationPercent: 0,
    });

    assert.equal(result.valid, true);
    assert.equal(result.targetBalance, 0);
    assert.equal(result.amountToPayForTarget, 1250);
  });

  it("rejects a missing card, a zero limit, or a negative balance", () => {
    assert.equal(
      computeCreditUtilization({ cards: [], targetUtilizationPercent: 30 }).valid,
      false,
    );
    assert.equal(
      computeCreditUtilization({
        cards: [{ limit: 0, balance: 100 }],
        targetUtilizationPercent: 30,
      }).valid,
      false,
    );
    assert.equal(
      computeCreditUtilization({
        cards: [{ limit: 2000, balance: -1 }],
        targetUtilizationPercent: 30,
      }).valid,
      false,
    );
  });
});

describe("FAQPage JSON-LD shape for credit utilization calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a credit utilization calculator work?",
        answer:
          "It divides current balances by credit limits to get utilization percent, then shows available credit and how much to pay to reach a target ratio.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
