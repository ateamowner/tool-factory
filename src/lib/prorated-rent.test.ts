import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeProratedRent } from "./prorated-rent.ts";

function line(r: ReturnType<typeof computeProratedRent>, method: string) {
  assert.ok(r.valid);
  return r.lines.find((l) => l.method === method)!;
}

describe("computeProratedRent", () => {
  it("prorates a move-in on the 15th of a 30-day month", () => {
    const r = computeProratedRent(1500, "2026-04-15", "move-in");
    assert.ok(r.valid);
    assert.equal(r.daysInMonth, 30);
    assert.equal(r.daysCharged, 16);
    assert.equal(line(r, "actual").amount, 800);
    assert.equal(line(r, "thirty").amount, 800);
  });

  it("uses actual days in a 31-day month", () => {
    const r = computeProratedRent(1550, "2026-10-21", "move-in");
    assert.ok(r.valid);
    assert.equal(r.daysCharged, 11);
    assert.equal(line(r, "actual").dailyRate, 50);
    assert.equal(line(r, "actual").amount, 550);
    assert.equal(line(r, "thirty").amount, 568.33);
  });

  it("prorates a move-out through the move-out day", () => {
    const r = computeProratedRent(1200, "2026-11-10", "move-out");
    assert.ok(r.valid);
    assert.equal(r.daysCharged, 10);
    assert.equal(line(r, "actual").amount, 400);
  });

  it("uses 365 days a year", () => {
    const r = computeProratedRent(1000, "2026-07-01", "move-out");
    assert.equal(line(r, "year365").amount, 32.88);
  });

  it("handles leap-year February", () => {
    const r = computeProratedRent(1450, "2028-02-15", "move-in");
    assert.ok(r.valid);
    assert.equal(r.daysInMonth, 29);
    assert.equal(r.daysCharged, 15);
  });

  it("never charges more than a full month on the 30-day method", () => {
    const r = computeProratedRent(900, "2026-10-01", "move-in");
    assert.equal(line(r, "thirty").amount, 900);
    assert.equal(line(r, "actual").amount, 900);
  });

  it("rejects bad input", () => {
    assert.equal(computeProratedRent(0, "2026-10-01", "move-in").valid, false);
    assert.equal(computeProratedRent(1000, "2026-02-30", "move-in").valid, false);
  });
});
