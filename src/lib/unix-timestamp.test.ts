import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AUTO_MS_THRESHOLD,
  datePartsToUnix,
  detectUnit,
  formatDateInput,
  formatTimeInput,
  formatUtc,
  nowUnix,
  parseDateTimeInputs,
  parseUnixNumber,
  unixToDate,
} from "./unix-timestamp.ts";

describe("parseUnixNumber", () => {
  it("accepts integers, commas, decimals, and scientific notation", () => {
    assert.equal(parseUnixNumber("1609459200"), 1609459200);
    assert.equal(parseUnixNumber(" 1,609,459,200 "), 1609459200);
    assert.equal(parseUnixNumber("1609459200.5"), 1609459200.5);
    assert.equal(parseUnixNumber("1.6094592e9"), 1609459200);
    assert.equal(parseUnixNumber("-1"), -1);
  });

  it("rejects empty and non-numeric input", () => {
    assert.equal(parseUnixNumber(""), null);
    assert.equal(parseUnixNumber("   "), null);
    assert.equal(parseUnixNumber("abc"), null);
    assert.equal(parseUnixNumber("12abc"), null);
    assert.equal(parseUnixNumber("Infinity"), null);
  });
});

describe("detectUnit", () => {
  it("treats current-era 10-digit values as seconds and 13-digit as milliseconds", () => {
    assert.equal(detectUnit(1609459200), "seconds");
    assert.equal(detectUnit(1609459200000), "milliseconds");
    assert.equal(detectUnit(-1609459200000), "milliseconds");
    assert.equal(detectUnit(AUTO_MS_THRESHOLD), "milliseconds");
    assert.equal(detectUnit(AUTO_MS_THRESHOLD - 1), "seconds");
  });
});

describe("unixToDate", () => {
  it("converts the epoch and a known 2021-01-01 UTC instant both ways", () => {
    const epoch = unixToDate("0");
    assert.ok(epoch.ok);
    assert.equal(epoch.unit, "seconds");
    assert.equal(epoch.milliseconds, 0);
    assert.equal(epoch.integerSeconds, 0);
    assert.equal(epoch.utc, "1970-01-01 00:00:00 UTC");
    assert.equal(epoch.iso, "1970-01-01T00:00:00.000Z");
    assert.equal(epoch.rfc, "Thu, 01 Jan 1970 00:00:00 GMT");
    assert.equal(formatUtc(new Date(0)), "1970-01-01 00:00:00 UTC");

    const seconds = unixToDate("1609459200");
    assert.ok(seconds.ok);
    assert.equal(seconds.unit, "seconds");
    assert.equal(seconds.milliseconds, 1609459200000);
    assert.equal(seconds.utc, "2021-01-01 00:00:00 UTC");
    assert.equal(seconds.iso, "2021-01-01T00:00:00.000Z");

    const millis = unixToDate("1609459200000");
    assert.ok(millis.ok);
    assert.equal(millis.unit, "milliseconds");
    assert.equal(millis.milliseconds, 1609459200000);
    assert.equal(millis.utc, "2021-01-01 00:00:00 UTC");
  });

  it("honors an explicit unit even when auto-detect would choose the other", () => {
    const asSeconds = unixToDate("1609459200000", "seconds");
    assert.ok(asSeconds.ok);
    assert.equal(asSeconds.unit, "seconds");
    assert.equal(asSeconds.integerSeconds, 1609459200000);

    const asMillis = unixToDate("1609459200", "milliseconds");
    assert.ok(asMillis.ok);
    assert.equal(asMillis.unit, "milliseconds");
    assert.equal(asMillis.utc, "1970-01-19 15:04:19 UTC");
  });

  it("supports fractional seconds and dates before 1970", () => {
    const frac = unixToDate("1609459200.5");
    assert.ok(frac.ok);
    assert.equal(frac.milliseconds, 1609459200500);
    assert.equal(frac.iso, "2021-01-01T00:00:00.500Z");
    assert.equal(frac.integerSeconds, 1609459200);

    const before = unixToDate("-1");
    assert.ok(before.ok);
    assert.equal(before.utc, "1969-12-31 23:59:59 UTC");
    assert.equal(before.integerSeconds, -1);
  });

  it("reports empty, invalid, and out-of-range input", () => {
    assert.equal(unixToDate("").error, "Enter a Unix timestamp.");
    assert.equal(unixToDate("nope").error, "Enter a valid number.");
    const huge = unixToDate("9e18", "milliseconds");
    assert.ok(!huge.ok);
    assert.match(huge.error, /outside the range/);
  });
});

describe("datePartsToUnix and parseDateTimeInputs", () => {
  it("converts a UTC date and time back to the matching Unix timestamp", () => {
    const result = datePartsToUnix({
      year: 2021,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      zone: "utc",
    });
    assert.ok(result.ok);
    assert.equal(result.integerSeconds, 1609459200);
    assert.equal(result.milliseconds, 1609459200000);
    assert.equal(result.utc, "2021-01-01 00:00:00 UTC");
  });

  it("parses date and time fields, including optional seconds and milliseconds", () => {
    const result = parseDateTimeInputs("2021-01-01", "00:00:00.500", "utc");
    assert.ok(result.ok);
    assert.equal(result.milliseconds, 1609459200500);
    assert.equal(result.iso, "2021-01-01T00:00:00.500Z");
  });

  it("rejects invalid calendar dates and malformed fields", () => {
    assert.ok(!datePartsToUnix({
      year: 2021,
      month: 2,
      day: 31,
      hour: 0,
      minute: 0,
      second: 0,
      zone: "utc",
    }).ok);
    assert.equal(parseDateTimeInputs("2021/01/01", "00:00", "utc").error, "Enter a valid date.");
    assert.equal(parseDateTimeInputs("2021-01-01", "25:00", "utc").error, "Enter a valid date and time.");
  });

  it("round-trips a local date through the same zone", () => {
    const local = datePartsToUnix({
      year: 2021,
      month: 6,
      day: 15,
      hour: 12,
      minute: 30,
      second: 45,
      zone: "local",
    });
    assert.ok(local.ok);
    const date = new Date(2021, 5, 15, 12, 30, 45);
    assert.equal(local.milliseconds, date.getTime());
    assert.equal(formatDateInput(date, "local"), "2021-06-15");
    assert.equal(formatTimeInput(date, "local"), "12:30:45");
    assert.equal(formatDateInput(new Date(Date.UTC(2021, 0, 1)), "utc"), "2021-01-01");
    assert.equal(formatTimeInput(new Date(Date.UTC(2021, 0, 1, 7, 8, 9)), "utc"), "07:08:09");
  });
});

describe("nowUnix", () => {
  it("returns seconds and milliseconds for a known instant", () => {
    const now = nowUnix(1609459200500);
    assert.equal(now.milliseconds, 1609459200500);
    assert.equal(now.integerSeconds, 1609459200);
    assert.equal(now.utc, "2021-01-01 00:00:00 UTC");
  });
});
