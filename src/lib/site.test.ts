import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PUBLIC_SITE_ORIGIN, resolveSiteUrl } from "./site.ts";

describe("resolveSiteUrl", () => {
  it("falls back to the public Vercel origin when env is empty", () => {
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

  it("accepts a Vercel host without a protocol", () => {
    assert.equal(
      resolveSiteUrl({ VERCEL_URL: "tool-factory-git-preview.vercel.app" }),
      "https://tool-factory-git-preview.vercel.app",
    );
  });
});
