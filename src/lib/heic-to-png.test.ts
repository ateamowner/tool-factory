import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DECODE_ERROR,
  INVALID_HEIC_CONTENTS_ERROR,
  NOT_HEIC_ERROR,
  formatFileSize,
  hasHeicFtyp,
  heicValidationError,
  looksLikeHeicNameOrType,
  pngFileNameFromHeic,
  readFtypBrands,
} from "./heic-to-png.ts";
import { faqPageJsonLd } from "./faq-schema.ts";

function makeFtyp(major: string, compatible: string[] = []): Uint8Array {
  const size = 16 + compatible.length * 4;
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, size);
  bytes.set([0x66, 0x74, 0x79, 0x70], 4);
  for (let i = 0; i < 4; i += 1) bytes[8 + i] = major.charCodeAt(i);
  compatible.forEach((brand, index) => {
    for (let i = 0; i < 4; i += 1) {
      bytes[16 + index * 4 + i] = brand.charCodeAt(i);
    }
  });
  return bytes;
}

describe("heic to png helpers", () => {
  it("renames HEIC and HEIF files to png", () => {
    assert.equal(pngFileNameFromHeic("IMG_1234.HEIC"), "IMG_1234.png");
    assert.equal(pngFileNameFromHeic("holiday.heif"), "holiday.png");
    assert.equal(pngFileNameFromHeic("scan.hif"), "scan.png");
    assert.equal(pngFileNameFromHeic("photo"), "photo.png");
  });

  it("treats heic/heif names and mime types as HEIC-like", () => {
    assert.equal(looksLikeHeicNameOrType({ name: "a.HEIC", type: "" }), true);
    assert.equal(looksLikeHeicNameOrType({ name: "a.heif", type: "image/jpeg" }), true);
    assert.equal(looksLikeHeicNameOrType({ name: "a.jpg", type: "image/heic" }), true);
    assert.equal(looksLikeHeicNameOrType({ name: "a.png", type: "image/png" }), false);
  });

  it("reads ftyp brands and accepts HEIC, not AVIF or JPEG", () => {
    const iphone = makeFtyp("heic", ["mif1", "miaf"]);
    assert.deepEqual(readFtypBrands(iphone), ["heic", "mif1", "miaf"]);
    assert.equal(hasHeicFtyp(iphone), true);
    assert.equal(hasHeicFtyp(makeFtyp("mif1", ["heic"])), true);
    assert.equal(hasHeicFtyp(makeFtyp("mif1", ["miaf"])), true);
    assert.equal(hasHeicFtyp(makeFtyp("avif", ["mif1"])), false);
    assert.equal(hasHeicFtyp(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), false);
  });

  it("returns a clear error when the file is not HEIC", () => {
    assert.equal(
      heicValidationError({ name: "cat.png", type: "image/png" }, new Uint8Array([137, 80, 78, 71])),
      NOT_HEIC_ERROR,
    );
    assert.equal(
      heicValidationError({ name: "fake.heic", type: "image/heic" }, new Uint8Array([0xff, 0xd8, 0xff])),
      INVALID_HEIC_CONTENTS_ERROR,
    );
    assert.equal(
      heicValidationError({ name: "ok.heic", type: "image/heic" }, makeFtyp("heic")),
      null,
    );
    assert.equal(DECODE_ERROR.includes("could not decode"), true);
  });

  it("formats byte sizes", () => {
    assert.equal(formatFileSize(512), "512 B");
    assert.equal(formatFileSize(2048), "2.0 KB");
    assert.equal(formatFileSize(2 * 1024 * 1024), "2.0 MB");
  });
});

describe("FAQPage JSON-LD shape", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "What is a HEIC to PNG converter?",
        answer: "It turns HEIC photos into PNG files.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
