import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatJson, jsonStats, offsetToLineColumn } from "./json-formatter.ts";

describe("formatJson", () => {
  it("asks for input when blank", () => {
    const result = formatJson("   ");
    assert.equal(result.ok, false);
  });

  it("pretty-prints with 2 spaces by default", () => {
    const result = formatJson('{"a":1,"b":[true,null]}');
    assert.ok(result.ok);
    if (result.ok) {
      assert.equal(result.output, '{\n  "a": 1,\n  "b": [\n    true,\n    null\n  ]\n}');
    }
  });

  it("supports 4 spaces and tabs", () => {
    const four = formatJson('{"a":1}', { indent: 4 });
    const tab = formatJson('{"a":1}', { indent: "tab" });
    assert.ok(four.ok && four.output === '{\n    "a": 1\n}');
    assert.ok(tab.ok && tab.output === '{\n\t"a": 1\n}');
  });

  it("minifies", () => {
    const result = formatJson('{\n  "a": 1,\n  "b": "x y"\n}', { minify: true });
    assert.ok(result.ok && result.output === '{"a":1,"b":"x y"}');
  });

  it("sorts keys recursively when asked", () => {
    const result = formatJson('{"b":{"d":1,"c":2},"a":0}', { sortKeys: true, minify: true });
    assert.ok(result.ok && result.output === '{"a":0,"b":{"c":2,"d":1}}');
  });

  it("strips a leading BOM", () => {
    const result = formatJson('\uFEFF{"a":1}', { minify: true });
    assert.ok(result.ok && result.output === '{"a":1}');
  });

  it("reports invalid JSON with an error", () => {
    const result = formatJson('{"a":1,}');
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.error.length > 0);
  });

  it("rejects single quotes and comments (strict JSON)", () => {
    assert.equal(formatJson("{'a':1}").ok, false);
    assert.equal(formatJson('{"a":1 // c\n}').ok, false);
  });

  it("returns stats", () => {
    const result = formatJson('{"a":{"b":[1,2]},"c":3}');
    assert.ok(result.ok);
    if (result.ok) {
      assert.equal(result.stats.type, "object");
      assert.equal(result.stats.keys, 3);
      assert.equal(result.stats.depth, 3);
      assert.ok(result.stats.bytes > 0);
    }
  });
});

describe("helpers", () => {
  it("maps offsets to line and column", () => {
    assert.deepEqual(offsetToLineColumn("ab\ncd", 4), { line: 2, column: 2 });
    assert.deepEqual(offsetToLineColumn("abc", 0), { line: 1, column: 1 });
  });

  it("types primitives", () => {
    assert.equal(jsonStats(null).type, "null");
    assert.equal(jsonStats([1]).type, "array");
    assert.equal(jsonStats("x").type, "string");
  });
});
