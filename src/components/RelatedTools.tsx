import Link from "next/link";
import { CATEGORIES, getRelatedTools } from "@/lib/tools";

export function RelatedTools({ currentHref }: { currentHref: string }) {
  const related = getRelatedTools(currentHref);

  return (
    <section className="mt-16" aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted"
      >
        Other tools
      </h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {related.map((tool) => {
          const category = CATEGORIES[tool.category];
          return (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="block h-full rounded-2xl border border-line bg-card p-6 hover:border-mint/30"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mint">
                  {category.name}
                </p>
                <p className="mt-3 text-xl font-semibold tracking-tight text-text">
                  {tool.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">{tool.description}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
