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
      TOOLS.find((tool) => tool.keyword === "real estate commission calculator")?.href,
      "/finance/real-estate-commission-calculator",
    );
    assert.ok(keywordAlreadyPublished("real estate commission calculator"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "real estate commission calculator")?.aliases.includes(
        "realtor commission calculator",
      ),
    );
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "real estate commission calculator")?.aliases.includes(
        "home sale commission calculator",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/real-estate-commission-calculator")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "credit utilization calculator")?.href,
      "/finance/credit-utilization-calculator",
    );
    assert.ok(keywordAlreadyPublished("credit utilization calculator"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "credit utilization calculator")?.aliases.includes(
        "credit utilization ratio calculator",
      ),
    );
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "credit utilization calculator")?.aliases.includes(
        "credit card utilization calculator",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/credit-utilization-calculator")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "403b calculator")?.href,
      "/finance/403b-calculator",
    );
    assert.ok(keywordAlreadyPublished("403b calculator"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "403b calculator")?.aliases.includes(
        "403b contribution calculator",
      ),
    );
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "403b calculator")?.aliases.includes(
        "403 b calculator",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/403b-calculator")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "monthly budget template")?.href,
      "/finance/monthly-budget-template",
    );
    assert.ok(keywordAlreadyPublished("monthly budget template"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "monthly budget template")?.aliases.includes(
        "monthly budget planner",
      ),
    );
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "monthly budget template")?.aliases.includes(
        "budget template monthly",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/monthly-budget-template")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "vat number validator")?.href,
      "/finance/vat-number-validator",
    );
    assert.ok(keywordAlreadyPublished("vat number validator"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "vat number validator")?.aliases.includes(
        "vat number checker",
      ),
    );
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "vat number validator")?.aliases.includes(
        "eu vat validator",
      ),
    );
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "vat number validator")?.aliases.includes(
        "vat checker",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/finance/vat-number-validator")?.cta,
      "Validate",
    );
    assert.equal(keywordAlreadyPublished("vat number checker"), false);
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
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "soft wash mix calculator")?.href,
      "/home/soft-wash-mix-calculator",
    );
    assert.ok(keywordAlreadyPublished("soft wash mix calculator"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "soft wash mix calculator")?.aliases.includes(
        "softwash mix calculator",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/home/soft-wash-mix-calculator")?.cta,
      "Calculate",
    );
    assert.equal(TOOLS.find((tool) => tool.href === "/home/soft-wash-mix-calculator")?.category, "home");
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "house sq ft estimator")?.href,
      "/home/house-sq-ft-estimator",
    );
    assert.ok(keywordAlreadyPublished("house sq ft estimator"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "house sq ft estimator")?.aliases.includes(
        "house square footage estimator",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/home/house-sq-ft-estimator")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "vinyl siding cleanability")?.href,
      "/home/vinyl-siding-cleanability",
    );
    assert.ok(keywordAlreadyPublished("vinyl siding cleanability"));
    assert.equal(
      TOOLS.find((tool) => tool.href === "/home/vinyl-siding-cleanability")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.find((tool) => tool.keyword === "roof algae severity")?.href,
      "/home/roof-algae-severity",
    );
    assert.ok(keywordAlreadyPublished("roof algae severity"));
    assert.ok(
      TOOLS.find((tool) => tool.keyword === "roof algae severity")?.aliases.includes(
        "roof algae quiz",
      ),
    );
    assert.equal(
      TOOLS.find((tool) => tool.href === "/home/roof-algae-severity")?.cta,
      "Calculate",
    );
    assert.equal(
      TOOLS.filter((tool) => tool.category === "home").map((tool) => tool.slug).sort().join(","),
      "house-sq-ft-estimator,roof-algae-severity,soft-wash-mix-calculator,vinyl-siding-cleanability",
    );
  });

  it("does not ship schema.org validator or percentage calculator pages", () => {
    const banned = [
      "validator.schema.org",
      "percentage calculator",
      "job cost ballpark",
      "soft wash job cost",
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
