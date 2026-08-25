import type { Metadata } from "next";
import Link from "next/link";
import { ToolCard } from "@/components/ToolCard";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { CATEGORIES, getToolsByCategory } from "@/lib/tools";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — Free Browser Tools`,
  },
  description:
    "Free stock average calculator, UTM builder, and UUID generator. No signup. Every tool runs in your browser.",
};

export default function HomePage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-10">
      <section className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
          Free utility tools
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          Tools that stay on your device.
        </h1>
        <p className="mt-4 text-lg leading-7 text-muted">{SITE_TAGLINE}</p>
      </section>

      <div className="mt-12 space-y-12">
        {Object.values(CATEGORIES).map((category) => {
          const tools = getToolsByCategory(category.id);
          return (
            <section key={category.id} aria-labelledby={`${category.id}-heading`}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 id={`${category.id}-heading`} className="text-2xl font-semibold tracking-tight">
                    {category.name}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                    {category.description}
                  </p>
                </div>
                <Link className="shrink-0 text-sm font-medium text-accent hover:underline" href={category.href}>
                  View hub
                </Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {tools.map((tool) => (
                  <ToolCard key={tool.href} tool={tool} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
