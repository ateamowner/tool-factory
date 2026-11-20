"use client";

import { useState } from "react";
import { computeInsulation, PRODUCTS, SPACES, targetR, type InsulationInput, type Product, type Space, type Zone } from "@/lib/insulation";

const ZONES: Zone[] = [1, 2, 3, 4, 5, 6, 7, 8];
const fmt = (n: number, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });

export function InsulationCalculator() {
  const [input, setInput] = useState<InsulationInput>({
    area: "1000",
    zone: 5,
    space: "attic",
    product: "cellulose",
    existingR: "0",
    targetOverride: "",
    wastePercent: "5",
    pieceWidthIn: "23",
    pieceLengthFt: "25",
  });
  const set = (patch: Partial<InsulationInput>) => setInput((prev) => ({ ...prev, ...patch }));
  const r = computeInsulation(input);
  const isPiece = input.product === "batt" || input.product === "roll";
  const recommended = targetR(input.space, input.zone);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm" htmlFor="ins-area">
            <span className="mb-2 block text-xs text-muted">Area to insulate</span>
            <div className="flex items-center gap-1">
              <input id="ins-area" value={input.area} onChange={(e) => set({ area: e.target.value })} inputMode="decimal" autoComplete="off" placeholder="0" className="input-field font-mono" />
              <span className="text-xs text-muted">sq ft</span>
            </div>
          </label>
          <label className="block text-sm" htmlFor="ins-zone">
            <span className="mb-2 block text-xs text-muted">Climate zone</span>
            <select id="ins-zone" value={input.zone} onChange={(e) => set({ zone: Number(e.target.value) as Zone })} className="input-field">
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  Zone {z}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm" htmlFor="ins-space">
            <span className="mb-2 block text-xs text-muted">Where</span>
            <select id="ins-space" value={input.space} onChange={(e) => set({ space: e.target.value as Space })} className="input-field">
              {SPACES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Insulation type">
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={input.product === p.id}
              onClick={() => set({ product: p.id as Product })}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                input.product === p.id ? "border-mint bg-mint/10 text-mint" : "border-line text-muted hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm" htmlFor="ins-existing">
            <span className="mb-2 block text-xs text-muted">Existing R-value</span>
            <input id="ins-existing" value={input.existingR} onChange={(e) => set({ existingR: e.target.value })} inputMode="decimal" autoComplete="off" className="input-field font-mono" />
          </label>
          <label className="block text-sm" htmlFor="ins-target">
            <span className="mb-2 block text-xs text-muted">Target R (blank = R-{recommended})</span>
            <input id="ins-target" value={input.targetOverride ?? ""} onChange={(e) => set({ targetOverride: e.target.value })} inputMode="decimal" autoComplete="off" placeholder={String(recommended)} className="input-field font-mono" />
          </label>
          <label className="block text-sm" htmlFor="ins-waste">
            <span className="mb-2 block text-xs text-muted">Extra for waste (%)</span>
            <input id="ins-waste" value={input.wastePercent} onChange={(e) => set({ wastePercent: e.target.value })} inputMode="decimal" autoComplete="off" className="input-field font-mono" />
          </label>
        </div>
        {isPiece ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm" htmlFor="ins-width">
              <span className="mb-2 block text-xs text-muted">Batt or roll width (in)</span>
              <input id="ins-width" value={input.pieceWidthIn} onChange={(e) => set({ pieceWidthIn: e.target.value })} inputMode="decimal" autoComplete="off" className="input-field font-mono" />
            </label>
            <label className="block text-sm" htmlFor="ins-length">
              <span className="mb-2 block text-xs text-muted">Batt or roll length (ft)</span>
              <input id="ins-length" value={input.pieceLengthFt} onChange={(e) => set({ pieceLengthFt: e.target.value })} inputMode="decimal" autoComplete="off" className="input-field font-mono" />
            </label>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">
          Recommended R-values are typical planning targets by climate zone. Your local code and your utility may differ.
          Numbers stay on this device.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Insulation needed</h2>
        {!r.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">{r.error}</p>
        ) : r.kind === "none" ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Your existing R-{fmt(r.existingR)} already meets the R-{fmt(r.targetR)} target. No added insulation needed.
          </p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-mono text-2xl font-medium tabular-nums text-mint">
              {r.kind === "piece" ? `${r.pieces} ${input.product === "roll" ? (r.pieces === 1 ? "roll" : "rolls") : r.pieces === 1 ? "batt" : "batts"}` : `${r.bags} ${r.bags === 1 ? "bag" : "bags"}`}
            </p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono tabular-nums">
              <dt className="font-sans text-muted">Target R</dt>
              <dd className="text-right">R-{fmt(r.targetR)}</dd>
              <dt className="font-sans text-muted">Existing R</dt>
              <dd className="text-right">R-{fmt(r.existingR)}</dd>
              <dt className="font-sans text-muted">R to add</dt>
              <dd className="text-right">R-{fmt(r.neededR, 1)}</dd>
              <dt className="font-sans text-muted">Area incl. waste</dt>
              <dd className="text-right">{fmt(r.areaWithWaste)} sq ft</dd>
              <dt className="font-sans text-muted">Depth to add</dt>
              <dd className="text-right">{fmt(r.thicknessIn, 1)} in</dd>
              {r.kind === "piece" ? (
                <>
                  <dt className="font-sans text-muted">Batt or roll R</dt>
                  <dd className="text-right">R-{r.battR}</dd>
                  <dt className="font-sans text-muted">Layers</dt>
                  <dd className="text-right">{r.layers}</dd>
                  <dt className="font-sans text-muted">Each piece</dt>
                  <dd className="text-right">{fmt(r.pieceSqFt, 1)} sq ft</dd>
                </>
              ) : (
                <>
                  <dt className="font-sans text-muted">Volume</dt>
                  <dd className="text-right">{fmt(r.cubicFeet, 0)} cu ft</dd>
                  <dt className="font-sans text-muted">Weight</dt>
                  <dd className="text-right">{fmt(r.pounds, 0)} lb</dd>
                  <dt className="font-sans text-muted">Bag size</dt>
                  <dd className="text-right">{r.bagLb} lb</dd>
                  <dt className="font-sans text-muted">Coverage per bag</dt>
                  <dd className="text-right">{fmt(r.sqFtPerBag, 0)} sq ft</dd>
                </>
              )}
            </dl>
            <p className="text-xs leading-5 text-muted">
              {r.kind === "piece"
                ? "Batts and rolls use standard fiberglass R-values at about R-3.2 per inch. Check the package for the exact size and coverage."
                : "Blown-in coverage depends on the bag label and installed density. Use the coverage chart on the bag for the final count."}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
