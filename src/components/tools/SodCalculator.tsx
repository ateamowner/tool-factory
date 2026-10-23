"use client";

import { useState } from "react";
import { computeSod, DEFAULT_PALLET_SQ_FT, DEFAULT_ROLL_SQ_FT, type SodInput } from "@/lib/sod";
import { formatArea } from "@/lib/square-footage";

type FieldKey = "areaSqFt" | "length" | "width" | "wastePercent" | "rollSqFt" | "palletSqFt";

function Field({
  id,
  label,
  unit,
  value,
  onChange,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <div className="flex items-center gap-1">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          className="input-field font-mono"
        />
        {unit ? <span className="text-xs text-muted">{unit}</span> : null}
      </div>
    </label>
  );
}

export function SodCalculator() {
  const [input, setInput] = useState<SodInput>({
    mode: "dimensions",
    areaSqFt: "1000",
    length: "50",
    width: "20",
    wastePercent: "5",
    rollSqFt: String(DEFAULT_ROLL_SQ_FT),
    palletSqFt: String(DEFAULT_PALLET_SQ_FT),
  });
  const set = (key: FieldKey) => (v: string) => setInput((prev) => ({ ...prev, [key]: v }));
  const r = computeSod(input);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="How to enter the lawn size">
          {(
            [
              ["dimensions", "Length × width"],
              ["area", "Total sq ft"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={input.mode === id}
              onClick={() => setInput((prev) => ({ ...prev, mode: id }))}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                input.mode === id ? "border-mint bg-mint/10 text-mint" : "border-line text-muted hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {input.mode === "dimensions" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="sod-length" label="Lawn length" unit="ft" value={input.length} onChange={set("length")} />
            <Field id="sod-width" label="Lawn width" unit="ft" value={input.width} onChange={set("width")} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="sod-area" label="Lawn area" unit="sq ft" value={input.areaSqFt} onChange={set("areaSqFt")} />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="sod-waste" label="Extra for waste" unit="%" value={input.wastePercent} onChange={set("wastePercent")} />
          <Field id="sod-roll" label="Roll / slab covers" unit="sq ft" value={input.rollSqFt} onChange={set("rollSqFt")} />
          <Field id="sod-pallet" label="Pallet covers" unit="sq ft" value={input.palletSqFt} onChange={set("palletSqFt")} />
        </div>
        <p className="text-sm leading-6 text-muted">
          A standard 2 × 5 ft roll covers 10 sq ft and a pallet usually covers 400–500 sq ft. Ask your sod farm for
          its sizes and change them here. Numbers stay on this device.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Sod needed</h2>
        {!r.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">{r.error}</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">
              {formatArea(r.sqFtWithWaste)} sq ft
            </p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums">
              <dt className="font-sans text-muted">Lawn area</dt>
              <dd className="text-right">{formatArea(r.baseSqFt)} sq ft</dd>
              <dt className="font-sans text-muted">With waste</dt>
              <dd className="text-right">{formatArea(r.sqFtWithWaste)} sq ft</dd>
              <dt className="font-sans text-muted">Square yards</dt>
              <dd className="text-right">{formatArea(r.sqYards, 1)} sq yd</dd>
              <dt className="font-sans text-muted">Rolls / slabs</dt>
              <dd className="text-right">{r.rolls}</dd>
              <dt className="font-sans text-muted">Pallets</dt>
              <dd className="text-right">
                {r.pallets} ({formatArea(r.palletsExact, 2)})
              </dd>
            </dl>
            <p className="text-xs leading-5 text-muted">
              Rolls and pallets are rounded up. Many suppliers sell partial pallets, so the exact pallet figure is shown
              too.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
