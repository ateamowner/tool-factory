import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  EMPTY_WORKBOOK_ERROR,
  INVALID_EXCEL_CONTENTS_ERROR,
  NOT_EXCEL_ERROR,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PARSE_ERROR,
  cellToText,
  excelValidationError,
  hasExcelSignature,
  looksLikeExcelNameOrType,
  normalizeSheets,
  parseExcelBytes,
  pdfFileNameFromExcel,
  sheetsToPdf,
} from "./excel-to-pdf.ts";

const XLSX_MAGIC = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
const XLS_MAGIC = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

describe("excel to pdf helpers", () => {
  it("renames xlsx and xls files to pdf", () => {
    assert.equal(pdfFileNameFromExcel("Q1-report.XLSX"), "Q1-report.pdf");
    assert.equal(pdfFileNameFromExcel("legacy.xls"), "legacy.pdf");
    assert.equal(pdfFileNameFromExcel("export"), "export.pdf");
  });

  it("treats excel names and mime types as Excel-like", () => {
    assert.equal(looksLikeExcelNameOrType({ name: "a.XLSX", type: "" }), true);
    assert.equal(looksLikeExcelNameOrType({ name: "a.xls", type: "text/plain" }), true);
    assert.equal(
      looksLikeExcelNameOrType({
        name: "a.bin",
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      true,
    );
    assert.equal(looksLikeExcelNameOrType({ name: "a.png", type: "image/png" }), false);
  });

  it("accepts ZIP and OLE signatures and rejects JPEG", () => {
    assert.equal(hasExcelSignature(XLSX_MAGIC), true);
    assert.equal(hasExcelSignature(XLS_MAGIC), true);
    assert.equal(hasExcelSignature(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), false);
  });

  it("returns a clear error when the file is not Excel", () => {
    assert.equal(
      excelValidationError({ name: "cat.png", type: "image/png" }, new Uint8Array([137, 80, 78, 71])),
      NOT_EXCEL_ERROR,
    );
    assert.equal(
      excelValidationError({ name: "fake.xlsx", type: "" }, new Uint8Array([0xff, 0xd8, 0xff])),
      INVALID_EXCEL_CONTENTS_ERROR,
    );
    assert.equal(excelValidationError({ name: "ok.xlsx", type: "" }, XLSX_MAGIC), null);
    assert.equal(PARSE_ERROR.includes("could not read"), true);
  });

  it("stringifies cells and drops empty sheets", () => {
    assert.equal(cellToText(true), "TRUE");
    assert.equal(cellToText(12.5), "12.5");
    assert.equal(cellToText("a\nb"), "a b");
    const sheets = normalizeSheets([
      { name: "Empty", rows: [["", ""], []] },
      { name: "Sales", rows: [["Item", "Qty"], ["Apples", 3]] },
    ]);
    assert.equal(sheets.length, 1);
    assert.equal(sheets[0]?.name, "Sales");
    assert.deepEqual(sheets[0]?.rows[1], ["Apples", "3"]);
  });

  it("writes a multi-page landscape PDF from sheet rows", () => {
    const rows = [["Name", "Amount"], ...Array.from({ length: 80 }, (_, index) => [`Row ${index + 1}`, `${index}`])];
    const pdf = sheetsToPdf([{ name: "Ledger", rows }]);
    const text = new TextDecoder("latin1").decode(pdf);
    assert.equal(text.startsWith("%PDF-1.4"), true);
    assert.equal(text.includes("/Type /Page"), true);
    assert.equal(text.includes("/BaseFont /Helvetica"), true);
    assert.equal(text.includes("Ledger"), true);
    assert.equal(text.includes("Row 1"), true);
    assert.equal(text.includes(`MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}]`), true);
    assert.equal(text.includes("%%EOF"), true);
    assert.match(text, /\/Count [2-9]/);
  });

  it("rejects a workbook with no data", () => {
    assert.throws(() => sheetsToPdf([{ name: "Blank", rows: [["", ""]] }]), new RegExp(EMPTY_WORKBOOK_ERROR));
  });

  it("parses a real .xlsx workbook into PDF text", async () => {
    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["Item", "Qty"],
      ["Widget", 4],
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Inventory");
    const bytes = new Uint8Array(XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
    const parsed = await parseExcelBytes(bytes);
    assert.equal(parsed[0]?.name, "Inventory");
    const pdf = sheetsToPdf(parsed);
    const text = new TextDecoder("latin1").decode(pdf);
    assert.equal(text.includes("Widget"), true);
    assert.equal(text.includes("Inventory"), true);
  });
});

describe("FAQPage JSON-LD shape for Excel to PDF", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "What is an Excel to PDF converter?",
        answer: "It turns .xlsx and .xls spreadsheets into a downloadable PDF.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
