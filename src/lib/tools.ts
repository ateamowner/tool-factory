export type CategoryId = "finance" | "seo" | "dev" | "convert" | "home";

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
  cta: "Calculate" | "Copy URL" | "Generate" | "Convert" | "Decode" | "Validate";
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
      "Client-side calculators and checkers for investing and personal finance, including a student loan refinance calculator, a break even sales calculator, a monthly budget template, and a VAT number validator. Your numbers stay in the browser.",
  },
  seo: {
    id: "seo",
    name: "SEO",
    href: "/seo",
    description:
      "Campaign, crawl, and structured-data tools for marketers. Build tracking URLs, robots.txt files, check JSON-LD schema markup, and look up domain age without sending pasted WHOIS to a server.",
  },
  dev: {
    id: "dev",
    name: "Developer",
    href: "/dev",
    description:
      "Small developer utilities that run locally in your browser — UUID generation, JWT decoding, and cron expressions.",
  },
  convert: {
    id: "convert",
    name: "Convert",
    href: "/convert",
    description:
      "Client-side file converters. Spreadsheets and images stay in the browser — nothing is uploaded.",
  },
  home: {
    id: "home",
    name: "Household",
    href: "/home",
    description:
      "Household calculators that run in the browser. Soft-wash mix, area, siding, and roof-streak tools are educational — not a service booking or a chemical spec.",
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
    keyword: "refinance calculator auto loan",
    aliases: ["auto refinance calculator", "car loan refinance calculator"],
    slug: "auto-loan-refinance-calculator",
    href: "/finance/auto-loan-refinance-calculator",
    title: "Refinance Calculator Auto Loan",
    shortTitle: "Refinance Calculator Auto Loan",
    category: "finance",
    description:
      "Current vs new monthly payment, interest, fee break-even, and total cost for an auto loan refinance — all in the browser.",
    summary:
      "Enter current balance, rate, remaining term, new rate, and new term. Optional fees and extra payment.",
    cta: "Calculate",
  },
  {
    keyword: "real estate commission calculator",
    aliases: ["realtor commission calculator", "home sale commission calculator"],
    slug: "real-estate-commission-calculator",
    href: "/finance/real-estate-commission-calculator",
    title: "Real Estate Commission Calculator",
    shortTitle: "Real Estate Commission Calculator",
    category: "finance",
    description:
      "Total commission, listing-side and buyer-side dollars, and seller net proceeds from a home sale — all in the browser.",
    summary:
      "Enter sale price and commission rate. Optional listing/buyer split and extra fees or concessions.",
    cta: "Calculate",
  },
  {
    keyword: "credit utilization calculator",
    aliases: [
      "credit utilization ratio calculator",
      "credit card utilization calculator",
    ],
    slug: "credit-utilization-calculator",
    href: "/finance/credit-utilization-calculator",
    title: "Credit Utilization Calculator",
    shortTitle: "Credit Utilization Calculator",
    category: "finance",
    description:
      "Overall credit utilization %, available credit, per-card ratios, and dollars to pay to reach a target — all in the browser.",
    summary:
      "Enter total or per-card limits and balances, plus an optional target utilization, to see the ratio and paydown amount.",
    cta: "Calculate",
  },
  {
    keyword: "403b calculator",
    aliases: ["403b contribution calculator", "403 b calculator"],
    slug: "403b-calculator",
    href: "/finance/403b-calculator",
    title: "403b Calculator",
    shortTitle: "403b Calculator",
    category: "finance",
    description:
      "Employee contributions, optional employer match, and projected 403(b) balance at retirement — all in the browser.",
    summary:
      "Enter age, salary, contribution percent or dollars, optional match, and return to see a retirement projection.",
    cta: "Calculate",
  },
  {
    keyword: "monthly budget template",
    aliases: ["monthly budget planner", "budget template monthly", "monthly budget"],
    slug: "monthly-budget-template",
    href: "/finance/monthly-budget-template",
    title: "Monthly Budget Template",
    shortTitle: "Monthly Budget Template",
    category: "finance",
    description:
      "Monthly income and expense lines with totals, leftover surplus or deficit, and savings rate — all in the browser.",
    summary:
      "Add income and category expenses to see totals, remaining cash, and an optional savings rate.",
    cta: "Calculate",
  },
  {
    keyword: "vat number validator",
    aliases: ["vat number checker", "eu vat validator", "vat checker"],
    slug: "vat-number-validator",
    href: "/finance/vat-number-validator",
    title: "VAT Number Validator",
    shortTitle: "VAT Number Validator",
    category: "finance",
    description:
      "VAT number validator and VAT number checker for EU (and legacy GB) IDs — format, country, and check digits in the browser. Not a VIES lookup.",
    summary:
      "Paste a VAT ID with or without a country prefix to check format and public check digits. Nothing is uploaded.",
    cta: "Validate",
  },
  {
    keyword: "break even sales calculator",
    aliases: ["break even calculator", "break-even point calculator"],
    slug: "break-even-sales-calculator",
    href: "/finance/break-even-sales-calculator",
    title: "Break Even Sales Calculator",
    shortTitle: "Break Even Sales Calculator",
    category: "finance",
    description:
      "Break-even units, sales revenue, and contribution margin from fixed costs, variable cost, and price — optional target profit. All in the browser.",
    summary:
      "Enter fixed costs, variable cost per unit, and price. Optional target profit shows units and sales to hit that profit.",
    cta: "Calculate",
  },
  {
    keyword: "student loan refinance calculator",
    aliases: ["student loan refinancing calculator", "refinance student loan calculator"],
    slug: "student-loan-refinance-calculator",
    href: "/finance/student-loan-refinance-calculator",
    title: "Student Loan Refinance Calculator",
    shortTitle: "Student Loan Refinance Calculator",
    category: "finance",
    description:
      "Current vs new monthly payment, total interest, estimated savings vs the current loan, and fee break-even for a student loan refinance — all in the browser.",
    summary:
      "Enter current balance, rate, remaining term, new rate, and new term. Optional fees show break-even months.",
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
    keyword: "schema markup validator",
    aliases: ["schema checker", "json-ld validator", "jsonld validator"],
    slug: "schema-markup-validator",
    href: "/seo/schema-markup-validator",
    title: "Schema Markup Validator",
    shortTitle: "Schema Markup Validator",
    category: "seo",
    description:
      "Schema markup validator and schema checker for JSON-LD — detect @context and @type, flag common errors, and pretty-print in the browser.",
    summary:
      "Paste JSON-LD or a script tag, validate structure, then copy a pretty-printed document.",
    cta: "Validate",
  },
  {
    keyword: "domain age checker",
    aliases: [
      "check domain age",
      "website age checker",
      "domain age lookup",
      "whois age checker",
    ],
    slug: "domain-age-checker",
    href: "/seo/domain-age-checker",
    title: "Domain Age Checker",
    shortTitle: "Domain Age Checker",
    category: "seo",
    description:
      "Domain age checker for registration date, age in years/months/days, registrar, and expiration — public RDAP in the browser, or paste WHOIS. Nothing uploaded.",
    summary:
      "Enter a domain to query public RDAP, or paste WHOIS/RDAP text to parse creation and expiry dates locally.",
    cta: "Validate",
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
    keyword: "cron expression generator",
    aliases: ["cron generator", "cron maker", "crontab generator"],
    slug: "cron-expression-generator",
    href: "/dev/cron-expression-generator",
    title: "Cron Expression Generator",
    shortTitle: "Cron Expression Generator",
    category: "dev",
    description:
      "Build a standard 5-field cron expression with presets, a human-readable summary, and upcoming run times — all in the browser.",
    summary:
      "Pick minute, hour, day, month, and weekday fields or a preset, then copy the expression.",
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
  {
    keyword: "soft wash mix calculator",
    aliases: [
      "softwash mix calculator",
      "house wash mix calculator",
      "bleach wash calculator",
    ],
    slug: "soft-wash-mix-calculator",
    href: "/home/soft-wash-mix-calculator",
    title: "Soft Wash Mix Calculator",
    shortTitle: "Soft Wash Mix Calculator",
    category: "home",
    description:
      "Educational gallons of mix, bleach, water, and surfactant from surface, square feet, and soil — then request a local quote.",
    summary:
      "Pick siding, roof, concrete, or fence, enter square feet or L×W, and see a typical pro-range SH mix. Optional quote form after results.",
    cta: "Calculate",
  },
  {
    keyword: "house sq ft estimator",
    aliases: [
      "house square footage estimator",
      "wall square footage calculator",
      "roof square footage estimator",
    ],
    slug: "house-sq-ft-estimator",
    href: "/home/house-sq-ft-estimator",
    title: "House Sq-Ft Estimator",
    shortTitle: "House Sq-Ft Estimator",
    category: "home",
    description:
      "Educational wall or roof square feet from L×W or footprint, 1–2 stories, and an optional roof pitch bump — then request a local quote.",
    summary:
      "Toggle walls vs roof, enter length × width or footprint, and see an envelope estimate. Optional quote form after results.",
    cta: "Calculate",
  },
  {
    keyword: "vinyl siding cleanability",
    aliases: [
      "vinyl siding cleaner checker",
      "siding cleanability checker",
      "vinyl siding wash checker",
    ],
    slug: "vinyl-siding-cleanability",
    href: "/home/vinyl-siding-cleanability",
    title: "Vinyl Siding Cleanability Checker",
    shortTitle: "Vinyl Siding Cleanability",
    category: "home",
    description:
      "Educational good / caution / skip soft-wash fit from siding type, soil, age, and shade — then request a local quote.",
    summary:
      "Choose vinyl, fiber cement, wood, or other, plus soil and shade, for a short educational fit score. Optional quote form after results.",
    cta: "Calculate",
  },
  {
    keyword: "roof algae severity",
    aliases: ["roof algae quiz", "roof streak quiz", "roof algae checker"],
    slug: "roof-algae-severity",
    href: "/home/roof-algae-severity",
    title: "Roof Algae Severity Quiz",
    shortTitle: "Roof Algae Severity Quiz",
    category: "home",
    description:
      "Educational 1–4 streak score from coverage, roof age, trees, and north face, plus a typical soft-wash candidate note — not a diagnosis.",
    summary:
      "Describe streak coverage and shade factors for a 1–4 appearance score. Optional quote form after results.",
    cta: "Calculate",
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

export const FEATURED_TOOL_SLUGS = [
  "stock-average-calculator",
  "utm-builder",
  "heic-to-png",
] as const;

export const CATEGORY_ORDER: CategoryId[] = ["finance", "seo", "dev", "convert", "home"];

export function getFeaturedTools(): Tool[] {
  return FEATURED_TOOL_SLUGS.map((slug) => {
    const tool = TOOLS.find((item) => item.slug === slug);
    if (!tool) {
      throw new Error(`Featured tool is missing from the registry: ${slug}`);
    }
    return tool;
  });
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
