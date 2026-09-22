import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CUBIC_FEET_PER_CUBIC_YARD,
  bagsForVolume,
  calculateCubicYards,
  cubicFeetToYards,
  cylinderCubicFeet,
  formatFeet,
  formatVolume,
  parseDimension,
  rectangleCubicFeet,
  toFeet,
  type CubicYardInput,
} from "./cubic-yard.ts";
import { faqPageJsonLd } from "./faq-schema.ts";

function input(overrides: Partial<CubicYardInput> = {}) {
  return calculateCubicYards({
    mode: "rectangle",
    length: 9,
    lengthUnit: "ft",
    width: 3,
    widthUnit: "ft",
    diameter: 6,
    diameterUnit: "ft",
    depth: 1,
    depthUnit: "ft",
    bagCubicFeet: null,
    ...overrides,
  });
}

describe("cubic yard identities", () => {
  it("uses 27 cubic feet per cubic yard and 12 inches per foot", () => {
    assert.equal(CUBIC_FEET_PER_CUBIC_YARD, 27);
    assert.equal(toFeet(12, "in"), 1);
    assert.equal(toFeet(3, "ft"), 3);
    assert.equal(toFeet(3, "in"), 0.25);
    assert.equal(rectangleCubicFeet(3, 3, 3), 27);
    assert.equal(cubicFeetToYards(27), 1);
  });

  it("converts a 9 × 3 × 1 foot rectangle to exactly 1 cubic yard", () => {
    const result = input();

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.cubicFeet, 27);
    assert.equal(result.cubicYards, 1);
    assert.equal(result.lengthFt, 9);
    assert.equal(result.widthFt, 3);
    assert.equal(result.depthFt, 1);
    assert.equal(formatVolume(result.cubicYards ?? 0, "yd³"), "1 yd³");
    assert.equal(formatVolume(result.cubicFeet ?? 0, "ft³"), "27 ft³");
  });

  it("converts inches to feet before multiplying", () => {
    const cube = input({
      length: 12,
      lengthUnit: "in",
      width: 12,
      widthUnit: "in",
      depth: 12,
      depthUnit: "in",
    });
    assert.equal(cube.valid, true);
    assert.equal(cube.cubicFeet, 1);
    assert.equal(cube.cubicYards, 1 / 27);

    const mulch = input({
      length: 10,
      lengthUnit: "ft",
      width: 120,
      widthUnit: "in",
      depth: 3,
      depthUnit: "in",
    });
    assert.equal(mulch.valid, true);
    assert.equal(mulch.lengthFt, 10);
    assert.equal(mulch.widthFt, 10);
    assert.equal(mulch.depthFt, 0.25);
    assert.equal(mulch.cubicFeet, 25);
    assert.equal(mulch.cubicYards, 25 / 27);
    assert.equal(formatFeet(0.25), "0.25 ft");
  });

  it("calculates a cylinder from diameter", () => {
    const result = input({ mode: "cylinder", diameter: 6, diameterUnit: "ft", depth: 1, depthUnit: "ft" });
    const expectedFeet = cylinderCubicFeet(6, 1);

    assert.equal(result.valid, true);
    assert.equal(result.mode, "cylinder");
    assert.equal(result.diameterFt, 6);
    assert.equal(result.lengthFt, null);
    assert.equal(result.cubicFeet, expectedFeet);
    assert.ok(Math.abs((result.cubicYards ?? 0) - expectedFeet / 27) < 1e-12);
    assert.ok(Math.abs(expectedFeet - Math.PI * 9) < 1e-12);
  });
});

describe("bagsForVolume", () => {
  it("rounds partial bags up and keeps exact bag counts", () => {
    assert.equal(bagsForVolume(25, 2), 13);
    assert.equal(bagsForVolume(4, 2), 2);
    assert.equal(bagsForVolume(0, 2), 0);

    const withBags = input({ bagCubicFeet: 2 });
    assert.equal(withBags.bags, 14);
    assert.equal(withBags.bagCubicFeet, 2);

    const skipped = input({ bagCubicFeet: null });
    assert.equal(skipped.bags, null);
  });
});

describe("parseDimension", () => {
  it("accepts commas and rejects empty input", () => {
    assert.equal(parseDimension("1,000"), 1000);
    assert.equal(parseDimension("1,000.5"), 1000.5);
    assert.equal(parseDimension(" 12 "), 12);
    assert.equal(Number.isNaN(parseDimension("")), true);
    assert.equal(Number.isNaN(parseDimension("   ")), true);
  });
});

describe("calculateCubicYards validation", () => {
  it("accepts zero dimensions", () => {
    const result = input({ depth: 0 });
    assert.equal(result.valid, true);
    assert.equal(result.cubicYards, 0);
    assert.equal(result.cubicFeet, 0);
  });

  it("rejects negative dimensions", () => {
    const depth = input({ depth: -1 });
    assert.equal(depth.valid, false);
    assert.equal(depth.status, "value_required");
    assert.match(depth.error ?? "", /0 or more/);

    const length = input({ length: -2 });
    assert.equal(length.valid, false);
    assert.equal(length.status, "value_required");

    const diameter = input({ mode: "cylinder", diameter: -4 });
    assert.equal(diameter.valid, false);
    assert.equal(diameter.status, "value_required");
  });

  it("rejects empty, infinite, and unknown modes without throwing", () => {
    assert.equal(input({ length: Number.NaN }).valid, false);
    assert.equal(input({ width: Number.POSITIVE_INFINITY }).status, "invalid");
    assert.equal(input({ depth: Number.NEGATIVE_INFINITY }).valid, false);
    assert.equal(input({ mode: "sphere" as CubicYardInput["mode"] }).valid, false);
    assert.equal(input({ lengthUnit: "cm" as CubicYardInput["lengthUnit"] }).valid, false);
  });

  it("rejects a non-positive bag size and ignores unused shape inputs", () => {
    const bags = input({ bagCubicFeet: -2 });
    assert.equal(bags.valid, false);
    assert.equal(bags.status, "value_required");

    const zeroBag = input({ bagCubicFeet: 0 });
    assert.equal(zeroBag.valid, false);

    const blankBag = input({ bagCubicFeet: Number.NaN });
    assert.equal(blankBag.valid, false);

    const rectangle = input({ diameter: Number.NaN });
    assert.equal(rectangle.valid, true);

    const cylinder = input({ mode: "cylinder", length: Number.NaN, width: Number.NaN });
    assert.equal(cylinder.valid, true);
  });
});

describe("FAQPage JSON-LD shape for cubic yard calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How do I calculate cubic yards?",
        answer:
          "Convert length, width, and depth to feet, multiply them, and divide by 27. One cubic yard is 27 cubic feet.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
