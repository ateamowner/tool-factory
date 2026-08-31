import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { indexToolsAndHubs, searchSite } from "./search.ts";
import { CATEGORIES, TOOLS } from "./tools.ts";

const catalog = indexToolsAndHubs(CATEGORIES, TOOLS);

describe("searchSite", () => {
  it("indexes the published tools and four hubs", () => {
    assert.equal(catalog.filter((item) => item.kind === "tool").length, TOOLS.length);
    assert.equal(catalog.filter((item) => item.kind === "hub").length, 4);
    assert.deepEqual(
      catalog.filter((item) => item.kind === "tool").map((item) => item.href).sort(),
      TOOLS.map((tool) => tool.href).sort(),
    );
    assert.ok(
      catalog.some((item) => item.href === "/finance/paycheck-calculator-hourly"),
    );
    assert.ok(catalog.some((item) => item.href === "/seo/robots-txt-builder"));
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
    assert.equal(searchSite("jwt decoder", catalog)[0]?.href, "/dev/jwt-decoder");
    assert.equal(
      searchSite("jwt token decoder", catalog)[0]?.href,
      "/dev/jwt-decoder",
    );
    assert.equal(
      searchSite("paycheck calculator hourly", catalog)[0]?.href,
      "/finance/paycheck-calculator-hourly",
    );
    assert.equal(
      searchSite("robot.txt generator", catalog)[0]?.href,
      "/seo/robots-txt-builder",
    );
    assert.equal(searchSite("", catalog).length, 0);
    assert.equal(searchSite("convert", catalog)[0]?.href, "/convert");
    assert.equal(
      searchSite("heic to png converter", catalog)[0]?.href,
      "/convert/heic-to-png",
    );
    assert.equal(
      searchSite("heic to pdf converter", catalog)[0]?.href,
      "/convert/heic-to-pdf",
    );
    assert.equal(
      searchSite("excel to pdf converter", catalog)[0]?.href,
      "/convert/excel-to-pdf",
    );
    assert.equal(
      searchSite("emergency fund calculator", catalog)[0]?.href,
      "/finance/emergency-fund-calculator",
    );
    assert.equal(
      searchSite("mortgage recast calculator", catalog)[0]?.href,
      "/finance/mortgage-recast-calculator",
    );
    assert.equal(
      searchSite("recast mortgage calculator", catalog)[0]?.href,
      "/finance/mortgage-recast-calculator",
    );
  });
});
