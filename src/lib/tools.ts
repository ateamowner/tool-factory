export type CategoryId = "finance" | "seo" | "dev";

export type Tool = {
  keyword: string;
  aliases: string[];
  slug: string;
  href: string;
  title: string;
  shortTitle: string;
  category: CategoryId;
  description: string;
  summary: string;
};

export const CATEGORIES: Record<
  CategoryId,
  { id: CategoryId; name: string; href: string; description: string }
> = {
  finance: {
    id: "finance",
    name: "Finance",
    href: "/finance",
    description:
      "Client-side calculators for investing and personal finance. Your numbers stay in the browser.",
  },
  seo: {
    id: "seo",
    name: "SEO",
    href: "/seo",
    description:
      "Campaign and link tools for marketers. Build tracking URLs without sending destinations to a server.",
  },
  dev: {
    id: "dev",
    name: "Developer",
    href: "/dev",
    description:
      "Small developer utilities that run locally in your browser with Web Crypto.",
  },
};

export const TOOLS: Tool[] = [
  {
    keyword: "stock average calculator",
    aliases: [],
    slug: "stock-average-calculator",
    href: "/finance/stock-average-calculator",
    title: "Stock Average Calculator",
    shortTitle: "Stock Average Calculator",
    category: "finance",
    description:
      "Weighted average cost, total shares, break-even price, and unrealized P/L from multiple lots.",
    summary:
      "Add share lots, optional fees, and a current price to see average cost and profit or loss.",
  },
  {
    keyword: "utm builder",
    aliases: ["utm generator", "utm maker", "utm link builder"],
    slug: "utm-builder",
    href: "/seo/utm-builder",
    title: "UTM Builder",
    shortTitle: "UTM Builder",
    category: "seo",
    description:
      "UTM generator, maker, and link builder for campaign URLs — including bulk CSV — all in the browser.",
    summary:
      "Add utm_source, medium, campaign, and optional fields, or generate a batch from CSV.",
  },
  {
    keyword: "uuid generator",
    aliases: ["online guid generator"],
    slug: "uuid-generator",
    href: "/dev/uuid-generator",
    title: "UUID Generator",
    shortTitle: "UUID Generator",
    category: "dev",
    description:
      "Generate UUID v4 and UUID v7 (also used as an online GUID generator) with bulk copy.",
    summary: "Create one or many RFC 9562 UUIDs with Web Crypto. Copy one or copy all.",
  },
];

const publishedKeywords = new Set<string>();

for (const tool of TOOLS) {
  const key = tool.keyword.toLowerCase().trim();
  if (publishedKeywords.has(key)) {
    throw new Error(
      `Stop rule: do not publish a tool whose exact keyword already exists as its own page (${tool.keyword}).`,
    );
  }
  publishedKeywords.add(key);
}

export function getToolByHref(href: string): Tool | undefined {
  return TOOLS.find((tool) => tool.href === href);
}

export function getToolsByCategory(category: CategoryId): Tool[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function getRelatedTools(href: string): Tool[] {
  return TOOLS.filter((tool) => tool.href !== href);
}

export function keywordAlreadyPublished(keyword: string): boolean {
  return publishedKeywords.has(keyword.toLowerCase().trim());
}
