"use client";

import { useState } from "react";
import { computeWallpaper, ROLL_PRESETS, type WallpaperInput } from "@/lib/wallpaper";
import { formatArea } from "@/lib/square-footage";

const FIELDS: { key: "length" | "width" | "height" | "doors" | "windows" | "repeat" | "wastePercent"; label: string; unit: string }[] = [
  { key: "length", label: "Room length", unit: "UNIT" },
  { key: "width", label: "Room width", unit: "UNIT" },
  { key: "height", label: "Wall height", unit: "UNIT" },
  { key: "doors", label: "Doors", unit: "" },
  { key: "windows", label: "Windows", unit: "" },
  { key: "repeat", label: "Pattern repeat (0 if none)", unit: "in" },
  { key: "wastePercent", label: "Extra for waste", unit: "%" },
];

export function WallpaperCalculator() {
  const [input, setInput] = useState<WallpaperInput>({
    unit: "ft",
    length: "12",
    width: "12",
    height: "8",
    doors: "1",
    windows: "2",
    roll: "us-single",
    customWidth: "",
    customLength: "",
    repeat: "0",
    wastePercent: "10",
  });
  const set = (patch: Partial<WallpaperInput>) => setInput((prev) => ({ ...prev, ...patch }));
  const r = computeWallpaper(input);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Room units">
          {(["ft", "m"] as const).map((u) => (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={input.unit === u}
              onClick={() => set({ unit: u })}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                input.unit === u ? "border-mint bg-mint/10 text-mint" : "border-line text-muted hover:text-text"
              }`}
            >
              {u === "ft" ? "Feet" : "Meters"}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {FIELDS.map((f) => (
            <label key={f.key} className="block text-sm" htmlFor={`wp-${f.key}`}>
              <span className="mb-2 block text-xs text-muted">{f.label}</span>
              <div className="flex items-center gap-1">
                <input
                  id={`wp-${f.key}`}
                  value={input[f.key] ?? ""}
                  onChange={(e) => set({ [f.key]: e.target.value } as Partial<WallpaperInput>)}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  className="input-field font-mono"
                />
                {f.unit ? <span className="text-xs text-muted">{f.unit === "UNIT" ? input.unit : f.unit}</span> : null}
              </div>
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Roll size">
          {ROLL_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={input.roll === p.id}
              onClick={() => set({ roll: p.id })}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                input.roll === p.id ? "border-mint bg-mint/10 text-mint" : "border-line text-muted hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {input.roll === "custom" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm" htmlFor="wp-customWidth">
              <span className="mb-2 block text-xs text-muted">Roll width (in)</span>
              <input
                id="wp-customWidth"
                value={input.customWidth ?? ""}
                onChange={(e) => set({ customWidth: e.target.value })}
                inputMode="decimal"
                autoComplete="off"
                className="input-field font-mono"
              />
            </label>
            <label className="block text-sm" htmlFor="wp-customLength">
              <span className="mb-2 block text-xs text-muted">Roll length (ft)</span>
              <input
                id="wp-customLength"
                value={input.customLength ?? ""}
                onChange={(e) => set({ customLength: e.target.value })}
                inputMode="decimal"
                autoComplete="off"
                className="input-field font-mono"
              />
            </label>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">
          Doors count as about 21 sq ft and windows as about 15 sq ft. The pattern repeat is on the roll label; each
          strip is cut to a whole number of repeats. Numbers stay on this device.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Wallpaper needed</h2>
        {!r.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">{r.error}</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">
              {r.rolls} {r.rolls === 1 ? "roll" : "rolls"}
            </p>
            <p className="text-muted">
              {r.stripsWithWaste} strips incl. waste, {r.stripsPerRoll} strips per roll
            </p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums">
              <dt className="font-sans text-muted">Wall area</dt>
              <dd className="text-right">{formatArea(r.wallSqFt)} sq ft</dd>
              <dt className="font-sans text-muted">Openings</dt>
              <dd className="text-right">−{formatArea(r.openingsSqFt)} sq ft</dd>
              <dt className="font-sans text-muted">Area to cover</dt>
              <dd className="text-right">{formatArea(r.netSqFt)} sq ft</dd>
              <dt className="font-sans text-muted">Strip length</dt>
              <dd className="text-right">{formatArea(r.dropFt, 2)} ft</dd>
              <dt className="font-sans text-muted">Strips needed</dt>
              <dd className="text-right">{r.stripsNeeded}</dd>
              <dt className="font-sans text-muted">Roll coverage</dt>
              <dd className="text-right">{formatArea(r.rollSqFt, 1)} sq ft</dd>
            </dl>
            <p className="text-xs leading-5 text-muted">
              Strip method: strips = area ÷ (roll width × strip length), plus waste, then strips per roll.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
