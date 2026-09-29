import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  columnsFromRows,
  convertCsvToExcel,
  excelFileNameFromCsvName,
  normalizeCsvRows,
  parseCsv,
  rowsToXlsxBytes,
} from "./csv-to-excel.ts";

describe("parseCsv", () => {
  it("splits plain rows and commas", () => {
    assert.deepEqual(parseCsv("a,b\nc,d\n"), [
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("handles quoted commas, quotes, and newlines", () => {
    assert.deepEqual(parseCsv('name,note\nAda,"hello, world"\n'), [
      ["name", "note"],
      ["Ada", "hello, world"],
    ]);
    assert.deepEqual(parseCsv('a,"say ""hi"""\n'), [["a", 'say "hi"']]);
    assert.deepEqual(parseCsv('id,bio\n1,"line1\nline2"\n'), [
      ["id", "bio"],
      ["1", "line1\nline2"],
    ]);
  });

  it("accepts CRLF and a final row without newline", () => {
    assert.deepEqual(parseCsv("a,b\r\nc,d"), [
      ["a", "b"],
      ["c", "d"],
    ]);
  });
});

describe("normalizeCsvRows and columnsFromRows", () => {
  it("pads short rows and builds unique headers", () => {
    const rows = normalizeCsvRows([
      ["name", "", "name"],
      ["Ada"],
    ]);
    assert.deepEqual(rows[0], ["name", "", "name"]);
    assert.deepEqual(rows[1], ["Ada", "", ""]);
    assert.deepEqual(columnsFromRows(rows), ["name", "column_2", "name_2"]);
  });
});

describe("excelFileNameFromCsvName", () => {
  it("swaps the extension to .xlsx", () => {
    assert.equal(excelFileNameFromCsvName("export.csv"), "export.xlsx");
    assert.equal(excelFileNameFromCsvName("my data.CSV"), "my_data.xlsx");
    assert.equal(excelFileNameFromCsvName(""), "data.xlsx");
  });
});

describe("convertCsvToExcel", () => {
  it("rejects empty input", async () => {
    assert.equal((await convertCsvToExcel("")).ok, false);
    assert.equal((await convertCsvToExcel("   ")).ok, false);
  });

  it("builds an xlsx workbook from a simple table", async () => {
    const result = await convertCsvToExcel("name,age\nAda,36\nGrace,40\n");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.rowCount, 2);
    assert.equal(result.columnCount, 2);
    assert.deepEqual(result.columns, ["name", "age"]);
    assert.match(result.summary, /2 data rows/);
    // ZIP / OOXML signature
    assert.equal(result.bytes[0], 0x50);
    assert.equal(result.bytes[1], 0x4b);
    assert.ok(result.bytes.length > 100);
  });

  it("strips a UTF-8 BOM", async () => {
    const result = await convertCsvToExcel("\uFEFFa,b\n1,2\n");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.columns, ["a", "b"]);
  });

  it("writes workbook bytes that round-trip through SheetJS", async () => {
    const rows = [
      ["sku", "qty"],
      ["A-1", "3"],
      ["B-2", "9"],
    ];
    const bytes = await rowsToXlsxBytes(rows);
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(bytes, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]!]!;
    const json = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });
    assert.deepEqual(json, rows);
  });
});

describe("csv-to-excel FAQ schema", () => {
  it("builds FAQPage JSON-LD with several questions", () => {
    const faqs = [
      {
        question: "What is a CSV to Excel converter?",
        answer: "It turns comma-separated values into an .xlsx workbook.",
      },
      {
        question: "Does this upload my CSV?",
        answer: "No. Conversion runs in your browser.",
      },
      {
        question: "What file do I get?",
        answer: "A downloadable .xlsx spreadsheet you can open in Excel or Sheets.",
      },
    ];
    const ld = faqPageJsonLd(faqs);
    assert.equal(ld["@type"], "FAQPage");
    assert.equal(ld.mainEntity.length, 3);
    assert.equal(ld.mainEntity[0]?.["@type"], "Question");
  });
});
