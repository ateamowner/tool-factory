import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  DEFAULT_WASTE_PERCENT,
  PITCH_PRESETS,
  SQ_FT_PER_ROOFING_SQUARE,
  calculateRoofing,
  formatFactor,
  formatMoney,
  formatSqFt,
  formatSquares,
  parseAmount,
  pitchFactorFromRise,
  type RoofingInput,
} from "./roofing.ts";

function input(overrides: Partial<RoofingInput> = {}) {
  return calculateRoofing({
    mode: "dimensions",
    lengthFt: 40,
    widthFt: 30,
    planSqFt: 1200,
    pitchMode: "preset",
    presetId: "6/12",
    rise: 6,
    pitchFactor: 1,
    wastePercent: 10,
    pricePerSquare: null,
    ...overrides,
  });
}

describe("roof pitch factor", () => {
  it("uses surface ≈ plan × sqrt(1 + (rise/12)^2)", () => {
    assert.equal(SQ_FT_PER_ROOFING_SQUARE, 100);
    assert.equal(DEFAULT_WASTE_PERCENT, 10);
    assert.equal(pitchFactorFromRise(0), 1);
    assert.equal(pitchFactorFromRise(6), Math.sqrt(1.25));
    assert.equal(pitchFactorFromRise(4), Math.sqrt(1 + (4 / 12) ** 2));
    assert.equal(pitchFactorFromRise(8), Math.sqrt(1 + (8 / 12) ** 2));
    assert.equal(pitchFactorFromRise(12), Math.sqrt(2));
    assert.ok(Math.abs(pitchFactorFromRise(6) - 1.118034) < 0.000001);
  });

  it("lists the common pitch presets", () => {
    assert.deepEqual(
      PITCH_PRESETS.map((preset) => preset.id),
      ["flat", "4/12", "6/12", "8/12", "12/12"],
    );
  });
});

describe("calculateRoofing", () => {
  it("converts a 40 × 30 ft 6/12 roof with 10% waste", () => {
    const result = input();
    const factor = Math.sqrt(1.25);
    const surface = 1200 * factor;

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.planSqFt, 1200);
    assert.equal(result.lengthFt, 40);
    assert.equal(result.widthFt, 30);
    assert.equal(result.pitchLabel, "6/12");
    assert.equal(result.pitchFactor, factor);
    assert.equal(result.surfaceSqFt, surface);
    assert.equal(result.squares, surface / 100);
    assert.equal(result.wastePercent, 10);
    assert.equal(result.adjustedSqFt, surface * 1.1);
    assert.equal(result.adjustedSquares, (surface / 100) * 1.1);
    assert.equal(result.materialCost, null);
    assert.equal(formatSqFt(result.planSqFt ?? 0), "1,200 sq ft");
    assert.equal(formatFactor(factor), "1.1180");
    assert.equal(formatSquares(result.squares ?? 0), "13.42 squares");
  });

  it("uses a typed plan area and a 4/12 pitch", () => {
    const result = input({
      mode: "plan",
      planSqFt: 1000,
      lengthFt: Number.NaN,
      widthFt: Number.NaN,
      presetId: "4/12",
      wastePercent: 0,
    });
    const factor = pitchFactorFromRise(4);

    assert.equal(result.valid, true);
    assert.equal(result.planSqFt, 1000);
    assert.equal(result.lengthFt, null);
    assert.equal(result.pitchFactor, factor);
    assert.equal(result.surfaceSqFt, 1000 * factor);
    assert.equal(result.squares, (1000 * factor) / 100);
    assert.equal(result.adjustedSquares, result.squares);
  });

  it("accepts a custom rise or a direct pitch factor", () => {
    const rise = input({ pitchMode: "rise", rise: 9, presetId: "flat" });
    assert.equal(rise.valid, true);
    assert.equal(rise.pitchLabel, "9/12");
    assert.equal(rise.pitchFactor, pitchFactorFromRise(9));

    const factor = input({ pitchMode: "factor", pitchFactor: 1.25, rise: Number.NaN });
    assert.equal(factor.valid, true);
    assert.equal(factor.pitchLabel, "factor 1.2500");
    assert.equal(factor.pitchFactor, 1.25);
    assert.equal(factor.surfaceSqFt, 1200 * 1.25);
  });

  it("prices adjusted squares only when a price is entered", () => {
    const priced = input({ pricePerSquare: 100, wastePercent: 10, presetId: "flat" });
    assert.equal(priced.valid, true);
    assert.equal(priced.pitchFactor, 1);
    assert.equal(priced.surfaceSqFt, 1200);
    assert.equal(priced.squares, 12);
    assert.ok(Math.abs((priced.adjustedSquares ?? 0) - 13.2) < 1e-9);
    assert.ok(Math.abs((priced.materialCost ?? 0) - 1320) < 1e-6);
    assert.equal(formatMoney(priced.materialCost ?? 0), "$1,320.00");

    const blank = input({ pricePerSquare: null });
    assert.equal(blank.materialCost, null);

    const zero = input({ pricePerSquare: 0, presetId: "flat" });
    assert.equal(zero.valid, true);
    assert.equal(zero.materialCost, 0);
  });

  it("keeps a flat roof equal to the plan area", () => {
    const result = input({ presetId: "flat", wastePercent: 0 });
    assert.equal(result.pitchLabel, "Flat (0/12)");
    assert.equal(result.pitchFactor, 1);
    assert.equal(result.surfaceSqFt, 1200);
    assert.equal(result.squares, 12);
    assert.equal(result.adjustedSquares, 12);
  });
});

describe("parseAmount", () => {
  it("accepts commas and rejects empty input", () => {
    assert.equal(parseAmount("1,200"), 1200);
    assert.equal(parseAmount("1,200.5"), 1200.5);
    assert.equal(parseAmount(" 10 "), 10);
    assert.equal(Number.isNaN(parseAmount("")), true);
    assert.equal(Number.isNaN(parseAmount("   ")), true);
  });
});

describe("calculateRoofing validation", () => {
  it("rejects non-positive area and out-of-range pitch, waste, or price", () => {
    assert.equal(input({ lengthFt: 0 }).valid, false);
    assert.equal(input({ widthFt: -4 }).status, "value_required");
    assert.equal(input({ mode: "plan", planSqFt: 0 }).valid, false);
    assert.equal(input({ pitchMode: "rise", rise: -1 }).valid, false);
    assert.equal(input({ pitchMode: "rise", rise: 25 }).valid, false);
    assert.equal(input({ pitchMode: "factor", pitchFactor: 0.9 }).valid, false);
    assert.equal(input({ wastePercent: -1 }).valid, false);
    assert.equal(input({ wastePercent: 101 }).valid, false);
    assert.equal(input({ pricePerSquare: -5 }).valid, false);
    assert.equal(input({ lengthFt: Number.NaN }).status, "invalid");
    assert.match(input({ lengthFt: Number.NaN }).error ?? "", /greater than 0/);
  });

  it("rejects unknown modes without throwing and ignores unused inputs", () => {
    assert.equal(input({ mode: "circle" as RoofingInput["mode"] }).valid, false);
    assert.equal(input({ pitchMode: "degrees" as RoofingInput["pitchMode"] }).valid, false);
    assert.equal(input({ presetId: "7/12" as RoofingInput["presetId"] }).valid, false);
    assert.equal(input({ lengthFt: Number.POSITIVE_INFINITY }).status, "invalid");

    const rectangle = input({ planSqFt: Number.NaN });
    assert.equal(rectangle.valid, true);

    const plan = input({ mode: "plan", lengthFt: Number.NaN, widthFt: Number.NaN });
    assert.equal(plan.valid, true);
    assert.equal(plan.planSqFt, 1200);
  });
});

describe("FAQPage JSON-LD shape for roofing calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How do you calculate roofing squares?",
        answer:
          "Roof surface area in square feet divided by 100 is the number of roofing squares. One square is 100 square feet.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
