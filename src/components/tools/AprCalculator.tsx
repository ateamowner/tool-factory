"use client";

import { useState } from "react";
import {
  computeApr,
  formatPercent,
  formatUsd,
  parseAprNumber,
} from "@/lib/apr";

export function AprCalculator() {
  const [loanAmount, setLoanAmount] = useState("20000");
  const [nominalRatePercent, setNominalRatePercent] = useState("6");
  const [termYears, setTermYears] = useState("5");
  const [termExtraMonths, setTermExtraMonths] = useState("0");
  const [fees, setFees] = useState("500");

  const result = computeApr({
    loanAmount: parseAprNumber(loanAmount),
    nominalRatePercent: parseAprNumber(nominalRatePercent),
    termYears: termYears.trim() === "" ? 0 : parseAprNumber(termYears),
    termExtraMonths:
      termExtraMonths.trim() === "" ? 0 : parseAprNumber(termExtraMonths),
    fees: fees.trim() === "" ? 0 : parseAprNumber(fees),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <form
        className="space-y-4 rounded-2xl border border-line bg-card p-4 sm:p-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Loan amount (principal)
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={loanAmount}
            onChange={(event) => setLoanAmount(event.target.value)}
            className="input-field"
            placeholder="20000"
          />
          <span className="mt-2 block text-muted">
            Amount financed before upfront fees — the balance used to set the
            monthly payment at the nominal rate.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Nominal annual interest rate (%)
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={nominalRatePercent}
            onChange={(event) => setNominalRatePercent(event.target.value)}
            className="input-field"
            placeholder="6.00"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-xs text-muted">
            Term (years + months, or months only)
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Years</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={termYears}
                onChange={(event) => setTermYears(event.target.value)}
                className="input-field"
                placeholder="5"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs text-muted">Extra months</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={termExtraMonths}
                onChange={(event) => setTermExtraMonths(event.target.value)}
                className="input-field"
                placeholder="0"
              />
            </label>
          </div>
        </fieldset>

        <label className="block text-sm">
          <span className="mb-2 block text-xs text-muted">
            Upfront fees / points / closing costs (optional)
          </span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={fees}
            onChange={(event) => setFees(event.target.value)}
            className="input-field"
            placeholder="0"
          />
          <span className="mt-2 block text-muted">
            Fees reduce net proceeds (what you effectively receive) while the
            payment is still based on the full loan amount. That usually makes
            APR higher than the nominal rate. Leave blank or 0 for none.
          </span>
        </label>

        <p className="text-sm leading-6 text-muted">
          Educational estimate for a fixed installment loan — not a lender
          disclosure, credit offer, or legal advice. Numbers stay on this
          device.
        </p>
      </form>

      <aside
        className="h-fit rounded-2xl border border-line bg-card p-5 lg:sticky lg:top-24"
        aria-live="polite"
      >
        <h2 className="text-lg font-semibold">APR results</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <ResultRow
            label="Estimated APR"
            value={
              result.valid && result.aprPercent !== null
                ? formatPercent(result.aprPercent)
                : "—"
            }
            emphasize
          />
          <ResultRow
            label="Monthly payment"
            value={
              result.valid && result.monthlyPayment !== null
                ? formatUsd(result.monthlyPayment)
                : "—"
            }
          />
          <ResultRow
            label="Nominal rate"
            value={
              result.valid && result.nominalRatePercent !== null
                ? formatPercent(result.nominalRatePercent, 2)
                : "—"
            }
          />
          <ResultRow
            label="Net proceeds"
            value={
              result.valid && result.netProceeds !== null
                ? formatUsd(result.netProceeds)
                : "—"
            }
          />
          <ResultRow
            label="Upfront fees"
            value={
              result.valid && result.fees !== null
                ? formatUsd(result.fees)
                : "—"
            }
          />
          <ResultRow
            label="Term"
            value={
              result.valid && result.termMonths !== null
                ? `${result.termMonths.toLocaleString("en-US")} months`
                : "—"
            }
          />
          <ResultRow
            label="Total payments"
            value={
              result.valid && result.totalPayments !== null
                ? formatUsd(result.totalPayments)
                : "—"
            }
          />
          <ResultRow
            label="Total interest"
            value={
              result.valid && result.totalInterest !== null
                ? formatUsd(result.totalInterest)
                : "—"
            }
          />
          <ResultRow
            label="Total cost (payments + fees)"
            value={
              result.valid && result.totalCost !== null
                ? formatUsd(result.totalCost)
                : "—"
            }
          />
        </dl>

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-text/90">{result.summary}</p>
        ) : null}

        {result.valid ? (
          <p className="mt-4 text-sm leading-6 text-muted">
            Educational APR-style estimate from the numbers you entered — not a
            Truth-in-Lending disclosure or lending advice. Fees and compounding
            rules can differ by product and jurisdiction.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">
            {result.error ??
              "Enter a loan amount, nominal rate, term of at least 1 month, and optional fees."}
          </p>
        )}
      </aside>
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
        className={`text-right font-mono font-medium tabular-nums ${emphasize ? "text-lg text-mint" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
