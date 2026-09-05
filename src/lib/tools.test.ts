import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TOOLS, getFeaturedTools, keywordAlreadyPublished } from "./tools.ts";

describe("featured homepage tools", () => {
  it("locks the three Site Design featured slugs to live paths", () => {
    const featured = getFeaturedTools();
    assert.deepEqual(
      featured.map((tool) => tool.href),
      [
        "/finance/stock-average-calculator",
        "/seo/utm-builder",
        "/convert/heic-to-png",
      ],
    );
    assert.deepEqual(
      featured.map((tool) => tool.cta),
      ["Calculate", "Copy URL", "Convert"],
    );
  });
});

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
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "paycheck calculator hourly")?.href,
      "/finance/paycheck-calculator-hourly",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "robots.txt builder")?.href,
      "/seo/robots-txt-builder",
    );
    assert.ok(keywordAlreadyPublished("stock average calculator"));
    assert.ok(keywordAlreadyPublished("paycheck calculator hourly"));
    assert.ok(keywordAlreadyPublished("robots.txt builder"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "robots.txt builder")?.aliases.includes(
        "robot.txt generator",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/stock-average-calculator")?.cta,
      "Calculate",
    );
    assert.equal(TOOLS.find((tool) => tool.href === "/seo/utm-builder")?.cta, "Copy URL");
    assert.equal(TOOLS.find((tool) => tool.href === "/dev/uuid-generator")?.cta, "Generate");
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "jwt decoder")?.href,
      "/dev/jwt-decoder",
    );
    assert.ok(keywordAlreadyPublished("jwt decoder"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "jwt decoder")?.aliases.includes(
        "jwt token decoder",
      ),
    );
    assert.equal(TOOLS.find((tool) => tool.href === "/dev/jwt-decoder")?.cta, "Decode");
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "cron expression generator")?.href,
      "/dev/cron-expression-generator",
    );
    assert.ok(keywordAlreadyPublished("cron expression generator"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "cron expression generator")?.aliases.includes(
        "cron maker",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/dev/cron-expression-generator")?.cta,
      "Generate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/paycheck-calculator-hourly")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/seo/robots-txt-builder")?.cta,
      "Generate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "heic to png converter")?.href,
      "/convert/heic-to-png",
    );
    assert.ok(keywordAlreadyPublished("heic to png converter"));
    assert.equal(TOOLS.find((tool) => tool.href === "/convert/heic-to-png")?.cta, "Convert");
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "heic to pdf converter")?.href,
      "/convert/heic-to-pdf",
    );
    assert.ok(keywordAlreadyPublished("heic to pdf converter"));
    assert.equal(TOOLS.find((tool) => tool.href === "/convert/heic-to-pdf")?.cta, "Convert");
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "excel to pdf converter")?.href,
      "/convert/excel-to-pdf",
    );
    assert.ok(keywordAlreadyPublished("excel to pdf converter"));
    assert.equal(TOOLS.find((tool) => tool.href === "/convert/excel-to-pdf")?.cta, "Convert");
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "png to jpg")?.href,
      "/convert/png-to-jpg",
    );
    assert.ok(keywordAlreadyPublished("png to jpg"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "png to jpg")?.aliases.includes(
        "png to jpg converter",
      ),
    );
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "png to jpg")?.aliases.includes(
        "convert png to jpg",
      ),
    );
    assert.equal(TOOLS.find((tool) => tool.href === "/convert/png-to-jpg")?.cta, "Convert");
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "emergency fund calculator")?.href,
      "/finance/emergency-fund-calculator",
    );
    assert.ok(keywordAlreadyPublished("emergency fund calculator"));
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/emergency-fund-calculator")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "mortgage recast calculator")?.href,
      "/finance/mortgage-recast-calculator",
    );
    assert.ok(keywordAlreadyPublished("mortgage recast calculator"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "mortgage recast calculator")?.aliases.includes(
        "recast mortgage calculator",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/mortgage-recast-calculator")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "refinance calculator auto loan")?.href,
      "/finance/auto-loan-refinance-calculator",
    );
    assert.ok(keywordAlreadyPublished("refinance calculator auto loan"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "refinance calculator auto loan")?.aliases.includes(
        "auto refinance calculator",
      ),
    );
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "refinance calculator auto loan")?.aliases.includes(
        "car loan refinance calculator",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/auto-loan-refinance-calculator")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "schema markup validator")?.href,
      "/seo/schema-markup-validator",
    );
    assert.ok(keywordAlreadyPublished("schema markup validator"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "schema markup validator")?.aliases.includes(
        "schema checker",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/seo/schema-markup-validator")?.cta,
      "Validate",
    );
    assert.equal(keywordAlreadyPublished("schema checker"), false);
  });

  it("does not ship schema.org validator or percentage calculator pages", () => {
    const banned = [
      "validator.schema.org",
      "percentage calculator",
    ];
    for (const keyword of banned) {
      assert.equal(keywordAlreadyPublished(keyword), false);
      assert.equal(
        TOOLS.some((tool) => tool.keyword === keyword || tool.href.includes(keyword.replaceAll(" ", "-"))),
        false,
      );
    }
  });
});
