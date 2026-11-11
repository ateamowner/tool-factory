"use client";

import { useState } from "react";
import { fracDisplay, solveSystem } from "@/lib/system-of-equations";

const DEFAULT_2 = [
  ["2", "1", "5"],
  ["1", "-1", "1"],
];
const DEFAULT_3 = [
  ["1", "1", "1", "6"],
  ["0", "2", "5", "-4"],
  ["2", "5", "-1", "27"],
];

export function SystemOfEquationsCalculator() {
  const [size, setSize] = useState<2 | 3>(2);
  const [grid2, setGrid2] = useState(DEFAULT_2);
  const [grid3, setGrid3] = useState(DEFAULT_3);
  const [method, setMethod] = useState<"elimination" | "substitution">("elimination");

  const grid = size === 2 ? grid2 : grid3;
  const names = ["x", "y", "z"].slice(0, size);
  const result = solveSystem(size, grid);

  function setCell(r: number, c: number, value: string) {
    const update = (g: string[][]) => g.map((row, i) => (i === r ? row.map((v, j) => (j === c ? value : v)) : row));
    if (size === 2) setGrid2(update);
    else setGrid3(update);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <legend className="mb-2 block text-xs text-muted">System size</legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="soe-size" checked={size === 2} onChange={() => setSize(2)} />2 equations, 2 unknowns
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="soe-size" checked={size === 3} onChange={() => setSize(3)} />3 equations, 3 unknowns
            </label>
          </div>
        </fieldset>

        <div className="space-y-3">
          {grid.map((row, r) => (
            <div key={r} className="flex flex-wrap items-center gap-2 text-sm">
              {row.map((value, c) => (
                <span key={c} className="flex items-center gap-2">
                  {c === size ? <span aria-hidden="true">=</span> : c > 0 ? <span aria-hidden="true">+</span> : null}
                  <input
                    id={`soe-${r}-${c}`}
                    aria-label={`Equation ${r + 1}, ${c < size ? `coefficient of ${names[c]}` : "constant"}`}
                    value={value}
                    onChange={(e) => setCell(r, c, e.target.value)}
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    className="input-field w-20 text-center font-mono"
                  />
                  {c < size ? <span className="font-mono">{names[c]}</span> : null}
                </span>
              ))}
            </div>
          ))}
        </div>
        <p className="text-sm leading-6 text-muted">
          Enter the coefficients of each equation in the form ax + by{size === 3 ? " + cz" : ""} = d. Use 0 for a missing
          variable. Decimals and fractions like 1/3 work.
        </p>

        {result.valid ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs text-muted">Step-by-step work</h3>
              <div className="flex gap-2" role="group" aria-label="Solution method">
                <button type="button" className={`chip ${method === "elimination" ? "text-mint" : ""}`} aria-pressed={method === "elimination"} onClick={() => setMethod("elimination")}>
                  Elimination
                </button>
                <button type="button" className={`chip ${method === "substitution" ? "text-mint" : ""}`} aria-pressed={method === "substitution"} onClick={() => setMethod("substitution")}>
                  Substitution
                </button>
              </div>
            </div>
            <ol className="list-decimal space-y-2 pl-5 font-mono leading-7 tabular-nums">
              {(method === "elimination" ? result.eliminationSteps : result.substitutionSteps).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        ) : null}
        <p className="text-sm leading-6 text-muted">Numbers stay on this device. Nothing is uploaded, and there is no account.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-semibold">Result</h2>
        {result.valid ? (
          <div className="mt-4 space-y-3 text-sm">
            {result.status === "unique" ? (
              <dl className="space-y-3">
                {result.names.map((n, i) => (
                  <div key={n} className="flex items-start justify-between gap-4">
                    <dt className="text-muted">{n}</dt>
                    <dd className="text-right font-mono text-lg font-medium tabular-nums text-mint">{fracDisplay(result.solution[i])}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-lg font-medium text-mint">{result.summary}</p>
            )}
            <p className="font-mono text-xs leading-6 text-muted">
              Type: {result.status === "unique" ? "independent (one solution)" : result.status === "none" ? "inconsistent (no solution)" : "dependent (infinitely many)"}
              <br />
              Determinant: {fracDisplay(result.determinant)}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">{result.error}</p>
        )}
      </aside>
    </div>
  );
}
