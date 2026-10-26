import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeSimpleInterest,
  formatUsd,
  simpleInterest,
  termInYears,
  type SimpleInterestInput,
} from "./simple-interest.ts";

const base: SimpleInterestInput = { principal: 10000, ratePercent: 5, term: 3, termUnit: "years" };

const close = (a: number | null, b: number) => {
  assert.ok(a !== null && Math.abs(a - b) < 1e-9, `${a} !== ${b}`);
};

describe("simple interest formulas", () => {
  it("$10,000 at 5% for 3 years is $1,500 interest", () => {
    close(simpleInterest(10000, 5, 3), 1500);
  });
  it("converts months and days to years", () => {
    close(termInYears(18, "months"), 1.5);
    close(termInYears(365, "days"), 1);
    close(termInYears(360, "days", 360), 1);
    close(termInYears(2, "years"), 2);
  });
  it("formats dollars", () => {
    assert.equal(formatUsd(1500), "$1,500.00");
  });
});

describe("computeSimpleInterest", () => {
  it("returns interest and total amount in years", () => {
    const r = computeSimpleInterest(base);
    assert.equal(r.valid, true);
    close(r.interest, 1500);
    close(r.totalAmount, 11500);
  });
  it("handles months", () => {
    const r = computeSimpleInterest({ ...base, term: 6, termUnit: "months" });
    close(r.interest, 250);
    close(r.totalAmount, 10250);
  });
  it("handles days on a 365-day year", () => {
    const r = computeSimpleInterest({ principal: 7300, ratePercent: 10, term: 90, termUnit: "days" });
    close(r.interest, 180);
  });
  it("handles days on a 360-day year", () => {
    const r = computeSimpleInterest({ principal: 3600, ratePercent: 10, term: 90, termUnit: "days", dayBasis: 360 });
    close(r.interest, 90);
  });
  it("zero rate gives zero interest", () => {
    const r = computeSimpleInterest({ ...base, ratePercent: 0 });
    close(r.interest, 0);
    close(r.totalAmount, 10000);
  });
  it("rejects negative or non-finite inputs", () => {
    assert.equal(computeSimpleInterest({ ...base, principal: -1 }).valid, false);
    assert.equal(computeSimpleInterest({ ...base, ratePercent: Number.NaN }).valid, false);
    assert.equal(computeSimpleInterest({ ...base, term: Infinity }).valid, false);
    assert.equal(
      computeSimpleInterest({ ...base, termUnit: "weeks" as unknown as "years" }).valid,
      false,
    );
  });
});
