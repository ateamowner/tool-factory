import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeTile, roundUp, tileCoverageSqFt, type TileInput } from "./tile.ts";

const base: TileInput = {
  mode: "dimensions",
  areaSqFt: "",
  length: "10",
  width: "12",
  tileLengthIn: "12",
  tileWidthIn: "12",
  groutIn: "0",
  wastePercent: "0",
  tilesPerBox: "10",
};

describe("tile formulas", () => {
  it("12 × 12 in tile with no grout covers 1 sq ft", () => {
    assert.equal(tileCoverageSqFt(12, 12, 0), 1);
  });
  it("grout gap adds to coverage", () => {
    assert.ok(Math.abs(tileCoverageSqFt(12, 12, 0.125) - (12.125 * 12.125) / 144) < 1e-12);
  });
  it("rounds up", () => {
    assert.equal(roundUp(120), 120);
    assert.equal(roundUp(120.01), 121);
    assert.equal(roundUp(0), 0);
  });
});

describe("computeTile", () => {
  it("10 × 12 ft floor needs 120 tiles and 12 boxes of 12 in tile", () => {
    const r = computeTile(base);
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.baseSqFt, 120);
      assert.equal(r.tiles, 120);
      assert.equal(r.boxes, 12);
      assert.equal(r.boxSqFt, 10);
    }
  });
  it("adds waste", () => {
    const r = computeTile({ ...base, wastePercent: "10" });
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.tiles, 132);
      assert.equal(r.boxes, 14);
    }
  });
  it("area mode with 12 × 24 tile and grout", () => {
    const r = computeTile({ ...base, mode: "area", areaSqFt: "200", tileLengthIn: "24", groutIn: "0.125", tilesPerBox: "8" });
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.tiles, 99);
      assert.equal(r.boxes, 13);
    }
  });
  it("rejects bad input", () => {
    assert.equal(computeTile({ ...base, length: "abc" }).valid, false);
    assert.equal(computeTile({ ...base, length: "0" }).valid, false);
    assert.equal(computeTile({ ...base, tileLengthIn: "0" }).valid, false);
    assert.equal(computeTile({ ...base, wastePercent: "-5" }).valid, false);
  });
});
