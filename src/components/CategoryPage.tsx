import { ToolCard } from "@/components/ToolCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CATEGORIES, getToolsByCategory, type CategoryId } from "@/lib/tools";

export function CategoryPage({ categoryId }: { categoryId: CategoryId }) {
  const category = CATEGORIES[categoryId];
  const tools = getToolsByCategory(categoryId);

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: category.name, href: category.href },
        ]}
      />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        {category.name} tools
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-7">{category.description}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} />
        ))}
      </div>
    </main>
  );
}
