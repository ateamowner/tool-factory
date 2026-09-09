import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import { scoreRoofAlgae } from "./roof-algae-severity.ts";
import { validateSoftWashLead } from "./soft-wash-mix.ts";

describe("scoreRoofAlgae", () => {
  it("keeps no streaks at severity 1 and not a typical candidate", () => {
    const result = scoreRoofAlgae({
      coverage: "none",
      age: "20+",
      treeCover: true,
      northFace: true,
    });
    assert.equal(result.valid, true);
    assert.equal(result.severity, 1);
    assert.equal(result.typicalCandidate, false);
    assert.match(result.note ?? "", /not a diagnosis/i);
  });

  it("maps light streaks to severity 2", () => {
    const result = scoreRoofAlgae({
      coverage: "light",
      age: "0-10",
      treeCover: false,
      northFace: false,
    });
    assert.equal(result.severity, 2);
    assert.equal(result.typicalCandidate, true);
  });

  it("bumps light streaks when the roof is 20+ and both shade factors apply", () => {
    const aged = scoreRoofAlgae({
      coverage: "light",
      age: "20+",
      treeCover: false,
      northFace: false,
    });
    assert.equal(aged.severity, 3);
    const shaded = scoreRoofAlgae({
      coverage: "light",
      age: "20+",
      treeCover: true,
      northFace: true,
    });
    assert.equal(shaded.severity, 4);
  });

  it("maps bands to 3 and heavy to 4", () => {
    assert.equal(
      scoreRoofAlgae({
        coverage: "bands",
        age: "10-20",
        treeCover: false,
        northFace: false,
      }).severity,
      3,
    );
    assert.equal(
      scoreRoofAlgae({
        coverage: "heavy",
        age: "0-10",
        treeCover: false,
        northFace: false,
      }).severity,
      4,
    );
    assert.equal(
      scoreRoofAlgae({
        coverage: "bands",
        age: "20+",
        treeCover: true,
        northFace: true,
      }).severity,
      4,
    );
  });
});

describe("roof algae quote lead", () => {
  it("prefills roof as the quote surface", () => {
    const checked = validateSoftWashLead({
      name: "Alex Rivera",
      phone: "555-010-1234",
      location: "80205",
      surface: "roof",
      sqFt: 1400,
      mixGallons: null,
      source: "roof-algae-severity",
    });
    assert.equal(checked.ok, true);
    if (!checked.ok) return;
    assert.equal(checked.lead.source, "roof-algae-severity");
    assert.equal(checked.lead.surface, "roof");
  });
});

describe("FAQPage JSON-LD shape for roof algae quiz", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "Is a roof algae severity score a diagnosis?",
        answer: "No. It is an educational 1–4 appearance score, not a roof inspection.",
      },
    ]);
    assert.equal(data["@type"], "FAQPage");
  });
});
