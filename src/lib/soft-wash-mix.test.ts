import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  SURFACE_PRESETS,
  buildSoftWashLeadMailto,
  computeSoftWashMix,
  formatSoftWashLeadText,
  readStoredSoftWashLeads,
  resolveWashArea,
  shRangeLabel,
  targetShPercent,
  validateSoftWashLead,
} from "./soft-wash-mix.ts";

describe("soft wash mix targets", () => {
  it("uses typical pro SH ranges and bumps heavy soil one step", () => {
    assert.equal(targetShPercent("siding", "light"), 0.5);
    assert.equal(targetShPercent("siding", "medium"), 0.75);
    assert.equal(targetShPercent("siding", "heavy"), 1);
    assert.equal(targetShPercent("roof", "medium"), 12);
    assert.equal(targetShPercent("roof", "heavy"), 12.5);
    assert.equal(targetShPercent("concrete", "light"), 4);
    assert.equal(targetShPercent("concrete", "heavy"), 6);
    assert.equal(targetShPercent("fence", "light"), 0.5);
    assert.equal(targetShPercent("fence", "heavy"), 1);
    assert.equal(SURFACE_PRESETS.fence.shLow, SURFACE_PRESETS.siding.shLow);
    assert.equal(SURFACE_PRESETS.fence.shHigh, SURFACE_PRESETS.siding.shHigh);
    assert.equal(shRangeLabel("siding"), "0.5%–1% typical pro range");
    assert.equal(shRangeLabel("roof"), "10%–12.5% typical pro range");
  });
});

describe("resolveWashArea", () => {
  it("uses entered square feet, or L×W times optional stories", () => {
    assert.equal(
      resolveWashArea({
        mode: "sqft",
        sqFt: 1800,
        lengthFt: 40,
        widthFt: 20,
        stories: 2,
      }),
      1800,
    );
    assert.equal(
      resolveWashArea({
        mode: "dimensions",
        sqFt: 1800,
        lengthFt: 40,
        widthFt: 20,
        stories: null,
      }),
      800,
    );
    assert.equal(
      resolveWashArea({
        mode: "dimensions",
        sqFt: 0,
        lengthFt: 40,
        widthFt: 20,
        stories: 2,
      }),
      1600,
    );
    assert.equal(
      resolveWashArea({
        mode: "sqft",
        sqFt: 0,
        lengthFt: 40,
        widthFt: 20,
        stories: 1,
      }),
      null,
    );
  });
});

describe("computeSoftWashMix", () => {
  it("splits water and bleach to a siding target and adds surfactant", () => {
    const result = computeSoftWashMix({
      surface: "siding",
      areaSqFt: 2000,
      soil: "medium",
      stockShPercent: 12.5,
      surfactantOzPerGal: 1.5,
    });

    assert.equal(result.valid, true);
    assert.equal(result.targetShPercent, 0.75);
    assert.equal(result.mixGallons, 10);
    assert.equal(result.bleachGallons, 0.6);
    assert.equal(result.waterGallons, 9.4);
    assert.equal(result.surfactantOz, 15);
    assert.match(result.dwellTip ?? "", /5–10 minutes/);
  });

  it("uses a ~12% roof target and more mix per square foot", () => {
    const result = computeSoftWashMix({
      surface: "roof",
      areaSqFt: 1500,
      soil: "medium",
      stockShPercent: 12.5,
      surfactantOzPerGal: 2,
    });

    assert.equal(result.valid, true);
    assert.equal(result.targetShPercent, 12);
    assert.equal(result.mixGallons, 15);
    assert.equal(result.bleachGallons, 14.4);
    assert.equal(result.waterGallons, 0.6);
    assert.equal(result.surfactantOz, 30);
  });

  it("rejects stock SH weaker than the target mix", () => {
    const result = computeSoftWashMix({
      surface: "roof",
      areaSqFt: 1000,
      soil: "heavy",
      stockShPercent: 6,
      surfactantOzPerGal: 1.5,
    });

    assert.equal(result.valid, false);
    assert.match(result.error ?? "", /Stock SH is weaker/);
    assert.equal(result.mixGallons, null);
  });

  it("rejects missing area and negative surfactant", () => {
    assert.equal(
      computeSoftWashMix({
        surface: "concrete",
        areaSqFt: 0,
        soil: "light",
        stockShPercent: 12.5,
        surfactantOzPerGal: 1.5,
      }).valid,
      false,
    );
    assert.equal(
      computeSoftWashMix({
        surface: "concrete",
        areaSqFt: 400,
        soil: "light",
        stockShPercent: 12.5,
        surfactantOzPerGal: -1,
      }).valid,
      false,
    );
  });
});

describe("soft wash quote lead", () => {
  it("validates required quote fields and formats a reviewable payload", () => {
    const checked = validateSoftWashLead({
      name: "Alex Rivera",
      phone: "555-010-1234",
      location: "80205",
      surface: "siding",
      sqFt: 2000,
      mixGallons: 10,
      source: "soft-wash-mix-calculator",
    });
    assert.equal(checked.ok, true);
    if (!checked.ok) return;
    assert.equal(checked.lead.source, "soft-wash-mix-calculator");
    assert.match(formatSoftWashLeadText(checked.lead), /ZIP\/city: 80205/);
    assert.match(formatSoftWashLeadText(checked.lead), /Mix gallons \(estimate\): 10 gal/);
    assert.match(buildSoftWashLeadMailto(checked.lead), /^mailto:\?subject=/);
  });

  it("rejects short names, thin phone numbers, and honeypot fills", () => {
    assert.equal(
      validateSoftWashLead({
        name: "A",
        phone: "555-010-1234",
        location: "Denver",
        surface: "roof",
        sqFt: 900,
        mixGallons: null,
        source: "soft-wash-mix-calculator",
      }).ok,
      false,
    );
    assert.equal(
      validateSoftWashLead({
        name: "Alex",
        phone: "555",
        location: "Denver",
        surface: "roof",
        sqFt: 900,
        mixGallons: null,
        source: "soft-wash-mix-calculator",
      }).ok,
      false,
    );
    assert.equal(
      validateSoftWashLead({
        name: "Alex",
        phone: "555-010-1234",
        location: "Denver",
        surface: "roof",
        sqFt: 900,
        mixGallons: null,
        source: "soft-wash-mix-calculator",
        honeypot: "http://spam.example",
      }).ok,
      false,
    );
  });

  it("reads stored leads and ignores junk", () => {
    const stored = readStoredSoftWashLeads(
      JSON.stringify([
        {
          name: "Alex",
          phone: "5550101234",
          location: "80205",
          surface: "fence",
          sqFt: 400,
          mixGallons: 2.29,
          source: "soft-wash-mix-calculator",
        },
        { name: "Nope" },
      ]),
    );
    assert.equal(stored.length, 1);
    assert.equal(stored[0]?.surface, "fence");
    assert.deepEqual(readStoredSoftWashLeads("not-json"), []);
  });
});

describe("FAQPage JSON-LD shape for soft wash mix calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "How does a soft wash mix calculator work?",
        answer:
          "It estimates mix gallons from area and a typical coverage rate, then splits bleach and water to a target SH percent.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
  });
});
