export type DomainNormalizeOptions = {
  stripWww?: boolean;
};

export type DomainNormalizeResult = {
  ok: boolean;
  domain: string | null;
  reason: string;
};

export type DomainAgeParts = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
};

export type DomainDateSource = "rdap" | "pasted";

export type DomainRecord = {
  domain: string | null;
  created: Date | null;
  createdRaw: string | null;
  expires: Date | null;
  expiresRaw: string | null;
  registrar: string | null;
};

export type DomainAgeSummary = {
  ok: boolean;
  domain: string | null;
  created: Date | null;
  createdLabel: string | null;
  expires: Date | null;
  expiresLabel: string | null;
  registrar: string | null;
  age: DomainAgeParts | null;
  ageLabel: string | null;
  source: DomainDateSource | null;
  sourceNote: string;
  reason: string;
};

export type RdapFetchResult = {
  ok: boolean;
  endpoint: string | null;
  record: DomainRecord | null;
  reason: string;
};

const HOST_LABEL = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)$/;
const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const CREATION_LABELS = [
  "creation date",
  "created date",
  "created on",
  "domain registration date",
  "registration date",
  "registered on",
  "registered date",
  "domain create date",
  "created",
];

const EXPIRATION_LABELS = [
  "registry expiry date",
  "registrar registration expiration date",
  "registrar expiry date",
  "expiration date",
  "expiry date",
  "expire date",
  "expires on",
  "paid-till",
  "expires",
];

const REGISTRAR_LABELS = ["registrar name", "sponsoring registrar", "registrar"];

const SKIP_REGISTRAR_LABELS = [
  "registrar iana",
  "registrar url",
  "registrar whois",
  "registrar abuse",
  "registrar registration expiration",
];

export const SAMPLE_DOMAIN = "example.com";

export const SAMPLE_WHOIS = `Domain Name: EXAMPLE.COM
Registrar: RESERVED-Internet Assigned Numbers Authority
Creation Date: 1995-08-14T04:00:00Z
Registry Expiry Date: 2026-08-13T04:00:00Z
`;

function utcDate(year: number, month: number, day: number): Date | null {
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function daysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addUtcMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth() + months;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;
  const lastDay = daysInUtcMonth(targetYear, targetMonth);
  const day = Math.min(date.getUTCDate(), lastDay);
  return new Date(Date.UTC(targetYear, targetMonth, day));
}

function isValidHostname(hostname: string): boolean {
  if (hostname.length < 3 || hostname.length > 253) return false;
  if (IPV4.test(hostname) || hostname.includes(":")) return false;
  if (!hostname.includes(".")) return false;
  const labels = hostname.split(".");
  if (labels.some((label) => !HOST_LABEL.test(label))) return false;
  const tld = labels[labels.length - 1];
  return tld.length >= 2 && (/^[a-z]{2,63}$/.test(tld) || tld.startsWith("xn--"));
}

function extractHostname(raw: string): string | null {
  let value = raw.trim().replace(/^["']+|["']+$/g, "");
  if (!value) return null;
  if (/^mailto:/i.test(value) || value.includes("@")) {
    const email = value.replace(/^mailto:/i, "");
    const at = email.lastIndexOf("@");
    if (at === -1) return null;
    value = email.slice(at + 1);
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value) || value.startsWith("//")) {
    try {
      const url = new URL(value.startsWith("//") ? `https:${value}` : value);
      return url.hostname.toLowerCase().replace(/\.+$/, "");
    } catch {
      return null;
    }
  }

  const hostPort = value.split(/[/?#]/)[0]?.replace(/\.+$/, "") ?? "";
  if (!hostPort || hostPort.startsWith("[")) return null;
  return hostPort.replace(/:\d+$/, "").toLowerCase();
}

export function normalizeDomain(
  raw: string,
  options: DomainNormalizeOptions = {},
): DomainNormalizeResult {
  const hostname = extractHostname(raw);
  if (!hostname) {
    return {
      ok: false,
      domain: null,
      reason: "Enter a domain such as example.com.",
    };
  }

  const stripWww = options.stripWww ?? true;
  const domain =
    stripWww && hostname.startsWith("www.") ? hostname.slice(4) : hostname;

  if (!isValidHostname(domain)) {
    return {
      ok: false,
      domain: null,
      reason: "That does not look like a registered domain name.",
    };
  }

  return { ok: true, domain, reason: "Domain looks usable." };
}

export function parseFlexibleDate(raw: string): Date | null {
  const value = raw.trim().replace(/[.,;]+$/, "");
  if (!value) return null;

  const isoMatch = value.match(
    /^(\d{4}-\d{2}-\d{2})(?:[T\s].+)?$/,
  );
  if (isoMatch && value.includes("T")) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed);
  }

  const ymd = value.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})(?:\b|T)/);
  if (ymd) {
    return utcDate(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  }

  const dMonY = value.match(
    /^(\d{1,2})[-\s]([A-Za-z]{3,9})[-\s,]+(\d{4})(?:\b|T)/,
  );
  if (dMonY) {
    const month = MONTHS[dMonY[2].toLowerCase()];
    if (month !== undefined) {
      return utcDate(Number(dMonY[3]), month, Number(dMonY[1]));
    }
  }

  const monDY = value.match(
    /^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})(?:\b|T)/,
  );
  if (monDY) {
    const month = MONTHS[monDY[1].toLowerCase()];
    if (month !== undefined) {
      return utcDate(Number(monDY[3]), month, Number(monDY[2]));
    }
  }

  const compact = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    return utcDate(Number(compact[1]), Number(compact[2]) - 1, Number(compact[3]));
  }

  const us = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    return utcDate(Number(us[3]), Number(us[1]) - 1, Number(us[2]));
  }

  return null;
}

export function calculateDomainAge(
  created: Date,
  asOf: Date = new Date(),
): DomainAgeParts | null {
  if (Number.isNaN(created.getTime()) || Number.isNaN(asOf.getTime())) return null;
  if (asOf.getTime() < created.getTime()) return null;

  let years = 0;
  while (addUtcMonths(created, (years + 1) * 12).getTime() <= asOf.getTime()) {
    years += 1;
  }
  const afterYears = addUtcMonths(created, years * 12);

  let months = 0;
  while (addUtcMonths(afterYears, months + 1).getTime() <= asOf.getTime()) {
    months += 1;
  }
  const afterMonths = addUtcMonths(afterYears, months);
  const totalDays = Math.floor((asOf.getTime() - created.getTime()) / 86_400_000);
  const days = Math.floor((asOf.getTime() - afterMonths.getTime()) / 86_400_000);

  return { years, months, days, totalDays };
}

export function formatDomainAge(age: DomainAgeParts): string {
  const parts: string[] = [];
  if (age.years > 0) parts.push(`${age.years} ${age.years === 1 ? "year" : "years"}`);
  if (age.months > 0) parts.push(`${age.months} ${age.months === 1 ? "month" : "months"}`);
  if (age.days > 0 || parts.length === 0) {
    parts.push(`${age.days} ${age.days === 1 ? "day" : "days"}`);
  }
  return parts.join(", ");
}

export function formatUtcDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function vcardFullName(vcardArray: unknown): string | null {
  if (!Array.isArray(vcardArray) || vcardArray[0] !== "vcard") return null;
  const rows = vcardArray[1];
  if (!Array.isArray(rows)) return null;
  for (const row of rows) {
    if (!Array.isArray(row) || row[0] !== "fn") continue;
    const name = row[3];
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  return null;
}

function firstEntityName(entities: unknown, role: string): string | null {
  if (!Array.isArray(entities)) return null;
  for (const entity of entities) {
    if (!entity || typeof entity !== "object") continue;
    const record = entity as {
      roles?: unknown;
      vcardArray?: unknown;
      entities?: unknown;
    };
    const roles = Array.isArray(record.roles)
      ? record.roles.map((item) => String(item).toLowerCase())
      : [];
    if (roles.includes(role)) {
      const name = vcardFullName(record.vcardArray);
      if (name) return name;
    }
    const nested = firstEntityName(record.entities, role);
    if (nested) return nested;
  }
  return null;
}

function eventDate(
  events: unknown,
  actions: string[],
): { date: Date | null; raw: string | null } {
  if (!Array.isArray(events)) return { date: null, raw: null };
  const wanted = new Set(actions.map((action) => action.toLowerCase()));
  for (const event of events) {
    if (!event || typeof event !== "object") continue;
    const record = event as { eventAction?: unknown; eventDate?: unknown };
    const action = String(record.eventAction ?? "").toLowerCase();
    if (!wanted.has(action) || typeof record.eventDate !== "string") continue;
    const date = parseFlexibleDate(record.eventDate) ?? new Date(record.eventDate);
    if (Number.isNaN(date.getTime())) continue;
    return { date, raw: record.eventDate };
  }
  return { date: null, raw: null };
}

export function extractRdapRecord(data: unknown): DomainRecord {
  if (!data || typeof data !== "object") {
    return {
      domain: null,
      created: null,
      createdRaw: null,
      expires: null,
      expiresRaw: null,
      registrar: null,
    };
  }

  const record = data as {
    ldhName?: unknown;
    unicodeName?: unknown;
    events?: unknown;
    entities?: unknown;
  };
  const created = eventDate(record.events, ["registration", "registered", "created"]);
  const expires = eventDate(record.events, ["expiration", "expired", "expiry"]);
  const domainValue =
    typeof record.ldhName === "string"
      ? record.ldhName.toLowerCase()
      : typeof record.unicodeName === "string"
        ? record.unicodeName.toLowerCase()
        : null;

  return {
    domain: domainValue,
    created: created.date,
    createdRaw: created.raw,
    expires: expires.date,
    expiresRaw: expires.raw,
    registrar: firstEntityName(record.entities, "registrar"),
  };
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/[_/]+/g, " ").replace(/\s+/g, " ").trim();
}

function pickLabeledValue(text: string, labels: string[]): string | null {
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^([^:]{1,80}):\s*(.+)$/);
    if (!match) continue;
    const label = normalizeLabel(match[1]);
    if (SKIP_REGISTRAR_LABELS.some((skip) => label.startsWith(skip))) continue;
    if (!labels.includes(label)) continue;
    const value = match[2].trim();
    if (value) return value;
  }
  return null;
}

export function parseWhoisOrRdapText(text: string): DomainRecord {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      domain: null,
      created: null,
      createdRaw: null,
      expires: null,
      expiresRaw: null,
      registrar: null,
    };
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const fromJson = extractRdapRecord(parsed);
      if (fromJson.created || fromJson.expires || fromJson.registrar) {
        return fromJson;
      }
    } catch {
      // Fall through to line-oriented WHOIS parsing.
    }
  }

  const createdRaw = pickLabeledValue(trimmed, CREATION_LABELS);
  const expiresRaw = pickLabeledValue(trimmed, EXPIRATION_LABELS);
  const registrar = pickLabeledValue(trimmed, REGISTRAR_LABELS);
  const domainRaw = pickLabeledValue(trimmed, ["domain name", "domain"]);
  const domain = domainRaw ? normalizeDomain(domainRaw).domain : null;

  return {
    domain,
    created: createdRaw ? parseFlexibleDate(createdRaw) : null,
    createdRaw,
    expires: expiresRaw ? parseFlexibleDate(expiresRaw) : null,
    expiresRaw,
    registrar,
  };
}

export function summarizeDomainAge(
  record: DomainRecord,
  source: DomainDateSource,
  asOf: Date = new Date(),
): DomainAgeSummary {
  const sourceNote =
    source === "rdap"
      ? "Dates came from a public RDAP response in this browser. The query went to a public RDAP endpoint, not this site’s server."
      : "Dates were parsed from the WHOIS or RDAP text you pasted. That text stayed in this tab and was not sent to a server.";

  if (!record.created) {
    return {
      ok: false,
      domain: record.domain,
      created: null,
      createdLabel: null,
      expires: record.expires,
      expiresLabel: record.expires ? formatUtcDate(record.expires) : null,
      registrar: record.registrar,
      age: null,
      ageLabel: null,
      source,
      sourceNote,
      reason:
        source === "rdap"
          ? "RDAP responded, but no registration or creation date was present."
          : "No creation, created, or registration date was found in the pasted text.",
    };
  }

  const age = calculateDomainAge(record.created, asOf);
  if (!age) {
    return {
      ok: false,
      domain: record.domain,
      created: record.created,
      createdLabel: formatUtcDate(record.created),
      expires: record.expires,
      expiresLabel: record.expires ? formatUtcDate(record.expires) : null,
      registrar: record.registrar,
      age: null,
      ageLabel: null,
      source,
      sourceNote,
      reason: "The creation date is in the future, so age cannot be calculated.",
    };
  }

  return {
    ok: true,
    domain: record.domain,
    created: record.created,
    createdLabel: formatUtcDate(record.created),
    expires: record.expires,
    expiresLabel: record.expires ? formatUtcDate(record.expires) : null,
    registrar: record.registrar,
    age,
    ageLabel: formatDomainAge(age),
    source,
    sourceNote,
    reason: "Registration date found.",
  };
}

export function rdapLookupUrls(domain: string): string[] {
  const encoded = encodeURIComponent(domain);
  const tld = domain.split(".").pop()?.toLowerCase() ?? "";
  const urls = [`https://rdap.org/domain/${encoded}`];

  if (tld === "com" || tld === "net") {
    urls.push(`https://rdap.verisign.com/${tld}/v1/domain/${encoded}`);
  }
  if (tld === "org") {
    urls.push(`https://rdap.publicinterestregistry.org/rdap/domain/${encoded}`);
  }
  if (tld === "io") {
    urls.push(`https://rdap.nic.io/domain/${encoded}`);
  }
  if (["app", "dev", "page"].includes(tld)) {
    urls.push(`https://rdap.nic.${tld}/domain/${encoded}`);
  }

  return urls;
}

export async function fetchRdapDomain(
  domain: string,
  fetchImpl: typeof fetch = fetch,
): Promise<RdapFetchResult> {
  const urls = rdapLookupUrls(domain);
  let lastReason =
    "The public RDAP lookup failed. Paste a WHOIS or RDAP record instead.";

  for (const endpoint of urls) {
    try {
      const response = await fetchImpl(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/rdap+json, application/json",
        },
      });

      if (response.status === 404) {
        lastReason = `RDAP has no record for ${domain}.`;
        continue;
      }
      if (!response.ok) {
        lastReason = `RDAP returned HTTP ${response.status}.`;
        continue;
      }

      const data = (await response.json()) as unknown;
      const record = extractRdapRecord(data);
      return {
        ok: true,
        endpoint,
        record: {
          ...record,
          domain: record.domain ?? domain,
        },
        reason: "RDAP response received.",
      };
    } catch {
      lastReason =
        "The browser could not read that public RDAP endpoint (often a CORS or network block). Paste a WHOIS or RDAP record instead.";
    }
  }

  return {
    ok: false,
    endpoint: null,
    record: null,
    reason: lastReason,
  };
}
