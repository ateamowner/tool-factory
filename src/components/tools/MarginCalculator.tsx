"use client";

import { useState } from "react";
import { computeMargin, formatPercent, formatUsd, type MarginMode } from "@/lib/margin";

function parseAmount(value: string): number {
  const cleaned = value.replace(/[$,%]/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

const MODE_OPTIONS: { id: MarginMode; label: string; hint: string }[] = [
  {
    id: "cost_price",
    label: "Cost + selling price",
    hint: "Solve gross margin %, profit, and markup %.",
  },
  {
    id: "cost_margin",
    label: "Cost + target margin %",
    hint: "Solve the selling price that hits your margin.",
  },
];

export function MarginCalculator() {
  const [mode, setMode] = useState<MarginMode>("cost_price");
  const [cost, setCost] = useState("80");
  const [sellingPrice, setSellingPrice] = useState("100");
  const [marginPercent, setMarginPercent] = useState("30");

  const result = computeMargin({
    mode,
    cost: parseAmount(cost),
    sellingPrice: parseAmount(sellingPrice),
    marginPercent: parseAmount(marginPercent),
  });

  const activeMode = MODE_OPTIONS.find((option) => option.id === mode);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Calculation mode</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="margin-mode"
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => setMode(option.id)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{activeMode?.hint}</p>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Cost</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            className="input-field"
            placeholder="80"
          />
          <span className="mt-2 block text-muted">
            What the item or job costs you (cost of goods, materials, labor).
          </span>
        </label>

        {mode === "cost_price" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Selling price</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={sellingPrice}
              onChange={(event) => setSellingPrice(event.target.value)}
              className="input-field"
              placeholder="100"
            />
            <span className="mt-2 block text-muted">
              What you charge. Must be greater than 0 — margin is a percent of
              price.
            </span>
          </label>
        ) : (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Target margin %</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={marginPercent}
              onChange={(event) => setMarginPercent(event.target.value)}
              className="input-field"
              placeholder="30"
            />
            <span className="mt-2 block text-muted">
              Profit as a percent of selling price. Must be less than 100%.
            </span>
          </label>
        )}

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Margin results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Gross margin %"
            value={
              result.valid && result.marginPercent !== null
                ? formatPercent(result.marginPercent)
                : "—"
            }
            emphasize={mode === "cost_price"}
          />
          <ResultRow
            label="Selling price"
            value={
              result.valid && result.sellingPrice !== null
                ? formatUsd(result.sellingPrice)
                : "—"
            }
            emphasize={mode === "cost_margin"}
          />
          <ResultRow
            label="Profit"
            value={result.valid && result.profit !== null ? formatUsd(result.profit) : "—"}
          />
          <ResultRow
            label="Markup %"
            value={
              result.valid && result.markupPercent !== null
                ? formatPercent(result.markupPercent)
                : "—"
            }
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">
            {formatUsd(result.cost ?? 0)} cost and {formatUsd(result.sellingPrice ?? 0)}{" "}
            selling price leave {formatUsd(result.profit ?? 0)} profit —{" "}
            {formatPercent(result.marginPercent ?? 0)} margin on price
            {result.markupPercent !== null
              ? ` and ${formatPercent(result.markupPercent)} markup on cost.`
              : ". Markup needs a cost above 0."}
          </p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Margin is on selling price. Markup is on cost. Educational estimate,
            not tax or accounting advice.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ?? "Enter a cost and a selling price or target margin %."}
          </p>
        )}
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
