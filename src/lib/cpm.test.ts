import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  IMPRESSIONS_PER_MILLE,
  calculateCpm,
  costFromCpm,
  cpcFromCost,
  cpmFromCost,
  cpmFromCpcCtr,
  ctrPercentFromClicks,
  formatCount,
  formatCtr,
  formatMoney,
  impressionsFromCost,
  parseCpmAmount,
  type CpmInput,
} from "./cpm.ts";
import { faqPageJsonLd } from "./faq-schema.ts";

function input(overrides: Partial<CpmInput> = {}) {
  return calculateCpm({
    mode: "cpm",
    cost: 500,
    impressions: 100_000,
    cpm: 5,
    clicks: null,
    cpc: 1,
    ctrPercent: 2,
    ...overrides,
  });
}

describe("cpm identities", () => {
  it("uses 1,000 impressions per mille", () => {
    assert.equal(IMPRESSIONS_PER_MILLE, 1000);
    assert.equal(cpmFromCost(500, 100_000), 5);
    assert.equal(costFromCpm(5, 100_000), 500);
    assert.equal(impressionsFromCost(500, 5), 100_000);
    assert.equal(cpmFromCpcCtr(1, 2), 20);
    assert.equal(cpcFromCost(500, 2_000), 0.25);
    assert.equal(ctrPercentFromClicks(2_000, 100_000), 2);
  });

  it("solves CPM from cost and impressions", () => {
    const result = input();

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.mode, "cpm");
    assert.equal(result.cost, 500);
    assert.equal(result.impressions, 100_000);
    assert.equal(result.cpm, 5);
    assert.equal(result.clicks, null);
    assert.equal(result.cpc, null);
    assert.equal(result.ctrPercent, null);
    assert.equal(formatMoney(result.cpm ?? 0), "$5.00");
    assert.equal(formatCount(result.impressions ?? 0), "100,000");
    assert.equal(formatMoney(result.cost ?? 0), "$500.00");
  });

  it("solves cost from CPM and impressions", () => {
    const result = input({ mode: "cost", cost: Number.NaN });

    assert.equal(result.valid, true);
    assert.equal(result.mode, "cost");
    assert.equal(result.cost, 500);
    assert.equal(result.cpm, 5);
    assert.equal(result.impressions, 100_000);
  });

  it("solves impressions from cost and CPM", () => {
    const result = input({ mode: "impressions", impressions: Number.NaN });

    assert.equal(result.valid, true);
    assert.equal(result.mode, "impressions");
    assert.equal(result.impressions, 100_000);
    assert.equal(result.cost, 500);
    assert.equal(result.cpm, 5);
  });

  it("derives CPC and CTR from optional clicks and matches CPM", () => {
    const result = input({ clicks: 2_000 });

    assert.equal(result.valid, true);
    assert.equal(result.clicks, 2_000);
    assert.equal(result.cpc, 0.25);
    assert.equal(result.ctrPercent, 2);
    assert.equal(formatMoney(result.cpc ?? 0), "$0.25");
    assert.equal(formatCtr(result.ctrPercent ?? 0), "2%");
    assert.ok(
      Math.abs((result.cpm ?? 0) - cpmFromCpcCtr(result.cpc ?? 0, result.ctrPercent ?? 0)) < 1e-9,
    );
  });

  it("solves CPM from CPC and CTR percent", () => {
    const result = input({ mode: "cpc_ctr", cost: Number.NaN, impressions: Number.NaN, cpm: Number.NaN });

    assert.equal(result.valid, true);
    assert.equal(result.mode, "cpc_ctr");
    assert.equal(result.cpm, 20);
    assert.equal(result.cpc, 1);
    assert.equal(result.ctrPercent, 2);
    assert.equal(result.cost, null);
    assert.equal(result.impressions, null);
    assert.equal(formatCtr(2.5), "2.50%");
  });

  it("accepts a zero cost and a zero CPM when the formula does not divide by them", () => {
    const free = input({ cost: 0 });
    assert.equal(free.valid, true);
    assert.equal(free.cpm, 0);

    const noImpressions = input({ mode: "cost", impressions: 0, cpm: 8 });
    assert.equal(noImpressions.valid, true);
    assert.equal(noImpressions.cost, 0);

    const noClicksRate = input({ mode: "cpc_ctr", cpc: 1.5, ctrPercent: 0 });
    assert.equal(noClicksRate.valid, true);
    assert.equal(noClicksRate.cpm, 0);

    const freeClick = input({ mode: "cpc_ctr", cpc: 0, ctrPercent: 4 });
    assert.equal(freeClick.valid, true);
    assert.equal(freeClick.cpm, 0);
  });
});

describe("parseCpmAmount", () => {
  it("accepts commas and rejects empty input", () => {
    assert.equal(parseCpmAmount("1,000"), 1000);
    assert.equal(parseCpmAmount("100,000"), 100_000);
    assert.equal(parseCpmAmount("1,250.50"), 1250.5);
    assert.equal(parseCpmAmount(" 12 "), 12);
    assert.equal(Number.isNaN(parseCpmAmount("")), true);
    assert.equal(Number.isNaN(parseCpmAmount("   ")), true);
  });
});

describe("calculateCpm validation", () => {
  it("rejects negative inputs", () => {
    const cost = input({ cost: -1 });
    assert.equal(cost.valid, false);
    assert.equal(cost.status, "value_required");
    assert.match(cost.error ?? "", /0 or more/);

    const impressions = input({ impressions: -100 });
    assert.equal(impressions.valid, false);
    assert.equal(impressions.status, "value_required");

    const cpm = input({ mode: "impressions", cpm: -5 });
    assert.equal(cpm.valid, false);
    assert.equal(cpm.status, "value_required");

    const ctr = input({ mode: "cpc_ctr", ctrPercent: -2 });
    assert.equal(ctr.valid, false);
    assert.equal(ctr.status, "value_required");
  });

  it("rejects empty, infinite, and unknown modes without throwing", () => {
    assert.equal(input({ cost: Number.NaN }).valid, false);
    assert.equal(input({ cost: Number.NaN }).status, "invalid");
    assert.equal(input({ impressions: Number.POSITIVE_INFINITY }).status, "invalid");
    assert.equal(input({ mode: "cost", cpm: Number.NEGATIVE_INFINITY }).valid, false);
    assert.equal(input({ mode: "revenue" as CpmInput["mode"] }).valid, false);
    assert.equal(input({ mode: "cpc_ctr", cpc: Number.NaN }).status, "invalid");
  });

  it("rejects a zero divisor and a non-positive click count", () => {
    const zeroImpressions = input({ impressions: 0 });
    assert.equal(zeroImpressions.valid, false);
    assert.equal(zeroImpressions.status, "value_required");
    assert.match(zeroImpressions.error ?? "", /greater than 0/);

    const zeroCpm = input({ mode: "impressions", cpm: 0 });
    assert.equal(zeroCpm.valid, false);
    assert.equal(zeroCpm.status, "value_required");

    const zeroClicks = input({ clicks: 0 });
    assert.equal(zeroClicks.valid, false);
    assert.equal(zeroClicks.status, "value_required");

    const negativeClicks = input({ clicks: -10 });
    assert.equal(negativeClicks.valid, false);

    const blankClicks = input({ clicks: Number.NaN });
    assert.equal(blankClicks.valid, false);
    assert.equal(blankClicks.status, "invalid");
  });

  it("rejects a result that overflows to infinity", () => {
    const result = input({ cost: Number.MAX_VALUE, impressions: 1 });
    assert.equal(result.valid, false);
    assert.equal(result.status, "invalid");
    assert.match(result.error ?? "", /too large/);
  });

  it("ignores inputs that the active mode does not use", () => {
    const fromCost = input({ cpm: Number.NaN, cpc: Number.NaN, ctrPercent: Number.NaN });
    assert.equal(fromCost.valid, true);
    assert.equal(fromCost.cpm, 5);

    const fromCpc = input({
      mode: "cpc_ctr",
      cost: Number.NaN,
      impressions: Number.NaN,
      clicks: Number.NaN,
    });
    assert.equal(fromCpc.valid, true);
    assert.equal(fromCpc.cpm, 20);
  });
});

describe("FAQPage JSON-LD shape for CPM calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "What is a CPM calculator?",
        answer:
          "A CPM calculator finds cost per mille: the cost of 1,000 impressions. CPM = (cost / impressions) × 1,000.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
