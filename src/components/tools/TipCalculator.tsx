"use client";

import { useState } from "react";
import {
  DEFAULT_TIP_PERCENT,
  TIP_PRESETS,
  computeTip,
  formatPercent,
  formatUsd,
  parseTipNumber,
  type TipRoundMode,
} from "@/lib/tip";

const ROUND_OPTIONS: { value: TipRoundMode; label: string }[] = [
  { value: "none", label: "No rounding" },
  { value: "total", label: "Round total up" },
  { value: "per-person", label: "Round each share up" },
];

export function TipCalculator() {
  const [billAmount, setBillAmount] = useState("50.00");
  const [preset, setPreset] = useState<number | "custom">(DEFAULT_TIP_PERCENT);
  const [customPercent, setCustomPercent] = useState("");
  const [people, setPeople] = useState("1");
  const [roundMode, setRoundMode] = useState<TipRoundMode>("none");

  const tipPercent = preset === "custom" ? parseTipNumber(customPercent) : preset;

  const result = computeTip({
    billAmount: parseTipNumber(billAmount),
    tipPercent,
    people: parseTipNumber(people),
    roundMode,
  });

  const isSplit = result.valid && result.people !== null && result.people > 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Bill amount ($)</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={billAmount}
            onChange={(event) => setBillAmount(event.target.value)}
            className="input-field"
            placeholder="50.00"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Tip percentage</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {TIP_PRESETS.map((value) => (
              <label
                key={value}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="tip-preset"
                  value={value}
                  checked={preset === value}
                  onChange={() => setPreset(value)}
                  className="accent-mint"
                />
                {value}%
              </label>
            ))}
            <label className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10">
              <input
                type="radio"
                name="tip-preset"
                value="custom"
                checked={preset === "custom"}
                onChange={() => setPreset("custom")}
                className="accent-mint"
              />
              Custom
            </label>
          </div>
        </fieldset>

        {preset === "custom" ? (
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Custom tip (%)</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={customPercent}
              onChange={(event) => setCustomPercent(event.target.value)}
              className="input-field"
              placeholder="22"
            />
          </label>
        ) : null}

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Number of people</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={people}
            onChange={(event) => setPeople(event.target.value)}
            className="input-field"
            placeholder="1"
          />
          <span className="mt-2 block text-muted">
            Use 1 for a single check, or enter how many people are splitting it evenly.
          </span>
        </label>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Round up (optional)</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {ROUND_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="tip-round"
                  value={option.value}
                  checked={roundMode === option.value}
                  onChange={() => setRoundMode(option.value)}
                  className="accent-mint"
                />
                {option.label}
              </label>
            ))}
          </div>
          <span className="mt-2 block text-sm text-muted">
            Rounding up adds the extra cents to the tip so the total (or each
            share) is a whole dollar.
          </span>
        </fieldset>

        <p className="text-sm leading-6 text-muted">
          Enter the bill before or after tax — whichever you want to tip on.
          Numbers stay on this device.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">Tip results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Tip amount"
            value={result.valid && result.tipAmount !== null ? formatUsd(result.tipAmount) : "—"}
            emphasize
          />
          <ResultRow
            label="Total with tip"
            value={result.valid && result.total !== null ? formatUsd(result.total) : "—"}
          />
          <ResultRow
            label="Per person total"
            value={
              result.valid && result.totalPerPerson !== null
                ? formatUsd(result.totalPerPerson)
                : "—"
            }
          />
          <ResultRow
            label="Per person tip"
            value={
              result.valid && result.tipPerPerson !== null ? formatUsd(result.tipPerPerson) : "—"
            }
          />
          <ResultRow
            label="Effective tip %"
            value={
              result.valid && result.effectiveTipPercent !== null
                ? formatPercent(result.effectiveTipPercent)
                : "—"
            }
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">{result.summary}</p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ?? "Enter a bill amount, tip percentage, and number of people."}
          </p>
        )}

        {isSplit ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Uneven splits round each share up to the next cent so the shares
            always cover the full total.
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
        className={`text-right font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
