"use client";

import { useState } from "react";
import { computeStockAverage, lotCost } from "@/lib/stock-average";

type LotDraft = {
  id: string;
  shares: string;
  price: string;
  fee: string;
};

function newLot(id: string): LotDraft {
  return {
    id,
    shares: "",
    price: "",
    fee: "",
  };
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function money(value: number | null, digits = 4): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  });
}

function sharesLabel(value: number): string {
  if (!value) return "0";
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function StockAverageCalculator() {
  const [lots, setLots] = useState<LotDraft[]>([newLot("lot-1"), newLot("lot-2")]);
  const [nextLot, setNextLot] = useState(3);
  const [currentPrice, setCurrentPrice] = useState("");

  const parsedLots = lots.map((lot) => ({
    shares: parseAmount(lot.shares),
    price: parseAmount(lot.price),
    fee: lot.fee.trim() === "" ? 0 : parseAmount(lot.fee),
  }));

  const result = computeStockAverage(parsedLots, parseAmount(currentPrice));

  function updateLot(id: string, field: keyof Omit<LotDraft, "id">, value: string) {
    setLots((current) =>
      current.map((lot) => (lot.id === id ? { ...lot, [field]: value } : lot)),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">Purchase lots</h2>
          <button
            type="button"
            onClick={() => {
              setLots((current) => [...current, newLot(`lot-${nextLot}`)]);
              setNextLot((value) => value + 1);
            }}
            className="btn-primary"
          >
            Add lot
          </button>
        </div>

        <ol className="space-y-3">
          {lots.map((lot, index) => {
            const parsed = parsedLots[index];
            const cost = lotCost({
              shares: parsed.shares,
              price: parsed.price,
              fee: Number.isFinite(parsed.fee) ? parsed.fee : 0,
            });

            return (
              <li key={lot.id} className="rounded-2xl border border-line bg-card p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Lot {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLots((current) =>
                        current.length === 1
                          ? [newLot(`lot-${nextLot}`)]
                          : current.filter((item) => item.id !== lot.id),
                      );
                      if (lots.length === 1) setNextLot((value) => value + 1);
                    }}
                    className="text-sm font-medium text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">Shares</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={lot.shares}
                      onChange={(event) => updateLot(lot.id, "shares", event.target.value)}
                      className="input-field"
                      placeholder="100"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">Price per share</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={lot.price}
                      onChange={(event) => updateLot(lot.id, "price", event.target.value)}
                      className="input-field"
                      placeholder="42.50"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">Fee (optional)</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={lot.fee}
                      onChange={(event) => updateLot(lot.id, "fee", event.target.value)}
                      className="input-field"
                      placeholder="0.00"
                    />
                  </label>
                </div>
                <p className="mt-3 text-sm text-muted">
                  Lot cost: <span className="font-mono font-medium text-text">{money(cost, 2)}</span>
                </p>
              </li>
            );
          })}
        </ol>

        <label className="block rounded-2xl border border-line bg-card p-4 text-sm sm:p-5">
          <span className="mb-2 block text-xs text-muted">Current price (optional)</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={currentPrice}
            onChange={(event) => setCurrentPrice(event.target.value)}
            className="input-field max-w-xs"
            placeholder="45.00"
          />
          <span className="mt-2 block text-muted">
            Used for market value and unrealized profit or loss.
          </span>
        </label>
      </div>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow label="Total shares" value={sharesLabel(result.totalShares)} />
          <ResultRow label="Total invested" value={money(result.totalInvested, 2)} />
          <ResultRow
            label="Weighted average cost"
            value={money(result.weightedAverageCost)}
          />
          <ResultRow
            label="Average price without fees"
            value={money(result.averagePriceWithoutFees)}
          />
          <ResultRow label="Break-even price" value={money(result.breakEvenPrice)} />
          <ResultRow label="Market value" value={money(result.marketValue, 2)} />
          <div className="border-t border-line pt-3">
            <dt className="text-muted">Unrealized P/L</dt>
            <dd
              className={`mt-0.5 font-mono text-lg font-semibold ${
                result.unrealizedPL === null
                  ? ""
                  : result.unrealizedPL >= 0
                    ? "text-mint"
                    : "text-danger"
              }`}
            >
              {result.unrealizedPL === null
                ? "—"
                : `${result.unrealizedPL >= 0 ? "+" : ""}${money(result.unrealizedPL, 2)}`}
              {result.unrealizedPLPercent !== null ? (
                <span className="ml-2 text-sm font-medium">
                  ({result.unrealizedPLPercent >= 0 ? "+" : ""}
                  {result.unrealizedPLPercent.toFixed(2)}%)
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="font-mono font-medium tabular-nums">{value}</dd>
    </div>
  );
}
