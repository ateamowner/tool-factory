"use client";

import { useState } from "react";
import { computeHeloc, DEFAULT_MAX_CLTV_PERCENT } from "@/lib/heloc";

function parseAmount(value: string): number {
  const cleaned = value.replace(/[,$%]/g, "").trim();
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

function pct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

export function HelocCalculator() {
  const [homeValue, setHomeValue] = useState("400000");
  const [firstMortgage, setFirstMortgage] = useState("200000");
  const [creditLimit, setCreditLimit] = useState("80000");
  const [amountDrawn, setAmountDrawn] = useState("50000");
  const [apr, setApr] = useState("8.5");
  const [drawYears, setDrawYears] = useState("10");
  const [repaymentYears, setRepaymentYears] = useState("20");
  const [extra, setExtra] = useState("0");
  const [maxCltv, setMaxCltv] = useState(String(DEFAULT_MAX_CLTV_PERCENT));
  const [view, setView] = useState<"yearly" | "monthly">("yearly");

  const result = computeHeloc({
    homeValue: parseAmount(homeValue),
    firstMortgageBalance: parseAmount(firstMortgage),
    helocCreditLimit: parseAmount(creditLimit),
    amountDrawn: parseAmount(amountDrawn),
    drawAprPercent: parseAmount(apr),
    drawYears: parseAmount(drawYears),
    repaymentYears: parseAmount(repaymentYears),
    extraMonthly: extra.trim() === "" ? 0 : parseAmount(extra),
    maxCltvPercent: maxCltv.trim() === "" ? DEFAULT_MAX_CLTV_PERCENT : parseAmount(maxCltv),
  });

  const yearly: {
    year: number;
    phase: string;
    principal: number;
    interest: number;
    balance: number;
  }[] = [];
  for (const row of result.schedule) {
    const y = Math.ceil(row.month / 12);
    const last = yearly[yearly.length - 1];
    if (!last || last.year !== y) {
      yearly.push({
        year: y,
        phase: row.phase,
        principal: row.principal,
        interest: row.interest,
        balance: row.balance,
      });
    } else {
      last.principal += row.principal;
      last.interest += row.interest;
      last.balance = row.balance;
      if (row.phase === "repayment") last.phase = "repayment";
    }
  }

  const fields: [string, string, (v: string) => void, string][] = [
    ["Home value", homeValue, setHomeValue, "400000"],
    ["First mortgage balance", firstMortgage, setFirstMortgage, "200000"],
    ["HELOC credit limit", creditLimit, setCreditLimit, "80000"],
    ["Amount drawn", amountDrawn, setAmountDrawn, "50000"],
    ["HELOC APR %", apr, setApr, "8.5"],
    ["Draw period (years)", drawYears, setDrawYears, "10"],
    ["Repayment period (years)", repaymentYears, setRepaymentYears, "20"],
    ["Extra monthly principal in repayment (optional)", extra, setExtra, "0"],
    ["Max combined LTV % (for max HELOC estimate)", maxCltv, setMaxCltv, "85"],
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
          className="h-fit space-y-5 rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
          aria-live="polite"
        >
          <div>
            <p className="text-xs text-muted">Draw period (interest-only)</p>
            <p className="mt-1 text-3xl font-semibold">{money(result.drawMonthlyPayment)}</p>
            <p className="mt-1 text-xs text-muted">per month while drawing</p>
          </div>
          <div className="rounded-xl border border-line bg-bg/40 p-3">
            <p className="text-xs text-muted">Repayment period (fully amortizing)</p>
            <p className="mt-1 text-2xl font-semibold">{money(result.repaymentMonthlyPayment)}</p>
            <div className="mt-2 flex justify-between gap-4 text-sm">
              <span className="text-muted">Payment jump</span>
              <span className="font-medium tabular-nums">
                {result.paymentJump !== null && result.paymentJump > 0 ? "+" : ""}
                {money(result.paymentJump)}
              </span>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">LTV (1st mortgage)</dt>
              <dd>{pct(result.ltvPercent)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">CLTV (on credit limit)</dt>
              <dd>{pct(result.cltvOnLimitPercent)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">CLTV (on drawn)</dt>
              <dd>{pct(result.cltvOnDrawnPercent)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Max HELOC @ max CLTV</dt>
              <dd>{money(result.maxHelocFromCltv)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Available credit</dt>
              <dd>{money(result.availableCredit)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Draw-period interest</dt>
              <dd>{money(result.drawPeriodInterest)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Repayment interest</dt>
              <dd>{money(result.repaymentInterest)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Total interest</dt>
              <dd>{money(result.totalInterest)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Repayment payoff</dt>
              <dd>
                {result.repaymentPayoffMonths
                  ? `${Math.floor(result.repaymentPayoffMonths / 12)} yr ${result.repaymentPayoffMonths % 12} mo`
                  : "—"}
              </dd>
            </div>
          </dl>
          {!result.valid ? (
            <p className="text-sm text-muted">
              {result.error ??
                "Enter home value, mortgage, HELOC limit, drawn amount, APR, and terms."}
            </p>
          ) : null}
        </aside>
      </div>

      {result.valid && result.schedule.length > 0 ? (
        <section className="rounded-2xl border border-line bg-card p-4 sm:p-6" aria-labelledby="schedule-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="schedule-heading" className="text-xl font-semibold">
              HELOC schedule summary
            </h2>
            <div className="flex gap-2 text-sm">
              <button type="button" className="chip" aria-pressed={view === "yearly"} onClick={() => setView("yearly")}>
                Yearly
              </button>
              <button type="button" className="chip" aria-pressed={view === "monthly"} onClick={() => setView("monthly")}>
                Monthly
              </button>
            </div>
          </div>
          <div className="mt-4 max-h-[32rem] overflow-auto">
            <table className="w-full text-right text-sm tabular-nums">
              <thead className="sticky top-0 bg-card text-xs text-muted">
                <tr>
                  <th className="py-2 text-left">{view === "yearly" ? "Year" : "Month"}</th>
                  <th className="py-2 text-left">Phase</th>
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
                        <td className="py-1.5 text-left capitalize">{row.phase}</td>
                        <td>{money(row.principal)}</td>
                        <td>{money(row.interest)}</td>
                        <td>{money(row.balance)}</td>
                      </tr>
                    ))
                  : result.schedule.map((row) => (
                      <tr key={row.month} className="border-t border-line">
                        <td className="py-1.5 text-left">{row.month}</td>
                        <td className="py-1.5 text-left capitalize">{row.phase}</td>
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
