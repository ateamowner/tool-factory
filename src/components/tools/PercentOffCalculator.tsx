"use client";

import { useState } from "react";
import {
  computePercentOff,
  formatPercent,
  formatUsd,
  type PercentOffMode,
} from "@/lib/percent-off";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

const MODE_OPTIONS: { id: PercentOffMode; label: string; hint: string }[] = [
  {
    id: "price_percent",
    label: "Price + % off",
    hint: "Solve discount dollars and the sale price.",
  },
  {
    id: "price_final",
    label: "Price + sale price",
    hint: "Solve percent off and discount dollars.",
  },
  {
    id: "price_discount",
    label: "Price + $ off",
    hint: "Solve percent off and the sale price.",
  },
];

export function PercentOffCalculator() {
  const [mode, setMode] = useState<PercentOffMode>("price_percent");
  const [originalPrice, setOriginalPrice] = useState("80");
  const [percentOff, setPercentOff] = useState("25");
  const [finalPrice, setFinalPrice] = useState("60");
  const [discountAmount, setDiscountAmount] = useState("20");

  const result = computePercentOff({
    mode,
    originalPrice: parseAmount(originalPrice),
    percentOff: parseAmount(percentOff),
    finalPrice: parseAmount(finalPrice),
    discountAmount: parseAmount(discountAmount),
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
          <div className="grid gap-2 sm:grid-cols-3">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="percent-off-mode"
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
          <span className="mb-2 block text-xs text-muted">Original price</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={originalPrice}
            onChange={(event) => setOriginalPrice(event.target.value)}
            className="input-field"
            placeholder="80"
          />
          <span className="mt-2 block text-muted">
            Sticker or list price before the discount. Must be greater than 0 —
            percent off is a percent of this number.
          </span>
        </label>

        {mode === "price_percent" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Percent off</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={percentOff}
              onChange={(event) => setPercentOff(event.target.value)}
              className="input-field"
              placeholder="25"
            />
            <span className="mt-2 block text-muted">
              Discount as a percent of the original price. 25% off $80 is $20
              off and a $60 sale price.
            </span>
          </label>
        ) : null}

        {mode === "price_final" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Sale price</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={finalPrice}
              onChange={(event) => setFinalPrice(event.target.value)}
              className="input-field"
              placeholder="60"
            />
            <span className="mt-2 block text-muted">
              Price after the discount. Must be 0 or more and not higher than
              the original price.
            </span>
          </label>
        ) : null}

        {mode === "price_discount" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Discount amount</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={discountAmount}
              onChange={(event) => setDiscountAmount(event.target.value)}
              className="input-field"
              placeholder="20"
            />
            <span className="mt-2 block text-muted">
              Dollars taken off the original price. Cannot be larger than the
              original.
            </span>
          </label>
        ) : null}

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Percent off results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Sale price"
            value={
              result.valid && result.finalPrice !== null
                ? formatUsd(result.finalPrice)
                : "—"
            }
            emphasize
          />
          <ResultRow
            label="Discount"
            value={
              result.valid && result.discountAmount !== null
                ? formatUsd(result.discountAmount)
                : "—"
            }
          />
          <ResultRow
            label="Percent off"
            value={
              result.valid && result.percentOff !== null
                ? formatPercent(result.percentOff)
                : "—"
            }
          />
          <ResultRow
            label="You save"
            value={
              result.valid && result.youSavePercent !== null
                ? formatPercent(result.youSavePercent)
                : "—"
            }
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">
            {formatPercent(result.percentOff ?? 0)} off {formatUsd(result.originalPrice ?? 0)}{" "}
            is {formatUsd(result.discountAmount ?? 0)} off — sale price{" "}
            {formatUsd(result.finalPrice ?? 0)}.
          </p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Percent off is on the original price. Educational estimate, not tax
            or pricing advice. Stacked coupons, tax, and shipping can differ.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter an original price greater than 0 and a non-negative percent off, sale price, or discount amount."}
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
