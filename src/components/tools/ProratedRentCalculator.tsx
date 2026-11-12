"use client";

import { useState } from "react";
import { computeProratedRent, type ProrateMode } from "@/lib/prorated-rent";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ProratedRentCalculator() {
  const [rent, setRent] = useState("1500");
  const [date, setDate] = useState("2026-11-15");
  const [mode, setMode] = useState<ProrateMode>("move-in");
  const result = computeProratedRent(Number(rent), date, mode);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,1fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <label className="block text-sm" htmlFor="pr-rent">
          <span className="mb-2 block text-xs text-muted">Monthly rent ($)</span>
          <input
            id="pr-rent"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            className="input-field"
          />
        </label>
        <label className="block text-sm" htmlFor="pr-mode">
          <span className="mb-2 block text-xs text-muted">Prorate for</span>
          <select id="pr-mode" value={mode} onChange={(e) => setMode(e.target.value as ProrateMode)} className="input-field">
            <option value="move-in">Move-in (from this date to the end of the month)</option>
            <option value="move-out">Move-out (from the 1st through this date)</option>
          </select>
        </label>
        <label className="block text-sm" htmlFor="pr-date">
          <span className="mb-2 block text-xs text-muted">{mode === "move-in" ? "Move-in date" : "Move-out date"}</span>
          <input id="pr-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
        </label>
        <p className="text-sm leading-6 text-muted">
          The move-in or move-out day is counted as a day of rent. Daily rate = monthly rent ÷ days in the month (or ÷ 30, or annual rent ÷ 365).
        </p>
      </form>

      <div className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" aria-live="polite">
        {result.valid ? (
          <>
            <p className="text-sm text-muted">
              {result.daysCharged} of {result.daysInMonth} days in the month are charged.
            </p>
            <ul className="space-y-3">
              {result.lines.map((l) => (
                <li key={l.method} className="rounded-xl border border-line p-3 text-sm">
                  <div className="text-xs text-muted">{l.label}</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{usd.format(l.amount)}</div>
                  <div className="mt-1 font-mono text-xs tabular-nums text-muted">
                    {usd.format(l.dailyRate)} per day × {l.days} days
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted">{result.error}</p>
        )}
      </div>
    </div>
  );
}
