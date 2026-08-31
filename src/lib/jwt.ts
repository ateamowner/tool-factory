const TIME_CLAIMS = new Set(["exp", "nbf", "iat"]);

export type JwtDecodeSuccess = {
  ok: true;
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  headerJson: string;
  payloadJson: string;
  claims: { name: string; display: string }[];
  signaturePresent: boolean;
};

export type JwtDecodeFailure = {
  ok: false;
  error: string;
};

export type JwtDecodeResult = JwtDecodeSuccess | JwtDecodeFailure;

function normalizeToken(raw: string): string {
  let token = raw.trim();
  if (/^bearer\s+/i.test(token)) {
    token = token.replace(/^bearer\s+/i, "").trim();
  }
  return token.replace(/\s+/g, "");
}

function padBase64Url(segment: string): string {
  const pad = (4 - (segment.length % 4)) % 4;
  return segment + "=".repeat(pad);
}

export function decodeBase64UrlUtf8(segment: string): string {
  if (!segment) {
    throw new Error("Empty segment");
  }
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(segment)) {
    throw new Error("Invalid base64url");
  }

  const padded = padBase64Url(segment.replace(/=+$/, ""));
  const binary = atob(padded.replaceAll("-", "+").replaceAll("_", "/"));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function parseJsonObject(text: string, label: string): Record<string, unknown> {
  const value: unknown = JSON.parse(text);
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object`);
  }
  return value as Record<string, unknown>;
}

export function formatUnixClaim(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const ms = value > 1e12 ? value : value * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return `${value} (${date.toISOString()})`;
}

function formatClaim(name: string, value: unknown): string {
  if (TIME_CLAIMS.has(name)) {
    const formatted = formatUnixClaim(value);
    if (formatted) return formatted;
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function decodeJwt(raw: string): JwtDecodeResult {
  const token = normalizeToken(raw);
  if (!token) {
    return { ok: false, error: "Paste a JWT to decode the header and payload." };
  }

  const parts = token.split(".");
  if (parts.length === 5) {
    return {
      ok: false,
      error:
        "This looks like an encrypted JWT (JWE). This page only decodes unencrypted tokens (header.payload.signature).",
    };
  }
  if (parts.length < 2 || parts.length > 3) {
    return {
      ok: false,
      error:
        "A JWT should have two or three dot-separated parts: header, payload, and an optional signature.",
    };
  }
  if (!parts[0] || !parts[1]) {
    return { ok: false, error: "Header and payload segments cannot be empty." };
  }

  try {
    const header = parseJsonObject(decodeBase64UrlUtf8(parts[0]), "Header");
    const payload = parseJsonObject(decodeBase64UrlUtf8(parts[1]), "Payload");
    return {
      ok: true,
      header,
      payload,
      headerJson: JSON.stringify(header, null, 2),
      payloadJson: JSON.stringify(payload, null, 2),
      claims: Object.entries(payload).map(([name, value]) => ({
        name,
        display: formatClaim(name, value),
      })),
      signaturePresent: Boolean(parts[2]),
    };
  } catch {
    return {
      ok: false,
      error: "Could not base64url-decode or parse the header or payload as JSON.",
    };
  }
}
