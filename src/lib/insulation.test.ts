import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeInsulation, pickBattR, targetR, type InsulationInput } from "./insulation.ts";

const base: InsulationInput = {
  area: "1000",
  zone: 5,
  space: "attic",
  product: "cellulose",
  existingR: "0",
  wastePercent: "0",
  pieceWidthIn: "23",
  pieceLengthFt: "25",
};

describe("insulation targets", () => {
  it("looks up target R by space and zone", () => {
    assert.equal(targetR("attic", 5), 49);
    assert.equal(targetR("wall", 3), 20);
    assert.equal(targetR("floor", 1), 13);
  });
  it("picks the next standard batt and stacks layers", () => {
    assert.deepEqual(pickBattR(19), { r: 19, layers: 1 });
    assert.deepEqual(pickBattR(20), { r: 21, layers: 1 });
    assert.deepEqual(pickBattR(49), { r: 38, layers: 2 });
    assert.deepEqual(pickBattR(0), { r: 0, layers: 0 });
  });
});

describe("computeInsulation", () => {
  it("rejects bad input", () => {
    assert.equal(computeInsulation({ ...base, area: "0" }).valid, false);
    assert.equal(computeInsulation({ ...base, wastePercent: "80" }).valid, false);
  });
  it("blown-in cellulose to R-49 over 1,000 sq ft", () => {
    const r = computeInsulation(base);
    assert.ok(r.valid && r.kind === "blown");
    if (r.valid && r.kind === "blown") {
      assert.ok(Math.abs(r.thicknessIn - 49 / 3.6) < 1e-9);
      assert.equal(r.bags, Math.ceil((1000 * (49 / 3.6) / 12 * 1.6) / 25));
    }
  });
  it("subtracts existing R-value", () => {
    const r = computeInsulation({ ...base, existingR: "19" });
    assert.ok(r.valid && r.neededR === 30);
  });
  it("returns none when existing meets target", () => {
    const r = computeInsulation({ ...base, existingR: "60" });
    assert.ok(r.valid && r.kind === "none");
  });
  it("counts batts with waste, rounded up", () => {
    const r = computeInsulation({ ...base, product: "batt", space: "wall", zone: 5, area: "200", wastePercent: "10", pieceWidthIn: "15", pieceLengthFt: "7.75" });
    assert.ok(r.valid && r.kind === "piece");
    if (r.valid && r.kind === "piece") {
      assert.equal(r.battR, 21);
      assert.equal(r.pieces, Math.ceil(220 / ((15 * 7.75) / 12)));
    }
  });
  it("stacks two layers of batts for R-49", () => {
    const r = computeInsulation({ ...base, product: "roll", area: "460" });
    assert.ok(r.valid && r.kind === "piece");
    if (r.valid && r.kind === "piece") {
      assert.equal(r.layers, 2);
      assert.equal(r.pieces, 2 * Math.ceil(460 / ((23 * 25) / 12)));
    }
  });
  it("honors a custom target", () => {
    const r = computeInsulation({ ...base, targetOverride: "38" });
    assert.ok(r.valid && r.targetR === 38);
  });
});
