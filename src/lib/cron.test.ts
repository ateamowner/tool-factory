import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CRON_PRESETS,
  applyCronPreset,
  buildCronExpression,
  describeCron,
  expandCronField,
  nextCronRuns,
  parseCronExpression,
} from "./cron.ts";

describe("cron expression helpers", () => {
  it("builds a 5-field expression from the field object", () => {
    assert.equal(
      buildCronExpression({
        minute: "0",
        hour: "9",
        dayOfMonth: "*",
        month: "*",
        dayOfWeek: "1-5",
      }),
      "0 9 * * 1-5",
    );
  });

  it("parses standard expressions and named month or weekday tokens", () => {
    const weekday = parseCronExpression("0 9 * * 1-5");
    assert.equal(weekday.ok, true);
    if (!weekday.ok) return;
    assert.deepEqual(weekday.fields, {
      minute: "0",
      hour: "9",
      dayOfMonth: "*",
      month: "*",
      dayOfWeek: "1-5",
    });
    assert.deepEqual(weekday.allowed.dayOfWeek, [1, 2, 3, 4, 5]);

    const named = parseCronExpression("0 0 1 JAN SUN");
    assert.equal(named.ok, true);
    if (!named.ok) return;
    assert.deepEqual(named.allowed.month, [1]);
    assert.deepEqual(named.allowed.dayOfWeek, [0]);

    const sundaySeven = parseCronExpression("0 0 * * 7");
    assert.equal(sundaySeven.ok, true);
    if (!sundaySeven.ok) return;
    assert.deepEqual(sundaySeven.allowed.dayOfWeek, [0]);
  });

  it("expands lists, ranges, and steps", () => {
    assert.deepEqual(expandCronField("*/15", "minute"), [0, 15, 30, 45]);
    assert.deepEqual(expandCronField("1,15,28", "dayOfMonth"), [1, 15, 28]);
    assert.deepEqual(expandCronField("JAN-MAR", "month"), [1, 2, 3]);
    assert.deepEqual(expandCronField("0-7/2", "dayOfWeek"), [0, 2, 4, 6]);
  });

  it("rejects empty, six-field, and out-of-range expressions", () => {
    assert.equal(parseCronExpression("").ok, false);
    assert.equal(parseCronExpression("* * *").ok, false);
    assert.equal(parseCronExpression("0 0 0 0 0 0").ok, false);
    assert.equal(parseCronExpression("60 * * * *").ok, false);
    assert.equal(parseCronExpression("0 24 * * *").ok, false);
    assert.equal(parseCronExpression("0 0 0 * *").ok, false);
    assert.equal(parseCronExpression("0 0 * 13 *").ok, false);
  });

  it("describes common presets in plain language", () => {
    assert.deepEqual(describeCron("* * * * *"), { ok: true, summary: "Every minute" });
    assert.deepEqual(describeCron("*/15 * * * *"), {
      ok: true,
      summary: "Every 15 minutes",
    });
    assert.deepEqual(describeCron("0 * * * *"), {
      ok: true,
      summary: "At minute 0 of every hour",
    });
    assert.deepEqual(describeCron("0 0 * * *"), {
      ok: true,
      summary: "At 00:00 every day",
    });
    assert.deepEqual(describeCron("0 12 * * *"), {
      ok: true,
      summary: "At 12:00 every day",
    });
    assert.deepEqual(describeCron("0 */6 * * *"), {
      ok: true,
      summary: "Every 6 hours",
    });
    assert.deepEqual(describeCron("0 9 * * 1-5"), {
      ok: true,
      summary: "At 09:00 on Monday through Friday",
    });
    assert.deepEqual(describeCron("0 0 * * 0"), {
      ok: true,
      summary: "At 00:00 on Sunday",
    });
    assert.deepEqual(describeCron("0 0 1 * *"), {
      ok: true,
      summary: "At 00:00 on day 1 of every month",
    });
    assert.deepEqual(describeCron("0 9,17 * * *"), {
      ok: true,
      summary: "At 09:00 and 17:00 every day",
    });
    assert.deepEqual(describeCron("0 0 1 * 1"), {
      ok: true,
      summary: "At 00:00 on day 1 of every month and on Monday",
    });
  });

  it("previews the next local run times after the given instant", () => {
    const hourly = nextCronRuns("0 * * * *", new Date(2026, 0, 1, 10, 30, 0), 3);
    assert.equal(hourly.ok, true);
    if (!hourly.ok) return;
    assert.deepEqual(
      hourly.runs.map((date) => date.getTime()),
      [
        new Date(2026, 0, 1, 11, 0, 0).getTime(),
        new Date(2026, 0, 1, 12, 0, 0).getTime(),
        new Date(2026, 0, 1, 13, 0, 0).getTime(),
      ],
    );

    const daily = nextCronRuns("0 0 * * *", new Date(2026, 0, 1, 0, 0, 0), 2);
    assert.equal(daily.ok, true);
    if (!daily.ok) return;
    assert.deepEqual(
      daily.runs.map((date) => date.getTime()),
      [new Date(2026, 0, 2, 0, 0, 0).getTime(), new Date(2026, 0, 3, 0, 0, 0).getTime()],
    );

    const weekdays = nextCronRuns("0 9 * * 1-5", new Date(2026, 0, 2, 10, 0, 0), 1);
    assert.equal(weekdays.ok, true);
    if (!weekdays.ok) return;
    assert.equal(weekdays.runs[0]?.getTime(), new Date(2026, 0, 5, 9, 0, 0).getTime());

    const sunday = nextCronRuns("0 0 * * 0", new Date(2026, 0, 3, 12, 0, 0), 1);
    assert.equal(sunday.ok, true);
    if (!sunday.ok) return;
    assert.equal(sunday.runs[0]?.getTime(), new Date(2026, 0, 4, 0, 0, 0).getTime());

    const monthly = nextCronRuns("0 0 1 * *", new Date(2026, 0, 15, 8, 0, 0), 1);
    assert.equal(monthly.ok, true);
    if (!monthly.ok) return;
    assert.equal(monthly.runs[0]?.getTime(), new Date(2026, 1, 1, 0, 0, 0).getTime());
  });

  it("ORs day-of-month and day-of-week when both are restricted", () => {
    const next = nextCronRuns("0 0 1 * 1", new Date(2026, 0, 1, 0, 0, 0), 2);
    assert.equal(next.ok, true);
    if (!next.ok) return;
    assert.deepEqual(
      next.runs.map((date) => date.getTime()),
      [new Date(2026, 0, 5, 0, 0, 0).getTime(), new Date(2026, 0, 12, 0, 0, 0).getTime()],
    );
  });

  it("ships presets that parse and match their labels", () => {
    assert.equal(buildCronExpression(applyCronPreset("every-minute")), "* * * * *");
    assert.equal(buildCronExpression(applyCronPreset("hourly")), "0 * * * *");
    assert.equal(buildCronExpression(applyCronPreset("daily-midnight")), "0 0 * * *");
    assert.equal(buildCronExpression(applyCronPreset("weekdays-9am")), "0 9 * * 1-5");
    assert.equal(buildCronExpression(applyCronPreset("weekly-sunday-midnight")), "0 0 * * 0");
    assert.equal(buildCronExpression(applyCronPreset("monthly-1st")), "0 0 1 * *");
    assert.equal(CRON_PRESETS["every-5-minutes"].label, "Every 5 minutes");
    assert.equal(parseCronExpression(buildCronExpression(applyCronPreset("every-15-minutes"))).ok, true);
  });
});
