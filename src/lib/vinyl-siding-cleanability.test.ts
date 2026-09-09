import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import { scoreVinylCleanability } from "./vinyl-siding-cleanability.ts";
import { validateSoftWashLead } from "./soft-wash-mix.ts";

describe("scoreVinylCleanability", () => {
  it("scores vinyl plus algae as a good educational fit", () => {
    const result = scoreVinylCleanability({
      siding: "vinyl",
      soil: "algae",
      age: "10-20",
      shade: true,
    });
    assert.equal(result.valid, true);
    assert.equal(result.fit, "good");
    assert.match(result.why ?? "", /Algae on vinyl/);
    assert.match(result.why ?? "", /Shade/);
  });

  it("treats vinyl oxidation as caution, not a color-restore promise", () => {
    const result = scoreVinylCleanability({
      siding: "vinyl",
      soil: "oxidation",
      age: "10-20",
      shade: false,
    });
    assert.equal(result.fit, "caution");
    assert.match(result.why ?? "", /Chalking/);
  });

  it("cautions older vinyl with ordinary dirt", () => {
    const result = scoreVinylCleanability({
      siding: "vinyl",
      soil: "dirt",
      age: "20+",
      shade: false,
    });
    assert.equal(result.fit, "caution");
  });

  it("scores newer vinyl dirt as good", () => {
    const result = scoreVinylCleanability({
      siding: "vinyl",
      soil: "dirt",
      age: "0-10",
      shade: false,
    });
    assert.equal(result.fit, "good");
  });

  it("keeps fiber cement at caution", () => {
    const result = scoreVinylCleanability({
      siding: "fiber-cement",
      soil: "algae",
      age: "0-10",
      shade: true,
    });
    assert.equal(result.fit, "caution");
    assert.match(result.why ?? "", /Fiber-cement/);
  });

  it("skips wood as a typical SH soft-wash surface", () => {
    const result = scoreVinylCleanability({
      siding: "wood",
      soil: "algae",
      age: "10-20",
      shade: true,
    });
    assert.equal(result.fit, "skip");
    assert.match(result.why ?? "", /Wood is not a typical/);
  });

  it("cautions unknown cladding", () => {
    assert.equal(
      scoreVinylCleanability({
        siding: "other",
        soil: "dirt",
        age: "10-20",
        shade: false,
      }).fit,
      "caution",
    );
  });
});

describe("vinyl cleanability quote lead", () => {
  it("prefills siding as the quote surface", () => {
    const checked = validateSoftWashLead({
      name: "Alex Rivera",
      phone: "555-010-1234",
      location: "Denver",
      surface: "siding",
      sqFt: 1800,
      mixGallons: null,
      source: "vinyl-siding-cleanability",
    });
    assert.equal(checked.ok, true);
    if (!checked.ok) return;
    assert.equal(checked.lead.source, "vinyl-siding-cleanability");
    assert.equal(checked.lead.surface, "siding");
  });
});

describe("FAQPage JSON-LD shape for vinyl cleanability", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "What does a vinyl siding cleanability score mean?",
        answer: "It is an educational fit label: good, caution, or skip.",
      },
    ]);
    assert.equal(data["@type"], "FAQPage");
  });
});
