"use client";

import { useState } from "react";
import {
  DEFAULT_OT_MULTIPLIER,
  DEFAULT_OT_THRESHOLD,
  computeOvertime,
  formatHours,
  formatMultiplier,
  formatUsd,
  parseOvertimeNumber,
  type OvertimeMode,
} from "@/lib/overtime";

export function OvertimeCalculator() {
  const [mode, setMode] = useState<OvertimeMode>("total");
  const [hourlyRate, setHourlyRate] = useState("20");
  const [regularHours, setRegularHours] = useState("40");
  const [overtimeHours, setOvertimeHours] = useState("5");
  const [totalHours, setTotalHours] = useState("45");
  const [otThreshold, setOtThreshold] = useState(String(DEFAULT_OT_THRESHOLD));
  const [otMultiplier, setOtMultiplier] = useState(String(DEFAULT_OT_MULTIPLIER));

  const result = computeOvertime({
    mode,
    hourlyRate: parseOvertimeNumber(hourlyRate),
    regularHours: parseOvertimeNumber(regularHours),
    overtimeHours:
      overtimeHours.trim() === "" ? 0 : parseOvertimeNumber(overtimeHours),
    totalHours: parseOvertimeNumber(totalHours),
    otThreshold: parseOvertimeNumber(otThreshold),
    otMultiplier: parseOvertimeNumber(otMultiplier),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Hours entry</legend>
          <div className="flex gap-2">
            <label className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
              <input
                type="radio"
                name="ot-mode"
                value="total"
                checked={mode === "total"}
                onChange={() => setMode("total")}
                className="accent-mint"
              />
              Total hours
            </label>
            <label className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
              <input
                type="radio"
                name="ot-mode"
                value="split"
                checked={mode === "split"}
                onChange={() => setMode("split")}
                className="accent-mint"
              />
              Regular + OT
            </label>
          </div>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Hourly rate</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={hourlyRate}
            onChange={(event) => setHourlyRate(event.target.value)}
            className="input-field"
            placeholder="20.00"
          />
          <span className="mt-2 block text-muted">
            Regular (straight-time) rate before the overtime multiplier.
          </span>
        </label>

        {mode === "total" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Total hours worked</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={totalHours}
                onChange={(event) => setTotalHours(event.target.value)}
                className="input-field"
                placeholder="45"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">
                OT threshold (hours / week)
              </span>
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
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Regular hours</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={regularHours}
                onChange={(event) => setRegularHours(event.target.value)}
                className="input-field"
                placeholder="40"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Overtime hours</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={overtimeHours}
                onChange={(event) => setOvertimeHours(event.target.value)}
                className="input-field"
                placeholder="5"
              />
            </label>
          </div>
        )}

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Overtime multiplier</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={otMultiplier}
            onChange={(event) => setOtMultiplier(event.target.value)}
            className="input-field"
            placeholder="1.5"
          />
          <span className="mt-2 block text-muted">
            Default is 1.5 (time and a half). Use 2 for double time when that applies.
          </span>
        </label>

        <p className="text-sm leading-6 text-muted">
          Results are gross pay before taxes and deductions. Rules for who is
          overtime-eligible differ by employer and jurisdiction — this page is
          not legal advice. Numbers stay on this device.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Overtime pay results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Total pay"
            value={
              result.valid && result.totalPay !== null
                ? formatUsd(result.totalPay)
                : "—"
            }
            emphasize
          />
          <ResultRow
            label="Regular pay"
            value={
              result.valid && result.regularPay !== null
                ? formatUsd(result.regularPay)
                : "—"
            }
          />
          <ResultRow
            label="Overtime pay"
            value={
              result.valid && result.overtimePay !== null
                ? formatUsd(result.overtimePay)
                : "—"
            }
          />
          <ResultRow
            label="OT rate"
            value={
              result.valid && result.otRate !== null
                ? `${formatUsd(result.otRate)}/hr (${formatMultiplier(result.otMultiplier ?? DEFAULT_OT_MULTIPLIER)})`
                : "—"
            }
          />
          <ResultRow
            label="Regular hours"
            value={
              result.valid && result.regularHours !== null
                ? formatHours(result.regularHours)
                : "—"
            }
          />
          <ResultRow
            label="Overtime hours"
            value={
              result.valid && result.overtimeHours !== null
                ? formatHours(result.overtimeHours)
                : "—"
            }
          />
          <ResultRow
            label="If same week twice (biweekly)"
            value={
              result.valid && result.biweeklyPay !== null
                ? formatUsd(result.biweeklyPay)
                : "—"
            }
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">{result.summary}</p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Educational gross estimate, not payroll or legal advice. Taxes,
            premiums, and who qualifies for OT can differ.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter an hourly rate, hours, and an overtime multiplier of 1 or more."}
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
