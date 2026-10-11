"use client";

import { useState } from "react";
import { calculateConcrete, formatNumber, parseAmount, type ConcreteShape } from "@/lib/concrete";

const radio =
  "flex items-center justify-center gap-2 rounded-[10px] border border-line px-3 py-2 text-sm has-checked:border-mint/60 has-checked:bg-mint/10";

function Field({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <input id={id} type="text" inputMode="decimal" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} className="input-field" placeholder={placeholder} />
    </label>
  );
}

export function ConcreteCalculator() {
  const [shape, setShape] = useState<ConcreteShape>("slab");
  const [lengthFt, setLengthFt] = useState("10");
  const [widthFt, setWidthFt] = useState("10");
  const [thicknessIn, setThicknessIn] = useState("4");
  const [diameterIn, setDiameterIn] = useState("12");
  const [heightFt, setHeightFt] = useState("4");
  const [quantity, setQuantity] = useState("1");
  const [wastePercent, setWastePercent] = useState("10");

  const result = calculateConcrete({
    shape,
    lengthFt: parseAmount(lengthFt),
    widthFt: parseAmount(widthFt),
    thicknessIn: parseAmount(thicknessIn),
    diameterIn: parseAmount(diameterIn),
    heightFt: parseAmount(heightFt),
    quantity: parseAmount(quantity),
    wastePercent: parseAmount(wastePercent),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Shape</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={radio}>
              <input type="radio" name="concrete-shape" value="slab" checked={shape === "slab"} onChange={() => setShape("slab")} className="accent-mint" />
              Slab, patio, or footing
            </label>
            <label className={radio}>
              <input type="radio" name="concrete-shape" value="column" checked={shape === "column"} onChange={() => setShape("column")} className="accent-mint" />
              Round column or post hole
            </label>
          </div>
        </fieldset>
        {shape === "slab" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field id="concrete-length" label="Length (ft)" value={lengthFt} onChange={setLengthFt} placeholder="10" />
            <Field id="concrete-width" label="Width (ft)" value={widthFt} onChange={setWidthFt} placeholder="10" />
            <Field id="concrete-thickness" label="Thickness (in)" value={thicknessIn} onChange={setThicknessIn} placeholder="4" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="concrete-diameter" label="Diameter (in)" value={diameterIn} onChange={setDiameterIn} placeholder="12" />
            <Field id="concrete-height" label="Height or depth (ft)" value={heightFt} onChange={setHeightFt} placeholder="4" />
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="concrete-quantity" label="Quantity" value={quantity} onChange={setQuantity} placeholder="1" />
          <Field id="concrete-waste" label="Waste (%)" value={wastePercent} onChange={setWastePercent} placeholder="10" />
        </div>
        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no account.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Concrete needed</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Cubic yards (with waste)" value={result.valid && result.adjustedCubicYards !== null ? `${formatNumber(result.adjustedCubicYards)} yd³` : "—"} emphasize />
          <Row label="Cubic feet (with waste)" value={result.valid && result.adjustedCubicFeet !== null ? `${formatNumber(result.adjustedCubicFeet)} ft³` : "—"} />
          <Row label="Cubic yards (exact)" value={result.valid && result.cubicYards !== null ? `${formatNumber(result.cubicYards)} yd³` : "—"} />
          {result.bags.map((b) => (
            <Row key={b.id} label={b.label + "s"} value={result.valid ? formatNumber(b.count, 0) : "—"} />
          ))}
        </dl>
        <p className="mt-4 text-sm leading-6 text-muted">
          {result.valid
            ? "Educational estimate. Bag yields are approximate (80 lb ≈ 0.60 ft³, 60 lb ≈ 0.45 ft³, 40 lb ≈ 0.30 ft³). Ready-mix is usually ordered by the cubic yard."
            : result.error}
        </p>
      </aside>
    </div>
  );
}

function Row({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-right font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}>{value}</dd>
    </div>
  );
}
