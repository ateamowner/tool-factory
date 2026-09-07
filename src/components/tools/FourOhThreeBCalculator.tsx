"use client";

import { useState } from "react";
import {
  CATCH_UP_50_PLUS_2026_ESTIMATE,
  CATCH_UP_AGE,
  ELECTIVE_DEFERRAL_LIMIT_2026_ESTIMATE,
  computeFourOhThreeB,
} from "@/lib/403b";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

function money(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function whole(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function FourOhThreeBCalculator() {
  const [currentAge, setCurrentAge] = useState("35");
  const [retirementAge, setRetirementAge] = useState("65");
  const [currentBalance, setCurrentBalance] = useState("25000");
  const [annualSalary, setAnnualSalary] = useState("65000");
  const [employeeContributionPercent, setEmployeeContributionPercent] = useState("10");
  const [employeeContributionDollars, setEmployeeContributionDollars] = useState("");
  const [employerMatchPercent, setEmployerMatchPercent] = useState("50");
  const [employerMatchSalaryCapPercent, setEmployerMatchSalaryCapPercent] = useState("6");
  const [annualReturnPercent, setAnnualReturnPercent] = useState("7");
  const [annualRaisePercent, setAnnualRaisePercent] = useState("2");

  const useDollarContribution = employeeContributionDollars.trim() !== "";

  const result = computeFourOhThreeB({
    currentAge: parseAmount(currentAge),
    retirementAge: parseAmount(retirementAge),
    currentBalance: currentBalance.trim() === "" ? 0 : parseAmount(currentBalance),
    annualSalary: parseAmount(annualSalary),
    employeeContributionPercent:
      employeeContributionPercent.trim() === "" ? 0 : parseAmount(employeeContributionPercent),
    employeeContributionDollars:
      employeeContributionDollars.trim() === "" ? 0 : parseAmount(employeeContributionDollars),
    useDollarContribution,
    employerMatchPercent:
      employerMatchPercent.trim() === "" ? 0 : parseAmount(employerMatchPercent),
    employerMatchSalaryCapPercent:
      employerMatchSalaryCapPercent.trim() === ""
        ? 0
        : parseAmount(employerMatchSalaryCapPercent),
    annualReturnPercent:
      annualReturnPercent.trim() === "" ? 0 : parseAmount(annualReturnPercent),
    annualRaisePercent: annualRaisePercent.trim() === "" ? 0 : parseAmount(annualRaisePercent),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Current age</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={currentAge}
              onChange={(event) => setCurrentAge(event.target.value)}
              className="input-field"
              placeholder="35"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Retirement age</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={retirementAge}
              onChange={(event) => setRetirementAge(event.target.value)}
              className="input-field"
              placeholder="65"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Current 403(b) balance</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={currentBalance}
            onChange={(event) => setCurrentBalance(event.target.value)}
            className="input-field"
            placeholder="25000"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">Annual salary</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={annualSalary}
            onChange={(event) => setAnnualSalary(event.target.value)}
            className="input-field"
            placeholder="65000"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Employee contribution %</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={employeeContributionPercent}
              onChange={(event) => setEmployeeContributionPercent(event.target.value)}
              className="input-field"
              placeholder="10"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">
              Employee contribution $ (optional)
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={employeeContributionDollars}
              onChange={(event) => setEmployeeContributionDollars(event.target.value)}
              className="input-field"
              placeholder="6500"
            />
            <span className="mt-2 block text-muted">
              A filled dollar amount overrides the percent and stays flat each year.
            </span>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">
              Employer match % (optional)
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={employerMatchPercent}
              onChange={(event) => setEmployerMatchPercent(event.target.value)}
              className="input-field"
              placeholder="50"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">
              Match up to % of salary (optional)
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={employerMatchSalaryCapPercent}
              onChange={(event) => setEmployerMatchSalaryCapPercent(event.target.value)}
              className="input-field"
              placeholder="6"
            />
            <span className="mt-2 block text-muted">
              Example: 50% match up to 6% of salary.
            </span>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Expected annual return %</span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={annualReturnPercent}
              onChange={(event) => setAnnualReturnPercent(event.target.value)}
              className="input-field"
              placeholder="7"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">
              Annual salary raise % (optional)
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={annualRaisePercent}
              onChange={(event) => setAnnualRaisePercent(event.target.value)}
              className="input-field"
              placeholder="2"
            />
          </label>
        </div>

        <p className="rounded-[12px] border border-line bg-surface p-3 text-sm leading-6 text-muted">
          2026 IRS elective deferral estimate (placeholder, not tax advice):{" "}
          {money(ELECTIVE_DEFERRAL_LIMIT_2026_ESTIMATE)} if you are under {CATCH_UP_AGE},
          plus a {money(CATCH_UP_50_PLUS_2026_ESTIMATE)} catch-up estimate at age{" "}
          {CATCH_UP_AGE} or older. Actual limits change, and plan rules vary.
        </p>

        <p className="text-sm leading-6 text-muted">
          Educational estimate only — not tax or investment advice. Numbers stay
          on this device. Nothing is uploaded, and there is no account.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">403(b) projection</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Balance at retirement"
            value={money(result.projectedBalance)}
            emphasize
          />
          <ResultRow
            label="Total employee contributions"
            value={money(result.totalEmployeeContributions)}
          />
          <ResultRow
            label="Total employer match"
            value={money(result.totalEmployerMatch)}
          />
          <ResultRow label="Estimated growth" value={money(result.estimatedGrowth)} />
          <ResultRow label="Working years" value={whole(result.workingYears)} />
        </dl>
        {result.valid && result.yearsCappedAtElectiveLimit ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Employee deferrals were capped at the 2026 IRS estimate in{" "}
            {result.yearsCappedAtElectiveLimit}{" "}
            {result.yearsCappedAtElectiveLimit === 1 ? "year" : "years"}.
          </p>
        ) : null}
        {!result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Enter a current age, a later retirement age, a salary above 0, and a
            return from 0 to 50%. Contribution percent should be 0 to 100, or
            enter a dollar amount instead.
          </p>
        ) : null}
      </aside>

      {result.valid && result.years.length > 0 ? (
        <details className="rounded-2xl border border-line bg-card p-4 sm:p-6 lg:col-span-2">
          <summary className="cursor-pointer text-sm font-semibold">
            Year-by-year table ({result.years.length} years)
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="py-2 pr-3 font-medium">Year</th>
                  <th className="py-2 pr-3 font-medium">Age</th>
                  <th className="py-2 pr-3 font-medium">Salary</th>
                  <th className="py-2 pr-3 font-medium">Employee</th>
                  <th className="py-2 pr-3 font-medium">Employer</th>
                  <th className="py-2 font-medium">Ending balance</th>
                </tr>
              </thead>
              <tbody>
                {result.years.map((row) => (
                  <tr key={row.year} className="border-b border-line/70">
                    <td className="py-2 pr-3 font-mono tabular-nums">{row.year}</td>
                    <td className="py-2 pr-3 font-mono tabular-nums">{row.age}</td>
                    <td className="py-2 pr-3 font-mono tabular-nums">{money(row.salary)}</td>
                    <td className="py-2 pr-3 font-mono tabular-nums">
                      {money(row.employeeContribution)}
                      {row.cappedAtElectiveLimit ? (
                        <span className="mt-0.5 block text-xs text-muted">Capped</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 font-mono tabular-nums">
                      {money(row.employerMatch)}
                    </td>
                    <td className="py-2 font-mono tabular-nums">
                      {money(row.endingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </div>
  );
}

function ResultRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
