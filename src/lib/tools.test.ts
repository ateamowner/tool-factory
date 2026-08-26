import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TOOLS, keywordAlreadyPublished } from "./tools.ts";

describe("tool registry stop rule", () => {
  it("publishes unique primary keywords as their own pages", () => {
    const keywords = TOOLS.map((tool) => tool.keyword.toLowerCase());
    assert.equal(new Set(keywords).size, keywords.length);
    assert.equal(new Set(TOOLS.map((tool) => tool.href)).size, TOOLS.length);
  });

  it("covers the three launch keywords at the required paths", () => {
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "stock average calculator")?.href,
      "/finance/stock-average-calculator",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "utm builder")?.href,
      "/seo/utm-builder",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "uuid generator")?.href,
      "/dev/uuid-generator",
    );
    assert.ok(keywordAlreadyPublished("stock average calculator"));
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/stock-average-calculator")?.cta,
      "Calculate",
    );
    assert.equal(TOOLS.find((tool) => tool.href === "/seo/utm-builder")?.cta, "Copy URL");
    assert.equal(TOOLS.find((tool) => tool.href === "/dev/uuid-generator")?.cta, "Generate");
  });

  it("does not ship jwt decoder, excel-to-pdf, or schema.org validator pages", () => {
    const banned = ["jwt decoder", "excel-to-pdf", "excel to pdf", "validator.schema.org"];
    for (const keyword of banned) {
      assert.equal(keywordAlreadyPublished(keyword), false);
      assert.equal(
        TOOLS.some((tool) => tool.keyword === keyword || tool.href.includes(keyword.replaceAll(" ", "-"))),
        false,
      );
    }
  });
});
