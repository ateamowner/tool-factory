import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  PDF_MAX_PAGE_SIDE,
  fitPdfPage,
  jpegBytesToPdf,
  pdfFileNameFromHeic,
  readJpegSize,
} from "./heic-to-pdf.ts";

function makeJpegWithSof(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(20);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  bytes[3] = 0xc0;
  bytes[4] = 0x00;
  bytes[5] = 0x0b;
  bytes[6] = 0x08;
  bytes[7] = (height >> 8) & 0xff;
  bytes[8] = height & 0xff;
  bytes[9] = (width >> 8) & 0xff;
  bytes[10] = width & 0xff;
  bytes[11] = 0x03;
  return bytes;
}

describe("heic to pdf helpers", () => {
  it("renames HEIC and HEIF files to pdf", () => {
    assert.equal(pdfFileNameFromHeic("IMG_1234.HEIC"), "IMG_1234.pdf");
    assert.equal(pdfFileNameFromHeic("holiday.heif"), "holiday.pdf");
    assert.equal(pdfFileNameFromHeic("scan.hif"), "scan.pdf");
    assert.equal(pdfFileNameFromHeic("photo"), "photo.pdf");
  });

  it("fits oversized photos onto a letter-long PDF page", () => {
    const page = fitPdfPage(4032, 3024);
    assert.equal(page.width, PDF_MAX_PAGE_SIDE);
    assert.equal(page.height, 594);
    const small = fitPdfPage(400, 300);
    assert.equal(small.width, 400);
    assert.equal(small.height, 300);
  });

  it("reads JPEG SOF dimensions and rejects non-JPEG bytes", () => {
    assert.deepEqual(readJpegSize(makeJpegWithSof(1200, 800)), { width: 1200, height: 800 });
    assert.equal(readJpegSize(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), null);
    assert.equal(readJpegSize(new Uint8Array([0xff, 0xd8, 0x00])), null);
  });

  it("wraps a JPEG in a single-page PDF", () => {
    const jpeg = makeJpegWithSof(100, 50);
    const pdf = jpegBytesToPdf(jpeg, 100, 50);
    const text = new TextDecoder("latin1").decode(pdf);
    assert.equal(text.startsWith("%PDF-1.4"), true);
    assert.equal(text.includes("/Type /Page"), true);
    assert.equal(text.includes("/Filter /DCTDecode"), true);
    assert.equal(text.includes("/MediaBox [0 0 100 50]"), true);
    assert.equal(text.includes("%%EOF"), true);
    assert.equal(text.includes(new TextDecoder("latin1").decode(jpeg)), true);
  });

  it("rejects non-JPEG payloads before writing a PDF", () => {
    assert.throws(() => jpegBytesToPdf(new Uint8Array([0x89, 0x50]), 10, 10), /not a JPEG/);
  });
});

describe("FAQPage JSON-LD shape for HEIC to PDF", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "What is a HEIC to PDF converter?",
        answer: "It turns HEIC photos into a downloadable PDF.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
