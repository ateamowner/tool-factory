import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  ROOF_PITCH_BUMP_FACTOR,
  WALL_HEIGHT_FT_PER_STORY,
  estimateHouseSqFt,
  resolveFootprint,
  resolveRectangleSides,
} from "./house-sq-ft.ts";
import { validateSoftWashLead } from "./soft-wash-mix.ts";

describe("resolveFootprint", () => {
  it("uses L×W or an entered footprint", () => {
    assert.equal(
      resolveFootprint({
        mode: "dimensions",
        lengthFt: 40,
        widthFt: 30,
        footprintSqFt: 9999,
      }),
      1200,
    );
    assert.equal(
      resolveFootprint({
        mode: "footprint",
        lengthFt: 40,
        widthFt: 30,
        footprintSqFt: 1600,
      }),
      1600,
    );
    assert.equal(
      resolveFootprint({
        mode: "dimensions",
        lengthFt: 0,
        widthFt: 30,
        footprintSqFt: 1600,
      }),
      null,
    );
  });
});

describe("resolveRectangleSides", () => {
  it("treats a footprint-only input as a square", () => {
    const sides = resolveRectangleSides({
      mode: "footprint",
      lengthFt: 0,
      widthFt: 0,
      footprintSqFt: 1600,
    });
    assert.equal(sides?.lengthFt, 40);
    assert.equal(sides?.widthFt, 40);
  });
});

describe("estimateHouseSqFt", () => {
  it("estimates walls as 2 × (L + W) × 9 ft × stories", () => {
    const result = estimateHouseSqFt({
      mode: "dimensions",
      lengthFt: 40,
      widthFt: 30,
      footprintSqFt: 0,
      stories: 1,
      target: "walls",
      pitchBump: false,
    });
    assert.equal(result.valid, true);
    assert.equal(result.wallSqFt, 2 * (40 + 30) * WALL_HEIGHT_FT_PER_STORY * 1);
    assert.equal(result.estimateSqFt, result.wallSqFt);
    assert.equal(result.quoteSurface, "siding");
    assert.match(result.methodLabel ?? "", /2 × \(L \+ W\)/);
  });

  it("doubles wall height for two stories and leaves roof as the footprint", () => {
    const result = estimateHouseSqFt({
      mode: "dimensions",
      lengthFt: 40,
      widthFt: 20,
      footprintSqFt: 0,
      stories: 2,
      target: "roof",
      pitchBump: false,
    });
    assert.equal(result.wallSqFt, 2 * (40 + 20) * WALL_HEIGHT_FT_PER_STORY * 2);
    assert.equal(result.roofSqFt, 800);
    assert.equal(result.estimateSqFt, 800);
    assert.equal(result.quoteSurface, "roof");
  });

  it("applies an educational 6/12 pitch bump on roof mode", () => {
    const result = estimateHouseSqFt({
      mode: "footprint",
      lengthFt: 0,
      widthFt: 0,
      footprintSqFt: 1000,
      stories: 1,
      target: "roof",
      pitchBump: true,
    });
    assert.equal(result.valid, true);
    assert.equal(result.roofSqFt, Math.round(1000 * ROOF_PITCH_BUMP_FACTOR * 10) / 10);
    assert.match(result.methodLabel ?? "", /6\/12/);
  });

  it("rejects missing size", () => {
    assert.equal(
      estimateHouseSqFt({
        mode: "dimensions",
        lengthFt: 0,
        widthFt: 20,
        footprintSqFt: 0,
        stories: 1,
        target: "walls",
        pitchBump: false,
      }).valid,
      false,
    );
  });
});

describe("house estimator quote lead", () => {
  it("prefills siding from a wall estimate source", () => {
    const checked = validateSoftWashLead({
      name: "Alex Rivera",
      phone: "555-010-1234",
      location: "80205",
      surface: "siding",
      sqFt: 1260,
      mixGallons: null,
      source: "house-sq-ft-estimator",
    });
    assert.equal(checked.ok, true);
    if (!checked.ok) return;
    assert.equal(checked.lead.source, "house-sq-ft-estimator");
    assert.equal(checked.lead.surface, "siding");
  });
});

describe("FAQPage JSON-LD shape for house sq-ft estimator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How do you estimate house wall square footage?",
        answer:
          "A common educational estimate is 2 × (length + width) × wall height × stories.",
      },
    ]);
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
  });
});
