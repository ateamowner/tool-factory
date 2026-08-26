export const PUBLIC_SITE_ORIGIN = "https://tool-factory-alpha.vercel.app";

export const SITE_NAME = "Tool Factory";
export const SITE_TAGLINE = "Free browser tools. No signup. Nothing uploaded.";
export const SITE_FOOTER_LINE = "Free browser tools. Nothing leaves the device.";

type SiteEnv = {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
};

function asOrigin(value: string, protocolFallback: "https" | "http"): string | null {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return null;

  try {
    const url = new URL(
      /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
        ? trimmed
        : `${protocolFallback}://${trimmed}`,
    );
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function resolveSiteUrl(env: SiteEnv): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL
    ? asOrigin(env.NEXT_PUBLIC_SITE_URL, "https")
    : null;
  if (explicit) return explicit;

  const vercelProduction = env.VERCEL_PROJECT_PRODUCTION_URL
    ? asOrigin(env.VERCEL_PROJECT_PRODUCTION_URL, "https")
    : null;
  if (vercelProduction) return vercelProduction;

  const vercel = env.VERCEL_URL ? asOrigin(env.VERCEL_URL, "https") : null;
  if (vercel) return vercel;

  return PUBLIC_SITE_ORIGIN;
}

export function getSiteUrl(): string {
  return resolveSiteUrl({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  });
}
