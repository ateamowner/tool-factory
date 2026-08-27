export type CategoryId = "finance" | "seo" | "dev" | "convert";

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
  cta: "Calculate" | "Copy URL" | "Generate" | "Convert";
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
      "Campaign and crawl tools for marketers. Build tracking URLs and robots.txt files without sending destinations to a server.",
  },
  dev: {
    id: "dev",
    name: "Developer",
    href: "/dev",
    description:
      "Small developer utilities that run locally in your browser with Web Crypto.",
  },
  convert: {
    id: "convert",
    name: "Convert",
    href: "/convert",
    description:
      "Client-side file converters. Images stay in the browser — nothing is uploaded.",
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
    cta: "Calculate",
  },
  {
    keyword: "paycheck calculator hourly",
    aliases: ["hourly paycheck calculator", "hourly pay calculator"],
    slug: "paycheck-calculator-hourly",
    href: "/finance/paycheck-calculator-hourly",
    title: "Paycheck Calculator Hourly",
    shortTitle: "Paycheck Calculator Hourly",
    category: "finance",
    description:
      "Gross pay per paycheck from an hourly rate or salary — weekly, biweekly, semimonthly, or monthly.",
    summary:
      "Enter hourly rate or salary, hours per week, and pay frequency to see gross weekly, monthly, and annual pay.",
    cta: "Calculate",
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
    cta: "Copy URL",
  },
  {
    keyword: "robots.txt builder",
    aliases: ["robot.txt generator", "robots.txt generator", "robots txt builder"],
    slug: "robots-txt-builder",
    href: "/seo/robots-txt-builder",
    title: "Robots.txt Builder",
    shortTitle: "Robots.txt Builder",
    category: "seo",
    description:
      "Robots.txt builder and robot.txt generator for allow/disallow rules, user-agent groups, sitemap URLs, and AI crawler extras.",
    summary:
      "Write user-agent groups, allow or disallow paths, add a sitemap, then copy or download robots.txt.",
    cta: "Generate",
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
    cta: "Generate",
  },
  {
    keyword: "heic to png converter",
    aliases: ["heic to png", "heif to png", "heic converter"],
    slug: "heic-to-png",
    href: "/convert/heic-to-png",
    title: "HEIC to PNG Converter",
    shortTitle: "HEIC to PNG Converter",
    category: "convert",
    description:
      "Convert HEIC and HEIF photos to PNG in the browser. Batch convert, then download — files never leave the device.",
    summary:
      "Select one or more .heic or .heif files and download PNG copies. Decoding stays in your browser.",
    cta: "Convert",
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
