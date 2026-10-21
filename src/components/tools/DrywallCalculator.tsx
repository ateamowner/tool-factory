"use client";

import { useState } from "react";
import { computeDrywall, SHEET_SIZES, type DrywallInput, type SheetSize } from "@/lib/drywall";
import { formatArea } from "@/lib/square-footage";

const FIELDS: { key: "length" | "width" | "height" | "doors" | "windows" | "extraSqFt"; label: string; unit: string }[] = [
  { key: "length", label: "Room length", unit: "ft" },
  { key: "width", label: "Room width", unit: "ft" },
  { key: "height", label: "Wall height", unit: "ft" },
  { key: "doors", label: "Doors", unit: "" },
  { key: "windows", label: "Windows", unit: "" },
  { key: "extraSqFt", label: "Extra area (optional)", unit: "sq ft" },
];

export function DrywallCalculator() {
  const [input, setInput] = useState<DrywallInput>({
    length: "12",
    width: "12",
    height: "8",
    includeCeiling: true,
    doors: "1",
    windows: "1",
    extraSqFt: "",
    sheet: "4x8",
    wastePercent: "10",
  });
  const set = (patch: Partial<DrywallInput>) => setInput((prev) => ({ ...prev, ...patch }));
  const r = computeDrywall(input);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-3">
          {FIELDS.map((f) => (
            <label key={f.key} className="block text-sm" htmlFor={`dw-${f.key}`}>
              <span className="mb-2 block text-xs text-muted">{f.label}</span>
              <div className="flex items-center gap-1">
                <input
                  id={`dw-${f.key}`}
                  value={input[f.key] ?? ""}
                  onChange={(e) => set({ [f.key]: e.target.value } as Partial<DrywallInput>)}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  className="input-field font-mono"
                />
                {f.unit ? <span className="text-xs text-muted">{f.unit}</span> : null}
              </div>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm" htmlFor="dw-ceiling">
          <input
            id="dw-ceiling"
            type="checkbox"
            checked={input.includeCeiling}
            onChange={(e) => set({ includeCeiling: e.target.checked })}
          />
          Include the ceiling
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Sheet size">
          {SHEET_SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={input.sheet === s.id}
              onClick={() => set({ sheet: s.id as SheetSize })}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                input.sheet === s.id ? "border-mint bg-mint/10 text-mint" : "border-line text-muted hover:text-text"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="block w-40 text-sm" htmlFor="dw-waste">
          <span className="mb-2 block text-xs text-muted">Extra for waste (%)</span>
          <input
            id="dw-waste"
            value={input.wastePercent}
            onChange={(e) => set({ wastePercent: e.target.value })}
            inputMode="decimal"
            autoComplete="off"
            className="input-field font-mono"
          />
        </label>
        <p className="text-sm leading-6 text-muted">
          Doors count as about 21 sq ft and windows as about 15 sq ft. Use extra area for closets, soffits, or a
          wall area you already know. Numbers stay on this device.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Drywall needed</h2>
        {!r.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">{r.error}</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">
              {r.sheets} {r.sheets === 1 ? "sheet" : "sheets"}
            </p>
            <p className="text-muted">
              {SHEET_SIZES.find((s) => s.id === input.sheet)?.label} for {formatArea(r.sqFtWithWaste)} sq ft incl. waste
            </p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums">
              <dt className="font-sans text-muted">Wall area</dt>
              <dd className="text-right">{formatArea(r.wallSqFt)} sq ft</dd>
              <dt className="font-sans text-muted">Ceiling area</dt>
              <dd className="text-right">{formatArea(r.ceilingSqFt)} sq ft</dd>
              <dt className="font-sans text-muted">Openings</dt>
              <dd className="text-right">−{formatArea(r.openingsSqFt)} sq ft</dd>
              <dt className="font-sans text-muted">Board area</dt>
              <dd className="text-right">{formatArea(r.netSqFt)} sq ft</dd>
              <dt className="font-sans text-muted">Joint compound</dt>
              <dd className="text-right">
                {formatArea(r.mudLb, 0)} lb (~{formatArea(r.mudGallons, 1)} gal)
              </dd>
              <dt className="font-sans text-muted">4.5-gal pails</dt>
              <dd className="text-right">{r.mudPails}</dd>
              <dt className="font-sans text-muted">Joint tape</dt>
              <dd className="text-right">
                {formatArea(r.tapeFt, 0)} ft ({r.tapeRolls} × 500 ft)
              </dd>
              <dt className="font-sans text-muted">Screws</dt>
              <dd className="text-right">~{r.screws}</dd>
            </dl>
            <p className="text-xs leading-5 text-muted">
              Compound, tape, and screws are rules of thumb for a standard three-coat finish, based on board area
              before waste.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
