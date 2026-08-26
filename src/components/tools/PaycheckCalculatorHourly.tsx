"use client";

import { useState } from "react";
import {
  PAY_FREQUENCIES,
  computePaycheck,
  type PayFrequency,
  type PayMode,
} from "@/lib/paycheck-hourly";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function money(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function hoursLabel(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function PaycheckCalculatorHourly() {
  const [mode, setMode] = useState<PayMode>("hourly");
  const [hourlyRate, setHourlyRate] = useState("25");
  const [annualSalary, setAnnualSalary] = useState("52000");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [frequency, setFrequency] = useState<PayFrequency>("biweekly");
  const [includeOvertime, setIncludeOvertime] = useState(false);

  const result = computePaycheck({
    mode,
    hourlyRate: parseAmount(hourlyRate),
    annualSalary: parseAmount(annualSalary),
    hoursPerWeek: parseAmount(hoursPerWeek),
    frequency,
    includeOvertime: mode === "hourly" && includeOvertime,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Pay type</legend>
          <div className="flex gap-2">
            <label className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
              <input
                type="radio"
                name="pay-mode"
                value="hourly"
                checked={mode === "hourly"}
                onChange={() => setMode("hourly")}
                className="accent-mint"
              />
              Hourly
            </label>
            <label className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
              <input
                type="radio"
                name="pay-mode"
                value="salary"
                checked={mode === "salary"}
                onChange={() => setMode("salary")}
                className="accent-mint"
              />
              Salary
            </label>
          </div>
        </fieldset>

        {mode === "hourly" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Hourly rate</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(event.target.value)}
              className="input-field"
              placeholder="25.00"
            />
          </label>
        ) : (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Annual salary</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={annualSalary}
              onChange={(event) => setAnnualSalary(event.target.value)}
              className="input-field"
              placeholder="52000"
            />
          </label>
        )}

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Hours per week</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={hoursPerWeek}
            onChange={(event) => setHoursPerWeek(event.target.value)}
            className="input-field"
            placeholder="40"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Pay frequency</legend>
          <div className="grid grid-cols-2 gap-2">
            {PAY_FREQUENCIES.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="pay-frequency"
                  value={option.id}
                  checked={frequency === option.id}
                  onChange={() => setFrequency(option.id)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {mode === "hourly" ? (
          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={includeOvertime}
              onChange={(event) => setIncludeOvertime(event.target.checked)}
              className="mt-1 size-4 accent-mint"
            />
            <span>Count hours over 40 as overtime at 1.5×</span>
          </label>
        ) : null}

        <p className="text-sm leading-6 text-muted">
          Results are gross pay before taxes, deductions, and benefits. State
          and federal withholding are not applied.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Gross pay</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow label="Per paycheck" value={money(result.perPaycheck)} emphasize />
          <ResultRow label="Weekly" value={money(result.weeklyGross)} />
          <ResultRow label="Monthly" value={money(result.monthlyGross)} />
          <ResultRow label="Annual" value={money(result.annualGross)} />
          {mode === "hourly" && includeOvertime ? (
            <>
              <ResultRow label="Regular hours / week" value={hoursLabel(result.regularHours)} />
              <ResultRow label="Overtime hours / week" value={hoursLabel(result.overtimeHours)} />
            </>
          ) : null}
          {mode === "salary" ? (
            <ResultRow
              label="Hourly equivalent"
              value={money(result.hourlyEquivalent)}
            />
          ) : null}
        </dl>
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
        className={`font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
