"use client";

import { useState } from "react";
import { addToDate, diffDates, formatIso, parseIsoDate, weekdayName } from "@/lib/date-calc";

function todayIso(): string {
  const t = new Date();
  return formatIso({ y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() });
}

function num(value: string): number {
  const n = Number(value.trim() === "" ? "0" : value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function longDate(iso: string): string {
  const p = parseIsoDate(iso);
  if (!p) return "—";
  return `${weekdayName(p)}, ${new Date(Date.UTC(p.y, p.m - 1, p.d)).toLocaleDateString(undefined, { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" })}`;
}

export function DateCalculator() {
  const [mode, setMode] = useState<"between" | "add">("between");
  const [start, setStart] = useState(todayIso);
  const [end, setEnd] = useState(() => formatIso(addToDate(parseIsoDate(todayIso())!, { years: 0, months: 0, weeks: 0, days: 30 })));
  const [includeEnd, setIncludeEnd] = useState(false);
  const [op, setOp] = useState<"add" | "subtract">("add");
  const [years, setYears] = useState("0");
  const [months, setMonths] = useState("0");
  const [weeks, setWeeks] = useState("0");
  const [days, setDays] = useState("30");

  const s = parseIsoDate(start);
  const e = parseIsoDate(end);
  const diff = s && e ? diffDates(s, e, includeEnd) : null;
  const sign = op === "add" ? 1 : -1;
  const added = s
    ? formatIso(addToDate(s, { years: sign * num(years), months: sign * num(months), weeks: sign * num(weeks), days: sign * num(days) }))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 text-sm">
        <button type="button" className="chip" aria-pressed={mode === "between"} onClick={() => setMode("between")}>Days between dates</button>
        <button type="button" className="chip" aria-pressed={mode === "add"} onClick={() => setMode("add")}>Add or subtract</button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(ev) => ev.preventDefault()}>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Start date</span>
            <input type="date" value={start} onChange={(ev) => setStart(ev.target.value)} className="input-field" />
          </label>
          {mode === "between" ? (
            <>
              <label className="block text-sm">
                <span className="mb-2 block text-xs text-muted">End date</span>
                <input type="date" value={end} onChange={(ev) => setEnd(ev.target.value)} className="input-field" />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeEnd} onChange={(ev) => setIncludeEnd(ev.target.checked)} />
                Include end date (add 1 day)
              </label>
            </>
          ) : (
            <>
              <div className="flex gap-2 text-sm">
                <button type="button" className="chip" aria-pressed={op === "add"} onClick={() => setOp("add")}>Add</button>
                <button type="button" className="chip" aria-pressed={op === "subtract"} onClick={() => setOp("subtract")}>Subtract</button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {([
                  ["Years", years, setYears],
                  ["Months", months, setMonths],
                  ["Weeks", weeks, setWeeks],
                  ["Days", days, setDays],
                ] as [string, string, (v: string) => void][]).map(([label, value, set]) => (
                  <label key={label} className="block text-sm">
                    <span className="mb-2 block text-xs text-muted">{label}</span>
                    <input type="text" inputMode="numeric" autoComplete="off" value={value} onChange={(ev) => set(ev.target.value)} className="input-field" />
                  </label>
                ))}
              </div>
            </>
          )}
          <p className="text-sm leading-6 text-muted">Dates stay on this device. Nothing is uploaded, and there is no account.</p>
        </form>
        <aside className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24" aria-live="polite">
          {mode === "between" ? (
            diff ? (
              <>
                <p className="text-xs text-muted">Days between dates</p>
                <p className="mt-1 text-3xl font-semibold">{diff.totalDays.toLocaleString()} days</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-muted">Years, months, days</dt><dd>{diff.years} y {diff.months} m {diff.days} d</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Weeks</dt><dd>{diff.weeks} w {diff.remainderDays} d</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Weekdays (Mon–Fri)</dt><dd>{diff.businessDays.toLocaleString()}</dd></div>
                </dl>
              </>
            ) : (
              <p className="text-sm text-muted">Enter a valid start and end date.</p>
            )
          ) : added ? (
            <>
              <p className="text-xs text-muted">Result date</p>
              <p className="mt-1 text-2xl font-semibold">{longDate(added)}</p>
              <p className="mt-2 text-sm text-muted">{added}</p>
            </>
          ) : (
            <p className="text-sm text-muted">Enter a valid start date.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
