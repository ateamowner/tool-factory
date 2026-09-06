"use client";

import { useState } from "react";
import {
  DEFAULT_TARGET_UTILIZATION_PERCENT,
  TARGET_UTILIZATION_PRESETS,
  computeCreditUtilization,
} from "@/lib/credit-utilization";

type CardDraft = {
  id: string;
  label: string;
  limit: string;
  balance: string;
};

type Mode = "totals" | "cards";

function newCard(id: string, label = "", limit = "", balance = ""): CardDraft {
  return { id, label, limit, balance };
}

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

export function CreditUtilizationCalculator() {
  const [mode, setMode] = useState<Mode>("totals");
  const [totalLimit, setTotalLimit] = useState("10000");
  const [totalBalance, setTotalBalance] = useState("3000");
  const [targetUtilizationPercent, setTargetUtilizationPercent] = useState(
    String(DEFAULT_TARGET_UTILIZATION_PERCENT),
  );
  const [cards, setCards] = useState<CardDraft[]>([
    newCard("card-1", "Card 1", "5000", "2000"),
    newCard("card-2", "Card 2", "5000", "1000"),
  ]);
  const [nextCard, setNextCard] = useState(3);

  const parsedCards =
    mode === "totals"
      ? [{ limit: parseAmount(totalLimit), balance: parseAmount(totalBalance) }]
      : cards.map((card) => ({
          label: card.label,
          limit: parseAmount(card.limit),
          balance: parseAmount(card.balance),
        }));

  const result = computeCreditUtilization({
    cards: parsedCards,
    targetUtilizationPercent:
      targetUtilizationPercent.trim() === ""
        ? Number.NaN
        : parseAmount(targetUtilizationPercent),
  });

  const showCards = mode === "cards" && result.cards.length > 0;
  const hasTarget = result.amountToPayForTarget !== null;

  function updateCard(id: string, field: keyof Omit<CardDraft, "id">, value: string) {
    setCards((current) =>
      current.map((card) => (card.id === id ? { ...card, [field]: value } : card)),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Input mode</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "totals", label: "Totals" },
                { id: "cards", label: "Per card" },
              ] as const
            ).map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="utilization-mode"
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => setMode(option.id)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {mode === "totals" ? (
          <>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Total credit limits</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={totalLimit}
                onChange={(event) => setTotalLimit(event.target.value)}
                className="input-field"
                placeholder="10000"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Current balances</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={totalBalance}
                onChange={(event) => setTotalBalance(event.target.value)}
                className="input-field"
                placeholder="3000"
              />
            </label>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-sm font-semibold">Cards</h2>
              <button
                type="button"
                onClick={() => {
                  setCards((current) => [
                    ...current,
                    newCard(`card-${nextCard}`, `Card ${current.length + 1}`),
                  ]);
                  setNextCard((value) => value + 1);
                }}
                className="btn-primary btn-primary-sm"
              >
                Add card
              </button>
            </div>
            <ol className="space-y-3">
              {cards.map((card, index) => (
                <li
                  key={card.id}
                  className="rounded-[12px] border border-line bg-surface p-3 sm:p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Card {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCards((current) =>
                          current.length === 1
                            ? [newCard(`card-${nextCard}`)]
                            : current.filter((item) => item.id !== card.id),
                        );
                        if (cards.length === 1) setNextCard((value) => value + 1);
                      }}
                      className="text-sm font-medium text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block text-sm">
                      <span className="mb-2 block text-xs text-muted">Label (optional)</span>
                      <input
                        type="text"
                        autoComplete="off"
                        value={card.label}
                        onChange={(event) =>
                          updateCard(card.id, "label", event.target.value)
                        }
                        className="input-field"
                        placeholder={`Card ${index + 1}`}
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-2 block text-xs text-muted">Credit limit</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={card.limit}
                        onChange={(event) =>
                          updateCard(card.id, "limit", event.target.value)
                        }
                        className="input-field"
                        placeholder="5000"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-2 block text-xs text-muted">Balance</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={card.balance}
                        onChange={(event) =>
                          updateCard(card.id, "balance", event.target.value)
                        }
                        className="input-field"
                        placeholder="1500"
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">
            Target utilization % (optional)
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {TARGET_UTILIZATION_PRESETS.map((value) => (
              <label
                key={value}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="target-utilization"
                  value={value}
                  checked={targetUtilizationPercent === String(value)}
                  onChange={() => setTargetUtilizationPercent(String(value))}
                  className="accent-mint"
                />
                {value}%
              </label>
            ))}
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-2 block text-xs text-muted">Custom (0–100)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={targetUtilizationPercent}
              onChange={(event) => setTargetUtilizationPercent(event.target.value)}
              className="input-field max-w-xs"
              placeholder="30"
            />
            <span className="mt-2 block text-muted">
              30% is a common starting target for FICO-style scoring.
            </span>
          </label>
        </fieldset>

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no
          account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Credit utilization</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Overall utilization"
            value={percent(result.utilizationPercent)}
            emphasize
          />
          <ResultRow label="Available credit" value={money(result.availableCredit)} />
          <ResultRow label="Total balances" value={money(result.totalBalance)} />
          <ResultRow label="Total credit limits" value={money(result.totalLimit)} />

          {hasTarget ? (
            <div className="border-t border-line pt-3">
              <ResultRow
                label={`Pay to reach ${percent(result.targetUtilizationPercent)}`}
                value={
                  result.alreadyAtOrBelowTarget
                    ? "Already there"
                    : money(result.amountToPayForTarget)
                }
              />
              <div className="mt-3">
                <ResultRow
                  label="Target balance"
                  value={money(result.targetBalance)}
                />
              </div>
            </div>
          ) : null}

          {result.overLimitAmount && result.overLimitAmount > 0 ? (
            <div className="border-t border-line pt-3">
              <ResultRow
                label="Over the limit"
                value={money(result.overLimitAmount)}
              />
            </div>
          ) : null}

          {showCards ? (
            <div className="border-t border-line pt-3">
              <dt className="text-muted">Per-card utilization</dt>
              <dd className="mt-2 space-y-3">
                {result.cards.map((card) => (
                  <div key={`${card.label}-${card.limit}-${card.balance}`}>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-muted">{card.label}</span>
                      <span className="text-right font-mono font-medium tabular-nums">
                        {percent(card.utilizationPercent)}
                        <span className="mt-0.5 block text-xs font-medium text-muted">
                          {money(card.availableCredit)} available
                          {card.amountToPayForTarget !== null &&
                          card.amountToPayForTarget > 0
                            ? ` · pay ${money(card.amountToPayForTarget)}`
                            : ""}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
        {!result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Enter credit limits above 0 and balances of 0 or more. In per-card
            mode, fill at least one complete card.
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
