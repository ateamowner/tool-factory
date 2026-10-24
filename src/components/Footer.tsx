import Link from "next/link";
import { SITE_FOOTER_LINE, SITE_NAME } from "@/lib/site";

// Directory badges (reciprocal links required by these directories' free listings).
// Keep links followed: no nofollow/ugc/sponsored, or verification fails.
const FEATURED_BADGES = [
  {
    name: "Launch Llama",
    href: "https://tools.launchllama.co?utm_source=badge&utm_medium=referral",
    src: "https://tools.launchllama.co/featured-badge.png?v=2",
    alt: "Featured on Launch Llama",
    width: 200,
    height: 52,
  },
  {
    name: "Twelve Tools",
    href: "https://twelve.tools",
    src: "https://twelve.tools/badge0-dark.svg",
    alt: "Featured on Twelve Tools",
    width: 200,
    height: 54,
  },
  {
    name: "Startup Fame",
    href: "https://startupfa.me/s/tool-factory?utm_source=ateamkit.com",
    src: "https://startupfa.me/badges/featured-badge-small.webp",
    alt: "Tool Factory - Featured on Startup Fame",
    width: 224,
    height: 36,
  },
  {
    name: "StartupBase",
    href: "https://startupbase.io",
    src: "https://statics.startupbase.io/site/badges/launched-on-sb-dark.svg",
    alt: "Launched on StartupBase",
    width: 200,
    height: 55,
  },
  {
    name: "SaaSCity",
    href: "https://saascity.io",
    src: "https://saascity.io/badges/featured-dark.svg",
    alt: "Featured on SaaSCity",
    width: 150,
    height: 54,
  },
  {
    name: "ScrollLaunch",
    href: "https://www.scrolllaunch.com/products/tool-factory?ref=badge",
    src: "https://www.scrolllaunch.com/api/badge/tool-factory?variant=launched&theme=light",
    alt: "Tool Factory - Featured on ScrollLaunch",
    width: 220,
    height: 48,
  },
  {
    name: "BetterLaunch",
    href: "https://www.betterlaunch.co/product/tool-factory",
    src: "https://www.betterlaunch.co/badge-discover-dark.svg",
    alt: "Better Launch",
    width: 200,
    height: 56,
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <p className="text-xs uppercase tracking-wide text-muted">Featured on</p>
        <ul className="mt-3 flex flex-wrap items-center gap-3">
          {FEATURED_BADGES.map((badge) => (
            <li key={badge.name}>
              <a href={badge.href} target="_blank" rel="noopener" className="block opacity-80 transition-opacity hover:opacity-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={badge.src}
                  alt={badge.alt}
                  width={badge.width}
                  height={badge.height}
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-auto"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <Link href="/" className="text-muted hover:text-text">
            {SITE_NAME}
          </Link>
        </p>
        <p>{SITE_FOOTER_LINE}</p>
      </div>
    </footer>
  );
}
