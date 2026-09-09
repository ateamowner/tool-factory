"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { VAT_COUNTRIES, validateVatNumber } from "@/lib/vat-number";

const SAMPLE = "DE136695976";

export function VatNumberValidator() {
  const [vatNumber, setVatNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const result = useMemo(
    () => validateVatNumber({ vatNumber, countryCode }),
    [vatNumber, countryCode],
  );
  const idle = vatNumber.trim().length === 0;

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6">
      <p
        className="rounded-[10px] border border-line bg-surface px-3 py-2 text-sm leading-6 text-muted"
        role="note"
      >
        This VAT number validator checks format and public check digits in your
        browser. It is not a VIES lookup and does not confirm that a number is
        registered or active with a tax authority. Nothing is uploaded.
      </p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label className="block text-sm" htmlFor="vat-number">
          <span className="mb-2 block text-xs text-muted">VAT number</span>
          <input
            id="vat-number"
            type="text"
            value={vatNumber}
            onChange={(event) => setVatNumber(event.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            className="input-field"
            placeholder="DE136695976 or 136 695 976"
          />
        </label>

        <label className="block text-sm" htmlFor="vat-country">
          <span className="mb-2 block text-xs text-muted">
            Country (optional)
          </span>
          <select
            id="vat-country"
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
            className="input-field"
          >
            <option value="">Detect from number</option>
            {VAT_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.code} — {country.name}
                {country.legacy ? " (legacy format)" : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">
            Validate
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setCountryCode("");
              setVatNumber(SAMPLE);
            }}
          >
            Try a sample
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setVatNumber("");
              setCountryCode("");
            }}
            disabled={idle && countryCode === ""}
          >
            Clear
          </button>
        </div>
      </form>

      {idle ? (
        <p className="text-sm text-muted">
          Paste a VAT ID with or without a country prefix to check format and
          check digits.
        </p>
      ) : (
        <div className="space-y-4" aria-live="polite">
          <p
            className={`text-sm font-semibold ${result.valid ? "text-mint" : "text-danger"}`}
          >
            {result.valid ? "Valid format" : "Invalid"}
          </p>
          <dl className="divide-y divide-line rounded-[10px] bg-surface">
            <ResultRow label="Country" value={result.countryName ?? "—"} />
            <ResultRow
              label="Normalized ID"
              value={result.normalized ?? "—"}
              mono
            />
            <ResultRow
              label="Check digits"
              value={
                result.checkDigitVerified
                  ? "Verified"
                  : result.valid
                    ? "Format only"
                    : "Not verified"
              }
            />
          </dl>
          <p className="text-sm leading-6 text-muted">{result.reason}</p>
          {result.normalized ? (
            <CopyButton value={result.normalized} label="Copy normalized ID" />
          ) : null}
        </div>
      )}
    </div>
  );
}

function ResultRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1 px-3 py-2 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`break-all text-sm text-text ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
