import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  circleArea,
  computeRoom,
  convertArea,
  formatArea,
  lShapeArea,
  parseNumberInput,
  rectangleArea,
  toFeet,
  totalArea,
  triangleArea,
  type RoomInput,
} from "./square-footage.ts";

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const d = (ft: string, inches = "") => ({ ft, in: inches });

describe("parseNumberInput", () => {
  it("parses numbers with commas and treats blank as 0", () => {
    assert.equal(parseNumberInput("12"), 12);
    assert.equal(parseNumberInput("1,200"), 1200);
    assert.equal(parseNumberInput(""), 0);
    assert.equal(parseNumberInput(undefined), 0);
  });
  it("returns null for invalid input", () => {
    assert.equal(parseNumberInput("abc"), null);
    assert.equal(parseNumberInput("-"), null);
  });
});

describe("toFeet", () => {
  it("combines feet and inches", () => {
    close(toFeet(d("12", "6")) ?? NaN, 12.5);
    close(toFeet(d("", "18")) ?? NaN, 1.5);
    close(toFeet(d("10")) ?? NaN, 10);
  });
  it("rejects negatives and junk", () => {
    assert.equal(toFeet(d("-1")), null);
    assert.equal(toFeet(d("5", "x")), null);
  });
});

describe("shape formulas", () => {
  it("rectangle, triangle, circle, L-shape", () => {
    assert.equal(rectangleArea(12, 10), 120);
    assert.equal(triangleArea(10, 6), 30);
    close(circleArea(10), Math.PI * 25);
    assert.equal(lShapeArea(20, 10, 10, 8), 280);
  });
});

describe("computeRoom", () => {
  it("handles feet + inches for a rectangle", () => {
    const r = computeRoom({ shape: "rectangle", dims: { length: d("12", "6"), width: d("10") } });
    assert.ok(r.valid);
    if (r.valid) close(r.areaSqFt, 125);
  });
  it("multiplies by quantity", () => {
    const r = computeRoom({ shape: "rectangle", dims: { length: d("10"), width: d("10") }, quantity: "3" });
    assert.ok(r.valid);
    if (r.valid) {
      assert.equal(r.eachSqFt, 100);
      assert.equal(r.areaSqFt, 300);
    }
  });
  it("computes a circle from diameter", () => {
    const r = computeRoom({ shape: "circle", dims: { diameter: d("10") } });
    assert.ok(r.valid);
    if (r.valid) close(r.areaSqFt, 78.53981633974483);
  });
  it("computes an L-shape as two rectangles", () => {
    const r = computeRoom({
      shape: "l-shape",
      dims: { length1: d("20"), width1: d("10"), length2: d("10"), width2: d("8") },
    });
    assert.ok(r.valid);
    if (r.valid) assert.equal(r.areaSqFt, 280);
  });
  it("rejects missing or zero dimensions", () => {
    const r = computeRoom({ shape: "triangle", dims: { base: d("10"), height: d("") } });
    assert.equal(r.valid, false);
    const q = computeRoom({ shape: "rectangle", dims: { length: d("1"), width: d("1") }, quantity: "0" });
    assert.equal(q.valid, false);
  });
});

describe("convertArea and totalArea", () => {
  it("converts square feet", () => {
    const t = convertArea(9);
    assert.equal(t.sqIn, 1296);
    assert.equal(t.sqYd, 1);
    close(t.sqM, 0.83612736);
  });
  it("sums rooms and adds waste", () => {
    const rooms: RoomInput[] = [
      { shape: "rectangle", dims: { length: d("12"), width: d("10") } },
      { shape: "triangle", dims: { base: d("10"), height: d("6") } },
      { shape: "rectangle", dims: { length: d(""), width: d("") } },
    ];
    const t = totalArea(rooms, "10");
    assert.ok(!("error" in t));
    if (!("error" in t)) {
      assert.equal(t.base.sqFt, 150);
      close(t.withWaste.sqFt, 165);
      assert.equal(t.validRooms, 2);
      assert.equal(t.invalidRooms, 1);
    }
  });
  it("errors when nothing is valid or waste is negative", () => {
    assert.ok("error" in totalArea([{ shape: "circle", dims: {} }]));
    assert.ok("error" in totalArea([{ shape: "circle", dims: { diameter: d("4") } }], "-5"));
  });
});

describe("formatArea", () => {
  it("rounds and adds separators", () => {
    assert.equal(formatArea(1234.5678), "1,234.57");
    assert.equal(formatArea(0.001), "0");
    assert.equal(formatArea(150), "150");
  });
});
