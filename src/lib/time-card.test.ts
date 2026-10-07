import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DAY_LABELS,
  DEFAULT_TC_OT_MULTIPLIER,
  DEFAULT_TC_OT_THRESHOLD,
  computeDay,
  computeTimeCard,
  formatDecimalHours,
  formatHoursMinutes,
  parseClockTime,
  parseTimeCardNumber,
  type TimeCardDayInput,
  type TimeCardInput,
} from "./time-card.ts";

function day(start: string, end: string, breakMinutes = "", label = "Monday"): TimeCardDayInput {
  return { label, start, end, breakMinutes };
}

function week(shifts: [string, string, string][]): TimeCardDayInput[] {
  return DAY_LABELS.map((label, index) => {
    const shift = shifts[index];
    return shift ? day(shift[0], shift[1], shift[2], label) : day("", "", "", label);
  });
}

function input(overrides: Partial<TimeCardInput> = {}): TimeCardInput {
  return {
    days: week([
      ["08:00", "16:30", "30"],
      ["08:00", "16:30", "30"],
      ["08:00", "16:30", "30"],
      ["08:00", "16:30", "30"],
      ["08:00", "16:30", "30"],
    ]),
    hourlyRate: 20,
    otThreshold: DEFAULT_TC_OT_THRESHOLD,
    otMultiplier: DEFAULT_TC_OT_MULTIPLIER,
    ...overrides,
  };
}

describe("parseClockTime", () => {
  it("parses 24-hour and 12-hour formats", () => {
    assert.equal(parseClockTime("08:00"), 480);
    assert.equal(parseClockTime("17:45"), 1065);
    assert.equal(parseClockTime("8:30 AM"), 510);
    assert.equal(parseClockTime("5:15pm"), 1035);
    assert.equal(parseClockTime("12:00 AM"), 0);
    assert.equal(parseClockTime("12:30 PM"), 750);
    assert.equal(parseClockTime("9am"), 540);
    assert.equal(parseClockTime("1730"), 1050);
    assert.equal(parseClockTime("5:00 p.m."), 1020);
  });

  it("returns null for empty and NaN for invalid", () => {
    assert.equal(parseClockTime(""), null);
    assert.equal(parseClockTime("   "), null);
    assert.ok(Number.isNaN(parseClockTime("25:00")));
    assert.ok(Number.isNaN(parseClockTime("8:75")));
    assert.ok(Number.isNaN(parseClockTime("13pm")));
    assert.ok(Number.isNaN(parseClockTime("noon")));
  });
});

describe("parseTimeCardNumber", () => {
  it("strips commas and rejects empty", () => {
    assert.equal(parseTimeCardNumber("1,000.5"), 1000.5);
    assert.ok(Number.isNaN(parseTimeCardNumber("")));
  });
});

describe("computeDay", () => {
  it("subtracts the unpaid break", () => {
    const result = computeDay(day("08:00", "16:30", "30"));
    assert.equal(result.status, "ok");
    assert.equal(result.minutes, 480);
    assert.equal(result.overnight, false);
  });

  it("handles overnight shifts", () => {
    const result = computeDay(day("10:00 PM", "6:30 AM", "30"));
    assert.equal(result.status, "ok");
    assert.equal(result.minutes, 480);
    assert.equal(result.overnight, true);
  });

  it("treats a blank day as empty and half-filled as invalid", () => {
    assert.equal(computeDay(day("", "")).status, "empty");
    assert.equal(computeDay(day("08:00", "")).status, "invalid");
    assert.equal(computeDay(day("08:00", "09:00", "90")).status, "invalid");
    assert.equal(computeDay(day("08:00", "09:00", "-5")).status, "invalid");
  });
});

describe("formatting", () => {
  it("formats h:mm and decimal hours", () => {
    assert.equal(formatHoursMinutes(2550), "42:30");
    assert.equal(formatHoursMinutes(45), "0:45");
    assert.equal(formatDecimalHours(2550), "42.50");
    assert.equal(formatDecimalHours(20), "0.33");
  });
});

describe("computeTimeCard", () => {
  it("totals a standard 40-hour week", () => {
    const result = computeTimeCard(input());
    assert.equal(result.valid, true);
    assert.equal(result.totalMinutes, 2400);
    assert.equal(result.totalHours, 40);
    assert.equal(result.regularHours, 40);
    assert.equal(result.overtimeHours, 0);
    assert.equal(result.totalPay, 800);
    assert.match(result.summary ?? "", /40:00 \(40\.00 hours\) across 5 days = \$800\.00 gross/);
  });

  it("splits overtime above the weekly threshold", () => {
    const result = computeTimeCard(
      input({
        days: week([
          ["07:00", "16:00", "30"],
          ["07:00", "16:00", "30"],
          ["07:00", "16:00", "30"],
          ["07:00", "16:00", "30"],
          ["07:00", "16:00", "30"],
        ]),
      }),
    );
    assert.equal(result.totalHours, 42.5);
    assert.equal(result.regularHours, 40);
    assert.equal(result.overtimeHours, 2.5);
    assert.equal(result.otRate, 30);
    assert.equal(result.regularPay, 800);
    assert.equal(result.overtimePay, 75);
    assert.equal(result.totalPay, 875);
  });

  it("works without an hourly rate", () => {
    const result = computeTimeCard(input({ hourlyRate: null }));
    assert.equal(result.valid, true);
    assert.equal(result.totalPay, null);
    assert.equal(result.totalHours, 40);
  });

  it("rejects bad inputs", () => {
    assert.equal(computeTimeCard(input({ days: week([]) })).valid, false);
    assert.equal(computeTimeCard(input({ hourlyRate: 0 })).valid, false);
    assert.equal(computeTimeCard(input({ otMultiplier: 0.5 })).valid, false);
    assert.equal(computeTimeCard(input({ otThreshold: -1 })).valid, false);
    const bad = computeTimeCard(input({ days: week([["8:00", "", ""]]) }));
    assert.equal(bad.valid, false);
    assert.match(bad.error ?? "", /Monday/);
  });
});
