"use client";

import { useState } from "react";
import {
  computeTile,
  DEFAULT_GROUT_IN,
  DEFAULT_TILE_LENGTH_IN,
  DEFAULT_TILE_WIDTH_IN,
  DEFAULT_TILES_PER_BOX,
  type TileInput,
} from "@/lib/tile";
import { formatArea } from "@/lib/square-footage";

type FieldKey = Exclude<keyof TileInput, "mode">;

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

export function TileCalculator() {
  const [input, setInput] = useState<TileInput>({
    mode: "dimensions",
    areaSqFt: "120",
    length: "10",
    width: "12",
    tileLengthIn: String(DEFAULT_TILE_LENGTH_IN),
    tileWidthIn: String(DEFAULT_TILE_WIDTH_IN),
    groutIn: String(DEFAULT_GROUT_IN),
    wastePercent: "10",
    tilesPerBox: String(DEFAULT_TILES_PER_BOX),
  });
  const set = (key: FieldKey) => (v: string) => setInput((prev) => ({ ...prev, [key]: v }));
  const r = computeTile(input);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="How to enter the area">
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
            <Field id="tile-length" label="Floor or wall length" unit="ft" value={input.length} onChange={set("length")} />
            <Field id="tile-width" label="Floor or wall width" unit="ft" value={input.width} onChange={set("width")} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="tile-area" label="Area to tile" unit="sq ft" value={input.areaSqFt} onChange={set("areaSqFt")} />
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="tile-l" label="Tile length" unit="in" value={input.tileLengthIn} onChange={set("tileLengthIn")} />
          <Field id="tile-w" label="Tile width" unit="in" value={input.tileWidthIn} onChange={set("tileWidthIn")} />
          <Field id="tile-grout" label="Grout gap" unit="in" value={input.groutIn} onChange={set("groutIn")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="tile-waste" label="Extra for waste" unit="%" value={input.wastePercent} onChange={set("wastePercent")} />
          <Field id="tile-box" label="Tiles per box" unit="" value={input.tilesPerBox} onChange={set("tilesPerBox")} />
        </div>
        <p className="text-sm leading-6 text-muted">
          Use 10% extra for straight layouts and 15% or more for diagonal or herringbone patterns. Check the box label
          for tiles per box. Numbers stay on this device.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Tile needed</h2>
        {!r.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">{r.error}</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">{r.tiles} tiles</p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums">
              <dt className="font-sans text-muted">Area</dt>
              <dd className="text-right">{formatArea(r.baseSqFt)} sq ft</dd>
              <dt className="font-sans text-muted">With waste</dt>
              <dd className="text-right">{formatArea(r.sqFtWithWaste)} sq ft</dd>
              <dt className="font-sans text-muted">One tile + grout</dt>
              <dd className="text-right">{formatArea(r.tileSqFt, 3)} sq ft</dd>
              <dt className="font-sans text-muted">Tiles (exact)</dt>
              <dd className="text-right">{formatArea(r.tilesExact, 1)}</dd>
              <dt className="font-sans text-muted">Boxes</dt>
              <dd className="text-right">{r.boxes > 0 ? r.boxes : "—"}</dd>
            </dl>
            <p className="text-xs leading-5 text-muted">
              Tiles and boxes are rounded up. Keep a few spare tiles from the same lot for future repairs.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
