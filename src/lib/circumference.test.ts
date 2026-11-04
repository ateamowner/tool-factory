import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fmt, parsePositive, piText, radiusFrom, solveCircle } from "./circumference.ts";

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} vs ${b}`);

describe("circumference formulas", () => {
  it("solves from radius", () => {
    const r = solveCircle("radius", "5", "cm");
    assert.ok(r.valid);
    if (!r.valid) return;
    close(r.diameter, 10);
    close(r.circumference, 10 * Math.PI);
    close(r.area, 25 * Math.PI);
    assert.equal(r.circumferenceExpr, "10π cm ≈ 31.4159 cm");
    assert.equal(r.areaExpr, "25π cm² ≈ 78.5398 cm²");
  });
  it("solves from diameter", () => {
    const r = solveCircle("diameter", "12", "in");
    assert.ok(r.valid);
    if (!r.valid) return;
    close(r.radius, 6);
    close(r.circumference, 12 * Math.PI);
    close(r.area, 36 * Math.PI);
  });
  it("solves from circumference", () => {
    const r = solveCircle("circumference", "31.4159265358979", "m");
    assert.ok(r.valid);
    if (!r.valid) return;
    close(r.radius, 5, 1e-9);
    close(r.diameter, 10, 1e-9);
    close(r.area, 25 * Math.PI, 1e-8);
    assert.ok(r.diameterExpr.startsWith("31.4159/π"));
  });
  it("solves from area", () => {
    const r = solveCircle("area", String(Math.PI * 49), "ft");
    assert.ok(r.valid);
    if (!r.valid) return;
    close(r.radius, 7, 1e-9);
    close(r.circumference, 14 * Math.PI, 1e-9);
    assert.ok(r.radiusExpr.startsWith("√("));
  });
  it("round-trips every input", () => {
    for (const known of ["radius", "diameter", "circumference", "area"] as const) {
      close(radiusFrom(known, known === "radius" ? 3 : known === "diameter" ? 6 : known === "circumference" ? 6 * Math.PI : 9 * Math.PI), 3, 1e-12);
    }
  });
  it("writes π forms", () => {
    assert.equal(piText(1), "π");
    assert.equal(piText(2.5), "2.5π");
    assert.equal(fmt(1234567.891, 2), "1,234,567.89");
  });
  it("rejects bad input", () => {
    assert.equal(parsePositive(""), null);
    assert.equal(parsePositive("-3"), null);
    assert.equal(parsePositive("0"), null);
    assert.equal(parsePositive("abc"), null);
    assert.equal(parsePositive("1,000"), 1000);
    assert.equal(solveCircle("radius", "x").valid, false);
  });
});
