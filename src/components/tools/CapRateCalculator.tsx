"use client";

import { useState } from "react";
import { computeCapRate, valueFromCapRate } from "@/lib/cap-rate";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function CapRateCalculator() {
  const [value, setValue] = useState("400000");
  const [income, setIncome] = useState("36000");
  const [vacancy, setVacancy] = useState("5");
  const [expenses, setExpenses] = useState("12000");
  const [percentMode, setPercentMode] = useState(false);
  const [target, setTarget] = useState("6");

  const result = computeCapRate({
    propertyValue: Number(value),
    grossAnnualIncome: Number(income),
    vacancyPercent: Number(vacancy),
    operatingExpenses: Number(expenses),
    expensesArePercent: percentMode,
  });
  const implied = result.valid ? valueFromCapRate(result.noi, Number(target)) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,1fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm" htmlFor="cap-value">
          <span className="mb-2 block text-xs text-muted">Property value or purchase price ($)</span>
          <input id="cap-value" type="number" inputMode="decimal" min="0" step="any" value={value} onChange={(e) => setValue(e.target.value)} className="input-field" />
        </label>
        <label className="block text-sm" htmlFor="cap-income">
          <span className="mb-2 block text-xs text-muted">Gross annual rental income ($)</span>
          <input id="cap-income" type="number" inputMode="decimal" min="0" step="any" value={income} onChange={(e) => setIncome(e.target.value)} className="input-field" />
        </label>
        <label className="block text-sm" htmlFor="cap-vacancy">
          <span className="mb-2 block text-xs text-muted">Vacancy and credit loss (%)</span>
          <input id="cap-vacancy" type="number" inputMode="decimal" min="0" max="100" step="any" value={vacancy} onChange={(e) => setVacancy(e.target.value)} className="input-field" />
        </label>
        <label className="block text-sm" htmlFor="cap-mode">
          <span className="mb-2 block text-xs text-muted">Operating expenses entered as</span>
          <select
            id="cap-mode"
            value={percentMode ? "percent" : "dollars"}
            onChange={(e) => {
              const pct = e.target.value === "percent";
              setPercentMode(pct);
              setExpenses(pct ? "35" : "12000");
            }}
            className="input-field"
          >
            <option value="dollars">Dollars per year</option>
            <option value="percent">Percent of effective income</option>
          </select>
        </label>
        <label className="block text-sm" htmlFor="cap-expenses">
          <span className="mb-2 block text-xs text-muted">{percentMode ? "Operating expenses (% of income)" : "Operating expenses ($ per year)"}</span>
          <input id="cap-expenses" type="number" inputMode="decimal" min="0" step="any" value={expenses} onChange={(e) => setExpenses(e.target.value)} className="input-field" />
        </label>
        <label className="block text-sm" htmlFor="cap-target">
          <span className="mb-2 block text-xs text-muted">Target cap rate for implied value (%)</span>
          <input id="cap-target" type="number" inputMode="decimal" min="0" step="any" value={target} onChange={(e) => setTarget(e.target.value)} className="input-field" />
        </label>
        <p className="text-sm leading-6 text-muted">
          Operating expenses are taxes, insurance, maintenance, management, and utilities you pay. Do not include mortgage payments.
        </p>
      </form>

      <div className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" aria-live="polite">
        {result.valid ? (
          <>
            <div>
              <div className="text-xs text-muted">Cap rate</div>
              <div className="mt-1 text-4xl font-semibold tabular-nums">{result.capRate}%</div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between gap-3"><span className="text-muted">Gross annual income</span><span className="tabular-nums">{usd.format(Number(income))}</span></li>
              <li className="flex justify-between gap-3"><span className="text-muted">Vacancy loss</span><span className="tabular-nums">−{usd.format(result.vacancyLoss)}</span></li>
              <li className="flex justify-between gap-3"><span className="text-muted">Effective gross income</span><span className="tabular-nums">{usd.format(result.effectiveGrossIncome)}</span></li>
              <li className="flex justify-between gap-3"><span className="text-muted">Operating expenses</span><span className="tabular-nums">−{usd.format(result.operatingExpenses)}</span></li>
              <li className="flex justify-between gap-3 border-t border-line pt-2 font-semibold"><span>Net operating income (NOI)</span><span className="tabular-nums">{usd.format(result.noi)}</span></li>
            </ul>
            {implied !== null ? (
              <p className="rounded-xl border border-line p-3 text-sm">
                At a {Number(target)}% cap rate, this NOI implies a value of{" "}
                <span className="font-semibold tabular-nums">{usd.format(implied)}</span>.
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted">{result.error}</p>
        )}
      </div>
    </div>
  );
}
