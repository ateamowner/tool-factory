import type { Metadata } from "next";
import { ToolCard } from "@/components/ToolCard";
import { SITE_NAME, SITE_TAGLINE, toPublicUrl } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

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

export default function HomePage() {
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-ink">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-ink" />
          On your device
        </p>
        <h1 className="mt-6 text-[2.35rem] font-[650] leading-[1.08] tracking-tight text-text sm:text-6xl">
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

      <section className="mt-16 sm:mt-20" aria-labelledby="open-a-tool">
        <h2
          id="open-a-tool"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted"
        >
          Open a tool
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((tool) => (
            <ToolCard
              key={tool.href}
              tool={tool}
              featured={tool.slug === "utm-builder"}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
