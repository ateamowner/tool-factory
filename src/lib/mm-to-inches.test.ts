import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  MM_PER_INCH,
  convertMmInches,
  formatInchFraction,
  formatLength,
  inchesToMm,
  inchesToNearestFraction,
  mmToInches,
  type MmToInchesInput,
} from "./mm-to-inches.ts";

function input(overrides: Partial<MmToInchesInput> = {}) {
  return convertMmInches({
    mode: "mm_to_in",
    millimeters: 25.4,
    inches: 1,
    ...overrides,
  });
}

describe("international inch identities", () => {
  it("uses exactly 25.4 millimeters per inch", () => {
    assert.equal(MM_PER_INCH, 25.4);
    assert.equal(mmToInches(25.4), 1);
    assert.equal(inchesToMm(1), 25.4);
    assert.equal(mmToInches(12.7), 0.5);
    assert.equal(inchesToMm(2), 50.8);
  });

  it("round-trips millimeters through inches", () => {
    assert.equal(inchesToMm(mmToInches(10)), 10);
    assert.equal(mmToInches(inchesToMm(3.5)), 3.5);
  });
});

describe("formatLength", () => {
  it("keeps whole values without trailing zeros", () => {
    assert.equal(formatLength(1, "in"), "1 in");
    assert.equal(formatLength(25.4, "mm"), "25.40 mm");
  });

  it("shows up to six decimals for repeating values", () => {
    assert.equal(formatLength(mmToInches(10), "in"), "0.393701 in");
  });
});

describe("inchesToNearestFraction", () => {
  it("reduces exact halves, quarters, and eighths", () => {
    assert.deepEqual(inchesToNearestFraction(0.5), {
      whole: 0,
      numerator: 1,
      denominator: 2,
      remainderInches: 0,
      label: "1/2 in",
    });
    assert.equal(inchesToNearestFraction(1.25).label, "1 1/4 in");
    assert.equal(inchesToNearestFraction(2).label, "2 in");
    assert.equal(formatInchFraction(inchesToNearestFraction(0.125)), "1/8 in");
  });

  it("rounds 10 mm to the nearest 1/64 inch", () => {
    const fraction = inchesToNearestFraction(mmToInches(10));
    assert.equal(fraction.label, "25/64 in");
    assert.ok(Math.abs(fraction.remainderInches) < 0.01);
  });
});

describe("convertMmInches", () => {
  it("converts millimeters to decimal and fractional inches", () => {
    const result = input();

    assert.equal(result.valid, true);
    assert.equal(result.status, "ok");
    assert.equal(result.mode, "mm_to_in");
    assert.equal(result.millimeters, 25.4);
    assert.equal(result.inches, 1);
    assert.equal(result.fraction?.label, "1 in");
  });

  it("converts inches back to millimeters", () => {
    const result = input({ mode: "in_to_mm", inches: 2 });

    assert.equal(result.valid, true);
    assert.equal(result.mode, "in_to_mm");
    assert.equal(result.inches, 2);
    assert.equal(result.millimeters, 50.8);
    assert.equal(result.fraction?.label, "2 in");
  });

  it("accepts zero", () => {
    const fromMm = input({ millimeters: 0 });
    assert.equal(fromMm.valid, true);
    assert.equal(fromMm.inches, 0);
    assert.equal(fromMm.fraction?.label, "0 in");

    const fromIn = input({ mode: "in_to_mm", inches: 0 });
    assert.equal(fromIn.valid, true);
    assert.equal(fromIn.millimeters, 0);
  });

  it("rejects negative lengths", () => {
    const fromMm = input({ millimeters: -1 });
    assert.equal(fromMm.valid, false);
    assert.equal(fromMm.status, "value_required");
    assert.match(fromMm.error ?? "", /0 or more/);

    const fromIn = input({ mode: "in_to_mm", inches: -0.5 });
    assert.equal(fromIn.valid, false);
    assert.equal(fromIn.status, "value_required");
  });

  it("does not throw on nonsense inputs", () => {
    assert.equal(input({ millimeters: Number.NaN }).valid, false);
    assert.equal(input({ mode: "in_to_mm", inches: Number.POSITIVE_INFINITY }).valid, false);
    assert.equal(input({ mode: "not-a-mode" as MmToInchesInput["mode"] }).valid, false);
  });
});

describe("FAQPage JSON-LD shape for mm to inches calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How do I convert millimeters to inches?",
        answer:
          "Divide millimeters by 25.4. 25.4 mm is exactly 1 inch. The page also converts inches back to millimeters.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
