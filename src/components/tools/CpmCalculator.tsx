"use client";

import { useState } from "react";
import {
  calculateCpm,
  formatCount,
  formatCtr,
  formatMoney,
  parseCpmAmount,
  type CpmMode,
} from "@/lib/cpm";

const MODE_OPTIONS: { id: CpmMode; label: string; hint: string }[] = [
  {
    id: "cpm",
    label: "Cost + impressions",
    hint: "Solve CPM. CPM = (cost ÷ impressions) × 1,000. Add clicks to also see CPC and CTR.",
  },
  {
    id: "cost",
    label: "CPM + impressions",
    hint: "Solve cost. Cost = (CPM × impressions) ÷ 1,000.",
  },
  {
    id: "impressions",
    label: "Cost + CPM",
    hint: "Solve impressions. Impressions = (cost ÷ CPM) × 1,000.",
  },
  {
    id: "cpc_ctr",
    label: "CPC + CTR",
    hint: "Solve CPM from cost per click and click-through rate. CPM = CPC × (CTR ÷ 100) × 1,000.",
  },
];

export function CpmCalculator() {
  const [mode, setMode] = useState<CpmMode>("cpm");
  const [cost, setCost] = useState("500");
  const [impressions, setImpressions] = useState("100,000");
  const [cpm, setCpm] = useState("5");
  const [clicks, setClicks] = useState("");
  const [cpc, setCpc] = useState("1");
  const [ctrPercent, setCtrPercent] = useState("2");

  const clicksText = clicks.trim();
  const result = calculateCpm({
    mode,
    cost: parseCpmAmount(cost),
    impressions: parseCpmAmount(impressions),
    cpm: parseCpmAmount(cpm),
    clicks: clicksText === "" ? null : parseCpmAmount(clicks),
    cpc: parseCpmAmount(cpc),
    ctrPercent: parseCpmAmount(ctrPercent),
  });

  const activeMode = MODE_OPTIONS.find((option) => option.id === mode);
  const formula = formulaLine(result);

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
                className="flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-center text-sm has-checked:border-mint/60 has-checked:bg-mint/10"
              >
                <input
                  type="radio"
                  name="cpm-mode"
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

        {mode === "cpm" || mode === "impressions" ? (
          <AmountField
            id="cpm-cost"
            label="Cost"
            value={cost}
            onChange={setCost}
            placeholder="500"
            hint="Total ad spend for these impressions. Must be 0 or more. Commas are fine."
          />
        ) : null}

        {mode === "cpm" || mode === "cost" ? (
          <AmountField
            id="cpm-impressions"
            label="Impressions"
            value={impressions}
            onChange={setImpressions}
            placeholder="100,000"
            hint={
              mode === "cpm"
                ? "Must be greater than 0. CPM divides cost by this count."
                : "Times the ad was shown. Must be 0 or more."
            }
          />
        ) : null}

        {mode === "cost" || mode === "impressions" ? (
          <AmountField
            id="cpm-rate"
            label="CPM"
            value={cpm}
            onChange={setCpm}
            placeholder="5"
            hint={
              mode === "impressions"
                ? "Cost per 1,000 impressions. Must be greater than 0 to solve impressions."
                : "Cost per 1,000 impressions. Must be 0 or more."
            }
          />
        ) : null}

        {mode === "cpm" ? (
          <AmountField
            id="cpm-clicks"
            label="Clicks (optional)"
            value={clicks}
            onChange={setClicks}
            placeholder="2,000"
            hint="Leave blank to skip. When set, CPC = cost ÷ clicks and CTR = clicks ÷ impressions."
          />
        ) : null}

        {mode === "cpc_ctr" ? (
          <>
            <AmountField
              id="cpm-cpc"
              label="CPC"
              value={cpc}
              onChange={setCpc}
              placeholder="1"
              hint="Cost per click. Must be 0 or more."
            />
            <AmountField
              id="cpm-ctr"
              label="CTR (%)"
              value={ctrPercent}
              onChange={setCtrPercent}
              placeholder="2"
              hint="Click-through rate as a percent. 2 means 2%, not 0.02. Must be 0 or more."
            />
          </>
        ) : null}

        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">CPM results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="CPM"
            value={result.valid && result.cpm !== null ? formatMoney(result.cpm) : "—"}
            emphasize={mode === "cpm" || mode === "cpc_ctr"}
          />
          <ResultRow
            label="Cost"
            value={result.valid && result.cost !== null ? formatMoney(result.cost) : "—"}
            emphasize={mode === "cost"}
          />
          <ResultRow
            label="Impressions"
            value={
              result.valid && result.impressions !== null ? formatCount(result.impressions) : "—"
            }
            emphasize={mode === "impressions"}
          />
          <ResultRow
            label="CPC"
            value={result.valid && result.cpc !== null ? formatMoney(result.cpc) : "—"}
          />
          <ResultRow
            label="CTR"
            value={result.valid && result.ctrPercent !== null ? formatCtr(result.ctrPercent) : "—"}
          />
          <ResultRow label="Formula" value={formula} />
        </dl>

        {result.valid && result.cpm !== null ? (
          <p className="mt-4 text-sm leading-6 text-text/90">{summaryLine(result)}</p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Educational estimate of cost per 1,000 impressions. Not ad-platform billing
            advice. Platforms may bill viewable impressions, add fees, or round differently.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter finite numbers of 0 or more. CPM = (cost ÷ impressions) × 1,000."}
          </p>
        )}
      </aside>
    </div>
  );
}

function formulaLine(result: ReturnType<typeof calculateCpm>): string {
  if (!result.valid || result.cpm === null) return "—";

  if (result.mode === "cpm" && result.cost !== null && result.impressions !== null) {
    return `(${formatMoney(result.cost)} ÷ ${formatCount(result.impressions)}) × 1,000`;
  }

  if (result.mode === "cost" && result.impressions !== null) {
    return `(${formatMoney(result.cpm)} × ${formatCount(result.impressions)}) ÷ 1,000`;
  }

  if (result.mode === "impressions" && result.cost !== null) {
    return `(${formatMoney(result.cost)} ÷ ${formatMoney(result.cpm)}) × 1,000`;
  }

  if (result.mode === "cpc_ctr" && result.cpc !== null && result.ctrPercent !== null) {
    return `${formatMoney(result.cpc)} × (${formatCount(result.ctrPercent)} ÷ 100) × 1,000`;
  }

  return "—";
}

function summaryLine(result: ReturnType<typeof calculateCpm>): string {
  if (result.cpm === null) return "";

  if (result.mode === "cpm" && result.cost !== null && result.impressions !== null) {
    const clickNote =
      result.clicks !== null && result.cpc !== null && result.ctrPercent !== null
        ? ` ${formatCount(result.clicks)} clicks is ${formatMoney(result.cpc)} CPC and ${formatCtr(result.ctrPercent)} CTR.`
        : "";
    return `${formatMoney(result.cost)} across ${formatCount(result.impressions)} impressions is ${formatMoney(result.cpm)} CPM.${clickNote}`;
  }

  if (result.mode === "cost" && result.impressions !== null && result.cost !== null) {
    return `${formatMoney(result.cpm)} CPM across ${formatCount(result.impressions)} impressions costs ${formatMoney(result.cost)}.`;
  }

  if (result.mode === "impressions" && result.cost !== null && result.impressions !== null) {
    return `${formatMoney(result.cost)} at ${formatMoney(result.cpm)} CPM buys ${formatCount(result.impressions)} impressions.`;
  }

  if (result.cpc !== null && result.ctrPercent !== null) {
    return `${formatMoney(result.cpc)} CPC at ${formatCtr(result.ctrPercent)} CTR is ${formatMoney(result.cpm)} CPM.`;
  }

  return "";
}

function AmountField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint: string;
}) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-field"
        placeholder={placeholder}
      />
      <span className="mt-2 block text-muted">{hint}</span>
    </label>
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
