import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PUBLIC_SITE_ORIGIN, resolveSiteUrl, toPublicUrl } from "./site.ts";
import { CATEGORIES, TOOLS } from "./tools.ts";

describe("resolveSiteUrl", () => {
  it("falls back to the ateamkit.com canonical origin when env is empty", () => {
    assert.equal(PUBLIC_SITE_ORIGIN, "https://ateamkit.com");
    assert.equal(resolveSiteUrl({}), PUBLIC_SITE_ORIGIN);
  });

  it("uses NEXT_PUBLIC_SITE_URL when it is a valid origin", () => {
    assert.equal(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.com/" }),
      "https://example.com",
    );
  });

  it("ignores invalid NEXT_PUBLIC_SITE_URL instead of throwing", () => {
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
