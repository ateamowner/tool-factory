"use client";

import { useState } from "react";
import { computeRealEstateCommission } from "@/lib/real-estate-commission";

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

function percent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}%`;
}

function complementarySplit(value: string): string {
  const parsed = parseAmount(value);
  if (!Number.isFinite(parsed)) return "";
  const complement = Math.round((100 - parsed) * 100) / 100;
  if (complement < 0 || complement > 100) return "";
  return String(complement);
}

export function RealEstateCommissionCalculator() {
  const [salePrice, setSalePrice] = useState("400000");
  const [commissionRatePercent, setCommissionRatePercent] = useState("5.5");
  const [listingSplitPercent, setListingSplitPercent] = useState("50");
  const [buyerSplitPercent, setBuyerSplitPercent] = useState("50");
  const [additionalFees, setAdditionalFees] = useState("");

  const result = computeRealEstateCommission({
    salePrice: parseAmount(salePrice),
    commissionRatePercent: parseAmount(commissionRatePercent),
    listingSplitPercent:
      listingSplitPercent.trim() === "" ? Number.NaN : parseAmount(listingSplitPercent),
    buyerSplitPercent:
      buyerSplitPercent.trim() === "" ? Number.NaN : parseAmount(buyerSplitPercent),
    additionalFees: additionalFees.trim() === "" ? 0 : parseAmount(additionalFees),
  });

  const hasFees = (result.additionalFees ?? 0) > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Home sale price</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
            className="input-field"
            placeholder="400000"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Commission rate (% of sale price)
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={commissionRatePercent}
            onChange={(event) => setCommissionRatePercent(event.target.value)}
            className="input-field"
            placeholder="5.50"
          />
          <span className="mt-2 block text-muted">
            Typical total rates are about 5–6%, and they are negotiable.
          </span>
        </label>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">
            Agent split (share of total commission, optional)
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Listing agent %</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={listingSplitPercent}
                onChange={(event) => {
                  const next = event.target.value;
                  setListingSplitPercent(next);
                  const complement = complementarySplit(next);
                  if (complement !== "") setBuyerSplitPercent(complement);
                }}
                className="input-field"
                placeholder="50"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Buyer agent %</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={buyerSplitPercent}
                onChange={(event) => {
                  const next = event.target.value;
                  setBuyerSplitPercent(next);
                  const complement = complementarySplit(next);
                  if (complement !== "") setListingSplitPercent(complement);
                }}
                className="input-field"
                placeholder="50"
              />
            </label>
          </div>
          <span className="mt-2 block text-sm text-muted">
            These two shares should add to 100. A 50/50 split is the usual starting point.
          </span>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Additional fees / concessions (optional)
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={additionalFees}
            onChange={(event) => setAdditionalFees(event.target.value)}
            className="input-field"
            placeholder="0"
          />
          <span className="mt-2 block text-muted">
            Extra seller costs such as closing credits, concessions, or other fees
            subtracted from net proceeds.
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
        <h2 className="text-lg font-semibold">Commission and seller net</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Seller net proceeds"
            value={money(result.sellerNetProceeds)}
            emphasize
          />
          <ResultRow label="Total commission" value={money(result.totalCommission)} />
          <ResultRow label="Listing-side commission" value={money(result.listingSide)} />
          <ResultRow label="Buyer-side commission" value={money(result.buyerSide)} />

          <div className="border-t border-line pt-3">
            <ResultRow
              label="Listing rate of price"
              value={percent(result.listingRateOfPrice)}
            />
            <div className="mt-3">
              <ResultRow
                label="Buyer rate of price"
                value={percent(result.buyerRateOfPrice)}
              />
            </div>
            {hasFees ? (
              <div className="mt-3">
                <ResultRow
                  label="Additional fees / concessions"
                  value={money(result.additionalFees)}
                />
              </div>
            ) : null}
            <div className="mt-3">
              <ResultRow
                label={hasFees ? "Commission + fees" : "Commission deducted"}
                value={money(result.commissionPlusFees)}
              />
            </div>
            <div className="mt-3">
              <ResultRow label="Sale price" value={money(result.salePrice)} />
            </div>
          </div>
        </dl>
        {!result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Enter a sale price above 0, a commission rate from 0% to 100%, listing
            and buyer splits that add to 100, and fees of 0 or more.
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
