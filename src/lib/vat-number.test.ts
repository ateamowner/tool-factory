import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  detectCountryCode,
  getVatCountry,
  normalizeVatInput,
  validateVatNumber,
} from "./vat-number.ts";

describe("normalizeVatInput", () => {
  it("strips spaces, dots, and dashes and uppercases the ID", () => {
    assert.equal(normalizeVatInput(" de 136.695-976 "), "DE136695976");
    assert.equal(normalizeVatInput("FR 40 303 265 045"), "FR40303265045");
    assert.equal(normalizeVatInput("IE8Y39423K"), "IE8Y39423K");
  });
});

describe("detectCountryCode", () => {
  it("reads the prefix and maps GR to EL", () => {
    assert.equal(detectCountryCode("DE136695976"), "DE");
    assert.equal(detectCountryCode("GR094259216"), "EL");
    assert.equal(detectCountryCode("136695976"), null);
  });
});

describe("getVatCountry", () => {
  it("resolves EU members and the GB alias", () => {
    assert.equal(getVatCountry("de")?.name, "Germany");
    assert.equal(getVatCountry("GR")?.code, "EL");
    assert.equal(getVatCountry("GB")?.legacy, true);
    assert.equal(getVatCountry("US"), undefined);
  });
});

describe("validateVatNumber", () => {
  it("accepts public check-digit examples for the documented countries", () => {
    const valid = [
      ["DE136695976", "DE"],
      ["ATU13585627", "AT"],
      ["BE0428759497", "BE"],
      ["FR40303265045", "FR"],
      ["NL123456782B01", "NL"],
      ["ESA13585625", "ES"],
      ["ES12345678Z", "ES"],
      ["IT00000010215", "IT"],
      ["PL5260001246", "PL"],
      ["SE556188840401", "SE"],
      ["DK13585628", "DK"],
      ["FI13669598", "FI"],
      ["IE6433435F", "IE"],
      ["PT501964843", "PT"],
    ] as const;

    for (const [vatNumber, countryCode] of valid) {
      const result = validateVatNumber({ vatNumber });
      assert.equal(result.valid, true, vatNumber);
      assert.equal(result.countryCode, countryCode);
      assert.equal(result.checkDigitVerified, true);
      assert.equal(result.normalized, vatNumber);
      assert.match(result.reason, /does not confirm the number is registered/i);
    }
  });

  it("normalizes punctuation, a missing AT U, a 9-digit BE number, and GR", () => {
    assert.equal(validateVatNumber({ vatNumber: "de 136.695-976" }).normalized, "DE136695976");
    assert.equal(validateVatNumber({ vatNumber: "AT13585627" }).normalized, "ATU13585627");
    assert.equal(validateVatNumber({ vatNumber: "BE428759497" }).normalized, "BE0428759497");
    assert.equal(validateVatNumber({ vatNumber: "GR094259216" }).normalized, "EL094259216");
    assert.equal(validateVatNumber({ vatNumber: "IE6433435OA" }).valid, true);
  });

  it("uses the country selector when the prefix is omitted", () => {
    const result = validateVatNumber({ vatNumber: "136695976", countryCode: "DE" });
    assert.equal(result.valid, true);
    assert.equal(result.normalized, "DE136695976");
    assert.equal(result.countryName, "Germany");
  });

  it("rejects a prefix that does not match the selected country", () => {
    const result = validateVatNumber({ vatNumber: "DE136695976", countryCode: "FR" });
    assert.equal(result.valid, false);
    assert.match(result.reason, /starts with DE, but FR is selected/);
  });

  it("explains empty input, a missing country, a bad length, and a bad check digit", () => {
    assert.equal(validateVatNumber({ vatNumber: "   " }).valid, false);
    assert.match(validateVatNumber({ vatNumber: "   " }).reason, /Enter a VAT number/);

    const noCountry = validateVatNumber({ vatNumber: "136695976" });
    assert.equal(noCountry.valid, false);
    assert.match(noCountry.reason, /country prefix/);

    const shortDe = validateVatNumber({ vatNumber: "DE13669597" });
    assert.equal(shortDe.valid, false);
    assert.match(shortDe.reason, /9 digits/);

    const badCheck = validateVatNumber({ vatNumber: "DE136695975" });
    assert.equal(badCheck.valid, false);
    assert.match(badCheck.reason, /check digit/i);
    assert.equal(badCheck.normalized, "DE136695975");
    assert.equal(badCheck.countryCode, "DE");
  });

  it("accepts fallback country patterns and legacy GB formats", () => {
    assert.equal(validateVatNumber({ vatNumber: "EL094259216" }).valid, true);
    assert.equal(validateVatNumber({ vatNumber: "HU12892312" }).valid, true);
    assert.equal(validateVatNumber({ vatNumber: "LV40003009497" }).valid, true);
    assert.equal(validateVatNumber({ vatNumber: "LV40003009497" }).checkDigitVerified, false);
    assert.equal(validateVatNumber({ vatNumber: "GB980780684" }).valid, true);
    assert.equal(validateVatNumber({ vatNumber: "XI980780684" }).valid, true);
    assert.equal(validateVatNumber({ vatNumber: "GBGD001" }).valid, true);
    assert.equal(validateVatNumber({ vatNumber: "SK2022749619" }).valid, true);
  });

  it("rejects an unknown selected country", () => {
    const result = validateVatNumber({ vatNumber: "123", countryCode: "US" });
    assert.equal(result.valid, false);
    assert.match(result.reason, /EU member/);
  });
});

describe("FAQPage JSON-LD shape for VAT number validator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "What is a VAT number validator?",
        answer:
          "A VAT number validator — also used as a VAT number checker — checks EU VAT ID format and public check digits in your browser.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
