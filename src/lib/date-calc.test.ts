import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addToDate, diffDates, formatIso, parseIsoDate, weekdayName } from "./date-calc.ts";

const p = (s: string) => {
  const r = parseIsoDate(s);
  if (!r) throw new Error(s);
  return r;
};

describe("date calculator", () => {
  it("parses and rejects invalid dates", () => {
    assert.deepEqual(parseIsoDate("2024-02-29"), { y: 2024, m: 2, d: 29 });
    assert.equal(parseIsoDate("2023-02-29"), null);
    assert.equal(parseIsoDate("nope"), null);
  });
  it("counts days between dates", () => {
    const r = diffDates(p("2026-01-01"), p("2026-12-31"));
    assert.equal(r.totalDays, 364);
    assert.equal(diffDates(p("2026-01-01"), p("2026-12-31"), true).totalDays, 365);
    assert.equal(diffDates(p("2024-01-01"), p("2025-01-01")).totalDays, 366);
  });
  it("breaks difference into years, months, days", () => {
    const r = diffDates(p("2020-03-15"), p("2026-10-10"));
    assert.equal(r.years, 6);
    assert.equal(r.months, 6);
    assert.equal(r.days, 25);
  });
  it("handles reversed order and DST spans", () => {
    assert.equal(diffDates(p("2026-03-10"), p("2026-03-01")).totalDays, -9);
    assert.equal(diffDates(p("2026-03-01"), p("2026-11-15")).totalDays, 259);
  });
  it("counts business days", () => {
    assert.equal(diffDates(p("2026-10-05"), p("2026-10-12")).businessDays, 5);
  });
  it("adds and subtracts", () => {
    assert.equal(formatIso(addToDate(p("2026-10-10"), { years: 0, months: 0, weeks: 0, days: 90 })), "2027-01-08");
    assert.equal(formatIso(addToDate(p("2026-01-31"), { years: 0, months: 1, weeks: 0, days: 0 })), "2026-02-28");
    assert.equal(formatIso(addToDate(p("2026-03-15"), { years: -1, months: -3, weeks: 0, days: 0 })), "2024-12-15");
    assert.equal(formatIso(addToDate(p("2026-10-10"), { years: 0, months: 0, weeks: -2, days: 0 })), "2026-09-26");
  });
  it("names weekdays", () => {
    assert.equal(weekdayName(p("2026-10-10")), "Saturday");
  });
});
