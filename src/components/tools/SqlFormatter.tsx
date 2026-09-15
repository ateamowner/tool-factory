"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { formatSql } from "@/lib/sql";

const SAMPLE_SQL = `select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = 1 and u.created_at > '2024-01-01' group by u.id, u.name having count(o.id) > 0 order by orders desc limit 25`;

export function SqlFormatter() {
  const [sql, setSql] = useState("");
  const formatted = useMemo(() => formatSql(sql), [sql]);
  const idle = sql.trim().length === 0;

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6">
      <p
        className="rounded-[10px] border border-line bg-surface px-3 py-2 text-sm leading-6 text-muted"
        role="note"
      >
        Generic SQL pretty-print in this tab. Keywords are uppercased and
        clauses are indented. Dialect-specific extensions (Postgres, MySQL,
        SQL Server, SQLite) usually still format. Nothing is uploaded.
      </p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!idle) setSql(formatted);
        }}
      >
        <label className="block text-sm" htmlFor="sql-input">
          <span className="mb-2 block text-xs text-muted">SQL</span>
          <textarea
            id="sql-input"
            value={sql}
            onChange={(event) => setSql(event.target.value)}
            rows={10}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            className="input-field min-h-[14rem] resize-y"
            placeholder="Paste SQL to format — SELECT, INSERT, UPDATE, DELETE, and nested subqueries."
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary" disabled={idle}>
            Format
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setSql(SAMPLE_SQL)}
          >
            Try a sample
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setSql("")}
            disabled={idle}
          >
            Clear
          </button>
        </div>
      </form>

      {idle ? (
        <p className="text-sm text-muted">
          Paste a query to pretty-print it with indentation, then copy the result.
        </p>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Formatted SQL</h2>
            <CopyButton value={formatted} label="Copy" />
          </div>
          <pre className="mt-3 overflow-x-auto rounded-[10px] bg-surface px-3 py-3 font-mono text-sm leading-6 text-mint">
            {formatted}
          </pre>
        </div>
      )}
    </div>
  );
}
