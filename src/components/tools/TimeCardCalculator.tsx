"use client";

import { useState } from "react";
import {
  DAY_LABELS,
  DEFAULT_TC_OT_MULTIPLIER,
  DEFAULT_TC_OT_THRESHOLD,
  computeTimeCard,
  formatDecimalHours,
  formatHoursMinutes,
  formatTimeCardUsd,
  parseTimeCardNumber,
  type TimeCardDayInput,
} from "@/lib/time-card";

const initialDays: TimeCardDayInput[] = DAY_LABELS.map((label, index) =>
  index < 5
    ? { label, start: "08:00", end: "16:30", breakMinutes: "30" }
    : { label, start: "", end: "", breakMinutes: "" },
);

export function TimeCardCalculator() {
  const [days, setDays] = useState<TimeCardDayInput[]>(initialDays);
  const [hourlyRate, setHourlyRate] = useState("20");
  const [otThreshold, setOtThreshold] = useState(String(DEFAULT_TC_OT_THRESHOLD));
  const [otMultiplier, setOtMultiplier] = useState(String(DEFAULT_TC_OT_MULTIPLIER));

  const result = computeTimeCard({
    days,
    hourlyRate: hourlyRate.trim() === "" ? null : parseTimeCardNumber(hourlyRate),
    otThreshold: parseTimeCardNumber(otThreshold),
    otMultiplier: parseTimeCardNumber(otMultiplier),
  });

  function updateDay(index: number, field: keyof Omit<TimeCardDayInput, "label">, value: string) {
    setDays((current) =>
      current.map((day, i) => (i === index ? { ...day, [field]: value } : day)),
    );
  }

  function clearAll() {
    setDays(DAY_LABELS.map((label) => ({ label, start: "", end: "", breakMinutes: "" })));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-2 pr-2 font-normal">Day</th>
                <th className="pb-2 pr-2 font-normal">Start</th>
                <th className="pb-2 pr-2 font-normal">End</th>
                <th className="pb-2 pr-2 font-normal">Break (min)</th>
                <th className="pb-2 text-right font-normal">Hours</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, index) => {
                const dayResult = result.days[index];
                return (
                  <tr key={day.label} className="align-middle">
                    <th scope="row" className="py-1 pr-2 text-left font-medium">
                      {day.label.slice(0, 3)}
                    </th>
                    <td className="py-1 pr-2">
                      <input
                        type="time"
                        aria-label={`${day.label} start time`}
                        value={day.start}
                        onChange={(event) => updateDay(index, "start", event.target.value)}
                        className="input-field"
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="time"
                        aria-label={`${day.label} end time`}
                        value={day.end}
                        onChange={(event) => updateDay(index, "end", event.target.value)}
                        className="input-field"
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-label={`${day.label} unpaid break minutes`}
                        value={day.breakMinutes}
                        onChange={(event) => updateDay(index, "breakMinutes", event.target.value)}
                        className="input-field"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-1 text-right font-mono tabular-nums">
                      {dayResult?.status === "ok"
                        ? `${formatHoursMinutes(dayResult.minutes)}${dayResult.overnight ? " ↻" : ""}`
                        : dayResult?.status === "invalid"
                          ? "!"
                          : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs leading-5 text-muted">
          An end time earlier than the start time counts as an overnight shift (↻).
          Leave a day blank if you did not work.{" "}
          <button type="button" onClick={clearAll} className="text-mint underline">
            Clear all days
          </button>
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Hourly rate (optional)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(event.target.value)}
              className="input-field"
              placeholder="20.00"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">OT after (hours / week)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={otThreshold}
              onChange={(event) => setOtThreshold(event.target.value)}
              className="input-field"
              placeholder="40"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">OT multiplier</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={otMultiplier}
              onChange={(event) => setOtMultiplier(event.target.value)}
              className="input-field"
              placeholder="1.5"
            />
          </label>
        </div>

        <p className="text-sm leading-6 text-muted">
          Totals are gross hours and pay before taxes and deductions. Overtime
          rules differ by employer and jurisdiction — this page is not legal
          advice. Times stay on this device.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Time card totals</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Total hours (h:mm)"
            value={result.valid ? formatHoursMinutes(result.totalMinutes) : "—"}
            emphasize
          />
          <ResultRow
            label="Decimal hours"
            value={result.valid ? formatDecimalHours(result.totalMinutes) : "—"}
          />
          <ResultRow
            label="Regular hours"
            value={result.valid ? formatDecimalHours(result.regularHours * 60) : "—"}
          />
          <ResultRow
            label="Overtime hours"
            value={result.valid ? formatDecimalHours(result.overtimeHours * 60) : "—"}
          />
          <ResultRow
            label="Regular pay"
            value={result.valid && result.regularPay !== null ? formatTimeCardUsd(result.regularPay) : "—"}
          />
          <ResultRow
            label="Overtime pay"
            value={result.valid && result.overtimePay !== null ? formatTimeCardUsd(result.overtimePay) : "—"}
          />
          <ResultRow
            label="Total gross pay"
            value={result.valid && result.totalPay !== null ? formatTimeCardUsd(result.totalPay) : "—"}
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">{result.summary}</p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ?? "Enter a start and end time for at least one day."}
          </p>
        )}
      </aside>
    </div>
  );
}

function ResultRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`text-right font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
