"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { prettyPrintJsonLd, validateSchemaMarkup } from "@/lib/schema-markup";

const SAMPLE = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a schema markup validator?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A schema markup validator — also used as a schema checker — reads JSON-LD and flags missing @context, @type, and other common structure errors."
      }
    }
  ]
}`;

export function SchemaMarkupValidator() {
  const [markup, setMarkup] = useState("");
  const result = useMemo(() => validateSchemaMarkup(markup), [markup]);
  const idle = markup.trim().length === 0;

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6">
      <p
        className="rounded-[10px] border border-line bg-surface px-3 py-2 text-sm leading-6 text-muted"
        role="note"
      >
        This schema markup validator checks JSON-LD structure in your browser.
        It does not call validator.schema.org and does not test Google rich
        results. Markup never leaves this tab.
      </p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label className="block text-sm" htmlFor="schema-markup">
          <span className="mb-2 block text-xs text-muted">JSON-LD or schema markup</span>
          <textarea
            id="schema-markup"
            value={markup}
            onChange={(event) => setMarkup(event.target.value)}
            rows={14}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            className="input-field min-h-[16rem] resize-y"
            placeholder='Paste JSON-LD, or a <script type="application/ld+json"> block.'
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => setMarkup(SAMPLE)}>
            Try a sample
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setMarkup(prettyPrintJsonLd(markup))}
            disabled={idle || !result.ok}
          >
            Pretty-print
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setMarkup("")}
            disabled={idle}
          >
            Clear
          </button>
        </div>
      </form>

      {idle ? (
        <p className="text-sm text-muted">
          Paste JSON-LD to check @context, @type, and common schema markup errors.
        </p>
      ) : !result.ok ? (
        <p className="text-sm text-danger">{result.error}</p>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-muted">
            {result.source === "html"
              ? `Extracted ${result.scriptCount} JSON-LD script${result.scriptCount === 1 ? "" : "s"}. `
              : null}
            {result.errorCount === 0 && result.warningCount === 0
              ? "No structure errors found."
              : `${result.errorCount} error${result.errorCount === 1 ? "" : "s"}, ${result.warningCount} warning${result.warningCount === 1 ? "" : "s"}.`}
          </p>

          {result.nodes.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold">Detected types</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {result.nodes.map((node) => (
                  <li key={`${node.path}-${node.type}`} className="chip inline-flex font-mono text-xs">
                    {node.type}
                    <span className="ml-2 text-muted">{node.path}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.issues.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold">Issues</h2>
              <ul className="mt-3 divide-y divide-line rounded-[10px] bg-surface">
                {result.issues.map((issue) => (
                  <li key={`${issue.path}-${issue.message}`} className="px-3 py-2">
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                        issue.severity === "error" ? "text-danger" : "text-mint"
                      }`}
                    >
                      {issue.severity}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-text">{issue.message}</p>
                    <p className="font-mono text-xs text-muted">{issue.path}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Pretty-printed JSON-LD</h2>
              <CopyButton value={result.pretty} label="Copy" />
            </div>
            <pre className="mt-3 overflow-x-auto rounded-[10px] bg-surface px-3 py-3 font-mono text-sm leading-6 text-mint">
              {result.pretty}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
