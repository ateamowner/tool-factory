"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  SOFT_WASH_LEAD_STORAGE_KEY,
  SURFACE_PRESETS,
  SURFACES,
  buildSoftWashLeadMailto,
  getLeadFormEndpoint,
  readStoredSoftWashLeads,
  validateSoftWashLead,
  type SoftWashLeadSource,
  type SurfaceId,
} from "@/lib/soft-wash-mix";

function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

export function SoftWashQuoteForm({
  source,
  ready,
  defaultSurface,
  defaultSqFt,
  mixGallons = null,
}: {
  source: SoftWashLeadSource;
  ready: boolean;
  defaultSurface: SurfaceId;
  defaultSqFt: number | null;
  mixGallons?: number | null;
}) {
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadLocation, setLeadLocation] = useState("");
  const [leadSurface, setLeadSurface] = useState<SurfaceId>(defaultSurface);
  const [leadSqFt, setLeadSqFt] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<"idle" | "sending" | "sent" | "local">("idle");

  useEffect(() => {
    if (!ready) return;
    setLeadSurface(defaultSurface);
    if (defaultSqFt !== null && Number.isFinite(defaultSqFt) && defaultSqFt > 0) {
      setLeadSqFt(String(Math.round(defaultSqFt * 100) / 100));
    }
    setLeadStatus("idle");
    setLeadError(null);
  }, [ready, defaultSurface, defaultSqFt]);

  if (!ready) return null;

  async function onSubmitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadError(null);

    const checked = validateSoftWashLead({
      name: leadName,
      phone: leadPhone,
      location: leadLocation,
      surface: leadSurface,
      sqFt: parseAmount(leadSqFt),
      mixGallons,
      source,
      honeypot,
    });

    if (!checked.ok) {
      setLeadError(checked.error);
      return;
    }

    const endpoint = getLeadFormEndpoint();
    setLeadStatus("sending");

    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...checked.lead,
            _subject: "Soft wash quote request",
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        setLeadStatus("sent");
        return;
      } catch {
        setLeadError("The quote endpoint did not accept this request. Try again, or use the local copy below.");
      }
    }

    try {
      const existing = readStoredSoftWashLeads(window.localStorage.getItem(SOFT_WASH_LEAD_STORAGE_KEY));
      window.localStorage.setItem(
        SOFT_WASH_LEAD_STORAGE_KEY,
        JSON.stringify([...existing, checked.lead]),
      );
    } catch {
      // Storage can be blocked; mailto still gives a reviewable draft.
    }

    window.location.href = buildSoftWashLeadMailto(checked.lead);
    setLeadStatus("local");
  }

  return (
    <section
      className="rounded-2xl border border-line bg-card p-4 sm:p-6"
      aria-labelledby="quote-heading"
    >
      <h2 id="quote-heading" className="text-lg font-semibold">
        Get a local soft wash quote
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Send the job size from this estimate. This page does not sell washing
        services and does not promise a crew, price, or appointment.
      </p>

      {leadStatus === "sent" || leadStatus === "local" ? (
        <p className="mt-4 text-sm leading-6 text-mint" role="status">
          {leadStatus === "sent"
            ? "Quote request sent. A person can review the name, phone, location, surface, and square feet you entered."
            : "Quote request saved on this device and opened as an email draft so it can be reviewed."}
        </p>
      ) : (
        <form className="relative mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmitQuote} noValidate>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              value={leadName}
              onChange={(event) => setLeadName(event.target.value)}
              className="input-field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Phone</span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              required
              value={leadPhone}
              onChange={(event) => setLeadPhone(event.target.value)}
              className="input-field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">ZIP or city</span>
            <input
              type="text"
              name="location"
              autoComplete="postal-code"
              required
              value={leadLocation}
              onChange={(event) => setLeadLocation(event.target.value)}
              className="input-field"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs text-muted">Surface</span>
            <select
              name="surface"
              required
              value={leadSurface}
              onChange={(event) => setLeadSurface(event.target.value as SurfaceId)}
              className="input-field"
            >
              {SURFACES.map((id) => (
                <option key={id} value={id}>
                  {SURFACE_PRESETS[id].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-2 block text-xs text-muted">Square feet</span>
            <input
              type="text"
              name="sqft"
              inputMode="decimal"
              required
              value={leadSqFt}
              onChange={(event) => setLeadSqFt(event.target.value)}
              className="input-field max-w-xs"
            />
          </label>
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label>
              Company website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </label>
          </div>
          {leadError ? (
            <p className="sm:col-span-2 text-sm text-danger" role="alert">
              {leadError}
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={leadStatus === "sending"}>
              {leadStatus === "sending" ? "Sending…" : "Get a local soft wash quote"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
