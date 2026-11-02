"use client";

import { useState } from "react";
import { computeBtu, type BtuInput, type Climate, type SunExposure } from "@/lib/btu";
import { formatArea } from "@/lib/square-footage";

type FieldKey = "length" | "width" | "areaSqFt" | "ceilingFt" | "people";

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

function Pills<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map(([id, text]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={value === id}
            onClick={() => onChange(id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              value === id ? "border-mint bg-mint/10 text-mint" : "border-line text-muted hover:text-text"
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

const btu = (n: number) => `${Math.round(n).toLocaleString("en-US")} BTU`;

export function BtuCalculator() {
  const [input, setInput] = useState<BtuInput>({
    mode: "dimensions",
    length: "12",
    width: "15",
    areaSqFt: "180",
    ceilingFt: "8",
    sun: "normal",
    people: "2",
    kitchen: false,
    climate: "moderate",
  });
  const set = (key: FieldKey) => (v: string) => setInput((prev) => ({ ...prev, [key]: v }));
  const r = computeBtu(input);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <Pills
          label="How to enter the room size"
          value={input.mode}
          options={[
            ["dimensions", "Length × width"],
            ["area", "Total sq ft"],
          ] as const}
          onChange={(mode) => setInput((prev) => ({ ...prev, mode }))}
        />
        {input.mode === "dimensions" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="btu-length" label="Room length" unit="ft" value={input.length} onChange={set("length")} />
            <Field id="btu-width" label="Room width" unit="ft" value={input.width} onChange={set("width")} />
            <Field id="btu-ceiling" label="Ceiling height" unit="ft" value={input.ceilingFt} onChange={set("ceilingFt")} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="btu-area" label="Room area" unit="sq ft" value={input.areaSqFt} onChange={set("areaSqFt")} />
            <Field id="btu-ceiling-a" label="Ceiling height" unit="ft" value={input.ceilingFt} onChange={set("ceilingFt")} />
          </div>
        )}
        <Pills<SunExposure>
          label="Sun exposure"
          value={input.sun}
          options={[
            ["shaded", "Heavily shaded"],
            ["normal", "Average"],
            ["sunny", "Very sunny"],
          ]}
          onChange={(sun) => setInput((prev) => ({ ...prev, sun }))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="btu-people" label="People who usually use the room" unit="" value={input.people} onChange={set("people")} />
          <label className="flex items-center gap-2 self-end pb-2 text-sm" htmlFor="btu-kitchen">
            <input
              id="btu-kitchen"
              type="checkbox"
              checked={input.kitchen}
              onChange={(e) => setInput((prev) => ({ ...prev, kitchen: e.target.checked }))}
            />
            The room is a kitchen
          </label>
        </div>
        <Pills<Climate>
          label="Climate (for heating)"
          value={input.climate}
          options={[
            ["warm", "Warm"],
            ["moderate", "Moderate"],
            ["cool", "Cool"],
            ["cold", "Cold"],
          ]}
          onChange={(climate) => setInput((prev) => ({ ...prev, climate }))}
        />
        <p className="text-sm leading-6 text-muted">
          Cooling follows the ENERGY STAR room AC chart, with 10% off for shade, 10% more for strong sun, 600 BTU for each
          person past two, and 4,000 BTU for a kitchen. Numbers stay on this device.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">BTUs needed</h2>
        {!r.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">{r.error}</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">{btu(r.coolingBtu)} cooling</p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums">
              <dt className="font-sans text-muted">Room area</dt>
              <dd className="text-right">{formatArea(r.areaSqFt)} sq ft</dd>
              <dt className="font-sans text-muted">Chart base</dt>
              <dd className="text-right">{btu(r.baseCooling)}</dd>
              <dt className="font-sans text-muted">Ceiling factor</dt>
              <dd className="text-right">× {formatArea(r.ceilingFactor, 3)}</dd>
              <dt className="font-sans text-muted">Cooling</dt>
              <dd className="text-right">{btu(r.coolingBtu)}</dd>
              <dt className="font-sans text-muted">Tons</dt>
              <dd className="text-right">{formatArea(r.tons, 2)}</dd>
              <dt className="font-sans text-muted">Heating</dt>
              <dd className="text-right">{btu(r.heatingBtu)}</dd>
            </dl>
            <p className="rounded-xl border border-line p-3 leading-6">
              {r.suggestedUnitBtu
                ? `Suggested AC size: ${r.suggestedUnitBtu.toLocaleString("en-US")} BTU (the next standard size up).`
                : "This is more than a 5-ton (60,000 BTU) unit. Split the space into zones or ask an HVAC pro for a Manual J load calculation."}
            </p>
            <p className="text-xs leading-5 text-muted">
              Rules of thumb for planning, not a Manual J load calculation. Insulation, windows and local climate change the
              real load.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
