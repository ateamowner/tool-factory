import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computePaycheck } from "./paycheck-hourly.ts";

describe("computePaycheck", () => {
  it("computes hourly gross for a 40-hour biweekly paycheck", () => {
    const result = computePaycheck({
      mode: "hourly",
      hourlyRate: 25,
      annualSalary: 0,
      hoursPerWeek: 40,
      frequency: "biweekly",
      includeOvertime: false,
    });

    assert.equal(result.valid, true);
    assert.equal(result.weeklyGross, 1000);
    assert.equal(result.annualGross, 52000);
    assert.equal(result.monthlyGross, 52000 / 12);
    assert.equal(result.perPaycheck, 2000);
    assert.equal(result.regularHours, 40);
    assert.equal(result.overtimeHours, 0);
    assert.equal(result.hourlyEquivalent, 25);
  });

  it("pays overtime hours over 40 at 1.5x when enabled", () => {
    const result = computePaycheck({
      mode: "hourly",
      hourlyRate: 20,
      annualSalary: 0,
      hoursPerWeek: 45,
      frequency: "weekly",
      includeOvertime: true,
    });

    assert.equal(result.regularHours, 40);
    assert.equal(result.overtimeHours, 5);
    assert.equal(result.weeklyGross, 40 * 20 + 5 * 30);
    assert.equal(result.perPaycheck, 950);
    assert.equal(result.annualGross, 950 * 52);
  });

  it("treats all hours as regular when overtime is off", () => {
    const result = computePaycheck({
      mode: "hourly",
      hourlyRate: 20,
      annualSalary: 0,
      hoursPerWeek: 45,
      frequency: "weekly",
      includeOvertime: false,
    });

    assert.equal(result.regularHours, 45);
    assert.equal(result.overtimeHours, 0);
    assert.equal(result.weeklyGross, 900);
  });

  it("splits an annual salary across semimonthly paychecks", () => {
    const result = computePaycheck({
      mode: "salary",
      hourlyRate: 0,
      annualSalary: 72000,
      hoursPerWeek: 40,
      frequency: "semimonthly",
      includeOvertime: false,
    });

    assert.equal(result.valid, true);
    assert.equal(result.annualGross, 72000);
    assert.equal(result.weeklyGross, 72000 / 52);
    assert.equal(result.monthlyGross, 6000);
    assert.equal(result.perPaycheck, 3000);
    assert.equal(result.hourlyEquivalent, 72000 / (40 * 52));
  });

  it("returns empty totals for invalid hourly input", () => {
    const result = computePaycheck({
      mode: "hourly",
      hourlyRate: 0,
      annualSalary: 50000,
      hoursPerWeek: 40,
      frequency: "monthly",
      includeOvertime: false,
    });

    assert.equal(result.valid, false);
    assert.equal(result.perPaycheck, null);
    assert.equal(result.annualGross, null);
  });
});
