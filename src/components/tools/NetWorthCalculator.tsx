"use client";

import { useState } from "react";
import { computeNetWorth, type NetWorthInput } from "@/lib/net-worth";

type Key = keyof NetWorthInput;

const ASSETS: { key: Key; label: string }[] = [
  { key: "cash", label: "Cash and savings" },
  { key: "investments", label: "Investments (taxable)" },
  { key: "retirement", label: "Retirement accounts" },
  { key: "home", label: "Home value" },
  { key: "vehicles", label: "Vehicles" },
  { key: "otherAssets", label: "Other assets" },
];

const DEBTS: { key: Key; label: string }[] = [
  { key: "mortgage", label: "Mortgage balance" },
  { key: "loans", label: "Loans (auto, student, personal)" },
  { key: "creditCards", label: "Credit card balances" },
  { key: "otherDebts", label: "Other debts" },
];

function parseAmount(value: string): number {
  const cleaned = value.replace(/[,$\s]/g, "");
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

export function NetWorthCalculator() {
  const [values, setValues] = useState<Record<Key, string>>({
    cash: "10000",
    investments: "20000",
    retirement: "50000",
    home: "300000",
    vehicles: "15000",
    otherAssets: "",
    mortgage: "200000",
    loans: "10000",
    creditCards: "5000",
    otherDebts: "",
  });

  const parsed = Object.fromEntries(
    (Object.keys(values) as Key[]).map((k) => [k, parseAmount(values[k])]),
  ) as NetWorthInput;
  const result = computeNetWorth(parsed);

  function field({ key, label }: { key: Key; label: string }) {
    return (
      <label key={key} className="block text-sm">
        <span className="mb-2 block text-xs text-muted">{label}</span>
        <input
          type="text"
          inputMode="decimal"
          value={values[key]}
          placeholder="0"
          onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
          className="w-full rounded-[10px] border border-line bg-bg px-3 py-2"
        />
      </label>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-6 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset className="space-y-4">
          <legend className="mb-2 text-base font-semibold">Assets (what you own)</legend>
          {ASSETS.map(field)}
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="mb-2 text-base font-semibold">Debts (what you owe)</legend>
          {DEBTS.map(field)}
        </fieldset>
      </form>

      <div className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" aria-live="polite">
        {result.valid ? (
          <>
            <div>
              <p className="text-xs text-muted">Net worth</p>
              <p className="text-3xl font-semibold tracking-tight">{money(result.netWorth)}</p>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Total assets</dt>
                <dd>{money(result.totalAssets)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Total debts</dt>
                <dd>{money(result.totalDebts)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Asset-to-debt ratio</dt>
                <dd>
                  {result.assetToDebtRatio === null
                    ? "No debts"
                    : `${result.assetToDebtRatio.toLocaleString(undefined, { maximumFractionDigits: 2 })} : 1`}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Debt as % of assets</dt>
                <dd>
                  {result.debtToAssetRatio === null
                    ? "—"
                    : `${(result.debtToAssetRatio * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
                </dd>
              </div>
            </dl>
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
