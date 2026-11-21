import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeCapRate, valueFromCapRate } from "./cap-rate.ts";

describe("computeCapRate", () => {
  it("computes NOI and cap rate with dollar expenses", () => {
    const r = computeCapRate({ propertyValue: 400000, grossAnnualIncome: 36000, vacancyPercent: 5, operatingExpenses: 12000, expensesArePercent: false });
    assert.ok(r.valid);
    assert.equal(r.vacancyLoss, 1800);
    assert.equal(r.effectiveGrossIncome, 34200);
    assert.equal(r.noi, 22200);
    assert.equal(r.capRate, 5.55);
  });

  it("supports expenses as a percent of effective income", () => {
    const r = computeCapRate({ propertyValue: 500000, grossAnnualIncome: 60000, vacancyPercent: 0, operatingExpenses: 40, expensesArePercent: true });
    assert.ok(r.valid);
    assert.equal(r.operatingExpenses, 24000);
    assert.equal(r.noi, 36000);
    assert.equal(r.capRate, 7.2);
  });

  it("allows a negative NOI", () => {
    const r = computeCapRate({ propertyValue: 100000, grossAnnualIncome: 5000, vacancyPercent: 0, operatingExpenses: 8000, expensesArePercent: false });
    assert.ok(r.valid);
    assert.equal(r.noi, -3000);
    assert.equal(r.capRate, -3);
  });

  it("rejects bad input", () => {
    assert.equal(computeCapRate({ propertyValue: 0, grossAnnualIncome: 1, vacancyPercent: 0, operatingExpenses: 0, expensesArePercent: false }).valid, false);
    assert.equal(computeCapRate({ propertyValue: 1, grossAnnualIncome: 1, vacancyPercent: 101, operatingExpenses: 0, expensesArePercent: false }).valid, false);
    assert.equal(computeCapRate({ propertyValue: 1, grossAnnualIncome: 1, vacancyPercent: 0, operatingExpenses: 101, expensesArePercent: true }).valid, false);
  });
});

describe("valueFromCapRate", () => {
  it("divides NOI by the cap rate", () => {
    assert.equal(valueFromCapRate(22200, 6), 370000);
    assert.equal(valueFromCapRate(22200, 0), null);
  });
});
