"use client";

import { useState } from "react";
import { formatNumber, parseAmount, simplifyRatio, solveRatio } from "@/lib/ratio";

type Mode = "solve" | "simplify";

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

export function RatioCalculator() {
  const [mode, setMode] = useState<Mode>("solve");
  const [a, setA] = useState("2");
  const [b, setB] = useState("3");
  const [c, setC] = useState("10");
  const [d, setD] = useState("");
  const [left, setLeft] = useState("1920");
  const [right, setRight] = useState("1080");

  const solved = solveRatio(parseAmount(a), parseAmount(b), parseAmount(c), parseAmount(d));
  const simple = simplifyRatio(parseAmount(left), parseAmount(right));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">Mode</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={radio}>
              <input type="radio" name="ratio-mode" value="solve" checked={mode === "solve"} onChange={() => setMode("solve")} className="accent-mint" />
              Solve A : B = C : D
            </label>
            <label className={radio}>
              <input type="radio" name="ratio-mode" value="simplify" checked={mode === "simplify"} onChange={() => setMode("simplify")} className="accent-mint" />
              Simplify a ratio
            </label>
          </div>
        </fieldset>
        {mode === "solve" ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field id="ratio-a" label="A" value={a} onChange={setA} placeholder="blank" />
              <Field id="ratio-b" label="B" value={b} onChange={setB} placeholder="blank" />
              <Field id="ratio-c" label="C" value={c} onChange={setC} placeholder="blank" />
              <Field id="ratio-d" label="D" value={d} onChange={setD} placeholder="blank" />
            </div>
            <p className="text-sm leading-6 text-muted">Leave one box blank and the calculator solves for it.</p>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field id="ratio-left" label="First number" value={left} onChange={setLeft} placeholder="1920" />
            <Field id="ratio-right" label="Second number" value={right} onChange={setRight} placeholder="1080" />
          </div>
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
              <Row label="Proportion" value={`${formatNumber(solved.a)} : ${formatNumber(solved.b)} = ${formatNumber(solved.c)} : ${formatNumber(solved.d)}`} />
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">{solved.error}</p>
          )
        ) : simple.valid ? (
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Simplest form" value={`${formatNumber(simple.left, 0)} : ${formatNumber(simple.right, 0)}`} emphasize />
            <Row label="As 1 : n" value={`1 : ${formatNumber(simple.oneTo)}`} />
            <Row label="As a decimal" value={formatNumber(simple.decimal)} />
            <Row label="Share of total" value={`${formatNumber(simple.percentLeft, 2)}% / ${formatNumber(simple.percentRight, 2)}%`} />
          </dl>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{simple.error}</p>
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
