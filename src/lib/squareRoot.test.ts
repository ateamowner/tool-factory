import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeRoot, extractPower } from "./squareRoot.ts";

describe("computeRoot square", () => {
  it("simplifies √72 to 6√2", () => {
    const r = computeRoot("72");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.radicalText, "6√2");
    assert.equal(r.decimalText, "8.485281374");
    assert.equal(r.perfect, false);
    assert.equal(r.imaginary, false);
  });

  it("flags perfect squares", () => {
    const r = computeRoot("144");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.radicalText, "12");
    assert.equal(r.decimalText, "12");
    assert.equal(r.perfect, true);
  });

  it("leaves square-free numbers alone", () => {
    const r = computeRoot("2");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.radicalText, "√2");
    assert.equal(r.decimalText, "1.414213562");
  });

  it("treats negative inputs as imaginary", () => {
    const r = computeRoot("-72");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.imaginary, true);
    assert.equal(r.radicalText, "6√2 i");
    assert.equal(r.decimalText, "8.485281374i");
    const s = computeRoot("−36");
    assert.ok(s.valid);
    if (!s.valid) return;
    assert.equal(s.radicalText, "6i");
    assert.equal(s.perfect, true);
    const one = computeRoot("-1");
    assert.ok(one.valid);
    if (!one.valid) return;
    assert.equal(one.radicalText, "i");
  });

  it("handles zero and decimals", () => {
    const z = computeRoot("0");
    assert.ok(z.valid);
    if (!z.valid) return;
    assert.equal(z.radicalText, "0");
    const d = computeRoot("2.25");
    assert.ok(d.valid);
    if (!d.valid) return;
    assert.equal(d.decimalText, "1.5");
    assert.equal(d.radicalText, null);
  });

  it("rejects blanks and text", () => {
    assert.equal(computeRoot("").valid, false);
    assert.equal(computeRoot("abc").valid, false);
  });
});

describe("computeRoot cube", () => {
  it("simplifies ∛54 to 3∛2", () => {
    const r = computeRoot("54", "cube");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.radicalText, "3∛2");
    assert.equal(r.perfect, false);
  });

  it("gives real cube roots of negatives", () => {
    const r = computeRoot("-27", "cube");
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.radicalText, "−3");
    assert.equal(r.decimalText, "−3");
    assert.equal(r.imaginary, false);
    assert.equal(r.perfect, true);
    const s = computeRoot("-16", "cube");
    assert.ok(s.valid);
    if (!s.valid) return;
    assert.equal(s.radicalText, "−2∛2");
  });
});

describe("extractPower", () => {
  it("splits square and cube factors", () => {
    assert.deepEqual(extractPower(72, 2), { outside: 6, inside: 2 });
    assert.deepEqual(extractPower(72, 3), { outside: 2, inside: 9 });
    assert.deepEqual(extractPower(97, 2), { outside: 1, inside: 97 });
  });
});
