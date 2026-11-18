import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { convertVolume, shapeVolume } from "./volume.ts";

const close = (a: number | null, b: number, eps = 1e-9) => {
  assert.ok(a !== null && Math.abs(a - b) < eps, `${a} vs ${b}`);
};

describe("volume", () => {
  it("cube", () => close(shapeVolume("cube", { side: 3 }), 27));
  it("rectangular prism", () => close(shapeVolume("prism", { length: 2, width: 3, height: 4 }), 24));
  it("cylinder", () => close(shapeVolume("cylinder", { radius: 2, height: 5 }), 20 * Math.PI));
  it("sphere", () => close(shapeVolume("sphere", { radius: 3 }), 36 * Math.PI));
  it("cone", () => close(shapeVolume("cone", { radius: 3, height: 4 }), 12 * Math.PI));
  it("pyramid", () => close(shapeVolume("pyramid", { length: 3, width: 4, height: 5 }), 20));
  it("rejects negative or missing input", () => {
    assert.equal(shapeVolume("cube", { side: -1 }), null);
    assert.equal(shapeVolume("prism", { length: 1, width: 2 }), null);
    assert.equal(shapeVolume("sphere", { radius: NaN }), null);
  });
  it("converts units", () => {
    const c = convertVolume(1, "m");
    close(c.liters, 1000);
    close(c.cubicCentimeters, 1e6);
    close(c.cubicFeet, 35.3146667, 1e-6);
    close(c.cubicYards, 1.30795062, 1e-6);
    close(convertVolume(27, "ft").cubicYards, 1, 1e-9);
    close(convertVolume(1, "ft").usGallons, 7.480519, 1e-5);
    close(convertVolume(1, "in").cubicCentimeters, 16.387064, 1e-6);
  });
});
