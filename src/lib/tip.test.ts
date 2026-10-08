import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  DEFAULT_TIP_PERCENT,
  TIP_PRESETS,
  computeTip,
  formatPercent,
  formatUsd,
  parseTipNumber,
  type TipInput,
} from "./tip.ts";

function input(overrides: Partial<TipInput> = {}): TipInput {
  return {
    billAmount: 50,
    tipPercent: 20,
    people: 1,
    roundMode: "none",
    ...overrides,
  };
}

describe("parseTipNumber", () => {
  it("strips $, commas, and % and rejects empty", () => {
    assert.equal(parseTipNumber("$1,250.50"), 1250.5);
    assert.equal(parseTipNumber("18%"), 18);
    assert.ok(Number.isNaN(parseTipNumber("")));
    assert.ok(Number.isNaN(parseTipNumber("   ")));
    assert.ok(Number.isNaN(parseTipNumber("abc")));
  });
});

describe("presets", () => {
  it("offers 15/18/20/25 with 18 as the default", () => {
    assert.deepEqual([...TIP_PRESETS], [15, 18, 20, 25]);
    assert.equal(DEFAULT_TIP_PERCENT, 18);
  });
});

describe("computeTip", () => {
  it("calculates a 20% tip on $50", () => {
    const r = computeTip(input());
    assert.equal(r.valid, true);
    assert.equal(r.tipAmount, 10);
    assert.equal(r.total, 60);
    assert.equal(r.totalPerPerson, 60);
    assert.equal(r.tipPerPerson, 10);
    assert.equal(r.effectiveTipPercent, 20);
    assert.equal(r.roundedUp, false);
  });

  it("rounds the tip to the nearest cent", () => {
    const r = computeTip(input({ billAmount: 47.85, tipPercent: 18 }));
    assert.equal(r.tipAmount, 8.61);
    assert.equal(r.total, 56.46);
  });

  it("splits between people", () => {
    const r = computeTip(input({ billAmount: 120, tipPercent: 15, people: 4 }));
    assert.equal(r.tipAmount, 18);
    assert.equal(r.total, 138);
    assert.equal(r.tipPerPerson, 4.5);
    assert.equal(r.totalPerPerson, 34.5);
  });

  it("rounds uneven per-person shares up to the next cent", () => {
    const r = computeTip(input({ billAmount: 100, tipPercent: 0, people: 3 }));
    assert.equal(r.total, 100);
    assert.equal(r.totalPerPerson, 33.34);
  });

  it("rounds the total up to the next dollar", () => {
    const r = computeTip(input({ billAmount: 47.85, tipPercent: 18, roundMode: "total" }));
    assert.equal(r.total, 57);
    assert.equal(r.tipAmount, 9.15);
    assert.equal(r.roundedUp, true);
    assert.equal(r.effectiveTipPercent, 19.12);
  });

  it("does not change a total that is already a whole dollar", () => {
    const r = computeTip(input({ roundMode: "total" }));
    assert.equal(r.total, 60);
    assert.equal(r.roundedUp, false);
  });

  it("rounds each person's share up to the next dollar", () => {
    const r = computeTip(
      input({ billAmount: 87.4, tipPercent: 20, people: 3, roundMode: "per-person" }),
    );
    // 87.40 + 17.48 = 104.88 -> 34.96 each -> $35 each
    assert.equal(r.totalPerPerson, 35);
    assert.equal(r.total, 105);
    assert.equal(r.tipAmount, 17.6);
    assert.equal(r.roundedUp, true);
  });

  it("allows a 0% tip and a custom percentage", () => {
    assert.equal(computeTip(input({ tipPercent: 0 })).tipAmount, 0);
    assert.equal(computeTip(input({ tipPercent: 22.5 })).tipAmount, 11.25);
  });

  it("rejects invalid inputs", () => {
    assert.equal(computeTip(input({ billAmount: 0 })).valid, false);
    assert.equal(computeTip(input({ billAmount: Number.NaN })).valid, false);
    assert.equal(computeTip(input({ billAmount: 2_000_000 })).valid, false);
    assert.equal(computeTip(input({ tipPercent: -1 })).valid, false);
    assert.equal(computeTip(input({ tipPercent: 150 })).valid, false);
    assert.equal(computeTip(input({ people: 0 })).valid, false);
    assert.equal(computeTip(input({ people: 2.5 })).valid, false);
    assert.equal(computeTip(input({ people: 101 })).valid, false);
    assert.ok(computeTip(input({ people: 0 })).error);
  });

  it("writes a plain-English summary", () => {
    const r = computeTip(input({ billAmount: 120, tipPercent: 15, people: 4 }));
    assert.equal(
      r.summary,
      "A 15% tip on $120.00 is $18.00, for a total of $138.00. Split 4 ways, each person pays $34.50.",
    );
  });

  it("uses An before an 18% tip in the summary", () => {
    const r = computeTip(input({ billAmount: 50, tipPercent: 18, people: 1 }));
    assert.equal(
      r.summary,
      "An 18% tip on $50.00 is $9.00, for a total of $59.00.",
    );
  });
});

describe("formatting", () => {
  it("formats USD and percents", () => {
    assert.equal(formatUsd(1234.5), "$1,234.50");
    assert.equal(formatPercent(18), "18%");
    assert.equal(formatPercent(19.12), "19.12%");
  });

  it("builds FAQPage JSON-LD", () => {
    const ld = faqPageJsonLd([
      { question: "How much should I tip?", answer: "Many diners tip 15% to 20%." },
      { question: "Tip before or after tax?", answer: "Either is common." },
    ]);
    assert.equal(ld["@type"], "FAQPage");
    assert.equal(ld.mainEntity.length, 2);
  });
});
