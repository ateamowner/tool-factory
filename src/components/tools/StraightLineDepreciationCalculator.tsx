"use client";

import { useMemo, useState } from "react";
import {
  computeStraightLineDepreciation,
  formatUsd,
  yearFractionFromPlacedInService,
} from "@/lib/straight-line-depreciation";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function yearLabel(year: number, fraction: number): string {
  if (Math.abs(fraction - 1) < 1e-9) return String(year);
  const shown = fraction.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
  });
  return `${year} (${shown} yr)`;
}

export function StraightLineDepreciationCalculator() {
  const [cost, setCost] = useState("25000");
  const [salvage, setSalvage] = useState("2500");
  const [usefulLifeYears, setUsefulLifeYears] = useState("5");
  const [firstYearFraction, setFirstYearFraction] = useState("1");
  const [placedInService, setPlacedInService] = useState("");

  const dateFraction = useMemo(
    () => (placedInService.trim() === "" ? null : yearFractionFromPlacedInService(placedInService)),
    [placedInService],
  );

  const parsedFraction =
    firstYearFraction.trim() === "" ? 1 : parseAmount(firstYearFraction);
  const resolvedFraction = dateFraction ?? parsedFraction;
  const dateIsInvalid = placedInService.trim() !== "" && dateFraction === null;

  const result = computeStraightLineDepreciation({
    cost: parseAmount(cost),
    salvage: salvage.trim() === "" ? 0 : parseAmount(salvage),
    usefulLifeYears: parseAmount(usefulLifeYears),
    firstYearFraction: dateIsInvalid ? Number.NaN : resolvedFraction,
  });

  const errorMessage = dateIsInvalid
    ? "Enter a valid placed-in-service date (YYYY-MM-DD), or clear the date and use a first-year fraction."
    : result.error;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Asset cost (basis)</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            className="input-field"
            placeholder="25000"
          />
          <span className="mt-2 block text-muted">
            Purchase price or depreciable cost basis.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Salvage / residual value</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={salvage}
            onChange={(event) => setSalvage(event.target.value)}
            className="input-field"
            placeholder="2500"
          />
          <span className="mt-2 block text-muted">
            Estimated value at the end of useful life. Must not exceed cost.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Useful life (years)</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={usefulLifeYears}
            onChange={(event) => setUsefulLifeYears(event.target.value)}
            className="input-field"
            placeholder="5"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">
              First-year fraction (optional)
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={
                dateFraction !== null
                  ? dateFraction.toLocaleString(undefined, { maximumFractionDigits: 6 })
                  : firstYearFraction
              }
              onChange={(event) => setFirstYearFraction(event.target.value)}
              className="input-field"
              placeholder="1"
              disabled={placedInService.trim() !== ""}
            />
            <span className="mt-2 block text-muted">
              1 is a full year. Use 0.5 for a half-year convention.
            </span>
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">
              Placed in service (optional)
            </span>
            <input
              type="date"
              value={placedInService}
              onChange={(event) => setPlacedInService(event.target.value)}
              className="input-field"
            />
            <span className="mt-2 block text-muted">
              When set, the first-year fraction is remaining days in that calendar year.
            </span>
          </label>
        </div>

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Straight-line results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Annual depreciation"
            value={result.valid ? formatUsd(result.annualDepreciation ?? Number.NaN) : "—"}
            emphasize
          />
          <ResultRow
            label="Monthly (annual ÷ 12)"
            value={result.valid ? formatUsd(result.monthlyDepreciation ?? Number.NaN) : "—"}
          />
          <ResultRow
            label="Depreciable basis"
            value={result.valid ? formatUsd(result.depreciableBasis ?? Number.NaN) : "—"}
          />
          <ResultRow
            label="First-year fraction used"
            value={
              result.valid && result.firstYearFraction !== null
                ? result.firstYearFraction.toLocaleString(undefined, {
                    maximumFractionDigits: 4,
                  })
                : "—"
            }
          />
          <ResultRow
            label="Total depreciation"
            value={result.valid ? formatUsd(result.totalDepreciation ?? Number.NaN) : "—"}
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">
            {formatUsd(result.cost ?? 0)} cost minus {formatUsd(result.salvage ?? 0)} salvage
            over {result.usefulLifeYears} years is {formatUsd(result.annualDepreciation ?? 0)} a
            year ({formatUsd(result.monthlyDepreciation ?? 0)} / month). Book value ends at
            salvage.
          </p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Educational estimate, not tax or accounting advice. Conventions, half-year
            rules, and tax lives vary by jurisdiction and asset class.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {errorMessage ??
              "Enter a non-negative asset cost, a salvage value of 0 or more that is not greater than cost, and a useful life greater than 0 years."}
          </p>
        )}
      </aside>

      {result.valid && result.schedule.length > 0 ? (
        <div className="rounded-2xl border border-line bg-card p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold">Year-by-year schedule</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="py-2 pr-3 font-medium">Year</th>
                  <th className="py-2 pr-3 font-medium">Beginning book value</th>
                  <th className="py-2 pr-3 font-medium">Depreciation</th>
                  <th className="py-2 font-medium">Ending book value</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.year} className="border-b border-line/70">
                    <td className="py-2 pr-3 font-mono tabular-nums">
                      {yearLabel(row.year, row.yearFraction)}
                    </td>
                    <td className="py-2 pr-3 font-mono tabular-nums">
                      {formatUsd(row.beginningBookValue)}
                    </td>
                    <td className="py-2 pr-3 font-mono tabular-nums">
                      {formatUsd(row.depreciation)}
                    </td>
                    <td className="py-2 font-mono tabular-nums">
                      {formatUsd(row.endingBookValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
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
