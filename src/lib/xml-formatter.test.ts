import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatXml, offsetToLineColumn } from "./xml-formatter.ts";

describe("formatXml", () => {
  it("pretty-prints nested elements", () => {
    const r = formatXml('<?xml version="1.0"?><a x="1"><b>hi</b><c/></a>');
    assert.ok(r.ok);
    assert.equal(r.output, '<?xml version="1.0"?>\n<a x="1">\n  <b>hi</b>\n  <c/>\n</a>');
    assert.equal(r.stats.elements, 3);
    assert.equal(r.stats.attributes, 1);
    assert.equal(r.stats.depth, 2);
  });
  it("supports 4 spaces and tabs", () => {
    const four = formatXml("<a><b/></a>", { indent: 4 });
    assert.ok(four.ok);
    assert.equal(four.output, "<a>\n    <b/>\n</a>");
    const tab = formatXml("<a><b/></a>", { indent: "tab" });
    assert.ok(tab.ok);
    assert.equal(tab.output, "<a>\n\t<b/>\n</a>");
  });
  it("minifies and drops whitespace between tags", () => {
    const r = formatXml("<a>\n  <b> hi </b>\n  <!-- n -->\n  <c/>\n</a>", { minify: true });
    assert.ok(r.ok);
    assert.equal(r.output, "<a><b>hi</b><!-- n --><c/></a>");
  });
  it("keeps CDATA and comments", () => {
    const r = formatXml("<a><![CDATA[ x < y ]]></a>");
    assert.ok(r.ok);
    assert.equal(r.output, "<a>\n  <![CDATA[ x < y ]]>\n</a>");
  });
  it("reports mismatched tags with line and column", () => {
    const r = formatXml("<a>\n  <b>text</c>\n</a>");
    assert.ok(!r.ok);
    assert.equal(r.line, 2);
    assert.equal(r.column, 10);
    assert.match(r.error, /does not match <b>/);
  });
  it("reports unclosed elements", () => {
    const r = formatXml("<a>\n<b></b>");
    assert.ok(!r.ok);
    assert.equal(r.line, 1);
    assert.match(r.error, /never closed/);
  });
  it("rejects duplicate attributes, unquoted values, bad entities", () => {
    const d = formatXml('<a x="1" x="2"/>');
    assert.ok(!d.ok);
    assert.match(d.error, /Duplicate attribute/);
    const u = formatXml("<a x=1/>");
    assert.ok(!u.ok);
    assert.match(u.error, /quotes/);
    const e = formatXml("<a>Tom & Jerry</a>");
    assert.ok(!e.ok);
    assert.match(e.error, /&amp;/);
  });
  it("rejects multiple roots and empty input", () => {
    const m = formatXml("<a/>\n<b/>");
    assert.ok(!m.ok);
    assert.equal(m.line, 2);
    assert.match(m.error, /one root/);
    assert.ok(!formatXml("   <!-- only -->").ok);
  });
  it("maps offsets to line and column", () => {
    assert.deepEqual(offsetToLineColumn("ab\ncd", 4), { line: 2, column: 2 });
  });
});
