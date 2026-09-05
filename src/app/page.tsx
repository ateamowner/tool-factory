import type { Metadata } from "next";
import Link from "next/link";
import { AdPlaceholder } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { ToolCard } from "@/components/ToolCard";
import { homePageJsonLd } from "@/lib/faq-schema";
import { PUBLIC_SITE_ORIGIN, SITE_NAME, SITE_TAGLINE, toPublicUrl } from "@/lib/site";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  getFeaturedTools,
  getToolsByCategory,
} from "@/lib/tools";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — Free Browser Tools`,
  },
  description:
    "Free online calculators and SEO/dev tools — stock average, paycheck, UTM builder, robots.txt, schema validator, and more. Runs in your browser.",
  alternates: { canonical: toPublicUrl("/") },
};

const trustChips = [
  "No signup",
  "Nothing uploaded",
  "Everything stays on the device",
];

const featuredTools = getFeaturedTools();

export default function HomePage() {
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <JsonLd
        data={homePageJsonLd({
          siteOrigin: PUBLIC_SITE_ORIGIN,
          siteName: SITE_NAME,
          siteTagline: SITE_TAGLINE,
          featured: featuredTools,
        })}
      />
      <section className="max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-ink">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-ink" />
          On your device
        </p>
        <h1 className="mt-6 text-[28px] font-[650] leading-9 tracking-tight text-text sm:text-[40px] sm:leading-[48px]">
          Tools that stay{" "}
          <span className="sm:block">on your device.</span>
        </h1>
        <p className="mt-5 text-lg leading-7 text-muted">{SITE_TAGLINE}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {trustChips.map((chip, index) => (
            <li
              key={chip}
              className={`chip inline-flex ${index === 2 ? "max-sm:hidden" : ""}`}
            >
              {chip}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 sm:mt-16" aria-labelledby="featured-tools">
        <h2 id="featured-tools" className="section-label">
          Featured
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.href} tool={tool} featured size="featured" />
          ))}
        </div>
      </section>

      <aside className="mt-12" aria-label="Advertisement">
        <AdPlaceholder />
      </aside>

      {CATEGORY_ORDER.map((categoryId) => {
        const category = CATEGORIES[categoryId];
        const tools = getToolsByCategory(categoryId);
        return (
          <section
            key={categoryId}
            id={categoryId}
            className="mt-14 scroll-mt-40 sm:mt-16 md:scroll-mt-28"
            aria-labelledby={`${categoryId}-heading`}
          >
            <div className="flex items-end justify-between gap-4">
              <h2 id={`${categoryId}-heading`} className="section-label">
                {category.name}
              </h2>
              <Link
                href={category.href}
                className="text-sm font-medium text-mint hover:underline"
              >
                All {category.name.toLowerCase()}
              </Link>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tools.map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
