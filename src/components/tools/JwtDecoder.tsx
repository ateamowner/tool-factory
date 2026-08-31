"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { decodeJwt } from "@/lib/jwt";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export function JwtDecoder() {
  const [token, setToken] = useState("");
  const decoded = useMemo(() => decodeJwt(token), [token]);
  const idle = token.trim().length === 0;

  return (
    <div className="space-y-5 rounded-2xl border border-line bg-card p-4 sm:p-6">
      <p
        className="rounded-[10px] border border-line bg-surface px-3 py-2 text-sm leading-6 text-muted"
        role="note"
      >
        Decoding is not verification. This JWT decoder reads the header and
        payload only. Signatures are not checked, and the token never leaves
        your browser.
      </p>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label className="block text-sm" htmlFor="jwt-token">
          <span className="mb-2 block text-xs text-muted">JWT</span>
          <textarea
            id="jwt-token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            rows={6}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            className="input-field min-h-[9rem] resize-y"
            placeholder="Paste a JWT (header.payload.signature). Bearer prefixes are stripped."
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setToken(SAMPLE_JWT)}
          >
            Try a sample
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setToken("")}
            disabled={idle}
          >
            Clear
          </button>
        </div>
      </form>

      {idle ? (
        <p className="text-sm text-muted">
          Paste a JWT token to decode the header and claims as readable JSON.
        </p>
      ) : !decoded.ok ? (
        <p className="text-sm text-danger">{decoded.error}</p>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-muted">
            {decoded.signaturePresent
              ? "Signature segment present — not verified."
              : "No signature segment. Unsigned tokens are still decoded, not trusted."}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <DecodedJson title="Header" value={decoded.headerJson} />
            <DecodedJson title="Payload" value={decoded.payloadJson} />
          </div>
          {decoded.claims.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold">Claims</h2>
              <dl className="mt-3 divide-y divide-line rounded-[10px] bg-surface">
                {decoded.claims.map((claim) => (
                  <div
                    key={claim.name}
                    className="grid gap-1 px-3 py-2 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-start"
                  >
                    <dt className="font-mono text-xs text-mint">{claim.name}</dt>
                    <dd className="break-all font-mono text-sm text-text">
                      {claim.display}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DecodedJson({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <CopyButton value={value} label="Copy" />
      </div>
      <pre className="mt-3 overflow-x-auto rounded-[10px] bg-surface px-3 py-3 font-mono text-sm leading-6 text-mint">
        {value}
      </pre>
    </div>
  );
}
