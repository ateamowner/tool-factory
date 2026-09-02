export type SchemaIssue = {
  severity: "error" | "warning";
  message: string;
  path: string;
};

export type SchemaNode = {
  path: string;
  type: string;
  context: string | null;
};

export type SchemaValidateSuccess = {
  ok: true;
  pretty: string;
  issues: SchemaIssue[];
  nodes: SchemaNode[];
  source: "json" | "html";
  scriptCount: number;
  errorCount: number;
  warningCount: number;
};

export type SchemaValidateFailure = {
  ok: false;
  error: string;
};

export type SchemaValidateResult = SchemaValidateSuccess | SchemaValidateFailure;

const SCRIPT_JSON_LD =
  /<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

const LOOKALIKE_KEYS: Record<string, string> = {
  type: "@type",
  Type: "@type",
  "@Type": "@type",
  context: "@context",
  Context: "@context",
  "@Context": "@context",
};

const SCHEMA_ORG_CONTEXTS = new Set([
  "https://schema.org",
  "http://schema.org",
  "https://schema.org/",
  "http://schema.org/",
  "https://www.schema.org",
  "http://www.schema.org",
  "https://www.schema.org/",
  "http://www.schema.org/",
]);

const TYPE_TYPOS: Record<string, string> = {
  FAQ: "FAQPage",
  FaqPage: "FAQPage",
  Faq: "FAQPage",
  Breadcrumb: "BreadcrumbList",
  Breadcrumbs: "BreadcrumbList",
  BreadcrumbListItem: "ListItem",
};

const RECOMMENDED: Record<string, string[]> = {
  FAQPage: ["mainEntity"],
  Question: ["name", "acceptedAnswer"],
  Answer: ["text"],
  Organization: ["name"],
  Person: ["name"],
  Product: ["name"],
  BreadcrumbList: ["itemListElement"],
  ListItem: ["name"],
  Article: ["headline"],
  NewsArticle: ["headline"],
  BlogPosting: ["headline"],
  WebSite: ["name"],
  WebPage: ["name"],
  LocalBusiness: ["name"],
  Recipe: ["name"],
  Event: ["name", "startDate"],
  Review: ["reviewRating", "itemReviewed"],
  HowTo: ["name", "step"],
  VideoObject: ["name"],
  ImageObject: ["url"],
  Offer: ["price"],
  AggregateRating: ["ratingValue"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function joinPath(parent: string, key: string): string {
  if (parent === "$") return `$.${key}`;
  return `${parent}.${key}`;
}

function stripScriptWrappers(text: string): string {
  return text
    .trim()
    .replace(/^<!--/, "")
    .replace(/-->$/, "")
    .trim();
}

function extractScriptJsonLd(raw: string): string[] {
  const matches = [...raw.matchAll(SCRIPT_JSON_LD)].map((match) =>
    stripScriptWrappers(match[1] ?? ""),
  );
  return matches.filter(Boolean);
}

function looksLikeHtml(raw: string): boolean {
  return /<script[\s>]/i.test(raw) || /<\/?[a-z][\s\S]*>/i.test(raw.trim());
}

export function extractJsonLdTexts(raw: string): { texts: string[]; source: "json" | "html" } {
  const trimmed = raw.trim();
  const scripts = extractScriptJsonLd(trimmed);
  if (scripts.length > 0) {
    return { texts: scripts, source: "html" };
  }
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return { texts: [trimmed], source: "json" };
  }
  if (looksLikeHtml(trimmed)) {
    const startObj = trimmed.indexOf("{");
    const startArr = trimmed.indexOf("[");
    const start =
      startObj === -1 ? startArr : startArr === -1 ? startObj : Math.min(startObj, startArr);
    if (start >= 0) {
      return { texts: [trimmed.slice(start)], source: "html" };
    }
  }
  return { texts: [trimmed], source: "json" };
}

function parseHint(raw: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "Invalid JSON";
  if (/,\s*[}\]]/.test(raw)) {
    return `${message} A trailing comma is a common JSON-LD mistake — remove commas after the last property or array item.`;
  }
  if (/^\s*'/.test(raw) || /:\s*'/.test(raw)) {
    return `${message} JSON-LD must use double quotes, not single quotes.`;
  }
  if (/^\s*[A-Za-z]/.test(raw) && !raw.trim().startsWith("{") && !raw.trim().startsWith("[")) {
    return `${message} Paste a JSON object, a JSON array, or a <script type="application/ld+json"> block.`;
  }
  return message;
}

function contextValues(value: unknown): string[] {
  if (typeof value === "string") return [value.trim()];
  if (Array.isArray(value)) {
    return value.flatMap((item) => (typeof item === "string" ? [item.trim()] : []));
  }
  if (isRecord(value)) {
    return Object.keys(value);
  }
  return [];
}

function typeValues(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : []));
  }
  return [];
}

function pushIssue(
  issues: SchemaIssue[],
  severity: SchemaIssue["severity"],
  path: string,
  message: string,
) {
  issues.push({ severity, path, message });
}

function validateNode(
  node: Record<string, unknown>,
  path: string,
  inheritedContext: string | null,
  issues: SchemaIssue[],
  nodes: SchemaNode[],
) {
  for (const [key, expected] of Object.entries(LOOKALIKE_KEYS)) {
    if (key in node && !(expected in node)) {
      pushIssue(
        issues,
        "error",
        joinPath(path, key),
        `Found "${key}" but JSON-LD uses "${expected}". Rename the key.`,
      );
    }
  }

  const localContexts = contextValues(node["@context"]);
  const context = localContexts[0] ?? inheritedContext;
  const types = typeValues(node["@type"]);

  if (!node["@context"] && !inheritedContext && path === "$") {
    pushIssue(
      issues,
      "error",
      path,
      "Missing @context. Most schema markup uses \"https://schema.org\".",
    );
  }

  if (localContexts.length > 0) {
    const hasSchemaOrg = localContexts.some((value) => SCHEMA_ORG_CONTEXTS.has(value));
    const hasBareSchema = localContexts.some((value) => /^schema\.org\/?$/i.test(value));
    if (hasBareSchema && !hasSchemaOrg) {
      pushIssue(
        issues,
        "warning",
        joinPath(path, "@context"),
        "Use a full URL for @context, such as https://schema.org.",
      );
    } else if (!hasSchemaOrg && !isRecord(node["@context"])) {
      pushIssue(
        issues,
        "warning",
        joinPath(path, "@context"),
        `Unrecognized @context "${localContexts.join(", ")}". Schema.org rich results expect https://schema.org.`,
      );
    }
  }

  if (!("@type" in node) && !("@graph" in node)) {
    pushIssue(
      issues,
      "error",
      path,
      "Missing @type. Search engines need a schema.org type such as FAQPage, Organization, or Product.",
    );
  } else if ("@type" in node && types.length === 0) {
    pushIssue(issues, "error", joinPath(path, "@type"), "@type must be a non-empty string or array of strings.");
  }

  for (const type of types) {
    const suggestion = TYPE_TYPOS[type];
    if (suggestion) {
      pushIssue(
        issues,
        "warning",
        joinPath(path, "@type"),
        `"${type}" is probably a typo for "${suggestion}".`,
      );
    }
    const recommended = RECOMMENDED[type];
    if (recommended) {
      for (const field of recommended) {
        if (!(field in node) || node[field] === "" || node[field] === null) {
          pushIssue(
            issues,
            "warning",
            joinPath(path, field),
            `${type} is stronger with a "${field}" property.`,
          );
        }
      }
    }
  }

  nodes.push({
    path,
    type: types.length > 0 ? types.join(", ") : "@graph",
    context: context ?? null,
  });
}

function walk(
  value: unknown,
  path: string,
  inheritedContext: string | null,
  issues: SchemaIssue[],
  nodes: SchemaNode[],
) {
  if (Array.isArray(value)) {
    if (path === "$" && value.length === 0) {
      pushIssue(issues, "error", path, "JSON-LD array is empty.");
    }
    value.forEach((item, index) => {
      walk(item, `${path}[${index}]`, inheritedContext, issues, nodes);
    });
    return;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    if (path === "$") {
      pushIssue(issues, "error", path, "JSON-LD must be an object or an array of objects.");
    }
    return;
  }

  if (!isRecord(value)) return;

  const localContexts = contextValues(value["@context"]);
  const nextContext = localContexts[0] ?? inheritedContext;
  const isSchemaNode =
    path === "$" ||
    "@type" in value ||
    "@context" in value ||
    "@graph" in value ||
    "@id" in value;

  if (isSchemaNode) {
    validateNode(value, path, inheritedContext, issues, nodes);
  }

  if ("@graph" in value) {
    walk(value["@graph"], joinPath(path, "@graph"), nextContext, issues, nodes);
  }

  for (const [key, child] of Object.entries(value)) {
    if (key === "@graph" || key === "@context" || key === "@type" || key === "@id") continue;
    if (isRecord(child) || Array.isArray(child)) {
      walk(child, joinPath(path, key), nextContext, issues, nodes);
    }
  }
}

export function prettyPrintJsonLd(raw: string): string {
  const result = validateSchemaMarkup(raw);
  if (result.ok) return result.pretty;
  return raw;
}

export function validateSchemaMarkup(raw: string): SchemaValidateResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste JSON-LD or a <script type=\"application/ld+json\"> block to validate." };
  }

  const extracted = extractJsonLdTexts(trimmed);
  const parsed: unknown[] = [];

  for (const [index, text] of extracted.texts.entries()) {
    try {
      parsed.push(JSON.parse(text));
    } catch (error) {
      const where =
        extracted.source === "html" && extracted.texts.length > 1
          ? ` in script ${index + 1}`
          : "";
      return {
        ok: false,
        error: `Could not parse JSON-LD${where}. ${parseHint(text, error)}`,
      };
    }
  }

  const root = parsed.length === 1 ? parsed[0] : parsed;
  const issues: SchemaIssue[] = [];
  const nodes: SchemaNode[] = [];
  walk(root, "$", null, issues, nodes);

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  return {
    ok: true,
    pretty: JSON.stringify(root, null, 2),
    issues,
    nodes,
    source: extracted.source,
    scriptCount: extracted.source === "html" ? extracted.texts.length : 0,
    errorCount,
    warningCount,
  };
}
