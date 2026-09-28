import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  cellFromValue,
  convertJsonToCsv,
  csvFileNameFromJsonName,
  escapeCsvCell,
  jsonValueToCsv,
} from "./json-to-csv.ts";

describe("escapeCsvCell", () => {
  it("quotes commas, quotes, and newlines", () => {
    assert.equal(escapeCsvCell("plain"), "plain");
    assert.equal(escapeCsvCell("a,b"), '"a,b"');
    assert.equal(escapeCsvCell('say "hi"'), '"say ""hi"""');
    assert.equal(escapeCsvCell("line1\nline2"), '"line1\nline2"');
  });
});

describe("cellFromValue", () => {
  it("stringifies nested values and blanks nullish", () => {
    assert.equal(cellFromValue(null), "");
    assert.equal(cellFromValue(undefined), "");
    assert.equal(cellFromValue("ok"), "ok");
    assert.equal(cellFromValue(12.5), "12.5");
    assert.equal(cellFromValue(true), "true");
    assert.equal(cellFromValue({ a: 1 }), '{"a":1}');
    assert.equal(cellFromValue([1, 2]), "[1,2]");
  });
});

describe("convertJsonToCsv", () => {
  it("rejects empty and invalid JSON", () => {
    assert.equal(convertJsonToCsv("").ok, false);
    assert.equal(convertJsonToCsv("   ").ok, false);
    const bad = convertJsonToCsv("{not json");
    assert.equal(bad.ok, false);
    if (!bad.ok) assert.match(bad.error, /parse/i);
  });

  it("rejects bare primitives", () => {
    const result = convertJsonToCsv("42");
    assert.equal(result.ok, false);
  });

  it("converts an array of objects with stable column order", () => {
    const result = convertJsonToCsv(
      JSON.stringify([
        { name: "Ada", age: 36 },
        { name: "Grace", city: "NYC", age: 40 },
      ]),
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.columns, ["name", "age", "city"]);
    assert.equal(result.rowCount, 2);
    assert.equal(result.columnCount, 3);
    assert.equal(
      result.csv,
      "name,age,city\nAda,36,\nGrace,40,NYC\n",
    );
    assert.match(result.summary, /2 rows/);
  });

  it("converts a single object to one data row", () => {
    const result = convertJsonToCsv(JSON.stringify({ id: 1, label: "a,b" }));
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.rowCount, 1);
    assert.equal(result.csv, 'id,label\n1,"a,b"\n');
  });

  it("uses the first string row as headers for array-of-arrays", () => {
    const result = convertJsonToCsv(
      JSON.stringify([
        ["sku", "qty"],
        ["A-1", 3],
        ["B-2", 9],
      ]),
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.columns, ["sku", "qty"]);
    assert.equal(result.csv, "sku,qty\nA-1,3\nB-2,9\n");
  });

  it("generates column_N headers when the first row is not all strings", () => {
    const result = convertJsonToCsv(
      JSON.stringify([
        [1, 2],
        [3, 4],
      ]),
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.columns, ["column_1", "column_2"]);
    assert.equal(result.csv, "column_1,column_2\n1,2\n3,4\n");
  });

  it("stringifies nested objects and arrays inside cells", () => {
    const result = jsonValueToCsv([
      { id: 1, tags: ["a", "b"], meta: { ok: true } },
    ]);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.match(result.csv, /"\[""a"",""b""\]"/);
    assert.match(result.csv, /"\{""ok"":true\}"/);
  });

  it("rejects an empty array", () => {
    const result = convertJsonToCsv("[]");
    assert.equal(result.ok, false);
  });
});

describe("csvFileNameFromJsonName", () => {
  it("swaps the extension to .csv", () => {
    assert.equal(csvFileNameFromJsonName("export.json"), "export.csv");
    assert.equal(csvFileNameFromJsonName("my data.JSON"), "my_data.csv");
    assert.equal(csvFileNameFromJsonName(""), "data.csv");
  });
});

describe("json-to-csv FAQ schema", () => {
  it("builds FAQPage JSON-LD with several questions", () => {
    const faqs = [
      {
        question: "What is a JSON to CSV converter?",
        answer: "It turns JSON objects or arrays into comma-separated rows.",
      },
      {
        question: "Does this upload my JSON?",
        answer: "No. Conversion runs in your browser.",
      },
      {
        question: "What JSON shapes work?",
        answer: "An object, an array of objects, or an array of arrays.",
      },
    ];
    const ld = faqPageJsonLd(faqs);
    assert.equal(ld["@type"], "FAQPage");
    assert.equal(ld.mainEntity.length, 3);
    assert.equal(ld.mainEntity[0]?.["@type"], "Question");
  });
});
