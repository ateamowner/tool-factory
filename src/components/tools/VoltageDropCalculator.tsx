"use client";

import { useState } from "react";
import { computeVoltageDrop, GUIDELINE_PERCENT, sizesFor, type Awg, type Material, type Phase } from "@/lib/voltage-drop";

export function VoltageDropCalculator() {
  const [material, setMaterial] = useState<Material>("copper");
  const [awg, setAwg] = useState<Awg>("12");
  const [length, setLength] = useState("100");
  const [amps, setAmps] = useState("20");
  const [volts, setVolts] = useState("120");
  const [phase, setPhase] = useState<Phase>("single");

  const sizes = sizesFor(material);
  const activeAwg = sizes.includes(awg) ? awg : sizes[0];
  const result = computeVoltageDrop({ material, awg: activeAwg, lengthFt: Number(length), amps: Number(amps), volts: Number(volts), phase });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,1fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm" htmlFor="vd-material">
            <span className="mb-2 block text-xs text-muted">Wire material</span>
            <select id="vd-material" value={material} onChange={(e) => setMaterial(e.target.value as Material)} className="input-field">
              <option value="copper">Copper</option>
              <option value="aluminum">Aluminum</option>
            </select>
          </label>
          <label className="block text-sm" htmlFor="vd-awg">
            <span className="mb-2 block text-xs text-muted">Wire size (AWG)</span>
            <select id="vd-awg" value={activeAwg} onChange={(e) => setAwg(e.target.value as Awg)} className="input-field">
              {sizes.map((s) => <option key={s} value={s}>{s} AWG</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm" htmlFor="vd-length">
          <span className="mb-2 block text-xs text-muted">One-way length (feet)</span>
          <input id="vd-length" type="number" inputMode="decimal" min="0" step="any" value={length} onChange={(e) => setLength(e.target.value)} className="input-field" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm" htmlFor="vd-amps">
            <span className="mb-2 block text-xs text-muted">Current (amps)</span>
            <input id="vd-amps" type="number" inputMode="decimal" min="0" step="any" value={amps} onChange={(e) => setAmps(e.target.value)} className="input-field" />
          </label>
          <label className="block text-sm" htmlFor="vd-volts">
            <span className="mb-2 block text-xs text-muted">Source voltage</span>
            <input id="vd-volts" type="number" inputMode="decimal" min="0" step="any" value={volts} onChange={(e) => setVolts(e.target.value)} className="input-field" />
          </label>
        </div>
        <label className="block text-sm" htmlFor="vd-phase">
          <span className="mb-2 block text-xs text-muted">Phase</span>
          <select id="vd-phase" value={phase} onChange={(e) => setPhase(e.target.value as Phase)} className="input-field">
            <option value="single">Single phase</option>
            <option value="three">Three phase</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {[["120", "single", "120 V"], ["240", "single", "240 V"], ["208", "three", "208 V 3φ"], ["480", "three", "480 V 3φ"]].map(([v, p, label]) => (
            <button key={label} type="button" className="chip" onClick={() => { setVolts(v); setPhase(p as Phase); }}>{label}</button>
          ))}
        </div>
      </form>

      <div className="rounded-2xl border border-line bg-card p-4 sm:p-6" aria-live="polite">
        {result.valid ? (
          <>
            <p className="text-sm text-muted">Voltage drop</p>
            <p className="mt-1 text-4xl font-[650] tracking-tight">{result.percentDrop.toFixed(2)}%</p>
            <p className="mt-1 text-sm text-muted">
              {result.withinGuideline ? `At or under the ${GUIDELINE_PERCENT}% guideline.` : `Over the ${GUIDELINE_PERCENT}% guideline.`}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted">Volts dropped</dt>
                <dd className="text-xl font-semibold">{result.voltsDropped.toFixed(2)} V</dd>
              </div>
              <div>
                <dt className="text-muted">Voltage at load</dt>
                <dd className="text-xl font-semibold">{result.voltageAtLoad.toFixed(2)} V</dd>
              </div>
              <div>
                <dt className="text-muted">Resistance (NEC Table 8)</dt>
                <dd className="text-xl font-semibold">{result.ohmsPerKft} Ω/kft</dd>
              </div>
              <div>
                <dt className="text-muted">Smallest AWG under {GUIDELINE_PERCENT}%</dt>
                <dd className="text-xl font-semibold">{result.smallestAwg ? `${result.smallestAwg} AWG` : "None listed"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted">
              Uses DC resistance from NEC Chapter 9, Table 8 and ignores reactance and power factor. A planning estimate, not an installation spec.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted" role="alert">{result.error}</p>
        )}
      </div>
    </div>
  );
}
