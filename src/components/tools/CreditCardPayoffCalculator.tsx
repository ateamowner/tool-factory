"use client";

import { useState } from "react";
import {
  computeCreditCardPayoff,
  formatDuration,
  formatMoney,
  type PayoffMode,
} from "@/lib/credit-card-payoff";

const MODE_OPTIONS: { id: PayoffMode; label: string }[] = [
  { id: "payment", label: "Months to pay off" },
  { id: "months", label: "Payment for a goal" },
];

function parseAmount(value: string): number {
  const cleaned = value.replace(/[$,%]/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function payoffDate(months: number): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function CreditCardPayoffCalculator() {
  const [mode, setMode] = useState<PayoffMode>("payment");
  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("22");
  const [payment, setPayment] = useState("200");
  const [months, setMonths] = useState("24");

  const result = computeCreditCardPayoff({
    mode,
    balance: parseAmount(balance),
    apr: parseAmount(apr),
    monthlyPayment: parseAmount(payment),
    months: parseAmount(months),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Calculate</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="payoff-mode"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Card balance ($)" value={balance} onChange={setBalance} placeholder="5000" />
          <Field label="APR (%)" value={apr} onChange={setApr} placeholder="22" />
          {mode === "payment" ? (
            <Field label="Monthly payment ($)" value={payment} onChange={setPayment} placeholder="200" />
          ) : (
            <Field label="Months until debt-free" value={months} onChange={setMonths} placeholder="24" />
          )}
        </div>

        <p className="text-sm leading-6 text-muted">
          Assumes no new charges, a fixed APR, and interest compounded monthly. Numbers stay on this
          device. Nothing is uploaded, and there is no account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Your payoff plan</h2>
        {result.valid ? (
          <dl className="mt-4 space-y-3 text-sm">
            {mode === "payment" ? (
              <ResultRow label="Time to pay off" value={formatDuration(result.months)} emphasize />
            ) : (
              <ResultRow label="Monthly payment" value={formatMoney(result.monthlyPayment)} emphasize />
            )}
            <ResultRow label="Debt-free by" value={payoffDate(result.months)} />
            <ResultRow label="Number of payments" value={String(result.months)} />
            {mode === "payment" ? (
              <ResultRow label="Last payment" value={formatMoney(result.lastPayment)} />
            ) : null}
            <ResultRow label="Total interest" value={formatMoney(result.totalInterest)} />
            <ResultRow label="Total paid" value={formatMoney(result.totalPaid)} />
            <ResultRow label="First month's interest" value={formatMoney(result.firstMonthInterest)} />
          </dl>
        ) : result.paymentTooLow ? (
          <div
            role="alert"
            className="mt-4 rounded-[10px] border border-red-500/60 bg-red-500/10 p-3 text-sm leading-6"
          >
            <p className="font-semibold">Payment too low</p>
            <p className="mt-1">{result.error}</p>
            <p className="mt-1">
              Interest this month: {formatMoney(result.firstMonthInterest ?? 0)}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
        )}
        <p className="mt-4 text-sm leading-6 text-muted">
          Monthly interest = balance × APR ÷ 12. Estimate only, not financial advice.
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
