"use client";

import { useState } from "react";
import { computeDebtPayoff, payoffDate, type Debt, type StrategyResult } from "@/lib/debt-payoff";

type Row = { name: string; balance: string; apr: string; min: string };

function parseAmount(value: string): number {
  const cleaned = value.replace(/[,$%\s]/g, "");
  if (cleaned === "") return 0;
  return Number(cleaned);
}

function money(value: number): string {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function dateLabel(months: number): string {
  return payoffDate(months).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function duration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} yr`);
  if (m || !y) parts.push(`${m} mo`);
  return parts.join(" ");
}

const inputClass = "w-full rounded-[10px] border border-line bg-bg px-3 py-2";

function Summary({ title, r }: { title: string; r: StrategyResult }) {
  return (
    <div className="rounded-xl border border-line bg-bg p-4">
      <p className="text-sm font-semibold">{title}</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Debt-free</dt>
          <dd>{dateLabel(r.months)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Time to payoff</dt>
          <dd>{duration(r.months)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Total interest</dt>
          <dd>{money(r.totalInterest)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Total paid</dt>
          <dd>{money(r.totalPaid)}</dd>
        </div>
        <div>
          <dt className="text-muted">Payoff order</dt>
          <dd>{r.payoffOrder.join(" → ")}</dd>
        </div>
      </dl>
    </div>
  );
}

export function DebtPayoffCalculator() {
  const [rows, setRows] = useState<Row[]>([
    { name: "Credit card", balance: "5000", apr: "24", min: "100" },
    { name: "Store card", balance: "1000", apr: "12", min: "25" },
    { name: "Personal loan", balance: "8000", apr: "6", min: "150" },
  ]);
  const [extra, setExtra] = useState("200");
  const [view, setView] = useState<"avalanche" | "snowball">("avalanche");

  const debts: Debt[] = rows.map((r, i) => ({
    name: r.name.trim() || `Debt ${i + 1}`,
    balance: parseAmount(r.balance),
    apr: parseAmount(r.apr),
    minPayment: parseAmount(r.min),
  }));
  const result = computeDebtPayoff(debts, parseAmount(extra));

  function update(i: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <div className="space-y-6">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset className="space-y-4">
          <legend className="mb-2 text-base font-semibold">Your debts</legend>
          {rows.map((row, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1.4fr_1fr_0.7fr_1fr_auto] sm:items-end">
              <label className="block text-sm">
                <span className="mb-2 block text-xs text-muted">Name</span>
                <input type="text" value={row.name} onChange={(e) => update(i, { name: e.target.value })} className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs text-muted">Balance ($)</span>
                <input type="text" inputMode="decimal" value={row.balance} onChange={(e) => update(i, { balance: e.target.value })} className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs text-muted">APR (%)</span>
                <input type="text" inputMode="decimal" value={row.apr} onChange={(e) => update(i, { apr: e.target.value })} className={inputClass} />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs text-muted">Minimum payment ($)</span>
                <input type="text" inputMode="decimal" value={row.min} onChange={(e) => update(i, { min: e.target.value })} className={inputClass} />
              </label>
              <button
                type="button"
                aria-label={`Remove ${row.name || `debt ${i + 1}`}`}
                disabled={rows.length <= 1}
                onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                className="rounded-[10px] border border-line px-3 py-2 text-sm disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, { name: "", balance: "", apr: "", min: "" }])}
            className="rounded-[10px] border border-line px-3 py-2 text-sm"
          >
            + Add a debt
          </button>
        </fieldset>
        <label className="block max-w-xs text-sm">
          <span className="mb-2 block text-xs text-muted">Extra monthly payment ($)</span>
          <input type="text" inputMode="decimal" value={extra} placeholder="0" onChange={(e) => setExtra(e.target.value)} className={inputClass} />
        </label>
      </form>

      <div className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" aria-live="polite">
        {result.valid ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Summary title="Avalanche (highest APR first)" r={result.avalanche} />
              <Summary title="Snowball (smallest balance first)" r={result.snowball} />
            </div>
            <p className="text-sm text-muted">
              {result.interestSaved > 0
                ? `With these numbers, avalanche pays ${money(result.interestSaved)} less interest than snowball.`
                : "With these numbers, both methods cost the same interest."}
            </p>
            <div>
              <div className="flex gap-2" role="group" aria-label="Schedule method">
                {(["avalanche", "snowball"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={view === s}
                    onClick={() => setView(s)}
                    className={`rounded-[10px] border px-3 py-2 text-sm ${view === s ? "border-mint text-mint" : "border-line"}`}
                  >
                    {s === "avalanche" ? "Avalanche schedule" : "Snowball schedule"}
                  </button>
                ))}
              </div>
              <div className="mt-3 max-h-96 overflow-auto rounded-xl border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-card text-xs text-muted">
                    <tr>
                      <th className="px-3 py-2">Month</th>
                      <th className="px-3 py-2">Payment</th>
                      <th className="px-3 py-2">Interest</th>
                      <th className="px-3 py-2">Principal</th>
                      <th className="px-3 py-2">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result[view].schedule.map((row) => (
                      <tr key={row.month} className="border-t border-line">
                        <td className="px-3 py-2">{row.month}</td>
                        <td className="px-3 py-2">{money(row.payment)}</td>
                        <td className="px-3 py-2">{money(row.interest)}</td>
                        <td className="px-3 py-2">{money(row.principal)}</td>
                        <td className="px-3 py-2">{money(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <p role="alert" className="text-sm text-amber-300">
            {result.error}
          </p>
        )}
      </div>
    </div>
  );
}
