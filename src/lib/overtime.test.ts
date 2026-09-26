import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  DEFAULT_OT_MULTIPLIER,
  DEFAULT_OT_THRESHOLD,
  computeOvertime,
  formatHours,
  formatMultiplier,
  formatOvertimeSummary,
  formatUsd,
  parseOvertimeNumber,
  splitFromTotal,
  type OvertimeInput,
} from "./overtime.ts";

function input(overrides: Partial<OvertimeInput> = {}): OvertimeInput {
  return {
    mode: "split",
    hourlyRate: 20,
    regularHours: 40,
    overtimeHours: 5,
    totalHours: 45,
    otThreshold: DEFAULT_OT_THRESHOLD,
    otMultiplier: DEFAULT_OT_MULTIPLIER,
    ...overrides,
  };
}

function cents(value: number | null): number | null {
  if (value === null) return null;
  return Math.round(value * 100) / 100;
}

describe("parseOvertimeNumber", () => {
  it("strips commas and rejects empty", () => {
    assert.equal(parseOvertimeNumber("1,250.50"), 1250.5);
    assert.ok(Number.isNaN(parseOvertimeNumber("")));
    assert.ok(Number.isNaN(parseOvertimeNumber("   ")));
  });
});

describe("formatUsd / formatHours / formatMultiplier", () => {
  it("formats money, hours, and multipliers", () => {
    assert.equal(formatUsd(100), "$100.00");
    assert.equal(formatUsd(1234.5), "$1,234.50");
    assert.equal(formatHours(40), "40");
    assert.equal(formatHours(7.5), "7.5");
    assert.equal(formatMultiplier(1.5), "1.5×");
    assert.equal(formatMultiplier(2), "2×");
  });
});

describe("splitFromTotal", () => {
  it("splits at the overtime threshold", () => {
    assert.deepEqual(splitFromTotal(45, 40), { regularHours: 40, overtimeHours: 5 });
    assert.deepEqual(splitFromTotal(30, 40), { regularHours: 30, overtimeHours: 0 });
    assert.deepEqual(splitFromTotal(40, 40), { regularHours: 40, overtimeHours: 0 });
    assert.deepEqual(splitFromTotal(50, 0), { regularHours: 0, overtimeHours: 50 });
  });
});

describe("computeOvertime", () => {
  it("computes regular, OT, and total pay in split mode at 1.5×", () => {
    const result = computeOvertime(input());
    assert.equal(result.valid, true);
    assert.equal(cents(result.regularPay), 800);
    assert.equal(cents(result.overtimePay), 150);
    assert.equal(cents(result.totalPay), 950);
    assert.equal(cents(result.otRate), 30);
    assert.equal(cents(result.biweeklyPay), 1900);
    assert.equal(result.regularHours, 40);
    assert.equal(result.overtimeHours, 5);
    assert.equal(result.totalHours, 45);
  });

  it("splits total hours using the OT threshold", () => {
    const result = computeOvertime(
      input({
        mode: "total",
        hourlyRate: 25,
        totalHours: 48,
        otThreshold: 40,
        otMultiplier: 1.5,
      }),
    );
    assert.equal(result.valid, true);
    assert.equal(result.regularHours, 40);
    assert.equal(result.overtimeHours, 8);
    assert.equal(cents(result.regularPay), 1000);
    assert.equal(cents(result.overtimePay), 300);
    assert.equal(cents(result.totalPay), 1300);
  });

  it("allows double-time multiplier", () => {
    const result = computeOvertime(
      input({
        hourlyRate: 20,
        regularHours: 40,
        overtimeHours: 4,
        otMultiplier: 2,
      }),
    );
    assert.equal(result.valid, true);
    assert.equal(cents(result.otRate), 40);
    assert.equal(cents(result.overtimePay), 160);
    assert.equal(cents(result.totalPay), 960);
  });

  it("handles zero overtime hours", () => {
    const result = computeOvertime(
      input({ regularHours: 38, overtimeHours: 0 }),
    );
    assert.equal(result.valid, true);
    assert.equal(cents(result.regularPay), 760);
    assert.equal(cents(result.overtimePay), 0);
    assert.equal(cents(result.totalPay), 760);
    assert.match(result.summary ?? "", /no overtime/i);
  });

  it("rejects invalid rate, hours, and multiplier", () => {
    assert.equal(computeOvertime(input({ hourlyRate: 0 })).valid, false);
    assert.equal(computeOvertime(input({ hourlyRate: -5 })).valid, false);
    assert.equal(computeOvertime(input({ regularHours: -1 })).valid, false);
    assert.equal(computeOvertime(input({ overtimeHours: -1 })).valid, false);
    assert.equal(
      computeOvertime(input({ regularHours: 0, overtimeHours: 0 })).valid,
      false,
    );
    assert.equal(computeOvertime(input({ otMultiplier: 0.5 })).valid, false);
    assert.equal(
      computeOvertime(input({ mode: "total", totalHours: 0 })).valid,
      false,
    );
  });
});

describe("formatOvertimeSummary", () => {
  it("mentions OT when overtime hours are present", () => {
    const text = formatOvertimeSummary({
      hourlyRate: 20,
      otMultiplier: 1.5,
      regularHours: 40,
      overtimeHours: 5,
      regularPay: 800,
      overtimePay: 150,
      totalPay: 950,
    });
    assert.match(text, /40 regular hours/);
    assert.match(text, /5 OT hours/);
    assert.match(text, /\$950\.00 total/);
  });
});

describe("overtime FAQ schema", () => {
  it("builds FAQPage JSON-LD with several questions", () => {
    const faqs = [
      {
        question: "How is overtime pay calculated?",
        answer: "Regular hours at the hourly rate plus OT hours at rate × multiplier.",
      },
      {
        question: "What is time and a half?",
        answer: "1.5 times the regular hourly rate for overtime hours.",
      },
      {
        question: "Is this legal advice?",
        answer: "No. Results are educational gross-pay estimates only.",
      },
    ];
    const ld = faqPageJsonLd(faqs);
    assert.equal(ld["@type"], "FAQPage");
    assert.equal(ld.mainEntity.length, 3);
    assert.equal(ld.mainEntity[0]?.["@type"], "Question");
  });
});
