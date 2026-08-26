import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { indexToolsAndHubs, searchSite } from "./search.ts";
import { CATEGORIES, TOOLS } from "./tools.ts";

const catalog = indexToolsAndHubs(CATEGORIES, TOOLS);

describe("searchSite", () => {
  it("indexes the published tools and three hubs", () => {
    assert.equal(catalog.filter((item) => item.kind === "tool").length, TOOLS.length);
    assert.equal(catalog.filter((item) => item.kind === "hub").length, 3);
    assert.deepEqual(
      catalog.filter((item) => item.kind === "tool").map((item) => item.href).sort(),
      TOOLS.map((tool) => tool.href).sort(),
    );
    assert.ok(
      catalog.some((item) => item.href === "/finance/paycheck-calculator-hourly"),
    );
  });

  it("jumps to UTM Builder from generator aliases", () => {
    const hits = searchSite("utm generator", catalog);
    assert.equal(hits[0]?.href, "/seo/utm-builder");
  });

  it("finds hubs and tools from short queries", () => {
    assert.equal(searchSite("seo", catalog)[0]?.href, "/seo");
    assert.ok(
      searchSite("uuid", catalog).some((hit) => hit.href === "/dev/uuid-generator"),
    );
    assert.equal(
      searchSite("paycheck calculator hourly", catalog)[0]?.href,
      "/finance/paycheck-calculator-hourly",
    );
    assert.equal(searchSite("", catalog).length, 0);
  });
});
