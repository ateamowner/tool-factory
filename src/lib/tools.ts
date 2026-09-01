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
  cta: "Calculate" | "Copy URL" | "Generate" | "Convert" | "Decode";
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
      "Small developer utilities that run locally in your browser — UUID generation and JWT decoding.",
  },
  convert: {
    id: "convert",
    name: "Convert",
    href: "/convert",
    description:
      "Client-side file converters. Spreadsheets and images stay in the browser — nothing is uploaded.",
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
    keyword: "emergency fund calculator",
    aliases: ["emergency savings calculator", "how much emergency fund"],
    slug: "emergency-fund-calculator",
    href: "/finance/emergency-fund-calculator",
    title: "Emergency Fund Calculator",
    shortTitle: "Emergency Fund Calculator",
    category: "finance",
    description:
      "Target emergency savings from monthly essential expenses, plus the gap and months to fully fund.",
    summary:
      "Enter monthly expenses, a 3–12 month target, current savings, and an optional contribution.",
    cta: "Calculate",
  },
  {
    keyword: "mortgage recast calculator",
    aliases: ["recast mortgage calculator"],
    slug: "mortgage-recast-calculator",
    href: "/finance/mortgage-recast-calculator",
    title: "Mortgage Recast Calculator",
    shortTitle: "Mortgage Recast Calculator",
    category: "finance",
    description:
      "New monthly payment, payment drop, and interest savings after a lump-sum recast — same remaining term, not a refinance.",
    summary:
      "Enter remaining balance, rate, remaining term, and a lump-sum principal payment to see the recast payment.",
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
    keyword: "jwt decoder",
    aliases: ["jwt token decoder"],
    slug: "jwt-decoder",
    href: "/dev/jwt-decoder",
    title: "JWT Decoder",
    shortTitle: "JWT Decoder",
    category: "dev",
    description:
      "Decode a JWT header and payload to readable JSON in the browser. No signature check, nothing uploaded.",
    summary:
      "Paste a JWT token to base64url-decode the header and claims. Decoding is not verification.",
    cta: "Decode",
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
  {
    keyword: "heic to pdf converter",
    aliases: ["heic to pdf", "heif to pdf", "heic pdf converter"],
    slug: "heic-to-pdf",
    href: "/convert/heic-to-pdf",
    title: "HEIC to PDF Converter",
    shortTitle: "HEIC to PDF Converter",
    category: "convert",
    description:
      "Convert HEIC and HEIF photos to PDF in the browser. Batch convert, then download — files never leave the device.",
    summary:
      "Select one or more .heic or .heif files and download a one-page PDF for each. Decoding stays in your browser.",
    cta: "Convert",
  },
  {
    keyword: "excel to pdf converter",
    aliases: ["excel to pdf", "xlsx to pdf", "xls to pdf"],
    slug: "excel-to-pdf",
    href: "/convert/excel-to-pdf",
    title: "Excel to PDF Converter",
    shortTitle: "Excel to PDF Converter",
    category: "convert",
    description:
      "Convert Excel .xlsx and .xls spreadsheets to PDF in the browser. Batch convert, then download — files never leave the device.",
    summary:
      "Select one or more .xlsx or .xls files and download a table PDF for each workbook. Parsing stays in your browser.",
    cta: "Convert",
  },
  {
    keyword: "png to jpg",
    aliases: ["png to jpg converter", "convert png to jpg"],
    slug: "png-to-jpg",
    href: "/convert/png-to-jpg",
    title: "PNG to JPG Converter",
    shortTitle: "PNG to JPG Converter",
    category: "convert",
    description:
      "Convert PNG images to JPG in the browser. Batch convert, then download — files never leave the device.",
    summary:
      "Select one or more .png files and download JPG copies. Encoding stays in your browser.",
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
