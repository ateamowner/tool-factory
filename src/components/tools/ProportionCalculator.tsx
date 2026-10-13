"use client";

import { useState } from "react";
import { checkProportion, solveProportion } from "@/lib/proportion";
import { formatNumber, parseAmount } from "@/lib/ratio";

type Mode = "solve" | "check";

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

export function ProportionCalculator() {
  const [mode, setMode] = useState<Mode>("solve");
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const [c, setC] = useState("15");
  const [d, setD] = useState("");
  const [ca, setCa] = useState("2");
  const [cb, setCb] = useState("3");
  const [cc, setCc] = useState("10");
  const [cd, setCd] = useState("15");

  const solved = solveProportion(parseAmount(a), parseAmount(b), parseAmount(c), parseAmount(d));
  const checked = checkProportion(parseAmount(ca), parseAmount(cb), parseAmount(cc), parseAmount(cd));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Mode</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={radio}>
              <input type="radio" name="proportion-mode" value="solve" checked={mode === "solve"} onChange={() => setMode("solve")} className="accent-mint" />
              Solve for the missing value
            </label>
            <label className={radio}>
              <input type="radio" name="proportion-mode" value="check" checked={mode === "check"} onChange={() => setMode("check")} className="accent-mint" />
              Check if ratios are proportional
            </label>
          </div>
        </fieldset>
        {mode === "solve" ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field id="proportion-a" label="A" value={a} onChange={setA} placeholder="blank" />
              <Field id="proportion-b" label="B" value={b} onChange={setB} placeholder="blank" />
              <Field id="proportion-c" label="C" value={c} onChange={setC} placeholder="blank" />
              <Field id="proportion-d" label="D" value={d} onChange={setD} placeholder="blank" />
            </div>
            <p className="text-sm leading-6 text-muted">A / B = C / D. Leave one box blank and the calculator cross-multiplies to solve for it.</p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field id="proportion-check-a" label="A" value={ca} onChange={setCa} placeholder="2" />
              <Field id="proportion-check-b" label="B" value={cb} onChange={setCb} placeholder="3" />
              <Field id="proportion-check-c" label="C" value={cc} onChange={setCc} placeholder="10" />
              <Field id="proportion-check-d" label="D" value={cd} onChange={setCd} placeholder="15" />
            </div>
            <p className="text-sm leading-6 text-muted">Enter all four numbers to test whether A / B equals C / D.</p>
          </>
        )}
        <p className="text-sm leading-6 text-muted">
          Numbers stay on this device. Nothing is uploaded, and there is no account.
        </p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {mode === "solve" ? (
          solved.valid ? (
            <dl className="mt-4 space-y-3 text-sm">
              <Row label={`${solved.missing.toUpperCase()} =`} value={formatNumber(solved.value)} emphasize />
              <Row label="Proportion" value={`${formatNumber(solved.a)} / ${formatNumber(solved.b)} = ${formatNumber(solved.c)} / ${formatNumber(solved.d)}`} />
              <Row label="Cross products" value={`${formatNumber(solved.a * solved.d)} = ${formatNumber(solved.b * solved.c)}`} />
              <Row label="Scale factor" value={`× ${formatNumber(solved.scale)}`} />
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">{solved.error}</p>
          )
        ) : checked.valid ? (
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Proportional?" value={checked.proportional ? "Yes" : "No"} emphasize />
            <Row label="A × D" value={formatNumber(checked.leftProduct)} />
            <Row label="B × C" value={formatNumber(checked.rightProduct)} />
            <Row label="A / B" value={formatNumber(checked.leftRatio, 6)} />
            <Row label="C / D" value={formatNumber(checked.rightRatio, 6)} />
            {checked.proportional ? <Row label="Scale factor" value={`× ${formatNumber(checked.scale)}`} /> : null}
          </dl>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{checked.error}</p>
        )}
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
