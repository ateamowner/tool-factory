"use client";

import { useState } from "react";
import { GRADE_POINTS, computeGpa, type CourseLevel } from "@/lib/gpa";

type Row = { id: number; grade: string; credits: string; level: CourseLevel };

const initial: Row[] = [
  { id: 1, grade: "A", credits: "3", level: "regular" },
  { id: 2, grade: "B+", credits: "3", level: "honors" },
  { id: 3, grade: "A-", credits: "4", level: "ap" },
  { id: 4, grade: "B", credits: "3", level: "regular" },
];

export function GpaCalculator() {
  const [rows, setRows] = useState<Row[]>(initial);
  const [nextId, setNextId] = useState(5);
  const [honors, setHonors] = useState("0.5");
  const [ap, setAp] = useState("1");
  const [priorGpa, setPriorGpa] = useState("");
  const [priorCredits, setPriorCredits] = useState("");

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const hasPrior = priorGpa.trim() !== "" && priorCredits.trim() !== "";

  const result = computeGpa({
    courses: rows.map((r) => ({ grade: r.grade, credits: Number(r.credits), level: r.level })),
    honorsBonus: Number(honors),
    apBonus: Number(ap),
    priorGpa: hasPrior ? Number(priorGpa) : null,
    priorCredits: hasPrior ? Number(priorCredits) : null,
  });
  const anyWeighted = rows.some((r) => r.level !== "regular");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
      <form className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" onSubmit={(e) => e.preventDefault()}>
        <div className="hidden grid-cols-[1fr_5rem_7rem_2rem] gap-2 text-xs text-muted sm:grid">
          <span>Grade</span><span>Credits</span><span>Level</span><span />
        </div>
        {rows.map((r, i) => (
          <div key={r.id} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_5rem_7rem_2rem]">
            <label className="block text-sm" htmlFor={`gpa-grade-${r.id}`}>
              <span className="mb-1 block text-xs text-muted sm:hidden">Grade, course {i + 1}</span>
              <select id={`gpa-grade-${r.id}`} aria-label={`Grade for course ${i + 1}`} value={r.grade} onChange={(e) => update(r.id, { grade: e.target.value })} className="input-field">
                <option value="">Select</option>
                {GRADE_POINTS.map((g) => <option key={g.grade} value={g.grade}>{g.grade}</option>)}
              </select>
            </label>
            <label className="block text-sm" htmlFor={`gpa-credits-${r.id}`}>
              <span className="mb-1 block text-xs text-muted sm:hidden">Credits</span>
              <input id={`gpa-credits-${r.id}`} aria-label={`Credit hours for course ${i + 1}`} type="number" inputMode="decimal" min="0" step="any" value={r.credits} onChange={(e) => update(r.id, { credits: e.target.value })} className="input-field" />
            </label>
            <label className="block text-sm" htmlFor={`gpa-level-${r.id}`}>
              <span className="mb-1 block text-xs text-muted sm:hidden">Level</span>
              <select id={`gpa-level-${r.id}`} aria-label={`Level for course ${i + 1}`} value={r.level} onChange={(e) => update(r.id, { level: e.target.value as CourseLevel })} className="input-field">
                <option value="regular">Regular</option>
                <option value="honors">Honors</option>
                <option value="ap">AP / IB</option>
              </select>
            </label>
            <button type="button" aria-label={`Remove course ${i + 1}`} onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} disabled={rows.length <= 1} className="chip justify-center disabled:opacity-40">×</button>
          </div>
        ))}
        <button type="button" onClick={() => { setRows((rs) => [...rs, { id: nextId, grade: "A", credits: "3", level: "regular" }]); setNextId(nextId + 1); }} className="chip inline-flex">+ Add course</button>

        <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
          <label className="block text-sm" htmlFor="gpa-honors">
            <span className="mb-2 block text-xs text-muted">Honors bonus (points)</span>
            <input id="gpa-honors" type="number" inputMode="decimal" min="0" step="0.1" value={honors} onChange={(e) => setHonors(e.target.value)} className="input-field" />
          </label>
          <label className="block text-sm" htmlFor="gpa-ap">
            <span className="mb-2 block text-xs text-muted">AP / IB bonus (points)</span>
            <input id="gpa-ap" type="number" inputMode="decimal" min="0" step="0.1" value={ap} onChange={(e) => setAp(e.target.value)} className="input-field" />
          </label>
          <label className="block text-sm" htmlFor="gpa-prior">
            <span className="mb-2 block text-xs text-muted">Prior cumulative GPA (optional)</span>
            <input id="gpa-prior" type="number" inputMode="decimal" min="0" step="any" value={priorGpa} onChange={(e) => setPriorGpa(e.target.value)} className="input-field" />
          </label>
          <label className="block text-sm" htmlFor="gpa-prior-credits">
            <span className="mb-2 block text-xs text-muted">Prior credit hours (optional)</span>
            <input id="gpa-prior-credits" type="number" inputMode="decimal" min="0" step="any" value={priorCredits} onChange={(e) => setPriorCredits(e.target.value)} className="input-field" />
          </label>
        </div>
      </form>

      <div className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6" aria-live="polite">
        {result.valid ? (
          <>
            <div>
              <div className="text-xs text-muted">{anyWeighted ? "Semester GPA (weighted)" : "Semester GPA"}</div>
              <div className="mt-1 text-4xl font-semibold tabular-nums">{result.semesterGpa.toFixed(2)}</div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between gap-3"><span className="text-muted">Unweighted semester GPA</span><span className="tabular-nums">{result.unweightedSemesterGpa.toFixed(2)}</span></li>
              <li className="flex justify-between gap-3"><span className="text-muted">Credit hours this semester</span><span className="tabular-nums">{result.semesterCredits}</span></li>
              <li className="flex justify-between gap-3"><span className="text-muted">Quality points</span><span className="tabular-nums">{result.semesterQualityPoints}</span></li>
              {result.cumulativeGpa !== null ? (
                <>
                  <li className="flex justify-between gap-3 border-t border-line pt-2 font-semibold"><span>Cumulative GPA</span><span className="tabular-nums">{result.cumulativeGpa.toFixed(2)}</span></li>
                  <li className="flex justify-between gap-3"><span className="text-muted">Total credit hours</span><span className="tabular-nums">{result.cumulativeCredits}</span></li>
                </>
              ) : null}
            </ul>
            <div>
              <div className="mb-2 text-xs text-muted">Letter grade to points (4.0 scale)</div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted"><th className="py-1 font-normal">Grade</th><th className="py-1 font-normal">Points</th></tr></thead>
                <tbody>
                  {GRADE_POINTS.map((g) => <tr key={g.grade}><td className="py-0.5">{g.grade}</td><td className="py-0.5 tabular-nums">{g.points.toFixed(1)}</td></tr>)}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">{result.error}</p>
        )}
      </div>
    </div>
  );
}
