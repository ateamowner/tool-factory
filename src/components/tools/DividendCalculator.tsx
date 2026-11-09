"use client";

import { useState } from "react";
import {
  computeDividend,
  formatMoney,
  formatShares,
  frequencyName,
  FREQUENCIES,
  type DividendMode,
  type HoldingMode,
} from "@/lib/dividend";

function parseAmount(value: string): number {
  const cleaned = value.replace(/[$,%]/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

export function DividendCalculator() {
  const [holdingMode, setHoldingMode] = useState<HoldingMode>("shares");
  const [holding, setHolding] = useState("100");
  const [price, setPrice] = useState("50");
  const [dividendMode, setDividendMode] = useState<DividendMode>("perShare");
  const [dividend, setDividend] = useState("2");
  const [frequency, setFrequency] = useState("4");
  const [years, setYears] = useState("10");
  const [dividendGrowth, setDividendGrowth] = useState("0");
  const [priceGrowth, setPriceGrowth] = useState("0");

  const result = computeDividend({
    holdingMode,
    holding: parseAmount(holding),
    price: parseAmount(price),
    dividendMode,
    dividend: parseAmount(dividend),
    frequency: Number(frequency),
    years: parseAmount(years),
    dividendGrowth: parseAmount(dividendGrowth),
    priceGrowth: parseAmount(priceGrowth),
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <form
          className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <Toggle
            legend="I know my"
            name="holding-mode"
            value={holdingMode}
            onChange={(v) => setHoldingMode(v as HoldingMode)}
            options={[
              { id: "shares", label: "Number of shares" },
              { id: "amount", label: "Amount invested" },
            ]}
          />
          <Toggle
            legend="Dividend as"
            name="dividend-mode"
            value={dividendMode}
            onChange={(v) => setDividendMode(v as DividendMode)}
            options={[
              { id: "perShare", label: "Per share per year" },
              { id: "yield", label: "Yield (%)" },
            ]}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={holdingMode === "shares" ? "Shares owned" : "Amount invested ($)"}
              value={holding}
              onChange={setHolding}
              placeholder="100"
            />
            <Field label="Share price ($)" value={price} onChange={setPrice} placeholder="50" />
            <Field
              label={dividendMode === "perShare" ? "Annual dividend per share ($)" : "Dividend yield (%)"}
              value={dividend}
              onChange={setDividend}
              placeholder={dividendMode === "perShare" ? "2" : "4"}
            />
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Payout frequency</span>
              <select
                className="input-field"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {frequencyName(f)} ({f}x a year)
                  </option>
                ))}
              </select>
            </label>
            <Field label="Years to project (DRIP)" value={years} onChange={setYears} placeholder="10" />
            <Field label="Dividend growth per year (%)" value={dividendGrowth} onChange={setDividendGrowth} placeholder="0" />
            <Field label="Share price growth per year (%)" value={priceGrowth} onChange={setPriceGrowth} placeholder="0" />
          </div>

          <p className="text-sm leading-6 text-muted">
            DRIP assumes every payout is reinvested in more shares at the projected price, with no
            taxes or fees. Numbers stay on this device. Nothing is uploaded, and there is no account.
          </p>
        </form>

        <aside
          className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
          aria-live="polite"
        >
          <h2 className="text-lg font-semibold">Your dividend income</h2>
          {result.valid ? (
            <dl className="mt-4 space-y-3 text-sm">
              <ResultRow label="Annual dividend income" value={formatMoney(result.annualIncome)} emphasize />
              <ResultRow label={`Per ${frequencyName(result.frequency).toLowerCase()} payout`} value={formatMoney(result.perPayout)} />
              <ResultRow label="Average per month" value={formatMoney(result.monthlyIncome)} />
              <ResultRow label="Shares" value={formatShares(result.shares)} />
              <ResultRow label="Position value" value={formatMoney(result.invested)} />
              <ResultRow label="Dividend per share (year)" value={formatMoney(result.annualDividendPerShare)} />
              <ResultRow label="Dividend yield" value={`${result.yieldPercent.toFixed(2)}%`} />
              {result.rows.length > 0 ? (
                <>
                  <ResultRow label={`Shares after ${result.rows.length} yr (DRIP)`} value={formatShares(result.dripFinalShares)} />
                  <ResultRow label="Value with DRIP" value={formatMoney(result.dripFinalValue)} emphasize />
                  <ResultRow label="Dividends received (DRIP)" value={formatMoney(result.dripTotalDividends)} />
                  <ResultRow label="Dividends without DRIP" value={formatMoney(result.noDripTotalDividends)} />
                </>
              ) : null}
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
          )}
          <p className="mt-4 text-sm leading-6 text-muted">
            Annual income = shares × annual dividend per share. Estimate only, not financial advice.
          </p>
        </aside>
      </div>

      {result.valid && result.rows.length > 0 ? (
        <section className="overflow-x-auto rounded-2xl border border-line bg-card p-4 sm:p-6" aria-labelledby="drip-heading">
          <h2 id="drip-heading" className="text-lg font-semibold">
            DRIP projection by year
          </h2>
          <table className="mt-4 w-full min-w-[34rem] text-left text-sm tabular-nums">
            <thead className="text-xs text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Year</th>
                <th className="py-2 pr-4 font-medium">Shares</th>
                <th className="py-2 pr-4 font-medium">Dividends this year</th>
                <th className="py-2 pr-4 font-medium">Total dividends</th>
                <th className="py-2 font-medium">Portfolio value</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.year} className="border-t border-line">
                  <td className="py-2 pr-4">{row.year}</td>
                  <td className="py-2 pr-4">{formatShares(row.shares)}</td>
                  <td className="py-2 pr-4">{formatMoney(row.dividendsThisYear)}</td>
                  <td className="py-2 pr-4">{formatMoney(row.totalDividends)}</td>
                  <td className="py-2">{formatMoney(row.portfolioValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}

function Toggle({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <fieldset>
      <legend className="mb-2 block text-xs text-muted">{legend}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="accent-mint"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
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
