export type UtmFields = {
  destination: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  id?: string;
};

export type UtmPresetId = "meta" | "google" | "email";

export const UTM_PRESETS: Record<
  UtmPresetId,
  { label: string; source: string; medium: string }
> = {
  meta: { label: "Meta ads", source: "facebook", medium: "paid_social" },
  google: { label: "Google ads", source: "google", medium: "cpc" },
  email: { label: "Email", source: "newsletter", medium: "email" },
};

export const UTM_CSV_HEADERS = [
  "destination",
  "source",
  "medium",
  "campaign",
  "term",
  "content",
  "id",
  "final_url",
] as const;

export function applyNamingRules(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export function normalizeDestination(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function buildUtmUrl(
  fields: UtmFields,
  options: { applyRules?: boolean } = { applyRules: true },
): { url: string; error?: string } {
  const destination = normalizeDestination(fields.destination);
  if (!destination) {
    return { url: "", error: "Enter a destination URL." };
  }

  let parsed: URL;
  try {
    parsed = new URL(destination);
  } catch {
    return { url: "", error: "That destination URL is not valid." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { url: "", error: "Use an http or https destination URL." };
  }

  const apply = options.applyRules !== false;
  const set = (key: string, value?: string) => {
    const next = apply ? applyNamingRules(value ?? "") : (value ?? "").trim();
    if (next) parsed.searchParams.set(key, next);
    else parsed.searchParams.delete(key);
  };

  set("utm_source", fields.source);
  set("utm_medium", fields.medium);
  set("utm_campaign", fields.campaign);
  set("utm_term", fields.term);
  set("utm_content", fields.content);
  set("utm_id", fields.id);

  return { url: parsed.toString() };
}

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  const pushCell = () => {
    row.push(current);
    current = "";
  };
  const pushRow = () => {
    if (row.length === 1 && row[0] === "" && rows.length === 0) {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      pushCell();
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      pushCell();
      pushRow();
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    pushCell();
    pushRow();
  }

  const nonempty = rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
  if (nonempty.length === 0) return { headers: [], rows: [] };

  return { headers: nonempty[0].map((h) => h.trim()), rows: nonempty.slice(1) };
}

const HEADER_ALIASES: Record<string, keyof UtmFields | "destination"> = {
  destination: "destination",
  url: "destination",
  destination_url: "destination",
  website: "destination",
  source: "source",
  utm_source: "source",
  medium: "medium",
  utm_medium: "medium",
  campaign: "campaign",
  utm_campaign: "campaign",
  term: "term",
  utm_term: "term",
  content: "content",
  utm_content: "content",
  id: "id",
  utm_id: "id",
};

export function rowsToUtmFields(
  headers: string[],
  rows: string[][],
): UtmFields[] {
  const mapped = headers.map((header) => {
    const key = header.toLowerCase().replace(/\s+/g, "_");
    return HEADER_ALIASES[key];
  });

  const hasNamedHeaders = mapped.some(Boolean);

  return rows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => {
      const fields: UtmFields = {
        destination: "",
        source: "",
        medium: "",
        campaign: "",
      };

      if (hasNamedHeaders) {
        row.forEach((cell, index) => {
          const field = mapped[index];
          if (field) fields[field] = cell.trim();
        });
      } else {
        const [destination, source, medium, campaign, term, content, id] = row;
        fields.destination = (destination ?? "").trim();
        fields.source = (source ?? "").trim();
        fields.medium = (medium ?? "").trim();
        fields.campaign = (campaign ?? "").trim();
        fields.term = (term ?? "").trim();
        fields.content = (content ?? "").trim();
        fields.id = (id ?? "").trim();
      }

      return fields;
    });
}

export function toCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function buildUtmCsv(
  items: Array<UtmFields & { final_url: string }>,
): string {
  const lines = [
    UTM_CSV_HEADERS.join(","),
    ...items.map((item) =>
      [
        item.destination,
        item.source,
        item.medium,
        item.campaign,
        item.term ?? "",
        item.content ?? "",
        item.id ?? "",
        item.final_url,
      ]
        .map(toCsvValue)
        .join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}
