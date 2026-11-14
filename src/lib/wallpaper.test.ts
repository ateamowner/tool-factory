import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeWallpaper, dropLength, parseNumberInput, type WallpaperInput } from "./wallpaper.ts";

const base: WallpaperInput = {
  unit: "ft",
  length: "12",
  width: "12",
  height: "8",
  doors: "0",
  windows: "0",
  roll: "us-single",
  repeat: "0",
  wastePercent: "0",
};

describe("wallpaper formulas", () => {
  it("parses numbers", () => {
    assert.equal(parseNumberInput("1,200"), 1200);
    assert.equal(parseNumberInput(""), 0);
    assert.equal(parseNumberInput("abc"), null);
  });
  it("drop length rounds up to a pattern repeat", () => {
    assert.equal(dropLength(8, 0), 8);
    assert.equal(dropLength(8, 24), 8);
    assert.equal(dropLength(8, 18), 9);
    assert.equal(dropLength(0, 18), 0);
  });
  it("12 × 12 room, 8 ft walls, no repeat", () => {
    const r = computeWallpaper(base);
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.wallSqFt, 384);
    assert.equal(r.stripsPerRoll, 4);
    assert.equal(r.stripsNeeded, 29); // 384 / (20.5/12 × 8) = 28.1
    assert.equal(r.rolls, 8);
  });
  it("subtracts doors and windows", () => {
    const r = computeWallpaper({ ...base, doors: "1", windows: "2" });
    assert.ok(r.valid);
    if (!r.valid) return;
    assert.equal(r.openingsSqFt, 51);
    assert.equal(r.netSqFt, 333);
    assert.equal(r.stripsNeeded, 25);
  });
  it("pattern repeat and waste add rolls", () => {
    const plain = computeWallpaper(base);
    const patterned = computeWallpaper({ ...base, repeat: "18", wastePercent: "10" });
    assert.ok(plain.valid && patterned.valid);
    if (!plain.valid || !patterned.valid) return;
    assert.equal(patterned.dropFt, 9);
    assert.equal(patterned.stripsPerRoll, 3);
    assert.ok(patterned.rolls > plain.rolls);
  });
  it("meters convert to feet", () => {
    const m = computeWallpaper({ ...base, unit: "m", length: "3.6576", width: "3.6576", height: "2.4384" });
    const ft = computeWallpaper(base);
    assert.ok(m.valid && ft.valid);
    if (!m.valid || !ft.valid) return;
    assert.equal(m.rolls, ft.rolls);
  });
  it("custom roll and errors", () => {
    const r = computeWallpaper({ ...base, roll: "custom", customWidth: "27", customLength: "27" });
    assert.ok(r.valid);
    assert.equal(computeWallpaper({ ...base, roll: "custom" }).valid, false);
    assert.equal(computeWallpaper({ ...base, height: "40" }).valid, false);
    assert.equal(computeWallpaper({ ...base, length: "", width: "" }).valid, false);
    assert.equal(computeWallpaper({ ...base, length: "x" }).valid, false);
    assert.equal(computeWallpaper({ ...base, wastePercent: "-1" }).valid, false);
  });
});
