import type { CategoryId, Tool } from "./tools";

export type SearchHit = {
  href: string;
  title: string;
  subtitle: string;
  kind: "tool" | "hub";
};

export type IndexedHit = SearchHit & { haystack: string };

type CategoryRecord = Record<
  CategoryId,
  { id: CategoryId; name: string; href: string; description: string }
>;

export function indexToolsAndHubs(
  categories: CategoryRecord,
  tools: Tool[],
): IndexedHit[] {
  return [
    ...Object.values(categories).map((category) => ({
      href: category.href,
      title: category.name,
      subtitle: "Hub",
      kind: "hub" as const,
      haystack: [category.name, category.id, category.description]
        .join(" ")
        .toLowerCase(),
    })),
    ...tools.map((tool) => ({
      href: tool.href,
      title: tool.title,
      subtitle: categories[tool.category].name,
      kind: "tool" as const,
      haystack: [
        tool.title,
        tool.shortTitle,
        tool.keyword,
        ...tool.aliases,
        tool.description,
        tool.cta,
        categories[tool.category].name,
      ]
        .join(" ")
        .toLowerCase(),
    })),
  ];
}

function rank(item: IndexedHit, query: string): number {
  const title = item.title.toLowerCase();
  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (item.kind === "tool") return 2;
  return 3;
}

export function searchSite(query: string, catalog: IndexedHit[]): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return catalog
    .filter((item) => item.haystack.includes(q))
    .sort((a, b) => rank(a, q) - rank(b, q) || a.title.localeCompare(b.title))
    .map((item) => ({
      href: item.href,
      title: item.title,
      subtitle: item.subtitle,
      kind: item.kind,
    }));
}
