"use client";

import { useState } from "react";
import { computeAmortization } from "@/lib/amortization";

function parseAmount(value: string): number {
  const cleaned = value.replace(/[,$]/g, "").trim();
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

export function AmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState("300000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [extra, setExtra] = useState("0");
  const [view, setView] = useState<"yearly" | "monthly">("yearly");

  const result = computeAmortization({
    loanAmount: parseAmount(loanAmount),
    annualRatePercent: parseAmount(rate),
    termYears: parseAmount(years),
    extraMonthly: extra.trim() === "" ? 0 : parseAmount(extra),
  });

  const yearly: { year: number; principal: number; interest: number; balance: number }[] = [];
  for (const row of result.schedule) {
    const y = Math.ceil(row.month / 12);
    const last = yearly[yearly.length - 1];
    if (!last || last.year !== y) yearly.push({ year: y, principal: row.principal, interest: row.interest, balance: row.balance });
    else {
      last.principal += row.principal;
      last.interest += row.interest;
      last.balance = row.balance;
    }
  }

  const fields: [string, string, (v: string) => void, string][] = [
    ["Loan amount", loanAmount, setLoanAmount, "300000"],
    ["Interest rate (APR %)", rate, setRate, "6.5"],
    ["Loan term (years)", years, setYears, "30"],
    ["Extra monthly principal (optional)", extra, setExtra, "0"],
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <form
          className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
          onSubmit={(event) => event.preventDefault()}
        >
          {fields.map(([label, value, set, placeholder]) => (
            <label key={label} className="block text-sm">
              <span className="mb-2 block text-xs text-muted">{label}</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={value}
                onChange={(event) => set(event.target.value)}
                className="input-field"
                placeholder={placeholder}
              />
            </label>
          ))}
          <p className="text-sm leading-6 text-muted">
            Numbers stay on this device. Nothing is uploaded, and there is no account.
          </p>
        </form>
        <aside
          className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
          aria-live="polite"
        >
          <p className="text-xs text-muted">Monthly payment (principal &amp; interest)</p>
          <p className="mt-1 text-3xl font-semibold">{money(result.monthlyPayment)}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted">Total interest</dt><dd>{money(result.totalInterest)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Total paid</dt><dd>{money(result.totalPaid)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Payoff</dt><dd>{result.payoffMonths ? `${Math.floor(result.payoffMonths / 12)} yr ${result.payoffMonths % 12} mo` : "—"}</dd></div>
          </dl>
          {!result.valid ? (
            <p className="mt-4 text-sm text-muted">Enter a loan amount, a rate from 0 to 100%, and a term up to 50 years.</p>
          ) : null}
        </aside>
      </div>

      {result.valid ? (
        <section className="rounded-2xl border border-line bg-card p-4 sm:p-6" aria-labelledby="schedule-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="schedule-heading" className="text-xl font-semibold">Amortization schedule</h2>
            <div className="flex gap-2 text-sm">
              <button type="button" className="chip" aria-pressed={view === "yearly"} onClick={() => setView("yearly")}>Yearly</button>
              <button type="button" className="chip" aria-pressed={view === "monthly"} onClick={() => setView("monthly")}>Monthly</button>
            </div>
          </div>
          <div className="mt-4 max-h-[32rem] overflow-auto">
            <table className="w-full text-right text-sm tabular-nums">
              <thead className="sticky top-0 bg-card text-xs text-muted">
                <tr>
                  <th className="py-2 text-left">{view === "yearly" ? "Year" : "Month"}</th>
                  {view === "monthly" ? <th className="py-2">Payment</th> : null}
                  <th className="py-2">Principal</th>
                  <th className="py-2">Interest</th>
                  <th className="py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {view === "yearly"
                  ? yearly.map((row) => (
                      <tr key={row.year} className="border-t border-line">
                        <td className="py-1.5 text-left">{row.year}</td>
                        <td>{money(row.principal)}</td>
                        <td>{money(row.interest)}</td>
                        <td>{money(row.balance)}</td>
                      </tr>
                    ))
                  : result.schedule.map((row) => (
                      <tr key={row.month} className="border-t border-line">
                        <td className="py-1.5 text-left">{row.month}</td>
                        <td>{money(row.payment)}</td>
                        <td>{money(row.principal)}</td>
                        <td>{money(row.interest)}</td>
                        <td>{money(row.balance)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
