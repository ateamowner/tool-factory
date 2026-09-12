"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  SAMPLE_DOMAIN,
  SAMPLE_WHOIS,
  fetchRdapDomain,
  normalizeDomain,
  parseWhoisOrRdapText,
  summarizeDomainAge,
  type DomainAgeSummary,
} from "@/lib/domain-age";

export function DomainAgeChecker() {
  const [domain, setDomain] = useState("");
  const [stripWww, setStripWww] = useState(true);
  const [pasted, setPasted] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainAgeSummary | null>(null);
  const [lookupNote, setLookupNote] = useState("");

  const idle = domain.trim().length === 0 && pasted.trim().length === 0;

  async function lookupRdap() {
    const normalized = normalizeDomain(domain, { stripWww });
    if (!normalized.ok || !normalized.domain) {
      setResult({
        ok: false,
        domain: null,
        created: null,
        createdLabel: null,
        expires: null,
        expiresLabel: null,
        registrar: null,
        age: null,
        ageLabel: null,
        source: null,
        sourceNote: "",
        reason: normalized.reason,
      });
      setLookupNote("");
      return;
    }

    setLoading(true);
    setLookupNote("");
    try {
      const fetched = await fetchRdapDomain(normalized.domain);
      if (!fetched.ok || !fetched.record) {
        setResult({
          ok: false,
          domain: normalized.domain,
          created: null,
          createdLabel: null,
          expires: null,
          expiresLabel: null,
          registrar: null,
          age: null,
          ageLabel: null,
          source: null,
          sourceNote: "",
          reason: fetched.reason,
        });
        setLookupNote(
          "RDAP ran in this browser against a public endpoint (not this site). If the registry blocked the request, paste a WHOIS or RDAP record below — that text stays in this tab.",
        );
        return;
      }

      setResult(summarizeDomainAge(fetched.record, "rdap"));
      setLookupNote(fetched.endpoint ? `RDAP source: ${fetched.endpoint}` : "");
    } finally {
      setLoading(false);
    }
  }

  function parsePasted() {
    if (!pasted.trim()) {
      setResult({
        ok: false,
        domain: normalizeDomain(domain, { stripWww }).domain,
        created: null,
        createdLabel: null,
        expires: null,
        expiresLabel: null,
        registrar: null,
        age: null,
        ageLabel: null,
        source: "pasted",
        sourceNote:
          "Dates were parsed from the WHOIS or RDAP text you pasted. That text stayed in this tab and was not sent to a server.",
        reason: "Paste a WHOIS or RDAP record that includes a creation or registration date.",
      });
      setLookupNote("");
      return;
    }

    const record = parseWhoisOrRdapText(pasted);
    const typedDomain = normalizeDomain(domain, { stripWww }).domain;
    setResult(
      summarizeDomainAge(
        {
          ...record,
          domain: record.domain ?? typedDomain,
        },
        "pasted",
      ),
    );
    setLookupNote("Parsed locally from pasted WHOIS or RDAP text.");
  }

  const copyValue = result?.ok
    ? [
        result.domain ? `Domain: ${result.domain}` : null,
        result.createdLabel ? `Registered: ${result.createdLabel}` : null,
        result.ageLabel ? `Age: ${result.ageLabel}` : null,
        result.registrar ? `Registrar: ${result.registrar}` : null,
        result.expiresLabel ? `Expires: ${result.expiresLabel}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6">
      <p
        className="rounded-[10px] border border-line bg-surface px-3 py-2 text-sm leading-6 text-muted"
        role="note"
      >
        Lookups use public RDAP from this browser — the domain is sent to a
        public RDAP endpoint, not to this site. If that request is blocked,
        paste WHOIS or RDAP text. Pasted records never leave this tab.
      </p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void lookupRdap();
        }}
      >
        <label className="block text-sm" htmlFor="domain-name">
          <span className="mb-2 block text-xs text-muted">Domain</span>
          <input
            id="domain-name"
            type="text"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            className="input-field"
            placeholder="example.com or https://www.example.com/page"
          />
        </label>

        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={stripWww}
            onChange={(event) => setStripWww(event.target.checked)}
            className="mt-1 size-4 accent-mint"
          />
          <span>Strip a leading www. before lookup</span>
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Checking…" : "Validate"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setDomain(SAMPLE_DOMAIN);
              setPasted("");
              setResult(null);
              setLookupNote("");
            }}
          >
            Try a sample
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setDomain("");
              setPasted("");
              setResult(null);
              setLookupNote("");
            }}
            disabled={idle && !result}
          >
            Clear
          </button>
        </div>
      </form>

      {!result && !loading ? (
        <p className="text-sm text-muted">
          Enter a domain and validate to read the registration date, or paste a
          WHOIS / RDAP record if the public lookup is blocked.
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted" aria-live="polite">
          Querying a public RDAP endpoint from this browser…
        </p>
      ) : null}

      {result ? (
        <div className="space-y-4" aria-live="polite">
          <p
            className={`text-sm font-semibold ${result.ok ? "text-mint" : "text-danger"}`}
          >
            {result.ok ? "Registration date found" : "No age yet"}
          </p>
          <dl className="divide-y divide-line rounded-[10px] bg-surface">
            <ResultRow label="Domain" value={result.domain ?? "—"} mono />
            <ResultRow label="Registered" value={result.createdLabel ?? "—"} />
            <ResultRow label="Age" value={result.ageLabel ?? "—"} />
            <ResultRow label="Registrar" value={result.registrar ?? "—"} />
            <ResultRow label="Expires" value={result.expiresLabel ?? "—"} />
            <ResultRow
              label="Source"
              value={
                result.source === "rdap"
                  ? "Public RDAP"
                  : result.source === "pasted"
                    ? "Pasted WHOIS / RDAP"
                    : "—"
              }
            />
          </dl>
          <p className="text-sm leading-6 text-muted">{result.reason}</p>
          {result.sourceNote ? (
            <p className="text-sm leading-6 text-muted">{result.sourceNote}</p>
          ) : null}
          {lookupNote ? (
            <p className="break-all text-xs leading-6 text-muted">{lookupNote}</p>
          ) : null}
          {result.ok ? (
            <CopyButton value={copyValue} label="Copy summary" />
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3 border-t border-line pt-4">
        <label className="block text-sm" htmlFor="whois-paste">
          <span className="mb-2 block text-xs text-muted">
            Fallback: paste WHOIS or RDAP text
          </span>
          <textarea
            id="whois-paste"
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
            rows={8}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            className="input-field min-h-[10rem] resize-y"
            placeholder="Creation Date: 1995-08-14T04:00:00Z"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={parsePasted}>
            Parse pasted record
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setPasted(SAMPLE_WHOIS)}
          >
            Sample WHOIS
          </button>
        </div>
      </div>
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
