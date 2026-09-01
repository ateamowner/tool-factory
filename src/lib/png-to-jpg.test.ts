import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  DECODE_ERROR,
  INVALID_PNG_CONTENTS_ERROR,
  JPEG_QUALITY,
  NOT_PNG_ERROR,
  formatFileSize,
  hasPngSignature,
  jpgFileNameFromPng,
  looksLikePngNameOrType,
  pngValidationError,
} from "./png-to-jpg.ts";

const PNG_HEADER = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);

describe("png to jpg helpers", () => {
  it("renames PNG files to jpg", () => {
    assert.equal(jpgFileNameFromPng("photo.PNG"), "photo.jpg");
    assert.equal(jpgFileNameFromPng("holiday.png"), "holiday.jpg");
    assert.equal(jpgFileNameFromPng("scan"), "scan.jpg");
  });

  it("treats png names and mime types as PNG-like", () => {
    assert.equal(looksLikePngNameOrType({ name: "a.PNG", type: "" }), true);
    assert.equal(looksLikePngNameOrType({ name: "a.png", type: "image/jpeg" }), true);
    assert.equal(looksLikePngNameOrType({ name: "a.jpg", type: "image/png" }), true);
    assert.equal(looksLikePngNameOrType({ name: "a.jpg", type: "image/jpeg" }), false);
  });

  it("accepts the PNG signature and rejects JPEG bytes", () => {
    assert.equal(hasPngSignature(PNG_HEADER), true);
    assert.equal(hasPngSignature(JPEG_HEADER), false);
    assert.equal(hasPngSignature(new Uint8Array([0x89, 0x50])), false);
  });

  it("returns a clear error when the file is not PNG", () => {
    assert.equal(
      pngValidationError({ name: "cat.jpg", type: "image/jpeg" }, JPEG_HEADER),
      NOT_PNG_ERROR,
    );
    assert.equal(
      pngValidationError({ name: "fake.png", type: "image/png" }, JPEG_HEADER),
      INVALID_PNG_CONTENTS_ERROR,
    );
    assert.equal(
      pngValidationError({ name: "ok.png", type: "image/png" }, PNG_HEADER),
      null,
    );
    assert.equal(DECODE_ERROR.includes("could not decode"), true);
    assert.equal(JPEG_QUALITY > 0 && JPEG_QUALITY <= 1, true);
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
        question: "What is a PNG to JPG converter?",
        answer: "It turns PNG images into JPG files.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
