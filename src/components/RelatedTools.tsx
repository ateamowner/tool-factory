import Link from "next/link";
import { getRelatedTools } from "@/lib/tools";

export function RelatedTools({ currentHref }: { currentHref: string }) {
  const related = getRelatedTools(currentHref);

  return (
    <section className="mt-12" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-2xl font-semibold tracking-tight">
        Other tools
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {related.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="block rounded-2xl border border-line bg-card p-4 hover:border-accent/40"
            >
              <p className="font-semibold">{tool.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{tool.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
