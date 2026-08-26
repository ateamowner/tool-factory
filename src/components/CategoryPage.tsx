import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ToolCard } from "@/components/ToolCard";
import { breadcrumbJsonLd } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";
import { CATEGORIES, getToolsByCategory, type CategoryId } from "@/lib/tools";

export function CategoryPage({ categoryId }: { categoryId: CategoryId }) {
  const category = CATEGORIES[categoryId];
  const tools = getToolsByCategory(categoryId);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: category.name, href: category.href },
  ];

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={breadcrumbJsonLd(crumbs, getSiteUrl())} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight text-text sm:text-5xl">
        {category.name} tools
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
        {category.description}
      </p>
      <section className="mt-12" aria-labelledby="directory-heading">
        <h2
          id="directory-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted"
        >
          Directory
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.href} tool={tool} featured />
          ))}
        </div>
      </section>
    </main>
  );
}
