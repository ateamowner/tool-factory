"use client";

import { useState } from "react";
import {
  computeDiscount,
  formatPercent,
  formatUsd,
  type DiscountMode,
} from "@/lib/discount";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

const MODE_OPTIONS: { id: DiscountMode; label: string; hint: string }[] = [
  {
    id: "list_percent",
    label: "List + % off",
    hint: "Solve discount dollars and the sale price.",
  },
  {
    id: "list_dollars",
    label: "List + $ off",
    hint: "Solve discount percent and the sale price.",
  },
  {
    id: "sale_percent",
    label: "Sale + % off",
    hint: "Solve the original list price from the sale price.",
  },
  {
    id: "list_sale",
    label: "List + sale",
    hint: "Solve discount percent and discount dollars.",
  },
  {
    id: "stacked",
    label: "Stacked % off",
    hint: "Apply two sequential percent discounts and see the combined effective %.",
  },
];

export function DiscountCalculator() {
  const [mode, setMode] = useState<DiscountMode>("list_percent");
  const [originalPrice, setOriginalPrice] = useState("100");
  const [percentOff, setPercentOff] = useState("20");
  const [salePrice, setSalePrice] = useState("80");
  const [discountAmount, setDiscountAmount] = useState("20");
  const [firstPercent, setFirstPercent] = useState("20");
  const [secondPercent, setSecondPercent] = useState("10");

  const result = computeDiscount({
    mode,
    originalPrice: parseAmount(originalPrice),
    percentOff: parseAmount(percentOff),
    salePrice: parseAmount(salePrice),
    discountAmount: parseAmount(discountAmount),
    firstPercent: parseAmount(firstPercent),
    secondPercent: parseAmount(secondPercent),
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
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {MODE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="discount-mode"
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

        {mode !== "sale_percent" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Original (list) price</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={originalPrice}
              onChange={(event) => setOriginalPrice(event.target.value)}
              className="input-field"
              placeholder="100"
            />
            <span className="mt-2 block text-muted">
              Sticker or list price before any discount. Must be greater than 0 —
              a discount is a percent or dollar amount of this number.
            </span>
          </label>
        ) : null}

        {mode === "list_percent" || mode === "sale_percent" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Discount percent</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={percentOff}
              onChange={(event) => setPercentOff(event.target.value)}
              className="input-field"
              placeholder="20"
            />
            <span className="mt-2 block text-muted">
              {mode === "sale_percent"
                ? "Percent taken off the original. Must be less than 100% to reverse back to a list price."
                : "Discount as a percent of the original price. 20% off $100 is $20 off and an $80 sale price."}
            </span>
          </label>
        ) : null}

        {mode === "sale_percent" || mode === "list_sale" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Sale price</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
              className="input-field"
              placeholder="80"
            />
            <span className="mt-2 block text-muted">
              {mode === "sale_percent"
                ? "Price after the discount. Must be greater than 0 to solve the original list price."
                : "Price after the discount. Must be 0 or more and not higher than the original price."}
            </span>
          </label>
        ) : null}

        {mode === "list_dollars" ? (
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

        {mode === "stacked" ? (
          <>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">First discount percent</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={firstPercent}
                onChange={(event) => setFirstPercent(event.target.value)}
                className="input-field"
                placeholder="20"
              />
              <span className="mt-2 block text-muted">
                Applied to the list price first. 20% off $100 leaves $80 before
                the second discount.
              </span>
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Second discount percent</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={secondPercent}
                onChange={(event) => setSecondPercent(event.target.value)}
                className="input-field"
                placeholder="10"
              />
              <span className="mt-2 block text-muted">
                Applied to the remaining price, not the original. 10% off $80 is
                $8 more off — a $72 sale, not $70.
              </span>
            </label>
          </>
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
        <h2 className="text-lg font-semibold">Discount results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          {mode === "sale_percent" ? (
            <ResultRow
              label="Original price"
              value={
                result.valid && result.originalPrice !== null
                  ? formatUsd(result.originalPrice)
                  : "—"
              }
              emphasize
            />
          ) : (
            <ResultRow
              label="Sale price"
              value={
                result.valid && result.salePrice !== null
                  ? formatUsd(result.salePrice)
                  : "—"
              }
              emphasize
            />
          )}
          <ResultRow
            label="Discount"
            value={
              result.valid && result.discountAmount !== null
                ? formatUsd(result.discountAmount)
                : "—"
            }
          />
          <ResultRow
            label={mode === "stacked" ? "Effective discount" : "Discount percent"}
            value={
              result.valid && result.percentOff !== null
                ? formatPercent(result.percentOff)
                : "—"
            }
          />
          {mode === "stacked" ? (
            <>
              <ResultRow
                label="After first discount"
                value={
                  result.valid && result.afterFirstPrice !== null
                    ? formatUsd(result.afterFirstPrice)
                    : "—"
                }
              />
              <ResultRow
                label="First then second"
                value={
                  result.valid &&
                  result.firstPercent !== null &&
                  result.secondPercent !== null
                    ? `${formatPercent(result.firstPercent)} then ${formatPercent(result.secondPercent)}`
                    : "—"
                }
              />
            </>
          ) : null}
          {mode === "sale_percent" ? (
            <ResultRow
              label="Sale price"
              value={
                result.valid && result.salePrice !== null
                  ? formatUsd(result.salePrice)
                  : "—"
              }
            />
          ) : null}
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
            {mode === "stacked"
              ? `${formatPercent(result.firstPercent ?? 0)} then ${formatPercent(result.secondPercent ?? 0)} off ${formatUsd(result.originalPrice ?? 0)} is ${formatUsd(result.discountAmount ?? 0)} off (${formatPercent(result.effectivePercent ?? 0)} effective) — sale price ${formatUsd(result.salePrice ?? 0)}.`
              : mode === "sale_percent"
                ? `${formatPercent(result.percentOff ?? 0)} off a ${formatUsd(result.originalPrice ?? 0)} list price is ${formatUsd(result.discountAmount ?? 0)} off — sale price ${formatUsd(result.salePrice ?? 0)}.`
                : `${formatPercent(result.percentOff ?? 0)} off ${formatUsd(result.originalPrice ?? 0)} is ${formatUsd(result.discountAmount ?? 0)} off — sale price ${formatUsd(result.salePrice ?? 0)}.`}
          </p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            {mode === "stacked"
              ? "Stacked percents apply one after the other on the remaining price — they do not add. Educational estimate, not tax or pricing advice."
              : "Discount percent is on the original list price unless you reverse from a sale price. Educational estimate, not tax or pricing advice. Tax and shipping can differ."}
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter a list or sale price greater than 0 and a non-negative discount percent, dollars off, or two stacked percents."}
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
