import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { homePageJsonLd } from "./faq-schema.ts";
import {
  PUBLIC_SITE_ORIGIN,
  SITE_NAME,
  SITE_TAGLINE,
  publicPageMetadata,
  resolveSiteUrl,
  toPublicUrl,
} from "./site.ts";
import { CATEGORIES, TOOLS, getFeaturedTools } from "./tools.ts";

describe("resolveSiteUrl", () => {
  it("falls back to the ateamkit.com canonical origin when env is empty", () => {
    assert.equal(PUBLIC_SITE_ORIGIN, "https://ateamkit.com");
    assert.equal(resolveSiteUrl({}), PUBLIC_SITE_ORIGIN);
  });

  it("accepts NEXT_PUBLIC_SITE_URL only when it is https://ateamkit.com", () => {
    assert.equal(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://ateamkit.com/" }),
      PUBLIC_SITE_ORIGIN,
    );
  });

  it("ignores non-canonical hosts, http, and the Vercel fallback", () => {
    assert.equal(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.com/" }),
      PUBLIC_SITE_ORIGIN,
    );
    assert.equal(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://tool-factory-alpha.vercel.app" }),
      PUBLIC_SITE_ORIGIN,
    );
    assert.equal(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://tool-factory-git-main.vercel.app" }),
      PUBLIC_SITE_ORIGIN,
    );
    assert.equal(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://ateamkit.com" }),
      PUBLIC_SITE_ORIGIN,
    );
    assert.equal(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.ateamkit.com" }),
      PUBLIC_SITE_ORIGIN,
    );
    assert.equal(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "not a url" }),
      PUBLIC_SITE_ORIGIN,
    );
  });
});

describe("toPublicUrl", () => {
  it("uses a trailing slash for the live homepage", () => {
    assert.equal(toPublicUrl("/"), "https://ateamkit.com/");
    assert.equal(toPublicUrl(""), "https://ateamkit.com/");
    assert.equal(toPublicUrl(" / "), "https://ateamkit.com/");
  });

  it("omits a trailing slash on hubs and tools to match live URLs", () => {
    assert.equal(toPublicUrl("/finance"), "https://ateamkit.com/finance");
    assert.equal(
      toPublicUrl("/finance/stock-average-calculator/"),
      "https://ateamkit.com/finance/stock-average-calculator",
    );
  });

  it("stays on https://ateamkit.com even if pathname looks host-like", () => {
    assert.equal(toPublicUrl("seo/utm-builder"), "https://ateamkit.com/seo/utm-builder");
  });

  it("emits absolute canonical and og:url on ateamkit.com", () => {
    assert.deepEqual(publicPageMetadata("/"), {
      alternates: { canonical: "https://ateamkit.com/" },
      openGraph: { url: "https://ateamkit.com/" },
    });
    assert.deepEqual(publicPageMetadata("/finance/stock-average-calculator"), {
      alternates: { canonical: "https://ateamkit.com/finance/stock-average-calculator" },
      openGraph: { url: "https://ateamkit.com/finance/stock-average-calculator" },
    });
    const serialized = JSON.stringify(publicPageMetadata("/seo/utm-builder"));
    assert.equal(serialized.includes("vercel.app"), false);
    assert.equal(serialized.includes("http://"), false);
  });

  it("covers the live sitemap set without the Vercel host", () => {
    const urls = [
      toPublicUrl("/"),
      ...Object.values(CATEGORIES).map((category) => toPublicUrl(category.href)),
      ...TOOLS.map((tool) => toPublicUrl(tool.href)),
    ];
    assert.equal(urls[0], "https://ateamkit.com/");
    assert.ok(urls.every((url) => url.startsWith("https://ateamkit.com")));
    assert.ok(urls.every((url) => !url.includes("vercel.app")));
    assert.equal(urls.length, 1 + Object.keys(CATEGORIES).length + TOOLS.length);
  });
});

describe("homePageJsonLd", () => {
  const featured = getFeaturedTools();
  const data = homePageJsonLd({
    siteOrigin: PUBLIC_SITE_ORIGIN,
    siteName: SITE_NAME,
    siteTagline: SITE_TAGLINE,
    featured,
  });
  const graph = data["@graph"] as Array<{
    "@type"?: string;
    name?: string;
    url?: string;
    numberOfItems?: number;
    publisher?: { "@id"?: string };
    potentialAction?: {
      "@type"?: string;
      target?: string;
    };
    itemListElement?: { name?: string; url?: string }[];
  }>;

  it("emits Organization and WebSite for Tool Factory on ateamkit.com", () => {
    const organization = graph.find((node) => node["@type"] === "Organization");
    const website = graph.find((node) => node["@type"] === "WebSite");

    assert.equal(organization?.name, "Tool Factory");
    assert.equal(organization?.url, "https://ateamkit.com/");
    assert.equal(website?.name, "Tool Factory");
    assert.equal(website?.url, "https://ateamkit.com/");
    assert.equal(website?.publisher?.["@id"], "https://ateamkit.com/#organization");
  });

  it("lists the three featured tools and stays off the Vercel host", () => {
    const itemList = graph.find((node) => node["@type"] === "ItemList");
    assert.equal(itemList?.numberOfItems, 3);
    assert.deepEqual(
      itemList?.itemListElement?.map((item) => item.name),
      ["Stock Average Calculator", "UTM Builder", "HEIC to PNG Converter"],
    );
    assert.deepEqual(
      itemList?.itemListElement?.map((item) => item.url),
      [
        "https://ateamkit.com/finance/stock-average-calculator",
        "https://ateamkit.com/seo/utm-builder",
        "https://ateamkit.com/convert/heic-to-png",
      ],
    );
    const serialized = JSON.stringify(data);
    assert.ok(serialized.includes("https://ateamkit.com"));
    assert.equal(serialized.includes("vercel.app"), false);
  });

  it("points SearchAction at the live ?q= header search URL", () => {
    const website = graph.find((node) => node["@type"] === "WebSite");
    const action = website?.potentialAction;
    assert.equal(action?.["@type"], "SearchAction");
    assert.equal(action?.target, "https://ateamkit.com/?q={search_term_string}");
  });
});
