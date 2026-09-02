export const PUBLIC_SITE_ORIGIN = "https://ateamkit.com";

export const SITE_NAME = "Tool Factory";
export const SITE_TAGLINE = "Free browser tools. No signup. Nothing uploaded.";
export const SITE_FOOTER_LINE = "Free browser tools. Nothing leaves the device.";

type SiteEnv = {
  NEXT_PUBLIC_SITE_URL?: string;
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

  return PUBLIC_SITE_ORIGIN;
}

export function getSiteUrl(): string {
  return resolveSiteUrl({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

/** HTTPS ateamkit.com URL for sitemap locs and canonicals. Never the Vercel host. */
export function toPublicUrl(pathname = "/"): string {
  const trimmed = pathname.trim() || "/";
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (path === "/") return `${PUBLIC_SITE_ORIGIN}/`;
  return `${PUBLIC_SITE_ORIGIN}${path.replace(/\/+$/, "")}`;
}
