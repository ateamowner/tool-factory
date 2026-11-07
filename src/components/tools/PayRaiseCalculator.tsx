"use client";

import { useState } from "react";
import {
  computePayRaise,
  formatMoney,
  formatPct,
  type PayBasis,
  type RaiseMode,
} from "@/lib/pay-raise";

const MODE_OPTIONS: { id: RaiseMode; label: string }[] = [
  { id: "percent", label: "Raise by %" },
  { id: "amount", label: "Raise by $" },
  { id: "reverse", label: "Find raise %" },
];

const BASIS_OPTIONS: { id: PayBasis; label: string }[] = [
  { id: "hourly", label: "Hourly" },
  { id: "salary", label: "Salary" },
];

function parseAmount(value: string): number {
  const cleaned = value.replace(/[$,%]/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

export function PayRaiseCalculator() {
  const [mode, setMode] = useState<RaiseMode>("percent");
  const [basis, setBasis] = useState<PayBasis>("hourly");
  const [currentPay, setCurrentPay] = useState("20");
  const [raisePercent, setRaisePercent] = useState("5");
  const [raiseAmount, setRaiseAmount] = useState("1.50");
  const [newPay, setNewPay] = useState("22");
  const [hours, setHours] = useState("40");

  const unit = basis === "hourly" ? "per hour" : "per year";
  const result = computePayRaise({
    mode,
    basis,
    currentPay: parseAmount(currentPay),
    raisePercent: parseAmount(raisePercent),
    raiseAmount: parseAmount(raiseAmount),
    newPay: parseAmount(newPay),
    hoursPerWeek: parseAmount(hours),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Calculate</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="raise-mode"
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => setMode(option.id)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Pay type</legend>
          <div className="grid grid-cols-2 gap-2">
            {BASIS_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="raise-basis"
                  value={option.id}
                  checked={basis === option.id}
                  onChange={() => setBasis(option.id)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={basis === "hourly" ? "Current hourly rate ($)" : "Current annual salary ($)"}
            value={currentPay}
            onChange={setCurrentPay}
            placeholder={basis === "hourly" ? "20" : "60000"}
          />
          {mode === "percent" ? (
            <Field label="Raise (%)" value={raisePercent} onChange={setRaisePercent} placeholder="5" />
          ) : mode === "amount" ? (
            <Field
              label={`Raise amount ($ ${unit})`}
              value={raiseAmount}
              onChange={setRaiseAmount}
              placeholder={basis === "hourly" ? "1.50" : "3000"}
            />
          ) : (
            <Field
              label={basis === "hourly" ? "New hourly rate ($)" : "New annual salary ($)"}
              value={newPay}
              onChange={setNewPay}
              placeholder={basis === "hourly" ? "22" : "64000"}
            />
          )}
          <Field label="Hours per week" value={hours} onChange={setHours} placeholder="40" />
        </div>

        <p className="text-sm leading-6 text-muted">
          Gross pay before taxes, using 52 weeks a year. Numbers stay on this device. Nothing is
          uploaded, and there is no account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Your raise</h2>
        {result.valid ? (
          <>
            <dl className="mt-4 space-y-3 text-sm">
              <ResultRow label="Raise" value={formatPct(result.raisePercent)} emphasize />
              <ResultRow label="New hourly" value={formatMoney(result.newPay.hourly)} />
              <ResultRow label="New weekly" value={formatMoney(result.newPay.weekly)} />
              <ResultRow label="New monthly" value={formatMoney(result.newPay.monthly)} />
              <ResultRow label="New annual" value={formatMoney(result.newPay.annual)} />
            </dl>
            <h3 className="mt-5 text-sm font-semibold">Difference</h3>
            <dl className="mt-2 space-y-3 text-sm">
              <ResultRow label="Per hour" value={formatMoney(result.difference.hourly)} />
              <ResultRow label="Per week" value={formatMoney(result.difference.weekly)} />
              <ResultRow label="Per month" value={formatMoney(result.difference.monthly)} />
              <ResultRow label="Per year" value={formatMoney(result.difference.annual)} />
            </dl>
          </>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
        )}
        <p className="mt-4 text-sm leading-6 text-muted">
          Raise % = (new − old) ÷ old × 100. Gross estimate, not tax advice.
        </p>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-field"
        placeholder={placeholder}
      />
    </label>
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
      <dd className={`font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
