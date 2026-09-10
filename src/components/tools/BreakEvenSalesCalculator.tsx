"use client";

import { useState } from "react";
import { computeBreakEvenSales } from "@/lib/break-even-sales";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
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

function unitsLabel(value: number | null, fractionDigits = 4): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  });
}

function percent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}%`;
}

export function BreakEvenSalesCalculator() {
  const [fixedCosts, setFixedCosts] = useState("10000");
  const [variableCostPerUnit, setVariableCostPerUnit] = useState("12");
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState("20");
  const [targetProfit, setTargetProfit] = useState("");

  const parsedTarget = targetProfit.trim() === "" ? null : parseAmount(targetProfit);

  const result = computeBreakEvenSales({
    fixedCosts: parseAmount(fixedCosts),
    variableCostPerUnit: parseAmount(variableCostPerUnit),
    sellingPricePerUnit: parseAmount(sellingPricePerUnit),
    targetProfit: parsedTarget,
  });

  const showExactUnits =
    result.breakEvenUnitsExact !== null &&
    result.breakEvenUnits !== null &&
    result.breakEvenUnitsExact !== result.breakEvenUnits;
  const showExactTarget =
    result.targetUnitsExact !== null &&
    result.targetUnits !== null &&
    result.targetUnitsExact !== result.targetUnits;
  const showRatioSales =
    result.breakEvenSalesFromRatio !== null &&
    result.breakEvenSales !== null &&
    Math.abs(result.breakEvenSalesFromRatio - result.breakEvenSales) >= 0.005;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Fixed costs</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={fixedCosts}
            onChange={(event) => setFixedCosts(event.target.value)}
            className="input-field"
            placeholder="10000"
          />
          <span className="mt-2 block text-muted">
            Rent, salaries, insurance, and other costs that do not change with
            each unit sold.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Variable cost per unit
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={variableCostPerUnit}
            onChange={(event) => setVariableCostPerUnit(event.target.value)}
            className="input-field"
            placeholder="12"
          />
          <span className="mt-2 block text-muted">
            Materials, shipping, or other costs that rise with each unit.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Selling price per unit
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={sellingPricePerUnit}
            onChange={(event) => setSellingPricePerUnit(event.target.value)}
            className="input-field"
            placeholder="20"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Target profit (optional)
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={targetProfit}
            onChange={(event) => setTargetProfit(event.target.value)}
            className="input-field"
            placeholder="0"
          />
          <span className="mt-2 block text-muted">
            Leave blank for break-even only. When set, results also show units
            and sales needed to earn that profit.
          </span>
        </label>

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Break-even results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Break-even units"
            value={unitsLabel(result.breakEvenUnits, 0)}
            emphasize
          />
          <ResultRow label="Break-even sales" value={money(result.breakEvenSales)} />
          <ResultRow
            label="Contribution margin / unit"
            value={money(result.contributionMargin)}
          />
          <ResultRow
            label="Contribution margin %"
            value={percent(result.contributionMarginPercent)}
          />

          {showExactUnits || showRatioSales ? (
            <div className="border-t border-line pt-3">
              {showExactUnits ? (
                <ResultRow
                  label="Exact break-even units"
                  value={unitsLabel(result.breakEvenUnitsExact)}
                />
              ) : null}
              {showRatioSales ? (
                <div className={showExactUnits ? "mt-3" : undefined}>
                  <ResultRow
                    label="Sales from CM ratio"
                    value={money(result.breakEvenSalesFromRatio)}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {result.hasTargetProfit && result.status === "ok" ? (
            <div className="border-t border-line pt-3">
              <ResultRow
                label="Units for target profit"
                value={unitsLabel(result.targetUnits, 0)}
              />
              <div className="mt-3">
                <ResultRow
                  label="Sales for target profit"
                  value={money(result.targetSales)}
                />
              </div>
              {showExactTarget ? (
                <div className="mt-3">
                  <ResultRow
                    label="Exact units for target"
                    value={unitsLabel(result.targetUnitsExact)}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </dl>
        {result.status === "unreachable" ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            No break-even — selling price must be greater than variable cost per
            unit. With a zero or negative contribution margin, extra sales
            cannot cover fixed costs (the result is infinite).
          </p>
        ) : null}
        {result.status === "invalid" ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Enter fixed costs of 0 or more, variable cost of 0 or more, a
            selling price above 0, and an optional target profit of 0 or more.
          </p>
        ) : null}
      </aside>
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
